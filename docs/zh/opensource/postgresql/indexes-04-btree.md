---
title: PostgreSQL 索引 — 4（B-tree 索引）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 索引 — 4（B-tree 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/443284/ （作者 Egor Rogov，PostgresPro）

## 写在前面

B-tree 是 PostgreSQL 里最常用、功能最全面的索引类型——不指定索引类型时 `CREATE INDEX` 默认建的就是它。这一篇详细拆解它的物理结构、三种基本检索方式（等值/不等值/范围）、多列索引的排序规则、NULL 处理、唯一约束的实现方式，以及如何为自定义数据类型接入 B-tree。

## 基本结构

B-tree 索引由若干个页面（通常 8KB 一页）组成，按层级组织成一棵树：

- **元页面（metapage）**：记录指向根页面的引用；
- **内部页面（internal page）**：存放指向子页面的引用，以及每个子树对应的最小键值（作为导航用的分隔键）；
- **叶子页面（leaf page）**：存放真正的索引数据——键值和对应的 TID（表行标识符）。

B-tree 有几个决定性的结构特征：

1. **平衡（balanced）**：从根到任意一个叶子页面所经过的内部页面层数是相同的，这保证了任意一次查找的代价是可预期、稳定的；
2. **多路分支（multi-branched）**：每个页面（一般 8KB）能容纳成百上千个 TID/键的条目,分支因子很高,树的高度因而很低；
3. **有序（ordered）**：索引里的数据按非递减顺序排列——不仅页面内部有序，页面之间也保持整体有序；同一层级的页面之间还用**双向链表**相互连接，这为顺序扫描（不管是正向还是反向）提供了物理基础。

## 三种基本查找方式

### 等值查找

从根页面开始，根据键值范围逐层向下导航,直至到达叶子页面。原文特别指出一个容易被忽略的细节：**当在内部页面上恰好碰到与目标键值相等的分隔键时，必须往左多走一步（下降到左边相邻的子树）**，否则可能会漏掉存储在前面叶子页面中的重复键值——因为分隔键代表的是"大于等于此值"的最小边界，重复值可能横跨多个叶子页面。

### 不等值查找

先用等值查找定位一个满足等值条件的值（如果存在的话），然后沿着叶子页面的双向链表往指定方向（往左或往右）一路遍历到底，直到不再满足条件为止。

### 范围查找

结合以上两种：先用等值查找定位到范围下界，然后沿叶子页面链表向右遍历，边走边检查是否仍然满足上界条件，一旦不满足就停止。

## 建索引示例

```sql
create index on aircrafts(range);
create index on aircrafts(range desc);
```

等值查询计划：

```sql
explain(costs off) select * from aircrafts where range = 3000;
-- Index Scan using aircrafts_range_idx
```

范围查询计划：

```sql
explain(costs off) select * from aircrafts
where range between 3000 and 5000;
-- Index Cond: ((range >= 3000) AND (range <= 5000))
```

IN 列表也能被识别成一种特殊形式的多点查找（会被转换为数组形式的匹配条件）：

```sql
explain(costs off)
select * from aircrafts where aircraft_code in ('733','763','773');
-- Index Cond: (aircraft_code = ANY ('{733,763,773}'::bpchar[]))
```

## 多列索引与列的顺序

多列 B-tree 索引里，数据首先按第一个字段整体排序，在第一字段值相同的前提下，再按第二个字段排序，以此类推。原文用图示强调了一个重要结论：**领头字段（排在前面的列）决定了树的主要导航路径**。如果查询条件只涉及非领头字段（比如只按第二列过滤，完全不提第一列），那么就没办法利用树的分层结构快速定位，必须遍历大量子树/叶子页面才能找全结果——这类查询几乎发挥不出多列索引的优势，效率明显低于按领头字段过滤的情形。

一个略微特殊的用法是把 CASE 表达式作为索引的一个"列"，人为地把连续值分桶后再和其他列组合：

```sql
create index on aircrafts(
  (case when range < 4000 then 1 when range < 10000 then 2 else 3 end),
  model);
```

## NULL 的处理

B-tree 索引支持 `IS NULL` / `IS NOT NULL` 条件。因为"NULL 和任何值（包括 NULL 自身）比较的结果都是未定义的"，这从根本上和 B-tree 依赖"完全有序"的设计理念相冲突,所以 PostgreSQL 采用了一个折中方案：把所有 NULL 值统一放在叶子节点序列的某一端（默认排在最后，即 NULLS LAST；也可以显式指定 NULLS FIRST）。

```sql
create index flights_nulls_first_idx on flights(actual_arrival NULLS FIRST);
```

## 排序能力与仅索引扫描

正因为叶子页面本身就是有序的、并且用双向链表相连，B-tree 索引天然可以支持正向和反向两种方向的有序遍历，因此当查询的 `ORDER BY` 恰好匹配索引顺序时，优化器可以直接省掉显式的 Sort 节点。但要注意，如果一个查询同时需要"一列升序、另一列降序"这种混合排序方向，普通的单一索引无法同时满足两种方向，此时要么建一个专门方向组合的索引，要么执行计划里仍会出现排序步骤。

## INCLUDE 列：覆盖索引的另一种实现

PostgreSQL 11 起，可以给唯一索引额外附加一些"非键列"，这些列不参与唯一性判断、也不能作为搜索条件，但它们的值会被存进索引，从而支持仅索引扫描,不需要为了覆盖查询而单独再建一个宽索引：

```sql
create unique index bookings_pkey2 on bookings(book_ref) INCLUDE (book_date);
```

这个特性最初由 Anastasiya Lubennikova 提交补丁实现，最终被合入 PostgreSQL 11。

## 属性核对

按照第二篇讲的三层属性接口，B-tree 的表现是：

**访问方法级**：
- `can_order`: 支持
- `can_unique`: 支持（也是唯一支持唯一约束的内置索引类型）
- `can_multi_col`: 支持
- `can_exclude`: 支持

**索引级**：
- `clusterable`、`index_scan`、`bitmap_scan`、`backward_scan` 全部支持

**列级**：支持 `asc`/`desc`、`nulls_first`/`nulls_last`、`orderable`、`search_array`（IN/ANY 表达式）、`search_nulls`、`returnable`（仅索引扫描）等,可以说是内置索引类型里能力最全面的一个。

## 操作符类要求：五种策略 + 一个比较函数

要让 B-tree 支持某种数据类型，操作符类必须提供五个比较操作符（对应五个"策略编号"）：

- 策略 1：小于 `<`
- 策略 2：小于等于 `<=`
- 策略 3：等于 `=`
- 策略 4：大于等于 `>=`
- 策略 5：大于 `>`

以及一个返回 -1/0/1 的三态比较支持函数，用于内部排序和二分查找。

## 为自定义类型接入 B-tree：复数取模排序的例子

原文用一个完整的例子演示了如何让 B-tree 支持一个自定义的复数类型，按复数的模长排序：

```sql
create type complex as (re float, im float);
create table numbers(x complex);
insert into numbers values ((0.0, 10.0)), ((1.0, 3.0)), ((1.0, 1.0));

create function modulus(a complex) returns float as $$
    select sqrt(a.re*a.re + a.im*a.im);
$$ immutable language sql;

create function complex_lt(a complex, b complex) returns boolean as $$
    select modulus(a) < modulus(b);
$$ immutable language sql;

-- 类似地还需要定义 complex_le, complex_eq, complex_ge, complex_gt

create operator #<#(leftarg=complex, rightarg=complex, procedure=complex_lt);
create operator #<=#(leftarg=complex, rightarg=complex, procedure=complex_le);
create operator #=#(leftarg=complex, rightarg=complex, procedure=complex_eq);
create operator #>=#(leftarg=complex, rightarg=complex, procedure=complex_ge);
create operator #>#(leftarg=complex, rightarg=complex, procedure=complex_gt);

create function complex_cmp(a complex, b complex) returns integer as $$
    select case when modulus(a) < modulus(b) then -1
                when modulus(a) > modulus(b) then 1 
                else 0
           end;
$$ language sql;

create operator class complex_ops
default for type complex
using btree as
    operator 1 #<#,
    operator 2 #<=#,
    operator 3 #=#,
    operator 4 #>=#,
    operator 5 #>#,
    function 1 complex_cmp(complex,complex);
```

这个例子清楚地展示了操作符类的本质：把"抽象的五种比较策略"绑定到某个具体类型的具体实现函数上,一旦绑定完成,B-tree 就能像处理内置类型一样处理这个自定义类型了。

## 内部结构探查

用 `pageinspect` 扩展可以直接查看索引内部的物理结构和统计信息：

```sql
create extension pageinspect;

select * from bt_metap('ticket_flights_pkey');
-- 返回: magic, version, root, level, fastroot, fastlevel

select type, live_items, dead_items, avg_item_size, page_size, free_size
from bt_page_stats('ticket_flights_pkey',164);

select itemoffset, ctid, itemlen, left(data,56) as data
from bt_page_items('ticket_flights_pkey',164) limit 5;
```

原文提到，一个百万行规模、建在两个字段上的索引，实测树的深度（不算根页面）通常只有 2 层，充分体现了 B-tree 极高的分支因子带来的效率。

另外还提到 `amcheck` 扩展（PostgreSQL 10 起提供），专门用来校验 B-tree 索引内部逻辑一致性,是排查索引损坏问题的实用工具。

## 建索引的性能建议

原文建议：**大表在批量导入数据时最好先不建索引，导入完成后再建**。这是因为 `CREATE INDEX` 内部使用的是一种比逐行插入高效得多的批量构建算法——先把全部数据整体排序，据此一次性构建出叶子层，再自底向上搭建内部层级，整个过程比一行一行往已有索引里插入要快得多。构建速度还受 `maintenance_work_mem` 参数影响，适当调大这个参数能明显提升建索引速度。

## 并发控制简述

原文提到 B-tree 在并发场景下的修改（插入、分裂、删除）依赖 Lehman-Yao 算法来实现，其核心思路是允许在不长时间持有大范围锁的前提下安全地对树结构做局部修改,从而在保证正确性的同时支持高并发访问,不过具体算法细节原文并未展开。

## 本讲小结

B-tree 凭借平衡、多路分支、有序这三个特性,成为 PostgreSQL 里综合能力最强的索引类型：支持等值/不等值/范围三种查找模式,支持排序和双向扫描,支持多列组合,是唯一能实现唯一约束的内置索引,还能通过 INCLUDE 列支持仅索引扫描。它的能力边界主要来自"必须能够全序比较"这一前提——这也是为什么 NULL 需要被特殊安置到序列两端,以及为什么要接入一个新类型必须提供完整的五种比较操作符。后续文章会转向不依赖全序比较、而是依赖"某种相似度/包含关系"的 GiST 索引。
