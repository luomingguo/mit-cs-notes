---
title: PostgreSQL 查询系列 — 3. 顺序扫描
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 查询系列 — 3. 顺序扫描

> 原文：https://habr.com/en/companies/postgrespro/articles/576980/ （作者 Egor Rogov，PostgresPro）

## 引言

从这一篇开始，系列文章正式进入"物理执行方式"的具体讨论，第一个登场的是最基础的数据访问方式——顺序扫描（Sequential Scan / Seq Scan）。看似简单的"从头到尾把表读一遍"，背后其实牵涉到存储引擎的可插拔架构、代价公式怎么由统计信息推导出来，以及从 9.6 起引入的并行顺序扫描。

## 可插拔的表访问方法

PostgreSQL 12 引入了表访问方法（table access method）的可插拔接口，理论上允许开发不同的存储引擎，只要它们实现同一套标准接口，就都能和统一的查询优化器、事务管理器、缓冲区管理器以及索引体系对接。目前默认且唯一正式可用的引擎是传统的堆表（heap）。文章提到当时社区里还在研发的两个实验性引擎：

- **zheap**：目标是缓解堆表在频繁 UPDATE 场景下产生的表膨胀问题，做法是尽量原地更新行，把旧版本数据挪到独立的 undo 存储里，而不是像现在这样在表文件里不断堆积死元组；
- **zedstore**：面向 OLAP 场景的列式存储引擎，按列而非按行组织数据，便于分析型查询只读取所需的列。

这两者当时都还未合入主线，但反映了 PostgreSQL 存储层未来可能的演进方向。理解这一点有助于明白：本篇讨论的"顺序扫描"，其实是绑定在 heap 这套具体存储引擎上的一种访问方式，一旦其他引擎成熟，扫描的物理细节会不同，但计划节点层面的接口是统一的。

## 顺序扫描的执行机制

顺序扫描的做法很直白：从表文件的第一页开始，逐页往后读，对每一页里的每个行版本（tuple）检查它对当前事务是否可见（MVCC 可见性判断），可见的行再交给上层做进一步的条件过滤或直接返回。

文章指出，在**选择率很低**（也就是条件几乎筛不掉什么行，或者干脆没有可用条件/索引）的情况下，顺序扫描反而是效率最高的访问方式——因为它是纯粹的顺序 I/O，操作系统的预读（read-ahead）机制能很好地发挥作用；相比之下索引扫描虽然能"跳过"大部分不满足条件的行，但每次回表可能都是一次随机 I/O，当需要回表的行数占比很高时，随机 I/O 的总代价反而会超过老老实实顺序扫一遍。

此外，多个并发进程如果同时在扫描同一张（大）表，PostgreSQL 会让它们共享一个"缓冲区环"（buffer ring），避免同一份数据被反复读入、又反复挤占共享缓冲池，从而减少不必要的物理 I/O。

## 代价模型：两块拼图

顺序扫描的代价由两部分线性叠加而成：

**I/O 代价**：页数 × `seq_page_cost`（默认 1.0）。这里假设的是纯顺序磁盘访问，能充分利用操作系统的预读优化，所以每页的"单价"被设定为基准值 1.0；与之相对的是 `random_page_cost`（默认 4.0），代表随机访问一页的代价是顺序访问的 4 倍——这个对比正是后续文章判断"该用顺序扫描还是索引扫描"的关键参照系。

**CPU 代价**：行数 × `cpu_tuple_cost`（默认 0.01），代表处理每一个行版本（可见性判断、构造内存中的行结构等）所需的 CPU 开销。

### 例子：无条件全表扫描

```sql
EXPLAIN SELECT * FROM flights;
```
```text
Seq Scan on flights  (cost=0.00..4772.67 rows=214867 width=63)
```

这里 `4772.67` 就是页数 × `seq_page_cost` 加上行数 × `cpu_tuple_cost` 的和，`rows=214867` 直接取自 `pg_class.reltuples` 的统计估算，`width=63` 是该表所有列的平均行宽估计。

### 例子：带过滤条件的扫描

```sql
EXPLAIN SELECT * FROM flights WHERE status = 'Scheduled';
```
```text
Seq Scan on flights
  Filter: ((status)::text = 'Scheduled'::text)
  Rows Removed by Filter: 199484
```

要注意的是，`Filter` 这里的条件并不能减少需要**读取**的页数或行数——顺序扫描依然要把每一行都读出来、构造成内存中的行对象，然后才能对它执行过滤判断，只是最终不满足条件的行不会被返回给上层节点。这也是为什么 CPU 代价里既要为"处理的总行数"计费（`cpu_tuple_cost`），过滤条件本身的判断开销还要另外用 `cpu_operator_cost` 计费（见下一节）。`EXPLAIN ANALYZE` 里的 "Rows Removed by Filter" 正是被过滤条件挡在外面的行数，能直观反映选择率高低。

## 聚合操作的代价叠加

如果顺序扫描外面再包一层聚合（比如 `COUNT(*)` 或 `SUM(...)`），聚合节点会为每一条输入行额外计入一份 `cpu_operator_cost`（默认 0.0025，代表一次运算符/函数调用的开销），再为每一条**输出**行（聚合结果通常只有一行或几行）计入一份 `cpu_tuple_cost`。文章借这个例子说明了计划树的代价是如何"从下往上"逐层累加的：子节点（Seq Scan）的 total cost 直接构成父节点（Aggregate）计算自身代价时的起点，父节点在此基础上叠加自己这一层的处理开销。

## 并行顺序扫描

从 PostgreSQL 9.6 开始，优化器可以选择把一次顺序扫描拆给多个并行 worker 进程分担，每个 worker 执行的是同一份计划片段，各自负责表的一部分页面，读取顺序仍然保持"顺序"特征（不是随机跳着分配）。

### 相关参数

- `max_parallel_workers`：整个数据库实例层面同时能用的并行 worker 总数（默认 8）；
- `max_parallel_workers_per_gather`：单条查询里一个 Gather 节点最多能申请的 worker 数（默认 2）；
- `min_parallel_table_scan_size`：表小于这个阈值就不考虑并行扫描（默认 8MB）；
- `parallel_setup_cost`：启动并行 worker 本身的固定开销（默认 1000）；
- `parallel_tuple_cost`：worker 之间传递每一行结果的进程间通信开销（默认 0.1）。

**worker 数量的估算公式**大致是：`1 + ⌊log₃(表大小 / min_parallel_table_scan_size)⌋`——也就是说表越大，理论上可以申请越多 worker，但是按 3 为底的对数增长，不会随表大小线性暴涨。

### 并行计划里常见的节点

- **Parallel Seq Scan**：每个 worker 各自负责扫描表的一部分；
- **Partial Aggregate**：每个 worker 先在自己负责的那部分数据上做局部聚合；
- **Gather**：由主进程（leader）把各个 worker 的部分结果收拢到一起；
- **Finalize Aggregate**：在 Gather 之后，把各 worker 的局部聚合结果再合并成最终结果。

## 哪些情况不能（完全）并行

以下场景**完全**排除并行执行：

- 会修改数据的语句（`UPDATE`、`DELETE`，以及 `INSERT ... SELECT` 里的写入部分）；
- 显式声明的游标（cursor）和 PL/pgSQL 里的循环结构，因为它们要求严格保序、可重入的执行状态；
- 查询里调用了标记为 `PARALLEL UNSAFE` 的函数；
- 已经处于并行上下文内部时，再嵌套调用别的并行相关函数。

以下场景是**部分**受限，即计划里可以出现并行节点，但某些子部分必须退化为单进程执行：

- 物化的 CTE（`CTE Scan` 对应的部分本身必须串行执行）；
- `SubPlan`、`InitPlan` 对应的相关子查询；
- 临时表的访问（只能由 leader 进程完成，worker 不能直接访问会话级临时表）；
- 标记为 `PARALLEL RESTRICTED` 的函数，只能在 leader 进程里调用。

参数 `force_parallel_mode` 可以用来强制测试"这条查询理论上是否具备被并行化的资格"，而不管代价估算是否认为并行更划算——主要用于开发调试，而非生产环境调优手段。

## 本讲小结

顺序扫描是最朴素、也是理解整套代价体系的起点：代价 = 页数 × `seq_page_cost` + 行数 × `cpu_tuple_cost`（叠加过滤条件的 `cpu_operator_cost`、聚合的额外开销等），所有的原始数字都来自 `pg_class.relpages`/`reltuples` 以及上一篇讲到的列级统计，不存在"黑魔法"。在低选择率、缺乏合适索引，或者需要处理绝大部分行的场景下，顺序扫描往往是最优或接近最优的选择；PostgreSQL 9.6 起的并行顺序扫描进一步把这种"简单但吞吐大"的访问方式扩展到多核并行的场景，用 `Gather`/`Partial Aggregate`/`Finalize Aggregate` 等节点把多个 worker 的局部结果拼接为最终结果，但要留意一系列关于游标、临时表、函数并行安全标记等方面的限制。下一篇文章将转向索引扫描，讨论 `correlation` 等统计量如何决定索引扫描相对于顺序扫描是否划算。
