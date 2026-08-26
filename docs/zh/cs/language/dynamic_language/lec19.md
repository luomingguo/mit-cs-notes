---
title: 优化（Optimizations）——暴露 IR、类型/值分析、栈缓存与寄存器分配
type: lecture
lecture: 19
tags: []
status: complete
---
# Lec 19 优化（Optimizations）——暴露 IR、类型/值分析、栈缓存与寄存器分配

> 本讲是 Phase 5 的核心方法论。主线：把高层指令**拆开 (expose)** 成更细的 IR 操作，让**类型分析**和**值分析（常量传播）**有机会删掉冗余的类型检查与常量加载；再用**栈缓存 / 寄存器分配**把临时值从内存搬到寄存器。贯穿全程的一句话：**IR 是把分析推断出的信息编码进表示的统一载体。**

---

## 1. 今日目标与核心 takeaways

回顾 L18 那个塌缩成 9 条指令的减法例子。今天讲它**怎么**被优化出来。

::: definition 定义（本讲涉及的分析/优化）
- **类型分析 (Type Analysis)**（今日）：尽可能静态确定操作数的**类型**；

- **形状分析 (Shape Analysis)**：尽可能确定操作数的**形状**（如 record `{a:1,b:2}` 的字段集合 `{a,b}`）；

- **值分析 (Value Analysis)**（今日）：尽可能确定操作数的**值**；

- **寄存器分配 — 依赖与活跃性分析**：栈缓存（今日）→ 一般寄存器分配（L21–L22）。
:::

::: theorem 定理（四条 takeaway）
- 关于程序可**推断**的信息很多，都能拿来优化；

- **IR 是把这些信息编码进表示**的方式；

- 从**变换后的程序**直接解释/代码生成，而不是另外携带辅助信息；

- 优化之间会**相互作用、可能要跑多轮**——IR 提供统一编码使之可迭代。
:::

---

## 2. 起点：解释器里的 `sub` 干了什么

朴素 `sub` 辅助函数：

```cpp
Integer* sub(Frame *f) {
  Value *op2 = f->_stack.pop();  assert_integer(op2);
  int32_t v2 = get_integer(static_cast<Integer*>(op2));
  Value *op1 = f->_stack.pop();  assert_integer(op1);
  int32_t v1 = get_integer(static_cast<Integer*>(op1));
  Integer* res = new_integer(v1 - v2);
  f->_stack.push(res);
}
```

它隐含做了四件可拆分的事：**弹栈 → 类型断言 → 取原始整数 → 算 → 装箱 → 压栈**。对常量 `2` 来说，"动态检查 2 是不是整数"显然多余——它编译期就是整数。**怎么去掉？把这些隐含步骤暴露成独立 IR 指令。**

---

## 3. 暴露 IR：新增类型与指令

::: definition 定义（IR 扩展，示意）
**新类型**：`int32`——原始（拆箱）整数，区别于堆上装箱的 `Integer`。

**新指令**（把 sub 拆开）：

- `assert_integer`：弹出参数，检查是否整数，成功则放回；否则失败（exit/异常）；

- `get_integer`：弹出 Integer，压回其 int32 值；**不检查类型**，非 int32 行为未定义；

- `sub_int32`：弹出两个 int32，相减后把 **Integer** 结果压回；不检查类型；

- （后续）`get_integer &lt;constant&gt;`：直接压入某常量的 int32 值；

- （后续）`sub_int32_const &lt;constant&gt;`：弹一个 int32，与常量相减、压回 Integer。
:::

把 `sub` 拆成 `assert_integer; get_integer; ...; sub_int32` 后，原来一条 `sub` 变成一串：

```text
load_local 0
assert_integer
get_integer
load_const 1
assert_integer
get_integer
sub_int32
return
```

> **"这不是更糟了吗？指令更多了？"** 是的——但现在每个原子步骤都**显式**了，分析才有抓手去删掉其中冗余的那些。这是"先暴露、再消除"的套路。

### 3.1 顺便消除 swap：语义、IR、代码生成相互交织

二元运算需要左右操作数顺序，朴素拆法可能引入 `swap`。但**类型错误的抛出顺序在语义里是模糊指定的**（某些场景允许）。利用这点可以生成略不同的代码、**去掉 swap**。

> 要点：**语义、IR、代码生成三者是交织的**——语义留的自由度（如错误顺序）可被代码生成利用。

---

## 4. 类型分析（Type Analysis）

::: definition 定义（类型分析）
一种**静态分析**，用来静态地推理类型。

**核心思想：静态地模拟程序执行**，维护一个"抽象操作数栈"，记录每个栈位上**已知什么、不知什么**。
:::

对上面的指令序列，抽象解释抽象栈的演变（栈格 = 类型而非值）：

| 执行到 | 抽象栈（顶在上） | 备注 |
|--------|------------------|------|
| `load_local 0` | `[?]` | y 的类型未知 |
| `assert_integer` | `[Integer]` | 断言后已知是 Integer |
| `get_integer` | `[int32]` | 拆箱 |
| `load_const 1` | `[Integer, int32]` | 常量 2 是 Integer |
| `assert_integer`（对常量 2） | — | **多余！** 已知是 Integer → 改成 `nop` |
| `get_integer` | `[int32, int32]` | |
| `sub_int32` | `[Integer]` | 结果装箱 |
| `return` | `[]` | |

::: theorem 定理（类型分析的收益）
当抽象栈表明某操作数**类型已知为 Integer** 时，其上的 `assert_integer` 是冗余的，可替换为 `nop`（随后删除）。常量永远类型已知，所以对常量的类型检查总能去掉。
:::

去掉对常量的 `assert_integer` 后：

```text
load_local 0
assert_integer    # y 仍需检查（来自参数，类型未知）
get_integer
load_const 1
get_integer
sub_int32
return
```

对应的机器码（每条 IR 直译，可见仍有大量 push/pop）：

```asm
// load_local 0
push %rdi
// assert_integer
pop %rdi;  call assert_integer;  push %rax
// get_integer
pop %rdi;  call get_integer;     push %rax
// load_const 1
mov 8(%r12), %rdx;  push %rdx
// get_integer
pop %rdi;  call get_integer;     push %rax
// sub
pop %rcx;  pop %rdi;  sub %rcx, %rdi;  call new_integer;  push %rax
// ret
pop %rax
```

---

## 5. 值分析 / 常量传播（Value Analysis / Constant Propagation）

::: definition 定义（值分析）
静态推理**值**的分析。思想同类型分析：静态模拟执行，跟踪哪些值已知、哪些未知。

**精度有多档**：精确值 / 符号（正负零）/ 区间（range）。
:::

常量 `2` 的值编译期就知道——**何必运行时 `load_const` 再 `get_integer`？** 抽象栈跟踪到栈顶是常量 `2` 时：

- 把 `get_integer`（针对常量）替换为 `get_integer 2`（直接压 int32 值 2）；
- 于是 `load_const 1` 变成**死代码**（没人再用它压的那个 Integer）→ 删除。

结果：

```text
load_local 0
assert_integer
get_integer
get_integer 2     # 直接压常量 2 的 int32
sub_int32
return
```

### 5.1 还能更好：折叠进指令

`get_integer 2` 紧接 `sub_int32`，可融合成带常量操作数的指令：

```text
load_local 0
assert_integer
get_integer
sub_int32_const 2    # 弹一个 int32，减常量 2，压回 Integer
return
```

对应辅助函数与机器码：

```cpp
Integer* sub_int32_const(Frame *f, int32_t v2) {
  int32_t v1 = static_cast<int32_t>(f->_stack.pop());
  f->_stack.push(new_integer(v1 - v2));
}
```

```asm
// load_local 0
push %rdi
// assert_integer
pop %rdi;  call assert_integer;  push %rax
// get_integer
pop %rdi;  call get_integer;     push %rax
// sub_int32_const 2
pop %rdi;  sub $2, %rdi;  call new_integer;  push %rax
// return
pop %rax
```

> 这就是 L18 提到的**常量折叠 / 强度削减**类优化的具体落地：值分析把常量信息固化进指令，删掉加载与一次取值。

---

## 6. 机器与存储层级（为什么要用寄存器）

::: definition 定义（CPU/系统组成）
内存 (Memory)、寄存器 (Registers)、算术逻辑单元 (ALU)、控制 (Control)。
:::

::: definition 定义（存储层级 Memory Hierarchy）
用多种存储取长补短：越靠近 CPU 越快越小。

<table>
<tr><th>层级</th><th>容量</th><th>延迟</th></tr>
<tr><td>寄存器</td><td>256B–8KB</td><td>0.25–1 ns</td></tr>
<tr><td>L1 Cache</td><td>16–64KB</td><td>1–5 ns</td></tr>
<tr><td>L2 Cache</td><td>1–4MB</td><td>5–25 ns</td></tr>
<tr><td>主存</td><td>4GB–256GB</td><td>25–100 ns</td></tr>
<tr><td>硬盘</td><td>500GB+</td><td>3–10 ms</td></tr>
<tr><td>网络</td><td>巨大</td><td>10–2000 ms</td></tr>
</table>
:::

> 寄存器比主存快约**两个数量级**。上面机器码里满是 push/pop（访问内存栈），把这些临时值放进寄存器就是下一步优化。

---

## 7. 栈缓存（Stack Caching）

::: definition 定义（栈缓存）
一种**简单形式的寄存器分配**。思想：临时值不放（内存）栈，而**给每个栈位固定指定一个寄存器**。

价值：操作栈贵、寄存器便宜（内存访问即便有好缓存行为也慢）。

挑战：必须生成不同的代码并管理寄存器。
:::

### 7.1 IR 进化为寄存器形式

把"操作数栈位置"显式写成寄存器/三地址码：抽象栈每个位置映射到一个固定寄存器（如栈底位 → `r13`）。指令变成 `dst = op args`：

```text
r13 = load_local 0
r13 = assert_integer r13
r13 = get_integer r13
r13 = sub_int32 r13 2
return r13
```

生成的机器码用 `r13` 贯穿，不再 push/pop 临时值（仅入口/出口保存 `r13`）：

```asm
push %r13
mov %rdi, %r13              ; r13 = load_local 0
mov %r13, %rdi; call assert_integer; mov %rax, %r13
mov %r13, %rdi; call get_integer;    mov %rax, %r13
sub $2, %r13; mov %r13, %rdi; call new_integer; mov %rax, %r13
mov %r13, %rax             ; return r13
pop %r13
```

> 对比 §5.1 满屏 push/pop 的版本，内存访问大幅减少。但栈缓存把每个栈位**死板地**绑到固定寄存器，不够灵活——这引出一般寄存器分配。

---

## 8. 一般寄存器分配（Register Allocation）

::: definition 定义（寄存器分配，作为约束优化问题）
- 给程序中每个值**命名**（虚拟寄存器 / 临时值 t1, t2, …）；

- 收集**约束**：

- **同时活跃**的值必须放**不同寄存器**；

- 某些值必须在**特定寄存器**（如返回值在 `rax`）；

- 可用寄存器**总数有限**。

- **求解优化问题**：在约束下找最佳性能的"名字→寄存器"分配；放不下的值**溢出 (spill)** 到内存。

价值：和栈缓存一样但**通用得多**，原则上能编码任意约束与目标。

挑战：一般情况下**NP 完全**，需启发式。
:::

### 8.1 IR：三地址码 / RTL，引入虚拟寄存器

::: definition 定义（IR 操作数三类）
常量（1,2,…）、**真实寄存器**（r1,r2,… 受 ISA 限制有限）、**虚拟寄存器/临时值**（t1,t2,… 无限多）。指令是简单的**三地址码 (three-address code)** / 寄存器转移语言 (RTL)：`&lt;reg&gt; = op &lt;operand&gt; &lt;operand&gt;`。
:::

先用无限虚拟寄存器命名每个值：

```text
t1 = load_local 0
t2 = assert_integer t1
t3 = get_integer t2
t4 = sub_int32 t3 2
return t4
```

### 8.2 把它当约束优化问题解

::: example 例题（寄存器分配求解）
**假设**：`load_local 0` 的参数 y 在 `rdi`。

**约束**：assert_integer 的 t1 用 rdi；get_integer 的 t2 用 rdi；sub 的 t3 用 rdi；return 的 t4 必须在 rax。

**目标**：最小化内存访问 + 指令数（寄存器到寄存器的 mov）。

**解**：t1→rdi, t2→rdi, t3→rdi, t4→rax。
:::

代入后：

```text
rdi = load_local 0
rdi = assert_integer rdi
rdi = get_integer rdi
rax = sub_int32 rdi 2
return rax
```

机器码（注意 `load_local 0` 因 y 已在 rdi 而**消失**，连入口保存 r13 也省了）：

```asm
// rdi = load_local 0   (y 已在 rdi，空操作)
call assert_integer;  mov %rax, %rdi
call get_integer;     mov %rax, %rdi
sub $2, %rdi;  call new_integer    ; rax = sub_const rdi 2
// return rax
```

> 相比栈缓存版（固定 r13、还要 push/pop r13），这版更短——因为分配器把约束（y 在 rdi、返回值在 rax）一并优化掉了搬运。

### 8.3 MITScript 直线代码的基本生成算法

::: definition 定义（直线 MITScript 的代码生成算法）
- 访问每条语句；

- 按运算顺序访问语句中每个表达式；

- 为表达式结果**分配一个临时值**；

- 递归访问嵌套子表达式，每个返回其临时值；

- 把"对各子临时值施加运算"的结果赋给所分配的临时值；

- 若适用，把右侧的临时值赋给语句左侧；

- **保留控制流图 (CFG)**。
:::

---

## 9. 累积收益（四个阶段对比）

slides 用同一段 `y - 2` 比较四个版本的指令数/内存访问/分配（具体数字 slides 标注"需更新"，趋势如下）：

| 阶段 | 指令数 | 内存访问 | 分配 |
|------|--------|----------|------|
| Original（原始 sub） | 25 | 12 | 1 |
| Exposed IR Ops（拆开） | 24 | 18 | — |
| Type & Constant Analysis | 13 | 9 栈 + 1 对象 | — |
| Register Allocation | 7 | 2 栈 + 2 对象 | — |

> 趋势清楚：**暴露 IR → 类型/值分析删冗余 → 寄存器分配去内存搬运**，指令数与内存访问逐级下降。

延伸阅读：Shi, Gregg, Beatty, Ertl, *"Virtual Machine Showdown: Stack Versus Registers"*（栈式 vs 寄存器式 VM 的对比）。

---

## 10. 与 Crafting Interpreters 的对应（参考补充）

- **第 30 章 Optimization**：NaN-boxing（拆箱/标签）、哈希表加速——对应本讲拆箱与特化。
- 课程比书走得更远：书是单遍编译不做数据流分析；本讲引入**抽象解释式的类型/值分析**与**三地址码 + 寄存器分配**，这是工业 JIT（V8、HotSpot）的标准管线。寄存器分配的算法细节留给 L21–L22，分析框架的形式化留给 L23–L24。

---

## 11. 本讲小结

- 优化套路：**先把高层指令暴露成细粒度 IR 操作**（assert_integer/get_integer/sub_int32），再用分析删冗余。
- **类型分析** = 抽象解释一个"类型栈"，删掉类型已知处的 `assert_integer`（常量必删）。
- **值分析/常量传播** = 抽象解释一个"值栈"，把常量直接折进指令（`get_integer 2`→`sub_int32_const 2`），并删除随之产生的死代码。
- 寄存器比内存快约两个数量级；**栈缓存**把栈位固定映射到寄存器，**一般寄存器分配**把它推广为带约束（同时活跃需异寄存器、特定寄存器、总数有限）的 NP 完全优化问题，用虚拟寄存器 + 三地址码表达。
- **IR 是统一载体**：分析把信息编码进 IR，优化彼此交互、可迭代多轮。
- 下一讲（L20）回到**代码生成 II**：未优化的直接映射，先把机器摸熟。
