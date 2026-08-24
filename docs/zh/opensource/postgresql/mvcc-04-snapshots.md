---
title: PostgreSQL 中的 MVCC — 4. 快照
course: PostgreSQL 内核原理系列（中文讲解笔记）
kind: source
tags: []
status: complete
---
# PostgreSQL 中的 MVCC — 4. 快照

> 原文：https://habr.com/en/companies/postgrespro/articles/479512/ （作者 Egor Rogov，PostgresPro）

前面两篇分别讲了物理存储和行版本的具体结构，这一篇正式讲 MVCC 里"快照"（snapshot）这个核心概念：一个事务到底是怎么从满页面的多版本数据里，挑出"属于自己"的那一份一致视图的。

## 快照是什么

一个数据页面里物理上可能同时躺着同一行的好几个版本，但任何一个事务在任何一个时刻，理应只能看到其中唯一一个版本，这样才能维持一个符合 ACID 要求的、逻辑上一致的数据画面。这个"只看一个版本"的规则,就是靠快照来实现的。

快照创建的规则跟隔离级别绑定：
- **Read Committed** 下，每一条 SQL 语句执行前都会重新生成一份快照。
- **Repeatable Read / Serializable** 下，只在事务开始时生成一次快照，之后整个事务期间都沿用这同一份。

这里有个容易被误解的地方：快照**并不是物理层面的数据拷贝**，而是由几个数值型参数定义出来的一套"筛选规则"——真正的数据仍然只有一份存在页面里，快照只是决定了"该拿哪个版本给你看"。

## 元组可见性判断

判断一个具体的行版本（元组）是否属于某个快照，靠的正是它头部里的 `xmin`（创建者事务号）和 `xmax`（作废者事务号）这两个字段。核心规则可以概括为：**一个元组在某快照下可见，当且仅当创建它的事务（xmin）的变更在这个快照里可见，而作废它的事务（xmax）的变更在这个快照里不可见。**

具体展开来说，一个事务的变更对某快照"可见"，需要满足以下情形之一：
- 这个事务就是创建快照的事务本身（它当然能看到自己做过的、哪怕还未提交的修改）；
- 这个事务在快照创建之前就已经提交了；

反之，如果这个事务在快照创建时还处于活跃状态（尚未完成），或者是在快照创建之后才开始的，那么它做的修改对这份快照就是不可见的。

这套逻辑在 PostgreSQL 源码里位于 `src/backend/utils/time/tqual.c`（PostgreSQL 12 之后挪到了 `src/backend/access/heap/heapam_visibility.c`）。

### 快照的几个关键参数

一份快照实际上由这几个数值定义：
- `snapshot.xmax`：下一个"尚不存在"的事务号——大于等于它的事务，一律被认为发生在快照创建之后，因此不可见。
- `snapshot.xip`：快照创建那一刻，仍处于活跃状态（进行中）的事务号列表。
- `snapshot.xmin`：`xip` 列表里最小的那个事务号，也就是快照创建时最早的一个"仍在进行中"的事务；这个值除了是个优化手段，后面还会看到它对"事件视界"这个概念至关重要。

可见性可以概括成这样一条判断公式：某个事务号 `xid` 所做的变更，对这份快照可见，当且仅当 `snapshot.xmin <= xid < snapshot.xmax` 并且 `xid` 不在 `snapshot.xip` 列表里。

### 一个重要的实践限制

这里有一个容易被忽视但很关键的限制：**即使某个历史时刻的数据版本物理上还完好地躺在页面里，PostgreSQL 也没有办法凭空构造出一份对应那个历史时刻的快照。** 原因是 PostgreSQL 只记录了事务"开始"的相对顺序（通过事务号的递增），却并不持久化保存每个事务真正"提交"的具体时间点；当前活跃事务的状态信息只存在于共享内存的 ProcArray 结构里，一旦这些进程结束、结构被清理，历史状态也就无从查起。这也是为什么快照必须依赖"当前活跃事务列表"这种动态信息，而不能仅凭一个时间戳去构造。

（原文提到，PostgreSQL 历史上其实做过类似"闪回查询"/时间旅行查询的功能尝试，但后来被移除了，没有保留在当前版本里。）

### 一个完整的例子

假设有三行数据，插入的时机各不相同：第一行由一个在快照创建之前开始、但在快照创建之后才提交的事务插入；第二行由一个在快照创建之前就已经提交的事务插入；第三行由一个在快照创建之后才开始的事务插入。

```sql
TRUNCATE TABLE accounts;
BEGIN;
INSERT INTO accounts VALUES (1, '1001', 'alice', 1000.00);
SELECT txid_current();
-- 3695
```

（这个事务先不提交，挂起。）

```sql
-- 另一个会话：
BEGIN;
INSERT INTO accounts VALUES (2, '2001', 'bob', 100.00);
SELECT txid_current();
-- 3696
COMMIT;
```

在这之后（第一个事务仍未提交），第三个会话开启一个 Repeatable Read 事务并查询：

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT xmin, xmax, * FROM accounts;
--  xmin | xmax | id | number | client | amount
-- ------+------+----+--------+--------+--------
--  3696 |    0 |  2 | 2001   | bob    | 100.00
```

此刻只看到 3696 这一行，因为 3695 那个事务还没提交，对新快照不可见。接着，再开一个事务插入第三行并提交：

```sql
BEGIN;
INSERT INTO accounts VALUES (3, '2002', 'bob', 900.00);
SELECT txid_current();
-- 3697
COMMIT;
```

回到第三个会话（快照已经固定），再查一次：

```sql
SELECT xmin, xmax, * FROM accounts;
-- 结果不变，还是只有 3696 那一行
```

可以直接打印出这个快照的内部表示：

```sql
SELECT txid_current_snapshot();
-- 3695:3697:3695
```

格式是 `snapshot.xmin : snapshot.xmax : snapshot.xip`——这里 3695 同时是 xmin，也是活跃列表 xip 里的唯一成员。

现在如果在一个新的、看得到所有数据的快照下查询（比如新起一个事务）：

```sql
SELECT xmin, xmax, * FROM accounts ORDER BY id;
--  xmin | xmax | id | number | client | amount
-- ------+------+----+--------+--------+---------
--  3695 |    0 |  1 | 1001   | alice  | 1000.00
--  3696 |    0 |  2 | 2001   | bob    |  100.00
--  3697 |    0 |  3 | 2002   | bob    |  900.00
```

三行都存在，但对之前那个固定住的快照来说：第一行（3695）不可见，因为 3695 在那份快照的活跃列表里；第二行（3696）可见，因为 3696 落在 `[xmin, xmax)` 区间内且不在活跃列表里；第三行（3697）不可见，因为 3697 已经超出了快照的 xmax 上界。

## 事务看自己的修改：cmin 和 cmax

还有一个更精细的问题：一个事务在它自己内部执行的多条语句之间，该怎么看待"自己刚刚做过的修改"？有些场景需要非常精细的控制——比如一个提前打开的游标（cursor），不应该看到这个事务后来才执行的新插入操作，即便这些插入是在同一个事务内部发生的。

解决办法是在行版本头部里再引入一对伪列：`cmin`（记录这一行是在本事务内第几条命令时被插入的）和 `cmax`（记录第几条命令时被删除的）。有一个空间优化：这两者实际上共用同一个存储字段（因为"同一行在同一事务里先插入又被删除"这种情况很少见）；万一真的碰上这种少见的情况，PostgreSQL 会退化使用一个特殊的 combo command ID，具体的 cmin/cmax 值则由后端进程自己额外维护。

用游标演示这个机制：

```sql
BEGIN;
SELECT txid_current();
-- 3698
INSERT INTO accounts(id, number, client, amount) VALUES (4, 3001, 'charlie', 100.00);
```

```sql
SELECT xmin, CASE WHEN xmin = 3698 THEN cmin END cmin, * FROM accounts;
-- 第 4 行：xmin=3698, cmin=0
```

打开一个游标：

```sql
DECLARE c CURSOR FOR SELECT count(*) FROM accounts;
```

游标打开之后，再插入一行：

```sql
INSERT INTO accounts(id, number, client, amount) VALUES (5, 3002, 'charlie', 200.00);
```

```sql
FETCH c;
--  count
-- -------
--      4
```

游标看到的行数是 4，而不是 5——因为游标的快照只认 `cmin < 1` 的行，第二次插入的行 `cmin=1` 被排除在外。事后再直接查询会看到全部两行：

```sql
SELECT xmin, CASE WHEN xmin = 3698 THEN cmin END cmin, * FROM accounts;
-- 第 4 行 cmin=0，第 5 行 cmin=1
ROLLBACK;
```

## 事件视界（Event Horizon）

`snapshot.xmin` 这个参数还有另一层重要含义：它划出了一条**事件视界**——比这个值更早的事务，一律被认为已经彻底完成，任何事务从此往后再看数据时，都只会看到"当前活跃版本"，不会再需要回看更早的历史版本。

这里的逻辑是：那些已经被作废、但仍然物理保留在页面里的"死元组"（dead tuple），之所以还不能被清理掉，唯一的原因是：可能还有某个尚未结束的老快照，需要靠它来正确判断可见性。一旦所有活跃快照的 `xmin` 都已经越过了某个死元组产生的时间点，这个死元组就再也不会被任何人需要——这正是后面 VACUUM 能够安全回收空间的理论依据。

数据库级别的事件视界，取值方式是：把当前所有活跃快照各自的 `xmin` 都收集起来，取其中最小的那个。这意味着：只要还有一个事务 held 着一份很老的快照，哪怕它跟大部分表毫无交集，也会拖住整个数据库的事件视界——那些本该被清理的死元组依然清不掉，这跟具体哪张表、哪些数据无关，因为事件视界是全局共享的一个概念。

```sql
BEGIN;
SELECT backend_xmin FROM pg_stat_activity WHERE pid = pg_backend_pid();
-- backend_xmin: 3699
```

值得强调的是：即使一个 Read Committed 事务本身已经没有"持续持有"某一份固定快照（因为它每条语句都重新拍快照），只要这个事务本身还没结束（没有 COMMIT/ROLLBACK），它依然会拖住事件视界：

```sql
-- 另一会话执行了一次更新并提交
UPDATE accounts SET amount = amount + 1.00;
COMMIT;

-- 回到原会话，事务仍未结束：
SELECT backend_xmin FROM pg_stat_activity WHERE pid = pg_backend_pid();
-- 仍是 3699，没有前进
```

只有当这个事务真正提交之后，`backend_xmin` 才会前移：

```sql
COMMIT;
SELECT backend_xmin FROM pg_stat_activity WHERE pid = pg_backend_pid();
-- 3700
```

### 两个相关的保护性参数（PostgreSQL 9.6+）

**`old_snapshot_threshold`**：限定一份快照最长能存活多久。一旦超过这个时限，PostgreSQL 就有权把相关的死元组清理掉——即便理论上那份老快照仍然"想要"看到它们。如果一个长事务真的因此需要访问已经被清理掉的旧版本，就会收到 `snapshot too old` 报错。这本质上是用"牺牲极端长事务的正确性"来换取"避免表无限膨胀"。

**`idle_in_transaction_session_timeout`**：限定一个事务处于"空闲"（已经开始但迟迟不发下一条语句）状态的最长时间，超时后这个事务会被自动终止——防止应用忘记提交/回滚而无限期拖住事件视界。

## 快照的导出与导入

有些场景需要多个并发的事务看到**完全相同**的一份数据快照，比如并行执行的 `pg_dump` 备份——多个并行工作进程各自单独开一个事务、各自单独拍一份快照是没法保证数据一致的，因为快照拍摄的时间点会有细微差异。

为此 PostgreSQL 提供了快照导出/导入的功能。

**导出**：

```sql
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT count(*) FROM accounts;  -- 任意一条查询，触发快照生成
-- count: 3
SELECT pg_export_snapshot();
-- pg_export_snapshot: 00000004-00000E7B-1
```

**导入**（在另一个会话里）：

```sql
DELETE FROM accounts;
BEGIN ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION SNAPSHOT '00000004-00000E7B-1';
SELECT count(*) FROM accounts;
-- count: 3
```

即便原表数据已经被 DELETE 清空，导入了这份快照的事务依然能看到导出那一刻的 3 行数据——这正是快照导入的价值所在：让多个独立事务对齐到完全一样的时间点。

导出的快照只在导出它的那个事务仍然存活期间有效，一旦导出事务结束，这份快照就失效了：

```sql
COMMIT;  -- 导入方先提交
COMMIT;  -- 导出方随后提交
```

使用快照导入有两个限制：必须在目标事务执行第一条查询**之前**就设置好；且目标事务的隔离级别必须是 Repeatable Read 或 Serializable（Read Committed 每条语句都重新拍快照，没法固定使用某一份导入的快照）。

## 本讲小结

快照本质上是一组数值参数（xmin/xmax/xip），而不是数据的物理拷贝，通过和每个行版本头部的 xmin/xmax 比对，就能推算出这份快照该看到哪个版本。事务自身在语句间的可见性由 cmin/cmax 精细控制。`snapshot.xmin` 定义的事件视界，是理解后续 VACUUM 为什么能安全回收空间、以及长事务为什么会导致表膨胀的关键概念——这也是本系列后续讨论页内清理、VACUUM、Autovacuum 时反复会用到的核心机制。快照导出/导入功能则解决了多个独立事务需要对齐到同一数据视图的实际工程问题。
