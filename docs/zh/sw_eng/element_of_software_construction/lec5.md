# Lec 5 设计规范



本节的目标：

- 理解“非确定性规格”，并能识别与分析那些结果不唯一的规格；
- 理解“声明式（declarative）”与“操作式（operational）”规格的区别，并能编写声明式规格；
- 理解规格中的前置条件、后置条件与规格强度的概念，并能比较不同规格的强弱；
- 能够编写连贯、有用且强度合适的规格说明。

## 介绍

在本节阅读中，我们将探讨针对相似行为的不同规格（specifications），并讨论它们之间的权衡。 我们将从三个维度来比较规格：

1. 确定性（determinism）：对于给定输入，规格是否只定义了唯一的输出，还是允许一组合法的输出？
2. 声明性（declarativeness）： 规格是只描述结果应该是什么，还是明确说明如何计算结果？
3. 强度（strength）：规格是否限制实现的自由度（即只有少数实现满足），还是允许更多实现方式？

并非所有模块的规格都同样有用，我们将探讨是什么使得某些规格比其他规格更好。

## 确定性规格 vs. 非确定性规格

来看两个 `find` 函数的实现：

```ts
function findFirst(arr: Array<number>, val: number): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return arr.length;
}

function findLast(arr: Array<number>, val: number): number {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === val) return i;
    }
    return -1;
}
```

这里的 `First` 和 `Last` 并不是 TypeScript 的语法，只是为了讨论方便区分两种实现。在真实代码中，它们都应该叫 `find`。同样地，我们也会为不同的规格说明命名，例如：

```ts
function findExactlyOne(arr: Array<number>, val: number): number
前置条件:
    val occurs exactly once in arr
影响:
    returns index i such that arr[i] = val
```

这个 `findExactlyOne` 的规格是确定性的：在满足前置条件的情况下，输出结果是完全确定的—— 对于每个合法输入，只有一个返回值、一个最终状态是合法的。

## 声明式 vs. 操作式规格

另一种对规格进行分类的方法是根据其详细程度。操作性规格给出方法执行的一系列步骤；伪代码描述就是操作性规格。而声明性规格则不提供中间步骤的细节，而是直接描述最终结果的属性，以及它与初始状态的关系。

声明性规格几乎总是优于操作性规格。它们通常更简短、更容易理解，更重要的是，它们不会无意中暴露实现细节，从而让客户端依赖这些细节，而在实现更改时发现这些依赖不再成立。例如，如果我们希望允许 `find` 的任意实现，我们就不希望在规格中写“方法沿数组查找直到找到 val”，因为除了比较模糊之外，这条规格暗示搜索是从低索引到高索引进行，并返回最小索引，但这可能并不是规格制定者的本意。

程序员有时会写成操作性规格，一个原因是他们用规格注释来向维护者解释实现。不要这样做。如果需要解释实现细节，应在方法体内部使用注释，而不是写在规格注释中。

对于给定的规格，可以有多种声明性表达方式：

```
function startsWith(str: string, prefix: string): boolean
 effects:
 返回 true 当且仅当存在一个字符串后缀 suffix，使得 prefix + suffix = str
```

```
function startsWith(str: string, prefix: string): boolean
 effects:
 返回 true 当且仅当存在整数 i，使得 str.substring(0, i) = prefix
```

```
function startsWith(str: string, prefix: string): boolean
 effects:
 返回 true 当且仅当 str 的前 prefix.length 个字符与字符串 prefix 匹配
```

我们可以选择最清晰的规格，以便客户端和代码维护者理解。注意，这些 `startsWith` 规格没有前置条件（除了函数签名中描述的参数数量和类型），因此可以省略 requires: 条目，以简洁起见。



## 可变性

我们再来看规格设计中的另一个重要选择：参数和返回值到底该使用可变类型还是不可变类型。

回忆一下静态检查那一节：有些对象是不可变的——一旦创建，它们的值就永远不会改变。而另一些对象是可变的——它们有方法可以改变自身的值。

数组是可变类型，它有一些方法可以直接修改数组本身，而不是返回一个新数组：

```ts
let v: Array<string> = ["a"];
v.push("b")

let w= v;
w.push("c");
```

这时我们可以用“快照图”来理解：修改 t 不会影响 s，但修改 w 会影响 v —— 这往往会让程序员措手不及。

### 可变性的风险

可变类型看起来比不可变类型更强大。如果你走进“数据类型超市”，看到两种选择：

- 不可变的 ReadonlyArray
- 功能齐全、无所不能的 Array

你可能会想：谁会选前者？Array 明明能做所有 ReadonlyArray 能做的事，还多了 push()、pop() 等功能。但事实是，不可变类型更安全、更易理解，也更容易维护和修改。 可变性让程序更难理解，也更难维持契约的一致性。

#### 危险示例#1: 传递可变对象

来看一个简单的函数，它求数组中数字的和：

```ts
/**
 * @returns 数组中所有数字的和
 */
function sum(arr: Array<number>): number {
    let sum = 0;
    for (const x of arr) {
        sum += x;
    }
    return sum;
}
```

现在我们想写一个求“绝对值和”的函数：

```ts
/**
 * @returns 数组中所有数字绝对值的和
 */
function sumAbsolute(arr: Array<number>): number {
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = Math.abs(arr[i]);
    }
    return sum(arr);
}
```

实现者这样写是因为两个理由：

1. **复用代码**（DRY 原则）；
2. **性能考虑**（避免创建新数组）。

但对使用者来说，这样的行为会造成意想不到的结果：

```ts
let myData: Array<number> = [-5, -3, -2];
console.log(sumAbsolute(myData));
console.log(sum(myData));
```

输出的结果是什么？10 然后 -10？还是别的？

问题在于：`sumAbsolute()` 改变了 `myData` 本身。虽然它的实现者只是想节省资源，但结果却改变了外部变量的值。

这种“潜在的可变共享”是一种隐患 —— 只要有人不小心修改了这个对象，就可能引发难以追踪的错误。

#### 危险示例二：返回可变对象

我们已经看到传递可变对象的问题，那么返回可变对象呢？假设我们写一个函数返回“今年春天的第一天”：

```ts
function startOfSpring(): Date {
    return askGroundhog();
}
```

使用这个函数：

```ts
function partyPlanning(): void {
    let partyDate: Date = startOfSpring();
}
```

后来，两个独立的修改发生了：

`startOfSpring()` 的作者为了性能，把结果缓存起来，不再重复调用：

```ts
let groundhogAnswer: Date|undefined = undefined;
function startOfSpring(): Date {
    if (groundhogAnswer === undefined)
        groundhogAnswer = askGroundhog();
    return groundhogAnswer;
}
```

另一位程序员希望派对比春天晚一个月举行：

```ts
function partyPlanning(): void {
    let partyDate: Date = startOfSpring();
    partyDate.setMonth(partyDate.getMonth() + 1);
}
```

结果呢？这两处改动相互干扰，缓存的数据被意外修改。而且这个 bug 很可能是由第三个、完全无辜的调用者首先发现的。

为了解决这个问题，`startOfSpring()` 可以在返回时复制数据：

```ts
return new Date(groundhogAnswer);
```

这叫“防御性拷贝”（defensive copy）。这样，调用方无论怎么修改都不会影响缓存。 但这也意味着每次调用都要多分配内存，多拷贝一次数据。 而如果我们使用不可变类型，这个问题根本不会发生，也不需要额外的复制。

### 别名问题

上面的例子说明，问题的根源在于“多个变量指向同一个可变对象”。比如：

- 在数组例子中，`sumAbsolute` 和外部 `myData` 共用了同一个数组引用；
- 在日期例子中，`startOfSpring` 和 `partyPlanning` 共用了同一个 `Date` 对象。

这种共享引用就叫“别名”。别名让契约复杂化，也让函数之间的独立性丧失。

有人可能会在规范里写：

```ts
function startOfSpring(): Date
// 返回的 Date 不可修改
```

但这意味着一个“终身契约”——调用后，这条规则在程序整个生命周期都要生效。这显然不现实。

另一种写法：

```ts
function startOfSpring(): Date
// 返回一个新的 Date 对象
```

这稍好一些，但仍不能保证实现者不保存对该对象的引用。

更好的方式是使用真正不可变的类型，比如：

```ts
function startOfSpring(): Temporal.PlainDate
```

`Temporal.PlainDate` 是一个提议中的不可变日期类型。使用它可以从根本上避免互相干扰的问题， 而且还允许实现者安全地使用缓存，提高性能。



### TypeScript的只读集合

TypeScript 为 Array、Set、Map 提供了只读版本：ReadonlyArray、ReadonlySet、ReadonlyMap。 这些接口移除了修改方法，例如 push、add、set 等。

```ts
const arr: ReadonlyArray<number> = [1,2,3];
arr.push(4); // 编译错误

const set: ReadonlySet<number> = new Set([1,2,3]);
set.add(4); // 编译错误

const map: ReadonlyMap<string, number> = new Map(Object.entries({ "apple": 5, "banana": 7 }));
map.set("pear", 9); // 编译错误
```

但要注意：这些“只读”类型并不真正不可变。因为它们只是接口，没有构造函数。你依然是先创建一个可变对象，然后再赋给只读变量。如果别的地方仍然持有对原对象的引用，它仍然能被修改。

例如：

```ts
let yourArray: Array<number> = [1, 2, 3];
const myArray: ReadonlyArray<number> = yourArray;
```

虽然 myArray 被声明为 const 和 ReadonlyArray，但只要修改 yourArray，
 myArray 的内容也会改变。真正不可变的类型是 number、boolean、string、bigint。这些类型的值无法通过任何方式改变。声明为 const 后，它们就是彻底稳定的。

这就引出了本章的核心： **如何设计一个好的规格？**

## 设计良好的规格说明

什么才算一个好的函数？设计一个函数，核心其实就是编写它的规格说明。关于规格说明的形式：它应该简洁、清晰、结构合理，便于阅读。而规格说明的内容就更难把握了。虽然没有放之四海而皆准的规则，但可以遵循一些有用的指导原则。

### 规格说明应当是连贯的

一个连贯的规格说明，对使用者来说应该像是一个完整的整体——它只做一件明确的事情。规格说明中如果包含很多不同情况、冗长的参数列表、用来控制行为的布尔标志、或复杂的逻辑，往往都是设计不佳的信号。

```ts
function sumFind(a: Array<number>, b: Array<number>, val: number): number
影响:
returns the sum of all indices in arrays a and b at which val appears
```

这个函数设计得好吗？可能不好。它不连贯，因为它做了几件互不相关的事：同时在两个数组中查找，又对索引求和。更好的做法是把它拆分成两个函数：一个负责查找索引，另一个负责求和。

判断一个函数是否连贯的一个方法，是仔细看它的名字。函数名是否能完整表达它的功能？ 如果不能，而要把所有动作都写进名字里会变得很长（像“doesXandYandZandsometimesW”），那说明函数可能不连贯。

再看一个例子，来自代码审查：

```ts
let LONG_WORD_LENGTH: number = 5;
let longestWord: string;

/**
 * Update longestWord to be the longest element of words, and print
 * the number of elements with length > LONG_WORD_LENGTH to the console.
 * @param text     text to search for long words
 */
function countLongWords(text: string): void
```

这个函数除了滥用全局变量、打印结果而非返回值、引用了本地变量（words）之外，它的规格说明也不连贯。它同时做了两件事：统计长单词数量，以及找出最长的单词。把这两个任务拆成两个独立函数，不仅能让它们更容易理解，也更容易在其他场景中复用。

再看一个：

```
function combine(a: Array<number|string>): number|string
前置条件:
a contains only numbers or only strings, but not a mix of numbers and strings
影响:
returns the sum of the numbers in a or the concatenation of the strings in a
```

改进这个规格说明的一个办法，是用更强的类型约束 `Array<number> | Array<string>` 来在编译期检查输入。但更好的做法是把“求和”和“拼接”分开，写成两个函数。

### 规格说明必须仔细考虑“可变性”

函数的签名本身就是规格说明的一部分。因此，在可能的情况下，应优先使用内建的不可变类型（如 string 和 number），以避免调用方与实现方因共享可变对象而出现意外的别名问题。

记住：如果没有特别说明，默认是不允许修改数据的。 一旦允许修改，必须在规格说明中明确、谨慎地描述其行为。

此外，尽管无法百分百避免风险，仍应优先考虑使用不可变的 `readonly` 集合类型，而不是可变集合。

### 规格说明应当足够“强”

规格说明必须为调用者提供足够强的保证，满足他们的基本需求。在描述特殊情况时要格外小心，以免破坏了函数原本的实用性。

例如：

```
function addAll(arr1: Array<T>, arr2: Array<T>): void
影响:
按顺序将 arr2 中的元素追加到 arr1 的末尾。
如果 arr2 中包含 null 元素，则抛出 TypeError 异常
```

这个规格说明的问题不在于写法，而在于它过于模糊。
 它虽然比完全不提 null 元素的版本更强（因为现在允许 null，但指定了异常行为），但对调用者来说仍然不够强。
 因为异常抛出前，函数可能已经对 arr1 做了部分修改——调用者将不知道哪些元素被追加成功，哪些没被追加。

可以改写成更强的版本：

```
function addAll(arr1: Array<T>, arr2: Array<T>): void
影响:
按顺序将 arr2 中的元素追加到 arr1 的末尾。如果 arr2 中包含 null 元素，则抛出 TypeError 异常，并且不会向 arr1 追加任何元素
```

这样，调用者就能确定：如果出现异常，arr1 完全不会被修改。

### 规格说明也要足够“弱”

再看一个例子：

```
function open(filename: string): File
影响:
opens a file named filename
```

这个规格说明很糟糕。它缺少关键信息——文件是以读还是写的方式打开？文件是否会被创建？ 更重要的是，它太“强”了，因为它承诺“打开一个文件”，但实际上函数无法保证这一点：进程可能没有权限，文件系统可能出现故障等。

更合适的做法是写得更“弱”一些：说明函数“尝试”打开文件，如果成功，则返回的文件对象具有某些特性。这样既符合实际，也便于调用者正确处理失败情况。

## 前置条件还是后置条件

另一个设计问题是，是否要使用前置条件；如果要用，那么函数代码是否应该在执行之前检查前置条件是否被满足。事实上，前置条件最常见的用途，**正是要求某种性质成立——因为函数自己检查它可能既困难又昂贵**。

如上所述，非平凡的前置条件会给使用者带来不便，因为调用者必须确保在调用函数前，程序状态是合法的（即不违反前置条件）；否则就无法预测程序的行为，也无法可靠恢复。正因如此，函数的使用者往往不喜欢前置条件。这也是为什么许多 JavaScript 库函数倾向于用后置条件的方式说明：当参数不合适时，它们会抛出异常。这样做能更容易地定位错误或找出调用方传入错误参数的原因。

总体上，更好的做法是“快速失败”——尽量在错误发生的源头就暴露出来，而不是让错误的值一路传播到程序的其他部分。如果例如 `atan(y, x)` 的前置条件是输入不能为 (0,0)，那么最好让它在检测到这种情况时直接抛出一个带有清晰错误信息的异常，而不是返回垃圾值或引发令人困惑的错误。

当然，有时如果检查条件会让函数运行过慢，那么就不适合进行检测，此时使用前置条件就是必要的。例如，如果我们想用二分查找来实现 `find` 函数，就必须要求数组是有序的作为前置条件。若让函数自己去检查数组是否有序，那就违背了二分查找的初衷——因为这样会使时间复杂度从对数级退化为线性级。

是否使用前置条件，是一个工程判断问题。关键取决于两点：检查条件的成本（包括编写和执行检查代码的成本），以及函数的使用范围。如果函数仅在模块内部被调用，那么前置条件可以通过仔细验证所有调用点来确保。但如果函数是导出的或公共的，也就是说它可以在程序的任何地方被调用，甚至被其他开发者使用，那么使用前置条件就不太明智。此时，像 JavaScript 库那样，在后置条件中通过抛出异常来处理会更合适。



## 我们在什么地方使用规格说明

一个规格说明的设计决策，往往取决于它所处的上下文，例如：

- 它有多少个不同的客户端——只有一个，还是有很多？
- 它有多少个不同的实现——只有一个，还是有多个？
- 有多少人会使用它——只有一个人？一个小团队？一家大公司或一个大型开源项目？还是世界各地许多互不相识、互不沟通的程序员？

下面是一些典型的情境：

- 辅助函数是模块私有的（甚至定义在另一个函数体内部）。通常只有一个客户端（即一个调用点），只有一个实现，编写客户端和实现的是同一个程序员。
- 导出函数：可能在同一个程序的多个地方被调用，因此有多个客户端。在该程序中只有一个实现。可能被多个程序员使用，但通常来自同一个团队或公司。
- 库函数：可能被许多不同程序调用（即有许多客户端），但仍然只有一个实现。可能只在单个公司或开源项目中使用，也可能发布给全世界的开发者。实现通常由一个团队维护。例如 npm 软件包库、PyPi 软件包库中都有大量这样的库。
- 标准（standard）：是一种有许多客户端和许多实现的规格说明。例如 MDN JavaScript 库参考文档中包含的许多 JavaScript 函数和类型的规格说明（这些是由 ECMAScript 标准化文档定义的）。不同的 JavaScript 实现（如 Node、Chrome、Safari、Firefox、Edge 等）都是这些标准的实现者；各种 JavaScript 程序和网页都是这些标准的客户端。