---
title: 低级虚拟机 I（Low-Level Virtual Machines I）——从 AST 解释器到字节码 VM
type: lecture
lecture: 15
tags: []
status: complete
---
# Lec 15 低级虚拟机 I（Low-Level Virtual Machines I）——从 AST 解释器到字节码 VM

> 进入 Phase 4。本讲回答两个问题：**为什么**要用虚拟机（而不是直接解释 AST），以及 VM 的**组织结构**（代码 / 栈 / 堆）。以 MITScript 的字节码 VM 为主线，对照 Crafting Interpreters 第 14~15 章。

---

## 0. 课程版图与本讲定位

整个 MITScript 项目自上而下分为五个阶段：

| 阶段 | 主题 | 对应理论 |
|------|------|----------|
| Phase 1 | Parser（解析器） | 形式文法与解析理论（L2–L5） |
| Phase 2 | Interpreter（解释器） | 程序语义（L6–L11） |
| Phase 3 | Garbage Collector（垃圾回收） | 内存管理（L12–L14） |
| **Phase 4** | **Execution Organization（执行组织）** | **语法制导翻译（L15 起）** |
| Phase 5 | Code Generation & Optimization（代码生成与优化） | 效率（L18 起） |

本讲开始把"程序怎么运行"从**递归遍历 AST**转向**在一台抽象机器上执行指令**。

::: definition 定义（虚拟机的两个层次）
- **语言（"What"）**：语法 + 语义，描述"程序是什么、应得到什么结果"。

- **虚拟机（"How"）**：描述"怎么算出来"。包含

- **指令集 (Instruction Set)**：每条指令做一个单一操作；

- **执行组织 (Execution Organization)**：代码、栈、堆的布局；

- **托管运行时 (Managed Runtime)**：数据类型的表示 + 垃圾回收。

最终再往下还有**机器码 (Machine Code)**：也有自己的指令集和执行组织（段、栈、页）。
:::

层级图：`Language → High-Level VM → Low-Level VM → Machine Code`。本讲聚焦 **High-Level VM**（字节码层）。

---

## 1. 从源代码到字节码：一个例子

源程序：

```text
f = fun(y) {
    x = y + 2;
};
f(1);
```

编译后得到**两个 function 对象**（嵌套函数也是一个独立的 function）：

外层（顶层）函数：

```text
function {
  functions  = [ <内层函数> ],
  constants  = [None, 0, 1],
  names      = [f],
  instructions = [
    load_const 1     # 压入常量 1
    load_func  0     # 压入内层函数
    alloc_closure    # 用函数 + 自由变量做出闭包
    store_global 0   # 存到全局 f
    load_global  0   # 读 f
    load_const   2   # 压入实参 1（constants[2]）
    call 1           # 调用，1 个参数
    pop              # 丢弃返回值
    load_const 0     # None
    return
  ]
}
```

内层函数 `fun(y){ x = y + 2; }`：

```text
function {
  local_vars = [y, x],
  constants  = [None, 2],
  instructions = [
    load_local 0     # 读 y
    load_const 1     # 压入 2
    add              # y + 2
    store_local 1    # 存到 x
    load_const 0     # None
    return
  ]
}
```

> 关键观察：**变量名在编译期就被换成了索引**——`y`→局部槽 0，`x`→局部槽 1，全局 `f`→names[0]。运行时不再需要按名字查找，只按下标存取。

---

## 2. 为什么不直接解释 AST？

### 2.1 递归解释器（Recursive / Tree-Walking Interpreter）

Phase 2 的解释器长这样——语义即递归推理规则，几乎逐条映射成递归函数：

```cpp
class Binop : public Expr {
  enum BINOP { PLUS, SUB, MUL, DIV };
  BINOP op;
  Expr *left, *right;
};

int eval_binop(Frame *f, Binop *e) {
  switch (e->op) {
    case PLUS: return eval_plus(f, e);
    case SUB : return eval_sub (f, e);
    case MUL : return eval_mul (f, e);
    case DIV : return eval_div (f, e);
  }
}
int eval_plus(Frame *f, Binop *e) {
  int n1 = eval_expr(f, e->left);
  int n2 = eval_expr(f, e->right);
  return n1 + n2;
}
```

::: definition 定义（递归解释器的优缺点）
**优点：**语义是递归推理规则，"很容易"直接映射成递归解释器；实现与语义一一对应（非结构化控制流稍乱，但基本贴合）。

**缺点（很慢！）：**

- 解释器在不停地**遍历一个庞大的数据结构（AST）**；

- 深层递归调用开销很高；

- 一句简单的 `x = 2+2` 可能要执行成千上万条机器指令。
:::

### 2.2 动态语言更慢：一次加法的真实代价

在 C 里 `x = y + 2`（假设 y 在寄存器 r1，x 在 r2）：

```asm
mov $r2, 2
add $r2, $r1   ; y + 2
```

两条指令搞定。但在**动态语言**里同一句要做：

1. 检查 `y` 的值是什么类型；
2. 从 `y` 的值对象里取出整数值；
3. 为常量 `2` 分配一个值对象；
4. 检查 `2` 的值对象的类型；
5. 取出 `2` 的整数值；
6. 为 `y + 2` 的结果**分配一个新的整数值对象**；
7. 让 `x` 指向那个新对象。

> 这就是动态类型的"税"：装箱（boxing）、类型检查、内存分配。后续优化（拆箱、类型特化、内联缓存）都在和这条清单作斗争。

### 2.3 翻译的连续层级

同一个 `fun(y){ x = y+2; }` 在不同层级的样子：

- **字节码 VM**（上面的 instructions）；
- **中间表示 IR**（带 SSA 风味的伪指令）：

```text
function __function_1 (y) {
  %x = alloca int64_t
  %0 = %y
  %1 = 2
  %2 = add %0 %1
  store %x %2
  %3 = 0
  return %3
}
```

- **机器码**（x86-64 风格）：

```asm
__function_1:
  sub  8, %rsp
  mov  %rsp, %rbp
  mov  (%rbp,2,8), %rax
  mov  2, %rcx
  add  %rcx, %rax
  mov  %rax, (%rbp)
  mov  0, %rax
  ret
```

越往下越贴近硬件，但也越难做与机器无关的分析。

---

## 3. 为什么用虚拟机？（VM 的价值）

::: theorem 定理（Virtual Machine: Why?）
- **更快**：解释字节码比遍历原始 AST 快得多（指令紧凑、线性、无需指针追逐）；

- **抽象层 / 可移植**：在代码与硬件之间插一层抽象，同一份字节码可跑在任意微处理器上；

- **一次性优化机会**：可在这一层做**与机器无关**的分析与优化，且只做一次——例如类型检查消除、死代码消除、代数化简；

- **更易编译到机器码**：相对 AST，从字节码/IR 生成机器码要容易得多。
:::

> 历史注脚：Java 字节码当年的卖点正是"平台中立"——机顶盒等嵌入式设备处理器五花八门（成本/性能/体积各异），字节码能跑在任意微处理器上是成功关键。P-code（1960s）是最早的字节码虚拟机思想；LLVM 更像是**编译器中间表示**而非可执行 VM。

---

## 4. VM 的执行组织：代码、栈、堆

::: definition 定义（三大区域）
- **代码 (Code)**：指令、函数、元数据（constants / names / functions 列表）。**只读、静态**。

- **栈 (Stack)**：每次函数调用一个**帧 (Frame)**，帧内含：

- **Locals**：局部变量槽；

- **IP（Instruction Pointer）**：当前指令指针；

- **Operand Stack（操作数栈）**：指令的临时计算栈。

- **堆 (Heap)**：关联数组式存储 + **Globals（全局变量）**；闭包、Record 等对象都分配在这里。
:::

> 这是一台**基于栈的虚拟机 (stack-based VM)**：指令不写寄存器号，而是隐式地从操作数栈弹出输入、把结果压回栈。Python VM、JVM 都是这种风格。

### 4.1 逐指令走一遍（Python 风格示意）

以 `f = fun(y){x=y+2;}; f(1);` 为例，顶层函数执行轨迹（IP 从 0 走到 9）：

| IP | 指令 | 操作数栈/状态变化 |
|----|------|------------------|
| 0 | `load_const 1` | 压入常量 1 |
| 1 | `load_func 0` | 压入内层函数对象 |
| 2 | `alloc_closure` | 弹出函数→在堆上建 `Closure{f:…}`，压回闭包 |
| 3 | `store_global 0` | 弹出闭包→存入 Globals 的 `f` |
| 4 | `load_global 0` | 读 `f` 压栈 |
| 5 | `load_const 2` | 压入实参 1 |
| 6 | `call 1` | **新建一个帧**：把实参绑到被调函数的 Locals（`y:1, x:Uninit`），IP 归 0 |
| — | （进入内层）`load_local 0`→`load_const 1`→`add`→`store_local 1`→`load_const 0`→`return` | 算出 `x=3`，返回 None，**弹出帧** |
| 7 | `pop` | 丢弃返回值 None |
| 8 | `load_const 0` | 压入 None |
| 9 | `return` | 顶层返回 |

> 注意 `call` 的语义：它**压一个新帧**到调用栈，新帧有自己独立的 Locals / IP / Op Stack；`return` 把帧弹掉、把返回值留给调用者的操作数栈。这正是"显式控制流"。

---

## 5. 指令集的规格写法

MITScript 用注释精确规定每条指令的**操作数**与**栈效应**。几个代表：

```text
// load_const i —— 把常量压栈
// Operand 0: 常量在所属函数 constants 列表中的下标
// Stack: S => S :: f.constants()[i]
LoadConst

// load_func i —— 把函数压栈
// Stack: S => S :: f.functions()[i]
LoadFunc

// load_local i —— 读局部变量压栈
// Stack: S => S :: value_of(f.local_vars[i])
LoadLocal

// store_local i —— 把栈顶存入局部变量
// Operand 0: 目标局部变量下标
// Stack: S :: v => S
StoreLocal

// add（sub/mul/div 同理）—— 二元运算，语义同 Assignment #2
// Stack: S :: a :: b => S :: op(a, b)
Add
```

::: definition 定义（栈式指令集的一般特征）
- **显式寻址存储**：globals、locals 各有对应的存取指令（load/store_global、load/store_local）；

- 每条**简单指令只做一个操作**；

- **显式控制流**：通过 call/return 和跳转（jump，下一讲）实现。
:::

> 记法约定：`S :: x` 表示栈 S 顶上再压一个 x；二元运算从栈顶弹两个、压一个结果回去。

---

## 6. 现实世界的实现版图

同一张"Language → HL VM → LL VM → Machine Code"的图上，各语言走法不同：

- **Java**：`Java → JVM 字节码（HL VM）`，再 JIT 到 x86/ARM/SPARC/PowerPC；
- **Python**：`Python → Python VM 字节码`，多为解释执行；
- **Swift**：`Swift → SIL（HL）→ LLVM IR（LL/MC）→ 机器码`；
- **C/C++ (Clang)**：`→ LLVM IR → 机器码`；**gcc**：`→ GIMPLE(HL) → GIMPLE(LL, SSA) → 机器码`；
- **JavaScript**：解释 + JIT；
- **Ethereum**：`→ EVM 字节码`。

> 要点：**HL VM 偏可移植与分析，LL VM/IR（如 LLVM、SSA 形式的 GIMPLE）偏优化与代码生成**。我们的 MITScript 也会经历同样的下沉过程。

---

## 7. 与 Crafting Interpreters 的对应（参考补充）

- **第 14 章 Chunks of Bytecode**：定义 `Chunk`（指令 + 常量池）、操作码编码、行号信息——对应本讲的"代码区/元数据"。
- **第 15 章 A Virtual Machine**：实现 `vm.run()` 解释循环、操作数栈 push/pop、二元运算——对应本讲的"操作数栈 + 逐指令执行"。
- 书中强调 bytecode VM 相对 tree-walking 的两大动机正是本讲 §2–§3：**更紧凑/更快** 与 **更易做后续编译**。
- MITScript 与书的差异：书里是单 Chunk 的简化模型，MITScript 显式区分 function 对象、locals/globals、闭包分配，更接近 Python/JVM 的真实组织。

---

## 8. 本讲小结

- **AST 递归解释器**贴合语义但慢：不断遍历大数据结构、深递归开销大；动态语言更要为每次运算付出类型检查 + 装箱 + 分配的代价。
- **虚拟机**用线性字节码替代树遍历，带来四大好处：更快、可移植抽象层、一次性机器无关优化、更易编译到机器码。
- VM 的执行组织 = **代码（只读指令/元数据）+ 栈（每调用一帧：Locals/IP/操作数栈）+ 堆（Globals 与对象）**；MITScript 是**基于栈**的 VM。
- 编译期把变量名换成**索引**，运行时按下标存取；`call`/`return` 显式压弹帧实现控制流。
- 实现版图：HL VM 偏移植与分析，LL VM/IR 偏优化与代码生成。下一讲（L16）继续低级 VM：跳转/分支与更完整的指令语义。
