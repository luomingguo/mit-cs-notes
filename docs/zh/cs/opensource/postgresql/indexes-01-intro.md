---
title: PostgreSQL 索引 — 1（导论）
type: lecture
tags: []
status: complete
---
# PostgreSQL 索引 — 1（导论）

> 原文：https://habr.com/en/companies/postgrespro/articles/441962/ （作者 Egor Rogov，PostgresPro）

## 写在前面

这是 PostgreSQL 索引系列的第一篇，目的是搭建整个系列的知识框架：索引到底是什么、数据库引擎在索引之上做了哪些通用的事情、以及查询优化器如何决定要不要用索引、怎么用索引。后续文章会逐一深入到具体的索引访问方法（Hash、B-tree、GiST、SP-GiST、GIN、BRIN，以及扩展提供的 RUM、Bloom）。

## 索引是什么

索引是数据库中的辅助对象，本质作用是加速数据访问。它不是必需品——理论上把所有索引删掉，数据库依然能正常工作（只是慢），而且索引可以随时根据表数据重建。除了加速查询，索引还承担了保证数据完整性约束（比如唯一约束、主键）的职责。

可以把索引理解成一种"键 -> 行位置"的映射结构：它把某个键值（比如某一列的值，或者某个表达式的值）和拥有这个键值的表行关联起来。表中的每一行在物理上都由一个 TID（tuple id）标识，TID 由"文件中的块号 + 块内的行位置"两部分组成。有了索引，数据库不需要扫描整张表就能通过键值快速定位到对应的 TID，进而读取实际行数据。

这种加速是有代价的：每当被索引的字段发生插入、删除或更新，同一事务内所有相关索引也必须同步更新。PostgreSQL 用 HOT（Heap-Only Tuples）技术来缓解这个开销——如果被修改的字段没有被任何索引覆盖，那么可以避免更新索引。

## 索引引擎 vs. 访问方法：分工

PostgreSQL 把"索引"这件事拆成两层职责：

**通用的索引引擎（indexing engine）**负责与具体索引类型无关的公共逻辑：
- 根据 TID 去表里读取对应版本的行数据；
- 支持逐个获取 TID，也支持先构建一个 TID 的位图（bitmap）再批量获取；
- 按照事务隔离级别检查每一行的可见性（因为 MVCC 下同一行可能有多个版本）。

**具体的访问方法（access method）**，比如 B-tree、Hash 等，各自负责：
- 实现自己的构建算法，把数据组织到磁盘页面上；
- 支持形如"被索引字段 操作符 表达式"的谓词搜索；
- 向优化器提供代价估算，帮助优化器判断是否值得用这个索引；
- 管理并发访问时的锁；
- 生成 WAL（预写日志）记录以保证崩溃恢复和复制。

这种分层设计使得添加新的索引类型相对容易——新访问方法只需要实现自己的那部分接口，而不用重新实现可见性检查、WAL 框架等通用机制。

## 三种主要的扫描方式

### 索引扫描（Index Scan）

访问方法按顺序逐一返回匹配的 TID，索引引擎每拿到一个 TID 就去表里取对应行、检查可见性、然后返回结果。这种方式在需要返回的行数比较少时效率最高，因为对每一行都是"点对点"地精确访问。

### 位图扫描（Bitmap Scan）

当预计要返回较多行时，索引引擎会让访问方法一次性返回所有匹配的 TID，在内存里构建一个位图（标记哪些页面的哪些行匹配）。这样做的好处是，即便同一个表页里有多条匹配行，这个页面也只需要被物理读取一次，避免了随机 I/O 的重复开销。

位图扫描还有一个重要特性：当查询条件涉及多个字段、且分别有索引覆盖不同字段时，可以对多个位图做按位 AND / OR 运算，组合出最终结果集，这也是为什么很多时候不需要为多字段查询专门建一个多列索引。

原文提到了"有损位图"（lossy bitmap）的概念：当匹配的行数特别多、精确记录到行级别的位图会占用太多内存时，PostgreSQL 会退化为只记录到页面级别的位图（不记录具体是页面里的哪几行匹配）。这种有损位图占用空间更小，但代价是读到该页面后要对页面内每一行重新核对条件是否成立。

### 顺序扫描（Sequential Scan）

如果查询条件的选择性很差（也就是说满足条件的行占比很高），优化器往往会放弃索引，直接顺序扫描整张表。原文的核心观点是：**索引的效果和条件的选择性正相关——选择性越高（即匹配的行数越少），索引带来的收益越大**；反之，当大部分行都满足条件时，走索引反而比顺序扫描更慢（随机 I/O 比顺序 I/O 贵）。

优化器在成本估算时会用到两个参数：`seq_page_cost`（顺序读一页的代价）和 `random_page_cost`（随机读一页的代价）。在传统机械硬盘上随机读比顺序读贵很多；但在 SSD 等介质上两者差异较小，因此这两个参数在不同硬件环境下需要调整，直接影响优化器是否倾向于选择索引扫描。

### 相关性统计（Correlation）

优化器还会参考一个"相关性"统计量，描述表中行的物理存储顺序和某一列逻辑值顺序之间的关联程度。相关性接近 +1 或 -1 表示物理顺序和列值顺序高度一致（比如按插入顺序自增的主键列），此时索引扫描往往接近顺序读,代价较低；相关性接近 0 则表示数据在物理上杂乱无章，索引扫描会退化成大量随机 I/O。

## 覆盖索引与仅索引扫描（Index-Only Scan）

当一个索引本身就包含了查询所需的全部数据（不管是作为键还是附加列），优化器就可以完全不碰表数据,只从索引里取结果,这就是 **仅索引扫描（index-only scan）**。

但这里有个障碍：索引本身不存储行的可见性信息（MVCC 判断行版本对当前事务是否可见需要额外信息）。为此 PostgreSQL 维护了一张"可见性图"（visibility map），VACUUM 过程中会把那些"所有活跃事务都能看见"的页面标记出来。如果索引指向的行恰好位于已标记的页面，仅索引扫描就可以跳过对表的可见性核对，直接信任索引里的数据;否则还是得回表确认。

`EXPLAIN ANALYZE` 输出里的 `Heap Fetches` 指标就体现了这种"被迫回表"的次数——数值越大说明可见性图没有覆盖到位，通常意味着需要更频繁地 VACUUM 来提升仅索引扫描的效率。

PostgreSQL 11 引入了 **INCLUDE 索引**，允许在索引里附加一些"非键列"：这些列不参与唯一性判断，也不能出现在查询条件里做搜索，但它们的值会被存储在索引中,可以用来支持仅索引扫描,从而减少不必要的宽索引键。

## 关于 NULL

大多数索引类型是会把 NULL 值也纳入索引的（虽然 NULL 在逻辑上"不等于任何值",包括不等于自身）。索引里包含 NULL 带来两个好处：
- 可以支持形如 `字段 IS [NOT] NULL` 的条件走索引；
- 在不带 WHERE 条件、只是想做覆盖查询（仅索引扫描）时，NULL 值的行也不会被遗漏。

## 多列索引

索引可以建立在多个字段的组合上，用于同时限定多个字段的查询条件。需要注意的是,优化器通常只能利用多列索引里"领头"的那些字段（即索引定义中靠前的列）来做范围/精确匹配；如果查询条件只涉及非领头列，则该索引对这类条件用处有限，此时位图扫描结合其他单列索引反而可能是更好的选择。

## 表达式索引

除了直接给列建索引，PostgreSQL 也支持给一个表达式（函数调用、运算结果等）建索引，这类索引一般叫"函数索引"或"表达式索引"。关键限制是：查询里的表达式必须和索引定义时的表达式在形式上完全匹配，优化器才能识别出可以使用该索引。此外，PostgreSQL 会为每个索引表达式单独收集统计信息（而不是复用底层列的统计信息）。

示例：

```sql
postgres=# create index on t(lower(b));
postgres=# explain (costs off) select * from t where lower(b) = 'a';
```

如果统计信息的采样精度不够，还可以针对表达式索引的某一列单独调整统计目标：

```sql
postgres=# alter index t_lower_idx alter column "lower" set statistics 69;
```

## 部分索引

部分索引（partial index）只对表中满足特定 WHERE 条件的那部分行建立索引条目，适合数据分布很不均匀、且经常只查询"稀有值"的场景——比如一个布尔字段绝大多数是 false、只有 1% 是 true，而查询总是针对 true 的情况。

示例中体现了部分索引带来的空间节约：

```sql
postgres=# create index on t(c) where c;
```

原文给出的具体数字：对全表建的完整索引占用 276 个页面，而只索引满足条件行的部分索引仅占用 5 个页面——差距非常显著，这不仅节省磁盘和内存开销，也让索引维护更快。

## 排序

在 PostgreSQL 内置的几种索引类型里，只有 **B-tree** 能够按顺序返回数据。如果查询里有 `ORDER BY` 但没有合适的 B-tree 索引，执行计划里就会出现一个额外的显式 Sort 节点：

```sql
postgres=# explain (costs off) select * from t order by a;
```

如果对应字段上存在 B-tree 索引，优化器可以直接利用索引本身有序的特性来满足 `ORDER BY` 需求，从而在执行计划中省掉这个 Sort 节点，减少排序开销。

## 并发建索引（CREATE INDEX CONCURRENTLY）

默认的 `CREATE INDEX` 会对表加 SHARE 锁，这会阻塞所有对表的写操作（INSERT/UPDATE/DELETE），在生产环境的大表上这可能造成长时间的业务阻塞。

`CREATE INDEX CONCURRENTLY` 改用较弱的 SHARE UPDATE EXCLUSIVE 锁模式，允许并发的读和写操作继续进行，但会阻止其他并发的结构性变更（比如同时对该表做另一次并发建索引或 DDL）。代价是：
- 需要两次扫描表数据，构建速度明显更慢；
- 存在死锁的可能性，也可能在构建过程中发现唯一约束冲突而导致构建失败；
- 一旦构建失败或中途出错,会留下一个状态为 INVALID 的索引，这个索引不会被优化器使用，需要手动清理。

可以用下面的查询找出所有失效的索引：

```sql
postgres=# select indexrelid::regclass index_name, indrelid::regclass table_name
from pg_index where not indisvalid;
```

## 索引类型总览

PostgreSQL 内置了六种索引访问方法：**Hash、B-tree、GiST、SP-GiST、GIN、BRIN**，此外还可以通过扩展安装 **RUM** 和 **Bloom** 两种索引类型。本系列后续文章会逐一详细介绍这些类型的内部结构、适用场景和局限性。

## 本文用到的示例表

文中用来演示各种概念的示例表和数据生成脚本如下（后续文章也会复用类似的建表方式）：

```sql
postgres=# create table t(a integer, b text, c boolean);

postgres=# insert into t(a,b,c)
  select s.id, chr((32+random()*94)::integer), random() < 0.01
  from generate_series(1,100000) as s(id)
  order by random();

postgres=# create index on t(a);
postgres=# analyze t;

postgres=# explain (costs off) select * from t where a = 1;
postgres=# explain (costs off) select * from t where a <= 100;

postgres=# create index on t(b);
postgres=# explain (costs off) select * from t where a <= 100 and b = 'a';

postgres=# create index on t(a,b);
postgres=# explain (costs off) select * from t where a <= 100 and b = 'a';

postgres=# explain (costs off) select * from t where lower(b) = 'a';
postgres=# create index on t(lower(b));
postgres=# explain (costs off) select * from t where lower(b) = 'a';

postgres=# create index on t(c);
postgres=# explain (costs off) select * from t where c;
postgres=# explain (costs off) select * from t where not c;
postgres=# create index on t(c) where c;

postgres=# set enable_indexscan=off;
postgres=# explain (costs off) select * from t order by a;
postgres=# set enable_indexscan=on;

postgres=# create index concurrently on t(a);
```

## 本讲小结

这一篇作为系列开篇，建立了理解所有具体索引类型所需的公共词汇表：TID 如何定位行、索引引擎与访问方法的职责划分、三种扫描方式（Index Scan / Bitmap Scan / Seq Scan）各自的适用场景、选择性和相关性对优化器决策的影响、仅索引扫描依赖可见性图的机制、以及多列索引、表达式索引、部分索引、排序能力、并发建索引这几个横切特性。后续每一篇讲具体索引类型时，都会回过头来对照这些通用概念，说明该类型支持或不支持哪些特性。
