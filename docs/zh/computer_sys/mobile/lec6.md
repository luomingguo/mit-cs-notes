---
title: '网状网络与多跳路由（Mesh Networking & Multi-Hop Routing）'
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 6
kind: system
tags: []
status: complete
---
# Lec 6 网状网络与多跳路由（*Mesh Networking & Multi-Hop Routing*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：ETX 论文 [MobiCom'03]

## 1. 动机：为什么需要 Mesh 网络？

单跳无线网络的覆盖范围有限，且高传输功率会增加干扰、消耗能量。**多跳网状网络**（*Multi-Hop Mesh Network*）通过中继节点扩展覆盖，每一跳功率可以大幅降低。

::: definition
**定义 — 网状网络（*Mesh Network*）**

每个节点既是通信终端，也是路由器，数据包可以经过多个中间节点（*Relay*）抵达目的地，形成网状拓扑（*Mesh Topology*）。
:::

**挑战**：
- 无线链路质量随时间波动（*Fading, Interference*）
- 需要一个能反映链路实际可靠性的路由度量（*Routing Metric*）
- 传统 hop-count 路由忽略链路质量，常选出低质量多跳路径

---

## 2. ETX：期望传输次数（*Expected Transmission Count*）

::: definition
**定义 — ETX（*Expected Transmission Count*）**

在无线链路上成功传输一个数据包所需的期望传输次数，包含重传。ETX 越小，链路质量越好。
:::

### 2.1 推导

设正向（*Forward*）传输成功率为 $r_{fwd}$，反向（*Reverse*）确认成功率为 $r_{rev}$，则单次尝试成功的概率为：

$$p_\text{success} = r_{fwd} \times r_{rev}$$

假设每次传输独立，成功所需次数服从几何分布（*Geometric Distribution*），期望值为：

$$\text{ETX} = \frac{1}{r_{fwd} \times r_{rev}}$$

::: theorem 推论 — ETX 的物理意义
若 $r_{fwd} = 0.9, r_{rev} = 0.9$，则 $\text{ETX} = 1/0.81 \approx 1.23$，即平均约 1.23 次传输可成功。若链路差到 $r_{fwd} = 0.3, r_{rev} = 0.3$，则 $\text{ETX} \approx 11.1$，实际上约等于带宽损失 9 倍。
:::

### 2.2 如何测量 $r_{fwd}$ 和 $r_{rev}$？

每个节点定期广播探测包（*Probe Packet*），邻居节点统计收到的比例：

- 节点 A 能算出 $r_{fwd}(A \to B)$（A 发出，B 回告收到比例）
- 节点 B 能算出 $r_{fwd}(B \to A)$（B 发出，A 回告收到比例）

实现时，B 将自己收到 A 探测包的比例塞进 B 自身发出的探测包中，这样 A 可以拿到 $r_{rev}$。

---

## 3. 路由计算

### 3.1 路径 ETX

路径（*Path*）总 ETX = 各跳 ETX 之和：

$$\text{ETX}_\text{path} = \sum_{i} \text{ETX}_i$$

::: example 例题 — ETX vs. Hop-Count 路由选择

:::

三条路径：
- 路径 A：2 跳，每跳 ETX = 1.1 → 路径 ETX = 2.2
- 路径 B：3 跳，每跳 ETX = 1.0 → 路径 ETX = 3.0
- 路径 C：1 跳，链路质量差 ETX = 5.0 → 路径 ETX = 5.0

Sol：Hop-Count 选路径 C（1 跳），ETX 路由选路径 A（总 ETX 2.2 最小）。ETX 路由正确反映了实际吞吐量，路径 A 实际吞吐量约为路径 C 的 2.3 倍。

### 3.2 Dijkstra 最短路径

以 ETX 为边权重，对网络图运行 Dijkstra 算法求解最小 ETX 路径。

---

## 4. MIT Roofnet 实验部署

MIT Roofnet 是一个在剑桥市住宅屋顶部署的 802.11b 网状网络，用于实验 ETX 路由。

| 参数 | 数值 |
|------|------|
| 节点数 | 38 |
| 覆盖面积 | ~4 km² |
| 平均跳数 | ~4.3 跳 |
| 中位吞吐量 | ~627 kbps 端到端 |

**关键发现**：
- 多数链路的 ETX 在 1–3 范围内
- 部分链路 ETX 极高（质量极差），路由会自动绕开
- ETX 路由比最短跳数路由平均吞吐量提高约 2–4 倍

---

## 5. 无线链路特性

### 5.1 过渡区（*Transitional Region*）

无线链路不是简单的"通/断"：

$$\text{链路状态} = \begin{cases} \text{连接区}（\text{Connected}）& \text{PRR} > 90\% \\ \text{过渡区}（\text{Transitional}）& 10\% < \text{PRR} < 90\% \\ \text{断开区}（\text{Disconnected}）& \text{PRR} < 10\% \end{cases}$$

ETX 能自然处理过渡区链路（高 ETX 意味着不稳定链路被惩罚）。

### 5.2 非对称链路（*Asymmetric Links*）

无线链路常是非对称的（$r_{fwd} \neq r_{rev}$），ETX 同时考虑正反向，自然处理不对称性。

---

## 6. 更先进的路由度量

ETX 之后的改进工作：

| 度量 | 改进点 |
|------|--------|
| ETT（*Expected Transmission Time*）| 乘以每跳传输速率，区分不同带宽链路 |
| WCETT（*Weighted Cumulative ETT*）| 最小化跨信道干扰 |
| mETX | 考虑数据包大小与链路丢包率 |

---

## 本讲小结

ETX 通过测量双向探测包成功率，定义了 $\text{ETX} = 1/(r_{fwd} \times r_{rev})$ 作为链路质量度量，路径 ETX 为各跳之和，在 MIT Roofnet 等实验网中被证明显著优于 hop-count 路由，成为 Mesh 网络路由的基础度量之一。
