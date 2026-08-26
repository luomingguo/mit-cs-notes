---
title: 渐进分析
type: lecture
lecture: 6
tags: []
status: complete
---
# Lec 6 渐进分析

## 一、引例：Goomy 叠叠乐

**问题：** $n$ 块宽度为 1 的矩形叠放，每块可相对下一块错开，设 $d_i$ 为第 $i$​ 块右边缘相对第 0 块右边缘的偏移。能否让顶层 Goomy 悬出桌边超过 1 个单位？

<img src="https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260618045214868.png" alt="image-20260618045214868" style="zoom:50%;" />

**约束（重心不超出支撑范围）：** 前 $k$ 块的集体重心不得超出第 $k$ 块右边缘，即

$$d_k = \frac{1}{2} + \frac{1}{k}\sum_{i=0}^{k-1} d_i \quad \text{（贪心策略：恰好到极限）}$$

用扰动法化简递推：相邻两式相减得

$$d_k = d_{k-1} + \frac{1}{2k}$$

展开得

$$d_n = \frac{1}{2}\left(1 + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n}\right) = \frac{1}{2}H_n$$

由于调和级数发散，$d_n \to \infty$，理论上可悬出任意远。实际上仅需 4 块（$H_4 > 2$）即可悬出 1 个单位。

## 二、调和数

> **Definition.** 第 $n$ 个调和数（*harmonic number*）为 $H_n = \displaystyle\sum_{i=1}^{n} \frac{1}{i}$。

用积分界（递减函数）估计 $H_n$：

$$\frac{1}{n} + \ln n \;\leq\; H_n \;\leq\; 1 + \ln n$$

两侧差值不超过 1，故 $H_n \sim \ln n$（见第 3 节）。

---

## 三、渐近符号 (*Asymptotic Notation*)

### 3.1 Tilde 符号 $\sim$

> **Definition.** $f \sim g$ 当且仅当 $\displaystyle\lim_{x\to\infty}\frac{f(x)}{g(x)} = 1$。

含义：$f$ 和 $g$ 在极限意义下"精确相等"（比值趋于 1）。

**Example.** $H_n \sim \ln n$，$n! \sim \left(\dfrac{n}{e}\right)^n\!\sqrt{2\pi n}$（Stirling 公式）。

### 3.2 Big-O（上界）

> **Definition.** $f \in O(g)$ 当且仅当 $\exists c \in \mathbb{R},\; \exists M \in \mathbb{Z}^+,\; \forall x > M:\; |f(x)| \leq c \cdot g(x)$。

**含义：** $f$ 渐近上界为 $g$（忽略常数倍和有限例外），对应"$\leq$"。

> **Theorem.** 若 $\displaystyle\lim_{x\to\infty}\frac{|f(x)|}{g(x)} \in \mathbb{R}$，则 $f \in O(g)$。（极限存在 $\Rightarrow$ Big-O；反之不一定。）

**等价形式（离散域）：** $f \in O(g) \iff \exists c'.\; \forall x.\; |f(x)| \leq c' \cdot g(x)$。

**Examples：**

| $f$       | $g$   | $f \in O(g)$? | 理由                                  |
| --------- | ----- | ------------- | ------------------------------------- |
| $x$       | $x^2$ | ✓             | 极限为 0                              |
| $3\sin x$ | $1$   | ✓             | 取 $c=3$，$M=0$                       |
| $x^2$     | $x$   | ✗             | 对任意 $c,M$，取 $x>\max(c,M)$ 即违反 |
| 多项式    | $2^x$ | ✓             | 极限为 0                              |
| $4^x$     | $2^x$ | ✗             | 比值 $\to\infty$                      |

### 3.3 Little-o（严格上界）

> **Definition.** $f \in o(g)$ 当且仅当 $\displaystyle\lim_{x\to\infty}\frac{f(x)}{g(x)} = 0$。

**含义：** $f$ 比 $g$ 渐近"严格小"，对应"$<$"。  
**关系：** $f \in o(g) \implies f \in O(g)$（小 $o$ 蕴含大 $O$）。

### 3.4 Big-Ω（下界）

> **Definition.** $f \in \Omega(g)$ 当且仅当 $g \in O(f)$。

**含义：** $f$ 渐近下界为 $g$，对应"$\geq$"。

> **Theorem.** 若 $\displaystyle\lim_{x\to\infty}\frac{|f(x)|}{g(x)} \in (0,\infty]$，则 $f \in \Omega(g)$。

> **Theorem.** $f \in o(g) \implies f \notin \Omega(g)$。

### 3.5 Little-ω（严格下界）

> **Definition.** $f \in \omega(g)$ 当且仅当 $g \in o(f)$，即 $\displaystyle\lim_{x\to\infty}\frac{f(x)}{g(x)} = \infty$。

**含义：** $f$ 比 $g$ 渐近"严格大"，对应"$>$"。

### 3.6 Theta（紧确界）

> **Definition.** $f \in \Theta(g)$ 当且仅当 $f \in O(g)$ 且 $f \in \Omega(g)$。

**含义：** $f$ 和 $g$ 渐近等价（相差常数倍），对应"$=$"。

> **Theorem.** 若 $\displaystyle\lim_{x\to\infty}\frac{f(x)}{g(x)} \in \mathbb{R}^+$，则 $f \in \Theta(g)$。

---

## 四、各符号汇总

| 符号              | 定义                                      | 极限条件                    | 直觉对应 |
| ----------------- | ----------------------------------------- | --------------------------- | -------- |
| $f \sim g$        | —                                         | $\lim f/g = 1$              | $=$      |
| $f \in O(g)$      | $\exists c,M.\;\forall x>M.\;|f| \leq cg$ | $\lim |f|/g \in \mathbb{R}$ | $\leq$   |
| $f \in o(g)$      | —                                         | $\lim f/g = 0$              | $<$      |
| $f \in \Omega(g)$ | $g \in O(f)$                              | $\lim |f|/g \in (0,\infty]$ | $\geq$   |
| $f \in \omega(g)$ | $g \in o(f)$                              | $\lim f/g = \infty$         | $>$      |
| $f \in \Theta(g)$ | $f\in O(g)$ 且 $f\in\Omega(g)$            | $\lim f/g \in \mathbb{R}^+$ | $=$      |

> **注意：** 极限条件是充分条件（红色警示），不是等价定义（黑色是定义）。

## 五、常见误用警告

- **绝对禁止写 $f = O(g)$**：$O(g)$ 是函数的集合，不是单个值，会导致"$f = O(g)$ 且 $h = O(g)$，故 $f = h$"等谬误。应写 $f \in O(g)$ 或 $f \leq O(g)$。
- $f \geq O(g)$ 毫无意义（因为 0 函数 $\in O(g)$）。
- 注意 $\Omega, \omega$ 在 CS 和数论中定义不同，本课使用 CS 定义（更强）。

## 六、Stirling 公式

$$n! \sim \left(\frac{n}{e}\right)^n \sqrt{2\pi n}$$

更精确形式：$n! = \left(\dfrac{n}{e}\right)^n\!\sqrt{2\pi n}\cdot e^{\epsilon(n)}$，其中 $\dfrac{1}{12n+1} \leq \epsilon(n) \leq \dfrac{1}{12n}$，乘法误差 $< 1 + \dfrac{1}{144n^2}$。

推导：$\ln(n!) = \displaystyle\sum_{i=1}^n \ln i$，对递增函数 $f(x) = \ln x$ 应用积分界：

$$n\ln n - n + 1 \leq \ln(n!) \leq (n+1)\ln n - n + 1$$

即 $n^n/e^{n-1} \leq n! \leq n^{n+1}/e^{n-1}$，误差在 $n$ 倍以内。

## 七、关键术语速查

| 英文                    | 中文                      |
| ----------------------- | ------------------------- |
| *Harmonic number* $H_n$ | 调和数                    |
| *Asymptotic notation*   | 渐近符号                  |
| *Tilde* $\sim$          | Tilde 符号（渐近相等）    |
| *Big-O* $O$             | 大 O 符号（渐近上界）     |
| *Little-o* $o$          | 小 o 符号（严格渐近上界） |
| *Big-Omega* $\Omega$    | 大 Omega（渐近下界）      |
| *Little-omega* $\omega$ | 小 omega（严格渐近下界）  |
| *Theta* $\Theta$        | Theta（紧确界）           |
| *Stirling's formula*    | Stirling 公式             |
| *Closed form*           | 闭合公式                  |
