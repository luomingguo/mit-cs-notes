# Lec 2 反证法和归纳法





## 一、逻辑推导规则

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 推导规则（<i>inference rule</i>）是将若干真命题组合推出另一真命题的规则。 </div>

> ⊢ 为 推导符号 / 证明符号（*turnstile*）

常用推导规则：

| 名称                                   | 形式                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| 肯定前件推理                           | $P \implies Q,; P ;\vdash; Q$                               |
| 否定后件推理（通过否定结果来否定前提） | $P \implies Q,; \neg Q ;\vdash; \neg P$                     |
| 传递性                                 | $(P \implies Q) \land (Q \implies R) ;\vdash; P \implies R$ |
| 反证规则                               | $(\neg P \implies \text{false}) ;\vdash; P$                 |

**证明书写规范：**

- 每步推导必须清晰，注明所用已有命题
- 避免恐吓式证明（"Obviously…"、"Clearly…"、”显然成立“）
- 基础数学事实可直接使用，无需逐条引公理



## 二、基本证明技术

### 2.1 存在性证明

证明 $\exists x \in S.; P(x)$：直接构造一个满足条件的具体值。

**Example.** $\exists n \in \mathbb{N},; n \geq 10 \text{ and isPrime}(n)$。

*Proof.* 取 $n = 17$，17 是质数且 $17 \geq 10$。$\blacksquare$

### 2.2 普遍性证明

如果我们要对一个集合中的所有元素证明某个结论，就不能只靠一个例子。

证明 $\forall x \in S.; P(x)$：引入**任意**元素 $x \in S$（不作任何额外假设），证明 $P(x)$。

**Example.** $\forall x \in \mathbb{R},; x^2 - 6x > -10$。

*Proof.* 设 $x$ 为任意实数，则 $x^2 - 6x + 9 = (x-3)^2 \geq 0$，故 $x^2 - 6x \geq -9 > -10$。$\blacksquare$

### 2.3 证明蕴含式：直接法

证明 $P \implies Q$：假设 $P$ 为真，推导出 $Q$。

**Example.** 若 $n$ 是 10 的倍数，则 $n$ 是 2 的倍数。

*Proof.* 设 $n = 10k$，则 $n = 2(5k)$，故 $n$ 是 2 的倍数。$\blacksquare$

### 2.4 证明蕴含式：逆否证明法

证明 $P \implies Q$ 等价于证明 $\neg Q \implies \neg P$。

**Example.** 若 $n^2$ 为偶数，则 $n$ 为偶数。

*Proof.* 证明逆否：若 $n$ 为奇数，则 $n^2$ 为奇数。设 $n = 2k+1$，则

$$n^2 = (2k+1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

为奇数。$\blacksquare$

------

## 三、反证法

证明 $P$：假设 $\neg P$，从 $\neg P$ 推出矛盾（*contradiction*）$\bot$，则 $P$ 成立。

本质上是推导规则 $(\neg P \implies \text{false}) \vdash P$ 的应用，又称间接证明（*indirect proof*）。



**Example.** $\sqrt{2} \notin \mathbb{Q}$。

*Proof by contradiction.* 假设 $\sqrt{2} \in \mathbb{Q}$，写成最简分数 $\sqrt{2} = a/b$（$\gcd(a,b)=1$）。

$$a^2 = 2b^2 \implies a^2 \text{ 为偶数} \implies a \text{ 为偶数}$$

设 $a = 2c$，代入得 $4c^2 = 2b^2 \implies b^2 = 2c^2 \implies b$ 为偶数。

$a, b$ 均为偶数，与 $\gcd(a,b) = 1$ 矛盾。$\Rightarrow\Leftarrow$ $\blacksquare$



## 四、证明大纲 

**思路：** 在真正动手推导之前，先根据命题的**逻辑形式**机械地拆解证明目标。

**Example.** 定理：$\forall n \in \mathbb{Z},; F(n) \iff B(n+1)$。

```
Proof Outline:
  取任意整数 n；需证 F(n) iff B(n+1)。
  
  方向一：假设 F(n) 为真，[TODO: 证明 B(n+1)]
  方向二：假设 B(n+1) 为真，[TODO: 证明 F(n)]
```

只要命题形式明确，无需了解 $F, B$ 的含义就能写出大纲。



## 五、数学归纳法

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> 公理 </strong> 数学归纳法（<i>Proof</i>） </div>

设 $P(n)$ 为关于 $n \in \mathbb{N}$ 的谓词。若

1. $P(0)$ 为真（*base case*）；
2. $\forall n \in \mathbb{N},; P(n) \implies P(n+1)$（*inductive step*）；

则 $\forall n \in \mathbb{N},; P(n)$。

归纳步骤中，"假设 $P(n)$ 为真"称为**归纳假设**（*induction hypothesis*, IH）。



### 5.1 标准示例



**Example.** $\forall n \in \mathbb{N},; 1 + 2 + \cdots + n = \dfrac{n(n+1)}{2}$。

*Proof by induction.*

**Base case** ($n = 0$)：LHS $= 0$，RHS $= 0$。✓

**Inductive step：** 设 $P(n)$ 成立（IH），则

$$\sum_{i=0}^{n+1} i = \underbrace{\sum_{i=0}^{n} i}_{= n(n+1)/2 \text{ by IH}} + (n+1) = \frac{n(n+1)}{2} + (n+1) = \frac{(n+1)(n+2)}{2}$$

即 $P(n+1)$ 成立。由归纳原理，$P(n)$ 对所有 $n \in \mathbb{N}$ 成立。$\blacksquare$​



### 5.2 强化归纳假设

有时原命题直接作为 IH 无法推进，需要**加强**（*strengthen*）。

> **Insight.** 更强的归纳假设 $\Rightarrow$ 归纳步骤的起点更强，反而更容易证明。

**Example.** $2^n \times 2^n$ 棋盘（去掉任意一格）可用 L 形三格骨牌（*L-tromino*）无重叠覆盖。

- 弱 IH $P(n)$："可覆盖 $2^n \times 2^n$ 棋盘，去掉中心附近某格"——归纳步骤无从推进。
- 强 IH $Q(n)$："可覆盖 $2^n \times 2^n$ 棋盘，去掉**任意**一格"。

*Proof of $Q(n)$ by induction.*

**Base case** ($n=0$)：只有 1 格，去掉后无需覆盖。✓

**Inductive step：** 设 $Q(n)$ 成立。对 $2^{n+1} \times 2^{n+1}$ 棋盘，设去掉格子 $(i,j)$ 在左上象限。在棋盘正中放一块 L 骨牌，覆盖其余三象限各一格；再对四个 $2^n \times 2^n$ 子棋盘分别应用 $Q(n)$，各去掉一格（左上去 $(i,j)$，其余去已被骨牌覆盖的格）。$\blacksquare$

**结论：** $Q(n) \implies P(n)$，故 $P(n)$ 对所有 $n$​ 成立。

<img src="/Users/mac/Library/Application Support/typora-user-images/image-20260618014623983.png" alt="image-20260618014623983" style="zoom:50%;" />



**关键在于找到合适的 IH，这是一个技巧性很强的过程**





## 六、关键术语速查

| 英文                        | 中文              |
| --------------------------- | ----------------- |
| *Inference rule*            | 推导规则          |
| *Modus Ponens / Tollens*    | 假言推论 / 拒取式 |
| *Proof by contradiction*    | 反证法            |
| *Indirect proof*            | 间接证明          |
| *Mathematical induction*    | 数学归纳法        |
| *Base case*                 | 基础步骤          |
| *Inductive step*            | 归纳步骤          |
| *Induction hypothesis (IH)* | 归纳假设          |
| *Strengthen the IH*         | 强化归纳假设      |
|                             |                   |