---
title: 证明
course: 6.1200 计算机数学
course_id: '6.1200'
lecture: 1
kind: theory
tags: []
status: complete
---
# Lec 1 证明

## 一、证明

::: definition
什么是证明（*Proof*）
:::

一种确认事实的方法。

- 实验 / 观察（物理）
- 采样（统计）
- 法律（法官 / 陪审团）
- 民意（公众意见）
- 商业（权威人士）
- 内心确信
- “为什么不呢？”

在数学领域呢 ？

::: definition Definition 1
数学证明（*mathematical Proof*）是从一组公理（*axioms*）出发，通过逻辑推导链验证某命题为真的过程
:::

证明由三个核心要素构成：**命题**（要证什么）、**公理**（从哪里出发）、**逻辑推导**（怎么走）。

## 二、命题与谓词

::: definition Definition 2
命题（*proposition*）是一个非真即假的陈述。
:::

::: definition Definition 3
谓词（*predicate*）是真值依赖于变量的命题。
:::

**示例：**

- 命题 1： $2 + 3 = 5$（True）
- 命题 2： $2 + 3 = 6$（False）
- 命题 3：$\forall n \in \mathbb{N},; n^2 + n + 41 \text{ is prime}$（False，$n = 41$ 时 $= 43 \times 41$）

**非命题示例：** "Hello."、"Who are you?"、"This statement is false."（自指悖论，不处理）

**教训：** 即便前 40 个例子全部验证为真，也不能称为"证明"——这叫 **用例子证明（*Proof by Example*）**，数学中是**无效**的证明。

- 命题 4（哥德巴赫猜想，Goldbach’s Conjecture）：每一个大于 2 的偶数，都可以表示为两个素数之和。
  - 真还是假？未知！
  - 对于所有已经被检验过的偶数，这个命题都成立……目前普遍认为它是成立的（但没有证明）
  - 它看起来非常困难，在 90 年代中期甚至被《波士顿环球报》作为“重大未解之谜”刊登在头版之一

**命题分类：**

| 术语         | 含义                 |
| ------------ | -------------------- |
| *Theorem*    | 重要的已证真命题     |
| *Lemma*      | 辅助性已证命题       |
| *Corollary*  | 由定理直接推出的命题 |
| *Conjecture* | 尚未证明或证伪的猜想 |

------

## 三、 联接谓词

构造新的命题时，我们可以通过组合已有命题来实现。例如

基本运算符（$P$、$Q$ 为命题）：

| 符号           | 名称                           | 真值规则                   |
| -------------- | ------------------------------ | -------------------------- |
| $\neg P$       | *Negation*                     | $P$ 为假时为真             |
| $P \land Q$    | *Conjunction*（AND）           | 二者均真时为真             |
| $P \lor Q$     | *Disjunction*（OR，inclusive） | 至少一者为真时为真         |
| $P \implies Q$ | *Implication*                  | $P$ 真且 $Q$ 假时为假      |
| $P \iff Q$     | *Biconditional*（iff）         | 二者真值相同时为真（等价） |

然而在日常语言中……

::: example
婚礼菜单
服务员说：“晚餐有 chicken or pasta。”
这里的 “or” 表示一组可选答案集合：你可以选 “鸡肉” 或 “意大利面”，但不能选“两者”或“都不选”。因为他们已经提前收集了 RSVP（法语， Répondez s’il vous plaît 的缩写，意思是请回复）。
这不是我们定义的 or，而是“异或”（exclusive or，xor）。A ⊕ B 为真，当且仅当 A 和 B 中“恰好有一个”为真
:::

::: example
饮品选择
服务员说：“你可以喝 coffee or tea。”
这一次，你可以选择： “只咖啡” 或 “只茶” 或者“都不选”。但不能两者都要，因为你只有一个杯子，而且在正式场合不会把两种混在一起。
这也不是 or，而更像是“不是 and”。 “只要不是‘两者都要’，就都可以”
:::

::: example
咖啡配料
对于咖啡，服务员说：“cream or sugar。”
你可以选 “只奶” 、 “只加糖”、 选“两者” 或“都不选”。
:::

### 3.1 蕴含（*Implication*）

重要的布尔运算符：A implicates B，也记作 $A \implies B$ 或者 $A \rightarrow B$ 。

读作：“A 蕴含 B”，也就是“如果 A，那么 B”。

**蕴含的真值表：**

| $P$  | $Q$  | $P \implies Q$ |
| ---- | ---- | -------------- |
| T    | T    | T              |
| T    | F    | F              |
| F    | T    | T              |
| F    | F    | T              |

**注意：** $F \implies T$​ 这一种情况可能不太直观，所以我们用一个更具体的例子：

::: example
每周三我们穿粉色
也就是：“如果是周三，就穿粉色”，即“周三 ⇒ 穿粉色”。
在这个语境下，F implies T 是有意义的：在周四穿粉色并不会违反这个规则
:::

**蕴含的变体：**

| 名称                         | 形式                     | 与原命题是否等价 |
| ---------------------------- | ------------------------ | ---------------- |
| 原命题                       | $P \implies Q$           | —                |
| 逆否命题（*contrapositive*） | $\neg Q \implies \neg P$ | **等价**         |
| 逆命题（*converse*）         | $Q \implies P$           | **不一定**       |
| 否命题（*inverse*）          | $\neg P \implies \neg Q$ | **不一定**       |

::: example Example 5
你可能见过 &lt;3，表示“心形”或“我爱你”。也有人用 &lt;4 表示“我更爱你”。但后者其实是更弱的表达！

因为 x &lt; 3 蕴含 x &lt; 4，但反过来不成立，所以 x &lt; 3 是更强（信息量更大）的命题。

那是不是应该用 &lt;2 呢？
:::

::: example Example 6
笛卡尔：“我思故我在”。 翻译成逻辑，T = I think（我在思考）； A = I am（我存在），原命题是 T => A

互联网上的 meme 说， 我不思故我不在， 这句话表达的是 ¬T，同时也隐含 ¬T 蕴含 ¬A

它是“逆命题”，而逆命题等价于“逆否命题的逆形式”，但与原命题不等价。

如果我的鞋子存在但不会思考，笛卡尔会认为没问题，但这个 meme 就不成立。

那是不是应该改成：“我不在，因此我不思考”？
:::

## 四、 集合 (*Sets*)

::: definition Definition 4
集合（*set*）是对象的无序、无重复的集合体。
:::

**常用符号：**

| 符号                  | 含义                                 |
| --------------------- | ------------------------------------ |
| $\in$                 | 元素属于集合                         |
| $\subseteq$           | 子集                                 |
| $A \cap B$            | 交集                                 |
| $A \cup B$            | 并集                                 |
| $A \setminus B$       | 差集（$A$ 中不属于 $B$ 的元素）      |
| $\emptyset$           | 空集                                 |
| ${x \in S \mid P(x)}$ | 集合构造符（*set-builder notation*） |

**重要集合：**

- $\mathbb{N} = {0, 1, 2, \ldots}$（自然数，含 0）
- $\mathbb{Z} = {\ldots, -2, -1, 0, 1, 2, \ldots}$（整数）

**有序元组**（*ordered tuple*）：用括号表示，$(6, 1, 2, 0) \neq (2, 1, 6, 0)$，允许重复。

## 五、 公理 (*Axioms*)

::: definition Definition 5
公理（*axiom*）是被假设为真的命题，无需证明，必须**明确声明**。
:::

::: definition Definition 6
公理集是相容的（*consistent*）成立，当且仅当没有任何命题既可被证明为真又可被证明为假。
:::

::: definition Definition 7
公理集是完备的（*complete*）成立，当且仅当每个命题都可以被证明为真或为假。
:::

::: theorem Theorem 8
Gödel 不完备定理（*Gödel's Incompleteness Theorem*）： 不存在既完备又相容的公理集。
:::

::: theorem 推论 Corollary
若要相容性（必要条件），则必然存在真命题无法被证明
哥德巴赫猜想可能就是这样一个例子
:::

**平行公理的例子（三种等价有效的几何体系）：**

- 欧氏几何：过直线外一点恰好有一条平行线
- 球面几何：过直线外一点没有平行线
- 双曲几何：过直线外一点有无数条平行线

## 六、 关键术语速查

| 英文                          | 中文               |
| ----------------------------- | ------------------ |
| *Proposition*                 | 命题               |
| *Predicate*                   | 谓词               |
| *Axiom*                       | 公理               |
| *Theorem / Lemma / Corollary* | 定理 / 引理 / 推论 |
| *Conjecture*                  | 猜想               |
| *Contrapositive*              | 逆否命题           |
| *Converse*                    | 逆命题             |
| *Consistent / Complete*       | 相容 / 完备        |
| *Set-builder notation*        | 集合构造符         |
