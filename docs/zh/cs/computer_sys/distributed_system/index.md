---
title: 6.5840 分布式系统（Spring 2026）
course: 6.5840 分布式系统（Spring 2026）
course_id: '6.5840'
kind: system
tags: []
status: complete
---
# 6.5840 分布式系统（Spring 2026）

[6.5840 Home Page: Spring 2026 (mit.edu)](https://pdos.csail.mit.edu/6.5840/schedule.html)

## 前置课程

- 6.1810 操作系统工程
- 6.1800 计算机系统工程
- 6.1910 计算结构

## 课程介绍

6.5840 是一门核心研究生课程，包括讲座、实验、一个可选项目、中期考试和期末考试，共 12 个学分，6 个 EDPs（Engineering Design Points）

课程将介绍设计分布式系统的抽象和实现技术，主要内容包括容错、复制和一致性。课程的大部分内容是对分布式系统的案例研究进行学习和讨论。

### 实验

课程组成： 2 次 exam + 5 个 LAB，

- [Lab1： MapReduce](https://pdos.csail.mit.edu/6.824/labs/lab-mr.html)
- Lab2：K/V 服务器
- Lab3：Raft
- Lab4：KV Raft
- Lab5：Shared K/V

# Lec 1 介绍 & MapReduce

**LEC 1 (rtm):** [Introduction](https://pdos.csail.mit.edu/6.5840/notes/l01.txt)
**Preparation:** Read [MapReduce (2004)](https://pdos.csail.mit.edu/6.5840/papers/mapreduce.pdf)

[lec1.md](./lec1.md)

# Lec 2 RPC & 线程

 feb 5 **LEC 2 (fk):** [RPC and Threads](https://pdos.csail.mit.edu/6.5840/notes/l-rpc.txt), [crawler.go](https://pdos.csail.mit.edu/6.5840/notes/crawler.go), [kv.go](https://pdos.csail.mit.edu/6.5840/notes/kv.go), [vote examples](https://pdos.csail.mit.edu/6.5840/notes/condvar.tar.gz) **Preparation:** Do [Online Go tutorial](http://tour.golang.org/) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/tour-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-gointro&lec=2))

[lec2.md](./lec2.md)

# Lec 3 谷歌文件系统

- **LEC 3 (fk):** [GFS](https://pdos.csail.mit.edu/6.5840/notes/l-gfs.txt)
  **Preparation:** Read [GFS (2003)](https://pdos.csail.mit.edu/6.5840/papers/gfs.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/gfs-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-gfs&lec=3))
- https://pdos.csail.mit.edu/6.824/papers/gfs.pdf)

[lec3.md](./lec3.md)

# Lec 4 链式复制

**LEC 4 (fk):** [Chain Replication](https://pdos.csail.mit.edu/6.5840/notes/l-cr.txt)
**Preparation:** Read [CR (2004)](https://pdos.csail.mit.edu/6.5840/papers/cr-osdi04.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/cr-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-cr&lec=13))

[lec4.md](./lec4.md)

# Lec 5 Golang 模式

**LEC 5 (guest lecture):** ([Russ Cox](http://swtch.com/~rsc/) of Google/Go) [Go patterns](https://pdos.csail.mit.edu/6.5840/notes/Go-MIT6824-2026.pdf)
**Preparation:** Read [The Go Programming Language and Environment](https://cacm.acm.org/magazines/2022/5/260357-the-go-programming-language-and-environment/fulltext) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/go-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-go&lec=5))

[lec5.md](./lec5.md)

# Lec 6 Paxos

**LEC 4 (rtm):** [Paxos](https://pdos.csail.mit.edu/6.5840/notes/l-paxos.txt) [pseudo-code](https://pdos.csail.mit.edu/6.5840/notes/paxos-code.html) [FAQ](https://pdos.csail.mit.edu/6.5840/papers/paxos-faq.txt)
**Preparation:** Read [Paxos](https://pdos.csail.mit.edu/6.5840/papers/paxos-simple.pdf) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-paxos&lec=4))

[lec6.md](./lec6.md)

# Lec 7 Raft 容错

> 阅读资料：
>
> [In Search of an Understandable Consensus Algorithm](https://pdos.csail.mit.edu/6.824/papers/raft-extended.pdf)

**LEC 6 (fk):** [Fault Tolerance: Raft (1)](https://pdos.csail.mit.edu/6.5840/notes/l-raft.txt)
**Preparation:** Read [Raft (extended) (2014), to end of Section 5](https://pdos.csail.mit.edu/6.5840/papers/raft-extended.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/raft-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-raft&lec=6))

**LEC 7 (fk):** [Fault Tolerance: Raft (2)](https://pdos.csail.mit.edu/6.5840/notes/l-raft2.txt)
**Preparation:** Read [Raft (extended) (2014), Section 7 to end (but not Section 6)](https://pdos.csail.mit.edu/6.5840/papers/raft-extended.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/raft2-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-raft2&lec=7))

状态机复制、多数规则和 Raft 选举。一种流行的构建容错应用程序的方法，即主备份模式。在主备份模式中，客户端将操作发送到主节点，主节点对操作进行排序并将它们发送到备份节点。所有备份节点都执行所有的操作。如果所有节点具有相同的初始状态，并且按照相同的顺序执行相同的操作，那么由于操作是确定性的，最终状态也将是相同的。

举例来说，谷歌文件系统（GFS）中的主备份模式是一个典型的例子。在 GFS 中，操作可以是写入或附加文件等。

思考题：

- 如何实现容错？

[lec7.md](./lec7.md)

# Lec 8 一致性模型

思考题：

- 常见的一致性模型有哪些

**LEC 8 (rtm):** [Consistency and Linearizability](https://pdos.csail.mit.edu/6.5840/notes/l-linearizability.txt)
**Preparation:** [Linearizability](https://pdos.csail.mit.edu/6.5840/papers/p463-herlihy.pdf) (only through Section 3.1) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/linearizability-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-linear&lec=8))

[lec8.md](./lec8.md)

# Lec 9 Zookeeper

在没有事务的系统上，如何构建事务语义？

**LEC 9 (fk):** [Zookeeper](https://pdos.csail.mit.edu/6.5840/notes/l-zookeeper.txt)
**Preparation:** Read [ZooKeeper (2010)](https://pdos.csail.mit.edu/6.5840/papers/zookeeper.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/zookeeper-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-zookeeper&lec=9))

[lec9.md](./lec9.md)

# Lec 10 Lab 实验部分

**LEC 10 (fk):** [Q&A Lab 3A+B](https://pdos.csail.mit.edu/6.5840/notes/l-raft-QA.txt)
**Preparation:** ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-QAlab&lec=10))

[lec10.md](./lec10.md)

# Lec 11 分布式事务

> 阅读参考
>
> 《Principles of Computer design》 §9.1.5、  §9.1.6、  §9.5.2 、§9.5.3 、§9.6.4，其中两阶段锁（2PL）和两阶段提交（2PC）是最主要的。

本节主题是， 分布式事务。 简单来说， 分布式事务 = 并发控制 + 原子提交。

到目前为止，课程主要关注点在容错型的分布式系统，即多个服务器协作以呈现一个可靠的服务。但如今我们转向了性能导向的分布式系统：将数据分片（shared）分布在多个服务器上以实现并行性。这种设计在客户端每次只访问一个数据项时运作良好，但若一次操作涉及多个分片（如银行转账、社交图中的双向链接建立，或记录插入与索引更新），就必须应对失败处理与原子性问题。 涉及到原子性地更新多条记录的操作，黄金标准就是使用**事务**，往往是数据库提供，通常是两阶段锁（2PL） + Logging 实现。 当事务内涉及的记录存储在不同的位置（比如在分片存储系统），就需要用到**分布式事务**，通常需要添加两阶段提交（2PC）协议，这个思想、协议确实很有效。后面将继续遇到（Spanner 和 FaRM）。Spanner 分布式数据库领域的标杆，是 Google Cloud 基础设施的核心之一，它树立了现代云数据库的方向。

**LEC 11 (rtm):** [Distributed Transactions](https://pdos.csail.mit.edu/6.5840/notes/l-2pc.txt)
**Preparation:** Read [6.033 Chapter 9](https://ocw.mit.edu/resources/res-6-004-principles-of-computer-system-design-an-introduction-spring-2009/online-textbook/), just 9.1.5, 9.1.6, 9.5.2, 9.5.3, 9.6.3 ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/chapter9-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-chapter9&lec=11))

[lec11.md](./lec11.md)

# Lec 12 Spanner

阅读资料

[Spanner: Google’s Globally-Distributed Database, OSDI 2012](https://pdos.csail.mit.edu/6.824/papers/spanner.pdf)

对当时而言， 这篇论文是雄心勃勃。目标非常具有挑战，且用到了一下非常巧妙的做法。并且在当时在 Google 内部大量使用。

**LEC 12 (rtm):** [Spanner](https://pdos.csail.mit.edu/6.5840/notes/l-spanner.txt)
**Preparation:** Read [Spanner (2012)](https://pdos.csail.mit.edu/6.5840/papers/spanner.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/spanner-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-spanner&lec=12))

实现目标

- 跨区域分布式事务
- 一致的跨区域复制
- 通过 Paxos 复制数据

一些巧妙的想法：

- 基于 Paxos 的两阶段提交。
- 为了快速读/写事务的时钟同步。

[lec12.md](./lec12.md)

# Lec 13 乐观并发控制

**LEC 13 (fk):** [Optimistic Concurrency Control](https://pdos.csail.mit.edu/6.5840/notes/l-farm.txt)
**Preparation:** Read [FaRM (2015)](https://pdos.csail.mit.edu/6.5840/papers/farm-2015.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/farm-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-farm&lec=14))

FaRM（Fast Remote Memory）目前仍属于研究性系统（出自微软研究院），尚未投入实际生产环境。但其设计理念可能影响未来分布式系统的架构，未来或许会发展成正式产品。至于为什么很多公司（微软、谷歌、FB、雅虎等）原因发布这些论文，而不是将这些设计保密。 首先是学术使命推动，核心开发团队常由具有学术背景（如博士学位）的成员主导，他们视传播创新理念为职业使命，希望通过论文获得业界认可。然后，公开前沿研究成果可吸引顶尖人才，最后通过技术影响力建立行业标准。

[lec13.md](./lec13.md)

# Lec 14 分布式系统的形式化验证

**LEC 14 (Upamanyu Sharma):** [Verification of distributed systems](https://pdos.csail.mit.edu/6.5840/notes/l-ironfleet.txt)
**Preparation:** Read [IronFleet (2015)](https://pdos.csail.mit.edu/6.5840/papers/ironfleet.pdf) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-ironfleet&lec=15))s

# Lec 15 DynamoDB

在数据库系统课程中，学习了它的前身 Dynamo，实现了服务的高可用性，但是为了弹性的需求，出现了 SimpleDB（Amazon S3），当时由于其限制，结合两个数据库的优先设计和实践，推出了 Amazon DynamoDB。主要关注如何做到流量削峰。

阅读资料

[Amazon DynamoDB: A Scalable, Predictably  Performant, and Fully Managed NoSQL  Database Service, atc'22](https://pdos.csail.mit.edu/6.5840/papers/atc22-dynamodb.pdf)

[lec15.md](./lec15.md)

# Lec 16 缓存一致性  

阅读论文

- [Scaling Memcache at Facebook, NSDI'13](https://pdos.csail.mit.edu/6.824/papers/memcache-fb.pdf)
- 自翻译 [paper](./lec16paper.md)

**LEC 16 (rtm):** [Cache Consistency: Memcached at Facebook](https://pdos.csail.mit.edu/6.5840/notes/l-memcached.txt)
**Preparation:** Read [Memcached at Facebook (2013)](https://pdos.csail.mit.edu/6.5840/papers/memcache-fb.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/memcache-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-memcached&lec=16))

本节的阅读材料是一篇经验论文。Facebook 团队如何扩展（scale up）系统，遇到了什么问题以及如何解决这些问题。跟他们学习权衡性能、一致性和实用性的。

思考题

- 在 Facebook 的 Memcache 系统中，Section 3.3 暗示客户端在写入数据时不会从 Gutter 服务器删除相应的键，尽管客户端会尝试从普通的 Memcached 服务器删除这些键。解释一下为什么让写入客户端从 Gutter 服务器删除键会是个坏主意。

[lec16.md](./lec16.md)

# Lec 17 AWS Lambda：按需容器加载

阅读资料： [On-demand Container Loading in AWS Lambda (2023)](https://pdos.csail.mit.edu/6.824/papers/atc23-brooker.pdf)

**LEC 17 (Marc Brooker, on zoom):** [AWS Lambda](https://pdos.csail.mit.edu/6.5840/notes/mbrooker_cs_slides_2026.pdf)
**Preparation:** Read [On-demand Container Loading (2023)](https://pdos.csail.mit.edu/6.5840/papers/atc23-brooker.pdf) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-lambda&lec=17))

[lec17.md](./lec17.md)

# Lec 18 Ray

**LEC 18 (fk):** [Ray](https://pdos.csail.mit.edu/6.5840/notes/l-ray.txt)
**Preparation:** Read [Ray (2021)](https://pdos.csail.mit.edu/6.5840/papers/ray.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/ray-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-ray&lec=18))

首先，为什么要学习这篇分布式计算框架 Ray 的论文？

Ray 是现代版的 MapReduce，Spark。Ray 使用 future 高效地移动大量数据，并通过 Ownership 高效管理分布式 future，是个被广泛运用的开源项目（被 OpenAI、Anyscale 使用），并且能运用在任何规模上。

并行应用场景，需要同时具备函数式（有明确的输入输出、不维护状态）、有状态（保留上下文），并且低延迟。比如：

- 模型服务（论文 3a）。需要快速相应、客户端上传的数据量大，router 和模型副本（replica）在多次调用之间保持状态
- 在线视频处理（论文 3b）。需要帧与帧之间的连续性，即当前帧处理要考虑上一帧的信息

MapReduce 和 Spark 不适合这种类型，因为他们是批处理系统，设计为无状态的任务并行处理。不擅长保留状态、实时处理和交互式场景。

[lec18.md](./lec18.md)

# Lec 19 Fork 一致性

阅读资料： [SUNDR (2004)](https://pdos.csail.mit.edu/6.5840/papers/li-sundr.pdf)

**LEC 19 (rtm):** [Fork Consistency, SUNDR](https://pdos.csail.mit.edu/6.5840/notes/l-sundr.txt)
**Preparation:** Read [SUNDR (2004)](https://pdos.csail.mit.edu/6.5840/papers/li-sundr.pdf) (through the end of Section 3.3.2) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/sundr-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-sundr&lec=19))

我们日常信任的一些存储服务：Github、Gmail、AFS、Dropbox 等等，这些产品的公司比如 Google 或许会用心良苦，但是，不可避免地：

- 服务或软件或硬件存在漏洞，可能会被利用
- 攻击者可能猜测出服务器管理员的账密并修改软件
- 云提供商的员工可能存在腐败或者操作疏漏

关键问题：**我们是否能从不可信的服务中获得可信的存储？** 这是个难题！而且这些问题是真实存在的。

- 攻击者会破坏源码存储库，甚至可能篡改源码
- 2003 年出现过 Debian 服务器被攻破的时间
- 2011 年 SourceFroge（全球最大的开源软件仓库）遭到攻击
- 2019 年 Canonical（Ubuntu 公司）被黑客攻破

这篇论文 SUNDR 包含了一些不错的思想。

- 类似的思想出现在 Git 和区块链中
- Keybase(已经被 Zoom 收购)直接收到 SUNDR 的影响

[lec19.md](./lec19.md)

# Lec 20 比特币

> 阅读资料
>
> 中本聪的 [Bitcoin: A Peer-to-Peer Electronic Cash System](https://pdos.csail.mit.edu/6.824/papers/bitcoin.pdf)

**LEC 20 (rtm):** Peer-to-peer: [Bitcoin](https://pdos.csail.mit.edu/6.5840/notes/l-bitcoin.txt)
**Preparation:** Read [Bitcoin (2008)](https://pdos.csail.mit.edu/6.5840/papers/bitcoin.pdf), and [summary](http://www.michaelnielsen.org/ddi/how-the-bitcoin-protocol-actually-works) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/bitcoin-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-bitcoin&lec=20))

比特币：一种点对点电子现金系统。在存在拜占庭参与者的情况下能够达成共识。解决了一个看似显然不可能的问题，**完全构建在一群不可信的参与者之上，你并不知道他们是谁，其中一些必定是恶意的，然而比特币的安全性足以支撑金融交易**。主要的技术挑战：盗用他人的钱、双重支付（double spending）。

- 对比 SUNDR，相同点有：1）使用签名操作的日志；2）对日志内容达成共识等同于对状态达成共识；3）分叉（fork）是主要危险；不同点：1）会自动处理分叉
- 对比 PBFT 和 Raft：主要的不同点：1）系统是开放的/无许可的，没有专门指定的服务器。2）服务器数量未知（因此投票变得困难）。

这种共识机制新颖且有趣。 BTW， 比特币的成功是一个意外。

我们看交易的流程。首先定义几个符号表示，

- `pub(user1)`: 新拥有者的公钥。
- `H(prev)`: 该币前一次交易记录的加密哈希值。
- `sig(user2)`: 前一个拥有者的私钥对交易的签名。

然后看，交易示例，假设 X 之前已将一枚币支付给 Y：
	`T6: pub(X), ...`
	`T7: pub(Y), H(T6), sig(X)`

Y 向 Z 购买一杯咖啡并用此币支付
	Z 向 Y 发送公钥。
	Y 创建一个新交易并签名。
	`T8: pub(Z), H(T7), sig(Y)`

Y 将交易记录发送给 Z。
	确实是 `pub(Z)`
	T7 存在，哈希正确
	使用 T7 中的 `pub(Y)` 验证 T8 的 `sig(Y)` 有效
		`verify(T8, T8.sig(), T7.pub()) == ok`

Z 将咖啡交给 Y

....

[lec20.md](./lec20.md)

# Lec 21 拜占庭容错

**LEC 21 (Derek Leung):** [Byzantine Fault Tolerance](https://pdos.csail.mit.edu/6.5840/notes/l-bft.txt), [slides](https://pdos.csail.mit.edu/6.5840/notes/65840-pbft.pdf)
**Preparation:** Read [Practical BFT (1999)](https://pdos.csail.mit.edu/6.5840/papers/castro-practicalbft.pdf) ([FAQ](https://pdos.csail.mit.edu/6.5840/papers/bft-faq.txt)) ([Question](https://pdos.csail.mit.edu/6.5840/questions.html?q=q-bft&lec=21))

拜占庭容错（Byzantine Fault Tolerance，BFT）解决了一个比 Raft 更难的问题，即在存在恶意副本的情况下实现状态机复制。该算法首次将拜占庭容错算法复杂度从指数级降低到了多项式级，其可以在恶意节点不高于总数 1/3 的情况下同时保证安全性（Safety）和活性（Liveness）

虽然是目前应用并不广泛，大多数人还是依赖于预防和检测被破坏的节点，但是比特币类系统中正在复兴。

- 比特币通过工作量证明和长时间延迟来解决恶意参与者的共识问题。
- Stellar 将 PBFT 泛化用于联邦部署。
- IBM 的 Hyperledger 使用了 PBFT。

[lec21.md](./lec21.md)
