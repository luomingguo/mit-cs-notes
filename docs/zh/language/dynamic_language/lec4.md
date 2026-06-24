# L4：语法分析 II — 自顶向下解析（Top-Down Parsing）

> 本讲：递归下降解析器——把解析器写成一组相互递归的过程，结构与文法同构

---

## 1. 定位与起点

语言规范两层：词法（正则表达式）、语法（文法）。本讲实现**递归下降解析器 (recursive descent parser)**。起点：词法分析已产出 token 序列，每个 token 有类型（对应终结符）与值（如 `Int 549`、`if`、`AddOp +`）。

本讲文法（已分优先级、左递归形式）：

```
Start → Expr
Expr → Expr + Term | Expr - Term | Term
Term → Term * Int  | Term / Int  | Int
```

---

## 2. 基本方法：三个动作

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（自顶向下解析的三动作）</strong>
从 Start 出发构建<strong>最左推导 (leftmost derivation)</strong>：
<ol>
<li>最左符号是<strong>非终结符</strong> → 选一产生式应用（扩展）；</li>
<li>最左符号是<strong>终结符</strong> → 与输入匹配（消耗输入）；</li>
<li>所有终结符匹配成功 → <strong>接受</strong>。</li>
</ol>
关键难点：为每个非终结符<strong>选对产生式</strong>。解析器生成语法树的<strong>先序遍历</strong>（先父后子、兄弟从左到右）。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（解析 <code>2-2*2</code>，节选）</strong>
<pre>
Start → Expr → Expr - Term → Term - Term → Int - Term
匹配 2 → 2 - Term → 展开 Term → Term*Int → Int*Int
匹配 2、2 → 解析完成
</pre>
</div>

---

## 3. 策略问题：选哪条产生式？

经典**策略与机制分离**。机制是三动作，策略是选产生式。

### 3.1 回溯（Backtracking）

把它当搜索问题：每个选择点试下一候选，失败则回退换一个。三要素：搜索空间（语法树）、搜索算法（解析算法）、目标（输入的语法树）。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（回溯解析 <code>2-2*2</code>）</strong>
先试 <code>Expr → Expr + Term</code>，展到 <code>Int + Term</code>，匹配 <code>2</code> 后下一 token 是 <code>-</code>，<strong>无法匹配 +</strong> → 回溯；改用 <code>Expr → Expr - Term</code> 成功。
</div>

### 3.2 致命问题：左递归

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（左递归 + 自顶向下 = 死循环）</strong>
形如 <span>$\text{Term} \to \text{Term} * \text{Num}$</span> 的产生式，展开最左非终结符会无限展 <code>Term → Term → …</code> 而不消耗输入。对策：解析时<strong>改造文法消除左递归</strong>。
</div>

---

## 4. 消除左递归

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（左递归消除）</strong>
对 <span>$A \to A\alpha \mid \beta$</span>（<span>$\alpha,\beta$</span> 不以 A 开头），等价改写引入新非终结符 R：
$$A \to \beta R, \quad R \to \alpha R, \quad R \to \varepsilon$$
"向左长"的树变为"向右长"的树，语言不变。
</div>

实例：

```
原:  Term → Term*Int | Term/Int | Int
新:  Term → Int Term'
     Term' → * Int Term' | / Int Term' | ε
```

代价：文法不如原直观；好处：消除直接无限递归，并为预测分析铺路。

---

## 5. 预测分析（Predictive Parsing）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（预测分析）</strong>
回溯的替代：<strong>向前看 (lookahead)</strong> 输入流的下一个 token，据此直接决定用哪条产生式。本课用<strong>一个 token 前看</strong>。
</div>

消左递归后的文法：

```
Start → Expr
Expr  → Term Expr'         Term  → Int Term'
Expr' → + Term Expr' | - Term Expr' | ε
Term' → * Int Term' | / Int Term' | ε
```

**选择点**：当前在 `Term'`，看下一 token——`*` 用 `Term' → * Int Term'`，`/` 用 `Term' → / Int Term'`，否则用 `Term' → ε`。

---

## 6. 递归下降解析器（手写代码）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（递归下降的构造规则）</strong>
每个非终结符 NT 对应一个过程；过程检查当前输入符号 T，若 <span>$T \in \text{First}(\beta_k)$</span> 则应用第 k 条产生式、消耗其终结符、对其非终结符递归调用。当前符号存于全局 <code>token</code>；过程返回成功/失败（或所解析的子树）。
</div>

```text
Boolean Term()
    if (token = Int n) token = NextToken(); return TermPrime()
    else return false
Boolean TermPrime()
    if (token = *) token = NextToken();
        if (token = Int n) token = NextToken(); return TermPrime()
        else return false
    else if (token = /) ...   // 同上
    else return true          // Term' → ε
```

程序结构与文法同构：每非终结符一函数，每条产生式一分支，每个非终结符出现一次递归调用。（First 集的系统计算见 L5。）

---

## 7. 本讲小结

- 自顶向下 = 构最左推导，三动作：扩展非终结符 / 匹配终结符 / 接受。
- 朴素回溯遇左递归死循环 → 先消左递归（引入 `R → αR | ε`）。
- 预测分析用一个 token 前看免回溯；递归下降 = 预测分析 + 手写，每非终结符一过程。
- 下一讲：系统计算 First 集与 derives-ε，处理公共前缀，构建语法树。
