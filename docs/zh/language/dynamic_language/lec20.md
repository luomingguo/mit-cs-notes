---
title: 代码生成 II（Code Generation II）——汇编代码生成与机器模型
course: 6.112 动态计算机语言工程
course_id: '6.112'
lecture: 20
kind: theory
tags: []
status: complete
---
# Lec 20 代码生成 II（Code Generation II）——汇编代码生成与机器模型

> 本讲"把机器摸熟"：x86-64 的内存组织、寄存器与调用约定、栈帧布局、ALU 与指令；如何用**内存汇编器 (in-memory assembler)** 在运行时把字节码翻译成机器码；**线索化代码 (threaded code)** 与逐指令的**未优化代码生成**实战；最后给出写代码生成器的工程准则。

---

## 1. 回顾：上一讲的优化成果

同一段 `fun(y){ x = y - 2; }`，经过暴露 IR + 类型/值分析 + 寄存器分配后，从一大坨 push/pop 塌缩为 7 条左右的紧凑代码：

```asm
call assert_integer
mov %rax, %rdi
call get_integer
mov %rax, %rdi
sub $2, %rdi
call new_integer
ret
```

::: theorem 定理（这段例子的优化收益）
指令数 **26 → 7**；函数调用 3 → 3；内存访问 **14 → 2**。
:::

但要生成这种代码，必须先理解机器。本讲先讲**未优化的直接映射**（先正确，再快）。

---

## 2. 机器模型：CPU/系统四大件

::: definition 定义（CPU/System）
内存 (Memory)、寄存器 (Registers)、算术逻辑单元 (ALU)、控制 (Control)。
:::

### 2.1 内存

::: definition 定义（内存）
**平坦地址空间、按字节寻址**。包含：程序、局部变量、全局变量与数据、栈、堆。
:::

典型布局（从低地址 `0x0` 到高地址 `0xFFFF...FFFF`）：

```text
0x0          Reserved
             Text         ← 指令
             Data         ← 全局/静态变量、常量
             Heap         ← 堆分配数据，向上增长
             ...(Free)...
             Stack        ← 临时数据，向下增长
0xFFFF...    Kernel
```

### 2.2 寄存器（x86-64）

::: definition 定义（寄存器与调用约定 System V AMD64）
- **16 个 64 位通用寄存器**：%rax, %rbx, %rcx, %rdx, %rdi, %rsi, %r8–%r15；栈指针 %rsp、基址指针 %rbp；

- **参数传递**：前 6 个整数/指针参数依次放 `%rdi, %rsi, %rdx, %rcx, %r8, %r9`，其余压栈；

- **返回值**：≤64 位放 `%rax`，更长的经栈返回。
:::

> 这条调用约定是后面所有代码生成的"接口契约"：调用 `assert_integer(v)` 就是把 v 放 `%rdi` 再 `call`；函数返回值从 `%rax` 取。

### 2.3 栈帧布局

::: definition 定义（栈帧 Stack Frame）
`%rbp` 标记当前帧**开始**，`%rsp` 标记当前帧**结束**（栈顶）。从高地址到低地址：

```text
8*n+16(%rbp)  argument n      ← 调用者放入（第7个及以后）
   ...
16(%rbp)      argument 7
8(%rbp)       Return address
0(%rbp)       Previous %rbp
-8(%rbp)      local 0
   ...
-8*m-8(%rbp)  local m
0(%rsp)       Operand Stack   ← 栈顶
```
:::

> 注意：前 6 个参数在寄存器里，第 7 个起才在栈上 `16(%rbp)` 往上；非参数局部变量在 `%rbp` 之下（负偏移）。

### 2.4 ALU 与指令

::: definition 定义（ALU）
执行大部分运算，形如 `OP op1 op2` 或 `OP op1`。操作数三种：**立即数** `$25`、**寄存器** `%rax`、**内存** `4(%rbp)`。

- 算术（add/sub/imul）、逻辑（and/or）、一元（inc/dec）；

- 按宽度分：addb/addw/addl/addq（8/16/32/64 位）；有符号/无符号；浮点用单独 ALU；

- 算术可抛异常：溢出 (overflow)、下溢 (underflow)、除零 (divide-by-zero)。
:::

指令的内存操作受限，移动类指令：

```asm
add -4(%rbp), -8(%rbp)     ; 有限的内存-内存形式
add %r10, -8(%rbp)
mov source, dest           ; reg↔reg / reg↔mem
push source                ; 压栈
pop  dest                  ; 出栈
```

### 2.5 控制（Control）

::: definition 定义（控制单元的取指—译码—执行循环）
指令都在内存里：① 用指令指针**取指**；② **译码**（翻译成微操作 micro-ops）；③ **执行**；④ 指令指针**自增**指向下一条。
:::

---

## 3. 何时/如何编译：内存汇编器

::: definition 定义（In-Memory Assembler）
项目骨架提供内存汇编器（x64asm）：① 在内存里分配缓冲区；② 把指令写进内存；③ 需要时**把函数对象当普通函数调用**。
:::

实际生成代码的 C++：

```cpp
x64asm::Assembler assm;
x64asm::Function  test;
assm.start(test);
assm.xor_(rcx, rcx);
assm.cmp(rcx, rdx);
assm.inc(rcx);
assm.ret();
assm.finish();
...
Frame *frame = ...;
test(frame);          // 直接调用刚生成的机器码
```

> 这就是 JIT 的最小内核：把字节码翻译进可执行内存缓冲，然后通过函数指针跳进去执行。

---

## 4. 线索化代码（Threaded Code）

::: definition 定义（线索化代码）
为每条字节码写一个 C++ 实现函数，然后**按字节码顺序生成一串直线的函数调用**——把解释器循环"展开"掉。即"动态语言的线索化代码"。
:::

为每条指令准备 C++ 实现：

```cpp
void load_const(Frame *f, int32_t index) {
  f->_stack.push(f->_function->_constants[index]);
}
void load_local(Frame *f, int32_t index) {
  f->_stack.push(f->_locals[index]);
}
```

把 `load_local 0; load_const 1; sub; store_local 1; load_const 0; return` 展开为顺序调用（参数按调用约定放 `%rdi`=frame、`%rsi`=index）：

```asm
mov %rdi, %rbp
mov $0, %rsi;  mov %rbp, %rdi;  call load_local
mov $1, %rsi;  mov %rbp, %rdi;  call load_const
mov %rbp, %rdi;  call sub
mov $1, %rsi;  mov %rbp, %rdi;  call store_local
mov $0, %rsi;  mov %rbp, %rdi;  call load_const
mov %rbp, %rdi;  call return
```

::: theorem 定理（线索化代码的收益与下一步）
**消除了解释器循环**（不再有 switch 分发与 `++inst` 的间接跳转），按给定字节码展开。下一步可进一步：**内联**每条指令的实现（省去大量 call）、**直接用机器栈**当操作数栈（硬件加速的栈）。
:::

> 出处：James Bell, *"Threaded Code"*, CACM 1973。

---

## 5. 未优化代码生成（逐指令 by example）

Code Gen v2 要回答的设计问题：**何时/如何编译？参数存哪？局部变量存哪？常量存哪？`sub` 怎么执行？**

::: definition 定义（本例的设计选择——利用机器结构）
- **何时/如何**：用内存汇编器一次性编译；

- **参数**：用寄存器传（前 6 个）；

- **局部变量**：非参数局部放栈上（相对 %rbp）；

- **常量**：随函数分配的数组，地址放 `%r12`；

- **sub**：生成简单 x64 代码（配合 assert_integer/get_integer/new_integer 辅助函数）。
:::

### 5.1 Setup（建帧）

```asm
// 假设 %r12 已含常量数组地址
mov %rsp, %rbp        ; 建帧
sub $8, %rsp          ; 为局部 x 留 8 字节
```

### 5.2 Loads（模拟 VM 操作数栈）

```asm
// load_local 0  —— y 是第 0 个(<6)参数，在寄存器 %rdi
push %rdi
// load_const 1  —— 常量 2 在常量数组偏移 8
mov 8(%r12), %rdx
push %rdx
```

### 5.3 Compute sub（弹两个、查类型、取值、相减、装箱）

```asm
// 弹右操作数 (Value*) 2，检查并取值
pop  %r13
mov  %r13, %rdi;  call assert_integer
mov  %r13, %rdi;  call get_integer;  mov %rax, %r13
// 弹左操作数 y，检查并取值
pop  %r14
mov  %r14, %rdi;  call assert_integer
mov  %r14, %rdi;  call get_integer;  mov %rax, %rdi
// 相减并装箱
sub  %r13, %rdi
call new_integer
push %rax
```

配套 C++ 辅助代码与对象布局：

```cpp
enum class Type : int32_t { Integer = 1, String = 2 };
struct Value   { Type _type; bool is_int(){ return _type==Type::Integer; } };
struct Integer : public Value { int32_t _value; };

void    assert_integer(Value *v) { if (!v->is_int()) exit(1); }
int32_t get_integer(Integer *i)  { return i->_value; }
Value*  new_integer(int32_t v)   { return new Integer(v); }
```

> Integer 的对象布局是 `[_type | _value]`（如 0x100 处 `_value`、0x104 处 `_type`）。**小心**：有虚函数/多继承时布局会复杂得多（参见 vishalchovatiya 的 C++ 对象内存布局文章）。

### 5.4 Store / Load(None) / Return

```asm
// store_local 1  —— 把栈顶存入局部 x
pop %rdx
mov %rdx, -8(%rbp)
// load_const 0   —— None 在常量数组偏移 0
mov 0(%r12), %rdx
push %rdx
// return —— 返回值在 %rax
pop %rax
```

::: theorem 定理（未优化代码生成达成了什么）
- 消除解释器循环（线索化）；

- **内联每条指令的实现**，省掉大量 call 开销；

- **用机器栈**当操作数栈——视作硬件加速的栈，通常更快（取决于原栈数据结构实现）。
:::

---

## 6. 优化各阶段的汇编对照（贯穿例子）

slides 把同一段代码在各阶段的汇编并排展示，指令/内存数逐级下降：

| 阶段 | 指令数 | 内存访问 |
|------|--------|----------|
| Original / Unoptimized | 25 | 12 |
| Exposed IR Ops（拆 + dup） | 24 | 18 |
| Type & Value Analysis | 13 | 9 栈 + 1 对象 |
| Register Allocation | 7 | 2 栈 + 2 对象 |

- **类型分析**：删掉对常量 2 的 `assert_integer`；
- **值分析**：`get_integer 2`（直接 `push $2`）→ 融合成 `sub_int32_const 2`；
- **栈缓存**：所有临时走 `%r13`，但"为什么这么多 mov？"——因为固定寄存器仍需来回搬；
- **寄存器分配**：消除多余 mov（y 已在 rdi、返回值在 rax），代码最短。

剩下还能做的（"What's left? Lots!"）：更一般的寄存器分配、抽象解释/数据流优化（特化、常量折叠 `1+2⇒3`、强度削减 `x/2⇒x>>1`）、标签指针（避免内存访问）。

---

## 7. 写代码生成器的工程准则

::: definition 定义（Guidelines for the code generator）
- **先做最简单甚至最笨的事**：生成 `0 + 1*x + 0*y` 也无妨，代码难看没关系，交给优化器去改进；

- **写 sanity/一致性检查并常用**；

- 记住**优化在后面**——把优化留给优化器，但要预想优化器需要什么（寄存器分配、代数化简、常量传播），据此组织代码结构；

- 建好**测试基础设施**：回归测试；出 bug 的输入就变成回归用例；

- 学好**找 bug 的方法**：二分查找、delta debugging；

- 用静态编译器探索汇编模式：`gcc -g -S t.c` 看它怎么翻译（也可用 Godbolt）。
:::

---

## 8. 与 Crafting Interpreters 的对应（参考补充）

- 书的 clox 是字节码**解释器**，不生成机器码；本讲超出书的范围，进入真正的**汇编代码生成 / JIT**。
- 但书的**第 24 章 Calls and Functions**（调用帧、参数传递）与本讲的栈帧/调用约定对应；**第 14–15 章**的操作数栈对应这里"用机器栈模拟操作数栈"。
- 想深入机器码生成与调用约定，可读 index.md 推荐的《Engineering a Compiler》及 x64 cheat sheet、Agner Fog 延迟表。

---

## 9. 本讲小结

- 机器模型：平坦字节寻址内存（Text/Data/Heap/Stack）、16 个 64 位寄存器、**System V 调用约定**（前 6 参数入 rdi/rsi/rdx/rcx/r8/r9，返回值 rax）、`%rbp/%rsp` 界定栈帧、ALU 按宽度运算可抛异常、控制单元取指—译码—执行。
- **内存汇编器**把字节码写进可执行内存再当函数调用——JIT 的内核。
- **线索化代码**展开解释器循环为顺序函数调用；进一步**内联 + 用机器栈**得到未优化但可工作的代码生成。
- 未优化代码生成的设计选择：参数走寄存器、非参局部上栈、常量数组挂 %r12、sub 配辅助函数装/拆箱。
- 同一例子在 暴露 IR→类型/值分析→栈缓存→寄存器分配 各阶段汇编逐级变短。
- 工程准则：先笨后快、勤加检查、为优化器预留结构、建回归测试、用 gcc -S/Godbolt 学汇编。
- 下一讲（L21）进入**寄存器分配 I** 的算法细节。
