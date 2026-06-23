# L23：加速器（一）（*Accelerators I*）

> MIT 6.5900 Fall 2024 · Joel Emer "Compute has been the oxygen of deep learning." — Ilya Sutskever 主题：算力需求、技术趋势（*Moore's / Dennard*）、Einsum 表示、卷积与张量计算、数据流（*dataflow*）与 Roofline 模型

------

## 一、动机：深度学习的算力需求

- 深度学习的算力需求**指数增长**：从 *AlexNet* 到 *AlphaGo Zero*，算力增长约 **300,000×**；
- 业界呼声（Baidu SVAIL）：训练受算力限制，若处理器更快可训更大模型，希望提升 **100× 或更多**。

------

## 二、技术趋势

### Moore's Law 的多种表述

> "每两年（或 18 个月）翻倍/缩半"可指：CPU 性能、芯片性能、晶体管速度、晶体管尺寸、栅宽（按 $\sqrt 2$ 缩小）、每片晶体管数、芯片上器件数的经济最优点……

### 能耗与功耗

$$ E_{\text{energy}} = \alpha \cdot C \cdot V^2 $$

$$ P_{\text{power}} = \alpha \cdot C \cdot V^2 \cdot f $$

其中 $\alpha$ 为开关活动因子（$0 \sim 1$），$C$ 为电容，$V$ 为电压，$f$ 为频率。

### Dennard 缩放（理想化）

每代器件尺寸按 $0.7$ 缩小时（[Dennard et al., JSSC 1974]）：

| 量            | Gen X      | Gen X+1                                           |
| ------------- | ---------- | ------------------------------------------------- |
| 栅宽          | 1.0        | 0.7                                               |
| 器件面积/电容 | 1.0        | 0.7                                               |
| 电压          | 1.0        | 0.7                                               |
| 能量          | $\sim 1.0$ | $\sim 2 \times 0.7 \times 0.7^2 = 0.65$           |
| 延迟          | 1.0        | 0.7                                               |
| 频率          | 1.0        | $1/0.7 = 1.4$                                     |
| 功耗          | $\sim 1.0$ | $\sim 2 \times 0.7 \times 0.7^2 \times 1.4 = 1.0$ |

> 理想 Dennard 缩放下，**功耗密度保持不变**，频率随尺寸缩小而提升。

### Moore + Dennard 时代之后

- **指令级并行**（*ILP*）在 2000 年代初基本被挖尽；
- 电压（Dennard）缩放在 **2005 年终结**；
- 2005 年撞上**功耗墙**；
- 约 2007 年起，性能主要靠**用更多晶体管做并行**——但这也有极限。

### 体系结构指标

- **速度**（*Speed*）：硬件完成任务的速率，受计算单元数与利用率限制；
- **能量**（*Energy*）：完成任务消耗的总能量（焦耳），常受电池容量/碳足迹约束；
- **功率**（*Power*）：能量消耗速率（瓦），常受供电/封装约束；
- **精度**（*Accuracy*）：结果精度，由计算单元位宽决定；
- **灵活性**（*Flexibility*）：可解决问题的范围，受架构限制约束。

------

## 三、深度学习平台谱系

| 平台                 | 代表                                                     |
| -------------------- | -------------------------------------------------------- |
| CPU                  | Intel、ARM、AMD                                          |
| GPU                  | NVIDIA、AMD                                              |
| 细粒度可重构（FPGA） | Xilinx、Altera（Microsoft *BrainWave*）                  |
| 粗粒度可编程/可重构  | Wave Computing、Graphcore、SambaNova                     |
| 专用（ASIC）         | Neuflow、*DianNao*、*Eyeriss*、*TPU*、*Cnvlutin*、*SCNN* |

> 张量加速器层出不穷：*Eyeriss*、*SCNN*、*ExTensor*、*Eyeriss V2*、*Gamma*、*RAELLA* 等。

------

## 四、关注点分离（*Separation of Concerns*）与 Einsum

[TeAAL, Nayak et al., MICRO 2023] 提出把"算法/计算 — 映射 — 硬件"分离。**Einsum** 是这套分层金字塔的顶端表示。

### Einsum 能带来什么

- 同时**更精确**且**更简洁**的表示；
- 把张量代数扩展到远超矩阵乘法的范围（AI、图、FFT、密码、点云……）；
- 是 GEMM 与完全可编程之间的中间点；
- 允许对计算与数据移动做**界限分析**（*Speed-of-Light*）；
- 可通过代数变换做优化。

### 张量术语（*Tensor Terminology*）

- **秩**（*Rank*，即维度）：每个 rank 的元素由其**坐标**（*coordinate*）标识，如 rank H 有坐标 0、1、2；
- **点**（*Point*）：每个张量元素由各 rank 坐标组成的元组标识，如 $(1,2) \to f$；
- **形状**（*Shape*）：如 $H$ 的形状为 3，记 $[0,3)$。

秩的层级：Rank-0 标量、Rank-1 向量、Rank-2 矩阵、Rank-3 立方体……

------

## 五、矩阵乘法的 Einsum 表示

计算定义：

```python
A = Tensor(shape=[M, K])
B = Tensor(shape=[N, K])
Z = Tensor(shape=[M, N])
for n in [0..N):
    for m in [0..M):
        for k in [0..K):
            Z[m][n] += A[m][k] * B[n][k]
```

Einsum 写法：

$$ Z_{m,n} = A_{m,k} \times B_{n,k} $$

**Einsum 操作定义（ODE）**：

- 遍历所有合法索引值空间中的点（**迭代空间**，*iteration space*）；
- 在每个点上：对每个操作数按指定索引取右端值；把值赋给左端指定索引的操作数；若该操作数已非零，则把值**归约**（*reduce*）进去。

> 来源致谢：[Einstein 相对论, 1916]、[Numpy/Einsum, ~2015]、[TACO, ASE 2017]、[Timeloop, ISPASS 2019]、[SAM, ASPLOS 2023]。

### Einsum 记法补充

- **上标**表示张量某 rank 的名字：$Z_{m,n}^{M,N}$；
- 上标中的等号表示该 rank 的**形状**：$Z_{m,n}^{M=3, N=3}$；默认形状与 rank 名同名。

> M 个点积的特例：$Z_m^{M} = A_{m,k}^{M,K} \times B_{m,k}^{M,K}$。

------

## 六、卷积（*Convolution, CONV*）

### CONV 各维度术语

- $N$：输入/输出特征图数（batch size）；$C$：输入特征图与滤波器的通道数；
- $H, W$：输入特征图的高、宽；$R, S$：滤波器的高、宽；
- $M$：输出特征图通道数；$P, Q$：输出特征图的高、宽；$U$：卷积步长。

### 朴素 7 层 for 循环实现

```c
for n in [0..N):
 for m in [0..M):
  for q in [0..Q):
   for p in [0..P):
    O[n][m][p][q] = B[m];
    for r in [0..R):
     for s in [0..S):
      for c in [0..C):
       O[n][m][p][q] += I[n][c][U*p+r][U*q+s] * F[m][c][r][s];
    O[n][m][p][q] = Activation(O[n][m][p][q]);
```

### CONV 的 Einsum

$$ O_{p,q,m} = I_{c,, p+r,, q+s} \times F_{m,c,r,s} $$

### CONV 变体（用约束特化 Einsum）

| 变体                      | 条件                                        |
| ------------------------- | ------------------------------------------- |
| **Depthwise**             | $M == C$ 且 $c \neq m$ 时 $F_{c,m,r,s} = 0$ |
| **Pointwise**             | $R == S == 1$                               |
| **Matrix multiply**       | $R == S == H == 1$                          |
| **Compress（pointwise）** | $M < C$ 且 $R == S == 1$                    |
| **Expand（pointwise）**   | $M > C$ 且 $R == S == 1$                    |

> Compress…Expand 的序列称为"**瓶颈**"（*bottleneck*）。

### Toeplitz（IM2COL）级联

把卷积通过 *im2col* 重排成矩阵乘法：

$$ O_{p,q,m} = I_{c,,p+r,,q+s} \times F_{m,c,r,s} ;\Rightarrow; T_{c,p,q,r,s} = I_{c,,p+r,,q+s},\quad O_{p,q,m} = T_{c,p,q,r,s} \times F_{m,c,r,s} $$

------

## 七、Transformer 与多头注意力

把 Transformer 看作**多个 kernel 的组合**。多头注意力（不含初始嵌入步）的 Einsum 级联（[Attention, Vaswani et al. 2017]）：

$$ \begin{aligned} K_{b,h,m,e} &= I_{b,m,d} \times WK_{d,h,e} \ Q_{b,h,m,e} &= I_{b,m,d} \times WQ_{d,h,e} \ QK_{b,h,m,p} &= Q_{b,h,p,e} \times K_{b,h,m,e} \ SN_{b,h,m,p} &= \exp(QK_{b,h,m,p}) \ SD_{b,h,p} &= \textstyle\sum_m SN_{b,h,m,p} \ A_{b,h,m,p} &= SN_{b,h,m,p} / SD_{b,h,p} \ V_{b,h,m,f} &= I_{b,m,d} \times WV_{d,h,f} \ AV_{b,h,p,f} &= A_{b,h,m,p} \times V_{b,h,m,f} \ C_{b,p,,h\times F + f} &= AV_{b,h,p,f} \ Z_{b,p,d} &= C_{b,p,f} \times WZ_{g,d} \end{aligned} $$

> Einsum 表示的精炼度：如《Attention Is All You Need》15 页论文对应 14 个 Einsum；*FlashAttention* 34 页对应 24 个（3 个改动）；说明 Einsum 既精确又简洁。 稀疏注意力的诸多思路：*SpAtten*、*Sanger*、*EdgeBERT*、*DOTA* 等。

------

## 八、数据移动的高昂代价

> **取操作数比对其计算更昂贵**（图源 Bill Daly）。如今的关键是**如何最有效地使用晶体管**——尽量减少数据移动。

### DNN 的空间架构（*Spatial Architecture*）

本地存储层级：

- **全局缓冲**（*Global Buffer*，100–500 kB）；
- **PE 间直连网络**（direct inter-PE network）；
- **PE 本地存储**（寄存器文件 RF，0.5–1.0 kB）。

由处理单元（*PE*）阵列 + 全局缓冲 + DRAM 组成。

### DNN 中的数据复用类型

| 复用类型                              | 适用层                | 复用对象                               |
| ------------------------------------- | --------------------- | -------------------------------------- |
| **卷积复用**（*Convolutional Reuse*） | 仅 CONV（滑动窗口）   | 滤波器权重 + 激活                      |
| **特征图复用**（*Fmap Reuse*）        | CONV 与 FC            | 激活（多个滤波器复用同一输入）         |
| **滤波器复用**（*Filter Reuse*）      | CONV 与 FC（batch>1） | 滤波器权重（多张输入图复用同一滤波器） |

------

## 九、数据流（*Dataflow*）

### 1-D 卷积与输出固定（*Output Stationary*）

```c
int i[W];   // 输入激活
int f[S];   // 滤波器权重
int o[Q];   // 输出激活
for q in [0, Q):
    for s in [0, S):
        w = q + s;
        o[q] += i[w] * f[s];
```

**输出固定（OS）**思想：

- 最小化部分和（*partial sum*）的读写能耗 → 最大化**本地累加**；
- 在 PE 阵列上**广播/多播滤波器权重**，并在空间上复用激活。

> OS 实例：*ShiDianNao*（输入流过阵列、权重广播、部分和在 PE 内累加后流出，[Du et al., ISCA 2015]）；*KU Leuven*（[Moons et al., VLSI 2016 / ISSCC 2017]）。

### 多种数据流

| 数据流             | 代表                                     |
| ------------------ | ---------------------------------------- |
| **输出固定（OS）** | ShiDianNao, Moons, Thinker               |
| **权重固定（WS）** | NeuFlow, ISAAC, PRIME, *TPU* (ISCA 2017) |
| **输入固定（IS）** | *SCNN* (ISCA 2017)                       |
| **行固定（RS）**   | *Eyeriss* (ISCA 2016), Tetris, Eyeriss2  |

### 多种映射选项（*Mapping Options*）

每个存储层级上是以下维度的叉积：**数据流、时间上的分块（tiling in time）、空间上的分块（tiling in space）、旁路（bypassing）、拆分/共享存储**。不同映射会导致流量（traffic）显著不同。

------

## 十、Roofline 模型

横轴为**计算强度**（*Compute Intensity*，MACs/read），纵轴为 MACs/cycle：

- 左侧斜线区：MACs/cycle **受操作数供给限制**（带宽受限）；
- 右侧水平区：MACs/cycle **受 lane 数目限制**（计算受限）。

> 示例：8 条 MAC lane、1 read/MAC，则平顶为 8 MACs/cycle。 [Williams, Waterman, Patterson, "Roofline", CACM 2009]

------

## 小结

- 算力需求指数增长，而 Dennard 缩放终结、撞上功耗墙，迫使转向**并行 + 专门化**的加速器；
- **Einsum** 提供精确简洁的张量算法表示，是"关注点分离"金字塔的顶端，并支持界限分析与代数优化；
- 加速器设计核心是**减少数据移动**：通过空间架构、数据复用、数据流（OS/WS/IS/RS）与映射选择来优化；
- **Roofline** 模型刻画性能受计算还是受带宽限制。

> 下一讲：Accelerators (II)