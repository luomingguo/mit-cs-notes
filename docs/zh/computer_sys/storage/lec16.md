# Lec 16 LSM树及其应用

- [LSM-Tree](https://www.cs.umb.edu/~poneil/lsmtree.pdf)
- [Ren13](https://course.ece.cmu.edu/~ece746/papers//papers/tablefs.pdf)
  - 使用LSM-Tree存储元数据的开山之作
- [Zheng20](https://www.pdl.cmu.edu/PDL-FTP/Storage/ACMToS-0920.pdf)
  - 中文翻译 https://zhuanlan.zhihu.com/p/673943952



## 引入

试想在一个高性能事务系统的场景下，比如银行系统（TPC-A），每笔交易都会写入一条History记录，还要更新History表的索引（比如按`account_id`），如果用B树，每插入一条记录，需要找到B-tree中对应的位置（随机I/O），可能出发页分裂（为了维护B-Tree索引），从而需要修改多个节点，I/O成本翻倍；而现在介绍一种基于磁盘的数据结构，叫Log-Structured Merge-Tree（LSM-Tree），LSM-tree 的关键思想是不要每次都更新磁盘索引，而是先放到内存里，攒一批再写。优势在于LSM树大幅减少磁头移动。非常适用于写入操作远多于查询的系统，比如监控数据、时间序列数据、日志系统。

传统事务日志主要用于回滚和系统恢复，系统只需要偶尔查看最近的一小段日志，并且恢复时通常是顺序读取日志即可。但随着系统处理的业务越来越复杂、事务持续时间越来越长，用户有时需要实时查看过去发生过哪些操作。因此，为了能够快速查询大量历史日志，日志建立索引就变得越来越重要。虽然历史表和日志都包含时间序列数据，但 LSM-tree 的索引键并不假设具有完全相同的时间顺序。为了获得效率提升，唯一需要的假设是：更新的频率远高于查询的频率。

下面两个示例都依赖于 “五分钟法则”（Five Minute Rule）：如果某个磁盘页被访问得很频繁，就把它放到内存里，这样可以省掉磁盘 I/O；如果访问很少，那就没必要占用内存。如果一个磁盘页平均每 60 秒就会被访问一次（或更频繁）， 那么把它缓存到内存是划算的。为什么是 60 秒？因为这是“内存成本”和“磁盘 I/O 成本”的一个经济平衡点。所以这个规则叫“五分钟法则”（后来随着硬件变化变成约 60 秒）

EX1.1： TPC-A系统的基本I/O成本。

假设一个典型的银行交易系统，系统负载——1000TPS，每个事务做更新3个表的操作，Branch表（1000行）、Teller表（十万行）以及Account表（1亿行），在 History 表写一条记录 `(Account-ID, Branch-ID, Teller-ID, Delta, Timestamp)`，假设Branch表完全在内存，Teller表完全在内存，Account表，每行 100B，则总大小为`100M * 100B = 10GB`，1亿条记录随机访问，再次访问同一个页的间隔时间是 `10GB / 4KB(page size) / TPS = 10 M / 1K = 2500s`  > 5分钟，所以Account表不值得被缓存。

现在，每个事务大约需要 两次磁盘 I/O： 一次是 读取所需的 Account 记录所在的页（我们认为访问的页已经在缓冲区中的情况非常少，因此可以忽略）； 另一次是 将之前的一个脏的 Account 页写回磁盘，以便在缓冲区中腾出空间用于新的读取（这是系统在稳态运行时必须发生的行为）。因此，在 1000 TPS（每秒 1000 个事务） 的情况下，大约会产生 2000 次磁盘 I/O 每秒。每个磁盘臂（disk arm）每秒可以完成 25 次 I/O，那么要支持 2000 次 I/O 每秒，就需要 80 个磁盘臂（actuators）。

EX1.2： 给 History 表建立一个传统 B-tree 索引

History 表记录交易历史：

```
(Account-ID, Branch-ID, Teller-ID, Delta, Timestamp)
```

用户典型查询如下，查询某个账户最近的交易记录。

```sql
Select *
from History
where Acct-ID = ?
and Timestamp > ?
```

如果没有索引，需要扫描整个 History 表随着历史记录增长，这几乎不可能接受。所以必须建立索引：`(Acct-ID, Timestamp)`

论文假设只保留20天，每天8小时的业务时间。总记录数：

```
1000(TPS) * 3600 * 8 * 20 = 576, 000, 000 =5.76亿条记录
```

假设每条索引项是16 B，总大小就是 `576 M * 16B = 9.2GB`，页数就是`9.4GB/4KB = 230万`个叶子页。Five Minute Rule 再次出现，因为`2,300,000/ 1000(TPS) = 2300sec = 38minutes`，所以索引页不会常驻内存，结果就是磁盘需求翻倍。B-Tree对写入非常不友好。

## 两组件 LSM-tree 