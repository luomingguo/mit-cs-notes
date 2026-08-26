---
title: 多线程处理器
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 10
kind: system
tags: []
status: complete
---
# Lec 10 多线程处理器
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-03-14

## 1. 多线程的动机

::: definition
**定义 — 硬件线程（*Hardware Thread*）**

硬件线程（*HW thread*）是处理器中独立维护一套体系结构状态（PC、寄存器堆、页表基址）的执行流。多个 HW 线程共享同一流水线的计算资源（ALU、缓存）和物理内存（通过虚拟内存隔离）。
:::

**单线程流水线的利用率问题**：缓存缺失时流水线停顿，硬件空闲 100–1000 个周期。多线程让其他线程的指令填补这些空洞。

---

## 2. 细粒度多线程（*Fine-Grained Multithreading, FGMT*）

::: definition
**定义 — 桶形处理器（*Barrel Processor*）**

FGMT 的极端形式：每个时钟周期轮流执行不同线程的指令（*round-robin*），流水线中没有两条来自同一线程的指令，因此绝对不存在 RAW 数据冒险（相邻指令来自不同线程）。
:::

BSV 实现：

```bsv
Reg#(ThreadId) curThread <- mkReg(0);  // 轮询计数

rule fetch;
    let pc = pc_per_thread[curThread];
    iMem.enq(pc);
    f2d.enq(F2D{thread: curThread, pc: pc, ...});
    pc_per_thread[curThread] <= pc + 4;
    curThread <= (curThread + 1) % numThreads;  // 轮换
endrule
```

**每线程独立队列**：

```bsv
// Decode → Execute：按线程分队列
FIFO#(D2E) d2e_per_thread[numThreads] <- replicateM(mkPipelineFIFO);

rule execute;
    let tid = ...; // 从 d2e_per_thread 中选
    let x = d2e_per_thread[tid].first;
    ...
endrule
```

---

## 3. 粗粒度多线程（*Coarse-Grained Multithreading, CGMT*）

::: definition
**定义 — 粗粒度多线程（*CGMT*）**

一个线程持续执行直到遭遇长延迟事件（缓存缺失、I/O），此时切换到另一线程。每次切换需要冲刷流水线（*pipeline flush*），但切换频率低，适用于延迟较大（数百周期）的事件。
:::

优点：不需要针对每个周期都轮换；缺点：切换开销（flush），短暂停顿（< 切换开销）无法被隐藏。

---

## 4. 同时多线程（*Simultaneous Multithreading, SMT*）

::: definition
**定义 — SMT（*Simultaneous Multithreading*）**

SMT 在超标量处理器的基础上，每周期从多个线程中混合发射指令，充分利用超标量宽度。Intel 的*Hyper-Threading* 技术（HT）即为 2-way SMT：一个物理核心对操作系统呈现为 2 个逻辑核心。
:::

**SMT vs. FGMT 对比**：

| 维度 | FGMT | SMT |
|------|------|-----|
| 每周期发射 | 1 条（来自轮换线程）| 多条（来自多线程混合）|
| RAW 冒险 | 无（天然隔离）| 需计分板 |
| 硬件复杂度 | 低 | 高 |
| 适用场景 | GPU shader、嵌入式 | 现代服务器 CPU |

---

## 5. 虚拟内存简介

::: definition
**定义 — 虚拟内存（*Virtual Memory*）**

虚拟内存为每个线程（进程）提供独立的地址空间（*virtual address space*）。虚拟地址通过 TLB（*Translation Lookaside Buffer*，页表缓存）翻译为物理地址。多线程共享物理内存，但互不干扰（隔离），也可显式共享页面（进程间通信）。
:::

**TLB 缺失代价**：TLB 缺失需要访问页表（多级，数百周期），是 CGMT/SMT 的重要触发事件。

---

## 6. 多线程的资源分配

::: example 例题 — 多线程提升吞吐量

:::

假设单线程因 Cache 缺失，50% 的周期流水线空转：

- 1 个线程：利用率 50%
- 2 个线程（FGMT）：线程 1 停顿时线程 2 执行，理论利用率 → 100%

Sol：需要 $\lceil 1/\text{miss\_rate} \rceil$ 个线程才能完全隐藏延迟。对于 90% 命中率（10% 缺失率），需约 10 个线程。

::: theorem 推论 — 多线程不降低单线程延迟
多线程提高**吞吐量**（更多线程合计完成更多工作），但并不降低单条线程的延迟（因为每个线程分到的执行带宽减少）。数据中心场景（高并发服务器）受益最大。
:::

---

## 本讲小结

FGMT（桶形处理器）每周期轮换线程，天然消除 RAW 冒险，BSV 实现只需按线程分离寄存器状态；CGMT 在长延迟事件时切换线程；SMT 结合超标量宽度每周期混合多线程指令；虚拟内存通过 TLB 隔离各线程地址空间。多线程的核心价值是以面积换吞吐量。
