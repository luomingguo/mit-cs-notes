---
title: 自顶向下分析（Top-Down Parsing）
course: 6.1100 计算机语言工程
course_id: '6.1100'
lecture: 3
kind: theory
tags: []
status: complete
---
# Lec 03 自顶向下分析（Top-Down Parsing）

> 配套复习课：R2 递归下降分析器 Demo（github.com/6110-sp25/recitation2）——其核心代码已整合进本讲第 8 节
> 参考：Cooper et al., Ch.3 §3.3 Top-Down Parsing

---

## 1. 定位（Orientation）

语言规范分两层：词法（正则表达式）、语法（文法）。本讲实现语法层的**递归下降分析器 (recursive descent parser)**：

> 把分析器写成**一组相互递归的过程 (mutually recursive procedures)**，程序结构与文法结构一一对应。

**起点假设**：词法分析已产出一串 token，每个 token 有类型（对应终结符）和值（读入内容）。例：`Int 549`（整数 token，值 549）、`if`（关键字，无值）、`AddOp +`（加法运算符，值 +）。

---

## 2. 基本方法（Basic Approach）

::: definition 定义（自顶向下分析的三个动作）
从起始符出发，构建一个**最左推导 (leftmost derivation)**：

- 若最左符号是**非终结符**：选一条产生式并应用（扩展，apply production）。

- 若最左符号是**终结符**：与输入匹配（match，消耗输入）。

- 所有终结符都匹配成功 ⇒ **接受 (accept)** 这次解析。

关键难点：为每个非终结符**选对产生式**。
:::

> 分析器实际上生成语法树的**先序遍历 (preorder traversal)**：先访问父节点再访问子节点，兄弟从左到右。

解析用文法示例：

```text
Start → Expr
Expr  → Expr + Term       Term → Term * Int
Expr  → Expr - Term       Term → Term / Int
Expr  → Term              Term → Int
```

::: example
**例题（无回溯地解析 `2-2*2`，节选关键步）**

```text
句型                 已用产生式
Start
Expr                 Start → Expr
Expr - Term          Expr  → Expr - Term
Term - Term          Expr  → Term
Int - Term           Term  → Int
2   - Term           匹配输入 2 ✓
... 继续展开右侧 Term → Term * Int → Int * Int → 匹配 2 * 2 ✓
2 - 2*2              解析完成！
```
:::

---

## 3. 策略问题：如何选产生式？

这是经典的**策略与机制分离 (separation of policy and mechanism)**。机制是上面三个动作，策略是"选哪条产生式"。

### 3.1 方案一：回溯（Backtracking）

把它当**搜索问题**：每个选择点尝试下一个候选；若当前路径明显失败，回退到上一个选择点换一个。搜索三要素：

- **搜索空间**：所有语法树
- **搜索算法**：解析算法
- **目标**：输入程序的语法树

理想性质：若目标存在则（尽快）找到；若不存在则搜索终止。

::: example
**例题（回溯解析 `2-2*2` 的失败-回退）**
先试 `Expr → Expr + Term`，一路展开到 `Int + Term`，匹配 `2` 后下一 token 是 `-`，**无法匹配 `+`** ⇒ 回溯；改用 `Expr → Expr - Term`，匹配 `2 - ...` 成功，继续。
:::

### 3.2 致命问题：左递归（Left Recursion）

::: theorem 定理（左递归 + 自顶向下 = 死循环）
若产生式形如 $\text{Term} \to \text{Term} * \text{Num}$，自顶向下展开最左非终结符时会无限展开 `Term → Term → Term …` 而永不消耗输入，导致**无限递归**。
:::

对策：解析时**改造文法以消除左递归**。

---

## 4. 消除左递归（Eliminating Left Recursion）

::: theorem 定理（左递归消除的标准变换）
对形如
$$A \to A\,\alpha \quad\mid\quad A \to \beta$$
（$\alpha,\beta$ 不以 $A$ 开头）的产生式，等价改写为引入新非终结符 $R$：
$$A \to \beta R, \qquad R \to \alpha R, \qquad R \to \varepsilon$$
原来"向左长"的树变为"向右长"的树，语言不变但消除了直接左递归。
:::

实例：

```text
原文法片段                  新文法片段
Term → Term * Int           Term  → Int Term'
Term → Term / Int           Term' → * Int Term'
Term → Int                  Term' → / Int Term'
                            Term' → ε
```

> 代价：改变搜索空间的探索方式、消除直接无限递归，但文法**不如原来直观**；好处是为**预测分析**铺路。

---

## 5. 预测分析（Predictive Parsing）

::: definition 定义（预测分析）
回溯的替代方案：**向前看 (lookahead)** 输入流中接下来的 token，据此直接决定应用哪条产生式。本课用**一个 token 的前看 (one token of lookahead)**。编程语言可被设计得便于这样解析。
:::

预测分析所用（已消左递归的）文法：

```text
Start → Expr
Expr  → Term Expr'          Term  → Int Term'
Expr' → + Term Expr'        Term' → * Int Term'
Expr' → - Term Expr'        Term' → / Int Term'
Expr' → ε                   Term' → ε
```

**选择点示例**：当前在 `Term'`，有三条候选。看下一 token：是 `*` 用 `Term' → * Int Term'`；是 `/` 用 `Term' → / Int Term'`；否则用 `Term' → ε`。

---

## 6. 两个文法改造前提：左因子分解 与 ε 处理

### 6.1 公共前缀 → 左因子分解（Left Factoring）

若多条产生式右部有相同前缀，前看一个 token 无法区分：

```text
NT → if then
NT → if then else
```

`if ∈ First(if then)` 且 `if ∈ First(if then else)`，冲突。**提取公共前缀**：

```text
NT  → if then NT'
NT' → else
NT' → ε
```

下一 token 是 `if` 时不再有歧义。

### 6.2 非终结符开头与 ε 推导

若产生式右部以非终结符开头（`NT → NT1 α1` / `NT → NT2 α2`），需根据 `NT1/NT2` 能产生的首终结符来选；若它们能推出 `ε`，还要看后面的 `α`。这就需要计算两个谓词：**derives ε** 与 **First**。

---

## 7. 两个核心不动点算法（Fixed-Point Algorithms）

### 7.1 谁能推出 ε（Derives ε）

::: definition 定义（NT 推出 ε 的规则）
- $NT \to \varepsilon$ ⇒ $NT$ 推出 $\varepsilon$。

- $NT \to NT_1 \cdots NT_n$ 且对所有 $1 \le i \le n$，$NT_i$ 都推出 $\varepsilon$ ⇒ $NT$ 推出 $\varepsilon$。
:::

不动点算法：

```text
对所有非终结符 NT：置 "NT derives ε" = false
对所有形如 NT → ε 的产生式：置 "NT derives ε" = true
while (上一轮有某个 "NT derives ε" 改变):
    对所有形如 NT → NT1 … NTn 的产生式:
        if (所有 1≤i≤n 的 NTi 都 derives ε):
            置 "NT derives ε" = true
```

### 7.2 First 集合

::: definition 定义（First(β) 与其约束规则）
$T \in \text{First}(\beta)$ 当且仅当 $T$ 能作为从 $\beta$ 出发某推导的首符号。规则（$T$ 终结符，$NT$ 非终结符，$S$ 任一符号，$\beta$ 符号序列）：

- $T \in \text{First}(T)$

- $\text{First}(S) \subseteq \text{First}(S\beta)$

- $NT$ 推出 $\varepsilon$ ⇒ $\text{First}(\beta) \subseteq \text{First}(NT\,\beta)$

- $NT \to S\beta$ ⇒ $\text{First}(S\beta) \subseteq \text{First}(NT)$
:::

这些规则生成一组**子集包含约束**，用约束传播 (constraint propagation) 迭代到不动点求解。

::: example
**例题（求 `First(Term')`）**
文法 `Term' → * Int Term' | / Int Term' | ε` 生成约束：

```text
First(* Int Term') ⊆ First(Term')
First(/ Int Term') ⊆ First(Term')
First(*) ⊆ First(* Int Term')，  * ∈ First(*)
First(/) ⊆ First(/ Int Term')，  / ∈ First(/)
```

从空集开始传播到不动点：`First(*)={*}, First(/)={/}` → `First(* Int Term')={*}, First(/ Int Term')={/}` → **First(Term') = {*, /}**。
:::

---

## 8. 递归下降分析器 = 预测分析 + 手写代码（R2 Demo 核心）

::: definition 定义（递归下降分析器的构造规则）
- 每个非终结符 $NT$ 对应**一个过程**。

- 对产生式 $NT \to \beta_1, \dots, NT \to \beta_n$，过程检查当前输入符号 $T$ 决定用哪条：若 $T \in \text{First}(\beta_k)$ 则应用第 $k$ 条。

- 应用时：消耗 $\beta_k$ 中的终结符（检查匹配），对其中的非终结符**递归调用**对应过程。

- 当前输入符号存于全局变量 `token`；过程返回 `true`（成功）/`false`（失败）。
:::

对文法 `Term → Int Term'`，`Term' → * Int Term' | / Int Term' | ε` 的手写代码：

```text
Boolean Term()
    if (token = Int n) token = NextToken(); return TermPrime()
    else return false

Boolean TermPrime()
    if (token = *)
        token = NextToken()
        if (token = Int n) token = NextToken(); return TermPrime()
        else return false
    else if (token = /)
        token = NextToken()
        if (token = Int n) token = NextToken(); return TermPrime()
        else return false
    else return true          // 对应 Term' → ε
```

> 程序结构与文法结构同构：每个非终结符一个函数，每条产生式一个分支，每个非终结符出现一次递归调用。

---

## 9. 构建语法树 / 直接构建 AST

让每个过程**返回它所解析那段串对应的子树**，用异常 (exceptions) 让代码结构更干净。

直接构建 **AST** 更微妙：`TermPrime` 构造的是一棵**缺最左子节点 (missing leftmost child)** 的不完整树，返回 `(root, incomplete)`，由调用者回填左子节点。

```text
Term()
    if (token = Int n)
        leftmostInt = token; token = NextToken()
        (root, incomplete) = TermPrime()
        if (root == NULL) return leftmostInt
        incomplete.leftChild = leftmostInt    // 回填
        return root
    else throw SyntaxError

TermPrime()
    if (token = * or /)
        op = token; next = NextToken()
        if (next = Int n)
            token = NextToken()
            (root, incomplete) = TermPrime()
            if (root == NULL)
                root = new ExprNode(NULL, op, next); return (root, root)
            else
                newChild = new ExprNode(NULL, op, next)
                incomplete.leftChild = newChild
                return (root, newChild)
        else throw SyntaxError
    else return (NULL, NULL)
```

这样可把右递归的具体结构直接整形成左结合的 AST（如把 `2*3*4` 的具体树整成期望的左结合抽象树）。

---

## 10. 为何用手写分析器？（vs. 解析器生成器）

::: theorem 定理（手写 vs. 生成的权衡）
- **解析器生成器 (parser generator)**：靠"改文法"驱动；但若生成器搞不定你的文法，你几乎无能为力，复杂文法易超出其"舒适区"，可能**永远跑不通**。

- **手写递归下降**：工作量可能更大，但**几乎总能让它工作**——出问题就多写代码；单一语言系统，无生成代码的集成问题。

结论：若解析器开发时间相对整个项目很小，或语言确实复杂，**优先选手写递归下降**。
:::

---

## 11. 本讲小结

- 自顶向下 = 构最左推导，三动作：扩展非终结符 / 匹配终结符 / 接受。
- 朴素回溯遇左递归会死循环 ⇒ 先消左递归（引入 `R → αR | ε`）。
- 预测分析用一个 token 前看免回溯，前提是**左因子分解** + 计算 **derives ε** 与 **First**（均用不动点/约束传播）。
- 递归下降分析器 = 预测分析 + 手写：每非终结符一过程，结构与文法同构；可在过程返回值上直接拼 AST。
- 工程上手写递归下降比解析器生成器更可控、风险更低。
