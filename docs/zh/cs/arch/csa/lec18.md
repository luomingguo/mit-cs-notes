---
title: 微码与 VLIW 处理器（Microcoded and VLIW Processors）
type: lecture
lecture: 18
tags: []
status: complete
---
# Lec 18 微码与 VLIW 处理器（*Microcoded and VLIW Processors*）

> MIT 6.5900 Fall 2024 · Daniel Sanchez
> 主题：硬连线 vs 微码（*microcode*）、微码控制器与微指令、VLIW 设计原理、循环调度技术、Trace Scheduling、IA-64（谓词/推测/数据推测）

---

## 一、硬连线 vs 微码处理器

- 此前所见处理器都是**硬连线**（*hardwired*）：微架构直接实现 ISA 中所有指令；
- **微码处理器**（*microcoded*）加一层解释：每条 ISA 指令作为一串更简单的**微指令**（*microinstruction*）执行；
  - 实现更简单；
  - 性能低于硬连线（CPI > 1）；
- 微码在 80 年代前很常见，至今仍在用（如复杂 x86 指令被译码为多个 *micro-op*）。

### 微控制单元 [Maurice Wilkes, 1954]

把控制逻辑的状态表嵌入**只读存储器阵列**：由 op、条件码、触发器决定下一状态与 µ 地址，输出到 ALU/MUX/寄存器的控制线。

### 微码微架构

- **µ 控制器（ROM）**：存固定的微码指令；
- **存储器（RAM）**：存用户程序，即用宏码（macrocode）写的指令（MIPS、x86、RISC-V 等）；
- 数据通路（Datapath）受 µ 控制器驱动，与存储器交互（opcode、zero?、busy?、enMem、MemWrt 等信号）。

---

## 二、RISC-V 的总线式数据通路

微指令即**寄存器到寄存器的传输**（共 17 个控制信号）。例如：

- `MA ← PC` 表示 `RegSel=PC; enReg=yes; ldMA=yes`；
- `B ← Reg[rs1]` 表示 `RegSel=rs1; enReg=yes; ldB=yes`。

**存储器模块假设**：存储器**异步**工作，相对于寄存器到寄存器传输**很慢**（用 busy 信号同步）。

### 微码控制器与跳转逻辑

µPC 的跳转类型与下一状态：

$$
\mu PCSrc = \begin{cases}
\text{next} & \mu PC + 1 \\
\text{spin} & \text{if } busy \text{ then } \mu PC \text{ else } \mu PC + 1 \\
\text{fetch} & \text{absolute} \\
\text{dispatch} & \text{op-group} \\
\text{feqz} & \text{if } zero \text{ then absolute else } \mu PC + 1 \\
\text{fnez} & \text{if } zero \text{ then } \mu PC + 1 \text{ else absolute}
\end{cases}
$$

> 输入编码降低 ROM 高度，下一状态编码降低 ROM 宽度。

### 指令执行的步骤

执行一条 RISC-V 指令涉及：① 取指；② 译码与取寄存器；③ ALU 操作；④ 存储器操作（可选）；⑤ 写回寄存器文件（可选）；外加**下一条指令地址的计算**。

**取指序列**示例：

```text
fetch0: MA ← PC          next
fetch1: IR ← Memory      spin       # 等存储器
fetch2: A ← PC           next
fetch3: PC ← A + 4       dispatch   # 按 opcode 分派
```

**Load / Store**（含 `spin` 等存储器）：

```text
LW0: A ← Reg[rs1]   LW1: B ← sExt(Imm)   LW2: MA ← A+B   LW3: Reg[rd] ← Memory (spin)   LW4: fetch
SW0: A ← Reg[rs1]   SW1: B ← sExt(Imm)   SW2: MA ← A+B   SW3: Memory ← Reg[rs2] (spin)  SW4: fetch
```

**分支**用 `fnez`/`feqz` 决定是否跳转（BEQ、BNE、BLT 等）；**跳转** JAL/JALR 计算 `JumpTarg(A,B)`。

> 历史实例：*VAX 11/780* 微码（1978）。

---

## 三、VLIW：超长指令字（*Very Long Instruction Word*）

### 顺序 ISA 瓶颈

超标量处理器需在**硬件**里检查指令依赖、找独立操作、调度执行；而 VLIW 把"找独立操作 + 调度"交给**编译器**。

### VLIW 思想

- 一条指令打包**多个操作**；
- 每个操作槽对应**固定功能单元**；
- 指定**恒定的操作延迟**。

> 示例打包：`Int Op1 | Int Op2 | Mem Op1 | Mem Op2 | FP Op1 | FP Op2`（两个整数单元单周期、两个 load/store 三周期、两个浮点四周期）。

### VLIW 设计原理

**架构**：

- 允许指令内的操作并行——**不做跨操作 RAW 检查**；
- 为所有操作提供**确定性延迟**（以"指令"为单位计量）；在指定延迟前不允许使用数据，且**无数据互锁**（interlock）。

**编译器**：

- 调度（重排）以最大化并行执行；
- 保证指令内并行；
- 调度以避开数据冒险（无互锁）——通常用显式 **NOP** 分隔操作。

### 早期 VLIW 机器

- *FPS AP120B*（1976）：科学附加阵列处理器，首台商用宽指令机，手写向量数学库用软件流水与循环展开；
- *Multiflow Trace*（1987）：Fisher 在 Yale 的思想（含 *trace scheduling*）商业化，7/14/28 操作每指令，28 操作打进 1024-bit 指令字；
- *Cydrome Cydra-5*（1987）：7 操作编入 256-bit 指令字，带**旋转寄存器文件**。

---

## 四、循环调度技术

### 循环执行的基线

```c
for (i = 0; i < N; i++) B[i] = A[i] + C;
```

朴素调度下约 **1 fadd / 8 cycles = 0.125** FLOP/cycle。

### 循环展开（*Loop Unrolling*）

一次做 4 次迭代：

```c
for (i = 0; i < N; i += 4) {
    B[i]   = A[i]   + C;
    B[i+1] = A[i+1] + C;
    B[i+2] = A[i+2] + C;
    B[i+3] = A[i+3] + C;
}
```

> 是否总正确？**不**——当 N 不是展开因子的倍数时，需用最终的**清理循环**（cleanup loop）处理余数。

展开 4 路后调度约 **4 fadds / 11 cycles ≈ 0.36** FLOP/cycle。

### 软件流水（*Software Pipelining*）

把不同迭代的不同阶段重叠（含 prolog 序幕、iterate 主体、epilog 尾声），可达 **4 fadds / 4 cycles = 1** FLOP/cycle。

> **软件流水 vs 循环展开**：软件流水只在**整个循环**付一次启动/收尾开销，而非每次迭代都付。

---

## 五、无循环代码：Trace Scheduling

- 控制流密集的不规则代码中，**分支限制了基本块大小**，单个基本块内难找 ILP；
- **Trace Scheduling** [Fisher, Ellis]：挑出代表**最频繁分支路径**的一串基本块（一条 *trace*），整条 trace 一起调度，并为跳出 trace 的分支加**修补代码**（fixup）；
- 如何知道选哪条 trace？用**剖析反馈**（profiling）或编译器启发式找常见分支路径。

### "经典" VLIW 的问题

- 需知道分支概率（剖析增加构建步骤）；
- 为静态不可预测的分支调度（最优调度随分支路径变化）；
- **目标码体积**：指令填充浪费指令存储/Cache，展开/软件流水复制代码；
- **访存操作调度**：Cache/存储体冲突带来静态不可预测的变化，地址不确定限制重排；
- **目标码兼容性**：每台机器（甚至同代两台）都要重新编译。

### VLIW 指令编码

减少未用字段影响的方案：内存中用**压缩格式**、I-cache 重填时展开（Multiflow Trace，但带来指令寻址挑战）；提供**单操作 VLIW 指令**（Cydra-5 UniOp）；**标记并行组**（TMS320C6x DSP、Intel IA-64）。

---

## 六、IA-64：以软件克服静态调度的限制

### Cydra-5 的存储延迟寄存器（*MLR*）

- 问题：load 延迟可变；
- 方案：让软件选择期望的存储延迟。编译器按最大 load-use 距离调度，软件把 MLR 设为匹配该调度的延迟，硬件保证 load **恰好用 MLR 个周期**返回（早到则缓冲、晚到则停顿）。

### 谓词执行（*Predicated Execution*）

- 问题：误预测分支限制 ILP；
- 方案：用谓词执行消除难预测的分支。几乎所有 IA-64 指令都可在谓词下条件执行，谓词寄存器为假时指令变 NOP。把 if/else 的四个基本块压成**一个基本块**。
> [Mahlke et al., ISCA'95]：平均可移除 >50% 的分支。

### 推测执行（*Speculative Execution*）

- 问题：分支限制编译器的代码移动（不能把 load 提到分支之上，否则可能引发**伪异常**）；
- 方案：用不引发异常的**推测 load**（`Load.s`）——推测 load 永不引发异常，只在目标寄存器置"**毒位**"（poison bit）；在原归属块用 `Chk.s` 检查异常，若检测到则跳转到修补代码。对**提前调度长延迟 load** 特别有用。

### 数据推测（*Data Speculation*）

- 问题：可能的内存冒险限制代码调度（不能把 load 提到 store 之上，因 store 可能写同一地址）；
- 方案：基于指令的推测 + 硬件监视器检查指针冒险。数据推测 load（`Load.a`）把地址加入**地址检查表**；store 作废表中任何匹配的 load；用 `Load.c` 检查 load 是否失效（或缺失），若是则跳转修补代码。需要表中的**关联硬件**。

### 集群化 VLIW（*Clustered VLIW*）

把机器分成若干**集群**，每个集群有本地寄存器文件与本地功能单元；集群间用**低带宽/高延迟**互连。软件负责把计算映射到集群以最小化通信开销。常见于商用嵌入式处理器（TI C6x DSP、HP Lx），也见于部分超标量处理器（Alpha 21264）。

---

## 七、静态调度的极限

VLIW 类技术的根本限制：不可预测的分支、不可预测的访存行为（Cache 缺失与依赖）、代码体积爆炸、编译器复杂度。
> 思考题：VLIW 启发的技术对传统 RISC/CISC 架构的适用性如何？

---

## 本讲小结

- **微码**用一层解释把复杂指令拆成简单微指令，实现简单但 CPI>1；今天仍以 x86 micro-op 形式存活；
- **VLIW** 把找并行与调度的重担从硬件移到**编译器**，靠固定功能槽、确定延迟、无互锁换取简单硬件；
- 循环展开、**软件流水**、**Trace Scheduling** 是挖掘 ILP 的关键编译技术；
- **IA-64** 用谓词执行、推测 load、数据推测等以软件克服分支与访存对静态调度的限制；但静态调度终受不可预测性与代码体积所限。

> 下一讲：可靠性（Reliability）
