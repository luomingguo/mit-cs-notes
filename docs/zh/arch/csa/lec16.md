---
title: '片上网络（二）：路由器微架构与路由（On-Chip Networks II: Router Microarchitecture & Routing）'
course: 6.590 计算机系统架构
course_id: '6.590'
lecture: 16
kind: system
tags: []
status: complete
---
# Lec 16 片上网络（二）：路由器微架构与路由（*On-Chip Networks II: Router Microarchitecture & Routing*）

> MIT 6.5900 Fall 2024 · Daniel Sanchez
> 主题：路由器微架构与流水线、分配器（*allocator*）、流水线优化、路由算法、死锁与转向模型（*Turn Model*）

---

## 一、回顾：虫孔 vs 虚通道流量控制

- **虫孔**（*Wormhole*）：每个路由器以 flit 为单位管理缓冲，包尽快经输出链路转发（不等所有 flit 到齐）。路由器缓冲放不下整包，拥塞时包的 flit 常跨多个路由器缓冲。**问题**：拥塞时分配给被阻塞包的链路无法被其他包使用。
- **虚通道**（*VC*）：包阻塞时占住虚通道而非物理信道。**VC = 信道状态 + flit 缓冲**。多个 VC 减少阻塞（虫孔相当于 1 VC/信道）。
> VC 优点：显著减少阻塞。缺点：路由器更复杂，需公平的 VC 分配。

---

## 二、路由器微架构

### 基于环的互连

由若干环停（*ring stop*）串成环。每个环停在输入处判断：若环上无流量则允许新输入进入；若环上有流量，需决定**环上流量与新输入谁优先**。

- **旋转规则**（*Rotary Rule*）：**环上流量优先**；
- **弹回**（*Bounces*）：若环上流量无法投递（如输出 FIFO 满），一种做法是让它继续在环上绕（弹回）。后果：环上流量不再是 FIFO 顺序。

> 更一般的互连（如 *Tilera*、*Knights Landing*）用 2-D 网格。

### 路由器里有什么

路由器本身也是一个系统：

- **逻辑**：状态机、仲裁器（*arbiter*）、分配器（*allocator*）——控制数据在路由器内的移动（Idle / Routing / Waiting / Active）；
- **存储**：缓冲——转发前存放 flit（SRAM、寄存器）；
- **通信**：交换——把 flit 从输入端口送到输出端口（crossbar、多 crossbar、全连接、总线）。

### 路由器流水线 vs 处理器流水线

虚通道路由器的逻辑级（*logical stages*）：

| 缩写 | 含义 |
| --- | --- |
| **BW** | Buffer Write（缓冲写入）|
| **RC** | Route Computation（路由计算）|
| **VA** | VC Allocation（虚通道分配）|
| **SA** | Switch Allocation（交换分配）|
| **ST** | Switch Traversal（交换穿越）|
| **LT** | Link Traversal（链路穿越）|

> 类比处理器流水线 IF/ID/EX/MEM/WB：不同 flit 经历不同阶段，不同路由器有不同变体（推测、前瞻、旁路）。

### 基线路由器流水线

- **路由计算每包一次**；
- **虚通道每包分配一次**；
- 体 flit 与尾 flit **继承头 flit** 的这些信息（故只需经 BW → SA → ST → LT）。

```text
Head : BW RC VA SA ST LT
Body : BW          SA ST LT
Tail : BW          SA ST LT
```

### 路由器中的分配器

- **VC 分配器**（*VC Allocator*）：各输入 VC 为一组输出 VC 提出请求。例：East 输入端口的某 VC0 包要去 West 输出端口，希望拿到该输出端口的任一 VC；
- **交换分配器**（*Switch Allocator*）：同一输入端口的各输入 VC 请求不同输出端口（一个去 North，一个去 West）；
- 为效率常用**贪心**算法；分配失败的周期会产生**停顿**（VA/SA stall）。

---

## 三、流水线优化

### 1. 前瞻路由（*Lookahead Routing*）[Galles, SGI Spider]

在当前路由器为**下一个路由器**做路由计算：头 flit 已携带下一跳的输出端口，RC 只需读出（快，可与 BW 重叠）。预计算路由使 flit 在 BW 后可立即竞争 VC；下一跳的路由计算（NRC）可与 VA 并行。或者直接简化 RC（如 X-Y 路由非常快）。

```text
BW  RC
        VA  NRC  SA  ST  LT
```

### 2. 推测交换分配（*Speculative Switch Allocation*）[Peh & Dally, 2001]

**假设 VA 阶段会成功**（低到中等负载下成立），则 VA 与 SA 并行完成；若 VA 失败（没返回 VC），下周期重做 VA/SA。优先非推测请求。

```text
BW  RC  VA
        SA  ST  LT
```

---

## 四、路由算法

### 路由算法的性质（回顾）

确定性/无关、自适应、最小、无死锁。

### 网络死锁（*Network Deadlock*）

> 流 A 持有信道 u、v，但要前进必须拿到 w；流 B 持有 w、x，但要前进必须拿到 u —— 互相等待，**死锁**。

### 维序路由（*Dimension-Order Routing, DOR*）

- **XY 序**：先走 X 方向再走 Y 方向，用 4 种转向中的 2 种；
- **YX 序**：先 Y 后 X，同样用 2 种转向；
- XY 无死锁，YX 无死锁——但 **XY + YX 混用会死锁**！

### 转向与转向模型（*Turn Model*）[Glass and Ni, 1994]

- 判断路由是否无死锁的一种视角：看**允许哪些转向**；若允许的转向能构成**环**则可能死锁；
- **转向模型**：系统化地用尽量少的禁止转向生成无死锁路由；
- 只要路由符合至少一个转向模型（即信道依赖图无环），即无死锁；
- 常见模型：**West-First**（先西）、**North-Last**（后北）；允许更多转向可支持自适应路由，但也可能引入死锁（如六转向模型）。

### 信道依赖图（*Channel Dependency Graph, CDG*）

- CDG 的**顶点表示网络链路**，**边对应网络中的转向**；
- 禁止 180° 转向（如 AB → BA）；
- 由拓扑导出的 CDG 可能含**许多环**——例如沿 AB→BE→EF 与 EF→FA→AB 的两个流会形成环导致死锁；
- **关键洞见**：若各流的路由符合**无环 CDG**，则不可能死锁；做法是删除 CDG 中某些边（即禁止某些转向）——可以特设（ad-hoc）删，也可按 West-First 等模型删。

### 用虚通道避免死锁

通过**限制 VC 分配**可避免死锁：把每条物理链路拆成多个 VC（如 AF0/AF1、FE0/FE1……），让原本会成环的依赖落在不同 VC 上，从而打破环。

### 随机化路由

- **Valiant**：把每个包先路由到一个**随机选择的中间节点** $I_A$，再从 $I_A$ 到最终目的 $D_A$。有助于网络负载均衡、最坏情况性能好，但**牺牲局部性**；
- **ROMM**（Randomized, Oblivious, Multi-phase, Minimal）：为保留局部性，**在最小象限内**选中间节点，等价于在源到目的的各条最小路径中随机选一条。

---

## 本讲小结

- 路由器是含逻辑（分配器/仲裁器）、存储（缓冲）、通信（crossbar）的小系统，流水线分 BW/RC/VA/SA/ST/LT；
- 前瞻路由与推测交换分配可缩短流水线关键路径；
- 维序路由（XY/YX）简单无死锁但混用会死锁；**转向模型**与**无环 CDG**是系统化保证无死锁的工具；虚通道可通过限制分配打破依赖环；
- 随机化路由（Valiant/ROMM）以局部性换取负载均衡与更好的最坏情况性能。

> 下一讲：事务内存（Transactional Memory）
