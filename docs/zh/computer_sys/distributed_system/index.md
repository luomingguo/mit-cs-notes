---
sidebarDepth: 2
title: 数据库系统


sidebar: true
aside: right
editLink: true
lastUpdated: true
outline: 1
---

# 6.5840/6.824 分布式系统

[6.5840 Home Page: Spring 2025 (mit.edu)](https://pdos.csail.mit.edu/6.5840/schedule.html)

## 前置课程

- 6.1810 操作系统工程
- 6.033 计算机系统工程
- 6.1910/6.004 计算结构

## 课程介绍

6.5840 是一门核心研究生课程，包括讲座、实验、一个可选项目、中期考试和期末考试，共12个学分，6个EDPs（Engineering Design Points）

课程将介绍设计分布式系统的抽象和实现技术，主要内容包括容错、复制和一致性。课程的大部分内容是对分布式系统的案例研究进行学习和讨论。

课程组成： 2次exam + 5个LAB，

- [Lab1： MapReduce](https://pdos.csail.mit.edu/6.824/labs/lab-mr.html)
- Lab2：K/V 服务器
- Lab3：Raft
- Lab4：KV Raft
- Lab5：Shared K/V




# Lec 1 MapReduce

> 阅读资料
>
> [MapReduce: Simplified Data Processing on Large Clusters(OSDI 2004)](https://pdos.csail.mit.edu/6.824/papers/mapreduce.pdf)

这节是介绍分布式系统，以及学习案例：MapReduce。 

[lec1.md](./lec1.md)



# Lec 2 RPC & 线程

> 完成一下教程 
>
> [Online Go tutorial](http://tour.golang.org/)
>
> 阅读材料
>
> [The Go  Programming  Language and  Environment]([The Go programming language and environment (acm.org)](https://dl.acm.org/doi/pdf/10.1145/3488716))
>
> [Effective go](https://golang.org/doc/effective_go.html)



[lec2.md](./lec2.md)

# Lec 3 主从复制

本节的目标是实现系统的高可用，也就是说，即使集群内部一台机器发生故障，仍然能够提供服务。采用的方法就是复制，这是一种经典的容错技术，基本思想就是维护多份数据的副本。我们将以VMware FT(2010)作为学习案例，提供了一个 干净、极端 的主/备复制设计案例，帮助理解这些核心概念。

[lec3.md](./lec3.md)

# Lec 4 一致性 & 可串行化

[lec4.md](./lec4.md)

# Lec 5 Golang 模式

[lec5.md](./lec5.md)

# Lec 6 Raft 容错（上）

[lec6.md](./lec6.md)

# Lec 7 Raft 容错（下）

> 阅读资料：
>
> [In Search of an Understandable Consensus Algorithm](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf)



状态机复制、多数规则和Raft选举。一种流行的构建容错应用程序的方法，即主备份模式。在主备份模式中，客户端将操作发送到主节点，主节点对操作进行排序并将它们发送到备份节点。所有备份节点都执行所有的操作。如果所有节点具有相同的初始状态，并且按照相同的顺序执行相同的操作，那么由于操作是确定性的，最终状态也将是相同的。

举例来说，谷歌文件系统（GFS）中的主备份模式是一个典型的例子。在GFS中，操作可以是写入或附加文件等。

[lec7.md](./lec7.md)

# Lec 8 谷歌文件系统

GFS论文是一个经典的论文，它是第一个用于数据中心应用的分布式文件系统，比如MapReduce，并且涉及到这门课的很多内容，比如并行性能，容错，复制，一致性等等。如今GFS已经被Colossus取代，总体目标一致，但是后者提高了协调者性能和容错。 并且，在谷歌内部很多应用已经迁移到类数据库的存储系统了，比如BigTable， 和Spanner。然而，GFS的设计仍然在HDFS里面，它是Hadoop开源的MapReduce的存储系统。

阅读资料

- [The Google File System(SOSP 2003)](https://pdos.csail.mit.edu/6.824/papers/gfs.pdf)

[lec8.md](./lec8.md)

# Lec 9 Zookeeper



[lec9.md](./lec9.md)

# Lec 10 分布式事务

> 阅读参考书《Principles of Computer design》 §9.1.5、  §9.1.6、  §9.5.2 、§9.5.3 、§9.6.4，其中两阶段锁和两阶段提交是最主要的。

本节主题是， 分布式事务。 简单来说， 分布式事务 = 并发控制 + 原子提交。 前面我们主要关注**分布式系统中的容错性**，使得多台服务器看起来像是一个可靠的服务器。接下来，我们转向提升性能，通过将数据进行分片到多台服务器上，实现并行处理。当客户端只访问单个数据项时，分片效果良好，但跨分片操作会带来新的挑战，特别是在故障处理和原子性方面。我们的目标是对**应用开发者**隐藏**并发交错**和**故障**的复杂性，使其能够像在**单机环境**中一样执行操作，而不必手动处理跨分片的**一致性**和**原子性**问题

思考题：

- 描述两阶段锁比简单锁产生更高性能的情况。
- 我们如何处理网络可能导致消息重新排序的情况？
- 两阶段提交协议如何工作？ 解决了什么问题？ 需要的成本多大？
- 在两阶段提交（2PC）协议中，如果没有丢失或失败会发生什么情况？
  - 协调者向机器发送哪些消息？向客户端发送哪些消息？
  - 什么是提交点(commit point)？
- 为什么这个协议有两个阶段而不是一个？
- 2PC存在哪些性能问题？是什么原因导致这些问题？
- 2PC的变体，推定提交（Presumed Commit）/ 推定中止（Presumed Abort）作用什么？如何减少2PC的开销的？何时应该选择它，如何选择其他？



[lec10.md](./lec10.md)

# Lec 11 Lab 3A+B





# Lec 12 Spark

**LEC 15:** [Big Data: Spark](http://nil.csail.mit.edu/6.824/2022/notes/l-spark.txt), [video](https://youtu.be/qXb5rDGqFdc)
**Preparation:** Read [Spark (2012)](http://nil.csail.mit.edu/6.824/2022/papers/zaharia-spark.pdf) ([FAQ](http://nil.csail.mit.edu/6.824/2022/papers/spark-faq.txt)) ([Question](http://nil.csail.mit.edu/6.824/2022/questions.html?q=q-spark&lec=15))



Bigtable 的开源版本（如 HBase）

[lec12.md](./lec12.md)

# Lec 13 Spanner

阅读资料

[Spanner: Google’s Globally-Distributed Database, OSDI 2012](https://pdos.csail.mit.edu/6.824/papers/spanner.pdf)

对当时而言， 这篇论文是雄心勃勃。目标非常具有挑战，且用到了一下非常巧妙的做法。并且在当时在 Google 内部大量使用。

实现目标

- 跨区域分布式事务
- 一致的跨区域复制
- 通过 Paxos 复制数据

一些巧妙的想法：

- 基于 Paxos 的两阶段提交。
- 为了快速读/写事务的时钟同步。

[lec13.md](./lec13.md)

# Lec 14 乐观并发控制

[Optimistic Concurrency Control](https://pdos.csail.mit.edu/6.5840/notes/l-farm.txt), [video](https://youtu.be/07xsfL5E8Ck), [video cont.](https://youtu.be/XwU4jKhBxws)
**Preparation:** Read [FaRM (2015)](https://pdos.csail.mit.edu/6.5840/papers/farm-2015.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/farm-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-farm&lec=15))

FaRM（Fast Remote Memory）目前仍属于研究性系统（出自微软研究院），尚未投入实际生产环境。但其设计理念可能影响未来分布式系统的架构，未来或许会发展成正式产品。至于为什么很多公司（微软、谷歌、FB、雅虎等）原因发布这些论文，而不是将这些设计保密。 首先是学术使命推动，核心开发团队常由具有学术背景（如博士学位）的成员主导，他们视传播创新理念为职业使命，希望通过论文获得业界认可。然后，公开前沿研究成果可吸引顶尖人才最后，通过技术影响力建立行业标准。

[lec14.md](./lec14.md)



# Lec 15 Chardonnay



[Chardonnay](https://pdos.csail.mit.edu/6.5840/notes/l-chardonnay.txt)
**Preparation:** Read [Chardonnay (2023)](https://pdos.csail.mit.edu/6.5840/papers/osdi23-eldeeb.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/chardonnay-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-chardonnay&lec=14))

[Chardonnay: Fast and General Datacenter Transactions for On-Disk Databases, osdi23](https://www.usenix.org/system/files/osdi23-eldeeb.pdf)

[lec15.md](./lec15.md)

# Lec 16 DynamoDB

在数据库系统课程中，学习了它的前身Dynamo，实现了服务的高可用性，但是为了弹性的需求，出现了SimpleDB（Amazon S3），当时由于其限制，结合两个数据库的优先设计和实践，推出了Amazon DynamoDB。

阅读资料

[Amazon DynamoDB: A Scalable, Predictably  Performant, and Fully Managed NoSQL  Database Service, atc'22](https://pdos.csail.mit.edu/6.5840/papers/atc22-dynamodb.pdf) 



[lec16.md](./lec16.md)

# Lec 17 Ray

[Ray](https://pdos.csail.mit.edu/6.5840/notes/l-ray.txt)
**Preparation:** Read [Ray (2021)](https://pdos.csail.mit.edu/6.5840/papers/ray.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/ray-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-ray&lec=17))



[Ray, NSDI'21](https://pdos.csail.mit.edu/6.824/notes/l-ray.txt)

现代版的MapReduce，Spark；

使用future高效地移动大量数据

通过所有权高效管理分布式future

是个开源项目（被OpenAI使用）

[lec17.md](./lec17.md)

# Lec 18 缓存一致性  

重点学习Facebook团队如何扩展系统，遇到的挑战以及解决这些问题的方式。从中从性能、一致性和实用性的权衡。

阅读论文

- [Scaling Memcache at Facebook, NSDI'13](https://pdos.csail.mit.edu/6.824/papers/memcache-fb.pdf)

思考

- 在 Facebook 的 Memcache 系统中，Section 3.3 暗示客户端在写入数据时不会从 Gutter 服务器删除相应的键，尽管客户端会尝试从普通的 Memcached 服务器删除这些键。解释一下为什么让写入客户端从 Gutter 服务器删除键会是个坏主意。

[lec18.md](./lec18.md)



# Lec 19 Grove

[lec19.md](./lec19.md)

# Lec 20 AWS Lambda：按需容器加载

阅读资料

- On-demand Container Loading in AWS Lambda (2023)

[lec20.md](./lec20.md)

# Lec 21 Boki

[lec21.md](./lec21.md)

# Lec 22 分叉一致性 & SUNDR



[lec22.md](./lec22.md)

# Lec 23 比特币



[lec23.md](./lec23.md)

# Lec 24 拜占庭容错

拜占庭容错（Byzantine Fault Tolerance，BFT）解决了一个比 Raft 更难的问题，即在存在恶意副本的情况下实现状态机复制。该算法首次将拜占庭容错算法复杂度从指数级降低到了多项式级，其可以在恶意节点不高于总数1/3 的情况下同时保证安全性（Safety）和活性（Liveness）

虽然是目前应用并不广泛，大多数人还是依赖于预防和检测被破坏的节点，但是比特币类系统中正在复兴。

- 比特币通过工作量证明和长时间延迟来解决恶意参与者的共识问题。
- Stellar 将 PBFT 泛化用于联邦部署。
- IBM 的 Hyperledger 使用了 PBFT。

[lec24.md](./lec24.md)

