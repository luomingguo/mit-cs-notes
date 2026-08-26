---
title: 可编程数据面（Programmable Data Plane）
course: 6.5820/6.S04 计算机网络
course_id: '6.5820'
kind: system
tags: []
status: complete
---
# Lec 11 可编程数据面（Programmable Data Plane）

阅读资料

- P. Bosshart et al., [Forwarding Metamorphosis: Fast Programmable Match-Action Processing in Hardware for SDN (RMT)](https://web.mit.edu/6.829/www/2020/papers/rmt.pdf), SIGCOMM 2013.（读前 4 节）
- P. Bosshart et al., [P4: Programming Protocol-Independent Packet Processors](https://web.mit.edu/6.829/www/2020/papers/p4.pdf), SIGCOMM CCR 2014.
- **(Optional)** A. Sivaraman et al., [Packet Transactions (Domino)](https://web.mit.edu/6.829/www/2020/papers/domino.pdf), SIGCOMM 2016.

> 承接 SDN（[[Software-Defined-Networking]]）：OpenFlow 让控制面可编程，但**数据面仍是固定功能的 ASIC**——只认协议设计者预先固化的字段。本讲问：能否让**交换芯片的数据面本身也可编程**，且不牺牲线速（Tbps）？RMT 给出硬件架构，P4 给出编程语言。

## 本讲导览

- 固定功能 ASIC 的局限
- Match-Action 抽象（OpenFlow 的核心）
- RMT：可重构的 Match-Action 流水线芯片
- P4：协议无关的数据面编程语言（PISA 抽象）
- 取舍：灵活性 vs 成本/线速
- 论文重点图

---

## 一、固定功能 ASIC 的局限

传统交换芯片把「解析哪些协议头、查哪些表、做哪些动作」**焊死在硅片里**。想支持一个新协议（如 VXLAN、新的隧道封装、自定义遥测头）就得**重新流片**，周期以年计、成本以亿计。

::: example 矛盾
SDN 想要「软件定义网络」，但若数据面只认固定的一组协议字段，控制面的灵活性就被卡在芯片能力上。人们一度认为「可编程 = 慢」（只能用 CPU/NPU/FPGA，做不到 ASIC 的 Tbps 线速）。RMT 要推翻这个成见。
:::

## 二、Match-Action 抽象

::: definition 定义 · Match-Action 表
把转发抽象成一张张表：每条规则「**匹配 (match)** 包头某些字段 → 执行 **动作 (action)**（转发到某端口、改写字段、丢弃、打标记…）」。OpenFlow 把网络行为表达成这种 match-action 规则。
:::

匹配类型：精确匹配（哈希/SRAM）、最长前缀匹配（LPM，路由）、通配/范围匹配（ACL，用 **TCAM**）。

## 三、RMT：可重构 Match-Action 流水线

RMT（Reconfigurable Match Tables）证明了「协议无关 + 可重构」的交换芯片能在 ASIC 上跑到线速。其数据面是一条**流水线**：

```text
入端口 → [可编程 Parser] → [Match-Action 阶段 1] → ... → [阶段 N] → [Deparser] → 出端口
              │                     │
          按程序识别              每级:TCAM/SRAM 查表
          任意包头                 + 动作 ALU 改写包头/元数据
```

::: definition 定义 · RMT 的可重构点
- **可编程 Parser（解析器）**：用一张状态机表描述「如何从字节流里抽取包头字段」，因此能解析**任意/新协议**，而非写死以太/IP/TCP。

- **多级 Match-Action 阶段**：每级有自己的内存（TCAM 做通配、SRAM 做精确），表的**宽度/深度/匹配字段可由软件配置**；字段不够用可跨级拼。

- **动作 ALU**：每级一组 ALU，对包头字段和**包间元数据 (metadata)** 做加减/改写/转发决策。

- **recirculation / packet header vector**：包头被抽成一个「头向量」在流水线里流动；必要时可回流再过一遍。
:::

::: theorem 推论 · 为什么能既可编程又线速
关键是**流水线 + 固定级数**：每个包恰好经过 N 个阶段、每阶段做**有界**的查表与动作，吞吐由流水线深度决定而非数据相关——所以仍是「每周期一个包」的 ASIC 线速。可编程性来自**表的形态和解析/动作可配置**，而不是引入数据相关的循环。代价：芯片要预留通用的 TCAM/SRAM 和 ALU 资源，比专用固定功能芯片面积/功耗略大（论文报告额外成本约 15%），但换来巨大灵活性。
:::

## 四、P4：协议无关的数据面编程语言

RMT 是硬件，P4 是给这类芯片写程序的**语言**。P4 程序描述：

- **headers / parser**：定义包头格式、以及解析它们的状态机；
- **tables**：声明 match-action 表（匹配哪些字段、用什么匹配类型、可执行哪些动作）；
- **actions**：原语动作的组合（改字段、加/减、转发、克隆…）；
- **control flow**：包依次经过哪些表的控制逻辑；
- **deparser**：把（可能被改过的）头向量重新组装成线上字节流。

::: definition 定义 · 协议无关（protocol-independent）与 PISA
P4 不内置任何具体协议——以太/IP 只是你用 P4 写出来的若干 header 定义而已。它面向一个抽象机器 **PISA（Protocol-Independent Switch Architecture）**：可编程 parser → 多级 match-action → deparser。一份 P4 程序由**编译器**映射到具体目标（RMT/Tofino ASIC、FPGA、软件 bmv2、智能网卡）。
:::

::: theorem 推论 · 三件事被解耦
P4 把「**解析什么协议**、**查什么表**、**做什么动作**」从硅片里解放出来交给软件，于是新协议、网内遥测（INT）、自定义负载均衡、甚至网内聚合（见 [[Networking-for-Distributed-Systems]] 的 SwitchML）都能在**不换芯片**的前提下部署。OpenFlow 是「控制面可编程 + 固定数据面字段」，P4/RMT 是「连数据面字段与处理都可编程」——可视为 SDN 的下一步。
:::

> **Domino（可选）**：再进一步，让**有状态**的数据面算法（如自定义 AQM、调度）也能在硬件线速实现。它提出 **packet transactions（包事务）** 编程模型——把每包要做的状态更新写成一段串行代码，编译器检查它能否映射到一种叫 **atom** 的硬件原子操作上；能映射则保证线速原子执行。要点：数据面的有状态操作受「每包一个时钟周期内能原子完成多少」严格约束。

## 五、论文重点图

> 论文部分只记最重点的图。

- **RMT 芯片架构图（Fig.）**：一条横贯的流水线——左端可编程 **Parser** 把包解析成「**packet header vector** + metadata」，中间 **N 个 Match-Action 阶段**（每级 TCAM/SRAM + 动作 ALU 阵列），右端 **Deparser** 重组上线。要点：级数固定、每级资源可配、字段可跨级聚合。
- **P4 抽象转发模型图**：Parser →（Ingress 多级表）→ Buffer/Queue →（Egress 多级表）→ Deparser；P4 程序填充其中的 parser/tables/actions/control，编译器再映射到具体目标。

## 本讲小结

> 数据面长期是固定功能 ASIC，限制了 SDN 的灵活性。**RMT** 用「可编程 parser + 多级可重构 match-action + 动作 ALU」的流水线，证明协议无关的交换芯片能跑到线速（约 15% 额外成本）；**P4** 是面向 PISA 抽象的协议无关语言，把「解析/查表/动作」交给软件、由编译器映射到各种目标。二者共同把可编程性从控制面推进到数据面。
