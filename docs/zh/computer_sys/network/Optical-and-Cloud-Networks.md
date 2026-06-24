# Lec 14 光网络与云网络（Optical & Cloud Networks）

> Topics：Optical Network、Cloud Networking、Multi-Tenant Network、Virtual Network。本讲无指定论文，按主题 + 知识组织（这里以后可继续扩充）。两条主线：① 物理层的**光**怎样支撑大带宽、甚至能重构数据中心拓扑；② 云上如何在共享物理网络之上给每个租户切出**隔离、可保证**的虚拟网络。

## 总览

- 光网络：WDM、电路交换 vs 分组交换、数据中心里的光交换/可重构拓扑
- 云网络：多租户的挑战
- 网络虚拟化：VPC、Overlay（VXLAN）、地址/性能隔离
- 带宽保证与性能隔离

---

## 一、光网络

光纤用光传数据，带宽极大、衰减极小，是长途骨干与数据中心互联的物理基础。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · WDM（波分复用）</strong><br>
在一根光纤里用<strong>多个不同波长（颜色）</strong>同时传多路信号，每个波长就是一条独立信道——单纤容量可达 Tbps 级。这是"在一根纤里开很多条并行高速路"。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 光电路交换 vs 分组交换</strong><br>
<strong>光电路交换</strong>：用光开关（如 MEMS 微镜）把输入纤直接接到输出纤，建立一条"光直通"路径——延迟低、带宽巨大、<strong>不在中途做电-光转换</strong>；但切换需要毫秒级、不适合细粒度短流。<br>
<strong>分组交换</strong>：每个包都要被读包头、查表、转发（要光→电→光），灵活但有 per-packet 开销。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 数据中心里的可重构光拓扑</strong><br>
传统 Fat-Tree/Clos（见 [[Datacenter-Networks]]）是<strong>静态</strong>电拓扑，为最坏情况堆满带宽、成本高。一类前沿做法：用<strong>光交换机按需重构拓扑</strong>——监测流量热点，把光路临时接到"当前流量大的机架对"之间，用少量光器件提供"按需大带宽"。代价是重构有毫秒级延迟、调度复杂，适合大象流而非鼠流。这与广域网的集中式流量工程（[[Wide-Area-Networks]] 的 SWAN/B4）异曲同工：都是"集中决策 + 物理资源调度"。
</div>

## 二、云网络：多租户的挑战

公有云上成千上万互不信任的租户共享同一套物理网络。

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 0.6em 1em; margin: 1em 0;">
<strong>多租户要同时满足三件事</strong>
<ul>
<li><strong>地址隔离</strong>：租户 A、B 可能都用 10.0.0.0/8，地址会撞——必须让各自以为独占整个地址空间。</li>
<li><strong>安全隔离</strong>：A 的流量不能被 B 看到/注入。</li>
<li><strong>性能隔离</strong>：B 跑满带宽不能饿死 A（避免"吵闹的邻居 noisy neighbor"）。</li>
</ul>
</div>

## 三、网络虚拟化

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · VPC 与 Overlay（VXLAN）</strong><br>
云给每个租户一张 <strong>VPC（虚拟私有云）</strong>——逻辑上独立的虚拟网络，租户自定义 IP/子网/路由。实现靠 <strong>overlay（覆盖网）</strong>：在宿主机的虚拟交换机里把租户的二层帧<strong>封装</strong>进物理网络的 IP 包（<strong>VXLAN</strong> 等），加一个 <strong>VNI（虚拟网络标识）</strong>区分租户；物理底层网络只看外层 IP，对租户地址一无所知。这就是"租户虚拟网络叠在共享物理底层之上"。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · overlay 把"谁连谁"与"物理怎么走"解耦</strong><br>
封装后，租户网络的拓扑/地址完全由软件（虚拟交换机 + 控制器）定义，与物理布线无关——可任意迁移虚拟机、改虚拟拓扑而不动物理网。这正是 SDN（[[Software-Defined-Networking]]）思想在云里的落地：控制器集中下发"每台宿主机的虚拟交换机怎么封装/转发"。代价是封装开销 + 需要高效的虚拟交换/卸载（如 SR-IOV、智能网卡把封装下放到硬件）。
</div>

## 四、带宽保证与性能隔离

地址/安全隔离靠 overlay 解决，但**带宽**是真共享的物理资源，最难隔离：

- 给租户**带宽保证**需要在共享链路上做准入/限速/调度（类似把"虚拟链路容量"分配给租户）；
- 与拥塞控制（[[Modern-Congestion-Control]] 的 SWIFT）、数据中心拓扑（[[Datacenter-Networks]]）协同，才能在高利用率下兼顾隔离。

## 本讲小结

> **光**用 WDM 在一根纤里开多条 Tbps 信道；光电路交换延迟低带宽大但切换慢，催生了数据中心**可重构光拓扑**（按需把大带宽接到热点机架对）。**云**要在共享物理网上服务互不信任的多租户，靠 **VPC + VXLAN overlay** 实现地址/安全隔离、把虚拟网络与物理底层解耦（SDN 思想），而**性能（带宽）隔离**因物理资源真共享而最难，需准入/调度配合。
