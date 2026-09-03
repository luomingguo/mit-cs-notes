---
title: 抽象数据类型
type: lecture
lecture: 6
tags: [abstract-data-type, representation-independence, encapsulation, abstraction]
status: complete
source: 'https://web.mit.edu/6.102/www/sp24/classes/06-abstract-data-types/'
---
# Lec 6 抽象数据类型

## TL;DR

- 抽象数据类型由客户端可用的操作及其规格定义，而不是由字段、类或某一种内部表示定义。
- 操作可分为创建者、生成者、观察者和修改者；这组操作应保持简单、内聚、足够完备，并避免暴露表示细节。
- 表示独立性允许实现者在不改变客户端代码的前提下替换内部表示，是模块可维护性和多实现互换的基础。
- TypeScript 可以用类、接口、枚举或常量对象实现 ADT；具体语法只是承载抽象边界的工具。

## ADT 与表示独立性

这节介绍两个概念：

- 抽象数据类型
- 表示独立

## 数据抽象隐藏表示细节

抽象数据类型，能够将程序中数据结构的使用方式和数据结构本身的具体形式区分开来，解决了一个非常危险的问题：客户端会对类型的内部表示做出假设。我们将了解这种假设危险性以及如何避免。还将讨论操作的分类，以及一些良好抽象数据类型的设计原则

## 抽象的含义

抽象数据类型是软件工程中一个通用性原则的体现。它有许多名称，含义略有不同。以下是一些用于描述这一概念的名称：

- 抽象（Abstraction）： 用更简单、更高层次的概念省略或隐藏底层细节。
  - 客户端只需理解其先决条件和后置条件即可使用它，无需理解实现的完整内部行为。
- 模块化（Modularity）： 将系统划分为组件或模块，每个组件或模块都可以独立于系统其他部分进行设计、实现、测试和重用
  - 单元测试和规范有助于将函数模块化。
- 封装（Encapsulation）： 在模块周围构建一个墙，是模块负责自身的内部行为，确保系统其他部分 bug 不会损害其完整性
  - 函数的局部变量被封装，因为只有函数本身可以使用或修改它们。与此相反，全局变量或指向具有别名的可变对象的局部变量也对封装性构成威胁。
- 信息隐藏（info hiding），将模块实现的细节隐藏在系统其他部分之外，以便以后更改这些细节时无需更改系统其他部分。
  - 规范使用信息隐藏，为实现者在函数实现方式上留下一些自由。
- 关注点分离（Separation of concern）：将某个功能（或“关注点”）作为单个模块的职责，而不是将其分散到多个模块。
  - 好的函数规范是连贯的，这意味着它只负责一个关注点。

### 用户定义类型

在计算机发展的早期，编程语言带有内置类型（例如整数、布尔值、字符串等）和内置函数，例如用于输入和输出的函数。用户可以定义自己的函数：大型程序就是这样构建的。

软件开发的一大进步是抽象类型的概念：人们可以设计一种编程语言来允许用户定义类型。这一概念源于许多研究人员的努力，尤其是发明了 Simula 语言的 Dahl；开发了我们现在用来推理抽象类型的许多技术的 Hoare；以及创造了“信息隐藏”一词并首次提出围绕程序模块所封装的秘密来组织程序模块的想法的 Parnas。 MIT 的 Barbara Liskov 因其在抽象类型方面的工作获得了图灵奖，相当于计算机科学领域的诺贝尔奖。

数据抽象的关键思想是，**类型的特征在于你可以对其执行的操作**。数字是可以加法和乘法的；字符串是可以连接并提取子字符串的；布尔值是可以取反的，等等。从某种意义上说，用户在早期的编程语言中已经可以定义自己的类型：例如，你可以创建一个日期记录类型，其中包含表示日、月和年的整数字段。但抽象类型的新颖之处在于它对操作的关注：该类型的用户无需担心其值的实际存储方式，就像程序员可以忽略编译器实际存储整数的方式一样。重要的只是操作。

## 类型和操作分类

类型，无论是内置的还是用户定义的，都可以分为可变和不可变。比如 String 是不可变的。 有时，一个类型会以两种形式提供： 可变类型和不可变类型。

抽象的类型操作分类如下：

- Creator： 创建器创建该类型的新对象。创建器可以将其他类型的值作为参数，但不能将正在构造的类型的对象作为参数。

  - 创建器操作通常实现为构造函数，例如 new Date()。 但创建器也可以简单地实现为静态方法，例如 Array.of()。以静态方法或独立函数实现的创建器通常被称为工厂。

- Producer： 也会创建该类型的新对象，但需要一个或多个该类型的现有对象作为输入。

  - `concat`: `string` x `string` $\rightarrow$ `string` 是一个 Producer

- Observers： 接受抽象类型的对象并返回不同类型的对象。有些观察器不接受其他参数，例如：

  - `size`: `Map<K, V>`  $\rightarrow$​ `number`

  而有些观察器除了抽象类型的值之外，还接受其他类型的参数：

  - `get : Map<K,V> × K → V`

- Mutator（修改器）：改变对象，例如

  - `push: Array<T> × T → number` 通过在数组末尾添加一个元素来修改数组（并附带返回列表的新长度）。
  - 修改器通常以 void 或 undefined 的返回类型表示。返回 void 的方法必须为了某种副作用而被调用，因为否则它不会返回任何内容。但并非所有修改器都返回 void。例如，Set.add() 返回集合本身，因此可以将多个 add() 调用链接在一起。
  - 如果一个操作可能改变一个对象，那么它就是一个修改器，无论其返回类型如何。Producer 和 Observers 永远不应该改变对象。

## 抽象类型由其操作定义

这里的核心思想是，**抽象数据类型由其操作定义**。类型 T 的操作集及其规范完全表征了我们所说的 T。例如，当我们谈论数组类型时，我们指的不是链表、内存块、哈希表，也不是任何其他可能表示值序列的特定数据结构。

![数组 ADT 的公开操作与不透明内部表示](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251018013640712.png)

相反，数组类型是一组不透明的值——可能具有数组类型的对象——它们满足数组所有操作的规范：[..]（索引）、长度、push() 等。抽象类型的值是不透明的，这意味着客户端无法检查存储在其中的数据，除非操作允许。

扩展一下我们关于规范防火墙的比喻，你可以将抽象类型的值想象成硬壳，它不仅隐藏了单个函数的实现，还隐藏了一组相关函数（该类型的操作）及其共享的数据（存储在该类型值中的私有字段）。 该类型的操作构成了它的抽象。这是公共部分，对使用该类型的客户端可见。 实现该类型的类的字段以及帮助实现复杂数据结构的相关类构成了特定的表示。这部分是私有的，仅对类型的实现者可见。

## 设计一个抽象类型

设计抽象类型涉及选择合适的操作并确定它们的行为方式。以下是一些经验法则。

**与其使用大量复杂的操作，不如使用一些简单的、可以有效组合的操作**。

每个操作都应该有明确的目的，并且应该具有连贯的行为，而不是大量的特殊情况。例如，我们可能不应该在 Set 中添加求和操作。它可能对处理数字集合的客户端有帮助，但对于字符串集合呢？或者嵌套集合呢？所有这些特殊情况都会使求和操作难以理解和使用。

**操作集应该是足够的，即必须有足够的操作来完成客户端可能想要执行的计算。** 一个好的检测标准是检查该类型的抽象值的信息是否可以方便地提取。例如，如果 string 没有索引操作 [i]，我们将无法找出字符串中的各个字符。基本信息不应该过于难以获取。例如，string 的 length 属性并非绝对必要，因为我们可以应用 [i] 来增加索引 i，直到得到 undefined，但这既低效又不方便。

类型可以是通用的：例如列表、集合或图。也可以是特定领域的：街道地图、员工数据库、电话簿等。**但它不应混合通用特性和领域特定特性**。用于表示扑克牌序列的 Deck 类型不应包含接受任意对象（例如整数或字符串）的通用加法运算。相反，将诸如 dealCards 之类的领域特定运算放入通用类型 Array 中也是没有意义的。

## 表示独立性

至关重要的是，一个好的抽象数据类型应该是表示独立性（**representation independent**）的。这意味着抽象类型的使用与其表示（用于实现它的实际数据结构或数据字段）无关，因此表示的更改不会影响抽象类型本身之外的代码。例如，Array 提供的操作与数组内部表示为连续的内存块、链表还是哈希表无关。 作为实现者，只有当抽象数据类型 (ADT) 的操作完全由先决条件和后置条件指定时，您才能安全地更改其表示。这样，客户端就知道需要依赖哪些操作，而您也知道可以安全地更改哪些操作。

## 在 TypeScript 中实现 ADT

我们来总结一下本章讨论过的一些通用思想，这些思想不仅适用于任何编程语言，也可以通过 TypeScript 的语言特性来具体实现。关键在于：实现某个 ADT 概念往往有多种方式，理解这些抽象的“大思想”（如构造操作）以及在实践中实现这些思想的不同方式都很重要。

| ADT concept        | Ways to do it in TypeScript | Examples                                                     |
| :----------------- | :-------------------------- | :----------------------------------------------------------- |
| Abstract data type | Class                       | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) |
|                    | Interface + class(es) 1     | [`ArrayLike`](https://typhonjs-typedoc.github.io/ts-lib-docs/2023/esm/interfaces/ArrayLike.html) and [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) |
|                    | Enum 2                      | [`PenColor`](https://web.mit.edu/6.102/www/sp25/psets/ps0/doc/enums/turtle.PenColor.html) |
| Creator operation  | Constructor                 | [`Array()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array) |
|                    | Static (factory) method     | [`Array.of()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of) |
|                    | Constant 3                  | [`Number.POSITIVE_INFINITY`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY) |
| Observer operation | Instance method             | [`String.charAt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt) |
|                    | Static method               | [`Object.entries()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) |
| Producer operation | Instance method             | [`String.trim()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim) |
|                    | Static method               | [`Math.floor()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) |
| Mutator operation  | Instance method             | [`Array.push()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push) |
|                    | Static method               | [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) |
| Representation     | `private` fields            |                                                              |

**说明：**

1. 用 interface + class 来定义一个抽象数据类型。接口的部分将在后续内容中讨论。
2. 用枚举（enum）来定义抽象数据类型。枚举适用于值集合较小且固定的 ADT，比如一周的七天。我们在 TypeScript 中已经见过枚举，并将在后面进一步讨论。
3. 使用常量对象作为构造操作（creator operation）。这种模式常见于不可变类型（immutable types），其中类型最简单或“空”的值是一个公共常量，然后通过生成操作（producer operations）基于它构建出更复杂的值。

## ADT 如何支撑软件质量

抽象数据类型（ADT）的特征在于它支持的操作。这些操作分为四类。一个优秀的 ADT 应当具备以下特征，简单、内聚、完备和表示无关。

测试 ADT 时，需要针对每个操作编写测试，但在测试中应当**组合使用**构造、生成、修改和观察操作，以验证它们的协同工作效果。

这些思想与优秀软件的三大核心特性相对应：

- **防止错误（Safe from bugs）** 优秀的 ADT 为数据类型提供了清晰定义的契约，使得使用者清楚地知道数据类型的行为预期，同时实现者也在契约范围内拥有明确的实现自由度。

- **易于理解（Easy to understand）** 优秀的 ADT 将实现细节隐藏在一组简单的操作背后，使得程序员在使用时只需理解这些操作的接口，而无需关心底层的实现细节。

- **易于修改（Ready for change）** 由于具有**表示无关性（representation independence）**，ADT 的内部实现可以随时更改，而无需修改依赖它的客户端代码。

::: insight
设计 ADT 的关键不是把现有字段包进一个类，而是缩小客户端能够表达的操作集合。操作越贴近领域不变量，错误状态越难构造；如果客户端仍需读取内部字段再自行拼装业务行为，抽象边界实际上还没有建立。
:::
