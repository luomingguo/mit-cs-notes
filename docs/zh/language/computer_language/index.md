---
title: 6.1100 计算机语言工程
course: 6.1100 计算机语言工程
course_id: '6.1100'
kind: theory
tags: []
status: complete
---
# 6.1100 计算机语言工程

[spring 2025](https://6110-sp25.github.io/syllabus)

## 先行条件

6.1020/6.031 Software Construction

6.1903 Introduction to Low-level Programming in C and Assembly

6.1910/6.004 Computation Structures

## 课程描述

分析与实现高级编程语言相关的问题。编译器的基本概念、功能和结构。理论与实践的互动。使用工具构建软件。包括一个关于编译器设计和实现项目。

教职工
- Martin Rinard
- Michael Carbin

## 资源

### 推荐教材

这门课没有必备教材，但如果你坚持，我们认为这是一本不错的参考教材：

**Cooper， Keith D.， 和 Torczon， Linda，《[Engineering a Compiler](https://shop.elsevier.com/books/engineering-a-compiler/cooper/978-0-12-815412-0)》，第3版，Morgan Kaufmann，2022 年**

- 一本帮助理解现代编译器的新型参考教材。涵盖本课程中提到的许多优化内容（如数据流、指令调度、寄存器分配），以及现代编译器中常见的一些高级优化（如[静态单赋值（SSA）](https://en.wikipedia.org/wiki/Static_single-assignment_form)）。

你可能感兴趣的其他编译器教材：

- 虎书： 一本经典之作。引导你完成一个有深度的代码组织编译器项目。
- 龙书： 这是一篇非常非常厚重的经典参考文献，讲述为类 C 语言（例如 Decaf）编写优化编译器的过程。
- 鲸书：全面涵盖高级编译器优化。
- 《Lisp in Small Pieces》, 1996： 这是一本非常酷的书，从零开始构建*了多个*解释器，展示了语言设计选择之间的相互作用。
- 《Crafting Interpretres》, 2021：我们对想学习编译器一般知识的人（即本课程之外）的默认推荐。

### 参考文献

你会发现这些参考文献对编写编译器很有帮助。

1. 完整的 [Intel x64 manual](http://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-manual-325462.pdf)——包含所有细节的官方PDF。
2. [x86 和 amd64 指令参考](https://www.felixcloutier.com/x86/)——由 Félix Cloutier 根据英特尔手册导出的可导航参考
3. [x86 维基](https://en.wikibooks.org/wiki/X86_Assembly/X86_Instructions) — 关于 x86 指令工作原理的好入门介绍
4. [x64 速查表](https://cs.brown.edu/courses/cs033/docs/guides/x64_cheatsheet.pdf)——布朗大学CS033中详细介绍寄存器和汇编命令的列表和表格
5. [Agner Fog 的优化页面](https://agner.org/optimize/)——这是一个非常有用的参考页面，里面有关于如何优化x86-64代码的手册。特别是，看看[指令表](https://agner.org/optimize/instruction_tables.pdf)。
6. [Godbolt](https://godbolt.org/) —— 允许你输入 C 代码，并提供各种编译器（如 gcc 和 clang）的逐行汇编输出，非常有用，有助于了解如何将某些操作转换为汇编。

### 工具

1. Shell
   1. [The Missing Semester of Your CS Education](https://missing.csail.mit.edu/2020/) — Learn about the shell and the terminal, then you look like a pro.
2. Scala
   1. [Tour of Scala](https://docs.scala-lang.org/tour/tour-of-scala.html)
   2. [Scala Book](https://docs.scala-lang.org/overviews/scala-book/introduction.html)
   3. [Scala Patterns for Compiler Design](https://gist.github.com/rcoh/4992969)

### 其他灵感来源

**概述**

1. [LLVM compiler architecture](http://www.aosabook.org/en/llvm.html)
2. [GCC compiler architecture](http://en.wikibooks.org/wiki/GNU_C_Compiler_Internals/GNU_C_Compiler_Architecture)

**博客**

1. [Russ Cox 的博客](http://research.swtch.com/)——Russ是Go语言的开发者之一，Go是一种流行语言。
2. [Matt Might 的博客](http://matt.might.net/articles/)——Matt是犹他大学的教授，写过一些非常有趣的文章（例如《Yacc已经死了》）
3. [Ralf 的胡言乱语](https://www.ralfj.de/blog/)——Ralf写了很多热门博客文章，探讨C++和Rust等系统语言背后的复杂性。
4. [学术界的嵌入](https://blog.regehr.org/)——同理。

**论文**

1. [寄存器分配与通过图着色溢出](http://dl.acm.org/citation.cfm?id=806984)——G.J. Chaitin / 1982。关于简单寄存器分配的优秀（简短）论文。
2. [线性扫描寄存器分配](https://dl.acm.org/citation.cfm?id=330250)
3. [《迭代寄存器融合](http://dl.acm.org/citation.cfm?id=229546)》— Lal George / 1996。对柴廷设计提出了改进和替代方案。如果 Chaitin 风格（+/-Briggs）寄存器分配还不够，这篇论文值得一读——实际上，理解权衡本身就很有价值
4. [superword 级 并行性](http://dl.acm.org/citation.cfm?id=358438)结合循环展开，是一种实现向量化编译器的简单方法

**理论**

1. [Order Theory for Computer Scientists](https://matt.might.net/articles/partial-orders/)——Matt Might 关于数据流分析基础的总结。
2. Davey， B. A. 和 H. A. Priestley，[*Introduction to Lattices and Order*](https://doi.org/10.1017/CBO9780511809088)，第二版，剑桥大学出版社，2002年。

## 实验

**1. 扫描器和解析器** 扫描器以 MITScript 源文件作为输入，并扫描其中的标记（token）。标记可以是运算符（例如：“*”或“[”）、关键字（if 或 while）、字面量（14 或 'c'）、字符串（例如“abc”）或标识符。非标记（例如空格或注释）将被丢弃。必须报告错误的标记。 解析器读取标记流，并检查它们是否符合语言规范。为了通过此检查，输入必须包含所有匹配的大括号、分号等。输出可以是用户生成的结构，也可以是简单的解析树，后者需要转换为更易于处理的结构。 我们将提供语言语法，您需要将其拆分为扫描器规范和解析器规范。虽然提供的语法应该与你最终使用的语法非常接近，但你可能需要进行一些修改。你将使用 flex 和 bison 来生成扫描器和解析器。

**2. 解释器** 在这个作业中，你将构建一个 MITScript 解释器，该解释器能够根据给定的 MITScript 程序及其输入执行程序，并生成预期的结果。此作业将包括正确理解和实现 MITScript 的语义——例如函数参数的求值顺序。 虽然你扫描和解析后的程序在语法上是正确的，但程序仍然可能存在一些非上下文无关的语义错误。例如，表达式 5 / “hello” 在语法上是正确的，但其语义含义并不明显。因此，你的解释器不仅要执行有效的 MITScript 程序，还要检查并报告存在语义错误的程序。 本项目将帮助你熟悉 MITScript 语言的完整语义。务必特别关注本项目及其截止日期，因为成功完成本项目将使您深入理解该语言的语义，从而帮助您在项目后期将更多精力集中在设计一个快速编译器上，而不是理解如何正确执行该语言。

**3. 底层虚拟机** 在这个项目中，你们小组将实现：1）一个将 MITScript 编译成字节码的编译器；2）一个字节码解释器——即虚拟机。虚拟机提供了一个底层且与语言无关的计算抽象。虚拟机接受由函数列表组成的程序，其中一个函数被指定为一个入口点。每个函数都包含一个字节码指令列表，这些指令使用操作数栈来操作和计算值。例如，MITScript 语句 `x = 2 + y` 会转换为以下 MITScript 字节码指令序列： > int 2 # 将 2 压入操作数栈 > > load_local 0 # 从内存加载 y 的值并将其放入操作数栈 > > add # 从栈中弹出两个整数，并将它们的和压入栈 > > store_local 1 # 从栈顶弹出值并存储到 x 中 在这个项目中，你将学习如何将高级语言翻译成低级、机器可解释的表示形式，并理解低级表示形式中抽象的设计和性能如何与高级语言的设计相互作用并影响其设计。

**4. 垃圾回收** 在这个项目中，你们小组将为虚拟机实现一个垃圾回收器。到目前为止，我们还没有规定你的 MITScript 解释器或字节码解释器应该如何处理与 MITScript 程序中的数据结构对应的内存分配。你的解释器消耗或泄漏大量内存是完全可以理解的。 在这个项目中，你将通过实现一个垃圾回收器来解决这个问题。垃圾回收器包含一组分配例程，用于分配运行时对象；以及一组回收例程，用于定期扫描 MITScript 程序的堆，并识别可以释放的无用内存。 如果你在这个阶段有额外的时间，可以利用这个机会对你的字节码编译器和虚拟机进行维护，以便让下一个项目阶段更容易管理。

**5. 代码生成和优化** 在这个项目中，你们小组将生成 MITScript 程序的 x86-64 汇编代码和字节码。我们将此项目分为两个阶段：1）里程碑阶段，您需要展示可运行但可能未经优化的代码生成功能；2）项目最终版本，您需要展示优化后的代码生成功能。在里程碑阶段，您还需要提交一份文档，说明您计划在第二阶段实施的优化方案和实施策略。 Th

## 相关课程

你可能会发现其他公开课程的讲座幻灯片或笔记很有用，尤其是在项目后期阶段：

- [卡内基梅隆大学的 15-411 编译器设计课程](https://www.cs.cmu.edu/~janh/courses/411/23/schedule.html)。
- [哈佛的 CS153 编译器课程](https://groups.seas.harvard.edu/courses/cs153/2019fa/schedule.html)。

如果你渴望更高级的内容，可以看看这个：

- [康奈尔大学的自导在线高级编译员课程](https://www.cs.cornell.edu/courses/cs6120/2020fa/self-guided/)。

中文课程：

- [中科大 2023 编译器设计 实验代码 GitLab](https://cscourse.ustc.edu.cn/vdir/Gitlab/compiler_staff/2023ustc-jianmu-compiler)

- 湖南大学 编译原理

  - bison, flex, C++, LLVM
  - 词法分析，语法分析，LLVM-IR， 优化

# Lec 1 编译器概览

[lec1.md](./lec1.md)

# Lec 2 正则表达式和上下文无关语法

[lec2.md](./lec2.md)

# Lec 3 自顶向下分析

[lec3.md](./lec3.md)

# Lec 4 中间表示

[lec4.md](./lec4.md)

# Lec 5 语义分析

[lec5.md](./lec5.md)

# Lec 6 代码生成

[lec6.md](./lec6.md)

# Lec 7 程序分析与优化

[lec7.md](./lec7.md)

# Lec 8 数据流分析

[lec8.md](./lec8.md)

# Lec 9 循环优化

[lec9.md](./lec9.md)

# Lec 10 寄存器分配

[lec10.md](./lec10.md)

# Lec 11 并行化

[lec11.md](./lec11.md)

# Lec 12 数据分析基础

[lec12.md](./lec12.md)
