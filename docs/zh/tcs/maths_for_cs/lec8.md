---
title: 整除性
course: 6.1200 计算机数学
course_id: '6.1200'
lecture: 8
kind: theory
tags: []
status: complete
---
# Lec 8 整除性

## 一、数论

整数的研究，这是数学中最古老的领域之一！数学家 Hardy 在 1940 年《一个数学家的辩白》（A Mathematician’s Apology）中曾说，我们可以庆幸：

> 数论与日常人类活动的距离如此遥远，因此它应该是温和而纯粹的

也就是说，它不应该用于战争。

但事实却完全相反：

数论后来拥有了大量应用，包括：

- 安全加密通信
- 电子商务
- 甚至在战争中也至关重要

不过这些就暂且不谈。

数论中有很多问题非常容易描述，但极其难以解决，例如：

- 哥德巴赫猜想（Goldbach’s conjecture）
- 双素数猜想（Twin Prime conjecture）

说到 Hardy，还有一个他和 Ramanujan 的趣事：

$1729 = 1^3 + 12^3 = 9^3 + 10^3$

这个数字不仅仅是一个数学趣闻：

- 它出现在后来 30 年后的 K3 曲面研究中
- 并与弦理论和量子物理有深刻联系

这说明：

> 数论几乎和一切都有联系。

## 二、整除性

::: definition
若存在整数 k 使得 ak = b， 则称 a 整除 b（*a divides b*） ， 记作 a | b

等价说法：b 是 a 的倍数（*multiple*），a 是 b 的因子（*divisor*）。
:::

**例：** $3 \mid 12$，$-5 \mid 100$，$n \mid n$，特别地情况， $0 \mid 0$。

**基本性质：**

| 性质                                                         | 说明                            |
| ------------------------------------------------------------ | ------------------------------- |
| $a \mid b$ 且 $b \mid c \implies a \mid c$                   | 传递性                          |
| $a \mid b \implies a \mid bc$                                | 整除可传递至倍数                |
| $a \mid b$ 且 $a \mid c \implies a \mid (b+c)$               | 整除对加法封闭                  |
| $a \mid b$ 且 $a \mid c \implies a \mid (sb + tc),\; \forall s,t \in \mathbb{Z}$ | 整除对整数线性组合（*ILC*）封闭 |

::: definition
整数线性组合（*integer linear combination, ILC*）
:::

$b$ 和 $c$ 的**整数线性组合**（*integer linear combination*, ILC）是形如 $sb + tc$（$s, t \in \mathbb{Z}$）的整数。

## 2. 引例：水壶问题

**问题：** 给定容量为 $a$ 和 $b$ 的两个水壶，通过倒满、倒空、互倒操作，能否量出恰好 $m$ 升水？

**状态机模型：** 状态 $(x, y)$ 表示两壶当前水量，转移包括：

- 倒空：$(0, y)$ 或 $(x, 0)$
- 倒满：$(a, y)$ 或 $(x, b)$
- 互倒（左→右）：$(0, x+y)$（若 $x+y \leq b$）或 $(x+y-b, b)$（若 $x+y > b$）
- 互倒（右→左）：类似

**不变量：** $P(x, y)$：$x$ 和 $y$ 均是 $a$ 和 $b$ 的整数线性组合。

*Proof（$P$ 被保持）：* 设 $x = sa + tb$，$y = ua + vb$。所有转移后的新状态均属于 $\{0, x, y, a, b, x+y, x+y-a, x+y-b\}$，每个都是 $a, b$ 的 ILC（如 $x+y = (s+u)a+(t+v)b$）。$\blacksquare$

**结论：** 所有可达状态 $(x, y)$ 中，$x$ 和 $y$ 均是 $\gcd(a, b)$ 的倍数。  

- $a = 3, b = 5$：$\gcd = 1$，任意整数量可达（含 4）。  
- $a = 6, b = 9$：$\gcd = 3$，5 不可达（5 不是 3 的倍数）。

---

## 3. 最大公因子 (*Greatest Common Divisor*)

> **Definition.** 整数 $a, b$ 的**公因子**（*common divisor*）是同时整除二者的整数 $d$。

> **Definition.** $a$ 和 $b$ 的**最大公因子**（*greatest common divisor*），记作 $\gcd(a, b)$，是满足"每个公因子都整除 $g$"的非负公因子 $g$。

**特殊值：** $\gcd(a, 0) = |a|$，$\gcd(0, 0) = 0$。

### 3.1 关键引理

**Lemma 1.** $\gcd(a, 0) = |a|$。

**Lemma 2.** $\gcd(a, b) = \gcd(a, b - a)$。

*Proof.* $a, b$ 的公因子集合与 $a, b-a$ 的公因子集合相同（$d \mid a$ 且 $d \mid b \iff d \mid a$ 且 $d \mid (b-a)$），故最大公因子相同。$\blacksquare$

> **Theorem（带余除法 / Division Theorem）.** 对整数 $n$ 和正整数 $d$，存在唯一整数对 $(q, r)$ 使得 $n = qd + r$ 且 $0 \leq r < d$。  
> $q = n \operatorname{div} d$ 称为**商**，$r = n \operatorname{rem} d$ 称为**余数**。

**Lemma 3.** $\gcd(a, b) = \gcd(a,\; b \operatorname{rem} a)$。

*Proof.* $b = aq + r$，故 $\gcd(a,b) = \gcd(a, b-a) = \gcd(a, b-2a) = \cdots = \gcd(a, r)$。$\blacksquare$

---

## 4. 欧几里得算法 (*Euclid's Algorithm*)

> **Definition（欧几里得算法）.** 从 $(a, b)$（$a \geq b \geq 0$）出发，反复执行 $(x, y) \mapsto (y,\; x \operatorname{rem} y)$，直到 $y = 0$，此时 $\gcd(a, b) = x$。

**不变量：** $\gcd(x, y) = \gcd(a, b)$（由 Lemma 3 保持）。

**终止性：** $x \operatorname{rem} y < y/2$（当 $y \leq x$ 时），故每两步后 $x + y$ 至少减半，步数上界为 $O(\log(a+b))$（即位数之和）。

**示例：** $\gcd(1001, 777)$：

```text
gcd(1001, 777) = gcd(777, 224)   [q=1]
               = gcd(224, 105)   [q=3]
               = gcd(105, 14)    [q=2]
               = gcd(14,  7)     [q=7]
               = gcd(7,   0)     [q=2]
               = 7
```

---

## 5. 扩展欧几里得算法 (*Extended Euclidean Algorithm / The Pulverizer*)

**目标：** 不仅求 $\gcd(a, b)$，还找到整数 $s, t$ 使得 $\gcd(a, b) = sa + tb$。

**思路：** 在欧几里得算法的每一步中，同步维护 $x = sa + tb$ 和 $y = ua + vb$ 的表示。

**状态：** $(x, y, s, t, u, v)$，初始为 $(a, b, 1, 0, 0, 1)$。

**转移：** $(x, y, s, t, u, v) \mapsto (y, r, u, v, s-qu, t-qv)$，其中 $q = x \operatorname{div} y$，$r = x \operatorname{rem} y$。

**不变量：**

1. $\gcd(x, y) = \gcd(a, b)$
2. $x = sa + tb$
3. $y = ua + vb$

**示例：** $\gcd(1001, 777) = 7$，追踪 ILC 表示：

| $x$  | $y$  | 表示             |
| ---- | ---- | ---------------- |
| 1001 | 777  | $1001 = 1a + 0b$ |
| 777  | 224  | $224 = a - b$    |
| 224  | 105  | $105 = -3a + 4b$ |
| 105  | 14   | $14 = 7a - 9b$   |
| 14   | 7    | $7 = -52a + 67b$ |
| 7    | 0    | —                |

故 $\gcd(1001, 777) = 7 = -52 \times 1001 + 67 \times 777$。

---

## 6. Bézout 恒等式与推论

> **Theorem (Bézout's Identity).** $\gcd(a, b)$ 可以写成 $a$ 和 $b$ 的整数线性组合：存在 $s, t \in \mathbb{Z}$ 使得 $\gcd(a, b) = sa + tb$。

> **Corollary 1.** 整数 $m$ 可以写成 $a, b$ 的 ILC $\iff$ $\gcd(a, b) \mid m$。

*Proof.* ($\Rightarrow$) 任何 ILC 是 $\gcd(a,b)$ 的倍数。($\Leftarrow$) 设 $m = k\cdot\gcd(a,b)$，由 Bézout 得 $\gcd(a,b) = sa+tb$，故 $m = (ks)a+(kt)b$。$\blacksquare$

> **Corollary 2.** $\gcd(a, b)$ 是 $a, b$ 所有正 ILC 中最小的。

*Proof.* 所有 ILC 恰好是 $\gcd(a,b)$ 的所有倍数，$\gcd(a,b)$ 是其中最小正整数。$\blacksquare$

---

## 7. 关键术语速查

| 英文                                        | 中文                          |
| ------------------------------------------- | ----------------------------- |
| *Divisibility* / $a \mid b$                 | 整除性                        |
| *Divisor / Factor*                          | 因子                          |
| *Multiple*                                  | 倍数                          |
| *Integer linear combination (ILC)*          | 整数线性组合                  |
| *Greatest common divisor (GCD)*             | 最大公因子                    |
| *Division Theorem*                          | 带余除法定理                  |
| *Quotient / Remainder*                      | 商 / 余数                     |
| *Euclid's Algorithm*                        | 欧几里得算法                  |
| *Extended Euclidean Algorithm / Pulverizer* | 扩展欧几里得算法 / 辗转相除法 |
| *Bézout's Identity*                         | Bézout 恒等式                 |
