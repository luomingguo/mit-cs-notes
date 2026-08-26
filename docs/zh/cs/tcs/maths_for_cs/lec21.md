---
title: 随机变量
type: lecture
lecture: 21
tags: []
status: complete
---
# Lec 17 随机变量

## Lecture 21：随机变量

> 来源：MIT 6.1200J / 18.062J Mathematics for Computer Science，Spring 2024

------

## 1. 随机变量的定义

> **定义（随机变量）：** **随机变量**（*random variable*，简称 RV）是以样本空间为定义域的全函数。

**示例：** 抛三枚独立公平硬币的样本空间上：

- 第一枚硬币的值（H 或 T，或编码为 0/1）
- $R$：正面朝上的总数
- $M$：三枚结果完全相同时为 1，否则为 0（**指示随机变量**）

> **定义（指示随机变量）：** 取值在 ${0, 1}$ 的随机变量称为**指示随机变量**（*indicator random variable*），也称 **Bernoulli** 随机变量。

**随机变量与事件的互相转化：**

- 对随机变量 $f$ 和值 $x$，事件 $[f = x] := {\omega \in S : f(\omega) = x}$
- 对事件 $A$，指示随机变量 $\mathbf{1}[A](https://claude.ai/chat/\omega) = 1$ 若 $\omega \in A$，否则为 0

由求和规则：

$$\Pr[f \geq x] = \sum_{y \geq x} \Pr[f = y], \quad \Pr[f \in T] = \sum_{x \in T} \Pr[f = x]$$

------

## 2. 随机变量的条件化与独立性

**条件化示例：**

$$\Pr[R = 2 \mid M = 1] = \frac{\Pr[R = 2 \cap M = 1]}{\Pr[M = 1]} = 0$$

（$M=1$ 意味着三枚结果相同，不可能恰好 2 枚正面）

> **定义（随机变量的独立性）：** 两个随机变量 $X$、$Y$ **独立**，若对其值域中的所有 $x$、$y$： $$\Pr[X = x \cap Y = y] = \Pr[X = x] \cdot \Pr[Y = y]$$ 等价地，对所有 $x$、$y$，要么 $\Pr[Y=y]=0$，要么 $\Pr[X=x \mid Y=y] = \Pr[X=x]$。

**$R$ 与 $M$ 不独立**（由上例直接得到）。

**骰子示例：** 掷两枚公平骰子得 $D_1$、$D_2$，令 $S = D_1 + D_2$，$T = \mathbf{1}[S=7]$。

- $D_1$ 与 $S$：不独立（$D_1=6$ 时 $S \geq 7$）
- $T$ 与 $D_1$：**独立**，因为 $\Pr[T=1 \mid D_1=d] = 1/6 = \Pr[T=1]$（对任意 $d$，恰有一个 $D_2$ 使和为 7）

> **定义（互独立随机变量集合）：** 随机变量集合 $X_1, \ldots, X_n$ **互独立**，若对所有 $x_1, \ldots, x_n$： $$\Pr[X_1=x_1, \ldots, X_n=x_n] = \prod_{i=1}^n \Pr[X_i=x_i]$$ 较小子集的独立性可由对多余变量求和自动得出，无需单独验证。

------

## 3. 概率质量函数与累积分布函数

> **定义：** 对随机变量 $X$，定义：
>
> - **概率质量函数**（*probability mass function*，PMF）：$f(x) = \Pr[X = x]$
> - **累积分布函数**（*cumulative distribution function*，CDF）：$F(x) = \sum_{y \leq x} \Pr[X = y]$

**常见分布：**

**Bernoulli 分布（指示随机变量）：**

$$f(0) = p, \quad f(1) = 1-p, \quad F(0) = p, \quad F(1) = 1$$

**${1, 2, \ldots, n}$ 上的均匀分布：**

$$f(i) = \frac{1}{n}, \quad F(i) = \frac{i}{n}, \quad \forall i \in {1, \ldots, n}$$

------

## 4. 二信封问题（*Two Envelope Problem*）

**问题：** 两个信封各含 0~100 整数，不等。看到自己信封中的数后，是否应该换？

**分析：** 选取随机阈值 $z$ 均匀取自 ${0.5, 1.5, \ldots, 99.5}$。策略：若看到的数 $x_r > z$ 则保持，否则换。

- 若 $z$ 恰好在 $x_0$ 与 $x_1$ 之间（概率至少 $1/100$），则必然选出较大值。
- 否则以 $1/2$ 概率成功。

$$\Pr[\text{成功}] \geq \frac{1}{100} \cdot 1 + \frac{99}{100} \cdot \frac{1}{2} = \frac{1}{2} + \frac{1}{200} > \frac{1}{2}$$

**意义：** 这里将概率用于**算法设计**（随机化算法），而非仅仅建模不确定性。

------

## 5. 二项分布（*Binomial Distribution*）

**场景：** 抛 $n$ 枚独立硬币，每枚正面概率为 $p$，$X$ = 正面总数。

> **定义（二项分布 PMF）：** $$f_{n,p}(k) = \Pr[X = k] = \binom{n}{k} p^k (1-p)^{n-k}$$

**直觉：** 恰好 $k$ 次正面的每个结果发生概率为 $p^k(1-p)^{n-k}$，共有 $\binom{n}{k}$ 种这样的结果。

**CDF：**

$$F_{n,p}(k) = \sum_{j=0}^{k} \binom{n}{j} p^j (1-p)^{n-j}$$

**Stirling 近似（选读）：** 对 $k = \alpha n$：

$$f_{n,p}(\alpha n) \approx \frac{1}{\sqrt{2\pi\alpha(1-\alpha)n}} \cdot \left(\frac{p}{\alpha}\right)^{\alpha n} \cdot \left(\frac{1-p}{1-\alpha}\right)^{(1-\alpha)n}$$

指数部分在 $\alpha \neq p$ 时为负，极大值在 $\alpha = p$ 处取得，"尾部"概率指数级衰减。

**数值示例（$p=0.5$，$n=100$）：**

- $f(50) \approx 0.08$（在均值处仍很小）
- $f(25) \approx 1.9 \times 10^{-7}$（极其微小）
- 事实上，$\Pr[X = 25] > \Pr[X < 25]$（两者均极小）
