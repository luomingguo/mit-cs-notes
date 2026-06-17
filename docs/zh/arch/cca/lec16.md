# Lec 16 片上网络 II：拓扑与路由
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Tushar Krishna · 日期：2024-04-09

## 1. 拓扑设计指标

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 拓扑设计时指标（<em>Design-Time Metrics</em>）</strong><br>
<ul style="margin:4px 0; padding-left:20px;">
<li><strong>度（<em>Degree</em>）</strong>：路由器的端口数。代理面积/能耗成本。</li>
<li><strong>二等分带宽（<em>Bisection Bandwidth</em>）</strong>：将网络均分为两半的最小割所跨越的链路数 × 单链路带宽。代理峰值带宽。</li>
<li><strong>直径（<em>Diameter</em>）</strong>：任意两节点间最短路径的最大跳数。代理最坏情况延迟。</li>
</ul></div>

---

## 2. 主流拓扑比较

### 2.1 总线（*Bus*）

$$\text{度}=1, \quad \text{直径}=1, \quad \text{二等分 BW}=1$$

优点：4–6 核以下成本极低，支持嗅探一致性（*snoopy coherence*）。
缺点：带宽不可扩展（随核数增多，争用急剧加剧）。

### 2.2 全连接（*Fully Connected*）

$$\text{度}=N-1, \quad \text{直径}=1, \quad \text{二等分 BW}=N^2/4$$

不可扩展：布线面积 $O(N^2)$，6 核以上即面临物理布局困难。

### 2.3 交叉开关（*Crossbar*）

$$\text{度}=N, \quad \text{直径}=1, \quad \text{二等分 BW}=N$$

GPU 内部广泛使用；面积/功耗随 $N^2$ 增长。

### 2.4 环形（*Ring*）

$$\text{度}=2, \quad \text{直径}=N/2, \quad \text{平均距离} \approx N/4, \quad \text{二等分 BW}=N/4$$

Intel Ring Bus（Sandy Bridge 以来）使用此结构；简单、低成本；带宽随 $N$ 固定，难以扩展。

### 2.5 环面（*Torus*）

$$\text{度}=4, \quad \text{直径}=\sqrt{N}, \quad \text{二等分 BW}=2\sqrt{N}$$

优点：路径多样性高（6 条最短路径）、边对称（边沿节点与中心节点路由能力相同）。
缺点：环绕链路（*wrap-around links*）布线不等长，物理实现困难。

### 2.6 网格（*Mesh*）

$$\text{度}=4（内部）, \quad \text{直径}=2(\sqrt{N}-1), \quad \text{二等分 BW}=\sqrt{N}$$

优点：等长链路，易于片上布局；路径多样性 = 3 条最短路径。
缺点：边缘节点度数较低（2–3），不对称；比 Torus 带宽低。

**比较总结**：

| 拓扑 | 度 | 直径 | 二等分 BW | 适用场景 |
|------|----|------|----------|---------|
| 总线 | 1 | 1 | 1 | ≤6 核 |
| 环形 | 2 | N/2 | N/4 | Intel 中等规模 |
| Mesh | 4 | 2(√N−1) | √N | 多核片上网络 |
| Torus | 4 | √N | 2√N | HPC 互连 |
| 全连接 | N−1 | 1 | N²/4 | 极小规模 |

---

## 3. 层次化拓扑（*Hierarchical Topologies*）

- **层次化环（*Hierarchical Rings*）**：本地环 + 全局环，折中成本与带宽
- **集中网格（*Concentrated Mesh*）**：多核共享一个路由器节点，减少路由器数量，降低功耗

---

## 4. 运行时指标

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 最大吞吐量（<em>Maximum Throughput</em>）</strong><br>
在均匀随机流量（<em>uniform random traffic</em>）下，找出最拥堵的链路（最大信道负载，<em>Maximum Channel Load</em>），该链路限制整体吞吐量。</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 环形拓扑最大吞吐量</strong></div>

8 节点环形，均匀流量，每节点产生 $p$ 条消息/周期：
- 左侧 4 节点发往右侧 4 节点的消息全部经过中间 bisection 链路
- 每周期 $4p$ 条消息进入左半环，$2p$ 条消息跨越二等分链路
- 链路容量 = 1 消息/周期，故 $p_{\max} = 1/2$

Sol：环形拓扑在均匀流量下，最大吞吐量仅为节点注入率上限的 50%。

---

## 5. 路由算法

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 路由算法分类</strong><br>
<ul style="margin:4px 0; padding-left:20px;">
<li><strong>最短路径（<em>Minimal</em>）vs. 非最短路径（<em>Non-Minimal</em>）</strong>：只选最短路径 vs. 允许绕道</li>
<li><strong>确定性（<em>Deterministic/Oblivious</em>）vs. 自适应（<em>Adaptive</em>）</strong>：路径固定 vs. 根据网络拥堵动态选择</li>
</ul></div>

### 5.1 维度排序路由（*Dimension-Ordered Routing, XY*）

2D Mesh 上先走 X 方向，再走 Y 方向（确定性最短路径）：

- 优点：简单，无死锁（天然无环路依赖）
- 缺点：消除了所有路径多样性，负载均衡差

### 5.2 路由死锁（*Routing Deadlock*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 路由死锁（<em>Routing Deadlock</em>）</strong><br>
死锁发生条件：存在一组数据包，每个数据包持有某个缓冲区并等待另一个被占用的缓冲区，形成循环等待（<em>resource dependence cycle</em>）。类比哲学家就餐问题（<em>Dining Philosophers</em>）。</br>
<strong>避免方法</strong>：资源依赖图不能有环路。</div>

### 5.3 转向模型（*Turn Model*, Glass & Ni 1994）

通过禁止某些方向转向来打破依赖环：

| 算法 | 禁止转向 | 路径多样性 |
|------|---------|----------|
| XY 路由 | 所有 Y→X 转向 | 1 |
| 西先（*West-First*）| 向西必须先走完 | 部分 |
| 北后（*North-Last*）| 向北必须最后走 | 部分 |
| 负先（*Negative-First*）| 负方向先走 | 部分 |

### 5.4 逃逸虚通道（*Escape Virtual Channel*）

利用虚通道（VC）实现完全路径多样性：

- VC0–VCk：允许任意转向（提高负载均衡），可能死锁
- **逃逸 VC**（1 条）：使用 XY 路由（严格无死锁），确保所有数据包最终可以排出

若 VC0 形成死锁，数据包可"跳入"逃逸 VC 继续前进，彻底避免死锁。

---

## 6. 协议死锁（*Protocol Deadlock*）

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 需要独立虚网络（<em>Virtual Networks</em>）</strong>　缓存一致性协议中，若请求和响应共用同一 VC，可能发生协议死锁（目录处理请求时需要发送响应，但响应队列被请求堵满）。解决方案：为请求和响应分配独立的虚网络（VN），完整一致性协议通常需要 3 个 VN。</div>

---

## 本讲总结

Mesh 是片上多核互连的主流拓扑；XY 路由简单无死锁但路径多样性差；转向模型通过禁止部分转向在无死锁和路径多样性间取得平衡；逃逸 VC 允许任意路由同时保证死锁自由；协议死锁需要通过独立 VN 解决；拓扑选择权衡成本（链路数、度）与性能（带宽、延迟）。
