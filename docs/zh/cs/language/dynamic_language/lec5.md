---
title: 语法分析 III — First 集与建树（Parsing：Systematic Predictive Parsing）
course: 6.112 动态计算机语言工程
course_id: '6.112'
lecture: 5
kind: theory
tags: []
status: complete
---
# Lec 5 语法分析 III — First 集与建树（Parsing：Systematic Predictive Parsing）

> 本讲：系统化预测分析——derives-ε、First 集、左因子分解、构建语法树/AST

---

## 1. 回顾与今日目标

自顶向下解析有两个设计选择 + 一个实现关切：

::: definition 定义（自顶向下解析的三要素）
- **展开哪个非终结符**？→ 最左推导。

- **选哪条产生式**？→ 预测分析。

- **算法会终止吗**？→ 消除左递归。

昨天是快速概览，今天系统化处理预测分析的核心：如何严格地"看一个 token 就选对产生式"。
:::

---

## 2. 非终结符开头的产生式

若产生式右部以非终结符开头：`NT → NT1 α1`、`NT → NT2 α2`，须根据 `NT1`/`NT2` 能生成的**首终结符**来选；若它们能推出 `ε`，还要看其后的 `α`。这就需要两个谓词：**derives ε** 与 **First**。

### 2.1 谁能推出 ε

::: definition 定义（derives ε 规则）
- $NT \to \varepsilon$ ⟹ NT 推出 ε；

- $NT \to NT_1 \cdots NT_n$ 且所有 $NT_i$ 都推出 ε ⟹ NT 推出 ε。
:::

不动点算法：

```text
对所有 NT: derivesε[NT] = false
对所有 NT → ε: derivesε[NT] = true
while 上轮有变化:
    对所有 NT → NT1…NTn:
        if 所有 NTi 都 derivesε: derivesε[NT] = true
```

### 2.2 First 集

::: definition 定义（First(β) 与约束规则）
$T \in \text{First}(\beta)$ 当 T 能作为从 β 出发某推导的首符号。规则（T 终结符，NT 非终结符，S 任一符号）：

- $T \in \text{First}(T)$

- $\text{First}(S) \subseteq \text{First}(S\beta)$

- NT 推出 ε ⟹ $\text{First}(\beta) \subseteq \text{First}(NT\,\beta)$

- $NT \to S\beta$ ⟹ $\text{First}(S\beta) \subseteq \text{First}(NT)$
:::

这些规则生成一组**子集包含约束**，用约束传播迭代到不动点。

::: example 例题（求 First(Term')）
文法 `Term' → * Int Term' | / Int Term' | ε` 生成约束：

```text
First(* Int Term') ⊆ First(Term');  First(/ Int Term') ⊆ First(Term')
First(*) ⊆ First(* Int Term'),  *∈First(*)
First(/) ⊆ First(/ Int Term'),  /∈First(/)
```

从空集传播到不动点：First(*)={*}, First(/)={/} → First(* Int Term')={*}, First(/ Int Term')={/} → **First(Term') = {*, /}**。
:::

据此，递归下降中 `TermPrime()` 看到 `*` 走第一支、`/` 走第二支、否则走 `ε`。

---

## 3. 公共前缀 → 左因子分解（Left Factoring）

::: theorem 定理（左因子分解）
若多条产生式右部有相同前缀，前看一个 token 无法区分（如 `NT → if then` 与 `NT → if then else`，`if` 同属两者的 First）。**提取公共前缀**：

```text
NT  → if then NT'
NT' → else | ε
```

所有选择被统一到一条产生式，下一 token 是 if 时不再有冲突。
:::

### 3.1 至此走过的文法变换链

```text
原始(歧义):  Expr → Expr Op Expr | Int,  Op=(*|/)
消歧/优先级: Term → Term*Int | Term/Int | Int
消左递归:    Term → Int Term';  Term' → *Int Term' | /Int Term' | ε
```

---

## 4. 构建语法树 / 直接构建 AST

让每个过程**返回它所解析那段串对应的子树**，用异常使代码干净。

直接构建 **AST** 更微妙：`TermPrime` 构造一棵**缺最左子节点**的不完整树，返回 `(root, incomplete)`，由调用者回填左子节点——把右递归的具体树整形成左结合的抽象树。

```text
Term()
    if (token = Int n)
        leftmostInt = token; token = NextToken()
        (root, incomplete) = TermPrime()
        if (root == NULL) return leftmostInt
        incomplete.leftChild = leftmostInt        // 回填
        return root
    else throw SyntaxError

TermPrime()
    if (token = * or /)
        op = token; next = NextToken()
        if (next = Int n)
            token = NextToken(); (root, incomplete) = TermPrime()
            if (root == NULL) root = new ExprNode(NULL, op, next); return (root, root)
            else newChild = new ExprNode(NULL, op, next)
                 incomplete.leftChild = newChild; return (root, newChild)
        else throw SyntaxError
    else return (NULL, NULL)
```

如此可把 `2*3*4` 的具体树整成期望的左结合 AST。

---

## 5. 为何用手写解析器（vs. 生成器）

::: theorem 定理（手写 vs. 生成的权衡）
- **解析器生成器**：靠"改文法"驱动；但若生成器搞不定你的（复杂）文法，几乎无能为力，可能永远跑不通。

- **手写递归下降**：工作量更大，但几乎总能让它工作（出问题就多写代码）；单一语言系统，无生成代码集成问题。

若解析器开发时间相对整个项目很小、或语言确实复杂，优先手写递归下降。
:::

---

## 6. 本讲小结

- 处理"非终结符开头"的选择需 derives-ε（不动点）与 First 集（约束传播到不动点）。
- 公共前缀用左因子分解消除；文法变换链：歧义 → 消歧/优先级 → 消左递归 → 左因子分解。
- 构建 AST：过程返回子树，`TermPrime` 用"不完整树 + 回填左子"把右递归整成左结合。
- 工程上手写递归下降比生成器更可控、风险更低。
