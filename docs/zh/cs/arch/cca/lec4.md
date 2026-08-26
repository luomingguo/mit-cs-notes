---
title: '调度约束与瞬态历史寄存器（Scheduling & EHRs）'
type: lecture
lecture: 4
tags: []
status: complete
---
# Lec 4 调度约束与瞬态历史寄存器（*Scheduling & EHRs*）
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Martin Chan / Arvind · 日期：2024-02-15

## 1. 弹性流水线与并发需求

::: definition
**定义 — 弹性流水线（*Elastic Pipeline*）**

弹性流水线中，相邻级之间用 FIFO 解耦，使各级可独立地以最大速率工作。关键条件：上游规则的 `enq` 和下游规则的 `deq` 必须能在同一周期并发执行。
:::

```text
x → [inQ] → fifo1 → fifo2 → [outQ]
```

fifo1 的 `enq`（被 inQ 规则调用）和 `deq`（被 outQ 规则调用）能否并发，决定了流水线吞吐量。

---

## 2. 三种高性能 FIFO

### 2.1 无冲突 FIFO（*Conflict-Free FIFO, CF FIFO*）

```text
enq CF deq：只要 FIFO 非满且非空，可同时执行
enq 的效果对 deq 不可见（本周期内）
```

适合：上下游规则速率相同，无需"入队的同时出队"。

### 2.2 流水线 FIFO（*Pipeline FIFO*）

$$\text{deq} < \text{enq}$$

- 允许对**满** FIFO 执行 `enq`，条件是同一周期有 `deq`
- `deq` 优先执行，腾出空间后 `enq` 再填入
- 关键应用：下游比上游慢时，避免流水线因 FIFO 满而停顿

### 2.3 旁路 FIFO（*Bypass FIFO*）

$$\text{enq} < \text{deq}$$

- 允许对**空** FIFO 执行 `deq`，条件是同一周期有 `enq`
- `enq` 先执行，数据立即透传给 `deq`（0 延迟，组合路径）
- 关键应用：缓存命中（*hit Q*）需要零延迟响应

::: theorem 推论 — FIFO 类型选择
选择 FIFO 类型的核心问题是：上下游规则的调度顺序需求是什么？CF FIFO 用于无依赖情况，Pipeline FIFO 用于"先出后进"，Bypass FIFO 用于"先进即出"。三种 FIFO 均可由 1 元素或 2 元素基础 FIFO 推导而来。
:::

---

## 3. GCD 流水化示例

GCD 模块通过 FIFO 连接：

```bsv
rule invokeGCD;
    gcd.start(inQ.first); inQ.deq;
endrule

rule getResult;
    let x <- gcd.getResult; outQ.enq(x);
endrule
```

`invokeGCD` 调用 `start`，`getResult` 调用 `getResult`——能否并发取决于 GCD 模块内部的调度关系。

---

## 4. 冲突矩阵（*Conflict Matrix*）

对于模块方法，冲突关系同样适用 RS/WS 分析，但表示为方法间的有序对。BSV 编译器自动构建冲突矩阵，生成调度逻辑。

::: example 例题 — 1 元素 FIFO 的冲突矩阵

:::

1 元素 FIFO（`Reg#(Maybe#(t))`）：
- `enq` 写 data，`deq` 写 data，`first` 读 data
- $WS(enq) \cap WS(deq) = \{data\} \neq \emptyset$ → enq C deq（冲突！）

Sol：1 元素 FIFO 中 enq 与 deq 冲突，不能并发；需换用 2 元素 FIFO 或 CF FIFO。

---

## 5. 瞬态历史寄存器（*Ephemeral History Register, EHR*）

::: definition
**定义 — EHR（*Ephemeral History Register*）**

EHR 是一种特殊寄存器，在单个时钟周期内提供多个有序读写端口（*port*）。端口按下标排序：端口 [0] 最先，端口 [n-1] 最后。同一周期内，后面的端口能看到前面端口写入的值（组合传播），最终只有最后一次写入保存到真实寄存器。</br>
`EHR#(n, type)` — n 个端口的 EHR。
:::

```bsv
EHR#(2, Bit#(32)) counter <- mkEHR(0);

rule inc_low;  counter[0] <= counter[0] + 1; endrule  // 端口 0
rule inc_high; counter[1] <= counter[1] + 1; endrule  // 端口 1
```

若两规则都触发，端口 0 先写，端口 1 读到端口 0 写后的值再加 1，等效于 `counter += 2`。

### 5.1 EHR 实现 Conflict-Free FIFO

CF FIFO 的关键：`deq`（端口 0）和 `enq`（端口 1）不冲突且顺序无关。

- 用 `count_ehr[0]` 给 `deq` 递减，用 `count_ehr[1]` 给 `enq` 递增
- 由于端口不同，写集合不重叠 → 可并发

::: theorem 推论 — EHR 是细粒度并发的关键
普通 Reg 只有一个逻辑端口（读+写），多规则同时写会冲突。EHR 通过多端口将原本冲突的写操作"分开"到不同端口，在硬件上用多路选择器实现有序传播，代价是额外的逻辑面积。
:::

---

## 6. 三种 FIFO 与 EHR 对应关系

| FIFO 类型 | enq/deq 关系 | EHR 端口分配 |
|-----------|------------|------------|
| CF FIFO | enq CF deq | enq 和 deq 用不同 EHR 端口 |
| Pipeline FIFO | deq < enq | deq 用端口 [0]，enq 用端口 [1] |
| Bypass FIFO | enq < deq | enq 用端口 [0]，deq 用端口 [1] |

---

## 本讲小结

高性能 FIFO 通过不同的 enq/deq 调度关系（CF、SC）实现不同的并发语义；EHR 以多端口有序写入机制，使原本冲突的状态更新可以并发执行；三种 FIFO 均可用 EHR 实现，是构建弹性流水线处理器的基础组件。
