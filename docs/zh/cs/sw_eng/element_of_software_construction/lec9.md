---
title: 函数式编程
type: lecture
lecture: 9
tags: []
status: complete
---
# Lec 9 函数式编程

我们将探讨多种用于操作元素序列的设计模式，并展示如何将函数本身视为一等公民（即可在程序中自由传递和操作的值），这一理念的强大之处。我们将学习一下概念。

- 迭代器与生成器
- Map/Filter/reduce
- 高阶函数
- 不可变性

## 一等函数

我们从复习一个重要的核心理念开始，函数是一等数据值，意味着他们能够存储在变量里面，作为函数的参数进行传递，也能动态创建。举个例子，`Math.sqrt`是是对表示`sqrt`函数的对象的引用，这种对象的类型为 `(x: number) => number`，你可以将该函数赋值给其他变量，其行为不变：

```ts
const mySquareRoot: (x: number) => number = Math.sqrt;
mySquareRoot(16.0); // return 4.0
```

此处 `mySquareRoot` 的类型是函数类型表达式。注意参数名（如 x） 不可省略。若写成 `(number) => number`，实际表示“参数名为 `number`、类型隐式为 `any` 的函数”。

你还能将函数的引用作为参数传递给其他函数，或者作为返回值，再或者存储在变量和数据结构中。换句话说，函数在 TypeScript 就是一等公民，意味着他们能够被认为是编程语言中任何值。

编程语言中有大量的非一等公民的东西。例如，访问控制就不是一等公民——你不能将 public 或 private 作为参数传递给函数，也不能将其存储在数据结构中，TypeScript 无法在运行时引用或操作它们。

在旧的编程语言中，只有数据是一等公民：内置类型（如数字）和用户定义类型。但在现代编程语言中，如 Python 和 JavaScript，数据和函数都是一等公民。**函数作为一等公民**是一种非常强大的编程思想。第一个使用它们的实用编程语言是 Lisp，由 MIT 的 John McCarthy 发明。但将函数作为一等公民值进行编程的想法实际上早于计算机，可以追溯到 Alonzo Church 的 lambda 演算。lambda 演算使用希腊字母 λ 来定义新函数；这个术语流传甚广，你会发现它不仅在 Lisp 及其后代语言中是一个关键词，在 Python 中也是如此。

### TypeScript 中的函数表达式

我们早已在测试框架（如 Mocha）中使用函数表达式：

```ts
describe("Math.max", function() {  // 函数表达式作为参数
  it("covers a < b", function() {  // 嵌套函数表达式
    assert.strictEqual(Math.max(1, 2), 2);
  });
});
```

这段代码包含两个函数表达式——第一个函数表达式作为参数传递给 describe()，第二个函数表达式（嵌套在 describe() 内部）作为参数传递给 it()。

TypeScript 还具有更紧凑的箭头语法，无需使用 function 关键字：

```ts
describe("Math.max", () => {
  it("covers a < b", () => {
    assert.strictEqual(Math.max(1, 2), 2);
  });
});
```

如果函数主体仅由单个表达式组成（即像 Python lambda 表达式），那么甚至可以省略花括号。

```ts
it("covers a < b", () => assert.strictEqual(Math.max(1, 2), 2) );
```

但事实证明，箭头函数和函数表达式之间存在一个技术差异，这在使用方法时非常重要：函数表达式可以重新定义 this，但箭头函数会从其上下文中使用 this 的定义。因此，箭头函数应始终在实例方法中使用，而不是函数表达式。《理解 JavaScript 中的 This、Bind、Call 和 Apply》很好地解释了 JavaScript 中 this 含义背后的问题。

## 抽象化控制

在这一节中，我们将讨论 map/filter/reduce，这是一种设计模式，可以显著简化那些对元素序列进行操作的函数的实现。

在这个例子中，我们会处理大量的序列——文件数组、输入流（它是一系列行的序列）、以及每行中的词语序列。通过使用 map/filter/reduce，我们能够在代码中完全不写显式的控制语句——没有一个 for 循环，也没有一个 if 语句。

假设我们有这样一个问题：编写一个函数，找出项目中所有 TypeScript 文件里的单词。

遵循良好的编程实践，我们把这个任务拆分成几个更简单的步骤，并为每个步骤编写一个函数：

1. 从项目根目录开始，递归扫描所有文件；
2. 过滤出具有特定后缀的文件，在这里是 `.ts` 文件；
3. 打开每个文件，逐行读取；
4. 将每一行拆分成单词。

在为这些子步骤编写函数时，我们会发现自己写了很多底层的迭代代码。例如，下面这个函数展示了如何递归遍历项目文件夹：

```ts
import fs from 'node:fs';
import path from 'node:path';

/**
 * 找出以 folder 为根目录的文件系统子树中所有文件的名称。
 * @param folder 子树根目录，要求 fs.lstatSync(folder).isDirectory() === true
 * @returns 所有普通文件（非文件夹）的名称数组，这些文件以 folder 作为它们的祖先目录。
 */
function allFilesIn(folder: string): Array<string> {
    let files: Array<string> = [];
    for (const child of fs.readdirSync(folder)) {
        const fullNameOfChild = path.join(folder, child);
        if (fs.lstatSync(fullNameOfChild).isDirectory()) {
            files = files.concat(allFilesIn(fullNameOfChild));
        } else if (fs.lstatSync(fullNameOfChild).isFile()) {
            files.push(fullNameOfChild);
        }
    }
    return files;
}
```

下面这个是过滤函数，它将文件数组限定为只包含 TypeScript 文件。
 假设我们这样调用它：`onlyFilesWithSuffix(files, ".ts")`。

```ts
/**
 * 过滤文件数组，只保留那些以特定后缀结尾的文件。
 * @param filenames 文件名数组
 * @param suffix 要匹配的后缀字符串
 * @returns 一个新数组，只包含那些以 suffix 结尾的文件。
 */
function onlyFilesWithSuffix(filenames: Array<string>, suffix: string): Array<string> {
    const result: Array<string> = [];
    for (const f of filenames) {
        if (f.endsWith(suffix)) {
            result.push(f);
        }
    }
    return result;
}
```

## 迭代器

在学习 map/filter/reduce 之前，我们先看一种更简单的针对序列的设计模式，它同样能抽象掉控制流程的细节。 迭代器 是一种对象，用来依次遍历一个序列中的元素，并逐个返回它们。在 TypeScript 中，当你使用 `for...of` 循环遍历数组时，实际上底层使用的就是迭代器。

一个 `Iterator<T>`（表示对类型为 `T` 的元素集合的迭代器）有一个方法：`next()` 返回一个对象 `{done: boolean, value?: T}`

- 当 `done` 为 `false` 时，`value` 是集合中的下一个元素；
- 当 `done` 为 `true` 时，表示已经没有更多元素了。

例如，下面这段代码：

```ts
let filenames: Array<string> = ...;
for (const f of filenames) {
    console.log(f);
}
```

TypeScript 实际上会把它翻译成如下等价的代码（忽略了一些细节）：

```ts
let filenames: Array<string> = ...;
let iter: Iterator<string> = filenames.iterator();
for (let result = iter.next(); ! result.done; result = iter.next()) {
    const f: string = result.value;
    console.log(f);
}
```

需要注意的是，`next()` 是一个修改器操作（mutator）： 它不仅返回一个元素，还会推进迭代器，使下一次调用 `next()` 返回下一个元素。

**为什么需要迭代器？**

因为存在许多不同的集合数据结构（链表、映射、哈希表等），它们的内部表示差异很大。迭代器的概念提供了一种统一的访问方式，这样客户端代码就能更简单，而集合的具体实现也可以改变而不影响迭代代码。

但这种写法依赖于 `Array` 的 `length` 属性和索引操作 `[..]`，在其他数据结构中（比如 `Set`），这些可能不同，甚至不存在。 `Set` 用 `size` 表示长度，而且没有索引操作。 迭代器设计模式把这些细节都抽象掉，使我们能用同样的 `for...of` 循环遍历多种不同的数据结构。

现在，大多数现代编程语言（包括 Python、C#、Ruby）都使用迭代器的概念。它是一种高效的设计模式——对常见问题的成熟解决方案。map/filter/reduce 也是类似的设计模式，接下来我们也会学习其他这种模式。

### 迭代器 vs. 可迭代对象

**可迭代对象（Iterable）** 表示一个可以被迭代的元素序列。 在 TypeScript 中，`Iterable<T>` 接口代表这种类型。它要求对象实现一个 `iterator()` 方法，该方法返回一个新的 `Iterator` 对象。 Python 中也有类似的概念，只不过方法名叫 `__iter__`。

**迭代器（Iterator）** 本身并不代表整个序列。它的状态表示在遍历序列过程中的某个特定位置（即表示**剩余部分**）。迭代器是一个**可变对象**：每次调用 `next()`，它都会前进一个元素， 之前的元素将无法再通过该迭代器访问。 一旦迭代到结尾，就不能重置回起点。

因此，当你在程序中处理序列（例如存入变量、作为函数参数传递或返回时），你应该使用**可迭代类型（Iterable）**，而不是直接使用 `Iterator`。通常这些可迭代类型是具体的集合类型，如 `Array` 或 `Set`。 但如果你的函数不依赖这些类型的特定操作，只需要能用 `for...of` 遍历， 那么就应该使用更抽象的超类型 `Iterable`。

### 自定义迭代器

为了更好地理解迭代器是如何工作的，下面是一个针对 `Array<string>` 的简单实现。为了简化，我们让 `next()` 返回 `string | undefined`—— 即返回数组中的下一个值，或在遍历结束时返回 `undefined`。
 （注意：标准的 `Iterator<T>` 接口不能这样定义，因为 `undefined` 可能本身就是 `T` 类型的一个有效元素。）

```ts
/**
 * MyIterator 是一个可变对象，用于遍历 Array<string> 中的元素，
 * 从第一个到最后一个。
 * 这里只是演示迭代器的工作原理；
 * 实际上，你应当使用数组自带的迭代器（通过 iterator() 方法返回）。
 */
class MyIterator {

    private readonly array: Array<string>;
    private index: number;
    // AF(array, index) = 表示从 array[index] 到 array[array.length - 1] 的元素序列
    // RI: index 是非负整数

    /**
     * 构造一个迭代器。
     * @param array 要遍历的数组
     */
    public constructor(array: Array<string>) {
        this.array = array;
        this.index = 0;
    }

    /**
     * 获取数组的下一个元素。
     * 修改：推进迭代器，使其指向下一个元素。
     * @returns 下一个元素；若没有更多元素则返回 undefined。
     */
    public next(): string | undefined {
        if (this.index >= this.array.length) {
            return undefined;
        } else {
            const value = this.array[this.index];
            ++this.index;
            return value;
        }
    }
}
```

### 可变性会使简单的契约变复杂

这是可变类型的一个根本性问题。对同一个可变对象的多个引用（别名）可能意味着程序中多个地方——甚至是相距很远的地方——都依赖于该对象保持一致性。

用规范来说，契约不再能仅在一个地方强制执行，例如类的客户端和实现者之间。涉及可变对象的契约现在依赖于拥有该对象引用的每一个人的良好行为。

这种非局部契约现象的一个例子是迭代器。试着找一下文档中对客户端的关键要求——也就是在迭代数组时不应该修改数组——的说明。谁负责这个？迭代器规范？数组？你能找到吗？

需要考虑这种全局属性，使得理解和保证可变数据结构程序的正确性更加困难。我们仍然经常使用可变数据结构——为了性能和便利——但这样做的代价是容易引入错误。

因此，函数式编程在很大程度上避免使用可变性。下面讨论的 map/filter/reduce 模式会产生新的元素序列，而不是修改已有序列；**传给 map/filter/reduce 的一等函数通常是纯函数，它们返回输出，而不修改任何输入**。

### 可变性破坏了迭代器

我们来尝试用迭代器做一个简单的任务。假设我们有一个文件名数组，例如 `["a.txt", "b.txt", "c.pdf"]`。我们希望实现一个函数 `removeFilesWithExtension`，删除数组中具有特定扩展名（如 `.txt`）的文件名，保留其他文件名。在这个例子中，函数应当删除 `"a.txt"` 和 `"b.txt"`，最终剩下 `["c.pdf"]`。

遵循测试优先编程，我们先写规范，选择并实现覆盖一些划分的测试用例，最后使用 `MyIterator` 类实现函数：

```ts
/**
 * Remove filenames with a given extension.
 * Modifies the filenames array by removing filenames that end with the extension.
 * 
 * @param filenames array of filenames
 * @param extension must start with ".", e.g. ".txt"
 */
function removeFilesWithExtension(filenames: Array<string>, extension: string): void {
    let iter: MyIterator = new MyIterator(filenames);
    for (let filename = iter.next(); filename !== undefined; filename = iter.next()) {
        if (filename.endsWith(extension)) {
            // remove the filename from the array
            filenames.splice(filenames.indexOf(filename), 1);
        }
    }
}
```

现在我们运行测试用例，结果几乎正确。但有一个测试失败：

```ts
// removeFilesWithExtension(["a.txt", "b.txt", "c.pdf"], ".txt")
//   expected ["c.pdf"], actual ["b.txt","c.pdf"]
```

结果不正确：`removeFilesWithExtension` 没有删除数组中一个匹配的文件名！为什么会这样？跟踪执行过程就会发现问题。画一个快照图来显示 `MyIterator` 对象和数组对象，并在跟踪代码时更新它，会很有帮助。

注意，这不仅仅是我们 `MyIterator` 的问题。数组的内置迭代器也会遇到同样的问题，使用语法糖的 `for` 循环也会出现这个问题。Python 的列表和 `for` 循环同样如此。在遍历列表的同时修改它，通常是不安全的。

### TypeScript 中的生成器函数

在离开迭代器之前，我们介绍一个处理元素序列的有用语言特性，你可能在 Python 中见过：生成器函数。生成器函数在调用时实现了 Iterator，通过 yield 语句产生序列的每个元素，并在调用者请求下一个元素时恢复控制权。

像 Python 一样，TypeScript/JavaScript 也支持生成器函数，yield 的使用方式相同。一个关键区别是，TypeScript/JavaScript 要求生成器函数必须显式使用 `function*` 声明（而不是普通的 `function`）。示例生成器：

```ts
function* odds(): Generator<number> {
  for (let i = 1; true; i += 2) {
    yield i;
  }
}

function* addConstant(sequence: Iterable<number>, k: number): Generator<number> {
  for (const x of sequence) {
    yield x + k;
  }
}
```

调用生成器函数时，会返回 `Generator<T>`，T 为元素类型。Generator 是下面两种类型的子类型：

- Generator 是 Iterable，当请求迭代器时返回自身
- Generator 也是 Iterator，因此只能迭代一次。`next()` 操作执行生成器函数直到 `yield`，然后暂停，直到再次调用 `next()` 时从暂停点继续执行

使用生成器函数时，需要注意：**调用生成器函数**的结果本质上是一个 Iterator，这意味着它是可变的，使用后会被消耗，不能重新开始，除非再次调用函数。因此不要把生成器函数的结果当作可以随意保存的序列。如果想保留序列并重复使用，必须把元素复制到一个数据结构中（如 Array）。

## Map/filter/reduce 的抽象

本章提到 Map/Filter/Reduce 和 Iterator 有类似之处，但是他们处于更高的抽象层次，把整个元素序列作为一个整体来处理。在这种范式下，控制语句消失了：具体来说，我们最初例子中的 for 语句、if 语句和 return 语句都会消失。我们也可以去掉大部分临时变量（比如 `filenames`、`f` 和 `result`）。同时，我们可以停止对序列进行修改——不再需要调用数组的 `push` 或 `splice`

我们将针对可迭代类型提供三种操作：map、filter 和 reduce。下面逐一介绍，并讨论它们如何组合使用。我们重点使用 Array 作为可迭代类型，因为 TypeScript 原生提供了 map、filter 和 reduce 方法。

### Map

map 对序列中的每个元素应用一个一元函数，并返回一个包含结果的新序列，顺序与原序列相同：

```text
map : Array<E> × (E → F) → Array<F>
```

例如

```ts
const array: Array<number> = [1, 4, 9, 16];
const result = array.map(Math.sqrt);
```

这段代码从数组 `[1, 4, 9, 16]` 开始，对每个元素应用平方根函数，得到 `[1.0, 2.0, 3.0, 4.0]`。在调用 `array.map(Math.sqrt)` 时：

- map 的类型为 `Array<number> × (number → number) → Array<number>`
- 输入数组类型为 `Array<number>`
- 映射函数 `Math.sqrt` 类型为 `number → number`
- 返回值类型为 `Array<number>`

也可以写得更紧凑：

```ts
[1, 4, 9, 16].map(Math.sqrt);
```

另一个 map 示例：

```ts
["A", "b", "C"].map(s => s.toLocaleLowerCase())
```

返回 `["a", "b", "c"]`。注意，当调用像 `Math.sqrt` 这样的函数时，可以直接传递；而调用方法如 `toLocaleLowerCase` 则需要用 lambda 包装方法调用语法。

即使不关心函数的返回值，map 也有用。例如，当处理可变对象序列时，可能希望对它们应用一个修改操作。因为修改操作通常返回 void，可以使用 forEach 代替 map：

```ts
itemsToRemove.forEach(item => mySet.delete(item));
```

lambda 也是必需的，否则 `mySet.delete` 本身无法绑定 `mySet` 到 `this`。map 和 forEach 捕获了对序列操作的一个常见模式：对序列的每个元素做相同的操作。

### Filter

filter 测试数组中每个元素是否满足一元函数（返回 boolean）。满足条件的元素保留，不满足的移除，返回新序列，原序列不变

```text
filter : Array<E> × (E → boolean) → Array<E>
```

示例

```ts
[1, 2, 3, 4].filter(x => x%2 === 1);
// 返回 [1, 3]

["x", "y", "2", "3", "a"].filter(s => "abcdefghijklmnopqrstuvwxyz".includes(s));
// 返回 ["x", "y", "a"]

const isNonempty = (s: string) => s.length > 0;
["abc", "", "d"].filter(isNonempty);
// 返回 ["abc", "d"]
```

### Reduce

reduce 使用二元函数将序列元素组合在一起。除了函数和数组，它还需要一个初始值，如果数组为空，初始值就是返回值：

```text
reduce : Array<E> × (E × E → E) × E → E
```

`arr.reduce(f, init)` 将数组元素组合起来，计算顺序如下：

```ts
result0 = init
result1 = f(result0, arr[0])
result2 = f(result1, arr[1])
...
resultn = f(resultn-1, arr[n-1])
```

最终 `resultn` 是 n 个元素的结果。示例：

```ts
[1,2,3].reduce((x,y) => x+y,  0)
// 计算过程： ((0 + 1) + 2) + 3 = 6
```

#### 初始值

reduce 的第一个设计选择是是否要求初始值。在 TypeScript 中，初始值可以省略，此时 reduce 使用序列的第一个元素作为初始值。但如果序列为空，reduce 会抛出 TypeError。例如：

```ts
[5, 8, 3, 1].reduce((x,y) => Math.max(x,y))
// 返回 8

[].reduce((x,y) => Math.max(x,y))
// 抛出 TypeError
```

#### 类型转换

reduce 的第二个设计选择是返回类型。返回类型不必与序列元素类型相同。例如，可以将数字序列（E 类型）连接成字符串（F 类型），此时：

- 初始值类型为 F
- 二元函数变为累加器，类型 F × E → F

更通用的 reduce 类型为：

```text
reduce : Array<E> × (F × E → F) × F → F
```

例如将数字序列拼接成字符串：

```ts
[1,2,3].reduce((s: string, n: number) => s + n, "" );
// 返回 "123"
```

#### 操作顺序

第三个设计选择是累积元素的顺序。TypeScript 的 `reduce` 从左到右：

```text
result0 = init
result1 = f(result0, arr[0])
result2 = f(result1, arr[1])
...
resultn = f(resultn-1, arr[n-1])
```

另一个操作 `reduceRight` 从右到左：

```text
result0 = init
result1 = f(result0, arr[n-1])
result2 = f(result1, arr[n-2])
...
resultn = f(resultn-1, arr[0])
```

如果操作符是非交换的（如字符串连接），左右顺序可能产生不同结果。

![image-20251021035808391](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251021035808391.png)

## 回到最初的例子

回到我们最初的例子：我们想要找到项目中所有 TypeScript 文件里的单词。我们先尝试创建一个有用的抽象，用于按后缀过滤文件：

```ts
const endsWith = (suffix: string) => {
    return (filename: string) => filename.endsWith(suffix);
}
```

TypeScript 的 `string.endsWith` 是一个函数，类型为 `string × string → boolean`。

我们新的 `endsWith` 包装器返回一个可用作过滤器的函数。它接收一个文件名后缀（例如 `.ts`），动态生成一个函数，可以和 `filter` 一起使用来测试文件名是否符合该后缀。给定一个 `Array<string>` 类型的 `filenames`，我们现在可以写：

```ts
filenames.filter(endsWith(".ts"))
```

来得到一个新的过滤后的数组。

`endsWith` 与我们平常的函数有所不同。它是一个高阶函数，也就是说它要么接收另一个函数作为参数，要么返回一个函数作为结果（正如 `endsWith` 所做的）。高阶函数是针对函数类型进行操作的函数。在本章中我们已经看到几个高阶函数：`map`、`filter` 和 `reduce` 都接收函数作为参数。

在这里，`endsWith` 是一个函数生成器。它的类型签名是：

```text
string → (string → boolean)
```

接下来我们使用 `map` 和 `filter` 来递归遍历文件夹树：

```ts
function allFilesIn(folder: string): Array<string> {
    const children: Array<string> = fs.readdirSync(folder)
                                      .map(f => path.join(folder, f));
    const descendants: Array<string> = children
                                       .filter(f => fs.lstatSync(f).isDirectory())
                                       .map(allFilesIn)
                                       .flat();
    return [
        ...descendants,
        ...children.filter(f => fs.lstatSync(f).isFile())
    ];
}
```

第一行获取文件夹的所有子项，例如：

```text
["src/client", "src/server", "src/Main.ts", ...]
```

第二行是关键：它用 `isDirectory` 方法过滤出子文件夹，然后对这些子文件夹递归调用 `allFilesIn`！结果可能是：

```ts
[["src/client/MyClient.ts", ...], ["src/server/MyServer.ts", ...], ...]
```

所以我们需要用 `flat` 展平，去掉嵌套结构：

```ts
["src/client/MyClient.ts", ..., "src/server/MyServer.ts", ...]
```

（这种 map + flatten 的模式很常见，数组还有一个方法可以同时完成这两步：`flatMap`。）

最后，我们把普通文件（非文件夹）的直接子项加入数组，这就是最终结果。

我们也可以用 `map/filter/reduce` 来完成其他部分的任务。一旦拿到当前文件夹下的所有文件数组，就可以过滤出 TS 文件：

```ts
const filenames: Array<string> = allFilesIn(".").filter(endsWith(".ts"));
```

有了要提取单词的文件后，我们读取文件内容：

```ts
const fileContents: Array<Array<string>> = filenames.map(f => {
    try {
        const data = fs.readFileSync(f, { encoding: "utf8", flag: "r" });
        return data.split("\n");
    } catch (e) {
        console.error(e);
    }
});
```

然后把数组的数组（每个文件的行数组）展平成一个简单的行数组：

```ts
const lines: Array<string> = fileContents.flat();
```

再从每一行提取非空单词：

```ts
const words: Array<string> = lines.map(line => line.split(/\W+/).filter(s => s.length > 0))
                                  .flat();
```

（这里 `split` 使用了正则表达式而不是简单字符串分隔符，正则表达式匹配非单词字符子串，后面章节会详细介绍。）

完成后，我们就得到了项目中所有 TypeScript 文件的单词数组！如预期，控制语句已经消失。

正如上面的例子所示，使用 `map/filter/reduce` 的一个常见模式是方法链式调用。因为每个函数都会返回一个新数组，所以可以把多个 `map/filter/reduce` 调用串联在一起。

## 抽象控制的好处

使用 map、filter、reduce 往往可以让代码更简短、更简单，同时让程序员专注于计算的核心逻辑，而不是循环、分支和其他控制语句的细节。

这一模式非常有用，以至于 Google 在一个有影响力的分布式系统 MapReduce 中采用了它，用于在计算机集群上处理海量数据。

Python 通过列表推导式方便地提供了 filter 和 map：

```python
doubleOdds = [x*2 for x in arr if x % 2 == 1]
```

相当于 TypeScript 中的

```ts
const doubleOdds = arr.filter(x=>x%2==1).map(x=> x*2)
```

列表推导式生成的结果因为使用了 [...] 括号，所以是列表。在 Python 中，推导式可以作用于任何可迭代对象，也可以用于生成集合和字典。例如：

```python
arr = [ 4, 7, 5, 6, 7, 4 ]  # 给定列表  
{ x for x in arr if x > 5 } # 创建大于 5 的集合  
# => { 6, 7 }  

input = { 'apple': 'red', 'banana': 'yellow' } # 给定字典  
{ value: key for key, value in input.items() } # 创建键值对反转的新字典  
# => { 'red': 'apple', 'yellow': 'banana' }  
```

在 TypeScript 中也可以实现相同效果：

```ts
const arr = [ 4, 7, 5, 6, 7, 4 ];  
new Set(arr.filter(x => x > 5));  
// => Set { 6, 7 }  

const input = new Map([ ['apple','red'], ['banana','yellow'] ]);  
new Map([ ...input.entries() ].map(entry => entry.reverse()));  
// => Map { 'red' => 'apple', 'yellow' => 'banana' }  
```

构建反转 Map 的步骤分析：

1. Map 构造函数接受一系列长度为 2 的数组：第一个元素是 key，第二个是 value。
2. Map.entries 返回一个可迭代对象，每次迭代返回一个 [key, value] 的数组。
3. 因为 JavaScript/TypeScript 只在数组上提供 map 和 filter，而非所有可迭代对象，所以我们使用展开操作符 ... 将这些键值数组转成数组。
4. 然后对这个数组调用 map，将每个 [key, value] 反转为 [value, key] 并创建新的 Map。

就像地道的 Python 代码会使用推导式而避免 for 循环来过滤和映射数据结构，地道的 TypeScript 也会使用 map 和 filter，结合 Map.entries、Array.entries、.some 和 .every 等方法，来避免使用循环。每次写循环时，首先考虑使用这些工具，而不是索引计数器。

再举一个例子, 假设我们有一个关于数码相机的数据库，每个对象类型为 Camera，包含品牌、像素、价格等属性。整个数据库存储在数组 cameras 中。然后我们可以使用 map/filter/reduce 来描述数据库查询

```ts
cameras.filter(camera => camera.brand === "Nikon")
       .map(camera => camera.pixels)
       .reduce((x,y) => Math.max(x,y));
```

关系型数据库也使用 map/filter/reduce 的模式（称为 project/select/aggregate）。SQL（结构化查询语言）是查询关系型数据库的事实标准语言。一个典型的 SQL 查询如下

```sql
select max(pixels) from cameras where brand = "Nikon"
```

对应关系：

- cameras 是一个序列（表的行，每行包含一台相机的数据）
- where brand = "Nikon" 是 filter
- pixels 是 map（提取每行的 pixels 字段）
- max 是 reduce

## 本讲小结
