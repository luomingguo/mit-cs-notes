---
title: PostgreSQL 索引 — 6（SP-GiST 索引）
type: lecture
tags: []
status: complete
---
# PostgreSQL 索引 — 6（SP-GiST 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/446624/ （作者 Egor Rogov，PostgresPro）

## 写在前面

SP-GiST 全称 "Space-Partitioning Generalized Search Tree"（空间分割广义搜索树），同样是一个通用的树形索引框架，但和上一篇的 GiST 有本质区别：GiST 处理的是"层层包含、可能有重叠"的谓词体系（比如外接矩形可能互相重叠），而 SP-GiST 面向的是那些能把整个数据空间**递归地切分成互不相交的区域**的场景——比如四叉树（quadtree）、k 维树（k-d tree）、基数树（radix tree/trie）背后共享的这种"空间划分"思路。这一篇通过三个例子（四叉树、k-d 树、基数树）讲解 SP-GiST 的通用机制。

## 结构特点：不平衡、低分支、高深度

与 B-tree、GiST 强调的"平衡"不同，SP-GiST 的树**天生就是不平衡的**——因为不同区域的数据密集程度不一样，树某些分支会很深，某些分支会很浅。此外它通常**分支因子很低**（比如四叉树每个内部节点固定只有 4 个子节点），因此相对 B-tree 而言，树的整体深度往往更大。

节点结构上：
- 内部节点包含**前缀（prefix）**和一组**带标签的子节点引用（labeled node）**；
- 叶子节点存放实际的索引值和对应 TID，并且叶子节点还可以被组织成链表形式，允许多个叶子共享同一个父节点位置（应对空间高度重叠的极端情况）。

原文特别强调一点设计哲学："各区域互不相交"这个特性从根本上简化了插入和查找时的决策——因为任意一个数据点在给定的划分方式下,永远只可能落在唯一确定的一个子区域里,不需要像 GiST 那样考虑"可能同时属于多个重叠分支"的情况。

另外，前缀、标签、叶子值这三者的数据类型可以互不相同——这给了实现者很大的灵活性，比如可以用点类型做前缀，用整数做标签。

## 核心机制：一致性函数

和 GiST 类似，SP-GiST 的检索也依赖**一致性函数（consistent function）**，从根节点开始做深度优先搜索：
- 对内部节点，判断哪些子节点的取值范围有可能包含满足查询条件的数据，只有通过判断的子节点才会被继续访问；
- 对叶子节点，直接判断存储的值是否满足查询条件。

## 案例一：四叉树（quadtree）——用于二维点数据

四叉树的思路是：以某个中心点为界，把当前平面区域递归地切成四个象限，每个象限对应一个子节点，如此不断细分,直到落入每个子区域的数据点少到可以直接存成叶子。不同区域点的疏密程度不同，导致树的分支深度天然不一致。

### 建索引示例

```sql
create table points(p point);
insert into points(p) values
  (point '(1,1)'), (point '(3,2)'), (point '(6,3)'),
  (point '(5,5)'), (point '(7,8)'), (point '(8,6)');
create index points_quad_idx on points using spgist(p);
```

使用的操作符类是 `quad_point_ops`，支持的操作符包括：`<<`（严格在左）、`>>`（严格在右）、`~=`（重合）、`<^`（严格在下）、`>^`（严格在上）、`<@`（被包含于矩形）等。

### 查询示例

```sql
set enable_seqscan = off;
explain (costs off) select * from points where p >^ point '(2,7)';
```

一致性函数在这里的具体逻辑，是拿查询条件中的坐标和每个节点存储的"中心点"做比较，判断哪些象限有可能包含满足条件的点，从而决定要不要往下钻。

### 统计与内省

```sql
select * from spgist_stats('airports_coordinates_quad_idx');

select tid, n, level, tid_ptr, prefix, leaf_value
from spgist_print('airports_coordinates_quad_idx') as t(
  tid tid,
  allthesame bool,
  n int,
  level int,
  tid_ptr tid,
  prefix point,
  node_label int,
  leaf_value point
)
order by tid, n;
```

## 案例二：k 维树（k-d tree）——同一份数据的另一种切分方式

k-d 树对同样的二维点数据采取了不同的划分策略：不是每次都切成四份，而是**交替**用水平线和垂直线依次切分——这一层用横线分成上下两半，下一层再对每半用竖线分成左右两半，如此交替，每个内部节点固定只有两个子节点。这个思路可以推广到任意 k 维空间。

```sql
create index points_kd_idx on points using spgist(p kd_point_ops);
```

和四叉树的一个关键区别：四叉树在内部节点存的前缀是完整的"点"（中心点坐标），而 k-d 树因为每层只用一条坐标轴的一个值来切分,所以存储的前缀类型是单个浮点数（当前那一层用来切分的坐标值），而不是完整的点。

```sql
select tid, n, level, tid_ptr, prefix, leaf_value
from spgist_print('airports_coordinates_kd_idx') as t(
  tid tid,
  allthesame bool,
  n int,
  level int,
  tid_ptr tid,
  prefix float,
  node_label int,
  leaf_value point
)
order by tid, n;
```

## 案例三：基数树（radix tree）——用于字符串

基数树（radix tree，也叫 trie 树/前缀树）用来索引文本类数据，思路是把字符串按照公共前缀逐层拆解：从根到某个叶子节点路径上依次经过的各级"前缀片段"拼接起来，就还原出完整的字符串值。**公共前缀存储在内部节点里只需要保存一次**，这比 B-tree 把每个完整字符串都独立存一份要节省得多，尤其是当大量字符串共享较长公共前缀时。

### 建索引示例

```sql
create table sites(url text);
insert into sites values 
  ('postgrespro.ru'),
  ('postgrespro.com'),
  ('postgresql.org'),
  ('planet.postgresql.org');
create index on sites using spgist(url);
```

用的是 `text_ops` 操作符类，提供类似 B-tree 的比较操作符，但用的是按字节比较的变体（`~<~`、`~<=~`、`~>=~`、`~>~`）。

### 前缀匹配查询

```sql
explain (costs off) select * from sites where url like 'postgresp%ru';
```

执行计划显示，索引先用 `Index Cond` 定位出介于 `'postgresp'` 和 `'postgresq'` 之间的候选范围（这一步靠基数树的前缀结构快速完成），然后再用 `Filter` 条件对候选结果做精确的 LIKE 模式匹配过滤，实现了对文本前缀匹配的加速。

### 内省

```sql
select * from spgist_print('sites_url_idx') as t(
  tid tid,
  allthesame bool,
  n int,
  level int,
  tid_ptr tid,
  prefix text,
  node_label smallint,
  leaf_value text
)
order by tid, n;
```

## NULL 值处理

SP-GiST 对 NULL 值的处理方式是**建立一棵完全独立的、拥有自己根节点的小树**，专门单独存放所有 NULL 值，和正常值的主树彼此分开。这要求操作符类里所有用到的操作符都必须是"严格的"（strict，即只要有一个参数是 NULL，函数就返回 NULL，不需要特殊处理 NULL 输入）。

```sql
explain (costs off)
select * from sites where url is null;
```

## 属性核对

- `can_order`：不支持；
- `can_unique`：不支持；
- `can_multi_col`：**不支持**——这一点和 GiST 不同，SP-GiST 目前只能对单个列/表达式建索引；
- `can_exclude`：支持排除约束；
- `clusterable`：不支持；`index_scan`、`bitmap_scan`：支持；`backward_scan`：不支持；
- 列级：不支持 `asc`/`desc` 方向排序，不支持 NULL 排序位置控制；`returnable`（仅索引扫描）：支持；`search_nulls`：支持。

## 其他支持的数据类型

原文还提到两个值得关注的操作符类：

- **`box_ops`**：把矩形数据也用四叉树的思路来索引——每个矩形由四个坐标数值描述,相当于把它看作四维空间里的一个点,于是划分变成了十六个象限（2⁴）而不是四个。当索引中的矩形普遍存在大量相互重叠的情况时，这种方式相比 GiST 的 R-tree 实现有性能优势。
- **`range_ops`**：把区间数据（range 类型）也用四叉树处理——把每个区间看成二维平面上的一个点，横坐标是区间下界，纵坐标是区间上界，从而复用四叉树的划分逻辑。

## 性能权衡

原文总结了 SP-GiST 在存储和 I/O 两方面的权衡：

**存储优势**：像基数树这种场景下,由于值不是完整存储、而是靠路径拼接"重构"出来的,索引体积可能比 B-tree 紧凑得多,尤其在数据有大量公共前缀时。

**I/O 代价**：由于分支因子低（比如四叉树每个节点只有 4 个子节点，远低于 B-tree 动辄成百的分支数），要把这些"细碎"的节点有效地打包进标准大小的磁盘页面本身就不是很高效；同时因为树天生不平衡，不同查询路径的深度差异很大，导致查询耗时不像 B-tree 那样稳定可预期。

## 本讲小结

SP-GiST 和上一篇的 GiST 常被放在一起比较，两者都是"通用搜索树框架"，但底层假设完全不同：GiST 假设谓词之间可能重叠、需要靠"包含关系"和"一致性判断"来搜索；SP-GiST 则假设空间可以被递归地切分成互不相交的区域，天然适合四叉树、k-d 树、基数树这类"分治"结构。这种假设让 SP-GiST 在插入/查找逻辑上更简单，在前缀共享数据（如字符串、IP、层级坐标）上 storage 效率更高，但代价是牺牲了平衡性（深度不稳定）和多列索引能力。下一篇将介绍功能定位与前两者都不同的 GIN 索引——专门为"一行数据对应多个键"的场景（如数组、全文检索）设计。
