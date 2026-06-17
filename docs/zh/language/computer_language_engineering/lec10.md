# Lecture 10：寄存器分配（Register Allocation）

> 配套复习课：R10 寄存器分配 + 窥孔优化（第 8–9 节）——这是项目 Phase 5 的核心
> 关键概念：webs、干涉图、图着色、溢出、拆分

---

## 1. 什么是寄存器分配

程序在 def 与 use 之间须存储值，两种选择：① 定义时存内存、使用时取内存；② 定义时存寄存器、使用时读寄存器。**寄存器分配**就是在有限寄存器里决定存哪些值。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（寄存器分配的重要性）</strong>
它<strong>影响几乎每条语句</strong>，消除昂贵的内存指令、直接操作寄存器使指令数下降，<strong>很可能是影响最大的优化</strong>。寄存器比内存快（带宽约 4 倍、延迟约 3 倍），但数量少——通常 16 个整型 + 16 个浮点，且部分有固定用途（如 RSP、RBP）。
</div>

可放入寄存器的：编译器临时变量、局部标量、大常量、数组元素/对象字段（涉及别名分析）。寄存器集按数据类型分（浮点值进浮点寄存器）。

---

## 2. 两条关键思想

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（寄存器复用的两条规则）</strong>
<ul>
<li><strong>当一个临时变量死亡，其寄存器可被复用。</strong></li>
<li><strong>两个同时活跃的临时变量不能用同一寄存器。</strong></li>
</ul>
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（复用 vs. 冲突）</strong>
<pre>
a=c+d; e=a+b; f=e-1;   (a、e 用后即死)  → a、e、f 可同寄存器 r1
a=c+d; e=a+b; f=e-a;   (a 在 f 处仍活) → e 与 a 不能同寄存器
当活跃变量多于寄存器：拆分活跃区间——把值 store 到内存、用时再 load 回。
</pre>
</div>

---

## 3. 基于 Web 的寄存器分配流程

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（流程）</strong>
确定每个值的活跃区间（web）→ 确定重叠区间（干涉）→ 计算每个 web 保留在寄存器的收益（溢出代价）→ 决定哪些 web 得寄存器（分配）→ 必要时拆分 web（溢出与拆分）→ 给 web 分配硬寄存器（指派）→ 生成含溢出的代码。
</div>

### 3.1 Web

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Web）</strong>
起点是 def-use 链（连接定义到所有可达使用）。归并条件：一个定义与它能到达的所有使用须同一 web；到达同一使用的所有定义须同一 web（用并查集 union-find）。Web 是寄存器分配的<strong>单位</strong>——若分到寄存器 R，则其所有定义写入 R、所有使用从 R 读；若分到内存 M 同理。
</div>

### 3.2 活跃区间与干涉

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（凸集、活跃区间、干涉）</strong>
集合 <span>$S$</span> <strong>凸 (convex)</strong>：若 <span>$A,B \in S$</span> 且 <span>$C$</span> 在 <span>$A$</span> 到 <span>$B$</span> 的路径上，则 <span>$C \in S$</span>。web 的<strong>活跃区间 (live range)</strong> 是包含其所有 def/use 的最小凸指令集。两个 web <strong>干涉 (interfere)</strong> 当其活跃区间重叠（交非空）——干涉则须存不同寄存器/内存位置。
</div>

**干涉图 (interference graph)**：节点是 web，两 web 干涉则连边。

---

## 4. 图着色（Graph Coloring）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（寄存器分配即图着色）</strong>
每个 web 分一个寄存器（颜色）；干涉（有边）的两节点不能同色。这是图论经典问题，<strong>NP 完全</strong>，但寄存器分配有好的启发式。
</div>

### 4.1 着色启发式（Chaitin 风格）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（N 色着色启发式）</strong>
若节点<strong>度 < N</strong>，则总能着色（给其余节点着完色后至少剩一种颜色给它）。算法：
<ol>
<li>反复移除度 < N 的节点，压入栈；</li>
<li>当所有剩余节点度 ≥ N，选一个节点<strong>溢出 (spill)</strong> 并移除；</li>
<li>栈空后开始着色：依次弹出节点，赋一个与其已着色邻居不同的颜色（因移除时度 < N，必有可用色）。</li>
</ol>
注意度 ≥ N 不代表不可着色，仍可能 N 色可着。
</div>

---

## 5. 溢出与拆分（Spilling & Splitting）

着色失败时两选择：① **溢出**——把某 web 的值放内存，所有 def 写内存、所有 use 从内存读；② **拆分**——把 web 拆成多个以减少干涉；之后重试着色。

### 5.1 溢出代价（Spill Cost）

选哪个 web 溢出？度 ≥ N 且溢出代价最小者。**理想溢出代价**是额外 load/store 的动态成本，但不可知（分支走向、循环次数未知），故用**静态近似**（profiling 或基于 CFG 结构的启发式）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（一种溢出代价计算，偏好循环内的值）</strong>
假设循环执行 10（或 100）次：
$$\text{spillCost} = \sum_{\text{def 点}} \text{storeCost}\cdot 10^{\text{循环嵌套深度}} + \sum_{\text{use 点}} \text{loadCost}\cdot 10^{\text{循环嵌套深度}}$$
选 spillCost 最低的 web 溢出。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（1 个寄存器时溢出谁？）</strong>
x 的代价 = <code>storeCost + loadCost</code>；y 在循环内代价 = <code>9·storeCost + 9·loadCost</code>。应溢出代价较低的 <strong>x</strong>。
</div>

### 5.2 拆分而非溢出

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（拆分启发式与代价/收益）</strong>
在图非 R-可着色的程序点（活跃 web 数 > N），挑一个在该点最大封闭块内未被使用的 web，在对应边处拆分（store 出去、需要时 load 回），重建干涉图并重试着色。
拆分<strong>代价</strong> ∝ 被拆边动态跨越次数（用循环嵌套估计）；<strong>收益</strong> = 提升所干涉节点的可着色性（用干涉图中的度近似）。贪心：选收益/代价比最高的活跃区间。
</div>

---

## 6. 更多优化（Further Optimizations）

- **寄存器合并 (coalescing)**：对拷贝 `sj = si`，若 sj、si 不干涉则合并其 web（类似复制传播、减指令；但可能增大合并节点的度，使可着色图变不可着色）。
- **寄存器定向/预着色 (targeting / pre-coloring)**：某些变量在特定时刻须在特定寄存器（前 6 个参数、返回值），预先绑定以消除多余拷贝。
- **预拆分 (pre-splitting)**：活跃区间有大段"死"区时拆开（在调用点——反正要溢出；或大循环嵌套外——为循环内值预留寄存器）。
- **过程间寄存器分配 (interprocedural)**：跨过程边界保存寄存器昂贵（尤其小函数多时），通用调用约定低效，可按函数定制调用约定。

---

## 7. 补充（R10-1）：基于 SSA 的寄存器分配（Hack 方法）

Martin 的幻灯片覆盖**非 SSA IR** 的技术。若用 SSA：可先 de-SSA 再分配，或**直接在 SSA 上分配**（Hack）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（SSA 寄存器分配的优势）</strong>
<ul>
<li>SSA 的干涉图是<strong>弦图 (chordal)</strong> ⟹ <strong>多项式时间</strong>最优着色；</li>
<li>所需寄存器数 = 程序点处<strong>最大同时活跃变量数</strong>；</li>
<li>把<strong>溢出决策与着色解耦</strong>。</li>
</ul>
挑战：在不破坏 SSA 的前提下插入溢出；实现多项式着色算法。
</div>

**路线**：① 算溢出代价 → ② 插入溢出与重载 → ③ 重建 SSA → ④ 着色 → ⑤ de-SSA。

- **Belady 启发式（溢出代价）**：寄存器不够时，溢出"下一次使用最远"的变量。基本块内逆序计算"到最近使用的距离"；跨块时合并各后继（取 MIN 是格、可用工作表；加权平均不是格、不保证收敛）。
- **插入溢出**：溢出会拆分活跃区间、降低寄存器压力；目标是使同时活跃变量数 ≤ 物理寄存器数（SSA 下即 #活跃 = #所需寄存器）。
- **重建 SSA**：重载也是变量的定义（从内存载入）⟹ 需对重载重跑 SSA 构造（涉及 memory phi）。
- **着色实现**：Hack 的算法可不显式构造干涉图做最优着色，但更复杂、难加寄存器约束；**建议先用 ILP 求解器**（图着色 NP 难，自制暴力差），ILP 易改目标以表达亲和性（φ 实参偏好同寄存器、三地址源/目的偏好同寄存器、跨调用的活跃变量偏好 callee-saved）。开源求解器：GLPK、Cbc、HiGHS。

> 工程提示：用**极少寄存器（如 3 个）压力测试**分配器以暴露边界 bug；动手前先想清楚、充分注释不变式、必要时加断言、用"小黄鸭"或队友复核。

---

## 8. 补充（R10-2）：窥孔优化（Peephole Optimization）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（窥孔优化）</strong>
汇编层面的优化：取一小段汇编，变换为更优的等价段；常可与代码生成同时进行（第一遍就尽量发好代码）。
</div>

应当避免发出的冗余：`movq %r8,%r9; movq %r9,%r8`、`pushq %rax; popq %rax`、连续两次写同一寄存器等。

实用 x86 技巧：

- **清零寄存器** `xor %reg,%reg`（比 `movq $0,%reg` 代码更小、利 icache；寄存器重命名器能识别该模式直连硬连线零）。
- **直落 (fallthrough)**：循环体常被执行，尽量"落入"循环体，使后续指令在 cache 中已热。
- **省帧指针** `-fomit-frame-pointer`：Decaf 可执行很少分发、无变长数组，可把 `%rbp` 当通用寄存器用。
- **红区 (Red Zone)**：函数可访问其初始栈指针下 128 字节而无需分配栈空间；对**叶子调用**，若需 < 128 字节可省去栈操作（非叶子调用则危险）。
- **2 的幂 / lea / cmov**：移位代替乘除、`lea` 做地址算术与轻量算术、`cmov` 消分支。
- **常量除法的"魔数 (magic number)"**：用乘以魔数 + 移位代替除法（Hacker's Delight / LLVM DivisionByConstantInfo）；魔数越小可能乘法越快，取最小者。

---

## 9. 本讲小结

- 核心：把 def 到 use 之间的值尽量放寄存器；同时活跃者不能共用，死后可复用。
- Web（用 union-find 由 def-use 链构造）→ 干涉图（活跃区间重叠连边）→ 图着色（NP 难，用"移除度<N 入栈、回弹着色"启发式）。
- 不够色时溢出（按 spillCost 选，偏好循环内）或拆分（按收益/代价比）；coalescing/pre-coloring/pre-splitting/过程间分配进一步优化。
- SSA 下干涉图为弦图，可多项式最优着色，溢出与着色解耦；实践用 ILP + Belady 启发式。
- 窥孔优化在汇编层清理冗余并套用 xor 清零、红区、lea/cmov、魔数除法等技巧。
