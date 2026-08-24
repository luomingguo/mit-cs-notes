---
title: PostgreSQL 中的 MVCC — 7. Autovacuum（自动清理）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 中的 MVCC — 7. Autovacuum（自动清理）

> 原文：https://habr.com/en/companies/postgrespro/articles/486104/ （作者 Egor Rogov，PostgresPro）

上一篇讲了 VACUUM 命令本身怎么工作，这一篇讲的是 PostgreSQL 怎么把 VACUUM（以及 ANALYZE）自动化调度起来——也就是 autovacuum 机制的运作逻辑、触发条件和相关参数。

## 为什么需要自动化

手动决定"什么时候该清理哪张表"其实是个很难拿捏的问题：清理得太不频繁，死元组会不断堆积，表持续膨胀，索引也要付出多轮扫描的代价；清理得太频繁，又会白白消耗 I/O 和 CPU 资源，挤占本该用于正常业务的处理能力。而且单纯靠固定的调度计划（比如每天凌晨跑一次）也不合适，因为不同表的写入强度会随时间变化，一刀切的计划无法适应真实的负载波动。

PostgreSQL 的答案是让系统自己根据每张表的"脏"程度动态判断，这套机制由两类进程协作完成：

- **autovacuum launcher**（自动清理启动进程）：负责统筹规划，是一个常驻的守护进程。
- **autovacuum worker**（自动清理工作进程）：真正执行清理动作的进程，可能同时有多个在跑。

要让这套机制生效，`autovacuum` 和 `track_counts` 这两个参数都必须开启（后者负责收集统计信息，是前者判断的依据）。

launcher 的工作方式是：每隔 `autovacuum_naptime` 秒（这是一个"打盹"周期），从统计信息里梳理出当前有哪些数据库存在活跃变更，然后为每个需要处理的数据库派发出一个 worker 进程。同时运行的 worker 数量上限由 `autovacuum_max_workers` 控制；如果某个数据库的清理工作在一个周期内没能做完，下一轮还会继续给它派工。

每个 worker 进程拿到任务后，会依次完成这几件事：找出需要清理（VACUUM）的表、物化视图、TOAST 表；找出需要重新分析统计信息（ANALYZE）的表和物化视图（TOAST 表不参与 ANALYZE）；然后逐个处理这些对象。需要注意的是，并行是发生在"处理不同表"这个层面上的——同一张表内部的清理工作本身并不是并行进行的（原文提到已有相关补丁在尝试让单表内部的索引清理也能借助后台工作进程并行处理，但这属于更进一步的优化方向）。

## 什么样的表需要被清理

判断一张表是否"该清理"，用的是这样一个条件：

```text
pg_stat_all_tables.n_dead_tup >= autovacuum_vacuum_threshold + autovacuum_vacuum_scale_factor * pg_class.reltuples
```

也就是"死元组数量"超过了"一个固定基数 + 表总行数的一定比例"，就会被判定需要清理。默认参数是：

- `autovacuum_vacuum_threshold` = 50（固定基数）
- `autovacuum_vacuum_scale_factor` = 0.2（即表总行数的 20%）

原文特别指出，对于行数巨大的表，20% 这个比例系数的影响远大于那个固定基数 50，而 20% 这个默认值其实偏高——意味着一张千万行的大表，可能要攒下几百万条死元组才会触发自动清理，这段时间里表已经相当膨胀了。因此这两个参数在实践中经常需要针对大表单独调低。

这些参数既可以全局配置，也可以针对单张表覆盖：

```sql
-- 表级参数示例
autovacuum_vacuum_threshold / toast.autovacuum_vacuum_threshold
autovacuum_vacuum_scale_factor / toast.autovacuum_vacuum_scale_factor
autovacuum_enabled / toast.autovacuum_enabled  -- 完全关闭某表的自动清理
```

关闭某张表的自动清理示例：

```sql
ALTER TABLE vac SET (autovacuum_enabled = off);
```

原文给出了一组用于监控哪些表"接近该被清理"的辅助视图。首先是一个取参数值的工具函数（会优先取表级覆盖值，取不到再回退到全局默认值，同时区分普通表和 TOAST 表使用不同前缀）：

```sql
CREATE FUNCTION get_value(param text, reloptions text[], relkind "char")
RETURNS float
AS $$
  SELECT coalesce(
    (SELECT option_value
     FROM   pg_options_to_table(reloptions)
     WHERE  option_name = CASE
              WHEN relkind = 't' THEN 'toast.' ELSE ''
            END || param
    ),
    current_setting(param)
  )::float;
$$ LANGUAGE sql;
```

基于它构造的监控视图：

```sql
CREATE VIEW need_vacuum AS
  SELECT st.schemaname || '.' || st.relname tablename,
         st.n_dead_tup dead_tup,
         get_value('autovacuum_vacuum_threshold', c.reloptions, c.relkind) +
         get_value('autovacuum_vacuum_scale_factor', c.reloptions, c.relkind) * c.reltuples
         max_dead_tup,
         st.last_autovacuum
  FROM   pg_stat_all_tables st,
         pg_class c
  WHERE  c.oid = st.relid
  AND    c.relkind IN ('r','m','t');
```

这里有一个值得特别注意的现象：**纯追加型（append-only）的表**——只插入不更新删除，死元组数量永远是 0——按这条判断规则永远不会触发普通的自动 VACUUM。这看起来是好事（毕竟没有死元组要清理），但也意味着可见性映射永远不会被更新，导致这张表没法享受到索引仅扫描（index-only scan）这类依赖可见性映射的优化。原文的建议是：对于这类高频追加、又依赖索引仅扫描性能的表，需要考虑手动定期执行 VACUUM，而不能完全依赖 autovacuum 的默认触发条件。

## 什么样的表需要重新 ANALYZE

判断逻辑类似,但依据的是"自上次分析以来被修改过的行数":

```text
pg_stat_all_tables.n_mod_since_analyze >= autovacuum_analyze_threshold + autovacuum_analyze_scale_factor * pg_class.reltuples
```

默认参数:

- `autovacuum_analyze_threshold` = 50
- `autovacuum_analyze_scale_factor` = 0.1(即 10%)

表级也可以单独覆盖 `autovacuum_analyze_threshold` 和 `autovacuum_analyze_scale_factor`(注意:ANALYZE 相关参数没有对应的 TOAST 版本,因为 TOAST 表本身不参与 ANALYZE)。

对应的监控视图:

```sql
CREATE VIEW need_analyze AS
  SELECT st.schemaname || '.' || st.relname tablename,
         st.n_mod_since_analyze mod_tup,
         get_value('autovacuum_analyze_threshold', c.reloptions, c.relkind) +
         get_value('autovacuum_analyze_scale_factor', c.reloptions, c.relkind) * c.reltuples
         max_mod_tup,
         st.last_autoanalyze
  FROM   pg_stat_all_tables st,
         pg_class c
  WHERE  c.oid = st.relid
  AND    c.relkind IN ('r','m');
```

## 一个完整的演示实验

原文调低了几个参数的阈值,方便快速观察 autovacuum 触发的过程:

```sql
ALTER SYSTEM SET autovacuum_naptime = '1s';
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.03;
ALTER SYSTEM SET autovacuum_vacuum_threshold = 0;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02;
ALTER SYSTEM SET autovacuum_analyze_threshold = 0;
SELECT pg_reload_conf();
```

建表并插入 1000 行:

```sql
CREATE TABLE autovac(
  id serial,
  s char(100)
) WITH (autovacuum_enabled = off);
INSERT INTO autovac SELECT g.id,'A' FROM generate_series(1,1000) g(id);
```

（这里先禁用了这张表自己的 autovacuum，方便手动控制观察节奏。）

有一个容易踩到的细节：在第一次 ANALYZE 真正执行之前，`pg_class.reltuples` 这个统计值其实一直是 0（因为它本身就是靠 ANALYZE 才更新的），这会导致 `max_dead_tup` 之类的计算结果暂时也是 0——阈值计算依赖的正是这个统计值，形成了一种"鸡生蛋"的先后关系。等到第一次分析真正跑完（比如因为累积修改行数达到了触发条件），`reltuples` 才会被填上真实值，后续的阈值计算才会准确。原文演示中，等 1000 行的修改触发了分析之后，`max_dead_tup` 显示为 30（也就是 1000 的 3%，对应调低后的 `scale_factor`）；随后一次修改了 31 行的更新操作超过了这个 30 行的阈值，autovacuum 便随之被触发，日志会显示当时统计到的 31 个死元组。

## 负载限速

自动清理毕竟是后台任务，不能无节制地和业务查询争抢 I/O 带宽,PostgreSQL 为此设计了一套"限速"（cost-based delay）机制。

### VACUUM 命令本身的限速

基本思路是：进程处理累计到一定"成本额度"（约等于 `vacuum_cost_limit`）之后，就主动休眠 `vacuum_cost_delay` 毫秒，然后再继续。默认设置是 `vacuum_cost_limit = 200`，`vacuum_cost_delay = 0`（也就是默认完全不限速）——原文解释这个默认值的理由是：手动执行的 VACUUM 通常是运维人员主动发起的，希望它尽快跑完，所以默认不设延迟。

具体的成本核算规则是：命中缓冲区缓存里已有的页面，成本记 `vacuum_cost_page_hit = 1`；需要从磁盘实际读取（缓存未命中）的页面，成本记 `vacuum_cost_page_miss = 10`；如果还伴随着把一个脏页驱逐出缓存（需要写回磁盘），成本记 `vacuum_cost_page_dirty = 20`。按默认的 200 额度换算，大致相当于一轮处理能够连续处理 200 个纯缓存命中的页面,或者 20 个需要磁盘读取的页面,或者 10 个需要驱逐脏页的页面（几种情形可以混合累计）。

### Autovacuum 专属的限速参数

Autovacuum 有自己单独的一套限速配置，不与手动 VACUUM 共用：`autovacuum_vacuum_cost_limit` 和 `autovacuum_vacuum_cost_delay`。当这两个参数取值为 -1 时,表示直接沿用上面手动 VACUUM 用的那套通用参数。

默认设置：`autovacuum_vacuum_cost_limit = -1`（即沿用 `vacuum_cost_limit = 200`）；`autovacuum_vacuum_cost_delay` 在 PostgreSQL 11 里默认是 20ms,到了 PostgreSQL 12 被调低到 2ms（说明社区认为之前的默认限速偏保守,清理速度可以适当加快）。

这里有一个容易被忽视但很重要的行为:**这个成本额度是在所有并发运行的 autovacuum worker 之间共享的**——也就是说,如果调大了 `autovacuum_max_workers` 让更多 worker 同时跑,但没有相应地调大 `autovacuum_vacuum_cost_limit`,那么单个 worker 实际能分到的处理速度反而会被摊薄,总体清理吞吐量并不会线性提升。

## 内存使用与运行监控

Autovacuum 在扫描时同样用 `maintenance_work_mem` 来存放待清理的 TID 列表（和手动 VACUUM 用的是同一个参数）。此外还有一个专属参数 `autovacuum_work_mem`（默认 -1,表示不单独设置,直接沿用 `maintenance_work_mem`），可以专门为 autovacuum worker 限定一个不同于手动 VACUUM 的内存额度。内存在进程启动时就一次性分配好,不是按需动态增长的。

如果分配给 `autovacuum_work_mem` 的内存太小,会导致前面提过的"索引要被反复扫描多轮"的问题重演,原文建议:内存额度最好能覆盖单次清理所需的全部 TID,避免重复扫描索引带来的额外开销。

### 监控手段

**日志参数 `log_autovacuum_min_duration`**（默认 -1,表示不记录）：设置为 0 可以让每一次 autovacuum 运行的详情都记入服务器日志。

一条典型的日志输出大致如下:

```text
2019-05-21 11:59:55.675 MSK [9737] LOG:  automatic vacuum of table "test.public.autovac": index scans: 0
	pages: 0 removed, 18 remain, 0 skipped due to pins, 0 skipped frozen
	tuples: 31 removed, 1000 remain, 0 are dead but not yet removable, oldest xmin: 4040
	buffer usage: 78 hits, 0 misses, 0 dirtied
	avg read rate: 0.000 MB/s, avg write rate: 0.000 MB/s
	system usage: CPU: user: 0.00 s, system: 0.00 s, elapsed: 0.00 s
2019-05-21 11:59:55.676 MSK [9737] LOG:  automatic analyze of table "test.public.autovac"
```

从这类日志里能直接读出:本次清理了多少行、还剩多少行、有多少死元组因为老快照还清不掉、缓存命中情况、平均读写速率等,是排查自动清理是否跟得上业务写入节奏的重要依据。

**监控建议**:如果发现清理速度跟不上表的膨胀速度,更推荐的做法是**调低触发阈值,让每次清理处理的数据量更小、更频繁**,而不是简单地调大内存;同时可以借助前面提到的 `need_vacuum`、`need_analyze` 视图,持续观察有哪些表正在逼近触发条件——如果这份"待处理列表"持续变长,通常说明现有的 autovacuum worker 数量或处理速度已经跟不上当前的写入负载,需要相应调整并发度或限速参数。

## 本讲小结

Autovacuum 由 launcher 和多个 worker 进程协作完成，launcher 周期性巡检各数据库的统计信息，为需要处理的数据库派发 worker；worker 依据"死元组数/修改行数是否超过阈值"这两条独立的判断规则，分别决定是否需要 VACUUM 和 ANALYZE，这些阈值都可以全局或按表精细调整。为了避免和业务负载抢资源，autovacuum 还有一套独立的基于成本的限速机制，且这个限速额度是在并发 worker 之间共享的。理解这些默认参数（尤其是偏保守的 20%/10% scale factor）为什么往往不适合大表和高频写入场景，是调优生产环境自动清理策略的关键，也是本系列最后一篇讨论"冻结"（freezing）与事务 ID 回卷问题的重要前置知识。
