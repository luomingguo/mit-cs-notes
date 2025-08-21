# Lec 4 规范

[toc]



**规范（specifications）目标**

- 理解函数规范中的先决条件与后置条件，并能够编写正确的规范
- 能够根据规范写测试
- 理解如何处理异常



## 1. 介绍

规范是团队合作的关键。没有规范，就不可能落实实现函数的责任。规范扮演着契约（contract）的角色： 实现者有责任遵守契约。规范对双方都提出了要求：当规范包含前提条件时，客户也有责任。

我们将探讨**函数规范**所扮演的角色。我们将讨论什么是前提条件和后置条件，以及它们对函数的实现者和客户意味着什么。我们还将讨论如何使用异常，这是一个重要的语言特性，不仅在 TypeScript 中，在 Python、Java 和许多其他现代语言中也都有，它使我们能够使函数接口更安全，免受错误侵害，并且更易于理解。

## 2. 行为等价

假设你正在编写一个包含此函数的程序，该函数用于查找数组中整数的索引：

```ts
function find(arr: Array<number>, val: number): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
}
```

find 函数在程序中有很多客户（函数被调用的地方）。当 find 函数传入一个大数组时，它找到的值很可能要么靠近数组的开头，要么靠近结尾，也就是一快一慢。所以，你想出了一个巧妙的办法，通过同时从数组的两端搜索来加快速度：

```ts
function find(arr: Array<number>, val: number): number {
    for (let i = 0, j = arr.length-1; i <= j; i++, j--) {
        if (arr[i] === val) return i;
        if (arr[j] === val) return j;
    }
    return -1;
} 
```

行为等价要求我们，必须在没有影响正确性前提下，进行替换。这些实现不仅性能上有差异，可能在输出上也会有差异。当val仅在数组中出现一次时，两个实现的行为是相同， 即返回哪个索引。如果客户对行为有其他假设，比如总是希望返回最小的索引，那么就不能替换这两个实现。例如，规范可以**要求**：`val` 在数组中只出现一次，并且返回满足 `arr[i] = val` 的索引。

> ```
> find(arr: Array<number>, val: number): number
> requires: val occurs exactly once in arr
> effects: returns index i such that arr[i] = val
> ```

**规范外的事我们不需要多管闲事**。 比如上面的`return -1`。

## 3. 为什么要规范？

我们的 find 示例展示了规范如何帮助程序既能适应更改，又能避免 bug。程序中许多最严重的 bug 都是由于对两段代码接口行为的误解而产生的。

规范对模块的客户非常有益，因为它们有助于使模块更容易理解，就像黑匣子外面的标签一样。有了规范，你无需阅读模块代码就能理解模块的功能。如果你不相信阅读规范比阅读代码更容易，请比较左侧的 find 规范和右侧其棘手的实现。

```ts
find(arr: Array<number>, val: number): number
require: `val` occurs exactly once in `arr`
effects: return index i such that arr[i] = val
```

```ts
function find(arr: Array<number>, val: number): number {
    for (let i = 0, j = arr.length-1; i <= j; i++, j--) {
        if (arr[i] === val) return i;
        if (arr[j] === val) return j;
    }
    return -1;
}
```

规范对函数的实现者来说非常有利，因为它们赋予了实现者自由修改实现的权限，而无需告知客户。规范还可以提高代码执行速度。我们将看到，规范可以排除函数可能被调用的某些状态。**限制输入**可能允许实现者跳过不再必要的昂贵检查，并使用更高效的实现。

契约充当客户和实现者之间的防火墙。它将客户与模块工作细节隔离开来；作为客户，如果您拥有模块的规范，则无需阅读模块的源代码。它也将实现者与模块使用细节隔离开来：作为实现者，您不必询问每个客户他们计划如何使用该模块。这道防火墙实现了解耦，允许模块代码和客户代码独立更改，只要更改符合规范——即各自遵守契约规定的义务。



![image-20250819065807250](http://47.115.50.83:49153/i/image-20250819065807250.png)

## 4. 规范的结构



## 5. TypeScript的规范





## 6. 避免Null



