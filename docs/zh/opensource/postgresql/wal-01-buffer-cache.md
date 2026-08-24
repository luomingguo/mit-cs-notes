---
title: PostgreSQL 中的 WAL — 1. 缓冲区缓存（Buffer Cache）
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 中的 WAL — 1. 缓冲区缓存（Buffer Cache）

> 原文：https://habr.com/en/companies/postgrespro/articles/491730/ （作者 Egor Rogov，PostgresPro）

本篇是"WAL in PostgreSQL"系列的第一篇。虽然标题里没有直接出现 WAL 三个字，但它讲的是理解预写式日志之前必须先弄明白的一块基础设施——共享缓冲区缓存（shared buffer cache）。只有搞清楚数据页是如何在内存和磁盘之间流动的，才能理解为什么需要预写日志、日志又是在保护什么。

## 为什么需要预写式日志

PostgreSQL（以及绝大多数关系型数据库）把磁盘上的数据组织成固定大小的页面（page，PostgreSQL 里默认 8KB），但直接在磁盘上频繁地随机读写这些页面代价太高。于是数据库把用到的页面拷贝进内存里的一块共享区域，所有的读写操作都先在内存副本上进行，然后再异步地、择机把修改过的（"脏"的）页面刷回磁盘。

这种"先在内存里改、晚点再落盘"的策略带来了一个致命问题：如果数据库进程崩溃、操作系统崩溃或者直接断电，内存里尚未落盘的修改就会全部丢失，磁盘上的数据可能处于一种不上不下的中间状态，甚至同一个页面内部都可能出现部分写入导致的损坏。预写式日志正是为了解决这个问题而存在的——但在讲 WAL 本身之前，这篇文章先把"内存里那块共享缓存到底长什么样、怎么工作"讲透。

## 缓冲区缓存的结构

共享缓冲区缓存本质上是服务器进程间共享内存里的一个数组，数组的每个槽位称为一个缓冲区（buffer），每个缓冲区正好能装下一个 8KB 的数据页，外加一个描述该缓冲区状态的头部（header）。头部里至少记录了：

- 这个缓冲区当前装的是哪个文件、哪个块号（也就是这个页面在磁盘上的物理位置）；
- 是否是"脏页"（dirty），即内存内容是否比磁盘上的新，需要在某个时刻写回；
- 使用计数（usage count），用来估计这个页面最近有多"热"；
- 钉住计数（pin count），表示当前有多少个进程正在使用（钉住）这个缓冲区。

集群启动时所有缓冲区都是空的，通过一个链表把空闲缓冲区串起来供分配；同时维护一张哈希表，以"文件号 + 块号"为键，快速定位某个页面是否已经在缓存里、位于哪个槽位。

## 页面查找与钉住（pin）机制

当某个后端进程需要访问一个数据页时，它先用文件号和页号去哈希表里查。如果命中，说明页面已经在缓存里，进程会把该缓冲区的 pin count 加一，这个动作叫"钉住"（pin）。被钉住的缓冲区在此期间是"受保护"的——驱逐算法不会把它换出去，其他进程也不能用新内容覆盖它。一个缓冲区可以同时被多个进程钉住（比如多个会话并发读同一页）。用完之后进程会解除钉住（pin count 减一）。

如果哈希表里没有命中，说明页面不在缓存里，就需要找一个空闲或者可被驱逐的缓冲区，把目标页面从磁盘读进来，同时更新哈希表。

## 驱逐算法：时钟扫描（Clock-Sweep）

当缓存已满、又需要腾出位置装载新页面时，PostgreSQL 使用一种叫"时钟扫描"（clock-sweep）的算法来挑选被驱逐的对象，这是经典 LRU 思想的一个近似实现，避免了维护严格 LRU 链表的开销。

其原理可以想象成一个指针（"next victim"指针）在所有缓冲区上循环转圈：

1. 指针每走到一个缓冲区，先检查它的使用计数（usage count）：如果大于 0，就把它减 1，然后指针前进到下一个；
2. 如果某个缓冲区的使用计数已经是 0，并且当前没有被任何进程钉住（pin count = 0），这个缓冲区就被选中作为牺牲品；
3. 使用计数的上限被设成 5，防止热点页面的计数无限增长，导致要转很多圈才能把它降到 0，从而增加驱逐开销；
4. 如果被选中的缓冲区是脏页，必须先把它的内容写回磁盘，才能用新页面覆盖它；
5. 新页面装载进来后，使用计数被设为 1，同时该页面的位置信息被登记进哈希表，供后续查找命中。

可以看出，一个页面被访问的次数越多，它的 usage count 越高，被驱逐所需要的"圈数"也越多，这就是它模拟"最近常用页面不易被换出"的方式。

## 通过 pg_buffercache 实际观察

文章用 `pg_buffercache` 扩展直观展示了上述机制。基本操作示例：

```sql
CREATE EXTENSION pg_buffercache;

CREATE TABLE cacheme(
  id integer
) WITH (autovacuum_enabled = off);
INSERT INTO cacheme VALUES (1);
```

查看这张表在缓存里对应的缓冲区状态：

```sql
SELECT bufferid,
  CASE relforknumber
    WHEN 0 THEN 'main'
    WHEN 1 THEN 'fsm'
    WHEN 2 THEN 'vm'
  END relfork,
  relblocknumber,
  isdirty,
  usagecount,
  pinning_backends
FROM pg_buffercache
WHERE relfilenode = pg_relation_filenode('cacheme'::regclass);
```

随后再插入一行、再查询一次表内容、再执行一次 VACUUM，重复上面这条查询，可以观察到：每一次对该页面的访问（无论是写还是读）都会让 usagecount 递增（直到封顶 5），isdirty 标志在修改后变为 true、在被后台或检查点写出后又变回 false。这就是时钟扫描算法所依赖的原始数据在真实运行中的样子。

## 缓存大小的调优：shared_buffers

缓存的总大小由参数 `shared_buffers` 控制：

```sql
SELECT setting, unit FROM pg_settings WHERE name = 'shared_buffers';
```

它的默认值只有 128MB，对于生产环境来说明显偏小。修改这个参数需要重启数据库实例才能生效（因为它决定了共享内存的分配大小）。文章给出的经验起点是：将其设为机器物理内存的 1/4 左右，然后再根据实际工作负载去调优、观测。

调优的核心目标是让"热数据"（经常被访问的那部分数据）能够整体放进缓存里，减少因为缓存放不下而反复从磁盘换入换出的情况。判断缓存是否够用，可以借助如下诊断查询：

统计各个 usagecount 取值上有多少个缓冲区，观察热度分布：

```sql
SELECT usagecount, count(*)
FROM pg_buffercache
GROUP BY usagecount
ORDER BY usagecount;
```

按表统计每张表占了多少缓存、其中有多大比例是"高频使用"的（usagecount > 3）：

```sql
SELECT c.relname,
  count(*) blocks,
  round( 100.0 * 8192 * count(*) / pg_table_size(c.oid) ) "% of rel",
  round( 100.0 * 8192 * count(*) FILTER (WHERE b.usagecount > 3) / 
    pg_table_size(c.oid) ) "% hot"
FROM pg_buffercache b
  JOIN pg_class c ON pg_relation_filenode(c.oid) = b.relfilenode
WHERE  b.reldatabase IN (
         0, (SELECT oid FROM pg_database WHERE datname = current_database())
       )
AND    b.usagecount is not null
GROUP BY c.relname, c.oid
ORDER BY 2 DESC
LIMIT 10;
```

这类查询能帮助判断到底哪些表在争抢缓存空间，是调大 shared_buffers 还是优化查询本身更划算，都需要结合这样的实测数据来判断，而不是套用一个通用公式。

## 批量操作导致的"缓存冲刷"问题与缓冲区环（Buffer Ring）

如果没有特殊处理，一次扫描超大表的顺序扫描（seq scan），或者一次性导入海量数据的 COPY，会把缓存里原本装着的、真正频繁被业务访问的热数据大批量驱逐出去，换成这些只会被用一次的"一次性"数据，造成所谓的"缓存冲刷"（cache flush），严重拖累其他并发查询的性能。

为了避免这种情况，PostgreSQL 引入了缓冲区环（buffer ring）机制：对于这类批量、一次性的操作，只分配缓存里一小圈固定数量的缓冲区来循环使用，而不去触碰缓存里的其他部分。具体分配策略：

- 对超过缓存 1/4 大小的顺序扫描，只使用 32 个页面大小的缓冲区环；
- 如果同时有多个进程在扫描同一张表，后来者会直接接入已有的环，共享同一批缓冲区，然后再单独把之前错过的开头部分读一遍；
- VACUUM 同样只使用 32 页大小的环；
- COPY IN 和 CREATE TABLE AS SELECT 使用更大一些的环，2048 页，但同时受到"最多不超过缓存 1/8"这个上限的约束。

文章用一个实验做了演示：创建一张刻意占用较多页面（用较低的 fillfactor 让每行占更大空间）的表 `big`，重启数据库让缓存清空后执行顺序扫描：

```sql
CREATE TABLE big(
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  s char(1000)
) WITH (fillfactor=10);
INSERT INTO big(s) SELECT 'FOO' FROM generate_series(1,4096+1);

ANALYZE big;
SELECT relpages FROM pg_class WHERE oid = 'big'::regclass;
```

```sql
EXPLAIN (ANALYZE, COSTS OFF) SELECT count(*) FROM big;

SELECT count(*)
FROM pg_buffercache
WHERE relfilenode = pg_relation_filenode('big'::regclass);
```

结果显示，尽管这张表远超过 32 个页面，扫描完之后缓存里属于这张表的缓冲区数量却被限制住了——印证了缓冲区环起了作用。而当强制关闭顺序扫描、改用索引扫描（`SET enable_seqscan = off;`）时，由于走的是逐条随机访问路径而非批量顺序扫描逻辑，就不再触发这个限制。

## 临时表：完全不同的缓存路径

临时表（temporary table）走的是一条完全独立的路径：它们使用的是每个后端进程的私有内存缓存，而不是所有进程共享的那块缓冲区缓存。这样做的道理很直接——临时表只在创建它的那个会话里可见，不需要跨进程共享，自然也就不需要加锁保护并发访问；而且临时表的生命周期不超过所在会话，宕机后本来就该消失，完全不需要 WAL 提供的那种崩溃恢复保护。

这块私有缓存按需分配内存，其上限由参数 `temp_buffers` 控制。

## 缓存预热（Warming Up the Cache）

数据库刚重启时，缓存是空的，所有查询都要老老实实从磁盘读，性能会经历一段"预热期"。PostgreSQL 11 引入了 `pg_prewarm` 扩展来缓解这个问题，它有两种用法：

**手动预热**：直接调用函数把某张表整体读进缓存：

```sql
CREATE EXTENSION pg_prewarm;
SELECT pg_prewarm('big');
```

**自动预热（autoprewarm）**：需要把 `pg_prewarm` 加入 `shared_preload_libraries` 并重启：

```sql
ALTER SYSTEM SET shared_preload_libraries = 'pg_prewarm';
```

```bash
sudo pg_ctlcluster 11 main restart
```

开启后会启动一个 autoprewarm 主进程，它按 `pg_prewarm.autoprewarm_interval`（默认 300 秒）指定的周期，把当前缓存里都装了哪些页面的清单持久化写到磁盘上的一个文件（`autoprewarm.blocks`）；数据库下次启动时，会有一个 autoprewarm worker 进程读取这份清单，按照上次记录的内容把对应页面重新加载回缓存，从而让重启后的缓存状态尽量接近重启前，缩短预热耗时。

也可以随时手动触发一次落盘：

```sql
SELECT autoprewarm_dump_now();
```

相关参数：
- `pg_prewarm.autoprewarm`：是否启用 autoprewarm 主进程；
- `pg_prewarm.autoprewarm_interval`：清单落盘的周期（默认 300 秒）。

## 本讲小结

这一篇的核心是打地基：数据库把磁盘页面缓存到共享内存里，读写都发生在内存副本上，脏页异步刷盘；缓存用哈希表做快速查找，用钉住（pin）机制保护正在使用的页面不被驱逐；驱逐时用时钟扫描算法，通过使用计数模拟近似 LRU；批量/一次性操作通过缓冲区环隔离，避免冲刷掉真正的热数据；临时表走独立的进程本地缓存，不受 WAL 保护也不需要；缓存大小由 `shared_buffers` 控制，需要结合 `pg_buffercache` 的实测数据去调优；`pg_prewarm` 可以在重启后加速缓存恢复到工作状态。

理解了内存里"脏页何时产生、何时落盘"这套机制之后，下一篇才能真正回答：为什么脏页不能想什么时候刷就什么时候刷，为什么必须先把变更写进日志——这正是预写式日志（WAL）本身要解决的问题。
