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



### 实验

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

思考题：

- RPC的常见陷阱有哪些？

[lec2.md](./lec2.md)

# Lec 3 主从复制

本节的目标是实现系统的高可用，也就是说，即使集群内部一台机器发生故障，仍然能够提供服务。采用的方法就是复制，这是一种经典的容错技术，基本思想就是维护多份数据的副本。我们将以VMware FT(2010)作为学习案例，提供了一个 干净、极端 的主/备复制设计案例，帮助理解这些核心概念。

思考题：

- 

[lec3.md](./lec3.md)

# Lec 4 一致性模型

思考题：

- 常见的一致性模型有哪些

[lec4.md](./lec4.md)

# Lec 5 Golang 模式

[lec5.md](./lec5.md)



# Lec 6 Raft 容错

> 阅读资料：
>
> [In Search of an Understandable Consensus Algorithm](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf)



状态机复制、多数规则和Raft选举。一种流行的构建容错应用程序的方法，即主备份模式。在主备份模式中，客户端将操作发送到主节点，主节点对操作进行排序并将它们发送到备份节点。所有备份节点都执行所有的操作。如果所有节点具有相同的初始状态，并且按照相同的顺序执行相同的操作，那么由于操作是确定性的，最终状态也将是相同的。

举例来说，谷歌文件系统（GFS）中的主备份模式是一个典型的例子。在GFS中，操作可以是写入或附加文件等。

思考题：

- 如何实现容错？

[lec6.md](./lec6.md)

# Lec 8 谷歌文件系统

GFS论文是一个经典的论文，它是第一个用于数据中心应用的分布式文件系统，比如MapReduce，并且涉及到这门课的很多内容，比如并行性能，容错，复制，一致性等等。如今GFS已经被Colossus取代，总体目标一致，但是后者提高了协调者性能和容错。 并且，在谷歌内部很多应用已经迁移到类数据库的存储系统了，比如BigTable， 和Spanner。然而，GFS的设计仍然在HDFS里面，它是Hadoop开源的MapReduce的存储系统。

阅读资料

- [The Google File System(SOSP 2003)](https://pdos.csail.mit.edu/6.824/papers/gfs.pdf)

[lec8.md](./lec8.md)

# Lec 9 Zookeeper

在没有事务的系统上，如何构建事务语义？

[lec9.md](./lec9.md)

# Lec 10 分布式事务

> 阅读参考
>
> 《Principles of Computer design》 §9.1.5、  §9.1.6、  §9.5.2 、§9.5.3 、§9.6.4，其中两阶段锁（2PL）和两阶段提交（2PC）是最主要的。

本节主题是， 分布式事务。 简单来说， 分布式事务 = 并发控制 + 原子提交。

到目前为止，课程主要关注点在容错型的分布式系统，即多个服务器协作以呈现一个可靠的服务。但如今我们转向了性能导向的分布式系统：将数据分片（shared）分布在多个服务器上以实现并行性。这种设计在客户端每次只访问一个数据项时运作良好，但若一次操作涉及多个分片（如银行转账、社交图中的双向链接建立，或记录插入与索引更新），就必须应对失败处理与原子性问题。 涉及到原子性地更新多条记录的操作，黄金标准就是使用**事务**，往往是数据库提供，通常是两阶段锁（2PL） + Logging实现。 当事务内涉及的记录存储在不同的位置（比如在分片存储系统），就需要用到**分布式事务**，通常需要添加两阶段提交（2PC）协议，这个思想、协议确实很有效。后面将继续遇到（Spanner和FaRM）。Spanner 分布式数据库领域的标杆，是Google Cloud基础设施的核心之一，它树立了现代云数据库的方向。



[lec10.md](./lec10.md)

# Lec 11 Lab 实验部分



**Lab4**

You should review the [extended Raft paper](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf), in particular Section 7 (but not 8). For a wider perspective, have a look at Chubby, Paxos Made Live, Spanner, Zookeeper, Harp, Viewstamped Replication, and [Bolosky et al.](http://static.usenix.org/event/nsdi11/tech/full_papers/Bolosky.pdf)

# Lec 12 Spark（Skipped）

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

FaRM（Fast Remote Memory）目前仍属于研究性系统（出自微软研究院），尚未投入实际生产环境。但其设计理念可能影响未来分布式系统的架构，未来或许会发展成正式产品。至于为什么很多公司（微软、谷歌、FB、雅虎等）原因发布这些论文，而不是将这些设计保密。 首先是学术使命推动，核心开发团队常由具有学术背景（如博士学位）的成员主导，他们视传播创新理念为职业使命，希望通过论文获得业界认可。然后，公开前沿研究成果可吸引顶尖人才，最后通过技术影响力建立行业标准。

[lec14.md](./lec14.md)



# Lec 15 Chardonnay



[Chardonnay](https://pdos.csail.mit.edu/6.5840/notes/l-chardonnay.txt)
**Preparation:** Read [Chardonnay (2023)](https://pdos.csail.mit.edu/6.5840/papers/osdi23-eldeeb.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/chardonnay-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-chardonnay&lec=14))

[Chardonnay: Fast and General Datacenter Transactions for On-Disk Databases, osdi23](https://www.usenix.org/system/files/osdi23-eldeeb.pdf)

[lec15.md](./lec15.md)

# Lec 16 DynamoDB

在数据库系统课程中，学习了它的前身Dynamo，实现了服务的高可用性，但是为了弹性的需求，出现了SimpleDB（Amazon S3），当时由于其限制，结合两个数据库的优先设计和实践，推出了Amazon DynamoDB。主要关注如何做到流量削峰。

阅读资料

[Amazon DynamoDB: A Scalable, Predictably  Performant, and Fully Managed NoSQL  Database Service, atc'22](https://pdos.csail.mit.edu/6.5840/papers/atc22-dynamodb.pdf) 



[lec16.md](./lec16.md)

# Lec 17 Ray

> 阅读资料
>
> [Ownership: A Distributed Future System For Fine-Grained Tasks, nsdi'21](https://pdos.csail.mit.edu/6.5840/papers/ray.pdf)

首先，为什么要学习这篇分布式计算框架Ray的论文？

Ray是现代版的MapReduce，Spark。Ray使用future高效地移动大量数据，并通过Ownership高效管理分布式future，是个被广泛运用的开源项目（被OpenAI、Anyscale使用），并且能运用在任何规模上。

并行应用场景，需要同时具备函数式（有明确的输入输出、不维护状态）、有状态（保留上下文），并且低延迟。比如：

- 模型服务（论文3a）。需要快速相应、客户端上传的数据量大，router 和模型副本（replica）在多次调用之间保持状态
- 在线视频处理（论文3b）。需要帧与帧之间的连续性，即当前帧处理要考虑上一帧的信息

MapReduce 和 Spark 不适合这种类型，因为他们是批处理系统，设计为无状态的任务并行处理。不擅长保留状态、实时处理和交互式场景。

[lec17.md](./lec17.md)

# Lec 18 缓存一致性  

阅读论文

- [Scaling Memcache at Facebook, NSDI'13](https://pdos.csail.mit.edu/6.824/papers/memcache-fb.pdf)
- 自翻译 [paper](./lec18paper.md)

本节的阅读材料是一篇经验论文。Facebook团队如何扩展（scale up）系统，遇到了什么问题以及如何解决这些问题。跟他们学习权衡性能、一致性和实用性的。

思考题

- 在 Facebook 的 Memcache 系统中，Section 3.3 暗示客户端在写入数据时不会从 Gutter 服务器删除相应的键，尽管客户端会尝试从普通的 Memcached 服务器删除这些键。解释一下为什么让写入客户端从 Gutter 服务器删除键会是个坏主意。

[lec18.md](./lec18.md)



# Lec 19 Grove

阅读资料： [Grove: a Separation-Logic Library for Verifying Distributed Systems, SOSP'23](https://pdos.csail.mit.edu/6.824/papers/grove.pdf)

（TODO） 形式化验证分布式系统

[lec19.md](./lec19.md)

# Lec 20 AWS Lambda：按需容器加载

阅读资料： [On-demand Container Loading in AWS Lambda (2023)](https://pdos.csail.mit.edu/6.824/papers/atc23-brooker.pdf)

（TODO）

[lec20.md](./lec20.md)

# Lec 21 Boki（Skipped）

[lec21.md](./lec21.md)

# Lec 22 Fork一致性

阅读资料： [SUNDR (2004)](https://pdos.csail.mit.edu/6.5840/papers/li-sundr.pdf)

我们日常信任的一些存储服务：Github、Gmail、AFS、Dropbox等等，这些产品的公司比如Google或许会用心良苦，但是，不可避免地：

- 服务或软件或硬件存在漏洞，可能会被利用
- 攻击者可能猜测出服务器管理员的账密并修改软件
- 云提供商的员工可能存在腐败或者操作疏漏

关键问题：**我们是否能从不可信的服务中获得可信的存储？** 这是个难题！而且这些问题是真实存在的。

- 攻击者会破坏源码存储库，甚至可能篡改源码
- 2003年出现过Debian服务器被攻破的时间
- 2011年SourceFroge（全球最大的开源软件仓库）遭到攻击
- 2019年Canonical（Ubuntu公司）被黑客攻破

这篇论文SUNDR包含了一些不错的思想。

- 类似的思想出现在Git和区块链中
- Keybase(已经被Zoom收购)直接收到SUNDR的影响

[lec22.md](./lec22.md)

# Lec 23 比特币

> 阅读资料
>
> 中本聪的 [Bitcoin: A Peer-to-Peer Electronic Cash System](https://pdos.csail.mit.edu/6.824/papers/bitcoin.pdf)

比特币：一种点对点电子现金系统。在存在拜占庭参与者的情况下能够达成共识。解决了一个看似显然不可能的问题，**完全构建在一群不可信的参与者之上，你并不知道他们是谁，其中一些必定是恶意的，然而比特币的安全性足以支撑金融交易**。主要的技术挑战：盗用他人的钱、双重支付（double spending）。

- 对比SUNDR，相同点有：1）使用签名操作的日志；2）对日志内容达成共识等同于对状态达成共识；3）分叉（fork）是主要危险；不同点：1）会自动处理分叉
- 对比PBFT和Raft：主要的不同点：1）系统是开放的/无许可的，没有专门指定的服务器。2）服务器数量未知（因此投票变得困难）。

这种共识机制新颖且有趣。 BTW， 比特币的成功是一个意外。

我们看交易的流程。首先定义几个符号表示，

- `pub(user1)`: 新拥有者的公钥。
- `H(prev)`: 该币前一次交易记录的加密哈希值。
- `sig(user2)`: 前一个拥有者的私钥对交易的签名。

然后看，交易示例，假设X之前已将一枚币支付给Y：
  `T6: pub(X), ...`
  `T7: pub(Y), H(T6), sig(X)`

Y 向 Z 购买一杯咖啡并用此币支付
  Z向Y发送公钥。
  Y创建一个新交易并签名。
  `T8: pub(Z), H(T7), sig(Y)`

Y将交易记录发送给Z。
  确实是 `pub(Z)`
  T7 存在，哈希正确
  使用 T7 中的 `pub(Y)` 验证 T8 的 `sig(Y)` 有效
    `verify(T8, T8.sig(), T7.pub()) == ok`

Z 将咖啡交给 Y

....

[lec23.md](./lec23.md)

# Lec 24 拜占庭容错

拜占庭容错（Byzantine Fault Tolerance，BFT）解决了一个比 Raft 更难的问题，即在存在恶意副本的情况下实现状态机复制。该算法首次将拜占庭容错算法复杂度从指数级降低到了多项式级，其可以在恶意节点不高于总数1/3 的情况下同时保证安全性（Safety）和活性（Liveness）

虽然是目前应用并不广泛，大多数人还是依赖于预防和检测被破坏的节点，但是比特币类系统中正在复兴。

- 比特币通过工作量证明和长时间延迟来解决恶意参与者的共识问题。
- Stellar 将 PBFT 泛化用于联邦部署。
- IBM 的 Hyperledger 使用了 PBFT。

[lec24.md](./lec24.md)

