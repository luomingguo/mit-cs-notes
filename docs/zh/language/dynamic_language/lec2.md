# L2：词法分析（Lexing）

> Phase 1 前半。先看一个语言设计议题（语法糖），再讲词法规范（正则表达式 / 自动机）

---



# Lec 2 词法分析

此项任务被称为扫描（scanning）或者是词法分析（lexing）。

任何编译器或解释器的第一步都是扫描。扫描器会将原始源代码（字符序列）作为输入，并把它分组成一系列我们称为“token”（词元）的片段。这些就是构成语言语法的、有意义的“单词”和“标点符号”。

对我们来说，从扫描开始也是一个不错的起点，因为这部分代码并不复杂——本质上就是一个“自我感觉很强大”的 switch 语句。它可以作为一个很好的热身。

在本章结束时，我们将拥有一个功能完整且高效的扫描器，它可以接收任意一段 源代码字符串，并生成一系列 token，这些 token 会在下一章被传递给解析器（parser）使用

## 语言中的词元



每种语言通常都有若干类别的“单词”。在典型的编程语言中，例如：

- 关键字（keywords）：if、while
- 算术运算符（arithmetic operations）：+、-、*、/
- 整数（integer numbers）：1、2、45、67
- 浮点数（floating point numbers）：1.0、.2、3.337
- 标识符（identifiers）：abc、i、j、ab345

通常，每个关键字或每一类词都会对应一个词法类别（lexical category）。每个词法类别通常由正则表达式（regular expression, regexp）来定义，例如：

- `if` 关键字 = `if`
- 操作符 = `+|-|*|/`
- 整数 = `[0-9][0-9]*`
- 浮点数 = `[0-9]*. [0-9]*`
- 标志符 = `[a-z]([a-z]|[0-9])*`



总得目标就是将提取源代码的词元，比如 `(2-1) + 1`

## 使用正则表达式来定义词法结构

给定一个字母表 ∑ = 字母的集合

正则表达式由以下元素构成：

- ε —— 空字符串

- 字母表 ∑ 中的任意一个字母

- $r_1r_2$ —— 正则表达式 r1 后接 r2（顺序/连接）

- $r_1 | r_2$ —— 正则表达式 r1 或 r2（二选一）

- $r^*$ —— 重复（迭代）结构，表示 ε | r | rr | …（即零次或多次重复）

- 使用括号来表示分组与优先级

两个对偶概念：

- 生成式方法（generative approach）——（文法或正则表达式）
- 识别式方法（recognition approach）——（自动机）



由正则表达式生成的所有字符串的集合，称为该正则表达式的语言（language）。一般来说，这样的语言可能是（可数）无限的。语言中的一个字符串通常被称为一个 token（词元）

为了说明正则表达式和语言的的关系，例如

$∑ = \{ 0, 1, . \}$ 语言 可以生成：

- `(0|1)*.(0|1)*`： 二进制浮点数
- `(00)*`：全部由 0 组成的偶数长度字符串
- `1*(01*01*)*`：含有偶数个 0 的字符串

$∑ = \{ a, b, c, 0, 1, 2 \}$​​ 可以生成：

- `(a|b|c)(a|b|c|0|1|2)`：字母数字标识符
- `(0 | 1 | 2)`：三进制数



## 有限状态自动机

另外一种抽象方式——确定性有限状态自动机（Deterministic Finite-State Automata，DFA），其组成为：

- 字母表 ∑

- 一组状态（states），其中包括初始状态和接受状态

- 状态之间的转移（transitions），每条转移都带有字母标记

![image-20260505221140106](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260505221140106.png)



从概念上来说，就是把一个字符串“运行”在自动机中，维护当前状态和当前正在读取的字符，从起始状态开始，并从字符串的第一个字符开始处理， 在每一步中，用当前字符去匹配一条转移边，该转移的标签必须和当前字符相同，持续进行这个过程，直到到达字符串末尾，或者匹配失败为止。 如果最终停留在一个接受状态，那么该自动机就“接受”这个字符串。该自动机的语言（language）就是它所接受的所有字符串的集合。

Ex(TODO)



为什么？ 因为每种语言通常都有若干类别的“单词”。在典型的编程语言中，通常，每个关键字或者每一类词都会对应一个词法类别（lexical category），每个词法类别一般都用正则表达式（regexp）来定义。



## 非确定性有限状态自动机

还有另外一种状态机（Non-Deterministic Finite-State Automata，NFA），其组成为

- 字母表 ∑

- 一组状态，其中包含初始状态和接受状态

- 状态之间的转移，每条转移都用字母标记或者用空字符串 ε 标记（表示不消耗输入字符的转移）

区别：

DFA

- 没有 $\varepsilon$ 转移
- 每个单词至多对应一个状态转移

NFA

- 均没有限制

![image-20260505223503135](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260505223503135.png)



## 从 NFA 到 DFA 构造

我们将正则表达式转换为自动机的方法生成的是一个 NFA（非确定性有限自动机）。

我们希望得到 DFA（确定性有限自动机），以使识别算法更简单。

可以将 NFA 转换为 DFA，但 DFA 的规模可能会比 NFA 大指数级



DFA中的每个状态，对应 NFA中一组状态的子集。

- DFA 的初始状态对应于：从 NFA 初始状态出发，通过 ε 转移（空转移）能够到达的所有状态集合。

- 如果某个 DFA 状态所对应的 NFA 状态集合中包含至少一个 NFA 的接受状态，那么这个 DFA 状态就是接受状态。



为了计算给定 DFA 状态 D 在输入字母 a 下的转移：

- 将集合 S 初始化为空集合
- 找到 D 所对应的 NFA 状态集合 N
- 对于 N 中的每个 NFA 状态 n：
  - 计算在读取字符 a 后，NFA 可能到达的状态集合 N’
  - 将 S 更新为 $S \cup N’$
- 如果 S 非空，那么就存在一条从 D 在输入 a 下的转移，该转移指向 DFA 中对应集合 S 的状态
- 否则，D 在输入 a 下没有转移（即该路径不存在）



举个 NFA 转成 DFA的例子 `(a|b)*.(a|b)*`

![image-20260505224841856](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260505224841856.png)

## 从正则表达式到自动机

通过结构归纳进行构造， 给定一个任意的正则表达式 r

假设我们可以将 r 转换为一个自动机，该自动机具有：

- 一个初始状态
- 一个接受状态

接下来展示如何将所有构造规则都转换为自动机，并保证结果仍然具有：

- 一个初始状态
- 一个接受状态

## 1. 语言设计：语法糖（Syntactic Sugar）

MITScript 很精简，但能力不弱：有函数（`fun`，即闭包，等同 Python 的 `lambda`）、命令行输入（`input`/`intcast`）、`while` 循环、**记录 `{}`**（本质是字典）。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（用记录 + 闭包模拟"类"）</strong>
<pre>
Point = fun(a, b) {
  self = {
    x : a;  y : b;
    print : fun(){ log("Point(" + self.x + ", " + self.y + ")"); };
  };
  return self;
};
p1 = Point(5,5); p1.print();
</pre>
这段在语义上等价于 Python 的 <code>class Point</code> 定义——对象 = 一个有 x/y/print 字段的记录，方法通过 <code>self</code> 指针访问字段。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语法糖 Syntactic Sugar）</strong>
当一个语言特性的<strong>语法</strong>可以被翻译（reduce）为一组更简单的原语（primitives）的组合时，称该特性为<strong>语法糖</strong>。如 Python 的 class 可降解为"记录 + 闭包"。
</div>

> 语言设计的核心权衡：**可用性**（提供易用语法）vs. **语言复杂度**（只实现一组核心原语）。判断一个新抽象能否/应否降解为简单原语，是设计语言的关键任务。

---

## 2. 语言定义的分层结构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语言定义的四层）</strong>
<ul>
<li><strong>字母表</strong>：语言中的字母集合 <span>$\Sigma$</span>；</li>
<li><strong>词法结构 (lexical)</strong>：识别"词 (words)"，每词是字母序列；</li>
<li><strong>语法结构 (syntactic)</strong>：识别"句子"，每句是词序列；</li>
<li><strong>语义 (semantics)</strong>：程序含义（对每个输入应得什么结果）。</li>
</ul>
本讲：词法（对应 Phase 1）。
</div>

---

## 3. 词法类别（Lexical Categories）

每门语言有若干词类，每类用一个正则表达式（*regular expression*）定义：

```
IfKeyword  = if          Integer    = [0-9][0-9]*
WhileKeyword = while      Float      = [0-9]*.[0-9]*
Operator   = + | - | * | / Identifier = [a-z]([a-z]|[0-9])*
```

其中 `[0-9] = (0|1|…|9)`，`[a-z] = (a|b|…|z)`。

**分词目标**：把字符流 `(2-1)+1` 切成带类别与文本的 token 序列：`Open "("`、`Int "2"`、`Op "-"`、`Int "1"`、`Close ")"`、`Op "+"`、`Int "1"`。

---

## 4. 两种对偶视角：生成式 vs. 识别式

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（生成式与识别式）</strong>
<ul>
<li><strong>生成式 (generative)</strong>：正则表达式 / 文法，<strong>生成</strong>语言中所有串。</li>
<li><strong>识别式 (recognition)</strong>：自动机 (*automaton*)，<strong>判定</strong>某串是否在语言中。</li>
</ul>
二者哲学不同但<strong>理论等价</strong>，且可自动互转。标准做法：用正则表达式定义、自动转成自动机实现。
</div>

### 4.1 正则表达式构造

由以下归纳构造：<span>$\varepsilon$</span>（空串）、字母、序列 <span>$r_1 r_2$</span>、选择 <span>$r_1\mid r_2$</span>、克莱尼星 <span>$r^* = \varepsilon\mid r\mid rr\mid\cdots$</span>、括号分组。生成语义靠重写：<span>$r_1\mid r_2\to r_1$</span>、<span>$\to r_2$</span>，<span>$r^*\to rr^*$</span>、<span>$\to\varepsilon$</span>。所有可生成串的集合是该表达式的**语言**，串常称 **token**。

示例（<span>$\Sigma=\{0,1,.\}$</span>）：`(0|1)*.(0|1)*` 二进制浮点数；`(00)*` 偶数长全 0 串；`1*(01*01*)*` 含偶数个 0 的串。

---

## 5. 有限状态自动机（Finite-State Automata）

由字母表 <span>$\Sigma$</span>、带初始/接受标记的状态集、带字母标签的转移构成。运行：从起始态与首字母开始，每步匹配同标签转移，到串尾停在接受态则**接受**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（DFA vs. NFA）</strong>
<ul>
<li><strong>DFA</strong>：无 <span>$\varepsilon$</span> 转移，每态对每字母至多一条转移。</li>
<li><strong>NFA</strong>：放宽两限制——允许 <span>$\varepsilon$</span>（空串）转移与同标签多转移；只要存在一条路径接受即接受。</li>
</ul>
</div>

### 5.1 正则表达式 → NFA（结构归纳）

假设每子表达式可转为"单起始 + 单接受"的自动机，给出各构造子的拼装：
- **基本**：<span>$\varepsilon$</span> 用 <span>$\varepsilon$</span> 边，字母 <span>$a$</span> 用 <span>$a$</span> 边；
- **序列**：旧接受态 <span>$\to_\varepsilon$</span> 下一段旧起始态；
- **选择**：新起始 <span>$\to_\varepsilon$</span> 两支，两支接受态 <span>$\to_\varepsilon$</span> 新接受；
- **克莱尼星**：新起始 <span>$\to_\varepsilon$</span> 旧起始/新接受，旧接受 <span>$\to_\varepsilon$</span> 旧起始/新接受。

产物总是 NFA。

### 5.2 NFA → DFA（子集构造）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（子集构造 Subset Construction）</strong>
DFA 每个状态对应 NFA 状态的一个子集；起始态 = NFA 起始态的 <span>$\varepsilon$</span>-闭包；某 DFA 状态为接受态 ⟺ 其集合含某 NFA 接受态；对字母 <span>$a$</span> 的转移 = 集合内各 NFA 态读 <span>$a$</span>（含后续 <span>$\varepsilon$</span>）可达状态的并集。代价：DFA 可能<strong>指数级</strong>大于 NFA。
</div>

---

## 6. Phase 1 的 Lexer 任务

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Lexer 规格）</strong>
<strong>输入</strong>：一组词法类别（正则表达式）+ 一个输入字符串；<strong>输出</strong>：一个 token 序列，每个 token 带其匹配文本。
</div>

实现路线即上面的链条：正则表达式 → NFA → DFA → 用 DFA 对输入扫描分词。

---

## 7. 本讲小结

- 语言设计权衡可用性与复杂度；语法糖把高层特性降解为核心原语（class → 记录 + 闭包）。
- 语言分层：字母表 → 词法 → 语法 → 语义；词法用正则表达式定义词类。
- 生成式（正则表达式/文法）与识别式（自动机）对偶且可自动互转：正则表达式 → NFA →（子集构造）→ DFA。
- Phase 1 的 lexer：以词法类别 + 输入串为输入，产出带文本的 token 序列。
