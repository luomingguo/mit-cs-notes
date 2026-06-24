# L23：静态分析 I（Static Analysis I）——数据流分析框架与格

> 把前面零散用过的分析（类型分析、值分析/常量传播、活跃性）统一到一个**通用静态分析框架**。本讲讲清楚五个关键概念：**事实 (Facts)、合并 (Merging)、转移函数 (Transfer Functions)、算法 (Chaotic Iteration)、终止 (Fixpoints)**，并引入**格 (lattice)** 来刻画分析的精度与合并操作。

---

## 1. 回顾：我们已经用过的优化

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（高级优化清单）</strong>
<ul>
<li><strong>类型分析</strong>：尽量确定操作数类型（→ 消除类型检查）；</li>
<li><strong>形状分析</strong>：尽量确定操作数形状（如 record <code>{a:1,b:2}</code> 的字段集 <code>{a,b}</code>）；</li>
<li><strong>值分析</strong>：尽量确定操作数值（→ 常量传播）；</li>
<li><strong>依赖与活跃性分析</strong>：→ 死代码消除、寄存器分配。</li>
</ul>
四条 takeaway 同 L19：可推断的信息很多、IR 是编码载体、从变换后程序生成代码、优化彼此交互需多轮。
</div>

> 优化的版图自 1960s 起极其丰富——Frances Allen 1966 的《Program Optimization》奠定了系统化分析与变换的概念基础（图灵奖引文）。**用基准测试 (benchmarks) 指导选哪些优化。** 更多内容见 P5 概览、6.035、Berkeley CS294。

本讲的问题：前面这些分析各写各的，**有没有统一的理论框架？** 有——数据流分析 / 抽象解释。

---

## 2. 引子：常量传播需要"到达定义"

例子（CFG，循环里 `s = s + a*b`）：

```
s = 0; a = 4; i = 0;
if (k == 0):  b = 1;   else:  b = 2;
while (i < n):
    s = s + a*b;
    i = i + 1;
return s
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（a 是常量吗？b 是常量吗？）</strong>
<ul>
<li><code>s = s + a*b</code> 处 <strong>a 是常量 4</strong>？—— <strong>是！</strong> 因为<strong>所有到达此处的定义 (reaching definitions)</strong> 都是 <code>a = 4</code>。</li>
<li><strong>b 是常量</strong>？—— <strong>否！</strong> 一条到达定义是 <code>b = 1</code>，另一条是 <code>b = 2</code>（来自 if 的两支），合并后值不唯一。</li>
</ul>
</div>

于是可做**常量传播变换**：`s = s + a*b` → `s = s + 4*b`（a 换成 4，b 不能换）。

> 关键难点：循环带回边、if 有分叉合并——必须有办法**沿 CFG 传播事实、在合并点汇总、且在循环里收敛终止**。这正是数据流框架要解决的。

---

## 3. 静态分析的五个关键概念

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Static Analysis: Key Concepts）</strong>
<ol>
<li><strong>事实 (Facts)</strong>：要追踪的性质空间——一个集合，更确切地是一个<strong>格 (lattice)</strong>，以支持控制流、循环与终止性推理；</li>
<li><strong>符号/抽象执行 (Transfer Functions)</strong>：如何刻画一个基本块对事实的<strong>影响</strong>；</li>
<li><strong>合并 (Merging)</strong>：多分支汇合时如何合并事实（join / meet）；</li>
<li><strong>算法 (Chaotic Iteration)</strong>：如何计算（混沌迭代 / 工作表）；</li>
<li><strong>终止 (Termination)</strong>：分析何时停（<strong>不动点 fixpoint</strong>）。</li>
</ol>
</div>

---

## 4. 通用分析框架：数据流分析 vs 抽象解释

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（两大框架）</strong>
<ul>
<li><strong>数据流分析 (Dataflow Analysis)</strong>：Kildall, 1973；传统用于编译优化；</li>
<li><strong>抽象解释 (Abstract Interpretation)</strong>：Cousot & Cousot, 1977；意图相近但理论更丰富。</li>
</ul>
共同点：把分析问题<strong>表述成 CFG 上的一组方程</strong>，求解之。
</div>

> 我们在 L21 写过的活跃性方程（IN/OUT/USE/DEF + 工作表）正是这个框架的一个实例；本讲把它一般化。

---

## 5. 事实 / 性质：选择追踪什么

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（分析 = 它追踪的一组事实/性质）</strong>
不同分析 = 不同的事实空间：
<ul>
<li><strong>常量分析</strong>：变量的事实是 Z 中一个已知值（例：常量传播）；</li>
<li><strong>符号分析 (Sign)</strong>：事实 ∈ {0, 正, 负}；</li>
<li><strong>区间分析 (Range)</strong>：事实是闭区间 [a,b]（a,b 整数）；用于缩小整数表示位宽或检查溢出（Stephenson, Babb, Amarasinghe, <em>Bitwidth Analysis</em>, PLDI'00）；</li>
<li><strong>值集合 (Value Set)</strong>：追踪变量可能取值的集合；用于对少量取值特化代码。</li>
</ul>
</div>

> 精度从粗到细：符号 ⊂ 区间 ⊂ 值集合 ⊂ 精确值——越精确越能优化，但越贵、越难收敛。选哪种是工程权衡。

---

## 6. 合并事实（Merging）与精度

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（合并 Merging）</strong>
在控制流<strong>汇合点</strong>，要把多条分支的事实合并成一个新事实：
<ul>
<li>新事实应是两支事实的<strong>并 (union)</strong>；</li>
<li>新事实仍须落在该分析的事实集合内；</li>
<li>常常是<strong>过近似 (overapproximation)</strong>——合并结果的取值集合可能比真正的并集还大。</li>
</ul>
由此引入<strong>精度 (precision)</strong> 概念：分析可能追踪不到最精确的事实。
</div>

### 6.1 不同分析合并同一对值的结果

合并左支 `b=v1`、右支 `b=v2`，看四种分析给出什么：

| 左/右 | 常量 (Constant) | 符号 (Sign) | 区间 (Interval) | 值集合 (Set) |
|-------|------|------|----------|--------|
| 1 / 1 | 1（精确） | + | [1,1] | {1} |
| 1 / 2 | **⊤/?（非常量）** | + | [1,2] | {1,2} |
| 0 / 1 | ? | 非负 | [0,1] | {0,1} |
| -1 / 1 | ? | ⊤（任意符号） | [-1,1] | {-1,1} |

> 同样是 `1` 和 `2` 合并：常量分析只能放弃说"不是常量"（精度低），而区间分析能说 `[1,2]`、值集合能说 `{1,2}`（精度高）。**合并算子的设计决定精度。**

### 6.2 关键问题：合并用哪个事实？"?" 是什么？

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（用格来回答合并）</strong>
把事实放进一个<strong>格 (lattice)</strong>——它给事实之间建立<strong>精度的偏序关系</strong>，并提供把事实并起来的运算（join/meet）。合并 = 在格上取相关元素的<strong>最小上界 (join)</strong>（或对偶的 meet）。<br>
那个 "?" 通常就是格的<strong>顶 ⊤（"不知道/任意"）</strong>；对偶的<strong>底 ⊥</strong> 表示"尚无信息"。
</div>

> 格的引入解决三件事：① 合并有了良定义的运算（join）；② 精度有了序（越往上越粗）；③ 配合"格高度有限 + 转移函数单调"可证明**不动点迭代必终止**（详见 L24）。

---

## 7. 算法预告：混沌迭代（Chaotic Iteration）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Chaotic Iteration）</strong>
反复对 CFG 各结点套用"转移函数 + 合并"，直到所有结点的事实不再变化（达到<strong>不动点</strong>）。结点处理顺序可以任意（"混沌"），只要持续直到稳定即可——这与 L21 活跃性的工作表算法是同一思想。
</div>

例（示意，求各点的事实）：

```
y=0; t=1;
x=x+1;  y=y+2;  t=t+2;
y=t-1;
end
```

在 P1…P5 各点反复传播常量/值事实，直至收敛。具体的转移函数定义、单调性与不动点终止性证明，是 L24 的内容。

---

## 8. 与参考资料的对应（补充）

- 数据流分析：Kildall (1973)；抽象解释：Cousot & Cousot (1977)。这两篇是本框架的源头。
- 区间/位宽分析：Stephenson, Babb, Amarasinghe, *Bitwidth Analysis*, PLDI'00。
- 更多数据流优化（公共子表达式消除、自动并行化、数据布局优化）见 MIT 6.035、Berkeley CS294 (wolczko.com/CS294)。
- 形式化的格/不动点理论亦见姊妹课 6.5110《Foundations of Program Analysis》（index.md 列出）。Crafting Interpreters 不涉及数据流分析。

---

## 9. 本讲小结

- 把类型/值/活跃性等分析统一到**通用静态分析框架**：数据流分析 (Kildall) / 抽象解释 (Cousot²)，核心是把问题写成 **CFG 上的方程**。
- 五个关键概念：**事实、转移函数、合并、混沌迭代算法、不动点终止**。
- 常量传播依赖**到达定义**：所有到达定义一致才是常量（a=4 是，b 因 if 两支不一致而否）。
- **事实空间**的选择（常量/符号/区间/值集合）决定精度与成本。
- 合并发生在控制流汇合点，常是**过近似**；用**格 (lattice)** 给事实建立精度偏序并定义 join 合并，"?" 即格顶 ⊤。
- 下一讲（L24）：转移函数的形式化、格的单调性、以及不动点迭代为何**终止**。
