# L18：代码生成 I（Code Generation I）——为什么要编译到机器码

> 进入 Phase 5。本讲讲**动机**：解释字节码到底慢在哪、性能问题的三类来源、以及把字节码"部分求值/特化"为机器码能省下多少（指令数从上千降到 9）。并梳理**何时编译**（静态 / AOT / JIT / 自适应）。

---

## 1. 翻译的连续层级（回顾）

`Language → High-Level VM → Low-Level VM → Machine Code`。同一个 `fun(y){ x = y - 2; }`：

字节码：

```
load_local 0    load_const 1
sub             store_local 1
load_const 0    return
```

IR（带 alloca 的 SSA 风格）：

```
function __function_1 (y) {
  %x = alloca int64_t
  %2 = sub %y 2
  store %x %2
  return 0
}
```

机器码（x86-64）：

```asm
__function_1:
  sub  8, %rsp        ; 开栈帧
  mov  %rsp, %rbp
  mov  (%rbp,2,8), %rax
  mov  2, %rcx
  sub  %rcx, %rax
  mov  %rax, (%rbp)
  mov  0, %rax
  ret
```

**为什么要往下走？一个字：性能 (Performance)。**

---

## 2. 翻译任务的本质矛盾

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Language ↔ Machine 的鸿沟）</strong>
<table>
<tr><th>语言侧</th><th>机器侧</th></tr>
<tr><td>资源无限（任意多变量/临时值）</td><td>资源有限（寄存器、CPU、ALU 数量固定）</td></tr>
<tr><td>没有性能规格说明</td><td>对性能极度敏感</td></tr>
</table>
代码生成的任务就是把"无限资源、无性能约束"的语言，映射到"有限资源、性能敏感"的机器上。
</div>

### 2.1 性能问题的三大来源

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（性能问题来源）</strong>
<ul>
<li><strong>实现 (Implementation)</strong>：实现方式太朴素（如解释器循环本身的开销）；</li>
<li><strong>语言/抽象 (Language/Abstraction)</strong>：语言本身强制了一个非最优的抽象——动态语言到处要类型检查、对象 shape 还会变；</li>
<li><strong>机器限制 (Machine Limitations)</strong>：已经把机器能力用到极限了（这是"好问题"）。</li>
</ul>
前两类是我们能优化的，第三类是物理上限。
</div>

---

## 3. 你的解释器（多半长这样）

```cpp
void interpret(Function *func) {
  Frame f = ...; OperandStack s;
  Instruction* inst = func->instructions().begin();
  while (inst != func->instructions().end()) {
    switch (inst->operation()) {
      case Operation::LoadLocal:
        s.push(f.locals[inst->operand0]); break;
      case Operation::LoadConst:
        s.push(f.constants[inst->operand0]); break;
      case Operation::Sub: {
        Integer* op2 = s.pop_int();
        Integer* op1 = s.pop_int();
        auto* result = new Integer(op1->value - op2->value);
        s.push(result); break;
      }
      ...
    }
    ++inst;
  }
}
```

这段代码里藏着三类典型性能问题。

### 3.1 解释器循环（实现问题）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>问题（数据依赖的控制流）</strong>
<ul>
<li><strong>问题</strong>：控制流依赖于操作码（switch 的分发）；</li>
<li><strong>症状</strong>：在<strong>流水线处理器</strong>上性能差——每条字节码执行完后，下一条取哪儿不确定，<strong>分支预测失败、流水线停顿</strong>，直到地址解析出来；</li>
<li><strong>解法</strong>：对控制流做<strong>部分求值</strong>，消除集中式分发跳转 → <strong>线索化代码 (Threaded Code)</strong>。</li>
</ul>
</div>

### 3.2 操作数栈（语言/抽象问题：栈式 VM）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>问题（临时值进内存）</strong>
<ul>
<li><strong>问题</strong>：中间结果都存到（内存里的）操作数栈；</li>
<li><strong>症状</strong>：内存慢，而片上寄存器明明可用却没用上；</li>
<li><strong>解法</strong>：用寄存器存临时值 → <strong>栈缓存 (Stack Caching)</strong>（本质是寄存器分配）。</li>
</ul>
</div>

### 3.3 装箱值（语言问题）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>问题（值是堆对象）</strong>
<ul>
<li><strong>问题</strong>：整数、布尔等都是对象（<code>new Integer(...)</code>）；</li>
<li><strong>症状</strong>：大量内存访问与内存分配，极慢；</li>
<li><strong>解法</strong>：<strong>拆箱 (Unbox)</strong> 整数（配合标签指针 tagged pointers）。</li>
</ul>
</div>

---

## 4. 部分求值：把字节码"摊平"成直线代码

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（部分求值 Partial Evaluation）</strong>
针对<strong>静态已知的信息</strong>特化代码（一种通用技术）。这里：操作码、操作数下标在编译期都已知，于是可以把解释器循环"展开"成针对这段字节码的专用函数，<strong>消除 switch 分发</strong>。
</div>

对上面的 `load_local 0; load_const 1; sub; store_local 1; load_const 0; return`，部分求值出专用函数：

```cpp
void execute_0() {
  Frame f = ...;
  push(f.locals[0]);
  push(f.constants[1]);
  Integer* op2 = pop_int(stack);
  Integer* op1 = pop_int(stack);
  auto* result = new Integer(op1->value - op2->value);
  push(result);
  Value* op3 = pop(stack); f.locals[1] = op3;
  push(f.constants[0]);
  return pop(stack);
}
```

没有 switch、没有 `++inst` 的间接跳转了。但**这还不够**——还有栈操作和装箱。继续优化（栈缓存 + 拆箱 + 标签指针）后，整个东西塌缩成 9 条机器指令：

```asm
__execute_0:
  push %rdi
  call assert_integer    ; 类型检查
  pop  %rdi
  mov  %rdi, %rax
  shr  $3, %rax          ; 拆箱（去掉低位标签）
  mov  $2, %rcx
  sub  %rcx, %rax        ; 真正的减法
  shl  $3, %rax
  or   $1, %rax          ; 重新装箱（打标签）
  ret
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（优化收益，对这段代码）</strong>
<ul>
<li>指令数：<strong>&gt;1000s → 9</strong></li>
<li>函数调用：<strong>10s → 1</strong></li>
<li>内存访问：<strong>100s → 2</strong></li>
<li>内存分配：<strong>&gt;1 → 0</strong></li>
</ul>
</div>

---

## 5. "怎么做"：用到的多种优化

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（关键优化技术）</strong>
<ul>
<li><strong>栈缓存 (Stack Caching)</strong> ≈ 寄存器分配：临时值尽量放寄存器而非栈；</li>
<li><strong>标签指针 (Tagged Pointers)</strong>：把小整数等直接编码进指针的低位，避免堆访问（运行时表示优化）；</li>
<li><strong>抽象解释 / 基于数据的优化</strong>：
  <ul>
  <li><strong>特化 (Specialization)</strong>：已知 x、y 都是整数时，<code>x + y</code> 直接用算术指令、跳过类型检查；</li>
  <li><strong>常量折叠 (Constant Folding)</strong>：<code>1 + 2 ⇒ 3</code>；</li>
  <li><strong>强度削减 (Strength Reduction)</strong>：<code>x / 2 ⇒ x &gt;&gt; 1</code>。</li>
  </ul>
</li>
</ul>
</div>

---

## 6. 何时编译？（When）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（编译时机分类）</strong>
<ul>
<li><strong>静态 (Static)</strong>：部署前就把应用编译好（C/C++/Fortran）；</li>
<li><strong>动态 (Dynamic)</strong>：
  <ul>
  <li><strong>提前编译 AOT (Ahead-of-Time)</strong>：分发中间表示，<strong>加载时</strong>编译；</li>
  <li><strong>即时编译 JIT (Just-in-Time)</strong>：按需编译——某个块/函数/模块只有在<strong>真要执行时</strong>才编译；</li>
  <li><strong>自适应 / 剖析驱动 (Adaptive / Profile-Driven)</strong>：先解释执行一次或多次，<strong>收集热点信息后再编译</strong>。</li>
  </ul>
</li>
</ul>
</div>

### 6.1 不同语言的选择

- **"裸金属"语言（C/C++/Fortran）**：选静态编译求**可预测性能**；平台已知，代码可含平台特定优化。
- **现代语言**：用各种形式的**动态编译**——
  - 分发的中间表示设计成**可移植**；
  - 需在**代码体积**与**编译时间**间权衡（编出的机器码通常很大，不适合 Web 场景）；
  - 开发循环要紧凑，不想等编译；增量 AOT 很难做对。

> 实现版图（同 L15 的图）：Java→JVM→JIT；Swift→SIL→LLVM；Python→Python VM；JS→解释+JIT；C/C++→LLVM/GIMPLE→机器码。

---

## 7. 接下来两讲的路线

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（后续安排）</strong>
<ul>
<li><strong>未优化代码生成</strong>：把 VM 表示<strong>直接映射</strong>到机器表示。目标——<strong>熟悉机器</strong>（L20）；</li>
<li><strong>高级代码生成</strong>：先生成可做<strong>静态分析</strong>的中间表示，再据分析做更高效的代码生成（L19 优化、L21–L22 寄存器分配、L23–L24 静态分析）。</li>
</ul>
</div>

---

## 8. 延伸阅读（slides 列出）

- Bell, *"Threaded Code"*, CACM 1973（线索化代码）。
- Ertl, *"Stack Caching for Interpreters"*, EuroForth 1994；Ertl & Gregg, *"The Structure and Performance of Efficient Interpreters"*, 2003。
- *"Let's Build Tagged Pointers"*（mikeash 博客）。
- Chambers, Ungar, Lee, *"An Efficient Implementation of SELF…"*, 1991（原型语言的动态类型高效实现、特化思想的源头）。

参考书对应：**Crafting Interpreters 第 30 章 Optimization**（NaN-boxing 即标签指针、哈希表加速）正是本讲拆箱/标签指针/特化的实战。

---

## 9. 本讲小结

- 往机器码下沉只为一件事：**性能**。性能问题来自实现、语言抽象、机器限制三处，前两者可优化。
- 朴素解释器的三大病灶：**分发跳转停流水线**（→线索化代码）、**临时值进内存栈**（→栈缓存/寄存器）、**值装箱**（→拆箱+标签指针）。
- **部分求值**把字节码特化成直线机器码，配合拆箱/特化，一段减法从上千指令塌缩到 9 条、零分配。
- 常用优化：栈缓存、标签指针、特化、常量折叠、强度削减。
- 编译时机谱系：静态 / AOT / JIT / 自适应；裸金属语言求可预测性走静态，现代语言走动态编译并权衡码体积与编译时间。
- 下一讲（L19）正式讲**优化**：在 IR 上做静态分析驱动的变换。
