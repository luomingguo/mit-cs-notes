---
title: 乱序执行
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 11
kind: system
tags: []
status: complete
---
# Lec 11 乱序执行
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-03-21

## 1. 乱序执行的动机

::: definition 定义 — 数据冒险三类型
- **RAW（*Read After Write*，真依赖）**：i2 需要读取 i1 写的值。必须等待，是真正的依赖。

- **WAR（*Write After Read*，反依赖）**：i2 写入 i1 需要读取的寄存器。顺序执行中是伪依赖。

- **WAW（*Write After Write*，输出依赖）**：i1 和 i2 写同一寄存器。顺序执行中是伪依赖。

WAR 和 WAW 是*名字依赖（name dependency）*，可通过寄存器重命名消除。
:::

---

## 2. 顺序发射计分板（*In-Order Issue Scoreboard*）

```bsv
Bool  busy[32];   // Busy[r] = 某条在途指令将写寄存器 r
RIndx wp[32];     // 未使用（简单计分板只跟踪 busy）
```

Decode 阶段检查：

```bsv
let stall = busy[src1] || busy[src2];
if (!stall) begin
    busy[dst] <= True;   // 标记 dst 将被写
    发射指令到执行单元
end
```

Execute 完成后清除：`busy[dst] <= False;`

**问题**：顺序发射下，只要一条指令停顿，后面所有指令都必须等待，即使后面的指令与停顿指令无关。

---

## 3. Tomasulo 寄存器重命名（*Register Renaming*）

::: definition
**定义 — Tomasulo 算法（*Tomasulo Algorithm, 1967*）**

每条指令发射时，将其目标寄存器重命名为一个物理寄存器（*physical register*）或 ROB 项编号，消除 WAR/WAW 依赖；源寄存器若未就绪，记录"等待哪个物理寄存器的结果"，结果产生时通过公共数据总线（*Common Data Bus, CDB*）广播，等待者被唤醒。
:::

---

## 4. 重排序缓冲区（*Reorder Buffer, ROB*）

::: definition
**定义 — ROB（*Reorder Buffer*）**

ROB 是一个循环队列（FIFO），按程序顺序存储所有在途指令。指令可以乱序执行完成，但必须**按顺序提交（*in-order commit*）**——ROB 头部的指令完成后才能写回架构寄存器文件（*architectural register file*）并出队。ROB 实现精确中断（*precise interrupt*）的关键机制。
:::

**四个执行阶段**：

| 阶段 | 操作 |
|------|------|
| Fetch（取指）| 从 I-Cache 读取指令 |
| Decode/Rename（译码/重命名）| 分配 ROB 项，重命名目标寄存器 |
| Execute（执行）| 乱序执行，结果写 ROB 项 |
| Commit（提交）| 按顺序从 ROB 头提交，写架构 RF |

---

## 5. BSV 乱序处理器实现要点

### 5.1 ROB 结构

```bsv
typedef struct {
    RIndx    archDst;    // 架构目标寄存器
    Data     result;     // 计算结果（等待填入）
    Bool     done;       // 是否完成
    IType    iType;      // 指令类型
} ROBEntry;

// 循环队列
Vector#(ROBSize, Reg#(ROBEntry)) rob <- replicateM(mkRegU);
Reg#(ROBIndex) head <- mkReg(0);
Reg#(ROBIndex) tail <- mkReg(0);
```

### 5.2 Decode/Rename 阶段

```bsv
rule decode;
    // 1. 查当前寄存器映射表 (rename map)：src → 最新 ROB 项编号 or 架构 RF
    // 2. 分配新 ROB 项（tail），将 dst 映射到该项
    // 3. 将指令和操作数发射到执行保留站
    rob[tail] <= ROBEntry{archDst: dInst.dst, done: False, ...};
    tail <= tail + 1;
endrule
```

### 5.3 Commit 阶段

```bsv
rule commit (rob[head].done);
    let entry = rob[head];
    rf.wr(entry.archDst, entry.result);  // 写回架构 RF
    head <= head + 1;
endrule
```

::: theorem 推论 — 精确中断的实现
当异常发生时（如访存错误），ROB 头部提交到异常指令处停止，尚未提交的指令被丢弃（ROB 清空），处理器状态恢复到精确的程序顺序点，再跳入中断处理程序。乱序执行仍然对软件完全透明。
:::

---

## 6. 乱序执行性能示例

::: example 例题 — 乱序 vs. 顺序执行

:::

```text
i1: lw  r1, 0(r0)   # 缓存缺失，延迟 200 周期
i2: add r3, r4, r5  # 无依赖
i3: add r6, r7, r8  # 无依赖
```

顺序发射（计分板）：i2、i3 因 i1 缺失停顿 → 约 202 周期
乱序执行（ROB）：i2、i3 在 i1 缺失期间继续执行 → 约 200 周期（i2/i3 仅需 1 周期）

Sol：乱序执行将无关指令的延迟隐藏在缓存缺失等待中，IPC 大幅提升。

---

## 本讲小结

乱序执行消除伪依赖（WAR/WAW），通过寄存器重命名允许无关指令绕过停顿指令执行；ROB 按程序顺序提交，保证精确中断语义；现代高性能处理器（Intel Core, AMD Zen, Apple M 系列）均采用乱序 + ROB 设计，ROB 项数可达 256–512 条。
