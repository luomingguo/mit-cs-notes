---
title: 寄存器分配 I（Register Allocation I）——活跃性分析、死代码消除与活跃区间
type: lecture
lecture: 21
tags: []
status: complete
---
# Lec 21 寄存器分配 I（Register Allocation I）——活跃性分析、死代码消除与活跃区间

> 寄存器分配的两讲共用一份 slides《Register Allocation (+ Liveness, Dead Code Elimination)》。本讲（L21）打地基：从**栈式 IR 转三地址码**，做**常量传播 / 死代码消除**，并用**活跃性分析 (liveness analysis)** 这一数据流分析支撑它们；最后引出**活跃区间 (live range / live interval)** 与寄存器分配问题的形式化。算法（线性扫描、图着色）放到 L22。

---

## 1. 回顾：为什么需要寄存器分配

上一讲的"栈缓存"版本把每个栈位死板地绑到固定寄存器 `r13`，结果满屏都是 `mov %r13 %rdi` / `mov %rax %r13`——**"为什么这么多 mov？"** 因为固定映射不会利用"值本来就在某个寄存器"的事实。

对比寄存器分配后的版本（y 已在 rdi、返回值要在 rax）：

```asm
// rdi = load_local 0  (y 已在 rdi → 空操作)
call assert_integer;  mov %rax, %rdi
call get_integer;     mov %rax, %rdi
sub $2, %rdi;  call new_integer    // rax = ...
// return rax
```

> 目标：**尽量把变量保存在寄存器里**，减少内存读写与总内存占用。要回答两个问题：变量放哪个寄存器？寄存器不够时怎么办？

---

## 2. 栈式 IR → 三地址码（Three-Address Code / RTL）

::: definition 定义（IR 操作数三类 + 三地址码）
操作数：**常量**、**真实寄存器** r1,r2,…（受 ISA 限制有限）、**虚拟寄存器/临时值** t1,t2,…（无限）。指令是三地址码：`&lt;r|t&gt; = op &lt;operand&gt; &lt;operand&gt;`。
:::

把栈式指令转 3AC：每条压栈对应"定义一个新临时值"，每次弹栈对应"读某临时值"。模拟抽象栈，栈位 ↔ 临时名：

```text
load_local 0          t1 = load_local 0
assert_integer    →   t2 = assert_integer t1
get_integer           t3 = get_integer t2
sub_int32_const 2     t4 = sub_int32 t3 2
return                return t4
```

> 这一步把"隐式的栈数据流"变成"显式的命名数据流"，后续所有数据流分析（常量传播、活跃性）都建立在 3AC 上。延伸阅读：Shi/Gregg/Beatty/Ertl《Virtual Machine Showdown: Stack vs Registers》比较两种 VM 规格在表示大小、性能、可做的翻译/优化（复制传播、死代码消除）上的差异。

---

## 3. 常量传播与死代码消除（3AC 上的版本）

### 3.1 常量传播（Constant Propagation）

把"加载常量"得到的临时值，用其已知常量值替换后续使用：

```text
t4 = load_const 1        t4 = 2
t5 = get_integer t4   →  t5 = get_integer 2
t6 = sub_int32 t3 t5     t6 = sub_int32 t3 2
```

`t4`、`t5` 一旦被常量替换，其使用点都不再引用它们。

### 3.2 死代码消除（Dead Code Elimination）

::: definition 定义（死代码）
若某定义计算出的值**之后不再被使用（不活跃 / dead）**，则该定义是死代码，可删除。
:::

常量传播后，`t4` 与 `t5` 都不再活跃 → 删除：

```text
t1 = load_local 0
t2 = assert_integer t1
t3 = get_integer t2
t6 = sub_int32 t3 2     # 直接用常量 2
return
```

> 要判断"之后是否还被使用"，需要一个能回答"某点哪些变量还活着"的分析——活跃性分析。

---

## 4. 活跃性分析（Liveness Analysis）

::: definition 定义（活跃 Live / 死 Dead）
变量 `v` 在程序点 `p` **活跃**，当且仅当：

- 从 p 出发的**某条路径上 v 被使用**，且

- 在该使用之前路径上**没有对 v 的重新定义**。

反之 v 在 p **死**：从 p 到出口的**任何路径都不再使用 v**，或所有路径在使用前都重定义了 v。
:::

::: definition 定义（活跃性分析的用途）
- **死代码消除**；

- 计算变量间的**干涉 (interference / webs)**，为寄存器分配服务。
:::

### 4.1 概念：从出口反向模拟

::: theorem 定理（活跃性是后向数据流分析）
"未来是否被用"是关于**后继**的性质，所以从 CFG 的**出口出发、反向**传播，自基本块尾向首计算活跃信息。
:::

### 4.2 用位向量表示

例子（变量顺序 `a b c x y t`，假设 a,b,c 方法外可见→出口活跃，x,y,z,t 不可见）：

```text
a = x+y;
t = a;
c = a+x;
x == 0
b = t+z;    c = y+1;
```

每个点的活跃集合用位向量表示，如 `1 1 0 0 1 0 0` 表示 `{a, b, y}` 活跃。反向沿 CFG 传播即可得到每点的位向量。

### 4.3 数据流框架

::: definition 定义（活跃性作为数据流问题）
- **事实 (Facts)**：位向量（变量集合）；其格是标准布尔格 / 超立方体 P = {000,…,111}；

- **转移函数**：用 `DEF`（块内定义的变量）与 `USE`（块内"向上暴露使用"的变量）；

- **汇合算子 (Join)**：并集 (union)。
:::

::: definition 定义（每个基本块的四个集合）
- **IN**：块入口处活跃的变量集合；

- **OUT**：块出口处活跃的变量集合；

- **USE**：块内"向上暴露使用"的变量（在被本块重定义前就被读）；

- **DEF**：块内被定义的变量。

例：`USE[x = z; x = x+1;] = {z}`；`DEF[x=z; x=x+1; y=1;] = {x, y}`。编译器扫描每个基本块求出 USE 与 DEF。
:::

数据流方程（后向、并集）：

```text
OUT[n] = ⋃_{s ∈ succ(n)} IN[s]
IN[n]  = USE[n] ∪ (OUT[n] − DEF[n])
```

### 4.4 工作表算法（Worklist）

```text
for all n in N − {Exit}:  IN[n] = ∅
OUT[Exit] = ∅;  IN[Exit] = use[Exit]
Changed = N − {Exit}
while Changed ≠ ∅:
    choose n in Changed;  Changed −= {n}
    OUT[n] = ⋃_{s ∈ succ(n)} IN[s]
    IN[n]  = use[n] ∪ (out[n] − def[n])
    if IN[n] changed:
        for all p in pred(n):  Changed ∪= {p}
```

> 这是经典的不动点迭代：反复套用方程直到所有 IN/OUT 稳定。L23–L24 会把它一般化为通用数据流/格分析框架。

---

## 5. 寄存器分配问题的形式化

::: definition 定义（寄存器分配）
把变量分配到寄存器、并管理数据进出寄存器的过程。物理机寄存器很少（amd64 有 16 个通用寄存器 + 若干专用）。
:::

### 5.1 两大挑战

::: example 挑战
- **寄存器稀缺**：IR 变量常远多于寄存器，必须尽量复用——放不下就**溢出 (spill)** 到内存；

- **寄存器复杂**：x86 某些指令结果必须落在特定寄存器；多数架构有些寄存器需**跨函数调用保留 (callee-saved)**。
:::

### 5.2 寄存器一致性

::: definition 定义（Register Consistency）
- 在每个程序点，每个变量必须位于**唯一**位置——但**不意味着**变量始终在同一位置；

- 若两个变量**从不同时被读**，可分配到**同一寄存器**；

- 在每个程序点，每个寄存器至多保存**一个活跃变量**。
:::

### 5.3 活跃区间（Live Range / Live Interval）

::: definition 定义（活跃区间）
- 变量的 **live range（活跃范围）**：它活跃的那些程序点的集合（由活跃性分析得到）；

- 变量的 **live interval（活跃区间）**：包含其全部活跃范围的**最小连续区间**——比 live range 粗（可能含它实际不活跃的点），但更简单好处理。
:::

### 5.4 例：计算活跃区间

对如下 CFG（含分支），反向传播活跃集合：

```text
{a,b,c,d}  e = d + a
{b,c,e}    f = b + c
{b,e,f}    f = f + b
{e,f}      IfZ e Goto _L0
{e,f}      d = e + f        |   _L0: d = e - f
{d}        Goto _L1         |   {d}
           _L1: g = d
{g}
```

> 反向逐条计算每点活跃集合（如 `g=d` 处 `{g}`→其上 `{d}`→……→入口 `{a,b,c,d}`）。这些区间彼此**重叠**的变量不能共用寄存器——这正是 L22 图着色里"干涉"的来源。

---

## 6. 接下来（L22 预告）

::: definition 定义（目标：两种分配算法）
- **线性扫描 (Linear Scan)** 寄存器分配；

- **图着色 (Graph-Coloring)** 寄存器分配。
:::

并把寄存器分配视为**约束优化问题**：假设 `load_local 0` 的 y 在 rdi，约束（t1/t2/t3 用 rdi、返回 t4 用 rax）下最小化内存访问与寄存器间 mov，得最优分配 t1..t3→rdi、t4→rax。

---

## 7. 与参考资料的对应（补充）

- 活跃性数据流框架出自经典编译原理（slides 注明 Saman Amarasinghe, 6.035；图着色部分 credit CS143@Stanford）。
- index.md 推荐的寄存器分配论文：Chaitin《Register Allocation & Spilling via Graph Coloring》(1982)、Poletto & Sarkar《Linear Scan Register Allocation》、George & Appel《Iterated Register Coalescing》(1996)——分别对应 L22 的图着色、线性扫描、合并优化。
- Crafting Interpreters 不涉及寄存器分配（clox 是栈式字节码解释器），本主题属课程超出书的部分，可读《Engineering a Compiler》。

---

## 8. 本讲小结

- 把**栈式 IR 转三地址码**，让数据流显式化；据此做**常量传播 + 死代码消除**。
- **活跃性分析**：变量 v 在 p 活跃 = 从 p 出发某路径在重定义前用到 v；它是**后向、并集**的数据流问题，用 IN/OUT/USE/DEF 方程 + 工作表算法在 CFG 上求不动点。
- 寄存器分配 = 把变量映射到稀缺寄存器并管理溢出；要点是**寄存器一致性**（每点每变量唯一位置、不同时活跃的变量可共用寄存器）。
- **活跃区间**（live range 的连续化近似）刻画变量何时占用寄存器，重叠的变量不能共用——这是 L22 干涉图的基础。
- 下一讲（L22）：线性扫描 与 图着色 两种分配算法。
