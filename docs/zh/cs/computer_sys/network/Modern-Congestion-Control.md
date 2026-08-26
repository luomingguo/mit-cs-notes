---
title: 现代拥塞控制（Modern Congestion Control）
type: lecture
tags: []
status: complete
---
# Lec 4 现代拥塞控制（Modern Congestion Control）

阅读资料

- G. Kumar et al., [Swift: Delay is Simple and Effective for Congestion Control in the Datacenter](https://dl.acm.org/doi/pdf/10.1145/3387514.3406591), SIGCOMM 2020.
- **(Optional)** P. Goyal et al., [ABC: A Simple Explicit Congestion Controller for Wireless Networks](http://web.cs.ucla.edu/~ravi/publications/abc_nsdi20.pdf), NSDI 2020.（读 1–3 节）

> 经典 AIMD（[[End-to-End-Congestion-Control]]）在两种新环境下力不从心：**超低时延的数据中心**、**速率剧烈波动的无线链路**。本讲两篇分别对症：SWIFT 用时延信号、ABC 用单比特显式反馈。

## 本讲导览

- SWIFT：数据中心的时延型拥塞控制（拆分 fabric / endpoint 时延）
- ABC：无线链路的单比特"加速/刹车"控制
- 拥塞控制三代演进小结

---

## 一、SWIFT：数据中心的时延型拥塞控制

用**端到端 RTT** 作为拥塞信号（而非丢包或 ECN），对一个**目标时延**做 AIMD：RTT 低于目标则加窗，高于目标则减窗。关键设计是**拆分时延来源**：

$$\text{target\_delay} = \text{fabric\_delay} + \text{endpoint\_delay}$$

::: definition 定义 · 拆分 fabric / endpoint 拥塞
把**网络 fabric 拥塞**（交换机排队）与**端点拥塞**（NIC/主机处理不过来）分开建模、各设目标时延。因为二者成因和应对不同：fabric 拥塞要减网络注入，endpoint 拥塞（典型于大规模 **incast** 多打一）要针对目标端节流。
:::

::: theorem 推论 · 为什么数据中心偏爱时延信号
数据中心 RTT 是微秒级、可精确测量（参见 [[Network-Measurement]] 的纳秒级时钟同步），时延比丢包/ECN **更早、更细粒度**地反映排队，能在**极小缓冲**下精确控制、在超高负载与大规模 incast 下仍稳定。优点：简单、可扩展、对低缓冲友好——这也是为何"delay is simple and effective"。
:::

## 二、ABC：无线链路的加速/刹车控制

蜂窝/无线链路容量在**毫秒级剧烈变化**（见 [[Wireless-and-Mobile-Networks]]），端到端方案跟不上。

::: definition 定义 · 加速/刹车控制（Accel-Brake Control）
路由器为每个分组打**单比特**标记："加速 (accelerate)" 或 "刹车 (brake)"。发送方据每个 ACK 的反馈逐包微调窗口：
$$\text{accelerate}:\ \text{cwnd} \leftarrow \text{cwnd}+1 \qquad \text{brake}:\ \text{cwnd}\ \text{减一个分组}$$
:::

::: theorem 推论 · 与 XCP 的取舍
ABC 与 XCP（[[Network-assisted-Congestion-Control]]）都是显式、网络辅助，但 ABC 只用**单比特**（复用 ECN 字段即可），因此可**增量部署**、与不打 ABC 标记的流共存；代价是反馈表达力不如 XCP 多比特。在容量快速变化的无线链路上，逐包"加速/刹车"能比 AIMD 更快地"咬住"瞬时可用速率。
:::

## 三、拥塞控制三代演进（小结）

| 代 | 代表 | 信号 | 适用环境 | 部署 |
| --- | --- | --- | --- | --- |
| 经典端到端 | AIMD / TCP（[[End-to-End-Congestion-Control]]）| 丢包（隐式、单比特）| 通用互联网 | 纯端点，已普及 |
| 网络辅助 | XCP / PIE（[[Network-assisted-Congestion-Control]]）| 显式多比特 / 时延 AQM | 高 BDP | 需改路由器，难增量 |
| 现代专用 | **SWIFT / ABC**（本讲）| 时延（DC）/ 单比特加速刹车（无线）| 数据中心 / 无线 | SWIFT 端到端；ABC 单比特可增量 |

> 一条主线：信号从「丢包」走向「时延/显式标记」，控制从「为通用网络保守」走向「为特定环境（DC 微秒级、无线毫秒级波动）精确定制」。

## 本讲小结

> 经典 AIMD 在数据中心和无线两类新环境失灵。**SWIFT** 用端到端 RTT 做时延型 AIMD，并把 **fabric 与 endpoint 拥塞拆开**建模，在极小缓冲与大规模 incast 下精确控制；**ABC** 让路由器对无线链路逐包打**单比特加速/刹车**标记，可增量部署且能快速跟住剧烈变化的容量。
