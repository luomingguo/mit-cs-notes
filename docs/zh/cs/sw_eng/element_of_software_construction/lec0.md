---
title: TypeScript 基础
type: lecture
lecture: 0
tags: []
status: complete
---
# Lec 0 TypeScript 基础

[toc]

本节 Lec 目标是

- 学习基本的 JS 和 TS 的语法和语义
- 从写 Python 转换到写 TS

## 1.  运行时快照图

为了理解微妙问题，画图我们来说很有用，图反映了运行时系统发生了什么。快照图（Snapshot diagrams）代表了程序运行时的内部状态——帧栈 和 堆

这是我们需要快照图的原因：

- 与其他人交流
- 阐述诸如 不变量（immutable values） 与 不可重新赋值的引用（unreassignable references）、指针别名、堆与栈、抽象和具体表示等等
- 为后续课程更丰富的设计符号奠定基础。

即便课程的图是来自 TS，但是在符号可以应用在任何现代编程语言，e.g. Python、Java、C++、Ruby。

最简单的例子就是两个指向常数的变量：

```ts
let n: number = 1;
let x: number = 3.5;
```

![Screenshot 2025-08-19 at 06.08.35](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/Screenshot 2025-08-19 at 06.08.35.png)

当我们想展示值的类型，或者更多内部结构细节，可以用其类型名的圆形标签框住

![image-20250819060909051](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819060909051.png)

快照图目的是为了灵活性，没必要一直展示所有细节可以简化。比如

```ts
let s: string ="hello"
```

![image-20250819061210904](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819061210904.png)

## 2. 可变值 vs. 可重新赋值变量

快照图使得可以可视化 改变一个变量 和改变一个值的区别：

- 当你复制给一个变量或者域，你在改变变量的指针，你能指向不同值
- 当时在改变一个可变对象的内容时——比如数组——你正在改变值内部的引用；

### 2.1 重新赋值 和 不可变值

比如我们有 string 变量 **s**，我们可以将其重新指派，从"a"到"ab"

```ts
let s: string = "a";
s = s + "b"
```

![image-20250819061627757](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819061627757.png)

sting 是不可变类型，当被创建后就不可更改其值；不可变性也是这门课的主要设计。

### 2.2 可变值

相反，数组就是可变独享，它有方法能够改变这个对象的值

```ts
let arr: Array<string> = ["a"];
arr.push("b");
```

可变性和不可变性的区别能让我们代码从安全变成 bugs。

![image-20250819061929049](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819061929049.png)

### 2.3 不可重新赋值引用

TS 还有 不可变性的引用： 变量被赋值一次，且不能再重新赋值。为了一个引用不可变，从`const`关键字让其使然。

```ts
const n:number = 5；
```

在快照图中，我们用双箭头表示不可重新赋值引用。我们可以将不可重新赋值引用指向可可变值。

```ts
const arr: Array<string> = ["a"]
arr.push("B")
```

![image-20250819062411431](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819062411431.png)
