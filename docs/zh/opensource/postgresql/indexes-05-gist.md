---
title: PostgreSQL 索引 — 5（GiST 索引）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 索引 — 5（GiST 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/444742/ （作者 Egor Rogov，PostgresPro）

## 写在前面

GiST 全称 "Generalized Search Tree"（广义搜索树），顾名思义，它的设计目标不是服务某一种特定数据类型，而是提供一套通用的树形检索框架，让开发者可以通过实现几个约定好的接口函数，把任意具有"某种相似性/包含关系"语义的数据类型接入索引体系。这一篇会通过点数据（用作 R-tree）、区间数据、全文检索三个具体案例，讲清楚 GiST 的通用机制。

## 基本结构

GiST 是一棵**高度平衡的树**，由若干节点页面组成：

- **叶子节点**：存放"谓词（predicate）+ TID"——谓词描述了这一行的数据满足的某种性质（比如一个点、一个区间）；
- **内部节点**：存放"谓词 + 子节点引用"——这里的谓词是"包含"关系的体现，一个内部节点的谓词必须覆盖（comprise）它所有子节点谓词所描述的范围。

这个"谓词层层包含"的设计,正是 GiST 通用性的来源：只要能为某种数据类型定义出"包含关系"和"如何合并谓词"这两件事,就可以用 GiST 来索引它,不需要要求数据本身是全序可比较的（这一点和 B-tree 有本质区别）。

## 关键接口函数

GiST 要求接入的操作符类实现若干支持函数，其中最核心的两个是：

- **一致性函数（consistent）**：判断某个节点的谓词是否有可能满足给定的搜索条件。对内部节点，用来决定是否需要下钻这个子树；对叶子节点，用来最终确认这一行是否满足条件。
- **距离函数（distance）**：用于最近邻（k-NN）查询，计算某个节点谓词到查询目标的"最小可能距离"。为了保证 k-NN 搜索结果正确，这个估算可以**偏低估**（乐观估计，允许实际距离比估算值大），但**绝不能高估**，否则可能会错误地剪掉本该包含最近邻的分支。

此外还有 union（合并子谓词生成父谓词）、compress/decompress（压缩谓词存储形式）、penalty（插入时评估把新数据放入某分支的代价）、picksplit（页面分裂策略）、same（谓词相等性判断）等支持函数，共同构成了完整的接口。

搜索过程是标准的**深度优先搜索**：从根节点开始，对每个子节点调用一致性函数，只有通过检验的子节点才会被继续下钻，直到叶子节点给出最终结果。

## 案例一：用于点数据的 R-tree

GiST 最经典的应用之一是空间数据索引，其内部实现思路借鉴了经典的 **R-tree** 算法：把点用外接矩形（bounding box）逐层包裹，内部节点的谓词就是"能框住所有子节点内容的最小矩形"。

一致性函数在这个场景下的具体逻辑是：
- 对内部节点：检查查询矩形和该节点的外接矩形是否有交集；
- 对叶子节点：检查该点是否真的落在查询矩形范围内。

### 建索引示例

```sql
create table points(p point);
insert into points(p) values
  (point '(1,1)'), (point '(3,2)'), (point '(6,3)'),
  (point '(5,5)'), (point '(7,8)'), (point '(8,6)');
create index on points using gist(p);
```

### 矩形范围查询

```sql
set enable_seqscan = off;
explain(costs off) select * from points where p <@ box '(2,1),(7,4)';
select * from points where p <@ box '(2,1),(7,4)';
```

结果返回 `(3,2)` 和 `(6,3)` 两个点——都落在给定矩形范围内。

### 最近邻（k-NN）查询

GiST 一个很实用的能力是原生支持"按距离排序取前 N 个"的查询模式，依赖 `<->` 这个排序操作符：

```sql
select * from points order by p <-> point '(4,7)' limit 2;
```

结果返回 `(5,5)` 和 `(7,8)`——离目标点 `(4,7)` 最近的两个点。这种查询如果没有距离排序索引支持，只能对全表逐一计算距离再排序，代价高得多；而 GiST 借助 distance 函数的下界估计,可以在搜索过程中提前剪掉那些"不可能比当前已知最近邻更近"的子树,从而高效地找出前 N 个结果。

## 案例二：用于区间的 R-tree 与排除约束

GiST 同样适合索引区间型数据（比如时间段）。这里演示的是航班预订场景中的"入住时段"：

```sql
create table reservations(during tsrange);
insert into reservations(during) values
  ('[2016-12-30, 2017-01-09)'),
  ('[2017-02-23, 2017-02-27)'),
  ('[2017-04-29, 2017-05-02)');
create index on reservations using gist(during);
select * from reservations where during && '[2017-01-01, 2017-04-01)';
```

`&&` 是"是否相交"操作符。

### 排除约束

正因为 GiST 能高效判断"是否相交"这类关系，它天然适合用来实现**排除约束（EXCLUDE constraint）**——保证表中任意两行在某个可交换操作符下都不成立，比如"任意两个预订的时间段不能相交":

```sql
alter table reservations add exclude using gist(during with &&);

insert into reservations(during) values ('[2017-06-10, 2017-06-13)');
-- 插入成功

insert into reservations(during) values ('[2017-05-15, 2017-06-15)');
-- 报错：conflicting key violates exclusion constraint（与已有区间冲突）
```

借助 `btree_gist` 扩展，还可以把普通等值比较的字段（比如房间号）也接入 GiST，实现"多字段联合排除约束"——比如"同一个房间号,时间段不能重叠",不同房间则允许重叠：

```sql
alter table reservations add house_no integer default 1;
create extension btree_gist;
alter table reservations add exclude using gist(during with &&, house_no with =);
```

## 案例三：用于全文检索的 RD-tree（签名树）

GiST 也是 PostgreSQL 全文检索（`tsvector`/`tsquery`）早期主要依赖的索引结构之一（原文写作时 GIN 也是可选项，后续文章会对比两者）。这里用的是 **RD-tree**，核心思想是"签名（signature）"：

- 把文档中每个词位（lexeme）通过哈希映射成一个固定长度位串里的若干个置位比特；
- 一个文档的签名就是它包含的所有词位签名做**按位 OR** 的结果；
- 内部节点的谓词同样是子节点签名的按位 OR（层层合并）。

一致性函数在查询时只需要检查目标签名的所有置位比特，是否也在待查节点/文档签名里被置位——如果查询词的比特位在文档签名里没有全部置位，那这个文档一定不匹配（可以放心排除）；但反过来，签名比特全部匹配并不能 100% 保证真的包含该词，因为不同词的哈希值可能"撞"到了相同的比特位上，造成误判。

### 示例

```sql
create table ts(doc text, doc_tsv tsvector);
create index on ts using gist(doc_tsv);
insert into ts(doc) values ('Can a sheet slitter slit sheets?'), ...;
update ts set doc_tsv = to_tsvector(doc);

select * from ts where doc_tsv @@ to_tsquery('sit');
```

原文用一个实测例子说明了签名法"假阳性"的代价：在针对 pgsql-hackers 邮件列表归档的搜索里，查询 `'sit'` 真正命中 898 行，但索引额外多返回了 7859 行——这些都是签名比特碰巧重合、但实际并不包含该词的"误报"行，必须靠回表重新核对 `tsvector` 内容才能被过滤掉。这正是"签名压缩"换取"存储紧凑"的代价所在：GiST 的全文索引选择用更小的索引体积换取更多的假阳性回表开销。

## 插入与删除时的谓词维护

原文提到一个值得注意的机制：**插入新值时**，PostgreSQL 会挑选让父节点谓词"扩张幅度最小"的分支去存放（这是 picksplit/penalty 函数的职责，尽量保持树的紧凑性）；但**删除数据时**，谓词并不会主动收缩——因为收缩谓词需要重新计算整个子树的边界，代价太高，所以只有在页面分裂或者手动执行 `REINDEX` 时,谓词才会被重新计算收紧。这意味着,对于频繁增删的数据,GiST 索引的谓词（比如外接矩形）会逐渐变得比实际数据范围更"臃肿"，导致过滤效率随时间推移而下降,这是需要定期 REINDEX 维护的一个原因。

## 属性核对

- `can_order`：不支持（GiST 不能在建索引时指定简单排序）；
- `can_unique`：不支持；
- `can_multi_col`：支持多列索引；
- `can_exclude`：支持（前面演示的排除约束正是这个能力的体现）；
- `clusterable`：支持；`index_scan`、`bitmap_scan`：支持；`backward_scan`：不支持；
- 列级属性依数据类型而异：点数据同时支持 `distance_orderable`（k-NN）和 `returnable`（仅索引扫描）；区间数据只支持 `returnable`；全文检索的签名索引则两者都不支持——因为索引里存的是有损的签名而非完整的 `tsvector`，无法仅凭索引内容还原或回答距离排序。

## 排查内部结构：gevel 扩展

原文用第三方扩展 `gevel` 演示了几种内省 GiST 内部结构的方法（这不是官方内置扩展）：

```sql
select * from gist_stat('airports_coordinates_idx');
-- 返回层数、页面数、叶子页面数、条目数、大小等统计信息

select * from gist_tree('airports_coordinates_idx');
-- 展示节点间的层级关系、块号、条目数

select level, a from gist_print('airports_coordinates_idx')
  as t(level int, valid bool, a box) where level = 1;
-- 展示存储的具体谓词内容（这里是外接矩形）

select level, a
from gist_print('mail_messages_tsv_idx') as t(level int, valid bool, a gtsvector)
where a is not null;
-- 展示全文索引的签名信息
```

## GiST 支持的其他数据类型

除了上面演示的点、区间、全文检索，GiST 在内置和扩展模块中还广泛支持：

- `inet`（IP 地址/网段）；
- `cube`（多维立方体，来自 `cube` 扩展）；
- `seg`（有界区间，来自 `seg` 扩展）；
- `intarray`（整数数组，提供两种不同的操作符类）；
- `ltree`（树形路径结构）；
- `pg_trgm`（三元组模糊全文/相似度搜索）。

## 本讲小结

GiST 是一套"通用搜索树"框架而非某一种具体算法——它把树的通用骨架（平衡、层次化谓词包含）和数据类型相关的具体逻辑（一致性判断、谓词合并、距离估算等支持函数）解耦开来,使得像点、区间、全文检索这些看起来毫不相干的数据类型都能复用同一套索引结构。它的核心权衡是：为了获得对各种"相似性/包含关系"数据的通用支持，往往需要接受一定程度的"有损"表示（比如外接矩形、签名压缩），这带来了假阳性回表的代价，也带来了删除后谓词不收缩、需要定期维护的运维成本。GiST 还独有的能力是原生支持 k-NN 最近邻排序查询和排除约束（EXCLUDE constraint）,这是很多其他索引类型不具备的。下一篇会介绍另一种同样通用但内部实现思路完全不同的树——SP-GiST。
