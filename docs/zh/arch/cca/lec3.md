---
title: '存储器与多规则系统（Memory, BRAM & Multi-Rule Systems）'
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 3
kind: system
tags: []
status: complete
---
# Lec 03 存储器与多规则系统（*Memory, BRAM & Multi-Rule Systems*）
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-02-13

## 1. 寄存器文件与魔法存储器

::: definition
**定义 — 寄存器文件（*Register File, RF*）**

寄存器文件是带有 2 个读端口（*read ports*）和 1 个写端口（*write port*）的小型片上存储器（*on-chip memory*）。读操作为组合（无延迟）；写操作为时序（时钟沿生效）。BSV 中用 `RegFile#(type addr, type data)` 描述。
:::

```bsv
interface RegFile#(type index_t, type data_t);
    method data_t    sub(index_t addr);         // 读
    method Action    upd(index_t addr, data_t d); // 写
endinterface
```

**魔法存储器（*Magic Memory*）**：单周期响应的理想化 DRAM，用于简化初期设计，真实 DRAM 需多周期响应。

---

## 2. BRAM（*Block RAM*）

::: definition
**定义 — BRAM（*Block RAM*）**

BRAM 是 FPGA 片上的同步 SRAM 块，读请求需 1 个时钟周期才能返回数据，因此访问被分为两个方法：`req`（发出地址）和 `resp`（获取数据）。BRAM 比寄存器文件面积效率高，但有一个周期的读延迟。
:::

**1 端口 BRAM 接口**：

```bsv
interface Bram1Port#(type addr_t, type data_t);
    method Action req(BRamReq#(addr_t, data_t) x);
    method ActionValue#(data_t) resp;
endinterface
```

**2 端口 BRAM**：允许两条独立的读写流水线并发，适合需要每周期两次访问的结构（如寄存器文件）。

::: theorem 推论 — BRAM 的流水线特性
BRAM 读访问有 1 周期延迟，导致设计者必须在请求方和响应方之间加入队列（*FIFO*）以跟踪"哪个规则在等待响应"，增加了设计复杂性。
:::

---

## 3. 向量机示例（Vector Machine）

用 BRAM 存放向量 a 和 b，逐元素相加写回 a：

```bsv
rule init_read_a (s == Start);
    bram_a.req(BRamReq{write:False, addr:i, data:?});
    s <= ReadA;
endrule

rule read_result (s == ReadA);
    let a_val <- bram_a.resp;
    bram_b.req(BRamReq{write:False, addr:i, data:?});
    a_temp <= a_val;   s <= ReadB;
endrule
```

---

## 4. 多规则系统（*Multi-Rule Systems*）

### 4.1 单规则轮流语义（*One-Rule-At-A-Time Semantics*）

::: definition
**定义 — 调度器语义（*Scheduler Semantics*）**

BSV 的官方语义是：每个时钟周期，调度器选择一个满足 guard 的规则原子执行。实际硬件可以并发执行多个规则，但效果必须等价于某个单规则串行执行顺序。
:::

### 4.2 冲突分析：读写集合

对规则 r，定义：
- $RS(r)$：规则 r 在一个时钟内读取的所有状态元素集合
- $WS(r)$：规则 r 在一个时钟内写入的所有状态元素集合

两规则 $r_a$ 和 $r_b$ 的关系：

::: definition 定义 — CF / SC / C 冲突关系
- **CF（*Conflict-Free*）**：$RS(r_a) \cap WS(r_b) = \emptyset$ 且 $WS(r_a) \cap WS(r_b) = \emptyset$（并且对称地 $RS(r_b) \cap WS(r_a) = \emptyset$）。可以在同一周期并发执行，且顺序无关。

- **SC（*Sequentially Composable*，或称有序）**：$RS(r_b) \cap WS(r_a) = \emptyset$ 且 $WS(r_a) \cap WS(r_b) = \emptyset$，但 $RS(r_a) \cap WS(r_b) \neq \emptyset$。可并发，但 $r_b$ 必须先于 $r_a$ 执行（记作 $r_b < r_a$）。

- **C（*Conflict*，冲突）**：以上条件都不满足。两规则互斥，不能同一周期执行。
:::

### 4.3 冲突矩阵（*Conflict Matrix*）

::: example 例题 — 判断两规则能否并发

:::

设规则 $r_1$ 写寄存器 `x`，规则 $r_2$ 读寄存器 `x`：
- $WS(r_1) = \{x\}$，$RS(r_2) = \{x\}$
- $RS(r_2) \cap WS(r_1) = \{x\} \neq \emptyset$ → $r_1$ 对 $r_2$ 有写读依赖

Sol：若 $WS(r_1) \cap WS(r_2) = \emptyset$ 且 $RS(r_1) \cap WS(r_2) = \emptyset$，则 SC，顺序为 $r_2 < r_1$（先读后写），即并发时 $r_2$ 看到旧值、$r_1$ 写新值。

---

## 5. 调度器实现

编译器生成 CAN_FIRE 和 WILL_FIRE 信号：

```text
CAN_FIRE_r = guard_r  // 规则 r 的条件是否满足
WILL_FIRE_r = CAN_FIRE_r && scheduler_selects_r
```

**贪婪调度（*Greedy Scheduler*）**：按优先级列表依次尝试，每次选择当前可以触发且与已选规则不冲突的规则。

::: theorem 推论 — 调度粒度
BSV 调度粒度是一个时钟周期内的规则集合，而非单个规则；编译器负责生成最大并发度的调度，程序员不需要手动指定哪些规则并行。
:::

---

## 本讲小结

BRAM 提供大容量片上存储但有读延迟；多规则系统通过 RS/WS 分析确定并发关系——CF 可自由并发、SC 有顺序约束、C 互斥；调度器在编译期静态生成 CAN_FIRE/WILL_FIRE 逻辑，自动最大化并发度。
