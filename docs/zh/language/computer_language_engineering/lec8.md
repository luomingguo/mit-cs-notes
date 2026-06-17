# Lecture 08：数据流分析（Dataflow Analysis）

> 配套复习课：R9 Phase 4 + GDB 速成（见末节）——数据流分析正是 Phase 4 项目
> 参考：把 L7 基本块内分析推广到**跨基本块、全过程 (global)**

---

## 1. 从基本块到全过程

L7 在基本块内做分析与变换；本讲把它推广到整个过程。三个经典数据流问题贯穿全讲：**到达定义 (Reaching Definitions)**、**可用表达式 (Available Expressions)**、**活跃性 (Liveness)**。

---

## 2. 到达定义（Reaching Definitions）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（定义、使用、到达）</strong>
<code>a = x+y</code> 是对 <code>a</code> 的一个<strong>定义 (definition)</strong>，是对 <code>x、y</code> 的<strong>使用 (use)</strong>。一个定义<strong>到达 (reaches)</strong> 某使用，当且仅当该定义写入的值<strong>可能被该使用读到</strong>。
</div>

### 2.1 用途：常量传播

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（到达定义驱动常量传播）</strong>
对 <code>s = s + a*b</code>：检查变量的所有到达定义。
<ul>
<li><code>a</code>：唯一到达定义 <code>a=4</code> ⟹ 可替换为 <code>s = s + 4*b</code>。</li>
<li><code>b</code>：有两个到达定义（一支 <code>b=1</code>，一支 <code>b=2</code>）⟹ 非常量，<strong>不可</strong>替换。</li>
</ul>
<p><strong>分裂 (splitting)</strong> 可保住汇合处丢失的信息：把汇合后的块按前驱复制，则两份分别可做 <code>a*1</code>、<code>a*2</code> 的常量替换。</p>
</div>

### 2.2 形式化：IN/OUT/GEN/KILL

用**位向量 (bit vector)** 表示定义集合，每个定义占一位。每个基本块有：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（数据流四集合）</strong>
<ul>
<li><strong>IN[b]</strong>：到达块开头的定义集；<strong>OUT[b]</strong>：到达块结尾的定义集；</li>
<li><strong>GEN[b]</strong>：块内生成的定义集；<strong>KILL[b]</strong>：块内杀死的定义集。</li>
</ul>
例：<code>GEN[s=s+a*b; i=i+1;] = 0000011</code>，<code>KILL[...] = 1010000</code>（杀死其他对 s、i 的定义）。
</div>

### 2.3 数据流方程与不动点求解

$$\text{IN}[b] = \bigcup_{p \in \text{pred}(b)} \text{OUT}[p]$$
$$\text{OUT}[b] = (\text{IN}[b] - \text{KILL}[b]) \cup \text{GEN}[b]$$
$$\text{IN}[\text{entry}] = \varnothing$$

得到一个**方程组**，用**不动点算法 (fixed-point algorithm)** + **工作表 (worklist)** 求解：

```
for all n: OUT[n] = ∅
IN[Entry]=∅; OUT[Entry]=GEN[Entry]; Changed = N - {Entry}
while Changed ≠ ∅:
    取 n ∈ Changed; Changed -= {n}
    IN[n] = ⋃_{p∈pred(n)} OUT[p]
    OUT[n] = GEN[n] ∪ (IN[n] - KILL[n])
    if OUT[n] 改变: 把 n 的后继全部加入 Changed
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（算法终止性）</strong>
算法必然停机，因为<strong>转移函数单调 (monotonic)</strong>——增大 IN 则 OUT 不减；位向量上界有限（极限时所有位为 1），故有限步到达不动点。
</div>

> **保守性提醒**：若某位为 0，对应定义**确实从不**到达该块；若为 1，对应定义**未必总**到达（可能某些路径到达即置 1）。即分析是"可能 (may)"语义。

---

## 3. 可用表达式（Available Expressions）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（可用表达式）</strong>
表达式 <code>x+y</code> 在点 <span>$p$</span> <strong>可用</strong>，当且仅当：① 从初始节点到 <span>$p$</span> 的<strong>每条路径</strong>都在到达 <span>$p$</span> 前求过 <code>x+y</code>；② 求值之后、到 <span>$p$</span> 之前，<strong>x、y 都未被重新赋值</strong>。
</div>

可用表达式信息支持**全局 CSE**：若某表达式在使用点可用，无需重新求值（须在所有相关块用**同一个临时变量**）。

### 3.1 与到达定义的对偶（关键区别）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（汇合算子的对偶）</strong>
<ul>
<li><strong>到达定义</strong>：定义只要来自<strong>任一 (ANY)</strong> 前驱就到达 ⟹ 汇合算子是<strong>并 ∪</strong>，OUT 初始化为 <strong>∅</strong>。</li>
<li><strong>可用表达式</strong>：表达式须从<strong>所有 (ALL)</strong> 前驱都可用才可用 ⟹ 汇合算子是<strong>交 ∩</strong>，OUT 初始化为<strong>全集 E</strong>。</li>
</ul>
</div>

方程：

$$\text{IN}[b] = \bigcap_{p \in \text{pred}(b)} \text{OUT}[p], \qquad \text{OUT}[b] = (\text{IN}[b] - \text{KILL}[b]) \cup \text{GEN}[b]$$

求解时把 `OUT[b]` 初始化为全集 `1111`，`IN[entry]=∅`，同样用工作表迭代到不动点。

> 这揭示了**通用数据流框架**：只需把分析器参数化（方向、汇合算子、初值、GEN/KILL/转移函数），**一次构建、处处复用**。

---

## 4. 活跃性分析（Liveness Analysis）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（活跃 / 死）</strong>
变量 <span>$v$</span> 在点 <span>$p$</span> <strong>活跃 (live)</strong>，当且仅当：从 <span>$p$</span> 出发的<strong>某条路径</strong>上有对 <span>$v$</span> 的使用，且使用前路径上没有对 <span>$v$</span> 的定义。反之，若从 <span>$p$</span> 到出口的任何路径都不再使用 <span>$v$</span>（或都在使用前重定义 <span>$v$</span>），则 <span>$v$</span> 在 <span>$p$</span> <strong>死 (dead)</strong>。
</div>

**用途**：寄存器分配（变量死了可重用其寄存器）；死代码消除（删除后续不读的赋值——但**不能删除对外部可见变量的最后一次赋值**，做法是让所有外部可见变量在 CFG 出口处活跃）。

### 4.1 逆向分析

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（活跃性的四集合与方程）</strong>
<ul>
<li><strong>IN[b]</strong>：块开头活跃的变量；<strong>OUT[b]</strong>：块结尾活跃的变量；</li>
<li><strong>USE[b]</strong>：块内"向上暴露使用 (upwards exposed use)"的变量；<strong>DEF[b]</strong>：块内被定义的变量。</li>
</ul>
例：<code>USE[x=z; x=x+1;] = {z}</code>（x 不在 USE，因首次出现是被赋值前的右侧 z；x 在用前已被定义）；<code>DEF[x=z; x=x+1; y=1;] = {x, y}</code>。
方程（<strong>逆向</strong>，沿后继求 OUT）：
$$\text{OUT}[b] = \bigcup_{s \in \text{succ}(b)} \text{IN}[s], \qquad \text{IN}[b] = \text{USE}[b] \cup (\text{OUT}[b] - \text{DEF}[b])$$
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（活跃性驱动 DCE，位向量序 abcxyzt）</strong>
假设 a、b、c 对外可见（出口处活跃），x、y、z、t 不可见。逆向传播活跃位向量；对 <code>t = a;</code> 之类，若 t 在其后不活跃，则该赋值为死代码，删除。
</div>

---

## 5. 三大分析的统一与比较

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（数据流分析的统一框架）</strong>
三者都是"工作表迭代到不动点"，区别仅在四个参数：
<table>
<tr><th>分析</th><th>方向</th><th>汇合算子</th><th>OUT/IN 初值</th><th>配套变换</th></tr>
<tr><td>到达定义</td><td>前向</td><td>∪</td><td>∅</td><td>常量传播</td></tr>
<tr><td>可用表达式</td><td>前向</td><td>∩</td><td>全集 E</td><td>全局 CSE</td></tr>
<tr><td>活跃性</td><td>逆向</td><td>∪</td><td>∅</td><td>死代码消除 / 寄存器分配</td></tr>
</table>
都有"转移函数 + 汇合算子"，框架可推广同时支持前向与逆向。
</div>

### 5.1 块内信息

给定块 IN/OUT 后，还需算块内**每条语句**处的信息——简单传播即可，可视为受限的数据流分析。

### 5.2 乐观 vs. 悲观分析

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（乐观与悲观）</strong>
<ul>
<li><strong>可用表达式是乐观的</strong>（为 CSE）：初始假设所有表达式都可用，分析逐步剔除不可用者；<strong>不能提前停止</strong>用中间结果（中途结果不安全）。</li>
<li><strong>活跃变量是悲观的</strong>（为 DCE）：初始假设所有变量都活跃，分析逐步找出死变量；<strong>可提前停止</strong>用当前结果（当前结果始终安全）。</li>
</ul>
数据流设置相同，乐观/悲观取决于预期用途。
</div>

---

## 6. 补充（R9）：Phase 4 与 GDB 速成

数据流分析正是项目 **Phase 4**。调试生成代码常用 **GDB**：

- 编译带调试信息（汇编/可执行带符号），`gdb ./prog` 启动；
- `break <label/行>` 设断点，`run [args]` 运行，`continue/next/step` 控制；
- `info registers` 看寄存器、`x/8xg $rsp` 检查栈内存、`print $rax` 看返回值寄存器；
- `disassemble` 看当前函数汇编，`stepi/nexti` 单步机器指令——对调试代码生成器尤为关键；
- `backtrace` 看调用栈，配合段错误定位活动记录/调用约定的问题。

---

## 7. 本讲小结

- 把基本块分析推广到全过程：CFG 上每块的 IN/OUT，由 GEN/KILL（或 USE/DEF）经转移函数与汇合算子联立成方程组，工作表迭代到不动点（转移单调保证终止）。
- 三大问题对偶：到达定义（前向、∪、∅）/可用表达式（前向、∩、全集）/活跃性（逆向、∪、∅）。
- 配套变换：常量传播 / 全局 CSE / 死代码消除与寄存器分配。
- 通用框架：参数化方向、汇合算子、初值与转移函数，一次构建处处复用；乐观/悲观取决于用途。
