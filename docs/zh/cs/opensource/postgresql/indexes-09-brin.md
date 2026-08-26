---
title: PostgreSQL 索引 — 9（BRIN 索引）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 索引 — 9（BRIN 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/452900/ （作者 Egor Rogov，PostgresPro）

## 写在前面

BRIN 全称 "Block Range Index"（块范围索引），是一种和前面几种索引思路都不一样的"轻量级"索引：它压根不存储 TID，体积可以小到令人惊讶（原文例子里，一张 4GB 的表，B-tree 索引要占 654MB，而 BRIN 只要 184KB）。它的适用场景也非常特定——超大规模、数据物理存储顺序和某个字段逻辑值高度相关的表（典型如按时间追加写入的日志/流水表）。这一篇讲清楚 BRIN 的设计哲学、物理结构、更新机制，以及它和相关性统计之间密不可分的关系。

## 核心设计哲学：不找出匹配行，只排除不可能的范围

原文给 BRIN 的定位非常精准："BRIN 的思路是尽量避免去看那些明显不符合条件的行,而不是去快速定位符合条件的行"。也就是说，BRIN 从根本上放弃了"精确点定位"的目标，转而追求"大范围排除"——它把表按物理顺序切成一段一段的**块范围（block range）**，为每个范围只存一份简单的**摘要信息**（比如这个范围内某字段的最小值和最大值），查询时只需要看这份摘要就能判断"这整段范围有没有可能包含符合条件的行"，从而跳过明显不相关的大片区域。

正因为这个特性，原文把 BRIN 定性为"顺序扫描的加速器"，而不是传统意义上"替代顺序扫描"的索引——它减少的是需要物理读取的页面数量，但被保留下来的候选范围仍然要靠一次不那么精确的位图扫描去核实。

## 结构：范围摘要 + 反向映射

BRIN 索引由三类页面构成：

- **元数据页**（0 号页）：记录索引的整体配置信息；
- **反向范围映射（revmap）页**：本质是一个指针数组，记录"第 N 个块范围的摘要信息存在哪一个索引行里"，起到从"表的物理块范围"快速定位到"对应摘要数据"的桥梁作用；
- **摘要数据页**：每个索引行对应一个块范围，存放该范围内被索引字段的统计摘要（最常见的就是最小值/最大值）。

这个结构非常"扁平"——不像 B-tree 那样有多层树形导航，BRIN 索引本身很小，扫描摘要数据的开销通常可以忽略不计。

## 相关性：BRIN 好不好用的决定性因素

BRIN 能不能真正发挥效果，关键取决于**被索引字段的值,和它在表里的物理存储顺序之间的相关程度**。PostgreSQL 的 `pg_stats` 系统视图里就有现成的 `correlation` 统计列：

```sql
select attname, correlation from pg_stats 
  where tablename='flights_bi' 
  order by correlation desc nulls last;
```

相关性接近 +1 或 -1，意味着这个字段的值随着物理位置单调递增或递减（比如按时间顺序追加写入的时间戳字段），这种情况下用 BRIN 效果拔群——一个块范围内的值会高度集中，min/max 摘要能非常精准地圈定候选区间。相关性接近 0，则说明该字段的值在物理上杂乱无章，此时每个块范围的 min/max 摘要几乎会覆盖全部值域，起不到排除作用，BRIN 基本失去意义。

## 建索引与范围大小配置

默认情况下，每个块范围覆盖 `pages_per_range=128` 个页面，可以在建索引时调整：

```sql
-- 默认范围大小
create index on flights_bi using brin(scheduled_time);

-- 缩小范围（更精细，索引变大但摘要更准）
create index on flights_bi using brin(airport_utc_offset) 
  with (pages_per_range=4);

-- 也可以对表达式建索引
create index on flights_bi using brin (box(airport_coord)) 
  with (pages_per_range=1);
```

范围越小，每个摘要覆盖的数据越少、摘要本身就越精确（减少假阳性回表），但索引行数会相应增多，索引体积也随之变大——这是一个需要根据实际相关性和查询模式去调优的参数。

## 更新行为

BRIN 的更新逻辑相对特殊：
- **新增行**：如果新插入的值超出了所属范围当前记录的 min/max 边界，就需要更新对应的摘要统计；如果没超出，则完全不需要动索引；
- **删除行**：**什么都不用做**——BRIN 从设计上就接受"摘要可能比实际数据范围更宽泛（不精确）"这个代价，用不追踪删除来换取更新的低开销；
- **新增的块范围**（比如表因为插入而物理增长出了新的页面）：默认情况下不会自动生成摘要，除非开启了 `autosummarize` 参数（默认关闭），或者手动调用 `brin_summarize_new_values()` 来补齐摘要。

## 使用示例

```sql
create table flights_bi(
  airport_code char(3),
  airport_coord point,
  airport_utc_offset interval,
  flight_no char(6),
  flight_type text,
  scheduled_time timestamptz,
  actual_time timestamptz,
  aircraft_code char(3),
  seat_no varchar(4),
  fare_conditions varchar(10),
  passenger_id varchar(20),
  passenger_name text
);

create index on flights_bi using brin(scheduled_time);
```

一个针对某一天数据的范围查询：

```sql
explain (costs off,analyze)
  select *
  from flights_bi
  where scheduled_time >= date_value 
    and scheduled_time < date_value + interval '1 day';
```

原文给出的实测结果显示，这类按天过滤的查询在启用 BRIN 后，准确率大约 90% 左右——也就是说在真正命中的 83954 行之外，还额外带出了约 12045 行"假阳性"候选，这些候选需要靠 Recheck 步骤在位图堆扫描阶段被过滤掉。如果查询条件换成相关性更弱的字段（比如按机场时区过滤），准确率会明显下降到大约 75% 左右——体现出相关性对 BRIN 有效性的直接影响。

查询耗时方面，原文对比显示 BRIN 方案大约 97-115 毫秒，同等条件下的 B-tree 方案约 85 毫秒、略快一些，但代价是 B-tree 索引体积要比 BRIN 大上千倍（3500 倍量级）,这正是 BRIN"用少量精度换取巨大空间节省"的核心权衡。

## 操作符类：minmax 与 inclusive

BRIN 支持不同类型的摘要策略，通过操作符类区分：

- **minmax**：适用于本身可比较大小的数据类型，摘要就是范围内的最小值和最大值，这是最常见的用法；
- **inclusive**：适用于那些没有严格意义上"大小比较"、但支持"外接边界区域"概念的类型（典型如几何类型），摘要变成"能包住该范围内所有值的最小边界区域",原理上和 GiST 的外接矩形思路有相似之处。

## 内部结构探查

用 `pageinspect` 扩展可以直接查看 BRIN 内部结构：

```sql
select * from brin_metapage_info(
  get_raw_page('flights_bi_scheduled_time_idx',0)
);

select * from brin_revmap_data(
  get_raw_page('flights_bi_scheduled_time_idx',1)
) limit 1;

select allnulls, hasnulls, value
from brin_page_items(
  get_raw_page('flights_bi_scheduled_time_idx',6),
  'flights_bi_scheduled_time_idx'
) where itemoffset = 197;
```

## 属性核对

**索引级**：支持多列索引；只支持位图扫描（不支持普通索引扫描，因为索引本身根本不存 TID，没法逐条返回）；不支持 CLUSTER；不支持反向扫描。

**列级**：支持处理 NULL（有专门的 allnulls/hasnulls 标记）；不支持任何排序方向（asc/desc）；不支持仅索引扫描（returnable 为否，因为摘要不是原始数据，没法从索引里还原出具体行的值）。

## 实践中的注意事项

原文特别指出几个容易被忽视的运维细节：

- **相关性会随时间推移而减弱**：即便数据最初是严格按物理顺序写入的，后续的更新、删除、以及表膨胀带来的碎片化，都会逐渐打乱这种物理-逻辑对应关系，使 BRIN 的准确率逐渐下降。`fillfactor` 参数可以在一定程度上缓解这个问题（给页面预留更多空闲空间，减少行迁移），但这是以牺牲表本身的存储紧凑度为代价的。
- **BRIN 会妨碍 HOT 更新**：原文提到一个不太直观的现象——只要表上存在 BRIN 索引，就会"完全妨碍"HOT（Heap-Only Tuple）更新优化的发生，这是使用 BRIN 时需要额外权衡的成本。
- **手动维护函数**：`brin_summarize_new_values()` 用于为新增的块范围补齐摘要；`brin_desummarize_range()` 用于清除某个范围的现有摘要（比如打算重新精确计算时）。
- **几何类型缺乏相关性统计**：原文提到，几何类型缺少现成的 correlation 统计支持，导致优化器难以判断是否该用 BRIN；对于严肃的几何数据检索场景，原文建议还是应该考虑专门的 PostGIS 扩展方案。

## 本讲小结

BRIN 是一种反直觉但极具针对性的索引类型：它主动放弃了"精确"，用换来的极低存储和维护成本去服务一种特定但常见的场景——超大规模、按物理顺序增长、且被索引字段与物理顺序高度相关的表（最典型的是时间序列/日志类数据）。它的有效性完全建立在相关性统计之上，相关性越高，BRIN 越接近"以极小代价获得接近索引级的过滤效果";相关性一旦弱化，BRIN 就会退化为几乎无意义的开销。理解 BRIN 的关键不是把它当作 B-tree 的廉价替代品，而是把它当作"顺序扫描的加速器"来定位。下一篇会介绍另一种基于概率数据结构、同样以牺牲精确性换取效率的索引类型——Bloom。
