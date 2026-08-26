---
title: 静态检查
course: 6.1020 软件构造基础
course_id: '6.1020'
lecture: 1
kind: design
tags: []
status: complete
---
# Lec 1 静态检查

本节主要讲两个主题：

- 静态类型
- 好的软件的三大性质

## 引入示例： 冰雹序列

我们将以**冰雹序列**作为贯穿示例，其定义如下：从数字 n 开始，

- 若 n 为偶数，则序列下一项为 n/2；
- 若为奇数，则下一项为 3n+1。当序列达到 1 时终止。

示例如下：

- 2, 1
- 3, 10, 5, 16, 8, 4, 2, 1
- 4, 2, 1
- 2n, 2n-1, … , 4, 2, 1
- 5, 16, 8, 4, 2, 1
- 7, 22, 11, 34, 17, 52, 26, 13, 40, …？（此序列何时终止？）

由于奇数运算规则，序列可能在最终降至 1 之前反复起伏。数学界猜想**所有冰雹终将坠落**——即对于任意起始值 n，序列最终都会收敛到 1——但这仍是未解之谜。其名称源自冰雹在云层中上下反弹，直至重量足够才坠落地面的自然现象。

以下是用代码实现从 n 出发，打印冰雹序列的代码。我们用 python 和 TypeScript 对比

```python
# python实现
n = 3
while n != 1:
  print(n)
  if n % 2 == 0:
    n = n / 2
  else:
    n = 3 * n + 1
print(n)
```

```typescript
// TypeScript or JavaSript，两个语言都可以正常工作
let n = 3;
while(n !== 1) {
  console.log(n);
  if (n % 2 === 0){
    n = n / 2;
  } else {
    n = 3 * n + 1;
  }
}
console.log(n);
```

以下语法上遇到注意的点：

- JS 在条件语句`if`和`while`需要括号，而 Py 不需要
- JS 结尾需要用分号。但这是可选的，因为每行 JS 都会被添加上分号。但是最好保持加分号的良好习惯
- **比较运算符的陷阱**。JavaScript 中 `==` 和 `!=` 会执行自动类型转换（例如 `0 == ""` 返回 `true`），这常导致意外结果。因此专业开发者只使用严格比较符 `===` 和 `!==`（如 `0 === ""` 返回 `false`）。从 Python 转来的学习者需特别注意这一差异。

## 类型

本课程实际使用的是 TypeScript——它在 JavaScript 基础上扩展了类型声明能力。例如可明确变量 `n` 为数值类型：

```typescript
let n: number = 3;
```

Type 本质是值集合及其对应 operation 的组合。TypeScript 内置基础类型包括：

- `number`: 整数与浮点数
- `boolean`: 逻辑值 true/false
- `string`: 字符序列

操作（函数）的语法表现形式多样。以下是在 Python 或 TypeScript 中表示操作的几种不同语法：

- 作为运算符。如 `a + b` 对应函数 `+ : number × number → number`
- 作为函数。如 `Math.sin(theta)` 对应 `sin: number → number`（此处 `Math` 是包含函数的命名空间）
- 作为对象的方法。如 `str1.concat(str2)` 对应 `concat: string × string → string`
- 作为对象的属性。如 `str.length` 对应 `length: string → number`（注意无括号）

对比：TypeScript 的 `str.length` 与 Python 的 `len(str)` 功能相同但语法不同。

**操作重载**（operation overload）指同一操作符/函数名支持不同参数类型。例如 `+` 在 TypeScript 中：

- 数值运算：`5 + 3 → 8`
- 字符串拼接：`"5" + "3" → "53"`
  重载不仅限于运算符，方法和函数也可重载（TypeScript 等语言支持）

## 静态类型

TypeScript 作为**静态类型语言**，能在编译阶段确定变量类型并推导表达式类型。例如当 `a` 和 `b` 声明为 `number` 时，`a+b` 自动推导为 `number`。VS Code 等工具可在编码时实时显示类型错误。

相较之下，JavaScript 和 Python 属于**动态类型语言**，类型检查延迟到运行时执行。

静态类型是**静态检查**的核心手段，旨在编译期捕获错误。本课程多数工程实践都致力于消除代码缺陷，而静态检查正是第一道防线。它能预防大量因类型误用导致的错误——例如尝试执行 `"5" * "6"` 这类字符串乘法时，静态类型系统会在编码阶段立即报错，而非等到运行时才暴露问题。

```ts
// TypeScript to compile
function hello(name: string): string {
  return 'Hi, ' + name;
}
let greeting: string = hello('type');
```

```js
// JavaScript generated
function hello(name) {
  return "Hi, " + name;
}
let greeting = hello('types');
```

Pytho 能够允许支持静态类型，比如

```python
def hello(name: str) -> str:
  return 'Hi, ' + name
```

通过 **Mypy/Pyright** 等工具可进行静态类型检查。这种设计反映了软件工程的共识：静态类型对大型系统的构建和维护至关重要。

渐进式类型（Gradual Typing）允许代码中部分模块使用静态类型，其余保持动态类型，为原型快速迭代到系统稳定维护提供了平滑过渡路径。

### TypeScript 的数字类型陷阱

TypeScript 的 `number` 类型存在与数学实数不符的特殊行为：

整数精度限制

- `Number.MAX_SAFE_INTEGER`（大约是 2<sup>53</sup> 或 10<sup>36</sup>）是最大可精确表示的整数
- `Number.MIN_SAFE_INTEGER`（大约是 -2<sup>53</sup> 或 -10<sup>36</sup>）是最小可精确表示的整数

特殊值

- `Number.NaN`（代表“Not a Number”）
- `Number.POSITIVE_INFINITY`（显示为 "Infinity"）
- `Number.NEGATIVE_INFINITY`（显示为 "-Infinity"）

#### 溢出和下溢

TypeScript 也无法表示过大（远离零）或过小（接近零）的数字：

- `Number.MAX_VALUE`（大约是 10<sup>308</sup>）是可以安全表示的最大数字
- `Number.MIN_VALUE`（大约是 10<sup>-324</sup>）是可以安全表示的最小正数

注意：访问这些常量需通过 `Number` 类，但声明类型时应始终使用小写 `number`

### 数组

我们将冰雹序列存储在序列数据结构中，实现如下

```ts
let array: Array<number> = [];
let n: number = 3;
while(n !== 1) {
  array.push(n)
  if (n % 2 === 0) {
    n = n / 2;
  } else {
    n = 3 * n + 1;
  }
}
array.push(n);
```

### 函数

我们将代码封装为可复用的函数：

```ts
/**
 * 计算冰雹序列
 * @param n  序列起始数字（要求 n > 0）
 * @returns 以n开头、1结尾的冰雹序列数组
 */
function hailstoneSequence(n: number): Array<number> {
    let array: Array<number> = [];
    while (n !== 1) {
        array.push(n);
        n = (n % 2 === 0) ? n / 2 : 3 * n + 1;
    }
    array.push(n);
    return array;
}
```

对于函数规范，我们将在后续课程深入探讨规范编写规范，但你现在就需要开始阅读并应用它们。

### 可变值 vs 重赋值

优秀的程序员会限制可变性，因为意外变更易引发错误。本课程将**不可变性**作为核心设计原则，主要体现在两个维度：

- 值的可变性。
  - 不可变类型：创建后值不可修改。
    - 例如 TS/Py 的 string
  - 可变类型：允许内容修改
    - 例如 TS 的 Array 和 Python 的 list 支持增删改操作
- 引用的可重赋值性（Reassignment）
  - TypeScript 通过 `const` 声明不可重新赋值的常量
  - Python 默认所有变量都可重新赋值

尽可能多地使用 `const` 是一个好习惯。就像变量的类型声明一样，这些声明是重要的文档，对代码的阅读者有用，并且由编译器进行静态检查。

## 好的编程习惯

### 记录代码假设的重要性

显式声明即文档

- **类型注解**（如 `n: number`）记录了对变量的假设，TypeScript 会在编译时验证该假设
- **常量声明**（`const`）表明变量不可重新赋值，编译器会静态检查这一约束
- **手工文档**（如 `n > 0`）补充了类型系统无法自动检查的假设

> 为什么必须记录假设？因为编程充满隐性约定，若不显式记录：
>
> - 开发者自己会遗忘
> - 后续维护者只能靠猜测

### 编程的双重目标

1. **与计算机对话**
   - 通过编译器验证：语法正确性 → 类型正确性 → 运行时逻辑正确性
2. **与人类对话**
   - 确保代码可理解性，便于未来维护（包括你自己六个月后阅读时）

### 黑客式编程 vs 工程化开发

**黑客行为（不可取）**

- ❌ 编写大量代码后一次性测试
- ❌ 假设所有细节都记在脑子里（包括使用者）
- ❌ 乐观认为"要么没 bug，要么很容易修复"

**工程实践（推荐）**

- ✅ **渐进开发**：写少量代码立即测试（后续课程将介绍测试驱动开发）
- ✅ **假设文档化**：明确记录代码依赖的前提条件
- ✅ **防御性编程**：通过静态检查等机制防范错误（包括防范自己犯蠢）

## 为啥选用 TypeScript

安全性是首要原因。TypeScript 具备静态检查能力（主要是类型检查，也包括其他静态验证，例如确保代码返回了声明要返回的值）。本课程聚焦软件工程，而"减少错误"正是软件工程的核心原则

普适性是另一考量。TypeScript 可编译为纯 JavaScript，后者在科研、教育和工业界应用广泛。JavaScript 不仅能在最初主流的浏览器中运行，如今还支持服务器端甚至 Windows/Mac/Linux 桌面应用开发。

相较 Java，TypeScript 类型系统更丰富，编写程序时所需模板代码更少，更是开发现代用户界面和网页应用的上佳之选。事实上，TypeScript 的类型系统非常先进，开发者甚至能用它编写出意想不到的程序（其中一些堪称精妙）。

优秀的程序员必须掌握多门语言。编程语言如同工具，需因场景制宜。

得益于 JavaScript 的普及，其生态拥有大量实用库和免费开发工具（如 VS Code 等 IDE、编辑器、编译器、测试框架、性能分析器、代码覆盖率工具和风格检查器）。JavaScript 与 Python 在生态丰富度上不相伯仲，而 TypeScript 能充分利用 JavaScript 的库资源。

当然，选择 JavaScript 也有遗憾。其语言规模庞大，历经数十年发展积累了过多特性；继承了 C/C++ 等旧式语言的包袱——例如从 C 沿袭而来的 switch 语句就是个过时且不安全的语法结构；JavaScript 早期设计也存在缺陷，比如使 `0 == ""` 返回 true 的类型转换规则，或是 `[] + []` 莫名生成空字符串的行为，动态检查机制也弱于其他语言。TypeScript 修复了部分问题，但并未完全解决。如今 JavaScript 许多特性因使用风险已被开发者弃用。

## 本讲小结

我们今天介绍的核心概念是静态检查。以下是这一概念与课程目标之间的关系：

- **避免出 BUG（Safe from bugs）**：静态检查通过在运行前捕捉类型错误和其他 bug，有助于提高程序的安全性。
- **易于理解（Easy to understand）**：因为类型在代码中是显式声明的，静态检查有助于提升代码的可理解性。
- **便于修改（Ready for change）**：当你修改代码时，静态检查可以指出需要一同更改的其他部分，从而使代码更易于维护和演进。
