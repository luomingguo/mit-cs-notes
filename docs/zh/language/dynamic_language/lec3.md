# L3：语法分析 I — 基本概念（Parsing：Basic Concepts）

> 从词法（token 序列）到语法（语法树）。本讲：CFG、推导、歧义、优先级、抽象 vs 具体语法

---

## 1. 为何需要上下文无关文法

词法分析产出 token 序列（如 `(2-1)+1` → `Open Int Op Int Close Op Int`），下一步要构造**语法树 (parse tree)**。但正则语言不够用。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（楔形括号语言）</strong>
字母表 <span>$\{<, >\}$</span>：
<ul>
<li>所有串：<code>(&lt;|&gt;)*</code> ✓ 正则</li>
<li>开楔形后接闭楔形：<code>&lt;*&gt;*</code> ✓ 正则</li>
<li><strong>匹配的楔形</strong>（每个 < 配一个 >，可任意嵌套）：<strong>正则表达式无法表达！</strong></li>
</ul>
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（正则语言的局限）</strong>
正则语言<strong>缺少建模嵌套所需的状态</strong>。典型反例：带括号的嵌套表达式语言没有对应的正则表达式（如 <code>(a+(b-c))*(d-(x-(y-z)))</code>、嵌套 if-else）。
</div>

---

## 2. 上下文无关文法（Context-Free Grammar）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（CFG）</strong>
<ul>
<li><strong>终结符 (terminals)</strong>：如 <span>$\{Op, Int, Open, Close\}$</span>，每个由正则表达式定义；</li>
<li><strong>非终结符 (nonterminals)</strong>：如 <span>$\{Start, Expr\}$</span>；</li>
<li><strong>产生式 (productions)</strong>：左部是单个非终结符，右部是终结符与非终结符的序列。</li>
</ul>
</div>

示例文法：

```
Op = +|-|*|/   Open = <        Start → Expr
Int = [0-9]+   Close = >       Expr  → Expr Op Expr
                               Expr  → Int
                               Expr  → Open Expr Close
```

### 2.1 推导与语法树

**生成 (Generation)**：从 `Start` 出发，反复选非终结符、选其产生式、用右部替换，直到无非终结符。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（推导 <code>&lt;2-1&gt;+1</code>）</strong>
<pre>
Start → Expr → Expr Op Expr → Open Expr Close Op Expr
→ Open Expr Op Expr Close Op Expr → Open Int Op Expr Close Op Expr
→ Open Int Op Int Close Op Int → &lt; 2 - 1 &gt; + 1
</pre>
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语法树 Parse Tree）</strong>
内部节点是非终结符，叶子是终结符，边从产生式左部连向右部各符号。它<strong>捕获推导</strong>，给出语言原语的范畴与结构的首个规格。
</div>

**解析 (Recognition / Parsing)** 是逆过程：把 token 序列归约回 `Start`（`Open Int Op Int Close Op Int` → … → `Expr` → `Start`）。解析器可手写或由**解析器生成器**（输入文法、输出解析器）自动产生。

### 2.2 CFG 与正则语言的关系

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（嵌套括号文法及其非正则性）</strong>
<pre>
Start → S;  S → ( L ) ;  S → a ;  L → L , S ;  L → S
</pre>
该文法生成如 <code>a</code>、<code>(a)</code>、<code>(a,(a,a))</code> 等嵌套结构。其语言 <code>S → a(S) | a</code> <strong>不是正则语言</strong>（需配对任意深的括号，超出有限状态能力，可用泵引理证明）。
而 <code>S → a,S | a</code> 的语言 <code>(a,)*a</code> 是正则的——说明 CFL 与 RL 相交，且<strong>CFL 是 RL 的真超集</strong>（每个正则语言都是 CFL，反之不然）。
</div>

---

## 3. 歧义与消除（Ambiguity）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（歧义文法）</strong>
若某串存在多个推导（多棵语法树），文法<strong>歧义</strong>。语法树通常反映语义，故文法歧义常意味着语义歧义（不可取）。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（<code>2-1+1</code> 的两棵树）</strong>
用 <code>Expr → Expr Op Expr</code>，<code>2-1+1</code> 可解析为 <code>&lt;2-1&gt;+1</code> 或 <code>2-&lt;1+1&gt;</code>，结果不同。
</div>

### 3.1 消歧：改造文法

**结合性**——令运算左结合：把 `Expr → Expr Op Expr` 改为 `Expr → Expr Op Int`，则 `2-1+1` 只剩一棵树。

**优先级**——上面仍把 `2-3*4` 当 `<2-3>*4`（违反 `*` 高于 `-`）。解决：**每个优先级一个非终结符**：

```
Start → Expr
Expr → Expr AddOp Term     (加减层)        AddOp = +|-
Expr → Term                                MulOp = *|/
Term → Term MulOp Num       (乘除层，更强)
Term → Num
Num  → Int
Num  → Open Expr Close
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（优先级的通用处理）</strong>
把运算符分优先级层，每层一个非终结符；<strong>优先级越强的层在文法/语法树中越靠下（越接近叶子）</strong>；层内可选左/右递归定结合性，可推广到任意层数。
</div>

---

## 4. 抽象语法树 vs. 具体语法树

改造（消歧）后的文法解析出的**具体语法树**复杂、不直观。工程上产出 **AST**：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（抽象语法 vs. 具体语法）</strong>
<ul>
<li><strong>抽象语法</strong>：对应直觉的程序结构，省略为消歧而引入的多余符号（如 Open/Close），本身可歧义。</li>
<li><strong>具体语法</strong>：用于实际解析的完整（消歧）文法。</li>
</ul>
流程：直觉但歧义的文法 → 改造为消歧文法 → 解析得具体树 → 转换为更易操作的 AST。
</div>

---

## 5. 本讲小结

- 正则语言无法表达嵌套，故语法层用 CFG；推导/语法树捕获结构。
- CFL 真包含 RL（匹配括号语言非正则，可泵引理证明）。
- 歧义有害；改造文法处理结合性与优先级（每优先级一非终结符、越强越靠叶子）。
- 解析产出 AST（省略具体语法的冗余符号），下一讲讲解析算法。
