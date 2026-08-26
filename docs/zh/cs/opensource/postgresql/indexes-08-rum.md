---
title: PostgreSQL 索引 — 8（RUM 索引）
type: lecture
tags: []
status: complete
---
# PostgreSQL 索引 — 8（RUM 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/452116/ （作者 Egor Rogov，PostgresPro）

## 写在前面

RUM（名字来自 "Rum is Unfinished Merger" 的递归缩写玩笑）是一个不随 PostgreSQL 核心发布、需要单独安装的扩展索引类型，可以理解成"针对全文检索场景强化过的 GIN"。这一篇先回顾 GIN 在全文检索上的两个短板——短语搜索和相关性排序，再讲 RUM 如何通过在出现列表里存储额外信息来弥补这些短板。

## GIN 的局限性

上一篇提到，GIN 索引存储的是"元素（词位）→ TID 列表"的映射，但**索引里并不记录这个词位在文档中具体出现在什么位置**。这导致两类查询天生做不好：

1. **短语搜索**：想查"某两个词紧挨着出现"或"相隔恰好 N 个词"，GIN 索引本身给不出位置信息，只能先靠索引筛出"两个词都出现过"的候选行，再回表把完整文本重新解析、逐一核对位置关系是否满足——相当于把大部分实际工作又做了一遍；
2. **按相关度排序**：想按"匹配程度"给结果排序（比如查询词出现的密度、位置权重等排序依据），GIN 索引同样没有现成的数据支撑，只能查出全部候选后再另外计算和排序。

## RUM 的核心改进：把位置信息存进索引

RUM 相对 GIN 最本质的差异在于：**在出现列表里，每个 TID 不再是孤零零的一个行引用，而是额外附带了"这个词位在该文档中具体出现在哪些位置"的信息**。有了这份位置数据，短语相关的查询就可以完全依赖索引本身的数据得出准确结果，不再需要回表重新解析原文核对。

这也带来另一个附加好处：RUM 支持真正的**索引扫描（index scan）**，而不像 GIN 那样只能做位图扫描——这意味着 RUM 可以直接按索引内部顺序逐条返回结果，天然省去了额外的排序步骤。

## 短语搜索

RUM 支持 `<->`（要求两个词紧邻出现）和 `<N>`（要求两个词间隔恰好 N 个位置）这类距离操作符，用于精确的短语匹配：

```sql
select to_tsvector('Clap your hands, slap your thigh') @@ 
       to_tsquery('hand <-> slap');
```

原文对比说明：同样的短语查询，GIN 只能先粗筛再回表核对（也就是执行计划里会出现明显的 `Recheck` 步骤，被核对掉的候选行数可能相当可观），而 RUM 凭借索引内置的位置信息可以直接给出精确匹配结果，无需事后核对。

## 按相关度排序

RUM 引入了排序操作符 `<=>`，用于计算文档和查询之间的一种"距离"（数值越小表示越相关）：

```sql
select to_tsvector('Can a sheet slitter slit sheets?') <=> 
       to_tsquery('slit');
```

这样一来，`ORDER BY tsv <=> query` 这类按相关度排序的查询就可以直接依赖索引扫描的内在顺序得到结果，而不需要 GIN 方案下那种"先查出全部候选、再单独计算排序键、再排序"的额外步骤。

## 附加字段（Addon）机制

除了对文本本身排序，RUM 还允许把主索引字段和另一个辅助列关联起来，用于对辅助列（比如时间戳、数值等）做排序优化。配置语法示例：

```sql
create index on mail_messages using rum(tsv RUM_TSVECTOR_ADDON_OPS, sent)
  WITH (ATTACH='sent', TO='tsv');
```

有了这个配置，就可以直接按发送时间之类的辅助字段做 `<=>` 距离排序（比如"离某个时间点最近的邮件"），同样避免了事后单独排序:

```sql
select id, sent, sent <=> '2017-01-01 15:00:00'
from mail_messages
where tsv @@ to_tsquery('hello')
order by sent <=> '2017-01-01 15:00:00'
limit 10;
```

## 其他操作符类

RUM 除了标准的 `rum_tsvector_ops`（及其 addon 变体）之外,还提供：

- **rum_tsvector_hash_ops / addon_ops**：用哈希方式存储词位而不是原始词位本身，能进一步压缩索引体积，但代价是需要额外的回表核对（哈希本身有碰撞可能）；
- **rum_tsquery_ops**：一种"反向搜索"操作符类——不是拿查询去匹配文档，而是拿一篇新文档去匹配一批**预先存好的查询条件**，适合"订阅/分类推送"这类场景（比如把用户订阅的关键词条件都存成 tsquery，新文章一来就快速判断该推给哪些订阅者）；
- **rum_anyarray_ops / addon_ops**：面向数组类型的操作，功能上和 GIN 的数组支持类似。

原文给了一个反向搜索（订阅分类）场景的示例：

```sql
create table categories(query tsquery, category text);
insert into categories values
  (to_tsquery('vacuum | autovacuum | freeze'), 'vacuum'),
  (to_tsquery('xmin | xmax | snapshot | isolation'), 'mvcc'),
  (to_tsquery('wal | (write & ahead & log) | durability'), 'wal');
create index on categories using rum(query);

select array_agg(category)
from categories
where to_tsvector('Hello hackers...') @@ query;
```

## 性能对比：GIN vs RUM

### 短语搜索对比

```sql
explain (costs off, analyze)
select * from mail_messages 
where tsv @@ to_tsquery('hello <-> hackers');
```

GIN 方案下，执行计划显示出位图扫描找到 1776 个候选，但真正匹配短语条件的只有 259 行——也就是说有 1517 行是被 `Recheck` 步骤事后剔除掉的"误报"，这部分回表核对的工作是纯粹的额外开销。RUM 方案下由于索引本身存了位置信息，可以直接得到精确匹配，省掉了这个核对阶段。

### 相关度排序对比

同样的相关度排序查询，GIN 方案要先查出全部 1776 个候选，再单独计算排序键并排序，耗时约 27.121 毫秒；RUM 方案凭借索引扫描内置顺序,直接完成,耗时约 5.207 毫秒——大约快了 5 倍。

## 代价：索引更大、WAL 更多

RUM 并非没有代价。原文给出的实测索引体积对比（同一份邮件归档数据）：

```text
RUM: 457 MB | GIN: 179 MB | GiST: 125 MB | B-tree: 546 MB
```

可以看到 RUM 因为存了额外的位置信息，体积比 GIN 大了不少（虽然仍比 B-tree 小）。

另一个更值得关注的问题是 **WAL 日志量**。因为 RUM 是外部扩展、没有像核心索引类型那样精心优化过增量日志格式，它目前采用的是逐字节比较页面变化来生成 WAL 记录的朴素方式，这在高频增删+VACUUM 的压力测试场景下会产生远超 GIN 的 WAL 体积——原文实测数据大约是 RUM 3114 MB 对 GIN 约 700 MB。文中提到 Oleg Ivanov 提出过一个类似 diff 算法的补丁,理论上能把这个差距缩小到 1.5 倍左右，但截至原文写作时还只是一个提案。

## 安装方式

由于 RUM 不在 PostgreSQL 核心发行版中，需要额外安装，途径包括：
- 通过 PGDG（PostgreSQL 官方社区）软件仓库安装对应包（例如 `postgresql-10-rum`）；
- 从 GitHub 上的源码自行编译安装；
- 部分商业发行版（如原文提到的 Postgres Pro Enterprise）已经内置集成。

## 属性核对

**访问方法级**：`can_order`: 不支持；`can_unique`: 不支持；`can_multi_col`: 支持；`can_exclude`: **支持**（这一点和 GIN 不同，GIN 不支持排除约束）。

**索引级**：`clusterable`: 不支持；`index_scan`: **支持**（这一点是 RUM 相对 GIN 的关键差异之一，GIN 只能做位图扫描）；`bitmap_scan`: 支持；`backward_scan`: 不支持。

**列级**：`distance_orderable`: **支持**（对应前面演示的 `<=>` 相关度排序能力，这也是 GIN 不具备的）；`orderable`（简单的 asc/desc 排序）: 不支持。

## 本讲小结

RUM 可以理解成"用更大的索引体积和更高的 WAL 开销，换取全文检索场景下短语搜索的精确性和相关度排序的原生支持"。它的核心改动只有一点——在 GIN 的出现列表里额外塞入位置信息——但由此解锁了索引扫描能力、距离排序操作符 `<=>`，以及针对辅助字段的附加排序机制。对于本身查询量大、对短语匹配和相关度排序有硬需求的全文检索系统，RUM 值得作为 GIN 的进阶替代方案来评估;但如果写入压力很大、WAL 体积和复制带宽是主要瓶颈，则需要谨慎权衡。下一篇将转向一种设计思路完全不同、面向超大规模有序数据的轻量级索引——BRIN。
