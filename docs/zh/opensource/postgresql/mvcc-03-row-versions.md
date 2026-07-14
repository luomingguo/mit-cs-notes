# PostgreSQL 中的 MVCC — 3. 行版本

> 原文：https://habr.com/en/companies/postgrespro/articles/477648/ （作者 Egor Rogov，PostgresPro）

上一篇讲了页面的物理结构，这一篇深入到页面里"行版本"这一层，看看 INSERT、UPDATE、DELETE、事务提交/回滚具体是怎么在物理层面发生的，以及虚拟事务号、子事务这些配套机制。

## 行版本头部

MVCC 的基本思路是：同一行数据在物理上可以同时存在多个版本，数据库不用真实的时间戳标记它们的新旧，而是用**事务 ID**（一个不断递增的整数计数器）来标记"谁创建了这个版本、谁把它作废了"。

每个行版本都有一个头部，其中关键字段包括：

- **xmin**：创建这个版本的事务 ID。
- **xmax**：让这个版本作废（被删除或被更新替换）的事务 ID；如果这个版本还是最新的，xmax 通常是 0。
- **infomask**：一组标志位，记录这个行版本的各种状态。
- **ctid**：指向"下一个更新版本"的引用，格式是 (页号, 页内指针序号)；如果这已经是最新版本，ctid 指向自己。
- **NULL 值位图**：标记哪些列是 NULL（因为 NULL 不是一个真实的数据值，需要单独标记）。

头部最小 23 字节，加上 NULL 位图通常还会更大——对于字段很少、很窄的表，这个头部开销甚至可能超过实际数据本身的大小。

头部里还有一组重要的状态标志位，专门用来缓存 xmin/xmax 所代表事务的提交状态，避免每次都要去查事务状态表：
- `xmin_committed` / `xmin_aborted`：标记 xmin 对应的事务是否已提交/已回滚。
- `xmax_committed` / `xmax_aborted`：标记 xmax 对应的事务是否已提交/已回滚。

## INSERT：新建一个行版本

用一个简单的例子说明：

```sql
CREATE TABLE t(
  id serial,
  s text
);
CREATE INDEX ON t(s);
BEGIN;
INSERT INTO t(s) VALUES ('FOO');
SELECT txid_current();
-- txid_current: 3664
```

原文构造了一个便于观察页面内部状态的自定义函数（基于 `pageinspect` 扩展）：

```sql
CREATE FUNCTION heap_page(relname text, pageno integer)
RETURNS TABLE(ctid tid, state text, xmin text, xmax text, t_ctid tid)
AS $$
SELECT (pageno,lp)::text::tid AS ctid,
       CASE lp_flags
         WHEN 0 THEN 'unused'
         WHEN 1 THEN 'normal'
         WHEN 2 THEN 'redirect to '||lp_off
         WHEN 3 THEN 'dead'
       END AS state,
       t_xmin || CASE
         WHEN (t_infomask & 256) > 0 THEN ' (c)'
         WHEN (t_infomask & 512) > 0 THEN ' (a)'
         ELSE ''
       END AS xmin,
       t_xmax || CASE
         WHEN (t_infomask & 1024) > 0 THEN ' (c)'
         WHEN (t_infomask & 2048) > 0 THEN ' (a)'
         ELSE ''
       END AS xmax,
       t_ctid
FROM heap_page_items(get_raw_page(relname,pageno))
ORDER BY lp;
$$ LANGUAGE SQL;
```

插入一行后：页内出现编号为 1 的指针，指向新插入的行版本；`xmin` 被填入当前事务 ID；`xmin_committed`、`xmin_aborted` 两个标志位都还没设置（因为此刻事务还没结束，状态未知）；`ctid` 指向自己（因为它已经是最新版本）；`xmax` 惯例上填 0 并把 `xmax_aborted` 置位（表示这一版本目前"没有被谁删除"）。

```sql
SELECT * FROM heap_page('t',0);
-- (0,1) | normal | 3664 | 0 (a) | (0,1)
```

顺带一提，`xmin`、`xmax` 这些内部字段其实可以作为伪列直接在 SQL 里查询：

```sql
SELECT xmin, xmax, * FROM t;
```

## COMMIT：提交时到底发生了什么

事务的提交/回滚状态并不是写在行版本头部里的，而是记录在一个专门的基础设施中：**XACT**（在 PostgreSQL 10 之前叫 CLOG），位于 `PGDATA/pg_xact` 目录下的一组文件。每个事务用两个 bit 表示状态："已提交"和"已回滚"，这些文件本身也是按页面组织和管理的，跟其他数据文件的管理方式类似。

提交操作其实非常简单：只是把该事务在 XACT 里对应的"已提交"位设置好，仅此而已——预写日志（WAL）相关的细节在别的地方讨论。

但这就带来一个问题：**行版本头部里的 xmin_committed 位是什么时候被设置的？** 答案是：**不是在提交那一刻**，而是延迟到之后某个事务去访问这一行、需要判断可见性的时候，才顺带完成的：
1. 先通过共享内存里的 ProcArray 结构（记录了当前所有活跃进程/事务）判断 xmin 对应的事务是否已经结束。
2. 如果已经结束，再去查 XACT，看它到底是提交了还是回滚了。
3. 判断出结果后，就把 `xmin_committed` 或 `xmin_aborted` 标志位写回这个行版本的头部，作为缓存，避免下次访问再重复这个查询过程。

为什么不能在 INSERT 或 COMMIT 那一刻直接把标志位设好？原文给出的解释是：在 INSERT 执行的当下，事务本身也无法确定自己最终会不会成功提交；而到了真正提交的那一刻，PostgreSQL 也没有办法知道这个事务到底修改过哪些页面——可能涉及大量页面，其中有些可能早已被换出到磁盘，若为了设置标志位而重新把它们全部读回内存，会带来不小的额外开销。于是设计上选择了"惰性"更新：谁访问、谁顺手更新。

这也解释了一个有趣的现象："即便是一条只做 SELECT 的语句，也可能悄悄把数据页面标记为脏页（需要写回磁盘）"——因为它可能顺带写入了 hint bit。

```sql
COMMIT;
SELECT * FROM heap_page('t',0);
```
提交后立刻查询，标志位可能还没变化；但只要真正发起过一次对该行的可见性检查（比如执行了一次 SELECT），标志位就会被顺带补上。

## DELETE：只是打上删除标记

DELETE 并不真的把数据从页面里抹掉，而是把当前事务的 ID 写进这个行版本的 `xmax` 字段，并清除 `xmax_aborted` 标志（因为现在还不知道这次删除本身会不会成功提交）。

```sql
BEGIN;
DELETE FROM t;
SELECT txid_current();
-- 3665
```

```sql
SELECT * FROM heap_page('t',0);
```
可以看到 `xmax` 字段被填上了事务 ID，相关标志位处于"未知"状态。

这里有一个附带的重要机制：**一个活跃事务写在 xmax 里，天然就充当了行级锁**。其他想要更新或删除这一行的事务，必须等待 xmax 里记录的这个事务结束（提交或回滚）才能继续。这种锁不需要额外的内存结构去维护——不管数据库里同时存在多少行锁，都不会对系统性能造成额外负担，因为"锁"信息就写在数据本身里。

## ROLLBACK：和提交一样快，但数据不会被物理撤销

回滚的处理方式和提交几乎一样简单：只是在 XACT 里把该事务标记为"已回滚"而不是"已提交"。这也是为什么 ROLLBACK 这个名字容易让人误解——它并不会真的把之前写入的数据从页面里物理性地撤销掉，那些被修改过的行版本仍然原样保留在磁盘上。

```sql
ROLLBACK;
SELECT * FROM heap_page('t',0);
```

等到之后有事务再次访问这些页面时，才会去查 XACT 发现该事务已回滚，进而把 `xmax_aborted` 这个 hint bit 补写上去——此时原来写在 `xmax` 里的那个事务 ID 会被直接忽略掉（因为它对应的操作从未真正生效）。

## UPDATE：逻辑上等价于 DELETE + INSERT

UPDATE 在内部被实现为：先把旧版本标记删除，再插入一个新版本。具体来说：
1. 旧版本的 `xmax` 被设为当前（更新）事务的 ID。
2. 新建一个行版本，它的 `xmin` 就等于旧版本的 `xmax`，也就是同一个更新事务的 ID。
3. 旧版本的 `ctid` 被改写为指向新版本，串起一条"版本链"。

```sql
BEGIN;
UPDATE t SET s = 'BAR';
SELECT txid_current();
-- 3666
```

```sql
SELECT * FROM t;
```
查询结果只会返回新版本的数据（'BAR'），但物理页面里两个版本其实都还在：

```sql
SELECT * FROM heap_page('t',0);
-- (0,1) | normal | 3664 (c) | 3666 | (0,2)
-- (0,2) | normal | 3666     | 0 (a) | (0,2)
```

第一行是旧版本：`xmax` 被打上了当前更新事务的 ID（取代了之前可能存在的回滚标志），`xmax_aborted` 被清空（因为这次更新事务的最终状态还未知），`ctid` 指向新版本 (0,2)。同时旧版本的 xmax 仍然充当行锁，阻止其他事务并发修改同一行。第二行是新版本，跟普通 INSERT 出来的行没有本质区别。

## 索引：只认最新版本，不存版本信息

索引页面的结构和表页面类似——同样是指针数组加上具体的行数据，末尾附带一段特殊空间。但索引和表有一个关键差异：**索引条目里不包含任何版本信息**，没有 xmin/xmax 这些字段。

这意味着索引里的一条记录，理论上应该只对应表里"当前活跃"的那一个版本，但实际上因为一行数据可能被多次更新，产生一整条版本链，而索引条目里的引用可能指向的是这条链上比较早的某个版本。所以 PostgreSQL 光靠索引本身，是没法判断某个具体版本对当前事务是否可见的——必须回到表页面里，结合 xmin/xmax 和事务状态才能做出最终判断。

以 B-树索引为例，叶子页面上的每条记录本质上就是"索引键值 + 指向表中某行的 ctid"：

```sql
SELECT itemoffset, ctid FROM bt_page_items('t_s_idx',1);
```

更新之后，可以看到索引里可能同时存在指向新旧两个版本的条目：`(0,2)` 和 `(0,1)`——具体的处理策略、以及如何避免每次更新都要维护所有索引，是下一篇讲"HOT 更新"的核心内容。

## 虚拟事务：给只读事务省一个真实 ID

事务 ID 是一种稀缺资源（后面讲"冻结"那篇会解释为什么），如果每次哪怕只是执行一条 SELECT 也要分配一个真正的、全局唯一递增的事务 ID，会造成不必要的消耗。为此 PostgreSQL 引入了**虚拟事务 ID（virtual XID, xvid）**这个优化：

虚拟 ID 由"进程标识符 + 一个序号"组成，分配起来非常快，完全不需要跨进程做同步协调。只读事务一开始只会拿到虚拟 ID；虚拟 ID 不会出现在任何数据快照里，也可以被系统随时安全地复用（因为它从未被写入任何数据页面里）——如果真的把虚拟 ID 写进页面，那这个页面在稍后虚拟 ID 被复用后就会变得毫无意义。

只有当一个事务真正开始修改数据的时候，它才会被"提拔"为拥有真实事务 ID：

```sql
BEGIN;
SELECT txid_current_if_assigned();
-- 返回 NULL（此时仍是虚拟事务）
```

```sql
UPDATE accounts SET amount = amount - 1.00;
SELECT txid_current_if_assigned();
-- 返回真实的事务 ID，比如 3667
```

## 子事务：SAVEPOINT 是怎么实现的

SQL 标准里的 SAVEPOINT 允许在一个大事务内部做局部的回滚，而不必放弃整个事务。但这和"一个事务只有一个提交/回滚状态"的基础模型是冲突的——毕竟数据在物理上从来不会被真的撤销。

PostgreSQL 的解法是**子事务（subtransaction）**：一旦用到 SAVEPOINT，这段代码就会被拆分成独立的子事务，每个子事务有自己的、比主事务 ID 更大的事务 ID，并在 XACT 里独立维护自己的提交/回滚状态。不过子事务最终能否生效仍然依赖主事务——如果主事务整体回滚，所有子事务无论自身状态如何都一并作废。

子事务之间的嵌套关系记录在 `PGDATA/pg_subtrans` 目录的文件里，访问方式跟 XACT 的共享内存缓冲区机制类似。需要强调的是，子事务并不是真正意义上"自治"的事务——PostgreSQL 并不直接支持自治事务，子事务始终依附于父事务，不能独立于父事务而存在。

下面用一个例子完整演示子事务的行为：

```sql
TRUNCATE TABLE t;
BEGIN;
INSERT INTO t(s) VALUES ('FOO');
SELECT txid_current();
-- 3669
```

```sql
SELECT xmin, xmax, * FROM t;
-- 该行 xmin = 3669
```

```sql
SAVEPOINT sp;
INSERT INTO t(s) VALUES ('XYZ');
SELECT txid_current();
-- 仍然是 3669（这是主事务号，不是子事务号）
```

但去查页面会发现，第二次插入的行实际上用了一个新的、更大的子事务 ID（比如 3670）：

```sql
SELECT * FROM heap_page('t',0);
-- 两行，xmin 分别是 3669 和 3670
```

如果回滚到保存点：

```sql
ROLLBACK TO sp;
INSERT INTO t VALUES ('BAR');
SELECT xmin, xmax, * FROM t;
-- 可见的行 xmin 是 3669 和 3671（一个新的子事务号），3670 那行已经不可见
```

但物理页面上，3670 那次插入产生的行版本并没有被删除，只是被标记为"已回滚"：

```sql
SELECT * FROM heap_page('t',0);
-- 三行：3669、3670(a)、3671
```

最终提交后：

```sql
COMMIT;
SELECT * FROM heap_page('t',0);
-- 3669 (c) —— 已提交
-- 3670 (a) —— 已回滚（独立状态）
-- 3671 (c) —— 已提交
```

值得注意的是，SQL 标准本身不允许在一个事务尚未结束时显式再开一个新事务（BEGIN），所以子事务机制通常是"隐式"被使用的——比如执行 SAVEPOINT 语句，或者在 PL/pgSQL 里用 EXCEPTION 块捕获异常时，数据库内部会自动创建子事务。如果在活跃事务里再执行一次 BEGIN，PostgreSQL 只会给出一个警告，而不是真正嵌套一个新事务。

## 出错与语句的原子性

当一条语句在事务内部出错时，整个事务会被标记为"已中止"，此后这个事务里的任何后续命令都不再被真正执行，只会收到"当前事务已中止"（current transaction is aborted）这样的错误提示，直到显式执行 ROLLBACK（或者对 COMMIT 的调用被自动转换为 ROLLBACK）。

```sql
BEGIN;
SELECT * FROM t;
UPDATE t SET s = repeat('X', 1/(id-4));
-- ERROR: division by zero
```

一个值得思考的问题是：如果一条 UPDATE 语句要修改多行，但在处理到中间某一行时才触发错误（比如上面例子里 `id=4` 那一行导致除零），那么在它之前已经成功更新过的那些行，物理上已经产生了新版本——这些"半成品"的修改绝不能被其他事务看到，否则会破坏语句级的原子性：

```sql
SELECT * FROM heap_page('t',0);
-- 能看到部分行已经被更新过，产生了新版本，比如 (0,1) 的 xmax 已经指向新事务，(0,4) 是新版本
```

这正是子事务机制在 psql 里的一个实际应用：`ON_ERROR_ROLLBACK` 模式利用它来实现"让出错的单条命令看起来像是原子失败"的效果：

```sql
\set ON_ERROR_ROLLBACK on
BEGIN;
SELECT * FROM t;
UPDATE t SET s = repeat('X', 1/(id-4));
-- ERROR: division by zero
```

出错之后：

```sql
SELECT * FROM t;
-- 返回更新前的数据，仿佛这条 UPDATE 从未发生过
```

```sql
COMMIT;
-- 正常完成
```

它的实现原理是：psql 在执行每一条命令之前，都隐式地创建一个保存点，一旦命令失败就自动回滚到这个保存点，从而让这条命令的失败在效果上表现得像是原子的。这不是默认行为，因为频繁创建保存点本身有明显的性能开销，即便最终没有真的触发回滚。

## 小结

本篇把行版本从"抽象概念"落实到了具体的字节级别：xmin/xmax/infomask/ctid 构成了每个行版本自描述的身份信息；INSERT/DELETE/UPDATE/COMMIT/ROLLBACK 在物理层面都只是对这些字段做局部、增量式的修改，从不整体重写或物理擦除数据；xmax 兼职充当了行级锁；提交与回滚状态被独立记录在 XACT（以及子事务对应的 pg_subtrans）里，并通过 hint bit 惰性地缓存到行版本头部；虚拟事务 ID 帮只读操作节省了宝贵的真实事务号；子事务机制支撑了 SAVEPOINT 和异常处理，同时也解释了为什么单条语句能在出错时呈现出原子性的假象。这些机制共同构成了下一篇要讲的"快照与可见性判断"的物理基础。
