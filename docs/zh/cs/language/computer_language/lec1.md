---
title: 编译器概览（Overview of Compilation）
type: lecture
lecture: 1
tags: []
status: complete
---
# Lec 01 编译器概览（Overview of Compilation）

> 对应课程：MIT 6.1100 / 6.035 Computer Language Engineering
> 配套复习课：R1（课程信息）、R2（递归下降分析器，主体在 L3）
> 参考：Cooper et al., *Engineering a Compiler*, Ch.1

---

## 0. 课程与项目结构（R1 补充）

整个课程围绕一个**从零搭建编译器**的项目展开（"Blank page project"），分为五个阶段（Five Segments），每个阶段先发项目说明，再上 2–5 节课，然后给设计文档/检查点时间，最后提交。

::: definition 定义（编译器的五个项目阶段）
- **Phase 1**：Scanner / Parser（词法 + 语法分析）——*个人*项目

- **Phase 2**：IR and Semantic Checks（中间表示 + 语义检查）

- **Phase 3**：x86 Code Generator（代码生成）

- **Phase 4**：Dataflow Analysis（数据流分析）

- **Phase 5**：Register Allocation + Optimizations（寄存器分配 + 优化，最终提交）

Phase 2–5 为 3–4 人小组项目；可接受语言为 Java / Scala / Rust / TypeScript。
:::

协作政策：可以和任何人讨论，但**代码必须自己写**；使用专门的编译器构造库前需问 TA。

---

## 1. 什么是编译器（What a Compiler Does）

编译器 (*compiler*) 做的是**翻译 (translation)**：

- **输入**：高级编程语言（high-level programming language）
- **输出**：低级汇编/机器指令（low-level assembly instructions）

翻译可分解为四步：
1. 读入并**理解**程序（read and understand）
2. **精确判定**程序要求执行的动作（determine what actions it requires）
3. 设计**如何忠实地实现**这些动作（figure out how to faithfully carry out）
4. 指挥机器执行这些动作（instruct the computer）

### 1.1 输入语言的抽象模型

标准命令式语言（Java / C / C++）由两部分构成：

- **状态 (state)**：变量（variables）、结构体（structures）、数组（arrays）
- **计算 (computation)**：表达式（算术/逻辑）、赋值语句、控制流（条件、循环）、过程（procedures）

### 1.2 输出机器的抽象模型

- **状态**：寄存器（registers）+ 扁平地址空间的内存（flat address space memory）
- **机器码（load/store 架构）**：load/store 指令、寄存器上的算术/逻辑运算、分支指令（branch）

> **核心张力**：源语言有"命名的、结构化的"状态与"嵌套的、抽象的"计算；目标机器只有寄存器、线性内存和跳转。编译器的全部工作，就是把前者**降级 (lower)** 到后者。

---

## 2. 为什么学编译器（Why Study Compilers?）

- 编译器让我们用高级语言而非机器指令编程，带来可塑性（malleability）、可移植性（portability）、模块化（modularity）、简洁性（simplicity）、程序员生产力（productivity），同时还要保证效率与性能（efficiency & performance）。
- 它是程序员不可或缺的生产力工具，也是**最复杂的软件系统之一**。

### 2.1 编译器触及的 CS 领域

| 领域 | 涉及内容 |
|------|----------|
| 理论 (Theory) | 有限状态自动机、文法与解析、数据流 |
| 算法 (Algorithms) | 图操作、动态规划 |
| 数据结构 (Data structures) | 符号表、抽象语法树 |
| 系统 (Systems) | 分配与命名、多趟系统、编译器构造 |
| 计算机体系结构 | 存储层级、指令选择、互锁与延迟、并行 |
| 安全 (Security) | 漏洞检测与防护 |
| 软件工程 | 开发环境、调试 |
| 人工智能 (AI) | 基于启发式搜索的最优优化 |

> 这正是编译器课"重"的原因：它是 CS 各分支的一次集中练兵。

---

## 3. 编译流程的五个阶段（The Pipeline）

按项目阶段，编译可拆为：

```text
源程序
  │  ① 词法 + 语法分析 (Lexical & Syntax Analysis)   → 语法树 / Token 流
  ▼
  │  ② 语义分析 (Semantic Analysis)                 → 类型检查、符号表、IR
  ▼
  │  ③ 代码生成 (Code Generation)                   → x86 汇编
  ▼
  │  ④ 数据流分析 (Dataflow Analysis)               → 分析信息
  ▼
  │  ⑤ 优化 + 寄存器分配 (Optimization & RegAlloc)  → 优化后的汇编
  ▼
目标程序
```

前两阶段合称**前端 (front-end)**，理解程序；后三阶段（尤其④⑤）属**后端/中端 (back-end / middle-end)**，关注生成与优化。

---

## 4. 优化实战：`sumcalc` 案例（贯穿全课的引子）

下面这个例子是整门课的"广告"：同一段 C 代码，未优化与优化后在内层循环的指令数与执行时间差异巨大。它预演了后续多讲的优化技术。

源程序：

```c
int sumcalc(int a, int b, int N) {
    int i, x, y;
    x = 0;
    y = 0;
    for (i = 0; i <= N; i++) {
        x = x + (4*a/b)*i + (i+1)*(i+1);
        x = x + b*y;
    }
    return x;
}
```

下面逐步施加经典优化（每一步都是一道"看代码怎么变"的例题）。

::: example 例题（优化变换逐步推演）
**① 常量传播 (Constant Propagation)**：`y` 被赋值 `0` 且循环内未被修改，故 `b*y` → `b*0`。

**② 代数化简 (Algebraic Simplification)**：`b*0` → `0`，于是 `x = x + 0` → `x = x`。

**③ 复制传播 (Copy Propagation)**：`x = x` 是恒等赋值，整条语句删除。

**④ 公共子表达式消除 (Common Subexpression Elimination, CSE)**：`(i+1)*(i+1)` 中 `i+1` 算两次，提取 `t = i+1`，写成 `t*t`。

**⑤ 死代码消除 (Dead Code Elimination)**：`y` 已无任何使用，删除变量 `y` 及其赋值。

**⑥ 循环不变式外提 (Loop Invariant Code Motion)**：`4*a/b` 在循环内不变，提到循环外 `u = (4*a/b)`。

**⑦ 强度削弱 (Strength Reduction)**：`u*i` 用累加器 `v`（每次循环 `v = v + u`）替代乘法；`4*a` 用移位 `a<<2` 替代乘法。
:::

优化后程序：

```c
int sumcalc(int a, int b, int N) {
    int i, x, t, u, v;
    x = 0;
    u = ((a<<2)/b);
    v = 0;
    for (i = 0; i <= N; i++) {
        t = i+1;
        x = x + v + t*t;
        v = v + u;
    }
    return x;
}
```

最后再做**寄存器分配 (Register Allocation)**：把 `X, t, u, v, i` 等局部变量从栈帧（fp 相对地址）搬进物理寄存器（如 `%r8d=X, %r9d=t, %r10d=u, %ebx=v, %ecx=i`），消除大量 load/store。

### 4.1 量化收益

::: theorem 定理（优化的实测效果，内层循环指令数）
未优化：`10·mov + 5·lea + 5·add/inc + 4·div/mul + 5·cmp/br/jmp = 29` 条指令，执行时间 **43 秒**。

优化后：`4·mov + 2·lea + 1·add/inc + 3·div/mul + 2·cmp/br/jmp = 12` 条指令，执行时间 **17 秒**。

即指令数减少约 $1 - \frac{12}{29} \approx 59\%$，时间约 $1 - \frac{17}{43} \approx 60\%$。
:::

> 关键洞察：绝大部分收益来自**内层循环**——这是后续"循环优化"专讲存在的理由。

---

## 5. 编译器的优化目标维度（Optimize For…）

编译器并不只为"快"。优化可针对多个互相权衡的目标：

- 性能 / 速度（Performance / Speed）
- 代码体积（Code Size）
- 功耗（Power Consumption）
- 编译速度本身（Fast / Efficient Compilation）
- 安全 / 可靠性（Security / Reliability）
- 可调试性（Debugging）

> 不同场景下目标不同（嵌入式重体积与功耗，调试构建重可调试性），这决定了优化是一组**可配置的策略**而非单一目标。

---

## 6. 本讲小结

- 编译器 = 把"高级语言的抽象状态与计算"忠实降级为"机器的寄存器、内存与跳转"。
- 标准流程：词法/语法 → 语义 → 代码生成 → 数据流分析 → 优化/寄存器分配。
- `sumcalc` 案例预演了贯穿全课的优化技术族（常量/复制传播、代数化简、CSE、死代码、循环不变外提、强度削弱、寄存器分配），收益主要落在内层循环。
- 优化是多目标权衡，"优化"≠"只优化速度"。
