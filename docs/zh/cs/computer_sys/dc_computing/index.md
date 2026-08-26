---
title: 数据中心计算
type: course
course: 6.S984 数据中心计算
course_id: '6.S984'
tags: []
status: complete
titleTemplate: 公开课
description: Ron的计算机课堂
layout: doc
---
# 6.S984 数据中心计算
## 先行条件
6.191 Computation Structures
## 课程内容
仓库规模的数据中心承载了广泛的在线服务，包括云计算、社交网络、网页搜索、视频流和软件即服务。在本课程中，我们将研究现代数据中心的硬件、系统软件和分布式系统技术。我们还将探讨一些跨领域的问题，如总拥有成本、服务水平目标、可用性和可靠性。课程将结合讲座和论文阅读。学生每个主题将阅读最多两篇论文并提交简要摘要

阅读论文时，思考以下问题:
- 这篇论文试图解决什么问题？这个问题有多现实？
- 关键思想: 解决方案中的主要思想是什么？新颖性: 与之前的工作有何不同？是一个新问题，一个新解决方案，还是一个现有问题的新环境？
- 批评: 你会对解决方案做出什么改变？你对作者呈现或评估解决方案的方式有何看法？

### 参考书

"[**The Datacenter as a Computer: An Introduction to the Design of Warehouse-Scale Machines, Second Edition**](http://www.morganclaypool.com/doi/abs/10.2200/S00516ED2V01Y201306CAC024)", Luiz André Barroso, Jimmy Clidaras, Urs Hölzle. Morgan & Claypool Publishers

## 主题

- 介绍
- 数据中心硬件
- 功耗管理
- 硬件架构
- 能源 & 功耗
- 数据中心存储
- 可靠性
- 数据中心网络
- 应用架构
- 无服务器计算
- 微服务
- 性能分析
- 尾时延
- 安全和隐私
- 监控
- 性能 Debugging
- 低时延服务管理
- 数据中心管理
- 在系统方面的机器学习（skip）
- 集群管理

# Lec 1 介绍

[The datacenter as a computer](https://pages.cs.wisc.edu/~shivaram/cs744-readings/dc-computer-v3.pdf) (BCH chapters 1, 2)

[lec1.md](./lec1.md)

# Lec 2 数据中心硬件

**Datacenter hardware (**[**slides**](https://drive.google.com/file/d/1wBbrzlaKfAVRQ2yhgkRFD4gQcDsooB_5/view?usp=share_link)**)**

[lec2.md](./lec2.md)

# Lec 3 电源管理

**阅读内容**

- Barroso & Hoelzle: chapter 4 and 5
- (optional) Hennessy & Patterson: A Quantitative: Approach Ch. 1.5 and 6.6

[lec3.md](./lec3.md)

# Lec 4 硬件架构

[A Reconfigurable Fabric for Accelerating Large-Scale Datacenter Services](http://dl.acm.org/citation.cfm?id=2665678)

[Architecting to Achieve a Billion RPS Throughput on a Single Key-Value Store Server Platform](http://dl.acm.org/citation.cfm?id=2750416)

[lec4.md](./lec4.md)

# Lec 5 能源 & 动力

[Heracles: improving resource efficiency at scale](http://dl.acm.org/citation.cfm?id=2749475)

[Towards Energy Proportionality for Large-Scale Latency-Critical Workloads](https://web.stanford.edu/~kozyraki/publications/2014.pegasus.isca.pdf)

# Lec 6 数据中心存储

[Pocket: Elastic Ephemeral Storage for Serverless Analytics](https://www.usenix.org/system/files/osdi18-klimovic.pdf)

[The Google File System](http://dl.acm.org/citation.cfm?id=945450)

[lec6.md](./lec6.md)

# Lec 7 可实现性

**Reliability (**[**slides**](https://drive.google.com/file/d/1-9qXl09EgO687aYd55WyBBxZuimznzI7/view?usp=share_link)**)**

(Lecture notes, BCH chapter 7)

# Lec 8 数据中心网络

[Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network, SIGCOMM ’15](http://dl.acm.org/citation.cfm?id=2787508)

- 这篇论文探讨了 Google 数据中心网络中的 Clos 拓扑结构及其十年来的发展和集中控制

[Azure Accelerated Networking: SmartNICs in the Public Cloud](https://www.usenix.org/node/211250)

- 问题是如何在公共云中实现高效、低延迟的网络性能。云计算服务需要支持大量的数据传输和多租户环境，而传统的网络架构和软件栈在性能和延迟上都有瓶颈，无法满足快速增长的需求

[lec8.md](./lec8.md)

# Lec 9 应用框架

[Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing]([nsdi12-final138.pdf (usenix.org)](https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final138.pdf))

俗称 RDD，奠定了 Spark 的理论基础。

集群计算框架：比如 MapReduce，这种抽象让用户在不用考虑任务调度和容错的前提下，使用一系列高级的操作进行并行计算，但是缺少对分布式内存的抽象。在不同计算阶段之间重用数据（如，在两个 MapReduce 的 job 之间）的唯一方式是将其写入外部稳定存储系统中，如，分布式文件系统。它们没有提供更加通用的数据重用的抽象。

[X-Stream: edge-centric graph processing using streaming partitions, SOSP'13](https://dl.acm.org/doi/10.1145/2517349.2522740)

X-Stream 是在共享存储机器上既能处理存放于外存，又能处理存放于内存的图数据

[lec9.md](./lec9.md)

# Lec 10 无服务器计算

[Occupy the Cloud: Distributed Computing for the 99%](https://arxiv.org/pdf/1702.04024.pdf)

[ExCamera -- Encoding, Fast and Slow: Low-Latency Video Processing Using Thousands of Tiny Threads](https://www.usenix.org/system/files/conference/nsdi17/nsdi17-fouladi.pdf)

[lec10.md](./lec10.md)

# Lec 11 微服务

> 阅读资料
>
> - [Introduction to microservices, 2015, blog](https://www.nginx.com/blog/introduction-to-microservices/)
>
> - [An Open-Source Benchmark Suite for Microservices and Their Hardware-Software Implications for Cloud and Edge Systems, ASPLOS‘19](http://www.csl.cornell.edu/~delimitrou/papers/2019.asplos.microservices.pdf)

[lec11.md](./lec11.md)

# Lec 12  性能分析

阅读资料

- [Profiling a Warehouse-Scale Computer](https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/44271.pdf)

- [CPI2: CPU performance isolation for shared compute clusters](https://john.e-wilkes.com/papers/2013-EuroSys-CPI2.pdf)

[lec12.md](./lec12.md)

# Lec 13 长尾延迟

阅读资料

- [The Tail at Scale, 13, magazine](http://dl.acm.org/citation.cfm?id=2408794)

- [IX: a protected dataplane operating system for high throughput and low latency](http://dl.acm.org/citation.cfm?id=2685053)

[lec13.md](./lec13.md)

# Lec 14 安全和隐私

[CryptDB: Protecting Confidentiality with Encrypted Query Processing](https://people.csail.mit.edu/nickolai/papers/popa-cryptdb.pdf)

[Hey, You, Get Off of My Cloud: Exploring Information Leakage in Third-Party Compute Clouds](https://cseweb.ucsd.edu/~hovav/dist/cloudsec.pdf)

[lec14.md](./lec14.md)

# Lec 15 监控

[Dapper, a Large-Scale Distributed Systems Tracing Infrastructure， google'10](https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf)

[The Mystery Machine: End-to-end Performance Analysis of Large-scale Internet Services, osdi'14 ](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-chow.pdf)

[lec15.md](./lec15.md)

# Lec 16 性能 debugging

[X-Trace: A Pervasive Network Tracing Framework ](https://www.usenix.org/conference/nsdi-07/x-trace-pervasive-network-tracing-framework)

[Sage: Practical & Scalable ML-Driven Performance Debugging in Microservices](https://www.csl.cornell.edu/~delimitrou/papers/2021.asplos.sage.pdf)

[lec16.md](./lec16.md)

# Lec 17 低时延服务管理

[Retail: Opting for Learning Simplicity to Enable QoS-Aware Power Management in the Cloud](https://www.csl.cornell.edu/~delimitrou/papers/2022.hpca.retail.pdf)

[Caladan: Mitigating Interference at Microsecond Timescales, osdi20](https://www.usenix.org/system/files/osdi20-fried.pdf)

- [上交大 IPADS 团队有见解](https://zhuanlan.zhihu.com/p/528042114)

# Lec 18 数据中心管理

**Datacenter management (**[**slides**](https://drive.google.com/file/d/18eTsPov56u5gxUoF0T-C5ZuuKCF0iZlr/view?usp=share_link)**)**

[lec18.md](./lec18.md)

# Lec 19 集群调度

[Sparrow: distributed, low latency scheduling, SOSP'13](http://dl.acm.org/citation.cfm?id=2522716)

[Shinjuku: Preemptive Scheduling for μsecond-scale Tail Latency, NSDI ’19](https://www.usenix.org/system/files/nsdi19-kaffes.pdf)

[lec19.md](./lec19.md)

# Lec 20 机器学习

[Quasar: Resource-Efficient and QoS-Aware Cluster Management](http://dl.acm.org/citation.cfm?id=2541941)

[Resource Central: Understanding and Predicting Workloads for Improved Resource Management inLarge Cloud Platforms](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/10/Resource-Central-SOSP17.pdf)

# Lec 21 集群管理

Cluster Management

> 阅读资料
>
> - [Omega: Flexible, scalable schedulers for large compute clusters, EuroSys'13](https://static.googleusercontent.com/media/research.google.com/zh-CN//pubs/archive/41684.pdf)
> - [Large-scale cluster management at Google with Borg,EuroSys'15](https://dl.acm.org/doi/pdf/10.1145/2741948.2741964)

[lec21.md](./lec21.md)
