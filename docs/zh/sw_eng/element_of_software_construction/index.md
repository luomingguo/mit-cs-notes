---
sidebarDepth: 2
title: 软件构造基础


sidebar: true
aside: right
editLink: true
lastUpdated: true
outline: 2
---


# 6.1020 软件构造基础

## 先行条件

6.101 程序设计基础（Python）

## 课程描述

介绍软件开发的基本原理与技术：如何编写安全可靠、易于理解、便于修改的软件。课程内容包括：规范与不变式；测试、测试用例生成与覆盖率；抽象数据类型与表示独立性；面向对象编程中的设计模式；并发编程，包括消息传递与共享内存并发，以及防止竞态条件与死锁的方法；还包括函数式编程，如不可变数据与高阶函数的使用。

课程包含每周编程练习以及多个分组进行的大型编程项目。

### 参考材料

#### 经典书籍

- Barbara Liskov and John Guttag. 《Program Development in Java: Abstraction, Specification, and Object-Oriented Design》
  - 点评： 与课程内容中关于规范和抽象数据类型的部分非常相似，是一本很好的背景阅读书籍。
- Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides. 《Design Patterns: Elements of Reusable Object-Oriented Software》
  - 点评： 设计模式的奠基之作，涉及解释器、访问者等设计模式，通常被称为“Gang of Four”书。以目录形式组织。
- Martin Fowler. 《Refactoring: Improving the Design of Existing Code, Second Edition》
  - 点评： 讲解如何通过重构技术改善代码设计，使其更加ETU和RFC，同时保持原意。示例使用JavaScript。
- Steve McConnell. 《Code Complete: A Practical Handbook of Software Construction, Second Edition》
  - 点评： 一本厚重但出色的代码质量指南。
- David Thomas and Andrew Hunt. 《The Pragmatic Programmer: Your Journey to Mastery, Second Edition》
  - 点评： 简明、易读、语言无关、永恒的建议，适用于软件工程师。

#### 编程语言

- Joshua Bloch.《Effective Java, Third Edition》 Addison-Wesley, 2017.
- David Herman. 《Effective Java, Third Edition》 Addison-Wesley, 2012.
- Dan Vanderkam.《Effective TypeScript.》 O’Reilly, 2019.

#### 调试技术

- Andreas Zeller. 《Why Programs Fail》
  - 很多调试相关著作的鼻祖
- David Agans. 《Debugging: The Nine Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems》
  - 一本易读且非常实用的调试指南，涵盖了从软件到硬件，再到汽车和水管的各种技术问题。

## Lab

### 软件安装

#### Node.js

Go to the [Node.js Downloads page](https://nodejs.org/en/download/), and then:

- for Windows or macOS: use the Windows or macOS installer
- for Linux: click on “Installing Node.js via package manager” at the bottom of the page, and find the appropriate package for your Linux flavor
  - for Arch Linux: the suggested `nodejs` package is the “Current” version of Node, which is not what you want; [find and install an appropriate `nodejs-lts` package](https://archlinux.org/packages/?q=nodejs-lts) instead

Make sure you install the LTS version of Node, version 20.x.y

#### TypeScript

After installing Node, open your terminal or command prompt, and run:

- for macOS or Linux:

  ```sh
  sudo -H npm install -g typescript
  ```

- for Windows:

  ```sh
  npm install -g typescript
  ```

### 小项目

- [PS0: Turtle Graphics](https://web.mit.edu/6.102/www/sp24/psets/ps0/)
- [PS1: Flashcards](https://web.mit.edu/6.102/www/sp24/psets/ps1/)
- [PS2: Cityscape](https://web.mit.edu/6.102/www/sp24/psets/ps2/)
- [PS3: Memely](https://web.mit.edu/6.102/www/sp24/psets/ps3/)
- [PS4: Memory Scramble](https://web.mit.edu/6.102/www/sp24/psets/ps4/)

### 大项目

[Project: ⭐️⚔️ (mit.edu)](https://web.mit.edu/6.102/www/sp24/projects/starb/)

## 测验

- [Quiz 1](https://web.mit.edu/6.102/www/sp24/quizzes/archive/quiz1.pdf) and [Quiz 1 solutions](https://web.mit.edu/6.102/www/sp24/quizzes/archive/quiz1-solutions.pdf)
- [Quiz 2](https://web.mit.edu/6.102/www/sp24/quizzes/archive/quiz2.pdf) and [Quiz 2 solutions](https://web.mit.edu/6.102/www/sp24/quizzes/archive/quiz2-solutions.pdf)

| **Spring 2023** | [quiz 1](http://web.mit.edu/6.031/www/sp23/quizzes/archive/quiz1.pdf) and [solutions](http://web.mit.edu/6.031/www/sp23/quizzes/archive/quiz1-solutions.pdf) | [quiz 2](http://web.mit.edu/6.031/www/sp23/quizzes/archive/quiz2.pdf) and [solutions](http://web.mit.edu/6.031/www/sp23/quizzes/archive/quiz2-solutions.pdf) |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
|                 | [quiz 1](http://web.mit.edu/6.031/www/sp22/quizzes/archive/quiz1.pdf) and [solutions](http://web.mit.edu/6.031/www/sp22/quizzes/archive/quiz1-solutions.pdf) | [quiz 2](http://web.mit.edu/6.031/www/sp22/quizzes/archive/quiz2.pdf) and [solutions](http://web.mit.edu/6.031/www/sp22/quizzes/archive/quiz2-solutions.pdf) |
| **Fall 2021**   | [quiz 1](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz1.pdf) and [solutions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz1-solutions.pdf) | [quiz 2](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2.pdf) and [solutions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-solutions.pdf) |
| **Spring 2021** | [quiz 1](http://web.mit.edu/6.031/www/sp21/ts/quizzes/archive/quiz1.pdf) and [solutions](http://web.mit.edu/6.031/www/sp21/ts/quizzes/archive/quiz1-solutions.pdf) | [quiz 2](http://web.mit.edu/6.031/www/sp21/ts/quizzes/archive/quiz2.pdf) and [solutions](http://web.mit.edu/6.031/www/sp21/ts/quizzes/archive/quiz2-solutions.pdf) |
| **Fall 2020**   |                                                              | [sample quiz 2 questions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-fa20-ts.pdf) and [solutions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-fa20-ts-solutions.pdf) |
| **Spring 2020** |                                                              | [sample quiz 2 questions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-sp20-ts.pdf) and [solutions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-sp20-ts-solutions.pdf) |
| **Fall 2019**   |                                                              | [sample quiz 2 questions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-fa19-ts.pdf) and [solutions](http://web.mit.edu/6.031/www/fa21/quizzes/archive/quiz2-fa19-ts-solutions.pdf) |



## 课程总览

- [01: Static Checking](https://web.mit.edu/6.102/www/sp24/classes/01-static-checking/)
- [02: Testing](https://web.mit.edu/6.102/www/sp24/classes/02-testing/)
- [03: Code Review](https://web.mit.edu/6.102/www/sp24/classes/03-code-review/)
- [04: Specifications](https://web.mit.edu/6.102/www/sp24/classes/04-specifications/)
- [05: Designing Specifications](https://web.mit.edu/6.102/www/sp24/classes/05-designing-specs/)
- [06: Abstract Data Types](https://web.mit.edu/6.102/www/sp24/classes/06-abstract-data-types/)
- [07: Abstraction Functions & Rep Invariants](https://web.mit.edu/6.102/www/sp24/classes/07-abstraction-functions-rep-invariants/)
- [08: Interfaces & Subtyping](https://web.mit.edu/6.102/www/sp24/classes/08-interfaces-subtyping/)
- [09: Functional Programming](https://web.mit.edu/6.102/www/sp24/classes/09-functional-programming/)
- [10: Equality](https://web.mit.edu/6.102/www/sp24/classes/10-equality/)
- [11: Recursive Data Types](https://web.mit.edu/6.102/www/sp24/classes/11-recursive-data-types/)
- [12: Grammars & Parsing](https://web.mit.edu/6.102/www/sp24/classes/12-grammars-parsing/)
- [13: Debugging](https://web.mit.edu/6.102/www/sp24/classes/13-debugging/)
- [14: Concurrency](https://web.mit.edu/6.102/www/sp24/classes/14-concurrency/)
- [15: Promises](https://web.mit.edu/6.102/www/sp24/classes/15-promises/)
- [16: Mutual Exclusion](https://web.mit.edu/6.102/www/sp24/classes/16-mutual-exclusion/)
- [17: Callbacks & Graphical User Interfaces](https://web.mit.edu/6.102/www/sp24/classes/17-callbacks-guis/)
- [18: Message-Passing & Networking](https://web.mit.edu/6.102/www/sp24/classes/18-message-passing-networking/)
- [19: Little Languages](https://web.mit.edu/6.102/www/sp24/classes/19-little-languages/)

# Lec 0 TypeScript基础

[lec0.md](./lec0.md) 

# Lec 1 静态检查

本节主要讲两个主题：

- 静态类型
- 好的软件的三大性质

以下是静态类型与好的软件的三大性质之间的关系：

- 避免出BUG（Safe from bugs）：静态检查通过在运行前捕捉类型错误和其他 bug，有助于提高程序的安全性。
- 易于理解（Easy to understand）：因为类型在代码中是显式声明的，静态检查有助于提升代码的可理解性。
- 便于修改（Ready for change）：当你修改代码时，静态检查可以指出需要一同更改的其他部分，从而使代码更易于维护和演进。

[lec1.md](./lec1.md)



# Lec 2 测试

测试是一个更广泛过程的一部分，称为验证。验证的目的是揭示程序中的问题，从而增加你对程序正确性的信心。验证包括：

- **对程序的形式化推理(Formal reasoning)，通常称为验证（Verification）**。验证通过构建一个程序正确性的形式证明来实现。手工进行验证非常繁琐，而且自动化工具支持验证仍然是一个活跃的研究领域。然而，程序中的一些小而关键的部分可能会被正式验证，例如操作系统中的调度器、虚拟机中的字节码解释器或操作系统中的文件系统。
- **代码审查**。让其他人仔细阅读你的代码，并对其进行非正式的推理，可以是一种发现错误的好方法。这就像让别人校对你写的文章一样。在另一篇阅读材料中，我们会讨论代码审查。
- **测试**。在精心选择的输入上运行程序并检查结果。

在今天的课程结束后，你应该能够：

- 理解测试的价值，并了解测试优先编程的过程；
- 能够判断测试套件的正确性、全面性和规模；
- 能够通过划分输入空间和选择良好的测试用例来设计函数的测试套件；
- 能够通过测量代码覆盖率来评估测试套件；
- 理解并知道何时使用黑盒测试与白盒测试、单元测试与集成测试，以及自动回归测试。

[lec2.md](./lec2.md)



# Lec 3 代码审查

代码审查是一种对非原作者进行的、有条理且细致的源代码检查。类似对论文进行校对。代码审查的两个目的：1）改进代码——发现错误、预防潜在错误、检查代码清晰度、确保符合项目代码的编码风格；2）改进程序员——程序员相互学习的重要途径，在开源项目中，许多技术交流都发生在代码审查的过程中

为什么代码审查如此流行？在软件开发中，有许多流程方法（如 Agile、Scrum 等），但代码审查是少数被证明确实有效的实践之一。研究者 Hillel Wayne 总结了部分证据：代码审查可发现 70%-90% 的软件缺陷；Google 与 Microsoft 的工程师普遍认为代码审查非常有价值。

若你是 JavaScript 或 TypeScript 新手，可参考：

- *Idiomatic JavaScript*（以可读性著称）
- *Google TypeScript Style Guide*（针对 TypeScript 的规范）



[lec3.md](./lec3.md)

# Lec 4 接口规格

规格（specifications）是团队合作的关键。没有规格，就不可能落实实现函数的责任。规格扮演着契约（contract）的角色： 实现者有责任遵守契约。规格对双方都提出了要求：当规格包含前提条件时，客户也有责任。

我们将探讨**函数规格**所扮演的角色。我们将讨论什么是前提条件和后置条件，以及它们对函数的实现者和客户意味着什么。我们还将讨论如何使用异常，这是一个重要的语言特性，不仅在 TypeScript 中，在 Python、Java 和许多其他现代语言中也都有，它使我们能够使函数接口更安全，免受错误侵害，并且更易于理解。

本节的学习完，你应该能够：

- 理解函数规格中的先决条件与后置条件，并能够编写正确的规格
- 能够根据规格写测试用例
- 理解如何处理异常



[lec4.md](./lec4.md)

# Lec 5 设计规格

在本节阅读中，我们将探讨针对相似行为的不同规格，并讨论它们之间的权衡。 我们将从三个维度来比较规格：

1. 确定性（determinism）：对于给定输入，规格是否只定义了唯一的输出，还是允许一组合法的输出？
2. 声明性（declarativeness）： 规格是只描述结果应该是什么，还是明确说明如何计算结果？
3. 强度（strength）：规格是否限制实现的自由度（即只有少数实现满足），还是允许更多实现方式？

并非所有模块的规格都同样有用，我们将探讨是什么使得某些规格比其他规格更好。

本节的目标：

- 理解“非确定性规格”，并能识别与分析那些结果不唯一的规格；
- 理解“声明式（declarative）”与“操作式（operational）”规格的区别，并能编写声明式规格；
- 理解规格中的前置条件、后置条件与规格强度的概念，并能比较不同规格的强弱；
- 能够编写连贯、有用且强度合适的规格说明。



[lec5.md](./lec5.md)

# Lec 6 抽象数据类型

这节介绍两个概念：

- 抽象数据类型
- 表示独立

## 介绍

抽象数据类型，能够将程序中数据结构的使用方式和数据结构本身的具体形式区分开来，解决了一个非常危险的问题：客户端会对类型的内部表示做出假设。我们将了解这种假设危险性以及如何避免。还将讨论操作的分类，以及一些良好抽象数据类型的设计原则

[lec6.md](./lec6.md)

# Lec 7 抽象函数 & 表示不变式 

今天的阅读介绍了几个概念：

- 不变式（invariants）
- 表示暴露（representation exposure）
- 抽象函数（abstraction functions）
- 表示不变式（representation invariants）

在本节内容中，我们将以更形式化的数学方式来理解一个类如何实现一个抽象数据类型（ADT），这依赖于 抽象函数 和 表示不变式 这两个概念。

这些数学概念在软件设计中非常实用：

- 抽象函数 为我们提供了一种清晰的方法，用来定义抽象数据类型的相等性（equality）。
- 表示不变式 则帮助我们更容易发现因数据结构被破坏而产生的错误。

[lec7.md](./lec7.md)

# Lec 8 用接口、泛型、枚举和函数定义ADT

本节将介绍实现抽象数据类型的各种方法，包括：

- 接口： 分离ADT的接口与其实现
- 泛型：用泛型类型参数定义一系列的ADT
- 枚举： 定义具有一小组有限值的ADT
- 对不透明类型操作的全局函数，在 TypeScript 中很少见，但在非面向对象语言中很常见。

我们还将讨论子类型（subtyping），即由其规范确定的两种类型之间的关系，并会区分继承（subclassing）

学习完你应该能够： 使用类、接口、泛型和枚举定义 ADT 判断一个类型是否是另一个类型的子类型。



[lec8.md](./lec8.md)

# Lec 9 函数式编程

我们将探讨多种用于操作元素序列的设计模式，并展示如何将函数本身视为一等公民（即可在程序中自由传递和操作的值），这一理念的强大之处。我们将学习一下概念。

- 迭代器与生成器
- Map/Filter/reduce
- 高阶函数
- 不可变性

[lec9.md](./lec9.md)

# Lec 10 相等性

在之前的学习中，我们通过创建由操作而非表示来定义的类型，建立了数据抽象的严格概念。对于一个ADT，抽象函数说明了如何把一个具体的表示值解释为抽象类型中的值；我们也看到，抽象函数的选择决定了如何编写该 ADT 各个操作的实现代码。

在本节中，我们将讨论如何定义数据类型中“值的相等”这一概念：抽象函数将为我们提供一种清晰的方式来定义 ADT 的相等操作。

在物理世界中，每个对象都是不同的——即使是看似完全相同的两片雪花，也在空间中的位置或微观结构上存在差异。因此，从物理意义上讲，两个物体从未真正“相等”；它们只是“相似程度”不同而已。

但在人类语言世界和数学概念世界中，我们可以有多个名称指代同一个对象。因此，我们自然会问：何时两个表达式代表“同一个东西”？例如，1+2、2+1 和 3 都表示同一个理想的数学值。

本节的第一部分将重点讨论**不可变类型**的相等性定义——这样我们可以在没有“状态变化”的干扰下理解核心概念。随后，我们再扩展到**可变类型**的相等性讨论。

[lec10.md](./lec10.md)

# Lec 11 递归数据类型

[lec11.md](./lec11.md)

# Lec 12 文法 & 解析

阅读内容介绍了几个概念：

- 文法（aka 语法，grammars）：包括产生式（productions）、非终结符（nonterminals）、终结符（terminals）和运算符（operators）
- 正则表达式（regular expressions）
- 解析生成器（parser generators）

就像我们之前讨论过的那些有多个客户端和多种实现的模块一样，不同用户之间需要共享对这种字符串或流的格式约定。换句话说，这种序列需要一个**规范（specification）**来定义它的结构。

- 一个字符串
- 磁盘的一个文件，此时规范被称为**文件格式（file format）**
- 通过网络发送的消息，此时规范被称为**网络协议（wire protocol）**
- 用户在控制台上输入的命令，此时规范被称为**命令行接口（command line interface）**

对于这些序列，我们引入了语法的概念，它不仅使我们能够区分合法和非法序列，还能将序列**解析**为程序可以使用的数据结构。

这种由文法生成的数据结构通常是**递归数据类型**，就像我们在“递归数据类型”那一节中讨论过的那样。

此外，我们还将学习一种文法的特殊形式——**正则表达式**。正则表达式除了可以用来描述规范和解析字符串外，还是一种被广泛使用的字符串处理工具， 常用于分解字符串、提取信息或进行文本转换。

最后，我们会介绍**语法分析器生成器（parser generator）**， 这是一种可以根据文法**自动生成对应解析器**的工具。

完成本节学习，应掌握：

- 理解语法生成式和正则表达式运算符的概念
- 能够阅读一个语法或正则表达式，并判断它是否能匹配某个字符序列
- 能够编写一个语法或正则表达式，用于匹配一组字符序列
- 能够结合语法和解析器生成器，将字符序列解析成语法树
- 能够将语法树转换为有用的数据类型



[lec12.md](./lec12.md)

# Lec 13 调试

今天的话题是调试。首先讨论避免调试——要么完全避免调试，要么让调试变得容易。有些时候必须得调试——特别需要重复尝试或者说整个系统一起工作出现的bug，很难定位某个模块。针对这些情况，我们提出一个通用加快调试的系统策略。

有几个阅读资料：

- 《Why Programs Fail》是关于这方面的。这节内容也是主要参考这本书。
- 《How to Debug》by John Regehr，是关于嵌入式系统课程，更底层但是原理通用。
- 《Bebugging: The Nine Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems》是一个很好的实践指引。



[lec13.md](./lec13.md)

# Lec 14 并发

并发意味着两个计算在同一时间发生，在现代编程中无处不在：

- 在一个网络内多台计算机一同工作
- 一台计算机内运行多个应用
- 一台计算机里面又有多核的处理器芯片

事实上，并发对于现代编程非常关键。

- Web网站，同时处理多个users请求
- 图形用户界面几乎总是需要不打扰用户的后台工作
- 例如，Visual Studio Code 会在您编辑 TypeScript 代码时对其进行编译。

并发编程在未来仍然很重要。处理器时钟速度不再提升。相反，每一代新芯片都会拥有更多核心。因此，在未来，为了提高计算速度，我们必须将计算拆分成多个并发部分。

本节的学习目标：

- 学习两种并发方式
  - 消息传递
  - 共享内存
- 并发进程和线程，和时间片轮转（time slicing）
- 竞态条件的危险性

[lec14.md](./lec14.md)

# Lec 15 Promise

本节讨论使用`Promise`进行并发计算的方法。我们从最高层次的抽象开始，介绍Promise的概念，以及`await`操作符和`async`函数声明。这些特性使得TypeScript能够非常类似同步编程的方式实现。

随后我们将更深入底层。进一步理解 `Promise`、`await` 和 `async` 的运行机制。

[lec15.md](./lec15.md)

# Lec 16 互斥

这篇阅读内容将并发和Promise的概念结合在一起， 探讨 异步ADT 的上下文——一种具有异步操作的ADT，这些操作可能并发运行，并访问相同的共享表示。

我们将看到，这种并发操作带来了并发错误的风险，例如 竞态条件（race conditions） 和 死锁（deadlocks），这些错误可能会破坏 ADT 试图保证的不变量和规范。

通过推理并发代码的交错执行，并利用 互斥（mutual exclusion）（即代码在没有交错执行的情况下独立运行的时期），我们可以防范这些错误。

[lec16.md](./lec16.md)

# Lec 17 回调函数

回调函数是客户端提供给模块以供模块调用的函数。这与正常的控制流程相反，在正常情况下，客户端调用模块提供的函数。而使用回调时，客户端提供了一段代码让实现者调用。



我们已经在函数式编程中看到了回调的一种形式：传递给`map`、`filter`或`reduce`的函数，这些函数会对序列中的每个元素进行重复调用。这是同步回调，因为它只在`map`/`filter`/`reduce`执行期间调用，并且之后不再使用。

异步回调，这种回调由模块保存，以便在将来某个时间调用，即在接收回调的函数已经返回之后。这里有一个类比来帮助理解同步和异步的区别。正常（同步）函数调用就像拿起电话拨打一个服务，比如打电话给银行查询账户余额。你提供银行操作员需要的信息，他们通过电话读回账户余额给你，然后你挂断电话。你是客户端，银行是你调用的模块。

有时银行回复得很慢。你会被搁置，你会等到他们找到答案。这就像一个同步函数调用，等待返回结果。

但有时任务可能需要很长时间，银行不想让你一直等待。于是银行会向你要一个回调电话号码，并承诺在某个不可预测的时间点把答案回拨给你。这类似于提供一个异步回调函数。

有时回调函数只会被调用一次（或最多一次），作为一次性请求的响应，就像这个账户余额的例子一样。但回调函数也可能被重复调用，每当某个事件发生时都会调用。对此类回调的一个类比可能是账户欺诈保护，当你的账户发生可疑交易时，银行会拨打你注册的电话号码。我们将在这篇阅读材料中看到这两种异步回调。

[lec17.md](./lec17.md)



# Lec 18 消息传递 & 网络

网络通信本质上是并发的，因此在构建客户端和服务器时，我们需要能够推理他们的并发行为，并以线程安全的方式实现它们。同时我们必须设计C/S之间的通信协议，就像我们设计ADT时，为客户端定义与之交互的操作一样。

本节的目标是：

- 学会使用消息传递（message passing） 而不是共享内存的方式实现TypeScript Worker之间的通信
- 理解C/S通信如何通过网络进行消息传递的



[lec18.md](./lec18.md)

# Lec 19 领域特定语言

在这次阅读中，我们将开始探索一个用于构建和操作音乐的小型语言的设计。核心思想是：当你需要解决一个问题时，不要只写一个程序来解决那个特定的问题，而是设计一种语言，使它能解决一系列相关的问题。

本次阅读的目标是介绍“**将代码表示为数据**”的概念，并让你熟悉音乐语言的初始版本。

在此过程中，我们还会介绍访问者模式（Visitor Pattern），它是将函数视为一等值（first-class values）的又一个例子，同时也是对递归数据类型执行操作的另一种实现策略。访问者模式常见于那些用递归数据类型实现的小型语言中。

(TODO)

[lec19.md](./lec19.md)







