---
title: 更多计数
type: lecture
lecture: 17
tags: []
status: complete
---
# Lec 17 更多计数

## 1. 容斥原理（Inclusion-Exclusion，PIE）

**问题起点：** 加法法则要求集合两两不相交。若集合有交叉，该如何计算并集的大小？

**两个集合：**

$$|A \cup B| = |A| + |B| - |A \cap B|$$

**三个集合：**

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

**一般形式（$n$ 个集合）：**

$$\left|\bigcup_{i=1}^{n} A_i\right| = \sum_{i}|A_i| - \sum_{i < j}|A_i \cap A_j| + \sum_{i < j < k}|A_i \cap A_j \cap A_k| - \cdots \pm |A_1 \cap \cdots \cap A_n|$$

规律：加单集合，减两两交，加三重交，……交替进行直到 $n$ 重交。

### 定理（PIE 的等价形式）

设 $U = \bigcup_{i \in [n]} A_i$，则

$$\sum_{I \subseteq [n]} (-1)^{|I|} \left|\bigcap_{i \in I} A_i\right| = 0$$

其中约定 $\bigcap_{\emptyset} = U$。

**证明：** 对任意 $x \in U$，设 $I_x = {i : x \in A_i}$（非空）。$x$ 对左侧的贡献为 $\sum_{I \subseteq I_x} (-1)^{|I|}$。取 $I_x$ 中任意一个元素 $i$，对偶映射 $I \leftrightarrow I \triangle {i}$ 在偶数大小子集和奇数大小子集之间建立双射，故贡献之和为 0。

### 应用：与 $n = pqr$ 互质的数的个数

设 $n = pqr$（三个不同素数之积），求 ${1, 2, \ldots, n}$ 中与 $n$ 互质的数的个数。

设 $A_p, A_q, A_r$ 分别为 ${1,\ldots,n}$ 中 $p, q, r$ 的倍数的集合。

由容斥原理：

$$|A_p \cup A_q \cup A_r| = \frac{n}{p} + \frac{n}{q} + \frac{n}{r} - \frac{n}{pq} - \frac{n}{pr} - \frac{n}{qr} + \frac{n}{pqr}$$

化简后，互质的数的个数为：

$$n - |A_p \cup A_q \cup A_r| = (p-1)(q-1)(r-1)$$

------

## 2. 鸽巢原理（Pigeonhole Principle）

**定理：** 若 $|A| > |B|$，则任意全函数 $f: A \to B$ 均不是单射——即存在 $a_1 \neq a_2 \in A$ 使得 $f(a_1) = f(a_2)$。

形象地说：鸽子（$A$）比鸽巢（$B$）多，则必有某个鸽巢里住了至少两只鸽子。

**特点：非构造性。** 只能证明碰撞存在，无法直接找出具体的碰撞对象。

**例：** 房间里超过 26 人，则必有两人姓名首字母相同。

**例（配对袜子）：** $n$ 种颜色的袜子各一双，至少取多少只才保证凑成一双？答案恰好是 $n+1$（$n$ 只不能保证，$n+1$ 只由鸽巢原理保证）。

**例（波士顿居民）：** 波士顿约 65 万人，头发数量至多约 20 万根。人数 > 可能的发量种数，故必有两位非秃头的波士顿居民发量完全相同。

**例（无损压缩的不可能性）：** 长度为 $n$ 的二进制串共 $2^n$ 个，而长度更短的串只有 $2^n - 1$ 个。任何全函数从较大集合到较小集合都有碰撞，故不存在对**所有** $n$ 位串都严格缩短的无损压缩方案。

**广义鸽巢原理：** 若 $|A| > k \cdot |B|$，则任意从 $A$ 到 $B$ 的全函数必有某个元素 $b \in B$ 被至少 $k+1$ 个元素映射到。

**棋盘例题：** 在 $8 \times 8$ 棋盘的 64 格中放置 33 个车，证明可以找到 5 个互不攻击的车（即位于 5 个不同行和 5 个不同列）。

**构造：** 将棋盘 64 个格子用数字 1~8 标记（见课件中的"斜条纹"分组，每组恰好 8 个格子，每行每列各含一个）。将 33 个车的标记视为鸽子，8 个标记值视为鸽巢。由广义鸽巢原理（$33 > 4 \times 8$），必有某个标记值对应至少 5 个车；这 5 个车的标记相同，意味着它们位于 5 个不同行、5 个不同列，互不攻击。

------

## 3. 组合恒等式与双重计数

**核心思路：** 对同一个集合用两种不同方式计数，令结果相等，得到恒等式。

### 恒等式一

$$\sum_{k=0}^{n} \binom{n}{k} = 2^n$$

**证明：** 设 $S$ 为 ${1, \ldots, n}$ 的所有子集构成的集合。

- 一方面，$|S| = 2^n$（每个元素独立选入或不选入）。
- 另一方面，按子集大小分类，大小为 $k$ 的子集有 $\binom{n}{k}$ 个，由加法法则 $|S| = \sum_{k=0}^{n} \binom{n}{k}$。 两式相等即得。

### 二项式定理（Binomial Theorem）

$$（x + y)^n = \sum_{k=0}^{n} \binom{n}{k} x^k y^{n-k}$$

**证明：** 展开 $(x+y)^n$ 得 $2^n$ 个形如 $a_1 a_2 \cdots a_n$（每个 $a_i$ 为 $x$ 或 $y$）的项。$x^k y^{n-k}$ 项的系数 = 从 $n$ 个位置中选 $k$ 个位置填 $x$ 的方案数 $= \binom{n}{k}$。

### 多项式定理（Multinomial Theorem）

$$\left(\sum_{i=1}^{m} x_i\right)^n = \sum_{k_1 + \cdots + k_m = n} \binom{n}{k_1, k_2, \ldots, k_m} \prod_{i=1}^{m} x_i^{k_i}$$

其中**多项式系数**为：

$$\binom{n}{k_1, k_2, \ldots, k_m} = \frac{n!}{k_1!, k_2!, \cdots, k_m!}$$

### Pascal 恒等式

$$\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$$

**组合证明：** 设 $S$ 为 ${1, \ldots, n}$ 的所有大小为 $k$ 的子集。

- 包含 $n$ 的子集：还需从 ${1, \ldots, n-1}$ 中选 $k-1$ 个，共 $\binom{n-1}{k-1}$ 种。
- 不包含 $n$ 的子集：从 ${1, \ldots, n-1}$ 中选 $k$ 个，共 $\binom{n-1}{k}$ 种。 两类不相交且覆盖所有子集，由加法法则得证。

该恒等式说明**帕斯卡三角**（Pascal's Triangle）中每个数等于其正上方两数之和。帕斯卡三角第 $n$ 行之和为 $2^n$，各对角线之和给出斐波那契数列。

------

## 附录：常用求和/求积记号

$$\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n, \quad \prod_{i=1}^{n} x_i = x_1 \times x_2 \times \cdots \times x_n$$

$$\bigcup_{i=1}^{n} S_i = S_1 \cup \cdots \cup S_n, \quad \bigcap_{i=1}^{n} S_i = S_1 \cap \cdots \cap S_n$$

$$[n] := {1, 2, \ldots, n}$$

边界约定：$\sum_{\emptyset} = 0$，$\prod_{\emptyset} = 1$，$\bigcup_{\emptyset} = \emptyset$，$\bigcap_{\emptyset} = U$（全集）。
