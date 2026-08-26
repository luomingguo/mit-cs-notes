---
title: 分布式系统网络（Networking for Distributed Systems）
type: lecture
tags: []
status: complete
---
# Lec 9 分布式系统网络（Networking for Distributed Systems）

> 本讲无指定论文，围绕 Topics 展开：Distributed ML、Parameter Server、AllReduce、Horovod。核心问题：当把一个训练任务摊到成百上千台机器上时，**网络（梯度同步）往往成为瓶颈**，于是「怎么高效地把每台机器的梯度合起来」成了一个网络问题。

## 本讲导览

- 为什么分布式训练是一个网络问题
- 数据并行 vs 模型并行
- 参数服务器（Parameter Server）：push/pull、同步 vs 异步 SGD、掉队者
- AllReduce 与 Ring-AllReduce：带宽最优的去中心化同步
- Horovod：把 Ring-AllReduce 工程化
- 网络层面的影响与前沿（incast、in-network aggregation）

---

## 一、为什么分布式训练是一个网络问题

深度学习训练是迭代的 SGD：每一步在一批数据上算出**梯度**，更新模型参数。把它分布到 N 台机器后，每一步结束都要把各机器的梯度**合并（求和/平均）**再分发回去——这一步是**全体通信**，且要在每个 mini-batch 后都做一次。

::: example 瓶颈所在
现代模型参数量动辄上亿到千亿，每步要同步的梯度就有几百 MB 到几 GB；而计算（尤其在 GPU/TPU 上）越来越快，于是**通信时间逐渐主导每步耗时**。分布式训练能不能线性加速，取决于「梯度同步」能否与「计算」重叠、以及同步本身用满多少带宽。
:::

## 二、并行方式

::: definition 定义 · 数据并行 vs 模型并行
**数据并行 (data parallel)**：每台机器持有**完整模型副本**、处理不同的数据批；每步同步**梯度**。最常用。

**模型并行 (model parallel)**：模型太大装不进单卡，把**模型本身切开**放到不同机器；机器间传的是**激活/中间结果**。
:::

下面聚焦数据并行下的「梯度同步」两大范式：参数服务器与 AllReduce。

## 三、参数服务器（Parameter Server）

中心化架构：一组 **server** 节点保存全局参数，一组 **worker** 节点算梯度。

- **push**：worker 把本地梯度推给 server；
- **pull**：worker 从 server 拉回更新后的参数。

::: definition 定义 · 同步 vs 异步 SGD
**同步 (BSP)**：所有 worker 完成本步、聚合后才进入下一步——等价于大 batch，收敛性好，但被**最慢的 worker（掉队者 straggler）**拖住。

**异步 (ASP)**：worker 各推各的、不互相等，server 来一个更新一个——无掉队者等待，但用的是**过期梯度 (stale gradient)**，可能损害收敛。
:::

::: theorem 推论 · 参数服务器的网络痛点
所有 worker 在每步同时向少数 server **push/pull**，形成**多打一的 incast**，server 的入向带宽成为瓶颈，且易触发交换机缓冲溢出与排队。把参数**分片 (shard)** 到多台 server 可分摊带宽，但中心化结构的总带宽仍随规模受限——这正是 AllReduce 想绕开的。
:::

## 四、AllReduce 与 Ring-AllReduce

**AllReduce**：一个集合通信原语——把所有节点各自的向量**逐元素求和**，结果**分发给所有节点**。它是去中心化的（无中心 server）。

朴素做法（每个节点把数据发给所有人）通信量随 N 平方增长。**Ring-AllReduce** 是带宽最优实现：

::: definition 定义 · Ring-AllReduce
N 个节点排成一个环，把梯度向量切成 N 块。分两阶段、各 N−1 步：

① **scatter-reduce**：每步每个节点把一块发给下家、收上家一块并累加，N−1 步后每个节点各自持有「某一块的全局和」；

② **all-gather**：再 N−1 步把这些已求和的块沿环传一圈，使每个节点都集齐所有块。
:::

::: theorem 推论 · 为什么 Ring-AllReduce 是带宽最优
每个节点总共收/发的数据量约为 $2\cdot\frac{N-1}{N}\cdot D$（D 为梯度大小），**与节点数 N 几乎无关**，且每条链路始终双向满载。相比参数服务器把全部上行流量压到少数 server，Ring 把通信均匀摊到所有节点的链路上——这就是大规模 GPU 训练几乎都用 AllReduce 的原因。代价是它是**同步**的（环上一环扣一环），对掉队者和故障敏感。
:::

## 五、Horovod：把 Ring-AllReduce 工程化

Horovod（Uber，2017）把 Ring-AllReduce 接到 TensorFlow/PyTorch 等框架上，让「单机训练脚本」几行改动就能多机扩展：

- 底层用 **MPI / NCCL**（NVIDIA 的 GPU 集合通信库，做 GPU 间直连的高效 AllReduce）；
- **tensor fusion（张量融合）**：把许多小梯度张量**攒成一个大缓冲再 AllReduce**，摊薄每次通信的固定开销、提高带宽利用；
- 通信与反向传播**重叠**：某层梯度一算好就开始同步，不等整个反向结束。

::: theorem 推论 · 通信/计算重叠是关键
反向传播是从输出层往输入层逐层算梯度，先算出的层可以**立刻开始 AllReduce**，与后续层的计算并行。只要同步能藏在计算背后，扩展就接近线性——否则就退化成「算一会儿、等一会儿网络」。
:::

## 六、网络层面的影响与前沿

- **流量特征**：周期性、突发、全体同步——与 Web 流量很不同，对交换机缓冲和拥塞控制提出新要求（参见数据中心拥塞控制 [[Modern-Congestion-Control]] 的 SWIFT、incast 处理）。
- **in-network aggregation（网内聚合）**：让**可编程交换机**在网络里就把多个 worker 的梯度加起来（如 SwitchML），减少进出 server 的流量——把分布式训练和 [[Programmable-Data-Plane]]（可编程数据面）连了起来。
- **拓扑感知**：在 Fat-Tree/Clos（见 [[Datacenter-Networks]]）上，AllReduce 的环要尽量贴合物理拓扑、避免跨核心层往返。

## 本讲小结

> 分布式数据并行训练的核心网络问题是「每步把全体梯度合起来」：**参数服务器**中心化、易做异步但有 incast 瓶颈；**AllReduce（Ring）**去中心化、带宽最优、是大规模 GPU 训练的主流；**Horovod** 用 NCCL + 张量融合 + 通信计算重叠把它工程化。再往前一步，就是用可编程交换机做**网内聚合**。
