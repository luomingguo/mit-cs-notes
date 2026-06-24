# L6：语义（导论）——操作语义与求值关系

> Phase 2 开始。从"语法"转向"语义"：用**求值关系 + 推理规则**精确定义程序行为
> 参考：Glynn Winskel, *The Formal Semantics of Programming Languages*（IMP 语言）

---

## 1. 收尾：文法-自动机层级（Chomsky Hierarchy）

定义语言有两条对偶路线——文法（生成）与自动机（识别），二者对应。完整层级：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（四层文法与自动机）</strong>
<table>
<tr><th>文法</th><th>产生式形式</th><th>自动机</th></tr>
<tr><td>正则 (Regular)</td><td><span>$NT \to T \mid T\,NT$</span></td><td>有限状态自动机 FSA</td></tr>
<tr><td>上下文无关 (CFG)</td><td><span>$NT \to (T\mid NT)^*$</span></td><td>下推自动机 PDA（DFA + 栈）</td></tr>
<tr><td>上下文相关 (Context-Sensitive)</td><td><span>$\alpha X\beta \to \alpha Y\beta$</span>（Y 非空）</td><td>线性有界图灵机 LBA</td></tr>
<tr><td>无限制 (Unrestricted)</td><td><span>$\alpha \to \beta$</span></td><td>图灵机 TM</td></tr>
</table>
PDA 配置 = 状态 + 栈 + 剩余输入，转移关系 <span>$F: S\times(A\cup\{\varepsilon\})\times V \to S\times V^*$</span>。
</div>

### 1.1 解析技术的命名 LL/LR(k)

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（LL / LR(k) 命名法）</strong>
<ul>
<li>第一个字母：<strong>L</strong> 从左到右扫描（R 从右到左）；</li>
<li>第二个字母：<strong>L</strong> 最左推导（R 最右推导）；</li>
<li><strong>(k)</strong>：前看字符数。</li>
</ul>
本课自顶向下讲的是 <strong>LL(1)</strong>（不左因子分解的 if-then/if-then-else 需 LL(3)）；自底向上（识别式）对应 <strong>LR(0)</strong> 等。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（超出 CFG 的"声明-使用"约束）</strong>
<pre>
S → declare v ; S  |  use v ; S  |  ε
</pre>
该 CFG 能生成 <code>declare x; use x;</code>，但<strong>无法表达"使用前必须声明"</strong>这类约束（<code>use x</code> 而未 <code>declare x</code> 在语法上仍合法）。这属于<strong>上下文相关</strong>层级，概念上对应语言的<strong>类型系统</strong>——也是为什么"语义检查"要在语法之外单独做。
</div>

> 无限制文法就对应"程序本身"（图灵机）——这把我们引向：如何规约程序的行为，即**语义**。

---

## 2. 什么是语义（Semantics）

语义给出程序行为的规格，标准同 L1：**精确**（足以产出实现）、**完整**（覆盖全部特性）、**无歧义**（合理解读同结果）、**平衡**（传达正确性、给实现留性能空间）。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（C/C++ 实参求值顺序未定义）</strong>
<pre>
int x = 1;
int add2(){ x = x+2; return x; }
int mul2(){ x = x*2; return x; }
sum(add2(), mul2());
</pre>
若先求 add2：add2→3、mul2→6、sum(3,6)=9；若先求 mul2：mul2→2、add2→4、sum(2,4)=6。<strong>两种都是合法解读</strong>——C/C++ 未规定实参求值顺序。语义必须明确到能消除（或有意保留）这种自由度。
</div>

---

## 3. 递归解释器：语义的"实现"直觉

一个朴素的树遍历解释器已经隐含了语义：

```cpp
class Binop : public Expr { enum {PLUS,SUB,MUL,DIV} op; Expr *left,*right; };
int eval_expr(Frame* f, Expr* e);
int eval_binop(Frame* f, Binop* e) {
    switch(e->op){ case PLUS: return eval_plus(f,e); ... }
}
int eval_plus(Frame* f, Binop* e) {
    int n1 = eval_expr(f, e->left);
    int n2 = eval_expr(f, e->right);
    return n1 + n2;
}
```

> 这段代码"是"加法的语义，但用 C++ 写不够**精确无歧义**（依赖 C++ 自身语义、求值顺序等）。我们需要一种数学化、与实现语言无关的规格——**操作语义 (operational semantics)**。

---

## 4. IMP：一个简单的命令式语言

IMP（Winskel）含：赋值、if-then-else、顺序组合、while 循环。其语法分三类项：**算术表达式 E**、**布尔表达式 B**、**语句 S**。我们要为每一类给出语义。

### 4.1 帧与状态（Frames）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（帧 Frame）</strong>
帧 <span>$f$</span> 是从变量到值的映射，表示程序某时刻的<strong>状态</strong>。如 <code>x=1; y=2; z=3;</code> 后 <span>$f = \{x\mapsto1, y\mapsto2, z\mapsto3\}$</span>。<span>$f(x)$</span> 取变量值，<span>$f[x\mapsto n]$</span> 表示更新后的帧。
</div>

### 4.2 求值关系（Evaluation Relations）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（求值关系）</strong>
用<strong>求值关系</strong>定义每类项的语义，含义是"给定一个帧，该项求值到一个结果"：
<ul>
<li>表达式：<span>$\langle e, f\rangle \Downarrow n$</span>（在帧 f 下，表达式 e 求值为整数 n）；</li>
<li>布尔表达式：<span>$\langle b, f\rangle \Downarrow t$</span>（求值为 true/false）；</li>
<li>语句：<span>$\langle s, f\rangle \Downarrow f'$</span>（语句把帧 f 变换为新帧 f'）。</li>
</ul>
这是<strong>大步操作语义 (big-step / natural semantics)</strong>：直接给出"项 + 初态 ⇒ 终态/值"。
</div>

**关系基础**：一个关系是有序对的集合（如 <span>$R \subseteq \text{People}\times\text{People}$</span>）；我们用**推理规则**来**指定**这个（通常无限的）关系。

---

## 5. 推理规则与结构归纳（Inference Rules）

推理规则形如"前提在线上、结论在线下"：

$$\frac{\text{前提}_1 \quad \cdots \quad \text{前提}_n}{\text{结论}}$$

无前提的规则是**公理 (axiom)**。整套规则按项的语法结构**归纳**定义关系——正是 L2 见过的**结构归纳/递归**思想。

### 5.1 算术表达式的规则

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（算术表达式大步语义）</strong>
$$\frac{}{\langle n, f\rangle \Downarrow n}\ (\text{常量}) \qquad \frac{}{\langle x, f\rangle \Downarrow f(x)}\ (\text{变量})$$
$$\frac{\langle e_1, f\rangle \Downarrow n_1 \quad \langle e_2, f\rangle \Downarrow n_2}{\langle e_1 + e_2, f\rangle \Downarrow n_1 + n_2}\ (\text{加法})$$
减、乘、除类似（除法在 <span>$n_2=0$</span> 时无规则适用——见"出错求值 Errant Evaluations"，下一讲处理）。
</div>

> 对照第 3 节的 `eval_plus`：递归调用左右子表达式、相加返回——推理规则正是它的数学化、与实现无关的版本。前提对应递归调用，结论对应返回值。

### 5.2 布尔表达式与语句（下一讲展开）

布尔表达式规则（如比较 <span>$\langle e_1, f\rangle\Downarrow n_1,\ \langle e_2,f\rangle\Downarrow n_2$</span> 推出 <span>$\langle e_1 = e_2, f\rangle \Downarrow (n_1 \stackrel?= n_2)$</span>）与语句规则（赋值、顺序、if、while）将在 L7 系统给出。预览：

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（if 语句的直觉）</strong>
<pre>
if (x == 1) { y = 2; }
</pre>
语义：先在帧 f 下求条件 <code>x==1</code>；若为 true，则执行 <code>y=2</code> 得 <span>$f[y\mapsto2]$</span>；若为 false，则帧不变。对应两条 if 推理规则（真分支 / 假分支）。
</div>

---

## 6. 本讲小结

- Chomsky 层级收尾：正则/CFG/上下文相关/无限制 ↔ FSA/PDA/LBA/TM；解析技术按 LL/LR(k) 命名（本课 LL(1)）。"声明-使用"约束超出 CFG，属类型系统。
- 语义给出程序行为的精确、完整、无歧义、平衡的规格；C/C++ 实参顺序未定义说明规格的必要性。
- 朴素递归解释器隐含语义，但依赖实现语言；改用数学化的**大步操作语义**。
- 核心机制：帧（变量→值）+ 求值关系（<span>$\langle e,f\rangle\Downarrow n$</span>、<span>$\langle s,f\rangle\Downarrow f'$</span>）+ 推理规则（结构归纳）。
- 算术表达式规则已给出；布尔与语句（赋值/顺序/if/while）见 L7。
