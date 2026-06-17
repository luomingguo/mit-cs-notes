# Lec 15 片上网络 I：基础
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Tushar Krishna · 日期：2024-04-07

## 1. NoC 的动机

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 片上网络（<em>Network-on-Chip, NoC</em>）</strong><br>
多核芯片中，各核心、缓存和内存控制器之间需要互连通信（尤其是缓存一致性消息）。NoC 是将网络交换机（<em>router</em>）和链路集成在芯片上的片上互连结构，解决传统总线（<em>bus</em>）带宽瓶颈和可扩展性问题。</div>

**NoC 的四个设计维度**：

| 维度 | 类比 | 功能 |
|------|------|------|
| 拓扑（*Topology*）| 道路网络 | 节点如何连接 |
| 路由（*Routing*）| 路段序列 | 消息走哪条路径 |
| 流控（*Flow Control*）| 红绿灯 | 消息何时前进/等待 |
| 路由器微架构（*Router Microarch*）| 交叉口设计 | 如何构建路由节点 |

---

## 2. 数据包结构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 数据包与微片（<em>Packet & Flit</em>）</strong><br>
数据包（<em>packet</em>）包含完整的头部（源、目的地址）和有效载荷。为了高效流水线传输，数据包被分割为固定大小的<em>微片（flit, flow control unit）</em>：<br>
<ul style="margin:4px 0; padding-left:20px;">
<li><strong>头微片（head flit）</strong>：含路由信息（目的地址）</li>
<li><strong>体微片（body flit）</strong>：数据有效载荷</li>
<li><strong>尾微片（tail flit）</strong>：标记数据包结束</li>
</ul></div>

---

## 3. 流量控制（*Flow Control*）

当下游路由器缓冲区满时，上游必须等待。三种处理方式：

| 策略 | 行为 | 代价 |
|------|------|------|
| 丢包（*Drop*）| 丢弃 flit，发送方重传 | 丢包检测复杂 |
| 误路（*Misroute*）| 走非最短路径绕行 | 延迟增加 |
| 等待（*Wait/Credit-Based*）| 上游等待直到有空间 | 最常用，需信用计数 |

**基于信用（*Credit-Based*）的背压机制**：

- 每个下游缓冲区槽对应 1 个信用（*credit*）
- 上游路由器发送 flit 时消耗 1 信用
- 下游 flit 被消费后，发送 credit 返回上游
- 上游信用为 0 时停止发送（*stall*）

---

## 4. 虫孔流控（*Wormhole Flow Control*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 虫孔流控（<em>Wormhole Flow Control</em>）</strong><br>
数据包头微片一旦找到空闲链路就立即传输，后续体/尾微片紧随（像蠕虫钻入管道）。不需要在中间路由器存储整个数据包（降低缓冲区需求），但一个数据包可能同时占用多个路由器的链路，导致<strong>队头阻塞（<em>Head-of-Line Blocking, HOL Blocking</em>）</strong>：一个大包堵住链路，小包无法通过。</div>

---

## 5. 虚通道（*Virtual Channels, VC*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 虚通道（<em>Virtual Channel</em>）</strong><br>
在同一物理链路上划分多个独立的 flit 缓冲队列（虚通道），多个数据包可以共享同一物理链路但使用不同的 VC 缓冲区。VC 的关键用途：<br>
（1）缓解 HOL Blocking：不同 VC 的队头互不阻塞<br>
（2）死锁避免：通过限制 VC 转换方向打破依赖环路</div>

---

## 6. 路由器微架构流水线

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 5 级路由器流水线</strong><br>
<ol style="margin:4px 0; padding-left:20px;">
<li><strong>BW（Buffer Write）</strong>：flit 写入输入缓冲区</li>
<li><strong>RC（Route Computation）</strong>：根据目的地计算输出端口</li>
<li><strong>VA（VC Allocation）</strong>：为 flit 分配下游虚通道</li>
<li><strong>SA（Switch Allocation）</strong>：竞争使用交叉开关（<em>crossbar</em>）的输出端口</li>
<li><strong>ST（Switch Traversal）+ LT（Link Traversal）</strong>：flit 通过交叉开关并传输到下游链路</li>
</ol></div>

**交叉开关类型**：
- **基于多路选择器（*Mux-Based*）**：面积小，但并行度有限
- **矩阵型（*Matrix Crossbar*）**：面积 $O(N^2)$，全无阻塞，延迟小

---

## 7. 性能指标

**零负载延迟（*Zero-Load Latency*）**：

$$T_N = H \times (t_r + t_l) + T_s + T_c$$

- $H$：跳数（<em>hop count</em>）
- $t_r$：路由器延迟，$t_l$：链路延迟（静态，取决于拓扑和路由）
- $T_s$：序列化延迟 = 数据包长度 / 链路带宽（静态）
- $T_c$：竞争延迟（动态，取决于流量）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 环形 NoC 的零负载延迟</strong></div>

8 节点环形拓扑，路由器延迟 1 周期，链路延迟 1 周期，数据包 4 flit，带宽 1 flit/周期：

- 最坏跳数（直径）= $\lfloor 8/2 \rfloor = 4$
- 序列化延迟 $T_s = 4/1 = 4$ 周期
- 零负载延迟 $= 4 \times (1+1) + 4 = 12$ 周期

Sol：增加带宽（更宽链路）可减少 $T_s$；使用 2D Mesh 减少平均跳数可减少路由延迟。

---

## 本讲总结

NoC 以路由器+链路替代总线，解决多核芯片的互连扩展性问题；数据包拆分为 flit 流水传输；基于信用的背压机制保证不丢包；虫孔流控降低缓冲需求但引入 HOL Blocking；虚通道缓解 HOL 并用于死锁避免；5 级路由器流水线平衡了延迟和吞吐量。
