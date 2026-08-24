---
title: 6.112 动态计算机语言工程
course: 6.112 动态计算机语言工程
course_id: '6.112'
kind: theory
tags: []
status: complete
---
# 6.112 动态计算机语言工程

*Dynamic Computer Language Engineering*

https://6112-fa25.github.io/lectures

## 课程介绍

### 先行课程

6.004 Computation Structures

6.031 Elements of Software Construction

### 课程描述

本课程研究现代动态编程语言的设计与实现。内容包括：解析技术、语义与解释执行、虚拟机、垃圾回收、即时（JIT）机器码生成以及优化等基础方法。课程还包含一个贯穿整个学期的小组项目，要求实现一个涵盖上述各个方面的虚拟机。

Michael Carbin

### 相关资料

#### 参考书

本课程没有指定必读教材，但如果你希望有一本参考书，我们认为下面这本很不错。

- Robert Nystrom，《Crafting Interpreters》，Genever Benning，2021
  - 本书第二部分的大部分内容对应课程的第 1、2 阶段；第三部分的大部分内容对应第 3、4、5 阶段。本书中的概念与本课程高度相关。

你也可以参考以下教材（尤其适合对 JIT 编译感兴趣的同学）：

- Cooper, Keith D., 和 Torczon, Linda，《Engineering a Compiler》（第 3 版），Morgan Kaufmann，2022。 一本理解现代编译器的优秀参考书，涵盖了本课程中涉及的许多优化技术（如数据流分析、指令调度、寄存器分配），以及一些现代编译器中的高级技术（如静态单赋值 SSA）。
- A. W. Appel 和 J. Palsberg，《Modern Compiler Implementation in Java》，Cambridge University Press，2002。一部经典教材，带你完成一个编译器项目，代码结构设计非常清晰。内容上与 Cooper 等人的书类似。又称 “Tiger Book”，还有 C 语言版和 ML 语言版。
- Aho, Alfred V. 等，《Compilers: Principles, Techniques, & Tools》（第 2 版），Pearson Addison-Wesley，2007。一本非常厚、非常经典的编译器参考书，主要讲如何为类 C 语言（如 Decaf）实现优化编译器。 又称 “Dragon Book”，几乎所有人都听说过。

#### 参考资料

1. 完整的 [Intel x64 manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html) —— 官方 PDF 文档，包含所有详细内容
2. [x86 and amd64 指令参考](https://www.felixcloutier.com/x86/) — 由 Félix Cloutier 基于 Intel 手册整理的可浏览指令手册
3. [x86 wiki](https://en.wikibooks.org/wiki/X86_Assembly/X86_Instructions) — 介绍 x86 指令工作原理的优秀入门资料
4. [x64 cheat sheet](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf) — 来自布朗大学 CS033 课程，包含寄存器和汇编指令的列表与表格
5. [Agner Fog’s optimization page](https://agner.org/optimize/) — 个非常实用的参考资源，包含如何对 x86-64 代码进行优化的手册，尤其推荐查看其中的延迟（latency）表 [latency tables](https://agner.org/optimize/instruction_tables.pdf).
6. [Godbolt](https://godbolt.org/) — 可以输入 C 代码，并查看不同编译器（如 gcc、clang）生成的逐行汇编代码，非常适合理解高级代码如何翻译为汇编

#### 其他

**博客**

- [Russ Cox’s Blog](http://research.swtch.com/) —— 他是 Go 语言的开发者之一，写了很多很有深度的文章
- [Matt Might’s Blog](http://matt.might.net/articles/) —— 犹他大学教授，写过不少有意思的文章（比如 “Yacc 已死”）
- [Ralf’s Ramblings](https://www.ralfj.de/blog/) —— Ralf 写了很多流行博客，主要探讨 C++、Rust 这类系统语言背后的复杂性
- [Embedded in Academia](https://blog.regehr.org/) —— 类似，也是讲系统和编程语言的一些深入内容

**寄存器分配**

- 《[Register Allocation & Spilling via Graph Coloring](http://dl.acm.org/citation.cfm?id=806984)》（图着色的寄存器分配与溢出）—— Gregory J. Chaitin，1982 年。一篇非常经典而且不长的论文，讲最基础的寄存器分配方法
- [Linear Scan Register Allocation](https://dl.acm.org/citation.cfm?id=330250)
-  [Iterated Register Coalescing](http://dl.acm.org/citation.cfm?id=229546)—— Lal George，1996 年。这篇论文是在 Chaitin 方法上的改进/替代。如果你觉得 Chaitin（或 Briggs 改进）不够用，这篇值得读；其实即使够用，也值得读，因为它很好地解释了各种权衡

**垃圾回收**

- [V8 Garbage Collection](https://v8.dev/blog/high-performance-cpp-gc) —— 介绍 V8（Chrome 使用的 JavaScript 引擎）中高性能垃圾回收的实现
- [Understanding OCaml’s Garbage Collector](https://dev.realworldocaml.org/garbage-collector.html) —— 虽然 OCaml 是 AOT（提前编译）的语言，但它用了增量式、分代垃圾回收机制，这点很值得学习。

**其他**

- [B3 JIT Compilation](https://webkit.org/blog/5852/introducing-the-b3-jit-compiler/)
- [SpiderMonkey](https://firefox-source-docs.mozilla.org/js/index.html) —— Firefox 使用的 JavaScript 引擎

### 相关课程

1. [EPFL’s Advanced Compiler Design course](https://cs420.epfl.ch/archive/21/index.html). 这是 [6.1100 Computer Language Engineering](https://student.mit.edu/catalog/m6a.html#6.1100).的姐妹课程
2. [6.S050 Programming Language Design (Spring 2023)](https://people.csail.mit.edu/feser/pld-s23/index.html)
3. [6.5110 (or 6.820) Foundations of Program Analysis](https://student.mit.edu/catalog/m6a.html#6.5110)
4. [6.5120(or 6.822)Formal Reasoning About Programs](https://frap.csail.mit.edu/main)

### 项目

#### 词法分析与语法分析

**扫描器（Scanner）**以源文件作为输入， 通过称为**词法分析**的过程输出一个 token 序列。 一个 token 可以是符号（比如 \* 或 \{）、关键字（比如 if 或 while）、标识符（比如 foo）或字面量（比如 42、None、"hello"）。

- 非 token 的内容（比如空白字符或注释）会被丢弃。

- 非法 token（例如未结束的字符串字面量）必须被报告。

**解析器（parser）** 以 token 序列作为输入，并检查它们是否符合语言规范。
 要通过检查，输入必须满足语法规则，例如括号匹配、分号正确等解析器的输出是用户定义结构或者是语法树（syntax tree / AST）

语言规范描述的是语言的具体语法，你需要把它拆分成词法分析规范和语法分析规范，然后用 C++ 实现一个手写的扫描器和递归下降解析器。允许使用词法分析生成器（如 ANTLR4），但不允许使用语法分析生成器（如 ANTLR4 的 parser 生成部分）。也可以自己实现 parser combinator 库。

#### 解释器

在这一阶段，你需要为 MITScript 实现一个解释器。它接收 MITScript 程序及其输入，然后执行程序并产生正确的结果。这个任务要求你正确理解并实现 MITScript 的语义，比如函数参数的求值顺序。

虽然你的程序在语法上是正确的，但仍可能包含一些非上下文无关的语义错误。例如表达式 5 / "hello" 在语法上没有问题，但没有明确的语义含义。因此解释器不仅要执行合法程序，还要检查并报告语义错误。

这一阶段会让你全面理解 MITScript 的语义。必须认真完成这一部分，因为它能帮助你在后续阶段把精力集中在性能优化上，而不是继续纠结语义细节。

#### 垃圾回收

在这一阶段，你们需要实现一个垃圾回收器，并将其集成到第四阶段的虚拟机中。在此之前，我们并没有规定解释器应该如何为 MITScript 程序中的数据结构分配内存，因此你的实现可能会消耗大量内存，甚至发生泄漏。

你需要通过实现垃圾回收器来解决这个问题。垃圾回收器包含一组分配函数，用于分配运行时对象，以及一组回收函数，用于定期扫描程序的堆内存并识别可以释放的无用内存。

#### 低级别虚拟机

在这一阶段，你们需要实现一个编译器，将 MITScript 转换为字节码表示，同时实现一个虚拟机来执行这些字节码。虚拟机提供一个低层次、与语言无关的计算抽象，它接收由函数组成的程序，其中一个函数作为入口点。每个函数包含一组字节码指令，这些指令通过操作数栈进行计算。例如 MITScript 语句 x = 2 + y 会被翻译为如下字节码：

load_const 2  # 将常量 2 压入栈
 load_local 0  # 读取变量 y 并压入栈
 add            # 弹出两个值相加并压入结果
 store_local 1  # 将结果存入 x

你将学习如何把高级语言转换为低级机器可执行表示，同时理解低层抽象的设计和性能如何影响高层语言的设计。

#### 代码生成和性能优化

最后一阶段是一个开放性很强的阶段。在这一阶段，你们的任务是尽可能高效地实现 MITScript 程序，使其运行时间最短。

可以做的优化非常多，例如数据流优化（常量传播、公共子表达式消除、复制传播）、运行时表示优化（更高效的记录结构或基本类型拆箱）、代码生成优化（寄存器分配、窥孔优化）、甚至即时编译（运行时特化）。你们可以自由探索虚拟机优化的各种方法。

为了帮助你们决定优化方向，会提供一个基准测试集合。你们需要分析这些程序，甚至可以手工优化它们，从而判断哪些优化最有价值。报告需要清楚说明你是如何分析这些程序并选择优化方案的。

这一阶段会有多个提交节点，包括一个 milestone 和若干 checkpoint，用来确保你们尽早开始。更多细节会在第五阶段说明中给出。

最后一节课是“虚拟机对抗赛”，你们的虚拟机将与其他组竞争，看谁生成的代码最快。比赛使用的程序会在比赛前一天公布，这样你们可以调试系统，但禁止针对该程序做任何专门的 hack 优化。

*Prof.Michael Carbin*

# Lec 1 课程总览

[lec1.md](./lec1.md)

# Lec 2 词法分析

此项任务被称为扫描（scanning）或者是词法分析（lexing）。

任何编译器或解释器的第一步都是扫描。扫描器会将原始源代码（字符序列）作为输入，并把它分组成一系列我们称为“token”（词元）的片段。这些就是构成语言语法的、有意义的“单词”和“标点符号”。

对我们来说，从扫描开始也是一个不错的起点，因为这部分代码并不复杂——本质上就是一个“自我感觉很强大”的 switch 语句。它可以作为一个很好的热身。

在本章结束时，我们将拥有一个功能完整且高效的扫描器，它可以接收任意一段 源代码字符串，并生成一系列 token，这些 token 会在下一章被传递给解析器（parser）使用。

[lec2.md](./lec2.md)

# Lec 3 语法分析 I

# Lec 4 语法分析 II

[lec4.md](./lec4.md)

# Lec 5 语法分析 III

# Lec 6 语义（导论）

[lec6.md](./lec6.md)

# Lec 7 语义（IMP）

[lec7.md](./lec7.md)

# Lec 8 语义（堆与布尔值）

[lec8.md](./lec8.md)

# Lec 9 语义（作用域）

# Lec 10 语义（闭包 I）

# Lec 11 语义（闭包 II）

# Lec 12 垃圾回收 I

# Lec 13 垃圾回收 II

# Lec 14 垃圾回收 III

# Lec 15 低级虚拟机 I

# Lec 16 低级虚拟机 II

# Lec 17 低级虚拟机 III

# Lec 18 代码生成 I

# Lec 19 优化

# Lec 20 代码生成 II

# Lec 21 寄存器分配 I

# Lec 22 寄存器分配 II

# Lec 23 静态分析 I

# Lec 24 静态分析 II
