---
title: Modular Arithmetic
course: 6.1200 计算机数学
course_id: '6.1200'
lecture: 9
kind: theory
tags: []
status: complete
---
# Lec 09 Modular Arithmetic

> MIT 6.1200J Mathematics for Computer Science, Spring 2024

---

## 1. 模运算的直觉

模运算的核心思想：**忽略 $n$ 的倍数，只关注余数**。

| 场景           | 模数 $n$ |
| -------------- | -------- |
| 奇偶性         | 2        |
| 星期几         | 7        |
| 数字末位       | 10       |
| 时钟（12小时） | 12       |

**Example.** 现在是周二，100 天后是星期几？$100 \operatorname{rem} 7 = 2$，周二加 2 天 = 周四。

---

## 2. 同余关系 (*Congruence*)

> **Definition.** 称 $a$ **同余于** $b$ 模 $n$（*a is congruent to b mod n*），记作 $a \equiv_n b$，当且仅当 $n \mid (a - b)$。

**等价刻画：**

> **Theorem.** $a \equiv_n b \iff (a \operatorname{rem} n) = (b \operatorname{rem} n)$。

*Proof.* 若余数相同均为 $r$，则 $a = nq + r$，$b = nq' + r$，故 $a - b = n(q - q')$，即 $n \mid (a-b)$。反之若 $n \mid (a-b)$，设 $b = qn + r$，则 $a = (k+q)n + r$，由带余除法唯一性知 $a \operatorname{rem} n = r$。$\blacksquare$

**剩余类（*residue classes* / *equivalence classes*）：** 模 $n$ 下恰好有 $n$ 个类 $[0], [1], \ldots, [n-1]$，每个整数属于其余数所在的类。

**示例（模 5）：**

```text
[0] = { ..., -10, -5,  0,  5, 10, ... }
[1] = { ...,  -9, -4,  1,  6, 11, ... }
[2] = { ...,  -8, -3,  2,  7, 12, ... }
[3] = { ...,  -7, -2,  3,  8, 13, ... }
[4] = { ...,  -6, -1,  4,  9, 14, ... }
```

---

## 3. 符号说明

| 写法                                   | 含义                                   | 类型                            |
| -------------------------------------- | -------------------------------------- | ------------------------------- |
| `a rem n` / `a mod n`                  | $a$ 除以 $n$ 的非负余数，值域 $[0, n)$ | **函数**，单一确定值            |
| $a \equiv_n b$ / $a \equiv b \pmod{n}$ | $a$ 与 $b$ 模 $n$ 同余                 | **关系**，双方无需在 $[0,n)$ 内 |

> **注意：** 不同编程语言对负数取模行为不同。本课始终使用**非负余数**定义（Python / Mathematica 约定）。例：$(-43) \operatorname{rem} 10 = 7$，而非 $-3$。

---

## 4. 模运算的代数性质

> **Theorem.** 若 $a \equiv_n b$，则对任意 $c$：
>
> 1. $a + c \equiv_n b + c$
> 2. $ac \equiv_n bc$
> 3. $a - c \equiv_n b - c$
> 4. $c - a \equiv_n c - b$

*Proof.* 每条均由 $n \mid (a - b)$ 直接验证。例如第 2 条：$ac - bc = (a-b)c$，是 $a-b$ 的倍数，故 $n \mid (ac - bc)$。$\blacksquare$

> **Theorem.** 若 $x \equiv_n y$，则对任意 $k \geq 1$，$x^k \equiv_n y^k$。

*Proof（归纳）：* Base case $k=1$ 即假设。归纳步骤：
$$x^k = x \cdot x^{k-1} \equiv_n y \cdot x^{k-1} \equiv_n y \cdot y^{k-1} = y^k \qquad \blacksquare$$

> **警告：** 指数本身**不能**随意对 $n$ 取模。例：$1 \equiv_5 6$，但 $2^1 = 2 \not\equiv_5 64 = 2^6$。

**Example.** 求 $x = 1133^{511111}(6 + 77995000)$ 的最后两位（即 $x \operatorname{rem} 100$）。

- 底数：$1133 \equiv_{100} 33$，进一步 $35^1 \equiv_{100} 35$，$35^2 \equiv_{100} 25$，$35^3 \equiv_{100} 75$，$35^4 \equiv_{100} 25$，…（在 25 和 75 间交替），$35^{11111} \equiv_{100} 75$。
- 指数中：$99 \equiv_{100} -1$，故 $99^{5000} \equiv_{100} (-1)^{5000} = 1$，即括号内 $\equiv_{100} 6 + 1 = 7$。
- 故 $x \equiv_{100} 75 \times 7 = 525 \equiv_{100} 25$。

---

## 5. 模意义下的除法与逆元

### 5.1 乘法逆元 (*Multiplicative Inverse*)

> **Definition.** $a$ 模 $n$ 的**乘法逆元**是满足 $ab \equiv_n 1$ 的整数 $b$，记作 $a^{-1}$。

> **Theorem.** $a$ 有模 $n$ 的逆元 $\iff$ $\gcd(a, n) = 1$（即 $a$ 与 $n$ **互质**）。

*Proof.* $\exists b:\; ab \equiv_n 1 \iff \exists b, q:\; ab - nq = 1 \iff 1$ 是 $a, n$ 的 ILC $\iff \gcd(a,n) = 1$。$\blacksquare$

> **Corollary.** 若 $p$ 是质数且 $a \not\equiv_p 0$，则 $a$ 有模 $p$ 的逆元。

**求逆元的方法：** 用 Pulverizer（扩展欧几里得算法）。

**Example.** $7$ 和 $13$ 是模 $30$ 的互逆（$7 \times 13 = 91 \equiv_{30} 1$）。  
解方程 $7x \equiv_{30} 14$：两边乘以 $13$，得 $91x \equiv_{30} 182$，即 $x \equiv_{30} 2$。

### 5.2 注意：不能随便"约分"

若 $\gcd(a, n) > 1$，则 $a$ 无逆元，从 $ac \equiv_n bc$ **不能**推出 $a \equiv_n b$。  
例：$3 \times 5 \equiv_6 3 \times 1$，但 $5 \not\equiv_6 1$。

---

## 6. Fermat 小定理 (*Fermat's Little Theorem*)

> **Theorem (FLT).** 若 $p$ 为质数且 $a \not\equiv_p 0$，则 $a^{p-1} \equiv_p 1$。

*Proof.* 考虑集合 $\{a, 2a, 3a, \ldots, (p-1)a\}$ 模 $p$ 的余数：

- 无一为 $0$（因 $p \nmid a$，$p$ 是质数）；
- 无两个相同（若 $ia \equiv_p ja$，则因 $a$ 有逆元，$i \equiv_p j$，但 $1 \leq i, j \leq p-1$ 无重复）。

故此集合模 $p$ 恰好是 $\{1, 2, \ldots, p-1\}$ 的某个排列，两边取乘积：

$$(p-1)! \cdot a^{p-1} \equiv_p (p-1)!$$

因 $\gcd((p-1)!, p) = 1$，可约去 $(p-1)!$，得 $a^{p-1} \equiv_p 1$。$\blacksquare$

**推论：** 模质数 $p$ 时，指数可以对 $p-1$ 取模（而非对 $p$）：

$$a^k \equiv_p a^{k \operatorname{rem} (p-1)}$$

---

## 7. 应用

### 7.1 整除 9 的判断法

> **Theorem.** $n$ 被 9 整除 $\iff$ $n$ 的各位数字之和被 9 整除。

*Proof.* 设 $n = \sum_{i} d_i \cdot 10^i$。因 $10 \equiv_9 1$，故 $10^i \equiv_9 1$，所以 $n \equiv_9 \sum_i d_i$。$\blacksquare$

### 7.2 ISBN 校验码

ISBN-10：$(a_1, \ldots, a_{10})$，校验条件为

$$\sum_{i=1}^{10} i \cdot a_i \equiv_{11} 0$$

- 模数 11 是质数，$\gcd(10, 11) = 1$，故 $a_{10}$ 总有唯一解（由前 9 位确定）。
- 可证：单个数字出错或相邻两位互换，校验均失败。

### 7.3 奇偶校验 (*Parity*)

简单 RAID 思路：存 $b_1, b_2$，第三块存 $b_3 = b_1 \oplus b_2$（加法模 2）。任意一块损坏可从另两块恢复。

---

## 8. 关键术语速查

| 英文                                | 中文            |
| ----------------------------------- | --------------- |
| *Congruence* $a \equiv_n b$         | 同余            |
| *Residue / Remainder*               | 余数            |
| *Residue class / Equivalence class* | 剩余类 / 等价类 |
| *Modular arithmetic*                | 模运算 / 模算术 |
| *Multiplicative inverse*            | 乘法逆元        |
| *Coprime*                           | 互质            |
| *Fermat's Little Theorem (FLT)*     | Fermat 小定理   |
| *Parity*                            | 奇偶性          |
| *ISBN checksum*                     | ISBN 校验码     |
