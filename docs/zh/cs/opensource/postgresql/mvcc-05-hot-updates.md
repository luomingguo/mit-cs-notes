---
title: PostgreSQL 中的 MVCC — 5. 页内清理与 HOT 更新
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 中的 MVCC — 5. 页内清理与 HOT 更新

> 原文：https://habr.com/en/companies/postgrespro/articles/483768/ （作者 Egor Rogov，PostgresPro）

前几篇讲清楚了行版本怎么产生、快照怎么判断可见性，这一篇讲的是 PostgreSQL 处理"版本膨胀"的第一道防线——不涉及完整 VACUUM 命令的**页内清理（in-page vacuum）**，以及配合它工作的一项重要优化：**HOT 更新**（Heap-Only Tuple update）。

## 常规更新过程中的页内清理

页内清理是一种轻量级、局部的空间回收机制，会在访问某个页面（读取或更新）时"顺手"触发,不需要专门发出 VACUUM 命令。

触发它的条件通常是以下两种之一：
1. 之前有一次更新曾在这个页面里找不到足够空间容纳新版本（这个"没找到空间"的情况会被记录在页头里）；
2. 页面里已使用的空间超过了 `fillfactor` 参数设定的阈值。

### fillfactor 参数

`fillfactor` 是表和索引都支持的一个存储参数，用来控制"允许填满到百分之多少"，剩下的部分作为预留空间。表的默认值是 100（完全不预留空间），索引的默认值是 90。这里预留出来的空间主要是给"更新产生的新版本"使用的，普通的 INSERT 不会去动用这部分预留空间。

页内清理的特点：只清理在任何快照下都已经不可见的（超出事件视界的）行版本；它严格局限在单个表页面内部操作，不会跨页面；它不会更新空闲空间映射（FSM）或可见性映射（VM），这两者要等到完整 VACUUM 才会更新；它会保留索引对相关行的指针引用（虽然索引条目本来就可能指向不同页面）。有个不太直观的副作用值得留意：**哪怕只是一条普通的 SELECT 查询，也可能因为顺带触发页内清理而修改页面内容**。

### 一个演示实验

```sql
CREATE TABLE hot(id integer, s char(2000)) WITH (fillfactor = 75);
CREATE INDEX hot_id ON hot(id);
CREATE INDEX hot_s ON hot(s);
```

这里 `s` 字段固定占用 2000 字节，加上头部大约共 2028 字节。75% 的 fillfactor 意味着一个 8KB 页面大约能放下 3 行左右的正常数据，剩下预留给更新用。

为了方便观察页面内部状态，原文构造了两个辅助函数，一个用于查看表页面：

```sql
CREATE FUNCTION heap_page(relname text, pageno integer)
RETURNS TABLE(ctid tid, state text, xmin text, xmax text, hhu text, hot text, t_ctid tid)
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
       CASE WHEN (t_infomask2 & 16384) > 0 THEN 't' END AS hhu,
       CASE WHEN (t_infomask2 & 32768) > 0 THEN 't' END AS hot,
       t_ctid
FROM heap_page_items(get_raw_page(relname,pageno))
ORDER BY lp;
$$ LANGUAGE SQL;
```

另一个用于查看 B-树索引页面：

```sql
CREATE FUNCTION index_page(relname text, pageno integer)
RETURNS TABLE(itemoffset smallint, ctid tid)
AS $$
SELECT itemoffset, ctid FROM bt_page_items(relname,pageno);
$$ LANGUAGE SQL;
```

插入一行并连续更新三次：

```sql
INSERT INTO hot VALUES (1, 'A');
UPDATE hot SET s = 'B';
UPDATE hot SET s = 'C';
UPDATE hot SET s = 'D';
```

由于每次更新都产生新版本，四个版本挤在同一个页面里已经超过了 fillfactor 划定的阈值（`lower: 40, upper: 64` 显示几乎没有空闲空间了）。

再执行一次更新，这次会触发页内清理：

```sql
UPDATE hot SET s = 'E';
```

结果是：三个死掉的旧版本（对应指针 (0,1)、(0,2)、(0,3)）被回收，腾出来的空间被新版本 (0,5) 占用；存活下来的版本会在页内物理挪动位置（往高地址方向靠拢），指针数组相应更新，最终整理出一块连续的空闲空间——这跟 VACUUM FULL 那种彻底重写不同,是局部的、原地的整理。

索引这边的引用会滞后：索引条目里保存的还是被回收前的行标识符，只有等到下次真正通过索引访问这一行、发现指向的位置已经"作废"时，索引才会更新自己的指针，避免以后再走冤枉路重新访问表页面确认。

## HOT 更新：绕开索引维护的优化

### 为什么"更新要改索引"是个大问题

正常情况下，只要更新触碰到了某个建了索引的字段，所有相关索引都必须跟着更新。但实际上 PostgreSQL 的默认行为是：**无论改动的是不是索引字段，只要这一行发生更新，所有索引都会被无差别地更新一遍**——这带来几个不小的成本：历史行版本的引用会不断在索引里堆积，需要后续清理；B-树索引在插入新条目时空间不够会发生"页分裂"，但删除条目时并不会自动合并回收页面，导致索引只会越长越大，不会自动收缩；索引数量越多，这种额外维护成本越是成倍叠加。

### HOT 更新的思路

针对"更新只改了没有建索引的字段"这种非常常见的情况，PostgreSQL 提供了 HOT（Heap-Only Tuple）更新优化：索引条目自始至终只保留一条，指向这一行版本链条上最早的那个版本（也就是"链头"），后续产生的新版本都通过页内的 `ctid` 链接串起来，不需要在索引里逐一登记。

行版本头部有两个专门配合这一机制的标志位：**Heap Hot Updated**（标记这一版本被后续更新替代了，需要顺着 ctid 链条继续往下找）,以及 **Heap Only Tuple**（标记这一版本本身并没有被任何索引直接引用）。

当一次索引扫描找到一个带有 Heap Hot Updated 标志的行版本时，PostgreSQL 不会就此止步，而是沿着 ctid 链条逐个往后走，对链上的每个版本分别做可见性判断,直到找到真正对当前事务可见的那一个,再把结果返回给客户端。

### 观察 HOT 链的形成

```sql
DROP INDEX hot_s;
TRUNCATE TABLE hot;
```

（先去掉一个索引，只保留 `hot_id` 这个和更新字段 `s` 无关的索引，方便观察。）

```sql
INSERT INTO hot VALUES (1, 'A');
UPDATE hot SET s = 'B');
```

此时页面里出现两个行版本：第一个 (0,1) 带有 Heap Hot Updated 标志（提示后面还有新版本）；第二个 (0,2) 带有 Heap Only Tuple 标志（表示它没有被索引直接引用）。

继续更新两次：

```sql
UPDATE hot SET s = 'C';
UPDATE hot SET s = 'D';
```

此时页面里累积了四个行版本，除了链头 (0,1) 之外，中间的 (0,2)、(0,3) 同时具备两个标志（既被更新替代了，又不是索引直接引用的对象），最后一个 (0,4) 只带 Heap Only Tuple 标志（它是当前最新版本，还没被继续更新）。

而索引这边始终只有一条记录——一直指向链头 (0,1)。这就是 HOT 优化省下的成本：无论这条链有多长，索引维护的开销都是恒定的。

需要强调的是，HOT 优化只在**改动的字段完全不涉及任何索引**时才生效，一旦触碰了任何一个建了索引的字段，这套机制自然就不适用了，只能退回普通的更新流程。

HOT 优化的性能优势主要体现在：整条链的维护都局限在单个页面内部，遍历链条时不需要跨页面 I/O。

## HOT 场景下的页内清理

这里有一个特别值得展开的场景：**HOT 链条内部的页内清理**。

面临的挑战是：HOT 链的链头指针（也就是索引直接引用的那个位置）不能随便挪动或复用，否则索引里保存的引用就失效了；但链条中间那些已经没有其他引用的旧版本，是可以被安全回收的。

解决办法是**间接寻址**：链头指针不再直接指向某个具体的行版本，而是被标记成一种"重定向"（redirect）状态，指向链条上真正应该被访问的那个位置。这样一来，索引里保存的引用（永远是那个链头指针位置）就始终有效，不需要因为页内清理而改动。

### 演示

假设页面已经因为多次更新累积了一条 HOT 链,并超过了 fillfactor 阈值：

```sql
UPDATE hot SET s = 'E';
```

触发页内清理后：中间的旧版本 (0,1)、(0,2)、(0,3) 被回收；链头 (0,1) 变成"redirect to 4"这样的重定向状态；(0,2) 被标记为完全"unused"（可复用）;新的行版本直接覆盖写入到 (0,2) 这个位置。

链条继续增长：

```sql
UPDATE hot SET s = 'F';
UPDATE hot SET s = 'G';
```

再触发一次清理：

```sql
UPDATE hot SET s = 'H';
```

这次链头的重定向目标会跟着更新（比如从"redirect to 4"变成"redirect to 5"），多个中间版本被释放为"unused"，新版本占据释放出来的空间。

可以看到，随着链条不断被清理和延伸，重定向的目标位置在不断变化，但索引始终只需要认准链头 (0,1) 这一个固定的入口，实际访问时通过重定向自动跳转到当前正确的最新起点。

## HOT 链条被打断的情况

HOT 优化并不是永远都能维持下去的。当页面里已经没有空闲空间容纳新版本，同时又有活跃的快照挡住了页内清理（前面讲过，页内清理只能回收超出事件视界的版本）,链条就没法继续留在原来的页面里,只能被迫延伸到别的页面上。

### 演示

在一个会话里开一个长事务，拍下快照，阻止页内清理生效：

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM hot;
```

另一个会话里连续更新：

```sql
UPDATE hot SET s = 'I';
UPDATE hot SET s = 'J';
UPDATE hot SET s = 'K';
```

由于长事务的快照挡着，页内清理没法回收空间，链条一直堆积。等到再来一次更新时，页面既没有空闲空间，又不能清理：

```sql
UPDATE hot SET s = 'L';
```

这次的新版本只能被放到别的页面（比如页 1）上,链条在这里被打断——原来在页 0 上的最后一个位置 (0,5) 不再是纯粹的 HOT 链接，而是直接引用页 1 上的新版本 (1,1)。而索引这时候会多出一条新记录，直接指向页 1 上的这个新版本，因为原来那条只指向页 0 链头的索引记录已经没法覆盖延伸到别的页面的部分。

结果是：索引里同时存在两条记录，一条指向原来页 0 上的链头 (0,1)（仍然有效，能通过 ctid 链一路找到 (0,5)），另一条直接指向页 1 上的 (1,1)（新的、独立的版本入口）。原本一条链维持一个索引条目的效率被打破，多出的这个索引条目会一直存在，直到未来某次 VACUUM 处理它。

## 小结与实践建议

对于那些经常更新非索引字段的表，适当调低 `fillfactor` 可以为更新预留出更多页内空间，从而更容易维持 HOT 链条不被打断，减少索引维护开销。但这是有代价的：预留的空闲空间越多，同样数据量下表占用的物理体积也越大,需要在更新性能和存储空间之间权衡。

原文特别提到，页内清理和 HOT 更新这两个机制在官方文档中几乎没有被详细记录，如果想深入了解具体实现，建议直接查阅 PostgreSQL 源码仓库里的 README.HOT 文件。

总结一下本篇的核心链条：页内清理是发生在单个页面内部、伴随普通读写操作触发的轻量级空间回收,不依赖显式 VACUUM 命令,也不更新 FSM/VM;HOT 更新是建立在页内清理之上的进一步优化,只要更新没有触碰索引字段,就可以把一整条版本链"藏"在页面内部,只用一条索引记录维护;但一旦页面空间耗尽、又有长事务挡住清理,链条就会被迫延伸到其它页面,索引条目也随之增加。理解这套机制,是后面理解完整 VACUUM 命令、以及为什么长事务会导致表膨胀的重要前提。
