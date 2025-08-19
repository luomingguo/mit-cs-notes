# Lec 13 调试

今天的话题是调试。

首先我门首先讨论避免调试——要么完全避免调试，要么让调试变得容易。有些时候必须得调试——特别需要重复尝试或者说整个系统一起工作出现的bug，很难定位某个模块。针对这些情况，我们提出一个通用加快调试的系统策略。

《Why Programs Fail》是关于这方面的。这节内容也是主要参考这本书。

《How to Debug》by John Regehr，是关于嵌入式系统课程，更底层但是原理通用。

《Bebugging: The Nine Indispensable Rules for Finding Even the Most Elusive Software and Hardware Problems》是一个很好的实践指引。



## 一堆臭名昭著的bug

开始之前回顾下试图解决的问题，列举一些常见的bug类型。

### 别名bug

Aliasing bug，当两个或多个引用指向一个可变对象，而其中一个修改了，另外一个却希望她保持不变，就会出现这种bug。

### 下表偏移

off-by-on bug，这类bug包括：

- 0 起始和 1起始的索引混淆
- 循环终止条件出错：当你反向遍历数组时，终止条件应该是 `i > 0` 还是 `i >= 0`？又比如你在处理相邻元素对 `a[i]` 和 `a[i+1]` 时，终止条件该是 `i < a.length` 还是 `i < a.length - 1`？
- 栅栏柱 Bug（Fencepost bug）：如果你有 `n` 根横杆的围栏，需要多少根立柱？

等等等等

## 第一道防线： 让bug变得不可能

最好的方法就是通过设计让bug不能发生。一个方法就是我们提到过的静态检查。他能在编译期消除bug

我们看到过一些动态检查的例子。Python 通过动态检查避免了数组越界错误：当你尝试使用超出列表范围的索引时，Python 会自动抛出错误。相比之下， JS表现就差一点，它在读取越界元素时不会报错，而是悄悄返回`undefined`。 而在2024年，National Cyber Director发布一个report，阐述了改进网络安全实践的多种方式，其中包括逐步淘汰不具备内存安全的编程语言，如C和C++

不可变性（immutability）是另一种可以防止BUG的设计原则，它有另种常见形式。

- 不可变类型（immutable types）
- 不可重新赋值的引用（unreassgnable references），也就是常量。

TS提供了不可重新赋值的引用，通过关键字 `const`声明变量，`const`声明的变量只能被复制一次，之后就不能重新赋值。在声明局部变量时，尽可能使用const是一种好习惯。就像变量的类型的一样，也是重要的文档信息。

看一个例子

```ts
const letters: Array<string> = ['a', 'e', 'i', 'o', 'u'];
```

这种变量letters 使用const声明的，下面那一条是合法的。

```ts
letters = ['x', 'y', 'z']; //?
letters[0] = 'z'; //?
```

要特别小心对`const`的理解，它只限制变量引用本身不能被重新赋值，但引用所指向的对象本身仍然可能是可变的。

