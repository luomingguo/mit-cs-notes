---
title: 加速器（二）（Accelerators II）
course: 6.590 计算机系统架构
course_id: '6.590'
lecture: 24
kind: system
tags: []
status: complete
---
# Lec 24 加速器（二）（*Accelerators II*）

> MIT 6.5900 Fall 2024 · Joel Emer
> 主题：稀疏张量（*Sparse Tensors*）、纤维树抽象（*Fibertree*）、张量表示与遍历、稀疏加速三特性（Format / Gating / Skipping）、稀疏卷积数据流、FuseMax

---

## 一、稀疏性与其价值

许多问题使用**稀疏张量**（[ExTensor, Hegde et al., MICRO 2019]）。利用稀疏性的收益：

- 稀疏数据可**压缩** → 节省空间与能量（避免操作零值）：

$$
a \times 0 = 0, \qquad a + 0 = a
$$

- 可节省时间与能量：避免取无用操作数、避免**无效计算**（*ineffectual computation*）。

### DNN 中的动机

> 利用 CNN 稀疏性提升能效。以 *AlexNet* 为例，各卷积层的激活（IA）与权重（W）密度都明显低于 1，乘法工作量随之下降（[SCNN, Parashar et al., ISCA 2017]）。

### 可利用的稀疏度

可接受的稀疏度取决于目标任务与误差容忍（*MLPerf* 误差容忍）：

| 模型 | ≤0% | ≤1% | ≤2% |
| --- | --- | --- | --- |
| ResNet-50 | ~90% | ~90% | ~91% |
| AlexNet | ~93% | | |
| VGG-16 | ~80% | ~88% | ~92% |
| MobileNet V1 | ~72% | ~79% | ~82% |
| Inception V3 | ~50% | ~62% | ~73% |
| MobileNet V2 | ~25% | | |

> 误差容忍越大，可剪掉的稀疏度越高（[Hoefler et al., arXiv 2021]）。

---

## 二、硬件稀疏加速三特性

| 特性 | 含义 |
| --- | --- |
| **格式**（*Format*）| 选择张量表示，节省与零访问相关的存储空间与能量 |
| **门控**（*Gating*）| 显式消除无效的存储访问与计算——让硬件单元**空闲**一拍以省能量（省能不省时间）|
| **跳过**（*Skipping*）| 显式消除无效的存储访问与计算——**跳过**该拍，同时省能量与时间 |

---

## 三、张量表示与纤维树抽象

### 张量术语回顾

每个 rank（维度）的元素由**坐标**标识；每个元素由各 rank 坐标的元组（即一个**点**）标识，如 $(1,2) \to f$；形状记 $[0,3)$。

### 树形张量抽象（*Tree-based*）

把张量组织成一棵树：从 Root 出发，按 rank 逐层下降，每层节点带坐标，叶子是值。

### 纤维树抽象（*Fibertree*）

- 每个坐标引用一个**纤维**（*fiber*）；
- 查找点 $(2,1)$：`getPayload(2)` 再 `getPayload(1)` 逐层下降；
- **稀疏时**：树中只保留非零元素对应的纤维与坐标，零值不占位。

---

## 四、张量遍历（*Tensor Traversal*）

### 2-D 遍历（抽象写法）

```python
t = Tensor(H, W)
sum = 0
for (h, t_h) in t:
    for (w, t_val) in t_h:
        sum += t_val
```

> 每次迭代返回一个 **(coordinate, payload)** 元组。这种逐层 Pos→Coord→Payload 的遍历称为**协调遍历**（*Concordant Traversal*）。

### 纤维表示方式

每个纤维是一组 (coordinate, payload) 元组，数据按其**位置/偏移**访问。

| 表示 | 特点 |
| --- | --- |
| **数组**（*Array*）| 位置即坐标，存全部 payload（含零）|
| **坐标/载荷列表**（*Coordinate/Payload List*）| 只存非零，显式存坐标与 payload |

### 纤维表示的选择

- **隐式坐标**：未压缩（无元数据）；压缩（如游程编码 RLE）；
- **显式坐标**：如坐标/载荷列表；
- **压缩 vs 未压缩**：
  - 压缩/未压缩是**表示的属性**，稀疏/密度是**数据的属性**；
  - 未压缩：大小正比于**最大坐标值**；
  - 压缩格式有元数据开销——对密集数据可能比直接用未压缩更贵；
  - 表示的空间效率取决于稀疏度。

### CSR：压缩稀疏行（*Compressed Sparse Row*）

*CSR* 是纤维树抽象的一种具体实现，由三部分组成：

- **段数组**（*Segment Array*）：每行在坐标/值数组中的起止；
- **坐标数组**（*Coordinate Array*）；
- **值数组**（*Value Array*）。

CSR 风格的遍历：

```python
for t_h_pos in [0, H):
    h = t_h_pos                                   # 未压缩 rank：坐标=位置
    t_w_start = t_segs[t_h_pos]
    t_w_len   = t_segs[t_h_pos + 1] - t_w_start
    for t_w_pos in [t_w_start, t_w_start + t_w_len):
        w     = t_coords[t_w_pos]
        t_val = t_vals[t_w_pos]
        sum  += t_val
```

---

## 五、稀疏卷积的数据流

### 1-D 输出固定卷积

```c
int i[W];   // 输入激活
int f[S];   // 滤波器权重
int o[Q];   // 输出激活,  Q = W - ceil(S/2)
for q in [0..Q):
    for s in [0..S):
        o[q] += i[q+s] * f[s];
```

> 若部分滤波器权重为零：可**避免读操作数、做乘法、更新输出**。

**门控（条件执行）**：

```c
if (!f[s]) o[q] += i[q+s] * f[s];   // f[s]==0 时不执行
```

> 用条件执行**省了能量**，但**没省时间**（仍占该拍）。

### Eyeriss 的时钟门控

> 当图像数据为零时，**门控乘法器与存储器读取**；可降低 PE 功耗约 **45%**（[Eyeriss, Chen et al., ISSCC 2016]）。这是 Gating 的典型实现。

### 权重固定 — 稀疏权重（*Weight Stationary, Sparse Weights*）

Einsum：$O_q = I_{q+s} \times F_s$

```python
i = Array(W)    # 输入激活
f = Tensor(S)   # 滤波器权重(稀疏)
o = Array(Q)    # 输出激活
for (s, f_val) in f:        # 只遍历非零权重 -> Skipping
    for q in [0, Q):
        w = q + s
        o[q] += i[w] * f_val
```

> 协调遍历：只遍历非零权重，从而**跳过**无效计算。
> 实例：*Cambricon-X* 用权重元数据驱动对输入激活的访问（[Zhang et al., MICRO 2016]）。

### 输出固定 — 稀疏权重 + 稀疏输入

把 Einsum 的索引语义映射到数据流原语：

- **共享索引**（*shared indices*）→ **交集**（*intersection*）；
- **被约索引**（*contracted indices*）→ **归约**（*reduction*）；
- **未约索引**（*uncontracted indices*）→ **填充输出点**；
- **索引算术**（如 $q+s$）→ **投影**（*projection*）（[ExTensor, MICRO 2019]）。

```python
i = Tensor(W)   # 输入激活(稀疏)
f = Tensor(S)   # 滤波器权重(稀疏)
o = Array(Q)    # 输出激活
for q in [0, Q):
    for (s, (f_val, i_val)) in f.project(+q) & i:   # 投影 + 交集
        o[q] += i_val * f_val                        # 归约 + 填充输出
```

**纤维坐标投影**（*Fiber Coordinate Projection*）：`.project(+2)` 把坐标整体平移，使两个纤维的坐标空间对齐，便于求交。
**纤维交集**（*Fiber Intersection*）：`a & b` 只保留两纤维**坐标都非零**的位置，从而同时跳过两侧的零。

### 扩展到 DNN 的其他维度

要扩展到完整 DNN（$O_{p,q,m} = I_{c,p+r,q+s} \times F_{m,c,r,s}$）需为以下迭代空间增加循环嵌套并加入并行：2-D 输入激活与滤波器、多输入通道 $C$、多输出通道 $M$。

### 纤维在位置空间上的等分（*Split Equal*）

把一个纤维按**位置**等分（如每 2 个一组）成多个子纤维 $W_0, W_1, \ldots$，用于并行处理。

并行的权重固定稀疏卷积：

```python
for (s1, f_split) in f.splitEqual(2):       # 每次取两个权重
    for q1 in [0, Q/4):
        parallel-for (s0, f_val) in f_split:    # 两个权重并行
            parallel-for q0 in [0, 4):          # 四个输出并行
                q = q1*4 + q0
                w = q + s
                o[q] += i[w] * f_val            # 各输出空间上分别累加
```

---

## 六、注意力机制的稀疏与级联

### 多头注意力（Einsum，回顾）

$$
\begin{aligned}
K_{b,h,m,e} &= I_{b,m,d} \times WK_{d,h,e}, \quad
Q_{b,h,m,e} = I_{b,m,d} \times WQ_{d,h,e} \\
QK_{b,h,m,p} &= Q_{b,h,p,e} \times K_{b,h,m,e}, \quad
SN_{b,h,m,p} = \exp(QK_{b,h,m,p}) \\
SD_{b,h,p} &= \textstyle\sum_m SN_{b,h,m,p}, \quad
A_{b,h,m,p} = SN_{b,h,m,p}/SD_{b,h,p} \\
V_{b,h,m,f} &= I_{b,m,d} \times WV_{d,h,f}, \quad
AV_{b,h,p,f} = A_{b,h,m,p} \times V_{b,h,m,f} \\
Z_{b,p,d} &= C_{b,p,f} \times WZ_{g,d}
\end{aligned}
$$

### 1-D Softmax 与"趟"（*Pass*）

$$
N_m = e^{I_m}, \qquad D = \textstyle\sum_m N_m, \qquad A_m = N_m / D
$$

> **趟**（*Pass*）：对某张量某 rank 某纤维的一次完整遍历；每当必须在遍历完其他元素后重新访问某元素时，就多一趟。

### 数值稳定的 Softmax（减最大值）

$$
GM_p = \max_m\bigl(QK_{m,p}\bigr), \quad
SN_{m,p} = e^{\,QK_{m,p} - GM_p}, \quad
SD_p = \textstyle\sum_m SN_{m,p}, \quad
A_{m,p} = SN_{m,p}/SD_p
$$

### 多种注意力变体：3-trip vs 1-trip 级联

- **3 趟级联**（3-pass）：依次算 $QK$ → 求全局最大 $GM$ → 算 $SN, SD, A$ → 算 $AV$；
- **1 趟级联**（*FuseMax*）：用运行最大值 $RM$ 与运行分母 $RD$ 做在线 softmax 融合，在一趟内边遍历边更新，类似 *FlashAttention* 的在线归一化思想，减少对中间张量的重复访问。

> 空间架构与 *FuseMax* 架构在端到端推理上获得性能收益。

---

## 七、后续课程

> **Hardware Architecture for Deep Learning**（6.593[01]，Spring 2025）大纲：
> - Part I 理解 DNN：引论、DNN 概览；
> - Part II DNN 处理硬件设计：关键指标与目标、核计算、加速器设计、专用硬件上的操作映射；
> - Part III 硬件与算法协同设计：降精度、利用稀疏性、设计高效 DNN 模型、先进技术。

---

## 本讲小结

- 稀疏性可同时省**空间、能量、时间**，但收益受任务误差容忍约束；
- 三大硬件特性：**Format**（表示选择）、**Gating**（空闲省能）、**Skipping**（跳过省能省时）；
- **纤维树**抽象统一了张量表示（含 CSR 等），其遍历可映射为**投影、交集、归约、填充输出**等原语；
- 稀疏卷积/注意力的关键是用**坐标投影 + 纤维交集**只处理双方都非零的点，并用 split/parallel 引入并行；
- 在线 softmax 融合（FuseMax）用更少的"趟"完成注意力，降低数据移动。
