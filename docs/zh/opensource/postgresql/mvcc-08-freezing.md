# PostgreSQL 中的 MVCC — 8. 冻结（Freezing）

> 原文：https://habr.com/en/companies/postgrespro/articles/487590/ （作者 Egor Rogov，PostgresPro）

这是"PostgreSQL 中的 MVCC"系列的收官篇。前面几篇分别讲了隔离、物理存储、行版本、快照、页内清理和 VACUUM，这一篇要解决一个之前一直没细讲、但对生产环境至关重要的问题：**事务 ID 是有限的整数，用完了会发生什么，PostgreSQL 又是怎么通过"冻结"机制避免灾难的**。

## 事务 ID 回卷问题

PostgreSQL 的事务 ID 是一个 32 位整数，容量大约 40 多亿。听起来很大，但如果系统写入压力足够高（原文举例：每秒 1000 个事务），大约一个半月左右就会把这个空间耗尽。

问题是：**不能简单粗暴地把计数器归零重来**。因为整套 MVCC 可见性判断都建立在"事务 ID 大小反映了先后顺序"这个前提之上——如果直接从头开始重新编号，新事务的 ID 可能会比很多旧的、早已提交的事务 ID 还要小，直接搞乱可见性判断，让旧数据突然"消失"或者让新数据被误判成"来自未来、不可见"。

**为什么不干脆用 64 位事务 ID 从根本上避免这个问题？** 原文给出的解释是：行版本头部里 xmin 和 xmax 这两个字段目前加起来已经占了行头部（至少 23 字节）里相当大的比例，如果每个字段都从 4 字节扩到 8 字节，对所有表——尤其是那些字段本来就很少、很窄的表——都是一笔不小的额外开销，性价比不高。（原文提到 Postgres Pro Enterprise 这个商业分支实现了 64 位事务 ID，但采用的是在页面级别单独维护一个"纪元"（epoch）计数器的折中方案，而不是简单粗暴地把每行的字段都翻倍。）

### 循环式的事务 ID 模型

社区版 PostgreSQL 采取的方案是把事务 ID 当成一个**环形**结构来处理，类似钟表的表盘：任意给定一个事务 ID，以它为参照点，可以把整个编号空间分成"过去的一半"（逆时针方向）和"未来的一半"（顺时针方向）。判断两个事务谁先谁后，看的不是两个 ID 数值的绝对大小，而是它们各自的"年龄"（距离当前参照点已经过去了多少个事务）——年龄小的更"新"。

但这个环形模型本身埋了一个隐患：**旧事务的 ID 迟早会随着计数器不断前进，被"甩"到环的另一侧，从相对新的事务的视角看，反而进入了"未来的一半"**。一旦这种情况发生，原本明明是很久以前发生的旧事务，却会被误判成"尚未发生的未来事务"，导致它创建的数据被错误地判定为不可见——这在实践中会造成灾难性的数据丢失表象。

## 冻结（Freezing）：把旧数据钉死在"过去"

为了防止上面这种"旧事务被甩到未来"的错乱,PostgreSQL 的解法是:通过 VACUUM,把那些已经足够古老、状态早已稳定下来的行版本主动标记为**"冻结"**状态——具体做法是把行版本头部里表示 xmin 状态的"已提交"和"已回滚"两个 hint bit 同时置位（这个特殊的位组合专门用来表示"已冻结"）。

被冻结的行版本获得一个特殊待遇：**在任何快照下永远可见**，相当于被认定为"比任何正常数据都更古老"，处于环形模型里绝对安全、不会再被追上的过去。这样一来，冻结行版本原本占用的那个 xmin 值就可以被安全地释放出来，重新投入循环使用，而不用担心可见性判断出错。

原文特别指出：这里只需要冻结 xmin，不需要对 xmax 做类似处理——因为一旦某个行版本有了非零的 xmax（意味着它已经被删除或被更新替换掉了），它就不再是"活着"的当前版本，迟早会被 VACUUM 当作死元组直接清理掉，不需要靠冻结机制来保护它的可见性。

### 一个观察实验的搭建

原文构造了一张便于观察冻结过程的测试表和辅助函数：

```sql
CREATE TABLE tfreeze(
  id integer,
  s char(300)
) WITH (fillfactor = 10, autovacuum_enabled = off);

CREATE FUNCTION heap_page(relname text, pageno_from integer, pageno_to integer)
RETURNS TABLE(ctid tid, state text, xmin text, xmin_age integer, xmax text, t_ctid tid)
AS $$
SELECT (pageno,lp)::text::tid AS ctid,
       CASE lp_flags
         WHEN 0 THEN 'unused'
         WHEN 1 THEN 'normal'
         WHEN 2 THEN 'redirect to '||lp_off
         WHEN 3 THEN 'dead'
       END AS state,
       t_xmin || CASE
         WHEN (t_infomask & 256+512) = 256+512 THEN ' (f)'
         WHEN (t_infomask & 256) > 0 THEN ' (c)'
         WHEN (t_infomask & 512) > 0 THEN ' (a)'
         ELSE ''
       END AS xmin,
      age(t_xmin) xmin_age,
       t_xmax || CASE
         WHEN (t_infomask & 1024) > 0 THEN ' (c)'
         WHEN (t_infomask & 2048) > 0 THEN ' (a)'
         ELSE ''
       END AS xmax,
       t_ctid
FROM generate_series(pageno_from, pageno_to) p(pageno),
     heap_page_items(get_raw_page(relname, pageno))
ORDER BY pageno, lp;
$$ LANGUAGE SQL;

CREATE EXTENSION pg_visibility;
```

这里的 `(f)` 标记就代表"已冻结"状态——注意它是同时设置了"已提交"和"已回滚"这两个原本互斥的标志位组合出来的特殊含义。

原文还提到一段实现历史：PostgreSQL 9.4 之前的版本采用的是一个专门保留的特殊事务号 `FrozenTransactionId = 2` 来直接标记冻结状态；从 9.4 开始改用现在这种 hint bit 组合的方式，但原来的事务号仍然保留在字段里,方便调试时追溯。

**可见性映射的配套增强**：9.6 之前的可见性映射只有一种"全可见"（all-visible）标记，每页一个 bit；从 9.6 开始，额外增加了一个"全冻结"（all-frozen）标记位，用来记录某个页面是否所有行版本都已经完成冻结——这让后续的 VACUUM 可以直接跳过那些已经彻底冻结、不需要再检查的页面，大幅节省不必要的扫描工作。

## 决定何时冻结的三个参数

### `vacuum_freeze_min_age`：多老才够格被冻结

默认值 5000万（50,000,000）个事务。它定义了一个行版本必须"活"到多老的年龄，VACUUM 才会考虑把它冻结。这个值不能设得太低，否则会把还在频繁变动的"热"数据也强行冻结，白白增加不必要的处理开销；但也不能设得太高，否则冻结这个安全阀会被推迟得太晚，起不到应有的保护作用。

```sql
SHOW vacuum_freeze_min_age;
```

为了方便观察，原文把这个值临时调得很小：

```sql
ALTER SYSTEM SET vacuum_freeze_min_age = 1;
SELECT pg_reload_conf();
```

需要强调的是：普通 VACUUM 依然遵循可见性映射的指引，只会访问那些标记为"需要处理"的页面；那些已经全部是存活、干净数据的页面根本不会被触碰，也就不会被顺带冻结——除非触发了下面要讲的"全表冻结"条件。

### `vacuum_freeze_table_age`：多老才强制扫全表

默认值 1.5 亿（150,000,000）个事务。当一张表的 `pg_class.relfrozenxid`（表示这张表里"最老尚未冻结事务"的年龄）超过这个阈值时，VACUUM 会被强制升级成一次全表扫描，确保把表里所有该冻结、还没冻结的行版本都处理一遍，不再依赖可见性映射跳过页面。

原文补充了实现上的历史演进：在 9.6 之前，每一次这种全表冻结扫描都必须完整跑完，且不支持中途安全中断；从 9.6 开始，借助前面提到的"全冻结"标记位，可以跳过已经冻结完的页面，使得整个过程即使中途被打断，之后也能安全地从断点附近继续，容错性大大提高。

`vacuum_freeze_table_age` 和 `vacuum_freeze_min_age` 两者的差值，大致决定了"平均每隔多少个事务会触发一次全表冻结扫描"——按默认值算，大约每 1 亿个事务会有一次。

相关查询：

```sql
SELECT relfrozenxid, age(relfrozenxid) FROM pg_class WHERE relname = 'tfreeze';
```

同样为了便于演示，原文把这个阈值也调小：

```sql
ALTER SYSTEM SET vacuum_freeze_table_age = 5;
SELECT pg_reload_conf();
```

触发一次全表冻结扫描之后，`relfrozenxid` 会更新，反映出这张表里当前最老的、尚未冻结的事务号。

### `autovacuum_freeze_max_age`：兜底的强制防线

默认值 2 亿（200,000,000）个事务，理论上限是 20 亿。这是最后一道安全防线：一旦某张表里未冻结事务的年龄超过这个数值，无论其它自动清理条件是否满足，autovacuum 都会**强制**对这张表发起清理，不再理会平时那些基于死元组比例的常规判断规则。

这道防线专门用来应对几种可能导致表长期得不到正常清理的意外情况：手动关闭了 autovacuum、但又忘了自己手动跑 VACUUM；某个数据库因为长期没有活动，被 autovacuum 判定为"不活跃"而被跳过（依赖 `track_counts` 收集的活跃度统计）；纯追加型的表（只插入、没有更新删除），因为死元组比例条件永远触发不了普通清理。

如果没有这道防线，上述情况长期累积下去，理论上是有可能真的把事务 ID 空间耗尽、逼近回卷灾难的——`autovacuum_freeze_max_age` 就是防止这种极端情况发生的最后保险。

这个参数还有一个附带作用：它间接影响着 XACT（事务提交状态记录）这套结构的规模——autovacuum 完成冻结之后，会清理掉不再需要的旧事务状态段文件，控制 XACT 占用的磁盘空间。

可以针对单张表单独覆盖这个阈值（比如让某些关键表更早触发强制冻结）：

```sql
ALTER TABLE tfreeze SET (autovacuum_freeze_max_age = 100000, fillfactor = 100);
```

这个参数允许设置的最小值是 10 万（100,000）个事务。

## 手动触发冻结的几种方式

除了依赖自动机制，PostgreSQL 也提供了几种主动触发冻结的手段：

**1. `VACUUM FREEZE` 命令**：相当于临时把 `vacuum_freeze_min_age` 当成 0 来执行，无论行版本实际年龄多大，只要够资格清理就一律冻结。

**2. `VACUUM FULL` 或 `CLUSTER`**：因为这两个命令本质上是把整张表重写一遍，重写过程中所有行都会自然而然地被冻结。

**3. 命令行工具**：

```
vacuumdb --all --freeze
```

可以对整个实例批量执行带冻结选项的 VACUUM。

**4. `COPY ... WITH FREEZE`**：在数据初次批量装载时就直接把新写入的行冻结，前提是这个表必须是在**同一个事务内**刚被创建或刚被 TRUNCATE 过：

```sql
BEGIN;
TRUNCATE tfreeze;
COPY tfreeze FROM stdin WITH FREEZE;
1	FOO
2	BAR
3	BAZ
\.
COMMIT;
```

### 需要留意的两个陷阱

**隔离性上的一个例外**：被冻结的行版本"永远可见"这个特性，其实是对标准 MVCC 可见性规则的一个刻意破例——正常情况下，一行数据是否可见要看创建它的事务相对当前快照是否"已完成"，但冻结行会无视这个判断,永远直接可见。这在理论上意味着,如果 `COPY ... WITH FREEZE` 是在一个尚未提交的事务内执行的,理论上其他并发事务本不应该看到这些数据(按 Repeatable Read/Serializable 的隔离语义),但一旦这些行被冻结,可见性规则的这个例外就有可能被触发,产生轻微的隔离性偏差——不过因为 `COPY ... WITH FREEZE` 要求表必须是同一事务内新建或截断的,实际上这个例外通常不会造成可观察的问题,原文把它作为一个值得了解的理论细节提出来。

**`COPY ... WITH FREEZE` 不会更新可见性映射**：这意味着即便数据已经被冻结,第一次对这张表运行 VACUUM 时,依然得完整扫描一遍全表,才能真正建立起可见性映射,并把"全可见"的标记位正确设置到位。原文提到，这个限制预计会在 PostgreSQL 13 中得到改善。

## 系列总结

到这一篇为止，"PostgreSQL 中的 MVCC"系列完整讲完了隔离与 MVCC 相关的全部核心机制：从最初的隔离级别与异常现象，到物理存储的分支/文件/页面结构，到行版本头部字段与子事务，到快照与可见性判断、事件视界，再到页内清理、HOT 更新、完整 VACUUM、autovacuum 的自动调度，最后落到本篇的事务 ID 回卷与冻结机制。这几篇内容层层递进：前面讲的"死元组为什么能被清理"最终要靠事件视界回答，而"事务 ID 为什么不会用完"则要靠冻结机制回答——两者共同构成了 PostgreSQL 多版本并发控制能够长期稳定运行的完整闭环。

## 小结

事务 ID 是 32 位、循环使用的有限资源，MVCC 依赖"相对新旧"而非绝对数值来判断事务顺序，这意味着旧事务迟早会因为计数器不断前进而面临被"甩入未来"、导致可见性判断错乱的风险。冻结机制通过把足够古老、状态已经稳定的行版本标记为"永远可见"，把它们的 xmin 安全地请出循环编号空间，从根本上避免了这种错乱。`vacuum_freeze_min_age`、`vacuum_freeze_table_age`、`autovacuum_freeze_max_age` 这三个参数分别控制"多老才够格冻结"、"多老触发全表冻结扫描"、"多老强制无条件清理"，共同构成了一套层层递进的防线。除了依赖自动机制，`VACUUM FREEZE`、`VACUUM FULL`/`CLUSTER`、`vacuumdb --freeze`、`COPY ... WITH FREEZE` 也提供了主动介入的手段，但后者需要留意它不更新可见性映射、以及理论上的隔离性例外这两个细节。
