---
title: 数据流分析的理论基础（Foundations of Dataflow Analysis）
type: lecture
lecture: 12
tags: []
status: complete
---
# Lec 12 数据流分析的理论基础（Foundations of Dataflow Analysis）

> 内容：格论、偏序、传递函数、单调性/分配性、工作表算法、抽象函数与路径汇合解
> 这是 L8 数据流分析的**形式化数学基础**

---

## 1. 基本思想

数据流分析是**编译期对变量/表达式运行期值在不同程序点的推理**。核心思路：用一个代数结构——**格 (lattice)** 的元素表示程序信息，分析为**每个程序点产生一个格值**。两种风味：**前向 (forward)** 与 **后向 (backward)** 数据流分析。

程序表示：CFG，节点 <span>$N$</span> 是语句、边 <span>$E$</span> 是控制流，`pred(n)`/`succ(n)` 为前驱/后继，起点 <span>$n_0$</span>，终点集 <span>$N_{final}$</span>。程序点：每节点前后各一个；**汇合点 (join)** 多前驱，**分裂点 (split)** 多后继。

- **前向分析**：值随控制流前向传播，节点有传递函数 <span>$f$</span>（输入=节点前的值，输出=节点后的值），在汇合点用合并函数组合。典型：到达定义。
- **后向分析**：值逆控制流后向传播（输入=节点后的值，输出=节点前的值），在分裂点合并。典型：活跃变量。

---

## 2. 偏序与格（Partial Orders & Lattices）

::: definition 定义（偏序 Partial Order）
集合 $P$ 上的偏序 $\le$ 满足对所有 $x,y,z$：自反 $x\le x$、反对称 $x\le y \wedge y\le x \Rightarrow x=y$、传递 $x\le y \wedge y\le z \Rightarrow x\le z$。
:::

::: definition 定义（上/下界、lub/glb）
对 $S \subseteq P$：

- **上界** $x$：$\forall y\in S.\ y\le x$；**最小上界 (lub)** 记 $\vee S$（join、supremum），$x\vee y$ 是 $\{x,y\}$ 的 lub。

- **下界** $x$：$\forall y\in S.\ x\le y$；**最大下界 (glb)** 记 $\wedge S$（meet、infimum），$x\wedge y$ 是 $\{x,y\}$ 的 glb。
:::

::: definition 定义（格、完全格、Top/Bottom）
若对所有 $x,y\in P$，$x\wedge y$ 与 $x\vee y$ 都存在，则 $P$ 是**格 (lattice)**。若对所有 $S\subseteq P$，$\wedge S$ 与 $\vee S$ 都存在，则是**完全格 (complete lattice)**；**所有有限格都完全**。最大元为 **top**，最小元为 **bottom ($\bot$)**。
:::

> 例：整数 <span>$I$</span> 在 max/min 下是格但不完全（<span>$\vee I$</span> 不存在），<span>$I\cup\{+\infty,-\infty\}$</span> 完全。布尔超立方 <span>$\{0,1\}^n$</span>（<span>$x\le y$</span> ⟺ 按位与 = <span>$x$</span>）是完全格，用 Hasse 图表示覆盖关系。

### 2.1 <span>$\le$</span>、<span>$\wedge$</span>、<span>$\vee$</span> 的等价联系

::: theorem 定理（三者等价）
以下三条等价：$x\le y$ ⟺ $x\vee y = y$ ⟺ $x\wedge y = x$。
:::

可反过来**用 <span>$\vee,\wedge$</span> 定义 <span>$\le$</span>**：取满足结合、交换、幂等、吸收律的任意 <span>$\vee,\wedge$</span>，定义 <span>$x\le y$</span> 当 <span>$x\vee y=y$</span>，可证 <span>$\le$</span> 是偏序，且 <span>$x\vee y=\sup\{x,y\}$</span>、<span>$x\wedge y=\inf\{x,y\}$</span>。这把格视作信息组合的代数结构（<span>$\vee$</span> 为"或/合并"，<span>$\wedge$</span> 为"与"）。

### 2.2 链与升链条件

::: definition 定义（链、升链条件 ACC）
$S$ 是**链 (chain)**：$\forall x,y\in S.\ x\le y \vee y\le x$。$P$ 满足**升链条件 (ascending chain condition)**：对任意升序列 $x_1\le x_2\le\cdots$，存在 $n$ 使 $x_n = x_{n+1}=\cdots$（即无限升链不存在）。
:::

> ACC 是数据流分析**终止性**的关键：解算法产生每点的递增值序列，ACC 保证有限步收敛。

---

## 3. 传递函数（Transfer Functions）

::: definition 定义（传递函数族 F 的条件）
每个分析问题有一族传递函数 $f: P\to P$：

- 含**恒等函数** $i\in F$；

- 对**复合封闭**：$f,g\in F \Rightarrow \lambda x.f(g(x))\in F$；

- 每个 $f$ **单调 (monotone)**：$x\le y \Rightarrow f(x)\le f(y)$；

- 有时还**分配 (distributive)**：$f(x\vee y)=f(x)\vee f(y)$。
:::

::: theorem 定理（分配蕴含单调）
若 $f(x\vee y)=f(x)\vee f(y)$，则由 $x\vee y=y$ 得 $f(y)=f(x\vee y)=f(x)\vee f(y)$，即 $f(x)\le f(y)$。故分配 ⟹ 单调（反之不然）。
:::

---

## 4. 前向数据流分析框架

::: definition 定义（前向数据流方程）
每节点 $n$ 有 $in_n$（前）、$out_n$（后）、传递函数 $f_n$。解须满足：
$$out_n = f_n(in_n), \qquad in_n = \bigvee_{m\in pred(n)} out_m \ (n\ne n_0), \qquad in_{n_0} = I$$
其中 $I$ 概括程序起点的信息。
:::

**工作表算法**（前向）：

```text
for each n: out_n = f_n(⊥)
in_{n0} = I; out_{n0} = f_{n0}(I); worklist = N - {n0}
while worklist ≠ ∅:
    取出 n
    in_n = ⋁_{m∈pred(n)} out_m
    out_n = f_n(in_n)
    if out_n 改变: worklist ∪= succ(n)
```

::: theorem 定理（正确性与终止性）
**正确性**：每处理 $n$ 即令 $out_n=f_n(in_n)$；每当 $out_m$ 变就把 $succ(m)$ 入表，故最终解满足全部方程。
**终止性**：$in_n/out_n$ 取值序列是链，若停止增长则工作表清空；若格满足升链条件（如有限格）则必终止。无 ACC 时用**加宽算子 (widening)**——检测可能属无限升链的值，人为升到链的 lub（如把大小 ≥ n 的集合升到 TOP）。
:::

---

## 5. 后向数据流分析框架

**定义（后向数据流方程）**

$$in_n = f_n(out_n), \qquad out_n = \bigvee_{m\in succ(n)} in_m \ (n\notin N_{final}), \qquad out_n = O\ (n\in N_{final})$$

工作表算法对称：沿后继求 $out_n$，$in_n$ 变化时把 $pred(n)$ 入表。

---

## 6. 三大经典分析作为格实例

**定义（三大分析的格参数）**

| 分析 | P | ∨(join) | 序 | ⊥ | 初值 |
|---|---|---|---|---|---|
| 到达定义 | 定义集的幂集 | ∪ | ⊆ | ∅ | I=∅（前向） |
| 可用表达式 | 表达式集的幂集 | ∩ | ⊇ | P | I=∅（前向） |
| 活跃变量 | 变量集的幂集 | ∪ | ⊆ | ∅ | O=∅（后向） |

三者传递函数都是 **GEN/KILL 形式**：$f(x) = a\cup(x-b)$（$a$=GEN，$b$=KILL）。

**定理（GEN/KILL 框架满足全部性质）**

所有 $f(x)=a\cup(x-b)$ 形式的框架都满足恒等 ($a=b=\varnothing$)、分配 ($f(x)\cup f(y)=a\cup((x\cup y)-b)=f(x\cup y)$) 与复合封闭 ($f_1(f_2(x))=(a_1\cup(a_2-b_1))\cup(x-(b_2\cup b_1))$，仍是 GEN/KILL 形式）。

**保守性 (Conservatism)**：到达定义用 <span>$\cup$</span>（沿**任一**路径到达即考虑），可用表达式用 <span>$\cap$</span>（须沿**所有**路径可达）；优化须保守地考虑所有可能执行，分析结构随用途而变。

---

## 7. 分析结果的语义：抽象函数与正确性

::: definition 定义（程序执行与抽象函数）
程序状态 $s$ 是变量到值的映射，$\langle s,n\rangle$ 表示状态 $s$ 在节点 $n$。执行是轨迹 $\langle s_0,n_0\rangle;\dots;\langle s_k,n_k\rangle$。**抽象函数 (abstraction function)** $AF: ST\to P$ 把具体状态映到格元素，赋予分析结果意义。
:::

::: theorem 定理（正确性条件 / 健全性 Soundness）
对任意执行 $\langle s_0,n_0\rangle;\dots;\langle s_k,n_k\rangle$ 与其中 $s=s_i, n=n_i$，有
$$AF(s) \le in_n$$
即分析在 $n$ 前产生的结果"安全地高估"了任意实际执行的抽象。可对执行长度归纳证明（用传递函数单调性）。
:::

### 7.1 例：符号分析（Sign Analysis）

基础格是 <span>$\{-,0,+\}$</span> 的平坦格（加 TOP/BOT）；实际格为"每变量一个符号"的映射格（<span>$f_1\le f_2$</span> ⟺ 逐变量 <span>$\le$</span>）。解释：BOT=无信息、TOP=可正可负可零。传递函数：`v=c` 置 v 为 c 的符号；`v1=v2*v3` 用符号乘表 <span>$\otimes$</span>。

**例题（符号分析的两类不精确）**

```text
a=1; if(...) b=-1 else b=1; c=a*b;
两支汇合 b→TOP，故 c→TOP。
```

**抽象不精确**：把具体值 1 抽象成 +，格值比执行值粗。**控制流不精确**：用单个格值概括所有控制流路径（join 上移合并不同路径），任一具体执行中 b 其实非 TOP。不精确换取可解性（有限格、抽象无界值集、用 join 概括无界状态）。

---

## 8. 路径汇合解与分配性（Meet Over Paths & Distributivity）

::: definition 定义（理想解：路径汇合解 MOP）
对到达 $n$ 的路径 $p = n_0,n_1,\dots,n_k,n$，$f_p(\bot) = f_{n_k}(\cdots f_{n_0}(\bot)\cdots)$。理想解应满足
$$\bigvee\{f_p(\bot) : p\text{ 是到 }n\text{ 的路径}\} = in_n$$
:::

::: theorem 定理（工作表解 vs. MOP）
- 工作表算法总产生满足"对所有到 $n$ 的路径 $p$，$f_p(\bot)\le in_n$"的解（归纳 + 单调性证明），即工作表解 ≤（不优于）MOP。

- 若框架**分配**，则工作表算法恰好产生 **MOP 解**（分配保持精度）。
:::

### 8.1 缺乏分配性的反例（常量计算器）

::: example 例题（常量传播不分配）
平坦整数格。考虑 `c = a+b` 的传递函数 $f$：

```text
f([a→3,b→2]) ∨ f([a→2,b→3]) = [a→TOP,b→TOP,c→5]      （先算后并：c=5 精确）
f([a→3,b→2] ∨ [a→2,b→3]) = f([a→TOP,b→TOP]) = [...,c→TOP]  （先并后算：c=TOP 粗）
```

两者不等 ⟹ 不分配，工作表解（c→TOP）不如 MOP（c→5）精确。
:::

**补救**：在不同路径上保留值的组合 `{[a→2,b→3],[a→3,b→2]}` 可恢复分配，但**组合爆炸**（指数）且无限升链致不终止；用加宽算子消爆炸（按变量粒度），但损失精度。

### 8.2 多个不动点

::: theorem 定理（最小不动点）
数据流分析生成**最小不动点 (least fixed point)**；方程可能有多个不动点（如可用表达式在含环 CFG 上既有全 0 解也有全 1 解），算法选最小（最保守安全）的那个。
:::

---

## 9. 本讲小结

- 数据流信息 = 格元素；偏序/lub/glb/完全格/Top-Bottom 是骨架，升链条件保证终止。
- 传递函数须含恒等、复合封闭、单调（有时分配，分配⟹单调）；前/后向框架对称，工作表迭代到最小不动点。
- 三大分析是 GEN/KILL 格实例（到达定义 ∪/可用表达式 ∩/活跃 ∪），GEN/KILL 自动满足恒等、分配、复合。
- 抽象函数 <span>$AF$</span> 联系执行与分析，健全性 <span>$AF(s)\le in_n$</span>；不精确来自抽象与控制流合并，换取可解性。
- 理想是 MOP 解；分配框架下工作表 = MOP，非分配（如常量传播）则工作表更保守；解为最小不动点；无 ACC 时用加宽。
