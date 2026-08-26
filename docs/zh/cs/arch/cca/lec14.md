---
title: 向量机与 SIMD
type: lecture
lecture: 14
tags: []
status: complete
---
# Lec 14 向量机与 SIMD
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-04-04

## 1. SIMD 的动机

::: definition
**定义 — SIMD（*Single Instruction, Multiple Data*）**

SIMD 是一种并行化范式：一条指令同时对多个数据元素执行相同操作。适用于多媒体处理（音视频编解码、图像压缩 DCT）、科学计算（向量/矩阵运算）等数据并行（*data-parallel*）负载。
:::

**DCT（*Discrete Cosine Transform*）动机**：JPEG/MPEG 压缩使用 8×8 DCT，每像素块需要大量加乘运算，非常适合 SIMD 加速。

---

## 2. Intel MMX

::: definition
**定义 — MMX（*MultiMedia eXtension, Intel 1997*）**

MMX 复用了 x87 浮点寄存器，将其重解释为 64 位向量寄存器（*vector register*），支持：

- 2 × 32 位整数（2×int32）

- 4 × 16 位整数（4×int16）

- 8 × 8 位整数（8×int8）

注：SSE（MMX 的后继）引入了全新的 128 位 xmm 寄存器，与 MMX 共享寄存器的问题得到解决。
:::

**32 位加法器的共享技巧（*Sharing Trick*）**：

两个 16 位加法只需一个 32 位加法器，通过清除进位位隔离两路计算：

```text
A = [a1 (16 bit) | a0 (16 bit)]   ← 两个 16 位元素打包
B = [b1         | b0         ]
C = A + B，但先清除第 16 位（进位隔离）
结果：[a1+b1 | a0+b0]（两路独立加法）
```

---

## 3. 向量寄存器文件与向量单元

::: definition
**定义 — 向量寄存器文件（*Vector Register File*）**

向量处理器拥有专用向量寄存器（如 8 个 512 位向量寄存器），每个寄存器存放多个元素（如 16 × 32 位）。向量单元（*vector unit*）内部有多个并行执行通道（*lanes*），每通道处理向量的一个或多个元素。
:::

**向量单元结构（2 通道示例）**：

```text
向量寄存器 VR0 = [e7, e6, e5, e4, e3, e2, e1, e0]
向量寄存器 VR1 = [f7, f6, f5, f4, f3, f2, f1, f0]
                         ↓
Lane 0 处理: (e0+f0, e2+f2, e4+f4, e6+f6)
Lane 1 处理: (e1+f1, e3+f3, e5+f5, e7+f7)
```

向量操作吞吐量 = 标量吞吐量 × 通道数。

---

## 4. 向量存储器访问

### 4.1 步长访问（*Strided Load/Store*）

访问步长为 $s$ 的数组元素：

```asm
vload.stride vr1, base, stride    # vr1[i] = mem[base + i * stride]
```

适用于矩阵的列访问（行主序存储时，列访问步长 = 行宽）。

### 4.2 离散聚集（*Scatter-Gather*）

根据索引向量访问不规则内存地址：

```asm
vgather vr1, base, vr2   # vr1[i] = mem[base + vr2[i]]
vscatter base, vr2, vr1  # mem[base + vr2[i]] = vr1[i]
```

适用于稀疏矩阵、图访问等不规则模式。

---

## 5. 谓词执行（*Predication*）

::: definition
**定义 — 谓词执行（*Predicated Execution*）**

向量操作中，某些元素可能不满足执行条件（如 `if (a[i] > 0) b[i] = a[i]`）。谓词寄存器（*predicate register*）为每个元素存储 1 位条件，向量指令只对谓词为 1 的元素生效，谓词为 0 的元素结果不更新（或写入 0）。
:::

```asm
vcmp.gt  pr0, vr0, 0    # pr0[i] = (vr0[i] > 0)
vadd.p   vr1, vr0, vr2, pr0  # vr1[i] = (pr0[i]) ? vr0[i]+vr2[i] : vr1[i]
```

**软件谓词 vs. 硬件谓词**：
- 软件谓词（*SW predication*）：用 select 指令（`cmov`）消除分支
- 硬件谓词（*HW predication*）：专用谓词寄存器，向量单元直接支持

---

## 6. Shuffle 指令

::: example 例题 — 向量乘法中的 Shuffle 需求

:::

实现 $\text{result} = \sum_{i=0}^{3} a_i \times b_i$（点积）：

1. `vmul vr2, vr0, vr1`：逐元素乘法
2. `shuffle vr3, vr2, [2,3,0,1]`：交换相邻对
3. `vadd vr4, vr2, vr3`：相加
4. `shuffle vr5, vr4, [1,0,3,2]`：交换另一维度
5. `vadd vr6, vr4, vr5`：最终求和

Sol：Shuffle 指令提供元素重排（<em>permutation</em>）能力，是 SIMD 实现归约（reduce）和矩阵转置的关键。Intel SSE 的 `PSHUFD`、AVX2 的 `VPERMPS` 均属此类。

---

## 本讲小结

SIMD 通过一条指令处理多个数据元素，吞吐量随通道数线性扩展；MMX/SSE/AVX 是 Intel 的渐进式向量扩展，宽度从 64 位增至 512 位（AVX-512）；步长访问和 Scatter-Gather 支持不规则内存访问；谓词寄存器消除向量代码中的分支；Shuffle 指令完成元素重排，是实现高性能矩阵和信号处理算法的关键原语。
