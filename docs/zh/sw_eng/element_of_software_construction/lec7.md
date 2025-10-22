# Lec 7 抽象函数 & 表示不变式 

今天的阅读介绍了几个概念：

- 不变式（invariants）
- 表示暴露（representation exposure）
- 抽象函数（abstraction functions）
- 表示不变式（representation invariants）

在本节内容中，我们将以更形式化的数学方式来理解一个类如何实现一个抽象数据类型（ADT），这依赖于 抽象函数 和 表示不变式 这两个概念。

这些数学概念在软件设计中非常实用：

- 抽象函数 为我们提供了一种清晰的方法，用来定义抽象数据类型的相等性（equality）。
- 表示不变式 则帮助我们更容易发现因数据结构被破坏而产生的错误。

## 不变式

回到“什么样的ADT是好的”这一话题，最后也是也许最重要的特性是：**一个好的 ADT 应该能维护自己的不变式**。

**不变式（invariant）** 是指：在程序的执行过程中，只要程序开始时该性质成立，那么在之后的所有运行状态中，这个性质都始终为真。

我们已经遇到过一个典型的不变式 —— 不可变性（immutability）：一旦一个不可变对象被创建，它在整个生命周期中都应当表示同一个值。

除此之外，还有很多其他类型的不变式，例如：

- 变量类型不变式：例如 `i: number` 表示变量 `i` 始终是一个数字；
- 变量间关系不变式：例如当 `i` 用作数组索引循环时，在循环体内部总有 `0 <= i < array.length` 这个不变式成立。

当我们说“ADT 维护自己的不变式”时，意思是：ADT 必须自己负责确保这些不变式始终成立。 这通常通过以下方式实现：

- 隐藏或保护那些参与不变式的变量（例如使用语言特性 `private`）；
- 只允许外部通过定义良好的操作（方法）来访问这些变量。

当一个 ADT 能够维护自己的不变式时，代码推理会变得更简单。举个例子：如果你能确信字符串是不可变的，那么当你在调试使用字符串的代码时，就可以排除字符串内容被修改的可能性； 或者，当你在为另一个使用字符串的 ADT 建立不变式时，也无需担心字符串会变化。反之，如果字符串是可变的（mutable），那么任何能访问该字符串的代码都有可能修改它。此时若要推理某个 bug 或不变式是否被破坏，就得检查代码中所有可能访问该字符串的地方。

这种逻辑适用于所有情况：无论你是独自编程，还是与团队合作，甚至是编写供其他开发者使用的库或模块。维护自身不变式的 ADT 不仅让代码更易于理解与维护，也让系统更不容易出错（safer from bugs）。 这样，其他团队就不太可能错误使用你的代码，普通用户也更不容易无意中破坏你的软件。

### 不可变性

```ts
/**
 * This immutable data type represents a tweet from Twitter.
 */
class Tweet {

    public author: string;
    public text: string;
    public timestamp: Date;

    /**
     * Make a Tweet.
     * @param author    Twitter user who wrote the tweet
     * @param text      text of the tweet
     * @param timestamp date/time when the tweet was sent
     */
    public constructor(author: string, text: string, timestamp: Date) {
        this.author = author;
        this.text = text;
        this.timestamp = timestamp;
    }
}
```

这是一个**表示暴露**的简单示例。这意味着类外部的代码可以直接修改表示。像这样的表示暴露不仅会威胁到不变量，还会破坏表示独立性。我们无法在不影响访问这些字段的客户端的情况下更改 Tweet 的实现。

幸运的是，TypeScript 为我们提供了处理这种表示暴露的语言机制：

```ts
class Tweet {

    private readonly author: string;
    private readonly text: string;
    private readonly timestamp: Date;

    public constructor(author: string, text: string, timestamp: Date) {
        this.author = author;
        this.text = text;
        this.timestamp = timestamp;
    }

    /**
     * @returns Twitter user who wrote the tweet
     */
    public getAuthor(): string {
        return this.author;
    }

    /**
     * @returns text of the tweet
     */
    public getText(): string {
        return this.text;
    }

    /**
     * @returns date/time when the tweet was sent
     */
    public getTimestamp(): Date {
        return this.timestamp;
    }

}
```

readonly 用于指示对象的哪些实例变量可以重新赋值，哪些不能。请注意，TypeScript 仅对实例变量使用 readonly，对局部变量和全局变量仅使用 const，但 readonly 和 const 的含义相同：不可重新赋值。

但故事还没完：rep 仍然暴露！考虑一下下面这个使用 Tweet 的非常合理的客户端代码：

```ts
/**
 * @returns 返回一条在原推文基础上延后一小时的转推
 */
function retweetLater(t: Tweet): Tweet {
    const d: Date = t.getTimestamp();
    d.setHours(d.getHours()+1);
    return new Tweet("rbmllr", t.getText(), d);
}
```

`retweetLater` 接收一条推文，返回另一条内容相同、但发送时间延后一小时的推文（即“转推”）。这个函数可能属于一个自动转发系统，会自动转发知名推特用户发布的有趣内容。

问题出在哪？ `getTimestamp()` 返回的是同一个 `Date` 对象的引用，也就是与推文 `t` 内部使用的 `timestamp` 相同。因此，`t.timestamp` 和 `d` 实际上是同一个可变对象的别名。 当我们调用 `d.setHours()` 修改时间时，`t` 的时间也随之被改动了。

这就破坏了 `Tweet` 的不可变性不变式（immutability invariant）。问题的根源在于：`Tweet` 泄露了对其内部可变对象的引用。因为这种表示暴露，`Tweet` 再也无法保证其实例是不可变的。更糟糕的是，这个 bug 是由一段“看起来完全合理”的客户端代码引起的，非常隐蔽。

我们可以通过一种称为防御性拷贝（defensive copying）的策略修补这种暴露问题。 做法是：对可变对象进行拷贝，从而避免外部获得其真实引用。

```ts
public getTimestamp(): Date {
    return new Date(this.timestamp.getTime());
}
```

再来看另一段（同样合理的）客户端代码：

```ts
/**
 * @returns 返回一个数组，包含今天 24 条激励推文（每小时一条）
 */
function tweetEveryHourToday(): Array<Tweet> {
    const array: Array<Tweet> = [];
    const date: Date = new Date();
    for (let i = 0; i < 24; i++) {
        date.setHours(i);
        array.push(new Tweet("rbmllr", "keep it up! you can do it", date));
    }
    return array;
}
```

这段代码的意图是：使用一个 `Date` 对象依次推进 24 小时，为每个小时创建一条推文。但注意到：`Tweet` 构造函数直接保存了传入的 Date 引用。因此，所有 24 条推文都共享同一个 `Date` 对象。结果是，所有推文的时间都被设置成最后那一小时——`Tweet` 的不可变性再次被破坏。

我们可以通过在构造函数中也使用防御性拷贝来修复这个问题：

```ts
public constructor(author: string, text: string, timestamp: Date) {
    this.author = author;
    this.text = text;
    this.timestamp = new Date(timestamp.getTime());
}
```

在设计 ADT 时，要仔细检查所有操作的参数类型和返回类型。 **如果这些类型中包含可变类型，必须确保实现不会直接暴露内部表示的引用。** 如果返回一个可变对象的引用，就会导致表示暴露。

你可能会质疑：这看起来太浪费了——为什么要复制那么多次 `Date`？ 我们能不能用文档约定来解决，比如写成这样：

```ts
/**
 * 创建一条推文。
 * @param author    撰写推文的用户
 * @param text      推文内容
 * @param timestamp 推文发送时间。调用者必须保证**之后绝不修改**这个 Date 对象！
 */
public constructor(author: string, text: string, timestamp: Date) {
```

确实，有时在别无他法的情况下（例如对象太大、拷贝太昂贵）会采用这种做法。但这样做的代价是巨大的：你将失去对程序行为的可推理性（reasoning），并更容易出现难以定位的错误。

除非有非常充分的理由反对，一般情况下都应让 ADT 自行维护其不变式。而防止表示暴露，是做到这一点的关键。

更好的解决方案是：尽量使用**不可变类型（immutable types）**。

## 表示不变式和抽象函数

现在，我们将深入探讨抽象数据类型背后的理论。该理论不仅本身优雅有趣，而且在抽象类型的设计和实现中也具有直接的实际应用。

在思考抽象类型时，考虑两个值空间之间的关系会有所帮助。

抽象值空间由该类型从客户端角度设计支持的值组成。例如，像 TypeScript 的 BigInt 这样的无界整数抽象类型，其抽象值空间就是数学整数。

表示值空间（简称 rep 值）由实际实现抽象值的对象组成。例如，BigInt 值可以使用数字数组来实现，这些数字数组表示为数值。那么，rep 空间就是所有此类数组的集合。

在简单的情况下，抽象类型会被实现为单个对象，但更常见的情况是需要一个小型的对象网络。例如，数组的表示值可能是一个链表，即一组由 next 和 previous 指针链接在一起的对象。因此，表示值不一定是单个对象，通常是相当复杂的东西。



假设，我们选择一个string来表示一组字符，那么表示空间R包含字符串，抽象空间A是字符集合。我们可以用图示的方式表达这两个空间的关系，从一个表示值画一条直线指向它所代表的抽象值。

```ts
class CharSet {
  private s: string;
}
```

![image-20251018033916224](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251018033916224.png)

这个图有几个关键点：

- 每个抽象值都必须有对应的表示值
- 多个表示值肯呢个映射同一个抽象值
- 并非所有表示值都能映射到抽象值

实际上，这两个空间是无限大的，我们只能画出部分关系。

1. 抽象函数

将表示值映射到抽象值：

> AF :R->A

图中的箭头就是这个函数的可视化。从函数的角度看，这个函数具有以下性质：

- 满射： 每个抽象值至少有一个表示值
- 不一定单射
- 也不一定是双射

2. 表示不变式

一个从表示值到布尔值的函数：

> RI: R->boolean

表示不变式 是定义在表示值上的一个逻辑谓词，对于某个表示值 `r`，当且仅当 `r` 可以被抽象函数 AF 映射时，`RI(r)` 为真。换句话说，`RI` 告诉我们这个表示值是否是“合法的表示”。

也可以把 `RI` 看成一个集合：它是所有合法表示值的子集，即 AF 定义的那部分 R 空间。

如上图所示为例，RI("a")   = true、RI("ac")  = true、RI("acb") = true，但是RI("aa")   = false、RI("abbc") = false

![image-20251018034436459](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251018034436459.png)

在代码中应该这样记录 AF 和 RI

```ts
class CharSets {
  private s: string;
  // 表示不变式
  //   s 中不包含重复字符
  // 抽象函数
  // AF(s) = {s[i] | 0 <= i < s.length}
}
```

常见的误区是，以为AF和RI是由表示空间和抽象空间的选择自动决定的，甚至以为只取决于抽象空间。如果真是这样，他们就没有意义了，因为他们只是重复已有的信息。实际上，抽象空间本身并不能唯一确定 AF 或 RI， 同一个抽象类型（如“字符集合”）可以有不同的表示方式。

那么为什么即使固定了两种空间，AF 和 RI 也不唯一？关键在于：
 **定义了表示类型并不意味着定义了哪些值是合法的，也不意味着定义了它们的含义。**

举个例子：我们原本规定字符串中不能有重复字符。 但也可以换一种约束：允许重复字符，但要求字符必须按非递减顺序排列（排序后）。

这样我们就能对字符串执行二分查找，把成员检查的时间复杂度从 O(n) 降到 O(log n)。同样的表示空间，不同的表示不变式。

即便 表示空间 和 表示不变式 都一样，我们仍然可能选择不同的抽象函数（AF）来解释这些值。例如字符串 `"acgg"` 可以被解释为两个区间：`[a-c]`， `[g-g]`于是它代表的抽象集合就是 `{a, b, c, g}`。



**表示中不允许出现 null 值**

回想一下“规范（Specifications）”一节中提到的内容：`null` 和 `undefined` 值是麻烦且不安全的，因此我们尽量在编程中彻底避免它们。 前置条件和后置条件隐含地要求对象不能为 null。在 TypeScript 中开启严格的 null 检查（strict null-checking）可以通过静态类型检查强制执行这一点。

我们将这一禁止规则扩展到抽象数据类型的内部表示（rep）。

表示不变式隐含地包括：对于表示中的每个引用 `x`，都有 `x !== null` 且 `x !== undefined`，这包括数组、映射（map）等内部引用。



## 仁慈的副作用

回想一下，一个类型是不可变的（immutable），当且仅当其值在创建后**永远不会改变**。结合我们对抽象空间（A）和表示空间（R）的理解，我们可以更精确定义：**抽象值不应该改变**。

然而，**实现层面可以改变表示值，只要它依然映射到相同的抽象值，使得这种变化对客户端是不可见的**。这种变化就叫做“仁慈的副作用”。

示例，有理数的例子

```ts
class RatNum {

    private numerator: bigint;
    private denominator: bigint;
    // 表示不变式（Rep invariant）:
    //   denominator != 0
    // 抽象函数（Abstraction function）:
    //   AF(numerator, denominator) = numerator / denominator

    public constructor(n: bigint, d: bigint) {
        if (d === 0n) throw new Error("denominator is zero");
        this.numerator = n;
        this.denominator = d;
        checkRep();
    }

    ...
}
```

这个较弱的表示不变式允许在进行一系列有理数运算时，不必每次都化简为最简分数。 

当显示结果时再化简

```ts
public toString(): string {
    const g = gcd(this.numerator, this.denominator);
    this.numerator /= g;
    this.denominator /= g;
    if (this.denominator < 0n) {
        this.numerator = -this.numerator;
        this.denominator = -this.denominator;
    }
    checkRep();
    return (this.denominator > 1n) ? (this.numerator + "/" + this.denominator)
                                   : (this.numerator + "");
}
```

`toString` 方法重新赋值了私有字段 `numerator` 和 `denominator`，
 改变了表示（mutating the rep），即使它是不可变类型的观察方法（observer）！但关键是，这种改变不影响抽象值。

同时除以一个公因数，或者同时乘以 -1，不会改变 AF(numerator, denominator) 的结果。

换句话说，抽象函数是“多对一”（many-to-one）的，表示值变成了另一个仍然映射到相同抽象值的表示值。 因此，这种变化是无害的，即“仁慈的副作用”。

## 记录AF、RI

在类中用注释记录抽象函数和表示不变式是良好的实践，通常放在表示的私有字段声明旁。上文我们已经有示例。

关于表示不变式（RI）和抽象函数（AF）必须精确

表示不变式不能笼统地说“所有字段都是有效的”。表示不变式的作用是精确说明哪些字段值是合法的，哪些是不合法的。

作为一个函数，如果将 RI 中的定义代入实际字段值（合法或不合法），应得到一个布尔值结果。注意：**不应在 RI 中引用抽象值**，因为非法的表示值没有抽象值。

RI 只能基于表示值本身判断是否合法。抽象函数也不能笼统地说“表示一组字符”。 抽象函数的作用是精确定义如何解释具体字段值。

作为一个函数，如果将 AF 代入实际合法字段值，应得到唯一的抽象值。 例如，对于 CharSet：`AF(s) = { s[i] | 0 <= i < s.length }`，代入合法表示值`s="abbc"`得到$AF("abbc" = {'a', 'b', 'c'})$，如果AF定义模糊，AF(s) = 一组字符，代入s后无法明确知道对应哪个抽象集合。

防止表示泄露的安全性说明（Rep Exposure Safety），要求写一段注释，说明如何保证表示不会被泄露。

- 检查表示的每一部分，尤其是涉及参数和返回值的地方（客户端可能获取表示的引用）。
- 给出理由说明代码如何避免泄露表示。

示例：

```ts
// 不可变类型，表示一条推文
class Tweet {

    private readonly author: string;
    private readonly text: string;
    private readonly timestamp: Date;

    // 表示不变式：
    //   author 是 Twitter 用户名（非空字符串，由字母、数字、下划线组成）
    //   text.length <= 280
    // 抽象函数：
    //   AF(author, text, timestamp) = 由 author 发布、内容为 text、时间为 timestamp 的推文
    // 防止表示泄露：
    //   所有字段均为私有；
    //   author 和 text 是字符串，保证不可变；
    //   timestamp 是可变 Date，因此 Tweet 构造函数和 getTimestamp() 方法做了防御性拷贝，
    //       避免将表示中的 Date 对象共享给客户端。

    public constructor(author: string, text: string, timestamp: Date) { ... }
    public getAuthor(): string { ... }
    public getText(): string { ... }
    public getTimestamp(): Date { ... }
}
```

有理数例子

```ts
// 不可变类型，表示一个有理数
class RatNum {
    private readonly numerator: bigint;
    private readonly denominator: bigint;

    // 表示不变式：
    //   denominator > 0
    //   numerator/denominator 已化简（gcd(|numerator|, denominator) = 1）
    // 抽象函数：
    //   AF(numerator, denominator) = numerator / denominator
    // 防止表示泄露：
    //   所有字段均为私有，且表示中的类型都是不可变类型

    public constructor(n: bigint, d: bigint) { ... }
    ...
}
```

## ADT 不变式取代前置条件

现在我们把前面学到的内容整合起来。
 一个设计良好的抽象数据类型（ADT）的巨大优势是：它封装并强制执行某些属性，而这些属性如果没有 ADT，就必须通过前置条件来规定。

例如，下面这种函数规范有一个复杂的前置条件：

```ts
/**
 * @param set1 是一个没有重复元素且排好序的字符集合
 * @param set2 也是如此
 * @returns 返回在一个集合中出现但不在另一个集合中出现的字符，
 *          返回结果同样是有序且无重复的。
 */
static exclusiveOr(set1: string, set2: string): string;
```

现在，我们可以改用一个能够内在表达这些属性的ADT

```ts
/**
 * @returns 返回在一个集合中出现但不在另一个集合中出现的字符
 */
static exclusiveOr(set1: SortedCharSet, set2: SortedCharSet): SortedCharSet;
```

## 编程方法论

抽象数据类型（ADT）是构建正确、清晰、可修改软件的核心。

我们回顾一下测试驱动编程流程

1. 规格说明：写出方法的规格，包括：方法签名（名称、参数类型、返回类型、异常）；前置和后置条件
2. 编写测试：编写测试的过程就是使用者角度思考的——这会暴露规格设计中的问题，因此前两步反复迭代，直到规格说明合理，测试用例完善
3. 实现：写出方法的实现体。 当所有测试通过后，你才算完成。实现过程中



扩展——编写ADT的流程

1. 规格说明： 方法签名；前置和后置条件；定义抽象值空间，但不需要定义抽象函数，因为还没选定表示
2. 编写测试：为 ADT 的操作编写测试用例。这个过程也会“逼迫”你改进规格
3. 实现： 对于ADT，这一步更加详细
   1. 选择表示。写出类中的私有字段（或其他形式的内部表示）。并在注释中写明：表示不变式和抽象函数
   2. 断言表示不变式。实现一个 `checkRep()` 方法来检查不变式是否成立。 如果不变式复杂，这是非常关键的，因为它能及早发现 bug
   3. 实现操作。写出 ADT 的方法体，并确保在其中调用 `checkRep()`。 当所有测试通过后，你就完成了。



在扩展——编写完整程序（包含ADT和函数）

1. 选择数据类型：决定哪些类型是可变哪些是不可变的

2. 选择函数：写出主函数main，将其分解为更小的步骤

3. 规格说明

4. 编写测试

5. 先实现简单版本。

6. 选择简单、暴力的表示方式。目标是让整个程序尽快能运行起来，以验证：

   - 规格是否合理；
   - 测试是否有效；
   - 模块是否能协同工作。

   暂时跳过：

   - 高级功能；
   - 性能优化；
   - 边界情况。

7. 迭代改进。当程序能正常工作后，再让它：更高效，更健壮，必要时重构



## 总结

- 一个好的 ADT 必须能保持自己的不变式。
  - 创建者（creator）与生成者（producer）要建立不变式；
  - 修改者（mutator）与观察者（observer）要维持不变式。
- 表示不变式（Rep invariant）定义合法的内部表示，应通过 `checkRep()` 在运行时检查。
- 抽象函数（Abstraction function）， 将具体的内部表示映射到抽象值。
- 不可变 ADT 的表示（Immutable rep），即使内部表示变了，只要抽象值不变，也依然合法。
- 表示暴露（Representation exposure）， 会破坏表示独立性（representation independence）与不变式的保持。
- **不变式必须文档化**， 要么写注释，要么用 `checkRep()` 明确声明。 否则，不变式无法在代码层面得到保护。



与“良好软件三要素”的关系

| 目标     | ADT 的作用                                                   |
| -------- | ------------------------------------------------------------ |
| 防止 bug | ADT 自己维持不变式，不容易被外部代码破坏。 显式写出 rep invariant 并在运行时检查，可更早发现结构错误。 |
| 易于理解 | rep invariant 与 abstraction function 明确地说明了“表示”与“抽象”之间的关系。 |
| 易于修改 | 抽象与表示分离，使得表示可自由更改，而不影响使用者代码。     |