---
title: 广域网（Wide-Area Networks）
type: lecture
tags: []
status: complete
---
# Lec 8 广域网（Wide-Area Networks）

阅读资料：

- Chi-Yao Hong et al., [Achieving High Utilization with Software-Driven WAN (SWAN)](https://web.mit.edu/6.829/www/2020/papers/software_defined_wan.pdf), SIGCOMM 2013.
- **(Optional)** S. Jain et al., [B4: Experience with a Globally-Deployed Software Defined WAN](https://web.mit.edu/6.829/www/2020/papers/b4.pdf), SIGCOMM 2013.

数据中心之间的 WAN 链路昂贵，但传统上利用率只有 30–50%——因为各业务各自发送、缺乏协调，必须留出余量防拥塞。本讲用**集中式流量工程** <em>(centralized Traffic Engineering, TE)</em> 把利用率推向上限。

## 本讲导览

- 为什么 WAN 用不满（分布式、各自为政 → 留余量防拥塞）
- SWAN：集中控制器 + LP 分配 + 业务协同节流 + **无拥塞更新**
- B4：Google 全球 SDN WAN，OpenFlow + 带宽函数 max-min 公平
- 小结：集中可见性 + 业务可调度 = 打破利用率天花板

### 6.1 SDWAN：软件驱动的 WAN

Hong et al., *Achieving High Utilization with Software-Driven WAN* (SIGCOMM 2013, Microsoft)。

核心做法：一个逻辑集中的控制器收集各业务需求，用**线性规划** <em>(linear programming)</em> 按业务优先级分配速率，并**与业务协同节流**——业务只发被允许的量，从而安全地把链路推到接近满载。

::: example
**例 · 无拥塞的网络更新 *(congestion-free update)***

直接从旧转发规则切换到新规则，过渡期可能瞬时超载某链路。SWAN 预留少量**临时容量** *(scratch capacity，如 10%)*，把更新拆成若干步，每一步都保证不超过链路容量——用空间换取"任意中间态都无拥塞"的保证。
:::

### 6.2 B4：Google 的全球 SDN WAN

Jain et al., *B4: Experience with a Globally-Deployed Software Defined WAN* (SIGCOMM 2013)。B4 连接 Google 各数据中心，是最早的大规模生产级 *SDN* 部署之一。

- 用 *OpenFlow* 控制自研交换机，集中式 TE 作为全局优化问题求解。
- 用**带宽函数** <em>(bandwidth function)</em> 表达各应用对带宽的效用，TE 据此做**最大最小公平** <em>(max-min fair)</em> 分配。
- 结果：把昂贵的跨洲链路驱动到接近 100% 利用率。

::: theorem 推论 · SWAN 与 B4 的共识
两篇同年论文殊途同归：要打破"利用率天花板"，必须放弃纯分布式、改用**集中可见性 + 业务可被调度**。差别在 B4 更强调自研硬件与 OpenFlow 实践教训，SWAN 更强调无拥塞更新与优先级化的 LP 分配。它们是 [[Software-Defined-Networking]] 在 WAN 场景的落地证据。
:::

## 本讲小结

> 跨数据中心 WAN 链路昂贵却长期只用 30–50%，根因是分布式、各业务各自为政、必须留余量防拥塞。**SWAN** 用逻辑集中的控制器收集需求、按优先级 LP 分配速率、让业务**协同节流**，并用预留少量 **scratch capacity** 实现**无拥塞的转发规则更新**；**B4** 是 Google 全球生产级 SDN WAN，用 OpenFlow 控制自研交换机、以带宽函数做 max-min 公平的集中 TE。共识：**集中可见性 + 业务可调度**才能把利用率逼近 100%（与光网络的按需重构拓扑 [[Optical-and-Cloud-Networks]] 异曲同工）。

---
