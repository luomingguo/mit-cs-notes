---
title: PostgreSQL 索引 — 7（GIN 索引）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 索引 — 7（GIN 索引）

> 原文：https://habr.com/en/companies/postgrespro/articles/448746/ （作者 Egor Rogov，PostgresPro）

## 写在前面

GIN 全称 "Generalized Inverted Index"（广义倒排索引），是专门为"一个字段里包含多个可检索元素"这类场景设计的索引类型——典型代表是数组、`jsonb`、全文检索用的 `tsvector`。这一篇讲清楚倒排索引的基本思路、GIN 的物理结构、更新代价问题及其解决方案（fastupdate）、部分匹配搜索，以及它在数组和 JSONB 上的具体应用。

## 倒排索引的基本思路

原文用书籍索引来类比："普通索引"好比按页码排的目录，而"倒排索引"则反过来——是书末尾那种按关键词字母顺序排列、每个词后面跟着"出现在哪几页"的索引。GIN 正是这个思路：它不是把"整行数据"当作一个键去索引，而是把复合类型数据（数组、tsvector、jsonb 等）拆解成一个个独立的**元素**，然后为每个元素单独记录"哪些行包含了它"。

## 物理结构：元素 B-tree + 出现列表/出现树

GIN 索引本质上分两层：

- **元素树（entry tree）**：一棵存放所有不重复元素的 B-tree,起到"目录"的作用；
- 每个元素叶子节点下面挂着该元素出现过的行的 TID 集合，具体用两种形式之一存储：
  - **出现列表（posting list）**：当某个元素只出现在少量行里时，直接把这些 TID 紧凑地存在和元素本身同一页里；
  - **出现树（posting tree）**：当某个元素出现的行数特别多、一页存不下时，就单独为它的 TID 集合建一棵独立的 B-tree。

一个重要的设计取舍是：**GIN 索引中的元素本身永远不会被删除**——即使某个元素对应的所有行都被删掉了，这个元素条目依然留在元素树里（只是它的 TID 列表变空）。这个简化背后的假设是：复合值本身可能经常变化，但"元素的种类集合"相对稳定，这种设计简化了并发访问的实现复杂度。

## 全文检索场景示例

用一批英文短句演示 GIN 在 `tsvector` 上的应用：

```sql
create table ts(doc text, doc_tsv tsvector);

insert into ts(doc) values
  ('Can a sheet slitter slit sheets?'), 
  ('How many sheets could a sheet slitter slit?'),
  ('I slit a sheet, a sheet I slit.'),
  ('Upon a slitted sheet I sit.'), 
  ('Whoever slit the sheets is a good sheet slitter.'), 
  ('I am a sheet slitter.'),
  ('I slit sheets.'),
  ('I am the sleekest sheet slitter that ever slit sheets.'),
  ('She slits the sheet she sits on.');

update ts set doc_tsv = to_tsvector(doc);

create index on ts using gin(doc_tsv);
```

建成的索引里，每个词位（经过词干提取的词，比如 "sheet"）都关联着包含它的所有文档 TID。文中提到"sheet"这个词出现在全部 9 个文档里，因此对应的存储用的是出现树；而更少见的词则用出现列表就够了。

### 查询执行过程举例

对于查询 `doc_tsv @@ to_tsquery('many & slitter')`，索引引擎的执行步骤大致是：

1. 先把查询语句本身也解析成词位：得到 "mani"（"many"的词干形式）和 "slitter"；
2. 在元素 B-tree 里分别定位这两个词位；
3. 分别取出各自的 TID 列表——"mani" 只出现在 (0,2)；"slitter" 出现在 (0,1)、(0,2)、(1,2)、(1,3)、(2,2)；
4. 用一致性函数（consistent）按布尔 AND 逻辑核对每个候选 TID 是否同时满足两个词位都出现的条件：

```text
   TID  | mani | slitter | consistency
-------+------+---------+----------------
 (0,1) |    f |       T |              f 
 (0,2) |    T |       T |              T
 (1,2) |    f |       T |              f
 (1,3) |    f |       T |              f
 (2,2) |    f |       T |              f
```

最终只有 (0,2) 这一行同时命中两个词位，成为查询结果。

## 更新代价问题与 fastupdate

GIN 索引更新代价比其他索引类型更高——因为修改（插入/更新）一个文档，往往意味着要同时更新它包含的**所有**词位对应的条目，一个字段值可能对应几十上百个索引改动，而不是像 B-tree 那样只改一条记录。

为缓解这个问题，PostgreSQL 提供了 `fastupdate` 参数：

```sql
create index on ts using gin(doc_tsv) with (fastupdate = true);
```

启用后，新的更新不会立即整理进主体的元素树结构，而是先追加到一个无序的**待处理列表（pending list）**里。等这个列表积累到一定大小（由 `gin_pending_list_limit` 参数控制）或者触发 VACUUM 时，才会一次性把这些堆积的更新批量整理进正式结构。

这个机制是典型的"写入延迟换写入吞吐"：
- 好处是单次更新的即时开销大大降低；
- 代价是查询时除了正常查元素树，还得额外扫一遍待处理列表（拖慢查询），并且当待处理列表突然溢出触发批量整理时,这次更新的耗时会变得不可预测（明显变慢）。

## 部分匹配搜索

GIN 天然支持全文检索里的前缀匹配语法：

```sql
select doc from ts where doc_tsv @@ to_tsquery('slit:*');
```

这条查询会找出所有包含"以 slit 开头的词位"的文档（既包括 "slit" 本身，也包括 "slitter"）。执行原理是：索引引擎会先在元素树里定位出所有匹配前缀的元素条目，然后把它们各自的 TID 集合用布尔 OR 合并起来。

## 常见词与罕见词的优化顺序

原文用一个包含 356125 封邮件的真实全文归档来说明优化器如何智能安排检索顺序。用 `ts_stat()` 统计发现："wrote" 这个词出现在 231174 篇文档里（极其常见），而 "tattoo" 只出现在 2 篇文档里（极其罕见）。当查询同时要求这两个词都出现时，优化器会**先检索罕见词，再用它的少量候选结果去核对常见词是否也出现**，而不是反过来。这个顺序调整带来的效果非常显著：整个组合查询只用 0.959 毫秒，远快于单独查询 "wrote" 一个词所需的 2875 毫秒。

## 限制结果集：gin_fuzzy_search_limit

`gin_fuzzy_search_limit` 参数可以让 GIN 提前终止对超大结果集的完整计算：

```sql
set gin_fuzzy_search_limit = 1000;
select count(*) from mail_messages where tsv @@ to_tsquery('wrote');
```

原文强调这个限制是"非精确的"（fuzzy）——实际返回的行数可能比设定值多一些，所以称为"模糊"限制。默认值是 0，表示不做任何限制。

## 紧凑的存储表示

GIN 索引之所以能做到相对紧凑，主要靠两点：
1. 同一个元素若出现在多篇文档里，元素本身在索引里只存一份，不重复存储；
2. TID 列表内部按顺序存放，可以用**差值编码（delta encoding）**——每个 TID 只存和前一个 TID 的差值,而不是完整值,大幅压缩了存储空间。

原文给出一个真实邮件归档案例的索引大小对比：GIN 索引 179 MB，GiST 索引 125 MB，B-tree 索引则达到 546 MB。

## GiST 还是 GIN？

两者都能索引全文检索这类复合数据，如何选择？原文给出的经验法则是：**GIN 通常在准确度和查询速度上优于 GiST**（GIN 不像 GiST 签名索引那样有假阳性问题，因为 GIN 直接精确匹配元素）；但如果业务场景是数据频繁更新、更新性能是首要考量，则需要综合权衡两者的更新代价再做取舍（GIN 更新总体偏慢，尽管有 fastupdate 缓解）。

## 数组场景

GIN 也是 PostgreSQL 索引数组类型的标准方式：

```sql
select amop.amopopr::regoperator, amop.amopstrategy
from pg_opclass opc, pg_opfamily opf, pg_am am, pg_amop amop
where opc.opcname = 'array_ops'
and opf.oid = opc.opcfamily
and am.oid = opf.opfmethod
and amop.amopfamily = opc.opcfamily
and am.amname = 'gin'
and amop.amoplefttype = opc.opcintype;
```

支持的操作符包括 `&&`（有交集）、`@>`（包含）、`<@`（被包含于）、`=`（相等）。

示例（航班表里的"每周运营星期几"数组字段）：

```sql
create table routes_t as select * from routes;
create index on routes_t using gin(days_of_week);

select * from routes_t where days_of_week = ARRAY[2,4,7];
```

执行过程是：先把数组元素 2、4、7 分别作为搜索键，在元素树里定位、取出各自 TID 列表,再用一致性函数筛出同时出现在三个列表里的 TID。但要注意，`=` 操作符要求两个数组**完全相等**，而索引本身没法确认"这一行的数组里除了 2、4、7 之外没有其他值"，所以候选结果仍需要回表核实——这也是为什么许多 GIN 数组查询计划里都能看到 `Recheck` 步骤。

### 多列组合索引：借助 btree_gin

通过 `btree_gin` 扩展，可以把普通标量类型也接入 GIN 操作符体系，从而实现数组字段和普通字段的多列联合索引：

```sql
create extension btree_gin;
create index on routes_t using gin(days_of_week, departure_city);

explain (costs off)
select * from routes_t 
where days_of_week = ARRAY[2,4,7] 
and departure_city = 'Moscow';
```

这样两个条件都能被下推到索引扫描阶段完成，而不需要事后额外过滤。

## JSONB 场景

针对 `jsonb` 类型，GIN 提供两种操作符类：

- **jsonb_ops**（默认）：为 JSON 文档里的所有键、值、数组元素都建立索引条目，功能最全但索引也最大；
- **jsonb_path_ops**：只针对"路径 + 叶子值"的组合建索引条目，专门优化路径查询场景,索引更紧凑但支持的操作符范围更窄。

支持的操作符/策略包括：`?`（顶层键是否存在，策略 9）、`?|`（是否存在若干顶层键之一，策略 10）、`?&`（是否所有列出的顶层键都存在，策略 11）、`@>`（顶层是否包含某 JSON 值，策略 7）。

示例：

```sql
create table routes_jsonb as
  select to_jsonb(t) route 
  from (
      select departure_airport_name, arrival_airport_name, days_of_week
      from routes 
      order by flight_no limit 4
  ) t;

create index on routes_jsonb using gin(route);

explain (costs off) 
select jsonb_pretty(route) 
from routes_jsonb 
where route @> '{"days_of_week": [5]}';
```

对于 `@>` 包含查询，执行过程是：先从查询条件里提取出 "days_of_week" 和 "5" 这两个待匹配元素，在元素树里分别定位、取 TID 列表，用一致性函数筛出同时包含这两个元素的候选行,最后仍需回表核实——因为索引本身无法确认 JSON 结构里元素间的层级/顺序关系是否完全匹配。

## 内部结构探查

用 `pageinspect` 扩展查看元页面信息：

```sql
create extension pageinspect;

select * from gin_metapage_info(get_raw_page('mail_messages_tsv_idx',0));
```

关键字段含义：
- `n_pending_pages` / `n_pending_tuples`：待处理列表（fastupdate 场景）当前占用的页面数和累积的元组数；
- `n_total_pages`：索引总页数；
- `n_entry_pages`：元素 B-tree 占用的页数（示例中为 13751）；
- `n_data_pages`：出现树占用的页数（示例中为 9216）；
- `n_entries`：索引中不重复元素的总数（示例中为 1423598）。

进一步用 `gin_page_opaque_info()` 分析该示例索引，可以看到页面构成细分：1 个元页面、133 个元素树内部页、13618 个元素树叶子页、1497 个出现树内部页、7719 个出现树叶子页（标记为已压缩）。用 `gin_leafpage_items()` 还能看到叶子页上出现列表的压缩存储细节（首个 TID + 字节数 + 差值编码后的 TID 数组）。

## 属性核对

**访问方法级**：`can_order`: 不支持；`can_unique`: 不支持；`can_multi_col`: 支持；`can_exclude`: 不支持。

**索引级**：`clusterable`: 不支持；`index_scan`: **不支持**（GIN 只能整体构建位图后批量返回，无法像 B-tree 那样逐个 TID 返回）；`bitmap_scan`: 支持；`backward_scan`: 不适用（因为只支持位图扫描，反向遍历的概念本身就不成立）。

**列级**：不支持排序（asc/desc）；不支持仅索引扫描（因为原始复合值并没有完整存回索引，只存了拆解后的元素）；不支持 NULL 直接处理；不支持距离排序；不支持数组式搜索（search_array）和显式 NULL 搜索。

顺带一提，因为 GIN 总是先算出完整位图再返回，`LIMIT` 子句对它的加速作用有限——除非配合 `gin_fuzzy_search_limit` 提前截断计算。

## 相关扩展

- **pg_trgm**：三元组相似度索引，让 `LIKE`、正则匹配也能走 GIN；
- **hstore**：早期的键值存储类型（如今大多被 jsonb 取代）；
- **intarray**：增强版整数数组操作，提供专门的 `gin__int_ops` 操作符类；
- **btree_gin**：让普通标量类型也能接入 GIN,支撑多列联合索引；
- **jsquery**：一种 JSON 查询语言扩展（非 PostgreSQL 标准内置）,也基于 GIN 索引实现。

## 本讲小结

GIN 是"一对多"场景（一个字段值内部包含多个可检索元素）的专用解法：数组、jsonb、tsvector 都属于这一类。它通过"元素 B-tree + 出现列表/出现树"的两层结构,把复合值拆解重组,换来了比同类 GiST 方案更高的准确度和更紧凑的存储,但代价是更新开销显著更高——为此专门设计了 fastupdate + 待处理列表机制做写入延迟优化。GIN 也擅长部分匹配（前缀搜索）和根据词频智能安排检索顺序,这些都是其倒排结构的自然产物。下一篇会介绍 GIN 的"进化版"扩展——RUM 索引,看它如何弥补 GIN 在短语搜索和相关性排序上的不足。
