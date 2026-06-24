# L22：寄存器分配 II（Register Allocation II）——线性扫描与图着色

> 与 L21 共用同一份 slides（《Register Allocation (+ Liveness, Dead Code Elimination)》，分配算法部分 credit Stanford CS143）。L21 打好了地基（活跃性分析、活跃区间、寄存器分配问题形式化），本讲落实 slides "Goal" 提出的**两种分配算法**：**线性扫描 (Linear Scan)** 与 **图着色 (Graph Coloring)**。结合 index.md 推荐的经典论文（Chaitin 1982、Poletto–Sarkar 线性扫描、George–Appel 1996）补充算法细节。

---

## 1. 回顾与目标

L21 已得到：把栈式 IR 转成三地址码后，用活跃性分析算出每个变量的**活跃区间 (live interval)**；不能共用寄存器的变量来自**活跃区间重叠**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（本讲目标）</strong>
探索两种寄存器分配算法：
<ul>
<li><strong>线性扫描 (Linear Scan)</strong>——快、简单，适合 JIT；</li>
<li><strong>图着色 (Graph Coloring)</strong>——质量高、更通用，适合 AOT/优化编译。</li>
</ul>
两者都建立在 L21 的活跃性结果之上。
</div>

回顾约束优化视角：假设 `load_local 0` 的 y 在 `rdi`，约束（t1/t2/t3 用 rdi、return t4 用 rax）下最小化内存访问与寄存器间 mov，求得最优分配 `t1..t3→rdi, t4→rax`。线性扫描与图着色就是求解这类问题的两种实用算法。

---

## 2. 干涉与干涉图（Interference）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（干涉 Interference）</strong>
两个变量<strong>干涉</strong>，若它们在某程序点<strong>同时活跃</strong>（活跃区间重叠）——则它们不能分配到同一寄存器。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（干涉图 Interference Graph）</strong>
结点 = 变量（虚拟寄存器/临时值）；无向边 = 两变量干涉。<strong>给 k 个寄存器分配 = 用 k 种颜色给干涉图着色，使相邻结点异色</strong>。这正是图论的 <strong>k-着色问题</strong>。
</div>

> 用 L21 的例子：`d=e+f` 处 `{e,f}` 同时活跃 → e 与 f 干涉，连边；`e=d+a` 处 `{a,b,c,d}` → a,b,c,d 两两干涉。把所有重叠关系画成图，就得到干涉图。

---

## 3. 图着色寄存器分配（Graph-Coloring）

经典的 **Chaitin / Chaitin-Briggs** 算法。核心定理：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（度数 &lt; k 必可着色）</strong>
若干涉图中某结点的度数（邻居数）<strong>小于可用寄存器数 k</strong>，那么无论其邻居如何着色，总能给它留出一种颜色。<br>
于是可<strong>移除</strong>这种低度结点（连同它的边），递归着色剩下的图，最后再把它放回并染色。
</div>

### 3.1 算法步骤（Chaitin-Briggs）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（图着色分配流程）</strong>
<ol>
<li><strong>Build（建图）</strong>：由活跃性分析建干涉图；</li>
<li><strong>Simplify（化简）</strong>：反复移除度数 &lt; k 的结点，压入栈；</li>
<li><strong>Spill（溢出候选）</strong>：若只剩度数 ≥ k 的结点，选一个标记为<strong>潜在溢出</strong>并移除（也压栈），继续 simplify；</li>
<li><strong>Select（着色）</strong>：从栈逐个弹出结点放回图，分配一个与邻居不冲突的颜色；若某潜在溢出结点放回时无可用颜色 → <strong>实际溢出 (actual spill)</strong>；</li>
<li><strong>Spill code（溢出代码）</strong>：为实际溢出的变量插入存/取内存指令，然后<strong>重建图重跑</strong>。</li>
</ol>
</div>

### 3.2 溢出（Spilling）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Spill）</strong>
寄存器不够时，把某变量放到内存（栈帧槽），在每次使用前 load、定义后 store。<strong>选谁溢出</strong>是启发式：通常选<strong>溢出代价低 / 度数高</strong>者（如使用次数少、活跃区间长、不在循环内的变量）。溢出降低图的度数，使其变得可着色。
</div>

### 3.3 寄存器合并（Coalescing）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Coalescing 合并）</strong>
对于 <code>a = b</code> 这样的<strong>复制 (move)</strong>，若 a 与 b 不干涉，可把它们<strong>合并成一个结点</strong>分配到同一寄存器，从而<strong>消除这条 mov</strong>（这正是 L21 里"为什么这么多 mov"的解药）。<br>
风险：合并会提高结点度数、可能让图变得不可着色。George–Appel 的<strong>迭代寄存器合并 (Iterated Register Coalescing, 1996)</strong> 用保守判据（Briggs/George）只在不破坏可着色性时才合并。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（图着色的复杂度）</strong>
一般 k-着色是 <strong>NP 完全</strong>的，故实用分配器用启发式（Simplify/Coalesce/Freeze/Spill 的迭代）。质量高但编译较慢——适合 AOT/优化编译。
</div>

---

## 4. 线性扫描寄存器分配（Linear Scan）

Poletto–Sarkar 的算法，为**快速编译**（JIT）而生：不建干涉图，只在一条线性扫描中处理活跃区间。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（线性扫描）</strong>
把每个变量近似为一个<strong>活跃区间 [start, end]</strong>（L21 定义的 live interval）。按 <strong>start 排序</strong>，从前往后扫描；维护一个按 <strong>end 排序的活跃区间集合 (active list)</strong>：
<ol>
<li>遇到新区间，先<strong>expire</strong>（淘汰）所有 end 已早于当前 start 的旧区间，释放它们的寄存器；</li>
<li>若有空闲寄存器，分配给新区间，加入 active；</li>
<li>若无空闲寄存器 → 在新区间与 active 中 end 最晚者之间选一个<strong>溢出</strong>（通常溢出 end 更晚的那个）。</li>
</ol>
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（线性扫描的取舍）</strong>
<ul>
<li><strong>优点</strong>：近似线性时间、实现简单、内存开销小 → JIT 首选（早期 HotSpot client、V8 等）；</li>
<li><strong>缺点</strong>：把活跃范围粗化为单一连续区间，<strong>精度低于图着色</strong>，可能多溢出；有诸多改进（区间带"洞"的版本、second-chance、SSA 上的线性扫描）。</li>
</ul>
</div>

---

## 5. 两种算法对比

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（Linear Scan vs Graph Coloring）</strong>
<table>
<tr><th>维度</th><th>线性扫描</th><th>图着色</th></tr>
<tr><td>数据结构</td><td>排序的活跃区间</td><td>干涉图</td></tr>
<tr><td>编译速度</td><td>快（近线性）</td><td>慢（NP 完全 + 启发式）</td></tr>
<tr><td>代码质量</td><td>较好</td><td>更好（更少溢出、可合并）</td></tr>
<tr><td>消除 move</td><td>有限</td><td>coalescing 强</td></tr>
<tr><td>适用</td><td>JIT、快速开发循环</td><td>AOT、优化编译</td></tr>
</table>
</div>

> 呼应 L18 的"何时编译"：JIT 要省编译时间 → 线性扫描；AOT 求极致代码 → 图着色。MITScript 项目里可先实现线性扫描跑通，再视需要上图着色。

---

## 6. 一致性与正确性要点

承接 L21 的**寄存器一致性**：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（分配必须遵守的约束）</strong>
<ul>
<li>每个程序点每个变量唯一位置；同一变量可在不同点位于不同寄存器/内存；</li>
<li>不同时活跃的变量可共用一个寄存器（这正是分配能"省"的根源）；</li>
<li>必须尊重 ISA 约束：结果固定落某寄存器的指令、<strong>caller/callee-saved</strong> 约定（跨 call 要保存的寄存器需在调用前后 push/pop 或避免使用）；</li>
<li>溢出代码必须在每次 use 前 load、def 后 store，保证语义不变。</li>
</ul>
</div>

---

## 7. 与参考资料的对应（补充）

- **图着色**：Chaitin《Register Allocation & Spilling via Graph Coloring》(1982)；改进与合并见 George & Appel《Iterated Register Coalescing》(1996)——均在 index.md 列出。
- **线性扫描**：Poletto & Sarkar《Linear Scan Register Allocation》——index.md 列出。
- slides 的图着色讲解 credit **Stanford CS143**；活跃性框架 credit 6.035 (Amarasinghe)。
- 系统性教材：《Engineering a Compiler》（index.md 推荐，含寄存器分配/数据流/SSA）。Crafting Interpreters 不涉及本主题。

---

## 8. 本讲小结

- 寄存器分配 = 给**干涉图 k-着色**（k = 可用寄存器数）；干涉 = 活跃区间重叠。
- **图着色（Chaitin-Briggs）**：Build → Simplify（移度数<k 的点）→ 必要时标记 Spill → Select（弹栈着色）→ 实际溢出则插溢出代码重跑；用 **coalescing** 消除 move。质量高但 NP 完全、编译慢，适合 AOT。
- **线性扫描**：按区间 start 排序单趟扫描，维护 active 集合，到期释放寄存器、不够则溢出 end 最晚者；近线性、简单，适合 JIT。
- 两者都必须遵守寄存器一致性与 ISA 约束（特定寄存器、callee-saved、溢出 load/store）。
- 选择取决于编译时机：JIT→线性扫描，AOT→图着色。
- 下一单元（L23–L24）：**静态分析**，把 L21 的活跃性数据流一般化为通用分析框架（格、单调函数、不动点）。
