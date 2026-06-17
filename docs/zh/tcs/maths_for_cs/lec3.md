# Lec 3 分类讨论和强归纳法





## 一、证明技术汇总（截至本讲）

| 技术             | 目标形式                           | 方法                                |
| ---------------- | ---------------------------------- | ----------------------------------- |
| 存在性（构造）   | $\exists x.\; P(x)$                | 给出具体的 $x^*$，验证 $P(x^*)$     |
| 普遍性（实例化） | $\forall x.\; P(x)$                | 取任意 $x$，证明 $P(x)$             |
| 直接证明         | $P \implies Q$                     | 假设 $P$，推出 $Q$                  |
| 逆否证明         | $P \implies Q$                     | 假设 $\neg Q$，推出 $\neg P$        |
| 反证法           | $P$                                | 假设 $\neg P$，推出矛盾             |
| 归纳法           | $\forall n \in \mathbb{N}.\; P(n)$ | 证 $P(0)$ 及 $P(n) \implies P(n+1)$ |



## 二、 分情形证明 (*Proof by Cases*)

**核心逻辑：** 对任意命题 $C$，$C \lor \neg C$ 为恒真式（*tautology*）。  
因此，欲证 $P$，只需证：

1. $C \implies P$
2. $\neg C \implies P$

两个情形覆盖所有可能，故 $P$ 成立。

**模板：**

```
Proof. By cases on C:
  Case 1: Assume C. Then P because ...
  Case 2: Assume ¬C. Then P because ...
Since C ∨ ¬C is a tautology, P holds. □
```

### 2.1 示例：恒真式

**Example.** $(A \implies B) \lor (B \implies C)$ 是恒真式。

*Proof.* 按 $B$ 的真值分情形：

- **Case 1**（$B$ 为真）：$A \implies B$ 为真，故析取式为真。
- **Case 2**（$B$ 为假）：$B \implies C$ 为真，故析取式为真。

两种情形穷尽所有可能，命题成立。$\blacksquare$

### 2.2 示例：Ramsey 理论

**Example.** 6 人中，必有 3 人互为朋友，或 3 人互为陌生人（*Ramsey Theory*）。

*Proof.* 取任意一人 $p$，其余 5 人每人与 $p$ 要么是朋友要么是陌生人。

- **Case 1**（$p$ 至少有 3 个朋友）：取其中 3 个朋友 $q, r, s$。
  - **Case 1a**：$q,r,s$ 中某两人是朋友 $\Rightarrow$ 这两人与 $p$ 构成 3 个互友。
  - **Case 1b**：$q,r,s$ 互为陌生人 $\Rightarrow$ 3 个互陌生人已存在。
- **Case 2**（$p$ 至多有 2 个朋友，即至少有 3 个陌生人）：将 Case 1 中"朋友"与"陌生人"互换，完全对称，同理成立。

$\blacksquare$

> **Ramsey 数** $R(f,s)$：保证存在 $f$ 个互友或 $s$ 个互陌生人所需的最少人数。  
> 已知：$R(3,3) = 6$，$R(4,4) = 18$，$43 \leq R(5,5) \leq 48$（精确值未知）。

## 三、分情形证明，更通用的例子

取任意恒真式 $C_1 \lor C_2 \lor \cdots \lor C_k$，

模板： 命题 P(k) 为真

Proof: Proof by cases:

- case 1: 假设 $C_1$ 为真， 那么 P(1) 是 真 因为....
- case 2: 假设 $C_2$​ 为真， 那么 P(2) 是 真 因为....
- ....
- case k: 假设 $C_k$ 为真， 那么 P(k) 是 真 因为....

对每个情形 $C_i$ 分别证明 $P$，则 $P$​ 成立。这些 k 种情况是“穷尽的”（*exhaustive*）



著名的 多情形的例子： 

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> 经典案例 </strong> 四色定理（<i>*Four Color Theorem</i>） ：任意地图的区域可用 4 种颜色染色，使相邻区域颜色不同。</div>

历史（非常曲折）

• 1852：Guthrie 在观察英国地图时猜想四色足够（1853提出）
 • 1853：Kempe “证明”了该定理
 • 1864：Heawood 发现了错误 :(
 • 1880：Tait 再次“证明”该定理
 • 1891：Petersen 发现错误 :(
 • 1891：Schmidt 再次发现错误 :(
 • 1976：Appel 和 Haken “证明”该定理
  该证明包含 1834 种情况，由计算机逐一验证，总共约 400 页打印
  据说 Haken 的女儿 Blostein 还帮忙逐个手动检查
 • 1989：Appel 和 Haken 修复错误并出版完整证明（未经过传统同行评审） :)?
 • 1996：Robertson、Sanders、Seymour、Thomas 提出更简洁的计算机证明 :)（633 个情况）
 • 2005：Werner 和 Gonthier 在 Coq 中形式化证明 → 更可靠的计算机验证 :):)

数学家 Martin Gardner 曾在愚人节开玩笑说：某张地图需要 5 种颜色， 链接： https://mathworld.wolfram.com/McGregorMap.html

## 四、强归纳法

> **Theorem (Strong Induction).** 设 $P(n)$ 为关于 $n \in \mathbb{N}$ 的谓词。若
>
> 1. $P(0)$ 为真；
> 2. $\forall n \in \mathbb{N},\; [P(0) \land P(1) \land \cdots \land P(n)] \implies P(n+1)$；
>
> 则 $\forall n \in \mathbb{N},\; P(n)$。

**与普通归纳法的关系：**

- 普通归纳步骤假设 $P(n)$；强归纳步骤可假设 $P(0), P(1), \ldots, P(n)$ 全部成立。
- 二者**等价**——能用普通归纳证明的，强归纳也能证；反之亦然。
- 强归纳只是给了更强的出发点，实际上没有"多出"什么证明力。



## 五、强归纳应用示例

### 5.1 分块游戏

**规则：** 从 $n$ 块积木开始，每步将一堆分成两小堆 $m_1, m_2$，得 $m_1 \times m_2$ 分；直到所有堆均为 1 块。求总分。

**Theorem.** 任意策略，从 $n$ 块积木出发，总得分恰为

$$\frac{n(n-1)}{2} = \sum_{i=1}^{n-1} i$$

*Proof by strong induction on $n$.*

**Base case** ($n = 1$)：游戏立即结束，得 $0 = 1 \times 0 / 2$ 分。✓

**Inductive step：** 假设对所有 $1 \leq m \leq n$，命题成立（IH）。  
对 $n+1$ 块，第一步分为 $m_1, m_2$（$m_1 + m_2 = n+1$，$1 \leq m_1, m_2 \leq n$）。由 IH：

$$F(n+1) = m_1 m_2 + \frac{m_1(m_1-1)}{2} + \frac{m_2(m_2-1)}{2}$$

化简（利用 $m_1 + m_2 = n+1$）：

$$= \frac{2m_1 m_2 + m_1^2 - m_1 + m_2^2 - m_2}{2} = \frac{(m_1+m_2)^2 - (m_1+m_2)}{2} = \frac{(n+1)n}{2}$$

$\blacksquare$

### 5.2 循环赛排名

**问题：** $n$ 人循环赛，每场决出胜负（无平局），是否总存在"胜负排列"$p_1, p_2, \ldots, p_n$ 使得 $p_i$ 胜 $p_{i+1}$？

**Claim.** 任意循环赛结果，胜负排列（*beats ordering*）总存在。

*Proof by strong induction on $n$.*

**Base case** ($n = 0$)：空列表即为胜负排列。✓

**Inductive step：** 设对所有 $m \leq n$ 命题成立（IH）。  
对 $n+1$ 人，任取一人 $p'$：

- $W$：胜过 $p'$ 的人的集合（$|W| \leq n$）
- $L$：负于 $p'$ 的人的集合（$|L| \leq n$）

由 IH，$W$ 和 $L$ 内部各自存在胜负排列 $p_1,\ldots,p_{|W|}$ 和 $q_1,\ldots,q_{|L|}$。

构造排列：$p_1, \ldots, p_{|W|}, p', q_1, \ldots, q_{|L|}$。

- $p_{|W|}$ 胜 $p'$（$p_{|W|} \in W$）；
- $p'$ 胜 $q_1$（$q_1 \in L$）；
- 其余相邻关系由各子排列保证。

故此排列是合法的胜负排列。$\blacksquare$





## 六、 关键术语速查

| 英文                          | 中文                  |
| ----------------------------- | --------------------- |
| *Proof by cases / exhaustion* | 分情形证明 / 穷举证明 |
| *Tautology*                   | 恒真式                |
| *Ramsey Theory*               | Ramsey 理论           |
| *Four Color Theorem*          | 四色定理              |
| *Strong induction*            | 强归纳法              |
| *Induction hypothesis (IH)*   | 归纳假设              |
| *Beats ordering*              | 胜负排列              |
| *Round robin tournament*      | 循环赛                |