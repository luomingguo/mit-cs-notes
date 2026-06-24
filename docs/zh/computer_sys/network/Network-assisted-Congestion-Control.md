# Lec 3 网络辅助拥塞控制（Network-assisted Congestion Control）

阅读资料

- D. Katabi, M. Handley, and C. Rohrs, [Congestion control for high bandwidth-delay product networks (XCP)](https://web.mit.edu/6.829/www/2020/papers/xcp.pdf), SIGCOMM 2002.（读 1–3 节）
- [PIE Internet RFC](https://tools.ietf.org/html/draft-ietf-aqm-pie-06)（读 1–4 节，其余略读）。

端到端方案的局限：仅靠丢包这一**单比特、隐式**信号，在**高带宽时延积** <em>(high Bandwidth-Delay Product, BDP)</em> 网络里反应迟钝。本讲让路由器主动参与。

## 总览

- 端到端（[[End-to-End-Congestion-Control]]）的局限：高 BDP 下隐式信号太慢
- XCP：路由器给**显式多比特**反馈，并**解耦效率与公平**
- PIE：以**排队时延**为控制量的主动队列管理（治 bufferbloat）
- 小结：显式反馈 vs 部署代价

### 4.1 XCP：显式多比特反馈

Katabi, Handley & Rohrs, *Congestion Control for High Bandwidth-Delay Product Networks* (SIGCOMM 2002)。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 带宽时延积 <em>(BDP)</em></strong>
$$\text{BDP} = \text{瓶颈带宽} \times \text{RTT}$$
即"管道容量"。BDP 越大，TCP 用 AIMD 填满管道所需的 RTT 数越多，且单次丢包减半的代价越高。
</div>


XCP 的关键创新是**解耦** <em>(decoupling)</em> 效率控制与公平控制：

- **效率控制器** <em>(Efficiency Controller, EC)</em>：以聚合方式调节总流量，目标是榨干带宽并清空队列。路由器为每个 RTT 计算聚合反馈
  $$\phi = \alpha\, \bar{d}\,(C - y) - \beta\, Q$$
  其中 $C$ 为链路容量、$y$ 为输入流量、$Q$ 为持续队列长度、$\bar d$ 为平均 RTT。$\phi>0$ 时分配冗余带宽，$\phi<0$ 时排空队列。
- **公平控制器** <em>(Fairness Controller, FC)</em>：用 AIMD 式"带宽洗牌"把 $\phi$ 分摊到各流，正反馈时人人加同样的量，负反馈时按比例减——再现 AIMD 的公平收敛性，但作用在**聚合层面**。

机制上，每个分组携带**拥塞头** <em>(congestion header)</em>，写入发送方期望的 `cwnd` 增量与 RTT；路径上每个路由器只能把反馈调小。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论</strong><br>
解耦让 EC 可以用激进的（接近 MIMD）方式快速逼近满载，而不必担心破坏公平——因为公平由独立的 FC 维持。这正是 XCP 在高 BDP 下远胜 TCP 的根源。代价是需要路由器改造，难以增量部署。
</div>


### 4.2 PIE：面向时延的主动队列管理

*PIE (Proportional Integral controller Enhanced)* RFC 针对**缓冲膨胀** <em>(bufferbloat)</em>——大缓冲区被持续填满导致排队时延飙升。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 主动队列管理 <em>(Active Queue Management, AQM)</em></strong><br>
路由器在队列<strong>溢出之前</strong>就按概率丢弃/标记分组，提前向发送方示警。<em>RED</em> 以队列长度为控制量；<em>PIE</em> 直接以<strong>排队时延</strong>为控制量。
</div>


PIE 用比例–积分 <em>(PI)</em> 控制器更新丢弃概率 $p$：

$$p \leftarrow p + \alpha\,(\text{delay} - \text{target}) + \beta\,(\text{delay} - \text{delay}_{\text{old}})$$

第一项（积分/比例）盯住与目标时延的稳态偏差，第二项（导数趋势）抑制振荡。由于直接控制时延，PIE 对链路速率变化与突发更鲁棒，且实现轻量、无需逐包状态。

## 本讲小结

> 高 BDP 下纯端到端的隐式丢包信号太慢。**XCP** 让路由器在拥塞头里给**显式多比特**反馈，并把**效率控制（榨满带宽、清空队列）与公平控制（AIMD 式洗牌）解耦**，从而能激进逼近满载又不破坏公平——代价是要改造路由器、难增量部署。**PIE** 是一种 AQM，直接以**排队时延**为控制量、用 PI 控制器调丢弃概率来治 bufferbloat，轻量且对速率变化鲁棒。再往后，[[Modern-Congestion-Control]] 的 ABC 把显式反馈压到**单比特**以便增量部署。