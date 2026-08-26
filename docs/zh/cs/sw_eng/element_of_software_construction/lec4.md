---
title: 规格
type: lecture
lecture: 4
tags: []
status: complete
---
# Lec 4 规格

规格目标

- 理解函数规格中的先决条件与后置条件，并能够编写正确的规格
- 能够根据规格写测试
- 理解如何处理异常

## 1. 介绍

规格（specifications）是团队合作的关键。没有规格，就不可能落实实现函数的责任。规格扮演着契约（contract）的角色： 实现者有责任遵守契约。规格对双方都提出了要求：当规格包含前提条件时，客户也有责任。

我们将探讨**函数规格**所扮演的角色。我们将讨论什么是前提条件和后置条件，以及它们对函数的实现者和客户意味着什么。我们还将讨论如何使用异常，这是一个重要的语言特性，不仅在 TypeScript 中，在 Python、Java 和许多其他现代语言中也都有，它使我们能够使函数接口更安全，免受错误侵害，并且更易于理解。

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

行为等价要求我们，必须在没有影响正确性前提下，进行替换。这些实现不仅性能上有差异，可能在输出上也会有差异。当 val 仅在数组中出现一次时，两个实现的行为是相同， 即返回哪个索引。如果客户对行为有其他假设，比如总是希望返回最小的索引，那么就不能替换这两个实现。例如，规格可以**要求**：`val` 在数组中只出现一次，并且返回满足 `arr[i] = val` 的索引。

> ```
> find(arr: Array<number>, val: number): number
> requires: val occurs exactly once in arr
> effects: returns index i such that arr[i] = val
> ```

**规格外的事我们不需要多管闲事**。 比如上面的`return -1`。

## 3. 为什么要规格？

我们的 find 示例展示了规格如何帮助程序既能适应更改，又能避免 bug。程序中许多最严重的 bug 都是由于对两段代码接口行为的误解而产生的。

规格对模块的客户非常有益，因为它们有助于使模块更容易理解，就像黑匣子外面的标签一样。有了规格，你无需阅读模块代码就能理解模块的功能。如果你不相信阅读规格比阅读代码更容易，请比较上面的 find 规格和下面其棘手的实现。

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

规格对函数的实现者来说非常有利，因为它们赋予了实现者自由修改实现的权限，而无需告知客户。规格还可以提高代码执行速度。我们将看到，规格可以排除函数可能被调用的某些状态。**限制输入**可能允许实现者跳过不再必要的昂贵检查，并使用更高效的实现。

契约充当客户和实现者之间的防火墙。它将客户与模块工作细节隔离开来；作为客户，如果您拥有模块的规格，则无需阅读模块的源代码。它也将实现者与模块使用细节隔离开来：作为实现者，您不必询问每个客户他们计划如何使用该模块。这道防火墙实现了解耦，允许模块代码和客户代码独立更改，只要更改符合规格——即各自遵守契约规定的义务。

## 4. 规格的结构

从抽象的角度来看，一个函数的规格说明通常有以下几个部分组成：

- 函数签名： 给出函数的名称、参数类型和返回类型
- require 子句： 描述对参数的额外限制条件
- effects 子句： 描述函数的返回值、可能抛出的异常，以及函数产生的其他影响

这些部分合在一起，构成了函数的前置条件（precondition）和后置条件（postcondition）。

**前置条件** 是函数调用者（客户端）的责任。它描述了函数被调用时程序应处于的状态。前置条件的一部分是参数的数量和类型，这部分可以由 TypeScript 静态检查。 额外的条件可以写在 requires 子句中，例如：

- 缩小参数类型（如 $x \ge 0$的整数）
- 参数之间的约束（如 val 在 arr 中恰好出现一次）

**后置条件** 是函数实现者（实现方）的责任。 TypeScript 可以静态检查后置条件的一部分，特别是返回类型。其他条件可以写在 effects 子句中，包括：

- 返回值与输入参数之间的关系
- 哪些异常会被抛出，以及在什么情况下抛出
- 哪些对象会被修改，以及如何修改

一般而言，后置条件描述的是：在函数被调用后，假设前置条件在调用前成立，那么程序在函数执行完毕后的状态应当满足的条件。整个结构可以理解为一种逻辑蕴涵关系： **如果前置条件在调用时成立，那么后置条件在函数完成后必须成立。**

如果在调用函数时，前置条件不成立，那么实现方就不再受后置条件的约束。此时函数的行为是未定义的：它可以做任何事情，包括永远不返回、抛出未在规格中说明的异常、返回任意结果，甚至随意修改对象。

![image-20250819065807250](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250819065807250.png)

## 5. TypeScript 的规格

有些编程语言（尤其是 Eiffel）把前置条件和后置条件作为语言的基本组成部分，这些条件可以由运行时系统（甚至编译器）自动检查，从而强制执行客户端与实现方之间的“契约”。

TypeScript 没有做到这一点，但它的静态类型声明实际上已经成为函数前置条件和后置条件的一部分，并且这一部分可以由编译器自动检查和保证。至于契约中无法通过类型表达的部分，就必须写在函数前面的注释中， 并且依靠人来理解、检查和保证其正确性。

一种常见的约定（最初为 Java 设计，现在 TypeScript 和 JavaScript 也采用），是在函数前写一个文档注释（documentation comment），其中：

- 用 `@param` 子句描述参数；
- 用 `@returns` 子句描述返回结果。

通常，前置条件尽量写在 `@param` 中，而后置条件写在 `@returns` 中。 例如，下面这样的函数规格：

```ts
find(arr: Array<number>, val: number): number
requires:
val occurs exactly once in arr
effects:
returns index i such that arr[i] = val
```

可以用 TypeDoc 格式写成：

```ts
/**
 * Find a value in an array.
 * @param arr array to search, requires that val occurs exactly once
 *            in arr
 * @param val value to search for
 * @returns index i such that arr[i] = val
 */
function find(arr: Array<number>, val: number): number
```

使用这种 TypeDoc 风格记录函数规格有两个好处：

1. Visual Studio Code 等编辑器可以在调用代码时自动显示这些说明，帮助开发者理解函数的用途。
2. 可以自动生成 HTML 格式的 API 文档，方便对外发布和维护。

函数规格可以讨论函数的参数和返回值，但绝不应该涉及函数的局部变量，或者函数体内部定义的辅助函数。你应该把实现细节对规格的读者“隐藏”起来。对于客户端来说，函数的实现就在防火墙后面，不可见。

函数的源代码甚至可能对规格的读者不可见，因为 TypeDoc 工具只会从代码中提取注释并渲染成 HTML。这种分离是有益的：规格让客户端无需担心（或依赖）函数的实现细节，客户端只需遵循规格即可。

## 6. 避免 Null

许多语言允许变量取特殊值，比如 Python 的 `None` 或 JavaScript/TypeScript 的 `null`，表示变量不指向任何对象。TypeScript 默认允许任何变量为 `null`，不论类型是什么：

```ts
let word: string = null;
```

这在静态类型系统中是一个漏洞，因为 `null` 并不是真正的字符串值。你无法调用它的方法或访问它的属性：

```ts
word.toLowerCase() // 会抛出 TypeError
word.length        // 会抛出 TypeError
```

特别要注意的是，`null` 与空字符串 `""` 或空数组 `[ ]` 不同。空字符串或空数组可以调用方法，访问属性，并且长度为 0；而指向 `null` 的变量无法访问长度，会抛出 TypeError。

数组可能非 null，但内部元素为 null，例如：

```ts
let words: Array<string> = [ null ];
```

这些 null 元素在使用时很可能引发错误。因此 null 值是不安全的。好的编程实践会尽量避免 null。一般约定：除非规格明确说明，否则函数的参数和返回值中不允许 null。

- 每个函数对对象或数组类型的参数都有一个隐式前置条件：它们及其集合元素必须非 null。
- 每个返回对象或数组类型的函数都有一个隐式后置条件：返回值及其集合元素必须非 null。

当 TypeScript 开启严格 null 检查时（如 6.102 配置），静态类型检查器会保证：

```ts
let word: string = null;  // 开启严格检查会报错
let words: Array<string> = [ null ]; // 开启严格检查会报错
```

如果函数允许参数或返回值为 null，需要显式声明类型，例如 `string|null`。但这种情况应尽量少用。

Google 在 Guava 项目中也有类似讨论：随意使用 null 会导致各种各样的 bug。研究发现，大约 95% 的集合不应包含 null 值，而让这些集合快速失败（fail fast）比默默接受 null 对开发者更有帮助。

此外，null 含义模糊。例如 Java 的 `Map.get(key)` 返回 null 可能表示该 key 对应的值是 null，也可能表示 map 中没有这个 key。null 可以表示失败，也可以表示成功，几乎什么都可能。使用非 null 的方式能让含义更清晰。

## 7. 区分 Null 和空值

在 Python 中，`None` 不同于空字符串 `""`、空数组 `[ ]` 或空字典 `{ }`。空对象只是没有元素，但仍然是合法对象，可以使用其类型允许的所有操作。例如：

```python
len("")  # 返回 0
"" + "a" # 返回 "a"
```

而对 `None` 使用相同操作会报错：

```python
len(None)   # 报错
None + "a"  # 报错
```

同样的概念也适用于 TypeScript：`null` 不是有效的字符串、数组、Map 或其他对象；但空字符串 `""` 和空数组 `[ ]` 是有效值。

因此，除非规格明确禁止，空值总是允许作为参数或返回值。

## 8. 测试与规格

在测试中，我们区分黑箱测试（black box tests）和玻璃箱测试（glass box tests）：

- **黑箱测试**只根据函数的规格来选择测试用例，不依赖实现细节。
- **玻璃箱测试**则会参考具体实现来选择测试用例，但仍然必须遵循规格。

即使是玻璃箱测试，也不能依赖实现的额外行为或未定义行为。测试用例必须正确，遵守规格，就像任何其他客户端一样。

例如，考虑下面这个 `find` 函数的规格：

```ts
find(arr: Array<number>, val: number): number
requires:
val occurs in arr
effects:
returns index i such that arr[i] = val
```

这个规格要求 `val` 必须存在于数组中（强前置条件），但对返回哪个索引没有规定（弱后置条件）。即使你的实现总是返回最小索引，测试用例也不能假设这一点：

```ts
let array: Array = [7, 7, 7];
let i = find(array, 7);
assert.strictEqual(i, 0);  // 错误：假设了规格未承诺的行为
assert.strictEqual(array[i], 7);  // 正确
```

同样，即使实现会在找不到 `val` 时抛出异常，测试也不能假设这种行为，因为调用时不能违反前置条件。

**玻璃箱测试的意义**在于找出能覆盖实现不同部分的新测试用例，但断言必须以规格为依据，而不是依赖实现细节。

### 测试单元

以搜索引擎的例子为例：

```ts
/** 
 * @returns 返回文件内容
 */
function load(filename: string): string { ... }

/** 
 * @returns 返回字符串 s 中的单词数组，单词定义为连续的非空白非标点字符
 */
function extract(s: string): Array<string> { ... }

/**
 * @returns 返回一个索引 Map，将单词映射到包含该单词的文件名集合
 */
function index(filenames: Set<string>): Map<string, Set<string>>  {
    ...
    for (let file of files) {
        let doc = load(file);
        let words = extract(doc);
        ...
    }
    ...
}
```

单元测试（unit testing）强调独立测试程序模块，每个测试只关注单个规格。一个函数的单元测试不应因为其他函数未满足规格而失败。例如，测试 `extract()` 时不应依赖 `load()` 的实现。

良好的集成测试（integration tests）会确保不同函数的规格兼容，但不能替代系统设计的单元测试。例如，如果只通过 `index()` 测试 `extract()`，只能覆盖 `load()` 输出可能产生的输入空间，而可能遗漏其他情况。

### 所有测试必须遵循规格

不能测试前置条件被违反时的行为，例如不能检查函数在非法输入下是否“快速失败”，因为测试必须遵循规格。如果前置条件可以合理检查，有时可以修改规格：去掉前置条件，把行为定义到后置条件中（如使用异常或特殊返回值）。

## 9. 可变函数的规格

前面讨论了可变对象与不可变对象，但规格示例中还未说明如何描述副作用（对可变对象或输入/输出状态的修改）。例如，可变函数 `addAll` 的规格：

```text
addAll(array1: Array<string>, array2: Array<string>): boolean
requires:
array1 和 array2 不是同一个对象
effects:
将 array2 的元素添加到 array1 末尾，如果 array1 被修改则返回 true
```

- 后置条件描述了 `array1` 的修改方式和返回值判断。
- 前置条件确保 `array1` 不能等于 `array2`，否则行为未定义（可能无限循环或内存错误），规格允许这种结果。

另一个可变函数示例：

```text
sort(array: Array<string>): void
requires:
无
effects:
将数组排序，使得 array[i] ≤ array[j] 对于所有 0 ≤ i < j < array.length
```

非可变函数示例：

```text
toLowerCase(array: Array<string>): Array<string>
requires:
无
effects:
返回新数组 t，t[i] = array[i].toLowerCase()
```

默认情况下，函数不允许修改输入对象，除非规格明确说明。`toLowerCase` 的规格没有提到修改输入，因此假定不修改。

在 TypeDoc 中，修改参数的副作用可以在对应的 `@param` 注释中说明：

```ts
/**
 * 对数组进行排序。
 * @param array - 会被修改为排序后的顺序，使得
 *     array[i] ≤ array[j] 对于所有 0 ≤ i < j < array.length。
 */
function sort(array: Array<string>): void { ... }
```

![image-20251020235512991](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251020235512991.png)

## 10. 异常

现在我们已经开始编写规格说明，并考虑函数的使用者该如何使用函数了，那么就该讨论一下如何安全、清晰地处理异常情况。因为异常（exception）是函数的一种可能输出，所以在必要时应当在函数的后置条件中描述它。可以在文档注释中用`@throws` 来记录异常。下面讲解何时应该在规格说明中写异常，何时不该写。

### 用于标识程序错误的异常

在 Python 或 TypeScript 编程中，你可能已经见过一些异常，例如：

- `IndexError`：当访问数组索引 `array[i]` 超出范围时抛出
- `KeyError`：当在字典中查找一个不存在的键 `dict[key]` 时抛出
- `TypeError`：表示动态类型错误，例如尝试在 `None` 上调用方法

在 TypeScript 中，也有 `TypeError` 来表示动态类型错误，但大多数动态错误是通过通用的 `Error` 类来表示的。

这些异常通常意味着程序中存在 bug —— 无论是客户端代码还是函数实现中的错误。 当异常被抛出时，其显示的信息通常有助于你定位和修复错误。

这类**用于标识错误的异常不属于函数的后置条件**，因此**不应该写在 `@throws` 中**。例如，`TypeError` 一般不应该出现在规格说明里。

函数参数的类型属于**前置条件**（precondition）的一部分——也就是说，如果客户端违反了类型要求（比如传入 `null`），函数可以抛出 `TypeError` 而无需在规格里提前说明。

举个例子，下面这个函数的规格中不会提及 `TypeError`：

```ts
/**
 * @param array 要转换为小写的字符串数组
 * @returns 新的数组 t，长度与 array 相同，
 *          对于所有合法索引 i，t[i] 是 array[i] 的小写形式
 */
function toLowerCase(array: Array<string>): Array<string>
```

### 用于表示可预期失败的异常

异常并不仅仅用于标识 bug，它们也可以用来表示**可预期的失败情况**，
 让调用者能够捕获这些异常并作出相应处理。

当异常用于这种**预期失败**的情况时，就应该用 `@throws` 来记录：
 说明在什么条件下会发生这种失败。

例如：

```ts
/**
 * 计算整数平方根。
 * @param x 要求平方根的整数
 * @returns x 的平方根
 * @throws NotPerfectSquareError 如果 x 不是完全平方数
 */
function integerSquareRoot(x: number): number
```

另一个例子是改进版的 `addAll` 规格：

```ts
/**
 * 如果 array1 !== array2，则将 array2 的所有元素添加到 array1 的末尾。
 * @returns 如果 array1 发生改变则返回 true
 * @throws AliasingError 如果 array1 === array2
 */
function addAll(array1: Array<string>, array2: Array<string>): boolean
```

在原先的 `addAll` 规格中， `array1 !== array2` 被写成一个**前置条件**： 也就是说，函数的行为在违反该条件时是未定义的。

而在这个新版本中，前置条件被移除，取而代之的是一个更完整的后置条件—— 当两个数组是不同对象时（`adds the elements...` 以及 `@returns` 说明）函数有正常行为； 当两个数组是同一个对象时，则通过 `@throws` 明确说明函数会抛出异常。

## 11. 特殊结果

当调用者无法处理问题（例如传入非法输入，这通常意味着调用者或其上层代码存在 bug）时，最合适的做法是抛出异常（exception）。

对于那些调用者**应该准备好去处理的特殊或异常结果**，不同编程语言有不同的设计。

在 Java 中，函数实现者可以声明某个函数会抛出异常，编译器会强制要求调用者处理这些异常：要么用 `try...catch` 捕获；要么在自己的函数上继续声明 `throws`。
 如果两者都没有做，编译时会报错。

但 **TypeScript 没有这样的静态检查机制**。这意味着，如果你用异常去表达“特殊结果”，很容易引发 bug。

例如，我们有一个 `integerSquareRoot` 函数（计算整数平方根），如果输入不是完全平方数，它会抛出 `NotPerfectSquareError`。假设我们从文件或用户输入中读取数据，而忘记用 try...catch 去捕获异常，那么程序在遇到非法输入时会直接崩溃，而不是输出提示信息。 TypeScript 缺乏静态检查，让这种错误在编译期无法发现。

一种更好的方式是使用联合类型来表达“特殊情况”的返回值。

```ts
/**
 * Compute the integer square root.
 * @param x integer value to take square root of
 * @returns square root of x if x is a perfect square, undefined otherwise
 */
function integerSquareRoot(x: number): number|undefined
```

`undefined` 与 `null` 类似，在 JavaScript 中，声明但未初始化的变量值是 `undefined`。 如果不开启严格空值检查（strict null checking），任意变量都可能是 `undefined` 或 `null`。 但开启严格检查后，两者都会被排除。

通常， `null` 表示“这是一个空值（no value）”，应该尽量避免。`undefined` 表示“这里没有值（no value here at all）”，在严格模式下可以用它表示“特殊情况的结果”

类型系统如何防止遗漏处理？ TypeScript 会在静态检查时强制你考虑返回值可能是 `undefined` 的情况：

```ts
let twice = integerSquareRoot(input) * 2; // 静态错误
if (integerSquareRoot(input) > 4) { ... } // 静态错误
```

正确的使用方式，你需要在调用后显式检查返回值是否为 `undefined`：

```ts
let root = integerSquareRoot(input); // root 的类型是 number | undefined
if (root === undefined) {
    // 在这个分支中，TypeScript 知道 root 的类型是 undefined
    ...
} else {
    // 在这个分支中，TypeScript 知道 root 的类型是 number
    let twice = root * 2; // 现在合法
    ...
}
```

如果你确定“返回 undefined”表示程序出现 bug，可以直接用断言：

```ts
let root = integerSquareRoot(input);
assert(root !== undefined); // 若通过此断言，则 root 一定是 number
let twice = root * 2; // 合法
```

或者更简洁地用空值合并操作符

```ts
let root = integerSquareRoot(input) ?? assert.fail('root is undefined');
// root 类型现在就是 number
let twice = root * 2;
```

### 缺失的 Map  键

在 python 中

```python
zoo = { 'Tim': 'beaver' }
zoo['Tim']     # => 'beaver'
zoo['Bao Bao'] # => raises KeyError: 'Bao Bao'
```

但在 TypeScript 中：

```ts
const zoo = new Map([['Tim', 'beaver']]);
zoo.get('Tim');     // => 'beaver'
zoo.get('Bao Bao'); // => undefined
```

在 Python 中，postcondition（后置条件）声明会抛出异常；在 TypeScript 中，`Map<V>` 的 `get()` 方法返回类型是 `V | undefined`

### 非法数组索引

```ts
const zoo = [ 'Tim' ];
for (let i = 0; i <= 1; i++) {
  let name: string = zoo[i];
  console.log(`Hello, ${name}!`);
}
// 输出：
// Hello, Tim!
// Hello, undefined!
```

`zoo[i]` 的类型可能是 `undefined`，但 TypeScript 却允许赋值给 `string` 类型的变量。 这是因为默认情况下，TypeScript **不会检查数组索引越界**。

要修复这种漏洞，可以开启编译选项 `noUncheckedIndexedAccess`，这样 `zoo[i]` 的返回类型就会自动变成 `string | undefined`。 此选项在 6.102 课程中目前是关闭的，但之后会开启。启用后，你就必须在代码中显式检查索引是否合法，或者避免直接使用下标访问。

## 12. 模块

本节主要讲的是函数的规格说明，但在 TypeScript/JavaScript 和 Python（以及许多其他语言）中，还存在比函数更高一级的抽象——**模块（module）**，模块允许我们把一组相关的函数组织在一起。

要注意，这里“模块”一词在编程语言中的用法，与计算机科学中“模块”这个更广泛的概念有些命名冲突。在计算机科学的一般意义上，模块可以是函数、类、库等代码单元。 而在 Python 和 TypeScript/JavaScript 中，“模块”是语言层面的特定机制。不过，Python 和 TS/JS 中的模块依然符合“模块”这一广义概念。

在现代 TypeScript/JavaScript 中，**每一个文件就是一个模块**。一个模块可以通过 `export` 关键字导出特定的函数、常量或自定义类型。

模块的使用者必须通过 `import` 从该模块导入所需内容。 导入时可以选择：

- 仅导入特定函数；
- 或导入模块导出的全部内容。

一个模块的规格说明（specification）是它所有导出成员（函数、常量、自定义类型等）的规格说明的集合。而未导出的函数和变量是模块实现内部的私有内容，就像函数体内部的局部变量或辅助函数一样。 它们不属于模块规格的一部分，因为外部使用者（客户端）无法访问或依赖这些内部内容。

Python 的模块机制也类似，只不过：

- Python 没有显式的 `export` 声明；
- 模块导出的内容通过**命名约定**（例如以下划线 `_` 开头的名称被视为内部实现）或特殊变量 `__all__` 来控制。
