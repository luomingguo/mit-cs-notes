---
title: 可靠性（Reliability）
course: 6.590 计算机系统架构
course_id: '6.590'
lecture: 19
kind: system
tags: []
status: complete
---
# Lec 19 可靠性（*Reliability*）

> MIT 6.5900 Fall 2024 · Joel Emer（多数幻灯片来自 Joel Emer 关于 AVF 工作的公开报告）
> 主题：硬/软错误、宇宙射线与软错误、冗余技术、可靠性度量（FIT/MTTF）、体系结构脆弱性因子（*AVF*）与 ACE 分析

---

## 一、单比特状态被改变的事件

- **硬错误**（*Hard Error*）：**永久性**的改变；
- **软错误**（*Soft Error*）：**非永久性**的改变。

### 中子撞击对硅器件的影响

中子撞击释放**电子-空穴对**，可被源/漏吸收从而改变器件状态。次要来源：来自封装材料的 **α 粒子**。

### 宇宙射线来自深空

- 中子通量在**高海拔更高**：丹佛（5,000 英尺）增加 3–5×；飞机（30,000+ 英尺）增加约 **100×**。

### 电荷生成基础

| 能量 | 电子-空穴对 | 电荷（fC）|
| --- | --- | --- |
| 3.6 eV | 1 | $3.2 \times 10^{-4}$ |
| 1 MeV | $\sim 2.8 \times 10^5$ | $\sim 44$ |
| 1 GeV | $\sim 2.8 \times 10^8$ | $\sim 44 \times 10^3$ |

> 2010 年：DRAM 临界电荷约 25 fC，SRAM 临界电荷 <4 fC。>1 GeV 的宇宙射线会产生 >1 MeV 的中子。

### 真实事件

公开披露的软错误事件包括：大型服务器的错误日志（Normand, 1996）；Sun 旗舰服务器因 L2 cache 防护缺陷被宇宙射线击中而崩溃；Cypress 报告单个软错误曾让一座造价十亿美元的汽车工厂每月停产一次；2003 年比利时 Schaerbeek 一次"单事件翻转"给某候选人**多加了 4,096 票**。

---

## 二、物理解法很难

- **屏蔽**？无实用吸收材料（约需 >10 英尺混凝土）；这点不同于易被阻挡的 α 粒子；
- **工艺解法**？部分耗尽 SOI 有些帮助但对逻辑影响不清；全耗尽 SOI 可能有助但难制造；**FinFET** 显示出显著更低的脆弱性；
- **电路级解法**？抗辐射电路可带来 10× 改善，但在性能、面积、成本上代价巨大；2–4× 改善或可以较小代价实现。

---

## 三、冗余技术

| 技术 | 代表 | 机制 |
| --- | --- | --- |
| **三模冗余**（*Triple Modular Redundancy, TMR*）| Von Neumann, 1956 | 三个模块 M，投票器 V 对结果**多数表决** |
| **双模冗余**（*Dual Modular Redundancy, DMR*）| BINAC 1949, Stratus 1982 | 不匹配时停机，用错误信号决定用哪个处理器恢复另一个状态 |
| **配对加备用锁步**（*Pair and Spare Lockstep*）| Tandem, 1975 | 主机周期性建检查点，不匹配时备机从检查点重启 |
| **冗余多线程**（*Redundant Multithreading, RMT*）| Reinhardt, Mukherjee, 2000 | 前导线程与尾随线程，**对写进行检查** |

### 部件保护

> Fujitsu SPARC（130 nm，ISSCC 2003）：20 万个锁存器中 80% 用**奇偶校验**保护；结合奇偶（Parity）与 **ECC**。

---

## 四、一次比特撞击的后果分类

撞击某比特（如寄存器文件中）后的判定流程：

1. 该比特**会被读吗**？不读 → **良性故障**（无错误）；
2. 读了 → 该比特**有错误保护吗**？
   - **有检测+纠正**：无错误；
   - **仅检测**：看是否影响程序结果 → 影响则 **True DUE**，不影响则 **False DUE**；
   - **无保护**：看是否影响程序结果 → 影响则 **SDC**，不影响则良性。

> 术语：**SDC** = Silent Data Corruption（静默数据损坏）；**DUE** = Detected Unrecoverable Error（已检测的不可恢复错误）。

---

## 五、可靠性度量

### 基于间隔

- **MTTF** = 平均失效前时间（Mean Time To Failure）；
- **MTTR** = 平均修复时间（Mean Time To Repair）；
- **MTBF** = 平均失效间隔 = MTTF + MTTR；
- **可用性**（*Availability*）= MTTF / MTBF。

### 基于速率

- **FIT** = Failure In Time = 十亿小时内 1 次失效；
- 1 年 MTTF $= \dfrac{10^9}{24 \times 365}$ FIT $= 114{,}155$ FIT；
- **SER FIT = SDC FIT + DUE FIT**。

> 假想例：总计 158K FIT（Cache 0 + IQ 100K + FU 58K）。
> 典型目标：SDC 目标约 1000 年 MTBF，DUE 目标约 10–25 年 MTBF。随 Moore 定律脆弱比特数增长，二者间存在约 **12× 的差距**。

---

## 六、体系结构脆弱性因子（*Architectural Vulnerability Factor, AVF*）

$$
\text{AVF}_{bit} = \text{P(该比特重要)} = \frac{\text{可见错误数}}{\text{粒子撞击造成的比特翻转数}}
$$

$$
\text{FIT}_{bit} = \text{intrinsic FIT}_{bit} \times \text{AVF}_{bit}
$$

### 统计故障注入（*Statistical Fault Injection, SFI*）

在 RTL 上模拟对锁存器的撞击，检查故障是否传播到体系结构状态。

> 优点：天然刻画所有逻辑结构。缺点：RTL 在设计后期才有；需翻遍所有比特做大量实验；一般在芯片级做；结构洞察有限。

### AVF 直觉：这个比特重要吗？

- **分支预测器**：完全不重要（AVF = 0%）——错了只是预测失误，不影响正确性；
- **程序计数器**：几乎总重要（AVF ≈ 100%）。

---

## 七、ACE 分析

### 体系结构正确执行（*Architecturally Correct Execution, ACE*）

- **ACE 路径**只要求**一部分值**正确流过程序数据流图（与机器）；
- 其他（**un-ACE 路径**）都可被"折减掉"（derated away）。

> un-ACE 指令示例：**动态死指令**（*dynamically dead instruction*）——其大多数比特不影响程序输出。

### 结构的脆弱性

$$
\text{AVF} = \text{一个比特含 ACE 状态的周期占比} = \frac{\text{每周期平均 ACE 比特数}}{\text{结构中总比特数}}
$$

> 例：4 个周期里 ACE 比特数分别为 2、1、0、3，则 $\text{AVF} = \dfrac{(2+1+0+3)/4}{4}$。

### ACE 版 Little's Law

$$
N_{ace} = T_{ace} \times L_{ace}, \qquad \text{AVF} = \frac{N_{ace}}{N_{total}}
$$

### 计算 AVF 的方法

- 方法**保守**：除非证明否则假设每个比特都是 ACE；
- 用性能模型做**数据分析**：证明结构中的数据是 un-ACE；
- 用性能模型做**时序分析**：跟踪数据在结构中停留的时间。

### ACE 生命期分析（以写穿透数据 Cache 为例）

- 阶段示例：Fill → Read → Read → Evict，以及 Idle；
- **Idle 是 un-ACE**；若 3/5 生命期比特有效，给出结构利用率的度量（有用比特数 + 有用比特驻留时间，对特定 trace 有效）；
- **Valid 不一定 ACE**：ACE 成分如 fill-to-read、read-to-read；un-ACE 成分如 idle、read-to-evict、write-to-evict（此时 AVF = 2/5 = 40%）；
- 数据的 ACE 性还取决于**指令的 ACE 性**：若第二次 Read 来自一条 un-ACE 指令，则 AVF 降为 1/5 = 20%。

### 动态指令构成

> Spec2K 切片平均：动态死 20%、性能指令 1%、NOP 26%、谓词为假 7%、ACE 46%。

### 把 ACE/un-ACE 指令映射到指令队列（IQ）

- **架构级 un-ACE**：错误路径指令、动态死、谓词为假；
- **微架构级 un-ACE**：Idle、NOP、预取；
- 某 IQ 示例：ACE 29%、Idle 31%、NOP 15%、Ex-ACE 10%、动态死 8%、错误路径 3%、谓词为假 3%、性能指令 1% → **AVF = 29%**。

---

## 八、带奇偶校验的 IQ 的 DUE AVF 与 π 位

> Itanium®2 类机器（CPU2000）示例：True DUE AVF 29%，False DUE AVF 33%（含未提交 6%、中性 16%、动态死 11%、Idle 及其他 38%）。

**应对错误路径指令**（假设 IQ 受奇偶保护）：

- **问题**：在 issue 时**信息不足**，无法确定是否错误路径，若此时就报错会产生 False DUE；
- **π 位（Possibly Incorrect Bit）**方案：在 issue 时把错误**记录在 π 位**上，到 **commit** 点才判定——**仅当不是错误路径指令且 π 位被置位时**才报错。

### IQ 中 False DUE 的来源与对策

| 来源 | 例子 | 对策 |
| --- | --- | --- |
| 结果未提交的指令 | 错误路径、谓词为假 | π 位保持到 commit |
| 对错误中性的指令类型 | NOP、预取、分支预测提示 | anti-π 位 |
| 动态死指令 | 结果将来不被使用 | π 位延续到 commit 之后 |

---

## 九、2020 年代的可靠性问题

- **静默数据损坏（SDC）**：云厂商发现 SDC 在大规模基础设施中是普遍问题（Google "Cores that don't count", HotOS 2021；Facebook "Silent Data Corruption at Scale", arXiv 2021）。问题在于**错误检测延迟长**（数天到数周）与**可扩展性**；
- **Rowhammer**：反复访问某一行足够多次，会在相邻行引发**扰动错误**（disturbance errors）。

---

## 本讲小结

- 软错误主要由中子/α 粒子撞击引起，物理解法（屏蔽/工艺/电路）代价高，FinFET 有帮助；
- 系统级靠**冗余**（TMR/DMR/锁步/冗余多线程）与**部件保护**（奇偶、ECC）；
- 一次比特翻转的后果分为良性、True/False DUE、SDC；可靠性用 **MTTF/MTBF/可用性**与 **FIT** 度量；
- **AVF** 与 **ACE 分析**量化"哪些比特真正重要"，从而避免对 un-ACE 状态过度保护；**π 位**用于降低 False DUE；
- 2020 年代 SDC 与 Rowhammer 成为新的大规模可靠性挑战。

> 下一讲：GPUs
