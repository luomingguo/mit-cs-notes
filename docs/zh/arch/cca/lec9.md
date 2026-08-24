---
title: 超标量处理器
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 9
kind: system
tags: []
status: complete
---
# Lec 9 超标量处理器
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Martin Chan / Thomas Bourgeat · 日期：2024-03-07

## 1. 超标量的动机

提高 IPC（*Instructions Per Cycle*）的思路：

$$\text{Time} = \frac{\text{Instructions}}{\text{Program}} \times \frac{\text{Cycles}}{\text{Instruction}} \times \frac{\text{Time}}{\text{Cycle}}$$

前面各节解决了分支/缓存缺失等问题，但 IPC 仍 ≤ 1。超标量（*Superscalar*）的思路：**每周期同时发射（*issue*）和执行多条指令**。

::: definition
**定义 — 超标量（*Superscalar*）**

超标量处理器每周期可以取指、译码、执行、写回两条或更多条指令。宽度（*issue width*）为 2 的处理器称为 2-wide superscalar，理论 IPC 上限为 2。
:::

---

## 2. Fetch 阶段扩展

**挑战**：同时取两条指令要求它们在同一 I-Cache 行中。

```bsv
// 返回 1 或 2 条指令
typedef struct {Word ins1; Maybe#(Word) ins2;} OneOrTwoWords;

rule fetch;
    toImem.enq(pcf);
    f2d.enq1(F2D{pc: pcf, ppc: pcf+4, epoch: epoch});
    if (!notLineBoundary(pcf)) begin  // 同一 Cache 行
        f2d.enq2(F2D{pc: pcf+4, ppc: pcf+8, epoch: epoch});
        pcf <= pcf + 8;
    end else
        pcf <= pcf + 4;
endrule
```

**超标量 FIFO（*SuperFIFO*）**：支持每周期最多 2 次入队/出队：

```bsv
interface SuperFIFO#(type t);
    method Action enq1(t x);
    method Action enq2(t x);   // 隐含 enq1 已调用
    method Action deq1;
    method Action deq2;         // 隐含 deq1 已调用
    method t first1;
    method t first2;
endinterface
```

**旋转实现（*Rotating FIFO*）**：用 2 个内部队列，轮换追踪最旧元素（`currentDeq`）和下一个写入位置（`currentEnq`）。

---

## 3. Decode 阶段扩展

同时译码两条指令，需处理指令间依赖：

```bsv
if (noDependency(ins1, sb) && noDependency(ins2, sb) && noDependencyBetween(ins1, ins2)) begin
    d2e.enq1("ins1");  d2e.enq2("ins2");
    f2d.deq1;          f2d.deq2;
end else if (noDependency(ins1, sb)) begin
    d2e.enq1("ins1");  f2d.deq1;    // 部分停顿（partial stall）
end
// else：完全停顿
```

**指令间依赖（*Inter-Instruction Dependency*）**：ins2 的源寄存器与 ins1 的目标寄存器相同时，ins2 必须等待 ins1 完成写回后才能读取正确值（或通过旁路解决）。

::: example 例题 — Decode 依赖矩阵

:::

对所有（ins1, ins2）情况分类：

| ins1 状态 | ins2 状态 | ins2 依赖 ins1？ | 操作 |
|----------|----------|---------------|------|
| 无依赖 | 无依赖 | 否 | 双发射 |
| 无依赖 | 无依赖 | **是** | 仅发射 ins1 |
| 有依赖（stall）| — | — | 停顿 |

Sol：覆盖所有 3×3 情况（ins1 ok/stall/cond × ins2 的对称情况），并在单元测试中逐一验证。

---

## 4. Execute 阶段扩展

**结构冒险（*Structural Hazard*）**：

- ALU × 2：可以，复制两个 ALU
- 访存（Load/Store）× 2：困难（同一 D-Cache 端口冲突）
- 控制流 × 2：困难（分支重定向逻辑复杂）

**实用简化策略**：
- 两条均为 ALU → 双发射
- 任一含 Load/Store/Branch → 单发射

```bsv
let ins1 = d2e.first1();
let ins2 = d2e.first2();
d2e.deq1();  // 至少处理 ins1

if (ins1 epoch 错误 && ins2 epoch 错误) begin
    d2e.deq2();  squash both;
end else if (ins1 epoch 错误) begin
    squash ins1; // ins2 下周期重试
end else if (isALU(ins1) && isALU(ins2) && ins2 epoch 正确) begin
    d2e.deq2();
    // 双 ALU 执行
end
// 其他情况只执行 ins1
```

---

## 5. Writeback 阶段扩展

- 寄存器文件需要 **2 个写端口**
- 计分板需要 **2 个 insert / 2 个 search**
- 若两条指令写同一寄存器：通常由硬件保证后者覆盖（ins2 > ins1）

**EHR 与多端口**：扩展 EHR 端口数以支持同周期多写，面积代价可通过 BRAM 替代 RegFile 来控制。

---

## 6. 性能提升

::: theorem 推论 — 超标量的实际 IPC 提升
理论 IPC 上限为发射宽度，但实际受限于指令间依赖（RAW）、结构冒险（访存）和控制流（分支）。ALU 密集型代码受益最大（科学计算、数值算法）；存储器密集型或分支密集型代码提升有限。
:::

未来方向：**同时多线程（*Simultaneous Multithreading, SMT*）** — 多个线程共享同一超标量处理器，每周期从不同线程发射指令，填充单线程无法利用的槽位。

---

## 本讲小结

超标量处理器在每个流水线阶段都需要宽化：SuperFIFO 支持多路 enq/deq，Decode 处理指令间依赖矩阵，Execute 通过双 ALU 实现双发射（访存/控制仍单发），Writeback 需要多写端口；EHR 是解决多端口读写冲突的关键 BSV 原语。
