6.1020/6.031 Software Construction
Introduces fundamental principles and techniques of software development: how to write software that is safe from bugs, easy to understand, and ready for change. Topics include specifications and invariants; testing, test-case generation, and coverage; abstract data types and representation independence; design patterns for object-oriented programming; concurrent programming, including message passing and shared memory concurrency, and defending against races and deadlock; and functional programming with immutable data and higher-order functions. Includes weekly programming exercises and larger group programming projects.

# 课程介绍

## 软件安装

### 安装Node.js

Go to the [Node.js Downloads page](https://nodejs.org/en/download/), and then:

- for Windows or macOS: use the Windows or macOS installer
- for Linux: click on “Installing Node.js via package manager” at the bottom of the page, and find the appropriate package for your Linux flavor
  - for Arch Linux: the suggested `nodejs` package is the “Current” version of Node, which is not what you want; [find and install an appropriate `nodejs-lts` package](https://archlinux.org/packages/?q=nodejs-lts) instead

Make sure you install the LTS version of Node, version 20.x.y

### 安装 TypeScript

After installing Node, open your terminal or command prompt, and run:

- for macOS or Linux:

  ```sh
  sudo -H npm install -g typescript
  ```

- for Windows:

  ```sh
  npm install -g typescript
  ```



### 安装Visual Studio Code

Go to the [Visual Studio Code download page](https://code.visualstudio.com/#alt-downloads), and download and install the appropriate installer for your platform.

- If you would rather install [VSCodium](https://vscodium.com/), that will work too.
- If the installer asks questions during installation, you can accept the default choices and just click Next.



### 安装Praxis Tutor（需要MIT认证）

Praxis Tutor is 6.102’s tool for learning the syntax and semantics of TypeScript.

1. Download the [Praxis Tutor extension](https://praxistutor.mit.edu/praxis.vsix), which will save to your laptop as a file called `praxis.vsix`.
2. Run Visual Studio Code, and go to *View* → *Extensions*.
3. In the upper right corner of the Extensions pane that appears, click on `...`, then *Install from VSIX…*, then find and install the `praxis.vsix` file you just downloaded.
4. Close Visual Studio Code and restart it.
5. Go to *View* → *Command Palette*, search for `praxis`, and click on *Explorer: Focus on Praxis Tutor View*. You should see a PRAXIS TUTOR pane appear in the lefthand sidebar. The Tutor pane may be showing an error message like “No such tutor” or “The Tutor doesn’t know who you are”. That’s fine, you still have to configure it using the next few steps.
6. Open the Settings panel:
   - Windows/Linux: *File* → *Preferences* → *Settings*
   - macOS Code → Settings… → Settings
     - if you installed VSCodium, look for `VSCodium` in the menubar, not `Code`.
     - in macOS versions 12 and earlier, look for `Preferences` in the first menu, not `Settings`
7. The Settings panel has a search box at the top. Search for `praxis` and it should display only the settings for Praxis Tutor.
8. [Click here to get your personal start URL](https://praxistutor.mit.edu/register/openid?tutor=6102-sp24).
9. In the box labeled `Location: Personal Link`, copy and paste your personal start URL.
   You should see the Praxis Tutor immediately reload and show a page with “Basic TypeScript” at the top, which means it’s ready for use. (非MIT学生估计不行)
10. Close the Settings panel.

### Install Constellation（需要MIT认证）

Constellation is 6.102’s system for working on in-class programming exercises with a partner.

1. Download the [Constellation extension](https://constellation.mit.edu/install/constellation-vscode-0.4.8.vsix), `constellation-vscode-0.4.8.vsix`.
2. In VS Code, go to *View* → *Extensions*, click on `...`, then *Install from VSIX…*, and select `constellation-vscode-0.4.8.vsix`.
3. Once again, close VS Code and restart it.
4. Go to *View* → *Command Palette*, which brings up a search box that allows you to find and run any command in VS Code. Type “set up constellation” and select *Set up Constellation*.
   - If a window with “Do you want Code to open the external website” appears, click Configure Trusted Domains and Trust [https://constellation.mit.edu](https://constellation.mit.edu/).
   - Windows/Linux: if it fails with the error “certificate has expired,” open the VS Code Settings panel again and search for `systemcertificates`. Un-check the *Http: System Certificates* option, then restart VS Code and try again.
5. Your web browser should open a Constellation page that requires MIT Touchstone login. Click the red *Go!* button.
6. After following the prompts, you should see a “successfully authenticated and connected” notification in VS Code to confirm that Constellation is ready to use.

## 参考书

### 经典书籍

Barbara Liskov and John Guttag. [*Program Development in Java: Abstraction, Specification, and Object-Oriented Design.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma990011095490106761) Addison-Wesley, 2000.

- Parallels the course material on specifications and abstract data types very closely; it’s a good book for background reading.

Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides. [*Design Patterns: Elements of Reusable Object-Oriented Software.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma990011094970106761) Addison-Wesley, 1995.

- The seminal book on design patterns like Interpreter and Visitor, usually referred to as the “Gang of Four book”. Organized as a catalog.

Martin Fowler. [*Refactoring: Improving the Design of Existing Code, Second Edition.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma9935132911206761) Addison-Wesley, 2018.

- A book on techniques for restructuring code to make it more ETU and RFC without changing its meaning. Examples are presented in JavaScript.

Steve McConnell. [*Code Complete: A Practical Handbook of Software Construction, Second Edition.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma9935112460106761) Microsoft Press, 2004.

- A thick but excellent guide to code quality.

David Thomas and Andrew Hunt. [*The Pragmatic Programmer : Your Journey to Mastery, Second Edition.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/1jdn9l1/alma9935113260306761) Pearson, 2020.

- Concise, readable, language-independent, timeless advice for software engineers.

### 编程语言

Joshua Bloch. [*Effective Java, Third Edition.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/1jdn9l1/alma9935036629206761) Addison-Wesley, 2017.
David Herman. [*Effective JavaScript.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma9935084702506761) Addison-Wesley, 2012.
Dan Vanderkam. [*Effective TypeScript.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/ejdckj/alma9935096645306761) O’Reilly, 2019.

### 调试技术


Andreas Zeller. [*Why Programs Fail.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/sjd9fk/cdi_safari_books_v2_9780123745156) Morgan Kaufmann, 2009.

- Inspired much of the Debugging reading.

David Agans. [*Debugging: The Nine Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems.*](https://mit.primo.exlibrisgroup.com/permalink/01MIT_INST/sjd9fk/cdi_skillsoft_books24x7_bks00002516) AMACOM, 2006.

- Readable, eminently practical guide to debugging in a variety of technical situations, from software to hardware to cars to plumbing.

## Quiz

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

## 实验

### 小项目

- [PS0: Turtle Graphics](https://web.mit.edu/6.102/www/sp24/psets/ps0/)
- [PS1: Flashcards](https://web.mit.edu/6.102/www/sp24/psets/ps1/)
- [PS2: Cityscape](https://web.mit.edu/6.102/www/sp24/psets/ps2/)
- [PS3: Memely](https://web.mit.edu/6.102/www/sp24/psets/ps3/)
- [PS4: Memory Scramble](https://web.mit.edu/6.102/www/sp24/psets/ps4/)

### 大项目

[Project: ⭐️⚔️ (mit.edu)](https://web.mit.edu/6.102/www/sp24/projects/starb/)

## Lec列表

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



# Lec 1 静态检查（Static Checking）

## 静态类型

看一个例子

```python
n = 3
while n != 1:
  print(n)
  if n % 2 == 0:
    n = n / 2
  else:
    n = 3 * n + 1
print(n)
```

```javascript
let n = 3
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



注意到 JavaScript 版本使用了 === 和 !==，而 Python 使用 == 和 !=。这是因为 JavaScript 中的 == 和 != 会进行各种自动类型转换，试图使左侧和右侧的值可以相互比较。例如，0 == "" 在 JavaScript 中为 true，这既令人惊讶又令人困惑。三等号版本的这些操作符要安全得多且更可预测：0 === "" 为 false。好的 JavaScript 程序员只会使用 === 和 !==。这是从 Python 迁移到 JavaScript 时的一个潜在陷阱

但是我们接下来**不会使用javascript，而用TypeScript**，它扩展了js能够声明类型的能力。

e.g. n有number类型

```typescript
let n: number = 3;
```

### 类型

**type**是一组可以对这些值执行的操作的值的集合

TypeScript 有几种内置类型，包括：

- **number**：表示整数和浮点数
- **boolean**：表示 true 或 false
- **string**：表示字符序列

**operation**是接受输入并产生输出（有时会改变输入值本身）的函数。操作的语法各不相同，但无论它们如何书写，我们仍然认为它们是函数。以下是在 Python 或 TypeScript 中表示操作的几种不同语法：

- 作为操作符。例如，a + b 调用了操作 + : number × number → number。（在这种表示法中：+ 是操作的名称，箭头前的 number × number 表示两个输入的类型，箭头后的 number 表示输出的类型。）
- 作为函数。例如，Math.sin(theta) 调用了操作 sin: number → number。这里，Math 不是对象，而是包含 sin 函数的类。
- 作为对象的方法。例如，str1.concat(str2) 调用了操作 concat: string × string → string。
- 作为对象的属性。例如，str.length 调用了操作 length: string → number。注意 str.length 后面没有括号。

对比 TypeScript 的 str.length 和 Python 的 len(str)。这是两种语言中相同的操作——接受一个字符串并返回其长度——但语法不同。

某些操作是重载的，这意味着相同的操作名称用于接受不同类型参数的函数。TypeScript 中的操作符 + 是重载的。对于数字，5 + 3 自然产生 8。但当 + 用于字符串时，它执行字符串连接，因此“5” + “3” 产生“53”。重载不仅限于操作符如 +；方法和函数也可以被重载。大多数编程语言都具有一定程度的重载。

### 静态类型

TypeScript 是一种静态类型语言。变量可以在编译时（程序运行之前）被赋予类型，因此编译器可以根据这些变量推断表达式的类型。如果 a 和 b 被声明为 number，那么编译器会得出 a+b 也是 number 的结论。相比之下，JavaScript 和 Python 是动态类型语言，因为这种检查会推迟到运行时（程序运行时）进行。**静态类型声明在编译时用于执行静态检查**。

实际上，TypeScript——像许多静态类型语言一样——在编译后会丢弃静态类型信息。那么，TypeScript 编译器生成了什么？JavaScript！以下是一段类型正确的 TypeScript 代码，以及生成的 JavaScript：

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

Pytho能够允许支持静态类型，比如

```python
def hello(name: str) -> str:
  return 'Hi, ' + name
```

这种声明类型可以用类似Mypy的checker来检查。为动态类型语言添加静态类型可以实现一种编程方法，称为渐进类型（gradual typing），其中代码的某些部分具有静态类型声明，而其他部分则省略它们。渐进类型可以为一个小的实验性原型成长为一个大型、稳定、可维护的系统提供更平滑的路径。

那么TypeScript中的动态检查呢？TypeScript进行静态检查，但其运行时行为完全由JavaScript提供，而JavaScript的设计者决定在许多情况下不进行检查。例如，当字符串或数组索引超出范围，或在映射中找不到键时，JavaScript返回特殊值undefined，而不是像Python那样抛出错误。当除以零时，JavaScript返回表示无穷大的特殊值，而不是抛出错误。

#### Superise: number 类型不是一个真实数字

TypeScript 中的另一个陷阱——这是许多其他编程语言也存在的问题——是它的数值类型有一些与我们习惯的整数和实数不一样的边界情况。TypeScript 中的所有数字都是浮点数，这意味着大范围的整数只能近似表示。整数在 -2<sup>53</sup> 和 2<sup>53</sup>（不包含两端）之间可以精确表示，但是但超出这个范围，浮点表示只保留数字的最高有效二进制位。这意味着，如果你有 2<sup>60</sup> 并尝试对其递增，你会得到相同的数字：在 TypeScript 中，2<sup>60</sup> + 1 === 2<sup>60</sup>。

这些可表示整数的限制可以通过内置常量获取：

- `Number.MAX_SAFE_INTEGER`（大约是 2<sup>53</sup> 或 10<sup>36</sup>）是最大可精确表示的整数
- `Number.MIN_SAFE_INTEGER`（大约是 -2<sup>53</sup> 或 -10<sup>36</sup>）是最小可精确表示的整数

```ts
// example
let odd: number = 2**30 - 1;         // an odd number
let oddSquared: number = odd * odd;  // the square of an odd number should be odd

```

The result is 11529215024593633**00**, but should be 11529215024593633**29**

**特殊值**

`number` 类型有几个不是实数的特殊值：

- `Number.NaN`（代表“Not a Number”）
- `Number.POSITIVE_INFINITY`（显示为 "Infinity"）
- `Number.NEGATIVE_INFINITY`（显示为 "-Infinity"）

#### 溢出和下溢

TypeScript 也无法表示过大（远离零）或过小（接近零）的数字：

- `Number.MAX_VALUE`（大约是 10<sup>308</sup>）是可以安全表示的最大数字
- `Number.MIN_VALUE`（大约是 10<sup>-324</sup>）是可以安全表示的最小正数

### Array

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



### Mutate values vs. reassigning variables

优秀的程序员会尽量避免可变的事物,禁止某些事物在运行时改变（不可变性）将成为一个重要的设计原则。

不可变性有两个方面：值是否可变以及引用（如变量）是否可以重新分配

**变值**指的是改变值的内容。不可变类型是指一旦创建，其值就永远不能改变的类型。字符串类型在 Python 和 TypeScript 中都是不可变的。一旦创建了一个字符串，你不能使它变短或变长，也不能替换其中的任何字符。你必须创建一个包含所需更改的新字符串。

相比之下，数组类型在 TypeScript 中是可变的，就像列表在 Python 中是可变的一样。你可以改变数组或列表的内容——添加元素、删除元素或替换元素。

Python 还有不可变的序列，元组（tuples），一旦创建便无法更改。TypeScript 没有不可变的元组，但它有 `ReadonlyArray`，这是一个省略了变异操作的数组类型。当你在代码中使用 `ReadonlyArray` 作为类型时，你不能调用 `push()` 来添加元素，也不能调用 `splice()` 来删除元素，或重新分配元素，如 `arr[i] = ...`。TypeScript 会报告一个编译错误，因为它在 `ReadonlyArray` 类型中找不到这些操作。

**重新分配**是指改变变量指向的位置。Python 允许任何变量重新分配，但 TypeScript 允许我们声明常量，这些常量是不可重新分配的：一旦赋值，便永远不能重新分配。要使引用不可重新分配，可以使用关键字 `const` 而不是 `let` 进行声明：

```ts
const n: number = 5;
```

尽可能多地使用 `const` 是一个好习惯。就像变量的类型声明一样，这些声明是重要的文档，对代码的阅读者有用，并且由编译器进行静态检查。

## 好软件的特征

在这篇阅读中，我们编写了一些“随意”的代码。编码通常充满了无拘无束的乐观主义：

- **糟糕的做法**：在没有测试任何代码之前编写大量代码。
- **糟糕的做法**：把所有的细节都记在脑子里，假设你（和使用你代码的每个人）会永远记住它们，而不是把它们写在代码里。
- **糟糕的做法**：假设不会出现 bug，或者 bug 会很容易找到并修复。

但是软件工程不是随意编码。工程师是悲观主义者：

- **好的做法**：每次只写一点代码，同时进行测试。在未来的课程中，我们会谈到测试优先编程。
- **好的做法**：记录代码所依赖的假设。
- **好的做法**：防止代码出错——特别是防止我们自己出错！静态检查对此有帮助。

我们这门课程的主要目标是学习如何编写以下特性的软件：

1. **安全无 bug**：我们构建的任何软件都必须具备正确性（当前正确的行为）和防御性（未来正确的行为）。
2. **易于理解**：代码必须能够与未来需要理解并修改它的程序员交流（修复 bug 或添加新功能）。这个未来的程序员可能是你自己，几个月或几年之后。如果你不写下来，你会惊讶于自己会忘记多少，而一个好的设计对你未来的自己有多大帮助。
3. **准备好应对变化**：软件总是在变化。有些设计使得更改变得容易；而另一些设计则需要抛弃并重写大量代码。



为了实现这些目标，以下是一些实践建议：

1. **写少量代码并测试**：逐步编写和测试代码，确保每一步都正确。
2. **记录假设**：在代码中记录所有假设，以便未来参考。
3. **静态检查和静态类型**：利用静态类型和静态检查工具，在编译时捕获错误。
4. **良好的注释和文档**：清晰的注释和文档可以帮助未来的程序员（包括自己）理解代码。
5. **灵活和模块化的设计**：采用模块化设计，使得代码易于更改和扩展。

# Lec 2 测试(Testing)

在今天的课程结束后，你应该能够：

- 理解测试的价值，并了解测试优先编程的过程；
- 能够判断测试套件的正确性、全面性和规模；
- 能够通过划分输入空间和选择良好的测试用例来设计函数的测试套件；
- 能够通过测量代码覆盖率来评估测试套件；
- 理解并知道何时使用黑盒测试与白盒测试、单元测试与集成测试，以及自动回归测试。

## 验证

测试是一个更广泛过程的一部分，称为验证。验证的目的是揭示程序中的问题，从而增加你对程序正确性的信心。验证包括：

- **对程序的形式化推理(Formal reasoning)，通常称为验证（Verification）**。验证通过构建一个程序正确性的形式证明来实现。手工进行验证非常繁琐，而且自动化工具支持验证仍然是一个活跃的研究领域。然而，程序中的一些小而关键的部分可能会被正式验证，例如操作系统中的调度器、虚拟机中的字节码解释器或操作系统中的文件系统。
- **代码审查**。让其他人仔细阅读你的代码，并对其进行非正式的推理，可以是一种发现错误的好方法。这就像让别人校对你写的文章一样。在另一篇阅读材料中，我们会讨论代码审查。
- **测试**。在精心选择的输入上运行程序并检查结果。



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

- 





