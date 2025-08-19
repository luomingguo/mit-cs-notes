# Lec 9 应用框架

[Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing]([nsdi12-final138.pdf (usenix.org)](https://www.usenix.org/system/files/conference/nsdi12/nsdi12-final138.pdf))

- 俗称RDD，奠定了Spark的理论基础
- 集群计算框架：比如MapReduce，这种抽象让用户在不用考虑任务调度和容错的前提下，使用一系列高级的操作进行并行计算，但是缺少对分布式内存的抽象。在不同计算阶段之间重用数据（如，在两个MapReduce的job之间）的唯一方式是将其写入外部稳定存储系统中，如，分布式文件系统。它们没有提供更加通用的数据重用的抽象。

[X-Stream: edge-centric graph processing using streaming partitions, SOSP13](https://dl.acm.org/doi/10.1145/2517349.2522740)

- X-Stream是在共享存储机器上既能处理存放于外存，又能处理存放于内存的图数据