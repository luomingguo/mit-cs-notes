# Lec 4 状态机

今天我们将介绍一种名为状态机（*State Machine*）的全新抽象概念，它可以帮助我们对算法的工作原理进行建模。我们将展示如何使用归纳法来证明状态机的性质。但首先，让我们来看一个例子



## 一、引例：8 拼图问题

初始状态：

```
1 2 3
4 5 6
8 7 *
```

目标状态：

```
1 2 3
4 5 6
7 8 *
```

**问题：** 仅通过将相邻方块滑入空格，能否从初始到达目标？  
**答案：** 不能。我们将用**不变量原理**证明这一点。





## 二、状态机 (*State Machine*)

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
  <strong>Definition</strong>
  状态机（<i>state machine</i>）：
  <ul>
    <li><b>状态集合</b>（states）</li>
    <li><b>初始状态</b>（initial state）</li>
    <li><b>状态转移规则</b>（transitions）</li>
  </ul>
</div>

- **确定性**（*deterministic*）：每个状态至多一种转移。
- **非确定性**（*non-deterministic*）：某些状态有多种可能转移。

**执行**（*execution*）：从初始状态出发，按转移规则生成的状态序列。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 什么是可达性（<i>reachable</i>）若存在某条执行路径能到达状态 s，则称 s 是可达的 </div>

**8 拼图的状态机模型：**

- 状态：棋盘的所有排列（共 $9!$ 种）
- 初始状态：$12345687*$
- 转移：将一个方块滑入空格



## 三、可达性与不变量

有一种用于证明“状态不可达性”的强大技巧，称为“不变量原理（*Invariant Principle*）”。它本质上是数学归纳法在状态机上的一种应用。从抽象角度看，这个思想非常简单。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 保持谓词（<i>preserved predicate</i>）是一个定义在状态上的谓词P(⋅)， 满足在某个状态 s 中若P(s) 为真， 且 s -> t 是一次合法转移， 则P(t)也为真 </div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
  <strong> Definition </strong> 不变量（<i>invariant</i>）：对所有可达状态均为真的性质
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;">
  <strong> Theorem </strong> 不变量原理（<i>invariant</i>）
</div>

若 $P(\cdot)$ 对初始状态为真，且 $P(\cdot)$ 是保持谓词，则 $P(\cdot)$ 是不变量。

*Proof.* 设 $Q(n)$：执行序列 $s_0, s_1, \ldots, s_n$ 中 $P(s_i)$ 对所有 $i$ 成立。用归纳法：

- **Base case**：$P(s_0)$ 由假设成立。
- **Inductive step**：$s_0,\ldots,s_n$ 满足 $Q(n)$，故 $P(s_n)$ 成立；由保持性，$P(s_{n+1})$ 也成立。$\blacksquare$



<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Corollary推论 </strong> ** 若 P 是不变量且 P(s) 为假，则 s 不可达 </div>

证明：假设状态 s 是可达的，那么根据不变式定义， P(s) 必须为真。 但我们已知 P(s) 为假，矛盾，因此s不可达$\blacksquare$

## 四、8拼图的不可解性证明

### 4.1 计数逆序对

**Definition.** 序列 $a_1, a_2, \ldots, a_n$ 中，**逆序对**是满足 $i < j$ 且 $a_i > a_j$ 的下标对 $(i,j)$。逆序对的数目称为**逆序对数目**（*number of inversions*）。

例如：

- 序列 1 2 3 4：没有逆序对
- 序列 1 3 2 4：有 1 个逆序对（2,3）
- 序列 4 1 3 2：有 4 个逆序对

现在考虑 8-puzzle 的棋盘配置。我们可以把棋盘映射为一个 1 到 8 的数字序列， 将棋盘排列删去 `*` 后得到序列。 那么现在问题是：

> 当我们在滑动拼图时，这个序列中的逆序对数量会发生什么变化？

- **水平移动**：不改变序列，逆序对数目不变。
- **垂直移动**：`*` 跳过同行的两格，序列中某三个相邻元素 $a_i, a_{i+1}, a_{i+2}$ 循环移位为 $a_{i+2}, a_i, a_{i+1}$。该操作恰好改变两对下标的逆序状态，逆序对数目变化量为偶数（$\Delta \in \{-2, 0, +2\}$）。

**关键结论：** 任何合法移动不改变逆序对数目的**奇偶性**。

### 4.2 应用不变量

定义谓词 $P(s)$：状态 $s$ 对应序列的逆序对数目为**奇数**。

- $P$ 是保持谓词（上述分析）。
- 初始状态 $12345687$ 的逆序对数目为 1（奇数），故 $P(s_0)$ 为真。
- 由不变量原理，$P$ 是不变量：所有可达状态的逆序对数目均为奇数。

目标状态 $12345678$ 的逆序对数目为 0（偶数），$P$ 为假，**故目标状态不可达**。$\blacksquare$



## 五、终止性

到目前为止，我们已经看到如何使用状态机和不变式来讨论“可达性”。

状态机的另一个重要性质是：**终止性（*termination*）**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 状态机的终态（<i>final state</i>）是指没有任何可进行的转移的状态。</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 状态机是终止（<i>terminates</i>）的，是指不存在无限长的执行序列，即无论如何选择转移，最终必然到达终态。</div>

直观来说，这意味着：

> 如果你不断运行这个状态机，无论每一步如何选择转移，最终都会到达一个终态。

### 5.1 导出变量法 / 势函数法

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Definition </strong> 导出变量法（<i>derived variable</i>）又称势函数法（<i>potential function</i>） 是将状态映射到实数的函数 f </div>

- $f$ **严格递减**（*strictly decreasing*）：每次转移 $s \to t$ 均有 $f(t) < f(s)$。

- $f$ **弱递减**（*weakly decreasing*）：每次转移 $f(t) \leq f(s)$。



<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Theorem </strong> 若存在取值为自然数的严格递减 导出变量，则状态机是终止的 </div>

*Proof idea.* 若不终止则存在无限执行，对应自然数的无限严格递减序列，矛盾，因为自然数中不存在无限严格递减序列。$\blacksquare$

### 5.2 应用：简单排序算法的终止性

**算法（Simple Sort）：** 对序列 $a_1, \ldots, a_n$，反复找相邻逆序对 $(a_i, a_{i+1})$（$a_i > a_{i+1}$）并交换，直到不存在逆序对为止。

**状态机模型：**

- 状态：输入序列的所有排列（*permutations*）
- 初始状态：给定的序列
- 转移：根据算法描述的相邻交换
- 终态：完全有序的序列

**Claim.** 所有终态均已排好序。（习题：用归纳法证明）。终态恰好是：

> 对所有 i，都满足 $a_i \le a_{i+1}$

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Theorem </strong> Simple Sort 必然终止 </div>

*Proof.* 取势函数 $f(s) =$ 当前序列的逆序对数目（自然数值）。  
每次交换一对相邻逆序对 $(a_i, a_{i+1})$，该对从逆序变为顺序，逆序对数目恰好减少 1（其余对不受影响）。故 $f$ 严格递减，由定理知算法终止。$\blacksquare$

**额外结论：** 算法步数恰好等于初始序列的逆序对数目，至多为 $\dfrac{n(n-1)}{2}$。



## 7. 关键术语速查

| 英文                                    | 中文              |
| --------------------------------------- | ----------------- |
| *State machine*                         | 状态机            |
| *Deterministic / Non-deterministic*     | 确定性 / 非确定性 |
| *Execution*                             | 执行（序列）      |
| *Reachable state*                       | 可达状态          |
| *Preserved predicate*                   | 保持谓词          |
| *Invariant*                             | 不变量            |
| *Invariant Principle*                   | 不变量原理        |
| *Inversion*                             | 逆序对            |
| *Final state*                           | 终态              |
| *Termination*                           | 终止性            |
| *Derived variable / Potential function* | 导出变量 / 势函数 |
| *Strictly / Weakly decreasing*          | 严格 / 弱递减     |

|      |      |
| ---- | ---- |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |
|      |      |