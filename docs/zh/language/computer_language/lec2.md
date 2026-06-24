# Lecture 02：用正则表达式与上下文无关文法规范语言

> 配套复习课：R1–R2（前端阶段）
> 参考：Cooper et al., Ch.2 Scanners；Ch.3 §3.1–3.2 Parsers

---

## 1. 语言定义问题（Language Definition Problem）

如何**精确地**定义一门语言？采用**分层结构**：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语言的分层结构）</strong>
<ul>
<li><strong>字母表 (alphabet)</strong>：语言中的字母集合 <span>$\Sigma$</span>。</li>
<li><strong>词法结构 (lexical structure)</strong>：识别语言中的"词 (words)"，每个词是字母的序列。</li>
<li><strong>语法结构 (syntactic structure)</strong>：识别语言中的"句子 (sentences)"，每个句子是词的序列。</li>
<li><strong>语义 (semantics)</strong>：程序的含义——对每个输入应产生什么结果。</li>
</ul>
本讲只关注词法与语法两层。
</div>

### 1.1 两种对偶视角

形式语言的规范有两种**对偶 (dual)** 思路，二者间可自动互转，这是 CS 的一大理论胜利：

- **生成式 (generative)**：文法 (*grammar*) 或正则表达式 (*regular expression*)，告诉你如何**生成**语言中所有串。
- **识别式 (recognition)**：自动机 (*automaton*)，告诉你如何**判定**某个串是否属于语言。

> 标准工程做法：**用正则表达式/文法来定义**语言（人友好），再**自动翻译成自动机来实现**（机器友好）。

---

## 2. 词法层：正则表达式（Regular Expressions）

### 2.1 构造规则

给定字母表 <span>$\Sigma$</span>，正则表达式由以下构造归纳生成：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（正则表达式）</strong>
<ul>
<li><span>$\varepsilon$</span>：空串（empty string）</li>
<li>来自 <span>$\Sigma$</span> 的任意字母</li>
<li><span>$r_1 r_2$</span>：序列（sequence）——<span>$r_1$</span> 后接 <span>$r_2$</span></li>
<li><span>$r_1 \mid r_2$</span>：选择（choice）——<span>$r_1$</span> 或 <span>$r_2$</span></li>
<li><span>$r^*$</span>：克莱尼星（Kleene star）——迭代序列与选择，即 <span>$\varepsilon \mid r \mid rr \mid \cdots$</span></li>
<li>括号用于分组/优先级</li>
</ul>
</div>

### 2.2 生成语义：重写规则

把正则表达式不断重写，直到只剩一串字母，得到的串即被该表达式生成。重写的一般规则：

$$
r_1 \mid r_2 \to r_1, \quad r_1 \mid r_2 \to r_2, \quad r^* \to r\,r^*, \quad r^* \to \varepsilon
$$

重写类似"等式推理"，但**不同的规则应用次序产生不同结果**——这是生成过程的非确定性 (*nondeterminism*)。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（用 <span>$(0\mid1)^*.(0\mid1)^*$</span> 生成 <code>1.0</code>）</strong>
<pre>
(0|1)*.(0|1)*
→ (0|1)(0|1)*.(0|1)*      [r* → r r*]
→ 1(0|1)*.(0|1)*          [选择取 1]
→ 1.(0|1)*                [r* → ε]
→ 1.(0|1)(0|1)*           [r* → r r*]
→ 1.(0|1)                 [r* → ε]
→ 1.0                     [选择取 0]
</pre>
不同选择会生成不同串（如 <code>0.1</code>），所有可生成串的集合即为该正则表达式的<strong>语言 (language)</strong>，可数无限。语言中的一个串常称为一个 <strong>token</strong>。
</div>

### 2.3 常用速记与示例

- <span>$[0\text{-}9] = (0\mid1\mid\cdots\mid9)$</span>，<span>$[a\text{-}z] = (a\mid b\mid\cdots\mid z)$</span>
- <span>$(00)^*$</span>：偶数长度的全 0 串
- <span>$1^*(01^*01^*)^*$</span>：含偶数个 0 的串
- <span>$(a\mid b\mid c)(a\mid b\mid c\mid0\mid1\mid2)^*$</span>：字母数字标识符

---

## 3. 识别层：有限状态自动机（Finite-State Automata）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（有限状态自动机，形式化）</strong>
一个 FSA 是五元组 <span>$(S, A, F, s_0, s_F)$</span>：有限状态集 <span>$S$</span>、有限字母表 <span>$A$</span>、转移函数 <span>$F: S \times A \to S$</span>、起始状态 <span>$s_0$</span>、接受状态集 <span>$s_F$</span>。自动机的<strong>语言</strong>是它接受的所有串的集合。
</div>

**运行机制**：从起始状态与输入首字母开始，每步用当前字母匹配一条同标签的转移；直到串结束或匹配失败。若结束时停在接受状态，则**接受**该串。

### 3.1 DFA vs. NFA

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（DFA 与 NFA）</strong>
<ul>
<li><strong>DFA（确定型）</strong>：每个状态对每个字母<strong>至多一条</strong>转移；无 <span>$\varepsilon$</span> 转移。</li>
<li><strong>NFA（非确定型）</strong>：放宽两条限制——同一标签可有多条转移，且允许 <span>$\varepsilon$</span>（空串）转移。</li>
</ul>
NFA 的接受规则：只要<strong>存在一条</strong>执行路径接受，即接受（天使式非确定性 angelic nondeterminism——总能做出导向接受的选择）。
</div>

---

## 4. 从正则表达式到自动机（结构归纳构造）

用**结构归纳 (structural induction)** 把任意正则表达式转成 NFA：假设每个子表达式都能转成"单起始 + 单接受"的自动机，再给出每个构造子的拼装方式（均保持单起始 + 单接受）。

- **基本**：<span>$\varepsilon$</span> 用一条 <span>$\varepsilon$</span> 边；字母 <span>$a$</span> 用一条 <span>$a$</span> 边。
- **序列 <span>$r_1 r_2$</span>**：把 <span>$r_1$</span> 的旧接受态用 <span>$\varepsilon$</span> 连到 <span>$r_2$</span> 的旧起始态。
- **选择 <span>$r_1 \mid r_2$</span>**：新起始态用 <span>$\varepsilon$</span> 分别连到两支起始态，两支接受态再用 <span>$\varepsilon$</span> 汇入新接受态。
- **克莱尼星 <span>$r^*$</span>**：新起始 <span>$\to_\varepsilon$</span> 旧起始；旧接受 <span>$\to_\varepsilon$</span> 旧起始（循环）与新接受；新起始 <span>$\to_\varepsilon$</span> 新接受（跳过，对应零次）。

> 该构造产物总是 **NFA**（含 <span>$\varepsilon$</span> 边）。

### 4.1 NFA → DFA（子集构造，Subset Construction）

为简化识别算法，需转为 DFA：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（子集构造算法）</strong>
<ul>
<li>DFA 的每个状态对应 NFA 状态的一个<strong>子集</strong>。</li>
<li>DFA 起始态 = 从 NFA 起始态出发，沿 <span>$\varepsilon$</span> 边可达的状态集合（<span>$\varepsilon$</span>-closure）。</li>
<li>DFA 某状态为接受态 当且仅当 其集合中含有任一 NFA 接受态。</li>
<li>对 DFA 状态 <span>$D$</span> 与字母 <span>$a$</span>：取 <span>$D$</span> 对应的 NFA 状态集 <span>$N$</span>，计算所有 <span>$n\in N$</span> 读 <span>$a$</span> 后（含后续 <span>$\varepsilon$</span> 可达）可能到达的状态并集 <span>$S$</span>；若 <span>$S$</span> 非空，则 <span>$D \xrightarrow{a}$</span> 对应 <span>$S$</span> 的 DFA 状态。</li>
</ul>
</div>

> **代价**：DFA 可能比 NFA **指数级**变大（最坏 <span>$2^{|S|}$</span> 个状态）。

---

## 5. 编程语言的词法类别（Lexical Categories）

每门语言通常有若干词类，每类用一个正则表达式定义，扫描器为每个关键字/类别建一个词法类别：

```
IfKeyword    = if
WhileKeyword = while
Operator     = + | - | * | /
Integer      = [0-9][0-9]*
Float        = [0-9]*.[0-9]*
Identifier   = [a-z]([a-z]|[0-9])*
```

这些 token 类别将作为下一层（语法）的**终结符**。

---

## 6. 语法层：为何需要上下文无关文法

正则语言不足以描述编程语言语法——因为存在**嵌套结构 (nested syntax)**：

- `(a+(b-c))*(d-(x-(y-z)))`
- `if (x<y) if (y<z) a=5 else a=6 else a=7`

> 正则语言**缺少建模嵌套所需的"状态"**——典型反例：带括号的表达式语言**没有**对应的正则表达式。

### 6.1 上下文无关文法（Context-Free Grammar, CFG）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（CFG）</strong>
CFG 是四元组 <span>$(T, NT, S, P)$</span>：终结符集 <span>$T$</span>（每个由正则表达式定义）、非终结符集 <span>$NT$</span>、起始非终结符 <span>$S$</span>、产生式集 <span>$P: NT \to (T \mid NT)^*$</span>——左部是单个非终结符，右部是终结符与非终结符的任意序列。
</div>

示例文法：

```
Op    = + | - | * | /        Start → Expr
Int   = [0-9][0-9]*          Expr  → Expr Op Expr
Open  = <                    Expr  → Int
Close = >                    Expr  → Open Expr Close
```

### 6.2 推导与语法树（Derivation & Parse Tree）

**生成游戏 (Production Game)**：从 `Start` 出发，反复选一个非终结符、选一条以它为左部的产生式、用右部替换它，直到无非终结符。不同选择产生不同串。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（推导 <code>&lt;2-1&gt;+1</code>）</strong>
<pre>
Start
→ Expr
→ Expr Op Expr
→ Open Expr Close Op Expr
→ Open Expr Op Expr Close Op Expr
→ Open Int Op Expr Close Op Expr
→ Open Int Op Expr Close Op Int
→ Open Int Op Int Close Op Int
→ < 2 - 1 > + 1
</pre>
</div>

**语法树 (parse tree)**：内部节点是非终结符，叶子是终结符，边从产生式左部连向右部各符号。它**捕获了推导结构**。

---

## 7. 文法歧义与消除（Ambiguity）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（歧义文法）</strong>
若某个串存在<strong>多个推导（即多棵语法树）</strong>，则文法是<strong>歧义的 (ambiguous)</strong>。由于语法树通常反映程序语义，文法歧义往往意味着语义歧义——这是不可取的。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（<code>2-1+1</code> 的两棵树）</strong>
对 <code>Expr → Expr Op Expr</code>，<code>2-1+1</code> 可解析为 <code>&lt;2-1&gt;+1</code>（左结合）或 <code>2-&lt;1+1&gt;</code>（右结合），结果不同（前者 <code>2</code>，后者 <code>0</code>）。
</div>

### 7.1 消除歧义：改造文法（"Hack the Grammar"）

**结合性**：把运算符强制为左结合——

```
原文法                       改造后
Expr → Expr Op Expr          Expr → Expr Op Int
Expr → Int                   Expr → Int
Expr → Open Expr Close       Expr → Open Expr Close
```

此时 `2-1+1` 只剩一棵树。

**优先级**：上面改造仍违反 `*` 高于 `+` 的优先级（`2-3*4` 被当作 `<2-3>*4`）。解决办法是**为每个优先级引入一个非终结符**：

```
AddOp = + | -     Start → Expr
MulOp = * | /     Expr  → Expr AddOp Term      （加减层）
                  Expr  → Term
                  Term  → Term MulOp Num        （乘除层，绑定更强）
                  Term  → Num
                  Num   → Int
                  Num   → Open Expr Close
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（优先级与结合性的通用处理）</strong>
将运算符按优先级分层，<strong>每层一个非终结符</strong>，绑定越强的层在文法中越靠"内层"（越接近叶子）；在每层内部可通过左/右递归选择左/右结合。该方法可推广到任意多优先级层。
</div>

### 7.2 悬挂 else 问题（Dangling Else）

`if e1 then if e2 then s1 else s2` 中 `else` 归属哪个 `if`？歧义。改造文法，**严格控制"无 else 的 if"只能出现在何处**：

```
Goal     → Stat
Stat     → WithElse
Stat     → LastElse
WithElse → if Expr then WithElse else WithElse
WithElse → <不含 if-then / if-then-else 的语句>
LastElse → if Expr then Stat
LastElse → if Expr then WithElse else LastElse
```

即：无 else 的 if 只能位于语句最外层，或一串 if-then-else 的最末尾。

---

## 8. 抽象语法树 vs. 具体语法树

改造后的文法（消歧）解析出的**具体语法树 (concrete parse tree)** 很复杂、不直观。工程上常让解析器产出**抽象语法树 (Abstract Syntax Tree, AST)**：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（抽象语法 vs. 具体语法）</strong>
<ul>
<li><strong>抽象语法 (abstract syntax)</strong>：对应"直觉上"的程序结构，省略为消歧而引入的多余关键字/符号（如 <code>Open/Close</code>）；本身可以是歧义的。</li>
<li><strong>具体语法 (concrete syntax)</strong>：用于实际解析的完整（消歧）文法。</li>
</ul>
典型流程：直觉但歧义的文法 → 改造成消歧文法 → 解析得具体树 → 转换为更易程序操作的 AST。
</div>

---

## 9. 文法-自动机层级对应（Chomsky Hierarchy 视角）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（文法与自动机的对应）</strong>
<table>
<tr><th>文法</th><th>自动机</th></tr>
<tr><td>正则文法 (Regular Grammar)</td><td>有限状态自动机 (FSA)</td></tr>
<tr><td>上下文无关文法 (CFG)</td><td>下推自动机 (PDA)</td></tr>
<tr><td>上下文相关文法 (Context-Sensitive)</td><td>图灵机 (Turing Machine)</td></tr>
</table>
</div>

- **正则文法**：产生式形如 <span>$NT \to T \mid NT \mid T\,NT$</span>。
- **下推自动机 (PDA)** = DFA + 一个栈，转移关系 <span>$F: S \times (A \cup \{\varepsilon\}) \times V \to S \times V^*$</span>（<span>$V$</span> 为栈字母表）。**CFG 与 PDA 等价**——把 CFG 译成 PDA 再解析，是**自底向上解析器生成器**的基础。
- **上下文相关文法**：产生式允许使用上下文 <span>$(T.NT)^+ \to (T.NT)^*$</span>；对应图灵机（有限状态控制 + 双向纸带）。

---

## 10. 词汇表（Grammar Vocabulary）

- **最左推导 (leftmost derivation)**：每步总是展开最左侧的非终结符；对称地有**最右推导**。
- **句型 (sentential form)**：合法推导某一步得到的、部分或完全推导出的串（如 `0 + Expr Op Expr`）。

---

## 11. 本讲小结

- 语言分层：字母表 → 词法（正则表达式/自动机）→ 语法（文法）→ 语义。
- 生成式与识别式对偶且可自动互转；正则表达式 ↔ NFA ↔ DFA（子集构造，可能指数膨胀）。
- 正则语言无法表达嵌套，故语法层用 CFG；推导/语法树捕获结构。
- 歧义有害，通过"改造文法"处理结合性、优先级、悬挂 else；再用 AST 还原直觉结构。
- 文法-自动机层级：正则↔FSA、CFG↔PDA、上下文相关↔图灵机。
