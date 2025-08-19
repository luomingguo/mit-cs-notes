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


  # Lec 0 TypeScript基础

[lec0.md](./lec0.md) TODO

# Lec 1 静态检查

## Outline

- 引入示例： 冰雹序列
- 类型
- 静态类型
- 好的编程习惯
- 为啥要用TypeScript
- 总结

[lec1.md](./lec1.md)



# Lec 2 测试

## Outline



[lec2.md](./lec2.md)



# Lec 3 代码审查

# Lec 4 接口规范

[lec4.md](./lec4.md)

# Lec 5 设计规范

[lec5.md](./lec5.md)

# Lec 6 抽象数据类型

[lec6.md](./lec6.md)

# Lec 7 抽象函数 & 维持不变量

[lec7.md](./lec7.md)

# Lec 8 接口 & 子类型

本节将介绍实现抽象数据类型的各种方法，包括：

- 接口： 将抽象数据类型（ADT）的接口与其实现分离
- 泛型：用泛型类型参数定义一系列的数据类型（ADT）
- 枚举： 定义具有一小组有限值的ADT
- 对不透明类型操作的全局函数（一种对用户隐藏内部实现细节的类型，仅能通过特定的全局函数交互。例如C的`FILE*`的模块抽象类型）：在 TypeScript 中很少见，但在非面向对象语言中很常见。

我们还将讨论子类型（subtyping），即由其规范确定的两种类型之间的关系，并会区分子类化（subclassing）

完成今天的课程后，你应该能够： 使用类、接口、泛型和枚举定义 ADT 判断一个类型是否是另一个类型的子类型。



- 接口
- 子类型
- 子类
- 泛型
- 枚举
- Getter和Setter
- 非面向对象语言的抽象数据类型
- TypeScript的抽象数据类型
- 总结



[lec8.md](./lec8.md)

# Lec 9 函数式编程

[lec9.md](./lec9.md)

# Lec 10 相等性

[lec10.md](./lec10.md)

# Lec 11 递归数据类型

[lec11.md](./lec11.md)

# Lec 12 语法 & 解析

完成本节学习，应掌握：

- 理解语法生成式和正则表达式运算符的概念
- 能够读懂语法或正则表达式，并判断其是否匹配字符序列
- 能够编写语法或正则表达式来匹配一组字符序列
- 能够将语法与解析器生成器结合使用，将字符序列解析为解析树
- 能够将解析树转换为有用的数据类型

[lec12.md](./lec12.md)

# Lec 13 调试

[lec13.md](./lec13.md)

# Lec 14 并发

[lec14.md](./lec14.md)

# Lec 15 Promise

本节讨论使用`Promise`进行并发计算的方法。我们从最高层次的抽象开始，介绍Promise的概念，以及`await`操作符和`async`函数声明。这些特性使得TypeScript能够非常类似同步编程的方式实现。

随后我们将更深入底层。进一步理解 `Promise`、`await` 和 `async` 的运行机制。

[lec15.md](./lec15.md)

# Lec 16 互斥

[lec16.md](./lec16.md)

# Lec 17 回调函数



[lec17.md](./lec17.md)



# Lec 18 消息传递 & 网络

[lec18.md](./lec18.md)

# Lec 19 小语言

> [!NOTE]
>
> **目标**
>
> 我们将开始探索一个用于构建和操作音乐的小语言的设计。这里的核心思想是：当你需要解决一个问题时，不要仅仅编写一个程序来解决这个问题，而是构建一个可以解决一系列相关问题的语言。
>
> 本次阅读的目标是介绍将代码表示为数据的理念，并让你熟悉音乐语言的初始版本。在此过程中，我们将介绍访问者模式（Visitor pattern）。

## 将代码表示为数据

```
Formula = Variable(name:String)
					+ Not(formula:Formula)
					+ And(left:Formula, right:Formula)
					+ Or(left:Formula, right:Formula)
```

我们用``Formula``的实例来表示命题逻辑公式，e.g.``(p ∧ q)``, 用数据结构表示为

```
And(Variable("p"), Variable("q"))
```

在语法和解析器说法中，公式是一门语言，而``Formula``就是抽象语法树。



