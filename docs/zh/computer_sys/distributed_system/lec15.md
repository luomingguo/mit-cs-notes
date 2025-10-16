# Lec 14 Chardonnay

> 阅读资料
>
> [Chardonnay: Fast and General Datacenter Transactions for On-Disk Databases, osdi'23](https://pdos.csail.mit.edu/6.5840/papers/osdi23-eldeeb.pdf)

因为人们都想要事务，但又不得不分片（shard），这就导致要用两阶段提交（2PC）。许多研究都在努力让分布式事务更快。而Chardonnay 某种程度上是对 Spanner 的回应， Spanner 的读写事务很慢，大约 14 毫秒， Spanner依赖精密的时间同步机制，Chardonnay 虽然比 FaRM 慢，但支持大规模磁盘存储，而不仅限于内存提供更高级的编程模型（表/行/列）







# 论文阅读： Chardonnay

## 摘要

在分布式磁盘DBMS中，系统通常面临两难选择——要么使用高代价的提交协议（2PC）以保证原子性，会导致分布式事务执行缓慢；要么放弃2PC，牺牲语义强度、限制编程模型或限制系统可扩展性，使这会使得系统不够**通用（general）**。我们认为，在现代数据中心中，这种权衡已经不再必要。低延迟的两阶段提交（2PC）是可以实现的（在 Azure 上基于 Paxos 的 2PC 仅约 150 $\mu$s延迟）。在有了快速 2PC 之后，许多事务的性能瓶颈就从“2PC 本身”转移到了“在持锁状态下从较慢的存储中读取数据”。

我们提出了Chardonnay： 一个可扩展的、基于磁盘的、多版本事务K/V存储系统，针对单数据中心部署进行优化，并支持快速2PC。Chardonnay 提供**通用**接口，支持在多步骤、严格可串行化的 ACID 事务中进行点查询、范围扫描和写操作。

Chardonnay 的核心机制是：在普通硬件上实现强一致性的快照读（snapshot read），并通过一种新颖的无锁读协议（lock-free read protocol）来实现。Chardonnay 利用该协议来高效地判断查询所涉及的读写集合（read-write sets），从而可以在真正执行事务之前、在获取锁之前，就透明地预取事务所需的数据。这一设计使 Chardonnay 能通过减少资源争用（contention）实现快速事务，并通过有序地请求锁来避免死锁导致的事务中止abort。