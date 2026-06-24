# Lec 15 内容分发网络（CDN / Content Distribution）

阅读资料

- B. Maggs, R. Sitaraman, [Algorithmic Nuggets in Content Delivery](https://web.mit.edu/6.829/www/currentsemester/papers/cdnalg.pdf)（Akamai 的算法综述）
- H. Zhang et al., [Live Video Analytics at Scale with Approximation and Delay-Tolerance (VideoStorm)](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/02/videostorm_nsdi17.pdf), NSDI 2017
- **(Optional)** H. Yeo et al., [Neural Adaptive Content-aware Internet Video Delivery (NAS)](https://www.usenix.org/system/files/osdi18-yeo.pdf), OSDI 2018

> Part III「Overlay Networks」开篇。CDN 是建在互联网之上的覆盖网：把内容**缓存到离用户近的边缘服务器**，降低时延、卸载源站、抗突发。本讲一篇讲 CDN 背后的经典算法（Akamai），一篇讲云端**大规模实时视频分析**的调度（VideoStorm）。

## 总览

- 为什么要 CDN
- Algorithmic Nuggets：CDN 背后的几个关键算法
  - 一致性哈希（consistent hashing）
  - 把客户映射到集群（带容量/时延约束的稳定分配）
  - 缓存准入（第二次命中才缓存 / Bloom filter）
  - 覆盖路由（overlay routing）
  - 一致性与选主等分布式"零件"
- VideoStorm：大规模实时视频分析的调度（近似 + 容忍延迟）
- 论文重点

---

## 一、为什么要 CDN

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · CDN 架构</strong><br>
在全球部署成千上万台<strong>边缘服务器（edge）</strong>，靠近用户；用户请求经 <strong>DNS 映射</strong>被导向"最优"的边缘服务器（近、负载低、健康）；边缘命中则直接回内容，未命中再回源站取并缓存。好处：低时延、卸载源站、吸收突发与抗 DDoS、就近容错。
</div>

## 二、Algorithmic Nuggets：CDN 背后的算法

Maggs & Sitaraman 把 Akamai 这种超大规模 CDN 里用到的算法拆成若干"算法零件 (nuggets)"。

### 2.1 一致性哈希（consistent hashing）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 一致性哈希</strong><br>
把服务器和内容对象都哈希到同一个环上；一个对象由"环上顺时针第一台服务器"负责。问题：用普通 <code>hash(obj) mod N</code> 选服务器，<strong>N 一变（加/减/宕机一台）几乎所有对象都要重新映射</strong>、缓存全失效。一致性哈希让<strong>增删一台只影响环上相邻的一小段（约 1/N 的对象）</strong>，其余映射不变。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 为什么 CDN（和 P2P）都爱它</strong><br>
CDN 服务器会频繁加入/退出（扩容、故障、维护），一致性哈希让"对象→服务器"的分配在 churn 下<strong>稳定</strong>，把缓存抖动降到最小；用<strong>虚拟节点</strong>还能均衡负载。同一思想也是 P2P 的 Chord（[[Peer-to-Peer-Networks]]）的核心。
</div>

### 2.2 把客户映射到集群：带约束的稳定分配

光按"最近"把客户导到边缘集群还不够——还要满足**集群容量**（别打爆）、**时延**（别太远）、**成本**等约束，且环境（流量、健康）不断变。Akamai 把它建模成一个**稳定分配 / 负载均衡**问题（类似稳定婚姻的思路），周期性地重算"客户群 → 集群"的映射，在满足容量与时延约束下优化。要点：**映射决策与 DNS 解析解耦**，全局优化后再通过 DNS 落地。

### 2.3 缓存准入：第二次命中才缓存（Bloom filter）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · "cache on second hit" + Bloom filter</strong><br>
大量对象是"只被访问一次"的长尾——把它们也缓存只会污染缓存、挤掉热门对象。策略：<strong>第一次见到某对象先不缓存，只在 Bloom filter 里记一笔；第二次再见才真正缓存</strong>。用 <strong>Bloom filter</strong>（空间极省的概率集合，有假阳无假阴）来低成本地记住"见过哪些 URL"。
</div>

### 2.4 覆盖路由（overlay routing）

源站到边缘、边缘到边缘的传输若走默认 BGP 路径未必最快/最稳。CDN 在自己的服务器之间构建**覆盖网**，主动探测并选更优的**中转路径**（必要时经一两跳中间服务器），绕开拥塞/故障的默认路由——即在应用层做"更好的路由"。

### 2.5 其他分布式"零件"

大规模 CDN 还用到：**选主/共识**（管理集群成员、配置一致）、**一致性协议**、**负载预测与调度**等——本质上 CDN 是一个超大规模分布式系统，这些都是支撑它运转的算法零件。

## 三、VideoStorm：大规模实时视频分析的调度

> 视角从"分发内容"转到"在云端大规模**分析**实时视频流"——成千上万路摄像头、许多查询（车牌识别、人流计数…）竞争有限的集群资源。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 每个查询的"旋钮"与两条 profile</strong><br>
每个视频查询有可调<strong>旋钮 (knobs)</strong>：分辨率、帧率、用哪个算法/模型。VideoStorm 为每个查询维护两条曲线：<strong>resource-quality profile</strong>（投入多少资源 → 输出精度多高）和 <strong>resource-latency profile</strong>（资源 → 端到端延迟）。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 利用"可近似 + 容忍延迟"做全局调度</strong><br>
关键洞察：视频分析查询天然<strong>容忍近似与有界延迟</strong>（精度低一点、慢一点都还有用）。于是调度器在有限资源下，<strong>联合选择每个查询的分辨率/帧率/模型 + 资源分配</strong>，去优化全局目标（<strong>MaxMin</strong> 最小效用最大化，或 <strong>MaxSum</strong> 总效用最大化），在质量与延迟间权衡。实现上用基于 profile 的预测 + 贪心探索来高效估计这些曲线，并能做查询迁移、容忍 profile 估计误差。结果：在资源紧张时比基线显著提升整体效用。
</div>

> **NAS（可选）**：另一条思路——把内容感知与机器学习用进视频分发：客户端用一个**超分辨率神经网络**把低码率视频在本地"放大"还原质量，从而在带宽受限时仍获得高画质（与 [[Video-Streaming]] 的码率自适应互补）。

## 四、论文重点

- **Algorithmic Nuggets**：核心是「一组经典算法支撑起超大规模 CDN」——**一致性哈希**（churn 下稳定映射、最小化缓存抖动）、**带容量/时延约束的稳定分配**（客户→集群）、**Bloom filter + 第二次命中才缓存**（防长尾污染）、**覆盖路由**（应用层选更优路径）。
- **VideoStorm（Fig. resource-quality/latency profiles + 调度）**：每查询有旋钮与两条 profile；调度器利用"可近似 + 容忍延迟"在有限资源上做 MaxMin/MaxSum 全局优化。

## 本讲小结

> CDN 是互联网之上的覆盖网，把内容推到边缘。其背后是一串算法零件：**一致性哈希**让对象→服务器映射在频繁增删下稳定、**稳定分配**把客户在容量/时延约束下导到最优集群、**Bloom filter + 二次命中缓存**挡住长尾、**覆盖路由**在应用层绕开差路径。**VideoStorm** 则把"近似 + 容忍延迟"作为资源调度的杠杆，用 resource-quality/latency profile 在大规模实时视频分析中做全局效用优化。
