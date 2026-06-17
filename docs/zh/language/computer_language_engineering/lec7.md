# Lecture 07：程序分析与优化（基本块内）

> 参考：本讲聚焦**基本块内 (intra-basic-block)** 的分析与变换，是 L8 全过程数据流分析的基础

---

## 1. 程序分析与变换（Analysis & Transformation）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（程序分析）</strong>
程序分析是<strong>编译期对程序运行期行为的推理</strong>。可发现<strong>总是为真</strong>的事实（"语句 <code>y=x+z</code> 中 x 恒为 1"、"<code>return 5</code> 永不执行"），也可推断<strong>很可能为真</strong>的事实（"引用 r 通常指向 C 类对象"）。需区分<strong>数据属性</strong>与<strong>控制流属性</strong>。
</div>

**变换 (transformation)** 用分析结果改写程序，目标：减少执行指令数、减小代码体积、减少周期数（用向量/DSP 指令、改善 cache 命中）、降功耗、省内存。

---

## 2. 基本块与符号执行（Basic Blocks & Symbolic Execution）

基本块定义同 L6（极大、无中途跳入/跳出）。**基本块分析方法**：假设**规范化基本块**——所有语句形如 `var = var op var`、`var = op var`、`var = var`；然后**符号化模拟执行 (symbolic execution)** 基本块，推理变量的值（或其他计算属性），导出感兴趣的性质。

### 2.1 两类变量

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（临时变量 vs. 程序变量）</strong>
<ul>
<li><strong>编译器引入的临时变量 (temporaries)</strong>：只在基本块内传值，由指令扁平化/优化引入，通常<strong>只被赋值一次</strong>。</li>
<li><strong>程序变量 (program variables)</strong>：源程序声明，可多次赋值，可在基本块间传值。</li>
</ul>
</div>

### 2.2 基本块优化菜单

```
公共子表达式消除  a=(x+y)+z; b=x+y;   ⟹  t=x+y; a=t+z; b=t;
常量传播          x=5; b=x+y;         ⟹  x=5; b=5+y;
代数恒等          a=x*1;              ⟹  a=x;
复制传播          a=x+y; b=a; c=b+z;  ⟹  a=x+y; b=a; c=a+z;
死代码消除        a=x+y; b=a; b=a+z;  ⟹  a=x+y; b=a+z;
强度削弱          t=i*4;              ⟹  t=i<<2;
```

---

## 3. 值编号与公共子表达式消除（Value Numbering & CSE）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（值编号，Value Numbering）</strong>
前向符号执行基本块，给每个变量与表达式分配一个<strong>虚拟值 (virtual value)</strong>；发现的性质是"哪些变量/表达式有相同的值"。标准用途是 CSE：把算出的值存进临时变量，当某表达式的值之前已算过时，用临时变量替换之。
</div>

维护三张映射：

- **Var→Val**：每个变量的符号值（处理 `x=y+z` 时用它求 y、z 的值）；
- **Exp→Val**：每个已求值表达式的值（当 `value(y)+value(z)` 已算过时，用来更新 Var→Val）；
- **Exp→Tmp**：持有每个已求值表达式的临时变量（处理 `x=y+z` 时决定复用哪个 tmp）。

每条新值赋给一个临时变量：`a=x+y;` 变成 `a=x+y; t=a;`——即使原变量后续被改写，临时变量也保住了该值供后用。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（值编号的三个有趣性质）</strong>
<p><strong>① 即使用不同变量也能发现公共子表达式</strong>（因用符号值）：<code>y=a+b; x=b; z=a+x;</code> ⟹ <code>y=a+b; t=y; x=b; z=t;</code></p>
<p><strong>② 即使原变量被覆盖也能发现</strong>（因值已存入 tmp）：<code>y=a+b; y=1; z=a+b;</code> ⟹ <code>y=a+b; t=y; y=1; z=t;</code></p>
<p><strong>③ 扁平化 + CSE 可捕获任意复杂的部分公共子表达式</strong>：<code>w=(a+b)+c; x=b; y=(a+x)+c; z=a+b;</code> 扁平化后 <code>t1=a+b; w=t1+c; x=b; t2=a+x; y=t2+c; z=a+b;</code>，CSE 发现 <code>t1+c</code> 与 <code>t2+c</code> 同值、<code>z=a+b</code> 已算过，可全部复用。</p>
</div>

**两个遗留问题**：(I) 引入大量临时变量与拷贝语句（用复制传播 + 死代码消除清理）；(II) 表达式必须**完全相同**才识别（用规范化 canonicalization + 代数化简处理 `a+b+c` vs `b+c+a`）。

---

## 4. 复制传播（Copy Propagation）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（复制传播）</strong>
符号模拟执行，<strong>尽量用原变量替代临时变量</strong>。关键：判断原变量在"其赋值语句"与"使用算出值"之间<strong>是否被覆盖</strong>；若未被覆盖，则用原变量。
</div>

维护两张映射：**tmp→var**（某临时变量该用哪个变量替代）与 **var→set**（其逆，某变量被哪些 tmp 映射）。算法：每条语句，若 RHS 中临时变量在 tmp→var 则替换为 var；若 LHS 变量在 var→set，则把该集合里的 tmp 在 tmp→var 中失效（如 `a=b` 重定义 a 后，`t1→a` 改为 `t1→t1`、`a→{}`）。

CSE + CP + DCE 协同：`a=x+y; b=x+y;` → CSE：`a=x+y; t=a; b=t;` → CP：`a=x+y; t=a; b=a;` → DCE：`a=x+y; b=a;`

---

## 5. 死代码消除（Dead Code Elimination, DCE）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（死代码消除，逆向）</strong>
<strong>逆执行顺序</strong>处理代码，维护一个"后续计算所需变量"的集合 (needed set)；遇到对"不被需要的"变量的赋值，删除该赋值。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（DCE 逆向扫描）</strong>
初始 needed = {b}（假设 b 后续需要）。逆序处理：
<pre>
a=x+y; t1=a; b=a+z; t2=b; c=a; a=b;     needed={b}
↑ a=b：a∈?否→… 实际从末尾起，逐步把 RHS 变量加入、删除无用赋值
最终：a=x+y; b=a+z; c=a; a=b;            （t1、t2 被删）
</pre>
末态 needed={x,y,z}。
</div>

---

## 6. 代数化简（Algebraic Simplification）

用代数/数论知识化简表达式：

```
a+0 ⟹ a      a*1 ⟹ a      a/1 ⟹ a      a*0 ⟹ 0      0-a ⟹ -a
a+(-b) ⟹ a-b   -(-a) ⟹ a
a∧true ⟹ a    a∧false ⟹ false   a∨true ⟹ true   a∨false ⟹ a
a^2 ⟹ a*a    a*2 ⟹ a+a    a*8 ⟹ a<<3
```

**机会来源**：程序员懒得化简（可读性优先）；编译器展开后（如 `A[8][12]` 展开为 `*(Abase+4*(12+8*256))`）；其他优化之后。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（代数化简的实现要点）</strong>
<ul>
<li><strong>不是数据流优化</strong>：在表达式树上匹配化简规则并改写，候选未必显然（如 <code>a+b-a</code>）。</li>
<li>利用运算性质：交换律 <span>$a\,op\,b = b\,op\,a$</span>、结合律 <span>$(a\,op\,b)\,op\,c = b\,op\,(a\,op\,c)$</span>。</li>
<li>化为<strong>规范格式 (canonical format)</strong>：积之和、项按规范序，如 <span>$(a+3)(a+8)\cdot4 \Rightarrow 4a^2+44a+96$</span>（Whale book §12.3.1）。</li>
</ul>
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（数值稳定性陷阱）</strong>
<code>(a/b)*0 + c</code> 可化简为 <code>c</code>；但当 <code>b=0</code> 时本应抛除零异常，化简后却得到结果——化简可能改变语义，需谨慎（尤其浮点）。
</div>

---

## 7. 本讲小结

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（基本块优化的共性）</strong>
<ul>
<li>分析与变换都<strong>符号化模拟程序执行</strong>：CSE、复制传播、常量传播<strong>前向</strong>；死代码消除<strong>逆向</strong>。</li>
<li>变换<strong>层叠协作</strong>：一个变换常制造低效代码，由后续变换清理；即便原代码不直接受益，某变换仍可能有用（为后续铺路）。</li>
</ul>
</div>

- 基本块内：值编号/CSE、复制传播、死代码消除、代数化简、常量传播、强度削弱。
- 临时变量通常单赋值，便于推理；程序变量可跨块、可多次赋值。
- 这些思想将在 L8 推广到**跨基本块**（全过程）的数据流分析。
