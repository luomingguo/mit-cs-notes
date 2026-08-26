---
title: 用接口、泛型、枚举和函数定义 ADT
type: lecture
lecture: 8
tags: []
status: stub
---
# Lec 8 用接口、泛型、枚举和函数定义 ADT

本节将介绍实现抽象数据类型的各种方法，包括：

- 接口： 分离 ADT 的接口与其实现
- 泛型：用泛型类型参数定义一系列的 ADT
- 枚举： 定义具有一小组有限值的 ADT
- 对不透明类型操作的全局函数，在 TypeScript 中很少见，但在非面向对象语言中很常见。

我们还将讨论子类型（subtyping），即由其规范确定的两种类型之间的关系，并会区分子类化（subclassing）

完成今天的课程后，你应该能够： 使用类、接口、泛型和枚举定义 ADT 判断一个类型是否是另一个类型的子类型。

## 接口

TypeScript 的接口（interface）是一种表达抽象数据类型的机制。在 TS 中，接口是一个方法签名列表，这些方法没有方法体。当一个类在其 implements 子句中实现了某个接口，并为该接口的所有方法提供具体实现（方法体）时，就认为该类实现了这个接口。

因此，在 TypeScript 中定义抽象数据类型的一种方式，就是通过接口来定义该类型的规范（即方法签名），而将该类型的具体实现放在实现该接口的类中。

接口可以只向客户端程序员暴露使用契约（contract），而不会暴露实现细节。客户端程序员只需阅读接口定义，就能了解该抽象数据类型的功能，无需也无法依赖其内部表示，因为接口中根本就没有这些内容（甚至连私有字段也没有）。这样，接口和实现被彻底地分离，位于不同的类中，遵循了良好的模块化设计原则。

### TypeScript 的接口

TypeScript 的接口语法上只包含抽象数据类型的规范，即它的 公共方法签名 和 公共实例方法签名。每个方法签名都以分号结尾。

接口**不能包含实现信息**，所以不能声明任何私有字段，也不能包含方法体。

接口中也**不应包含**抽象函数、表示不变量、或者“防止表示暴露”的说明，因为这些内容都依赖于具体表示（即类中的内部状态）

> 定义了一个接口 `Curve` 和它的一个实现类 `ArrayCurve`，用于表示平面上的不可变曲线（immutable curve）
>
> ```ts
> /** Represents an immutable curve in the plane. */
> interface Curve {
>     /** @returns true if the point (x,y) lies on this curve */
>     contains(x: number, y: number): boolean;
>
>     /** @returns a curve formed by connecting this with that */
>     join(that: Curve): ArrayCurve; /* A */
> }
>
> /** Implementation of Curve. */
> class ArrayCurve implements Curve {
>     /** make a one-point curve */
>     public constructor(x: number, y: number) { ... }
>
>     /** @returns a curve formed by connecting this with that */
>     public join(that: Curve): ArrayCurve { ... }
>
>     /** @returns the total path length of this curve */
>     public pathLength(): number { ... }
> }
> ```
>
> 这是对接口 `Curve` 的一个具体实现类，表示的是用一系列点数组成的曲线（从命名 `ArrayCurve` 推测的）。
>
> 以下关于 `Curve` 和 `ArrayCurve` 的论述，正确还是错误：
>
> 1. 有标签 A 的一行有问题，接口和类之间的相互引用了。
> 2. 标签 A 的一行有问题，因为它不是表示无关性（representation independence）

Solution：

1.  错误。 在 TypeScript 中，类和接口之间的循环引用是合法的，有时甚至是必要的。就像函数可以是递归的（调用自身）或相互递归的（相互调用）一样，类型也可以是递归的（使用自身）或相互递归的（相互使用），这意味着循环引用。我们将在后续课程中更多地了解递归数据类型。
2. 正确。 返回 ArrayCurve 会使所有 Curve 客户端知晓 ArrayCurve 的实现，甚至可能依赖于该实现。连接操作应该返回 Curve，而不是 ArrayCurve。

## 子类型

回想一下，类型（type）是一组值以及相关操作。例如，TypeScript ArrayLike 类型由一个接口定义，该接口具有长度和 [..] 索引操作。

如果我们考虑所有可能的 ArrayLike 值，它们实际上都不是 ArrayLike 类型的对象：我们无法创建接口的实例。相反，这些值可能是字符串对象、数组对象，或者任何提供 ArrayLike 所需操作（即长度和 [..] 索引）的类的对象。

**子类型（subtype）** 只是 父类型（supertype） 的一个子集。例如：`string` 和 `Array` 是 `ArrayLike` 的子类型。当我们说 “**B 是 A 的子类型**” 时，意思是：**每一个 B 都是一个 A**。从规格（specification）的角度看： “**每一个 B 都满足 A 的规格要求**”。

只有当 **B 的规格至少和 A 一样强** 时，B 才能算作 A 的子类型。当我们声明一个实现接口的类时，TypeScript 编译器会自动强制执行部分要求：例如，它会确保 A 中的每个方法都出现在 B 中，并具有兼容的类型签名。类 B 必须实现 A 中声明的所有操作才能实现接口 A。

但是编译器无法检查我们是否在逻辑上削弱了规格：例如，让方法在某些输入上有更严格的前置条件，或者在输出上放宽了后置条件，或者削弱了接口向客户端承诺的保证。因此，当你在 TypeScript 中声明一个子类型（例如通过 `implements` 实现接口）时，你必须自己确保这个子类型的规格至少与父类型一样强

### TypeScript 的子类型

要声明类 B 是接口 A 的子类型，请使用 implements 语句：

```ts
class MyArray<Element> implements ArrayLike<Element> {
  ....
}
```

此声明要求 MyArray 实现（提供方法体）ArrayLike 中的所有操作，其规范至少与 ArrayLike 中的规范一样严格。TypeScript 会静态检查类型，但人类程序员必须检查规范的其余部分。

请注意，即使我们无法创建 ArrayLike 接口的实例，我们仍然可以使用它来声明变量、参数和返回类型，只要它们最终使用来自具体子类型类（例如 MyArray）的对象进行初始化即可。

还可以使用 extends 声明一个接口是另一个接口的子类型：

```ts
interface ReversibleArrayLike<Element> extends ArrayLike<Element> {
    // inherits signatures and specs of existing ArrayLike operations, and adds new ones:

    /** Reverse this array, mutating it in place. */
    reverse(): void;
}
```

由于 `ReversibleArrayLike` 也是一个 接口， 它并不会为 `ArrayLike` 中的操作提供任何具体实现。但它可以通过以下方式强化该类型的规格，强化已有的 ArrayLike 操作（比如`length`或索引访问`[i]`添加更严格的约束），或者添加新的操作。这里新增了一个 reverse 操作

> [!NOTE]
>
> TypeScript 的接口可以定义非方法属性，只不过不能是 private 的

### TypeScript 的结构子类型

在 TypeScript 中，还有另一种方法可以将类型 B 变为类型 A 的子类型：**结构子类型（ Structural subtyping）**。使用结构子类型，B 不必在其声明中提及 A（无需 `B implements A `或 `B extends A`）。但是，如果 B 至少提供了 A 所需的所有操作——相同的公共方法和公共实例变量，并且类型兼容——那么 TypeScript 就会将 B 视为 A 的子类型。

```ts
interface A {
  foo(): void;
}

class B {
  foo() { console.log("ok"); }
}

let a: A = new B(); // ✅ 合法，因为 B“看起来像”A
```

结构子类型在 TS 中很方便，并且经常是必需的，但在类型安全方面存在漏洞，因为即使 B 的规范不兼容，他也允许 B 成为 A 的子类型（不看功能契约，只看结构契约）。举个例子， Array 和 ReadOnlyArray

```ts
const readonlyArr: ReadlyArray<number> = [1, 2, 3];
```

`[1, 2, 3]` 是一个 普通的 `Array`，是可变的，TS 允许它赋值给`ReadOnlyArray<number>`，因为`Array`包含了其所有的方法（如 map、 foreach 等），只是多个变更操作（如 push， pop），所以`Array`是`ReadOnlyArray`的结构子类型，你不能调用变更操作：

```ts
readonlyArr.push(5);
// static error: property 'push' does not exist on type 'readonly number[]'
```

并且，还有一种陷阱，别名泄露导致“假只读”。

```ts
const arr: Array<number> = [1, 2, 3];
const readonlyArr: ReadonlyArray<number> = arr;
```

这里我们把 **同一个数组对象**同时赋值给了 `arr`（可变）和 `readonlyArr`（只读）。结果是：

```ts
arr.push(4);
console.log(readonlyArr); // 打印：[1, 2, 3, 4]

```

虽然 `readonlyArr` **类型上是只读的**，但由于我们还持有 `arr` 的可变引用，实际上还是改动了内容。这就破坏了 ReadonlyArray 的语义“它是不可变的”！这是结构化子类型的“漏洞”：Array 结构上符合 ReadonlyArray，但行为上不符合！

> ```ts
> interface MutableRectangle {
>     setSize(width: number, height: number): void;
> }
> ```
>
> 这个接口表示一个**可变的矩形**，你可以任意设置宽高（例如 `setSize(3, 5)`）
>
> ```ts
> class MutableSquare implements MutableRectangle {
>     private side: number;
>     // ... TODO implement setSize
> }
>
> ```
>
> 现在你想实现一个**可变正方形类**，让它成为可变矩形的子类，重点问题是它必须实现 `setSize(width, height)`。但问题是：正方形必须保持 `width == height`。
>
>  看三个实现方案，并分析为什么都不符合行为子类型
>
> 方案 1：
>
> ```ts
>
> /** Set this square's dimensions to width x height. Requires width == height. */
> public setSize(width: number, height: number) { ... }
>
> ```
>
> 方案 2：
>
> ```ts
> /** Set this square's dimensions to width x height. Throws if width != height. */
> public setSize(width: number, height: number) {
>     if (width != height) throw new Error("Not a square");
> }
> ```
>
> 方案 3：
>
> ```ts
> /**
>  * If width == height, set to width x height.
>  * Otherwise, new dimensions are unspecified.
>  */
> public setSize(width: number, height: number) { ... }
>
> ```

Solution :子类型原则（Liskov Substitution Principle）要求：一个子类型必须能够替代父类型，并不违反父类型的契约。

方案 1： 不合法 —— 因为它 加强了前置条件

方案 2： 不合法 —— 因为它的行为 不兼容

方案 3： 不合法 —— 因为 弱化了后置条件。 原始 `MutableRectangle.setSize()` 的语义是“设置并成功生效”，但这个子类却说“有时不一定生效”。

## 例子： MyString

我们看下这个例子

```ts
/**
 * MyString represents an immutable sequence of characters.
 */
interface MyString { 

    // We'll skip this creator operation for now
    // /**
    //  * @param s 
    //  * @returns MyString representing the sequence of characters in s
    //  */
    // public constructor(s: string) { ... }

    /**
     * @returns number of characters in this string
     */
    length(): number;

    /**
     * @param i character position (requires 0 <= i < string length)
     * @returns character at position i
     */
    charAt(i: number): string;

    /**
     * Get the substring between start (inclusive) and end (exclusive).
     * @param start starting index
     * @param end ending index.  Requires 0 <= start <= end <= string length.
     * @returns string consisting of charAt(start)...charAt(end-1)
     */
    substring(start: number, end: number): MyString;
}
// 我们的第一个实现
class SimpleMyString implements MyString {

    private a: Uint16Array;

    public constructor(s: string) {
        this.a = new Uint16Array(s.length);
        for (let i = 0; i < s.length; ++i) {
           this.a[i] = s.charCodeAt(i);
        }
    }

    /**
     * @inheritdoc
     */
    public length(): number {
        return this.a.length;
    }

    /**
     * @inheritdoc
     */
    public charAt(i: number): string {
        return String.fromCharCode(this.a[i]);
    }

    /**
     * @inheritdoc
     */
    public substring(start: number, end: number): MyString {
        const that = new SimpleMyString("");  // make a temporarily-empty object
        that.a = this.a.slice(start, end);    // ... and immediately replace its array
        return that;
    }
}

// 优化后的实现
class FastMyString implements MyString {

    private a: Uint16Array;
    private start: number;
    private end: number;

    public constructor(s: string) {
        this.a = new Uint16Array(s.length);
        for (let i = 0; i < s.length; ++i) {
            this.a[i] = s.charCodeAt(i);
        }
        this.start = 0;
        this.end = this.a.length;
    }

    /**
     * @inheritdoc
     */
    public length(): number {
        return this.end - this.start;
    }

    /**
     * @inheritdoc
     */
    public charAt(i: number): string {
        return String.fromCharCode(this.a[this.start + i]);
    }

    /**
     * @inheritdoc
     */
    public substring(start: number, end: number): MyString {
        const that = new FastMyString(""); // make a temporarily-empty object
        that.a = this.a;                   // ... and immediately replace its instance variables 
        that.start = this.start + start;
        that.end = this.start + end;
        return that;
    }
}
```

（请注意，我们在 `length`、`charAt` 和 `substring` 的规范注释中使用了 `@inheritdoc` 标记。这表示这些方法实现了 MyString 接口中的对应规范，TypeDoc 将根据这些规范自动生成文档。）

**客户端将如何使用这个抽象数据类型？** 以下是一个示例：

```ts
const s: MyString = new FastMyString("good morning");
console.log("第一个字符是：" + s.charAt(0));
```

遗憾的是，这种模式破坏了我们精心构建的抽象类型与具体实现之间的抽象屏障。客户端必须知晓具体实现类的名称。由于 TypeScript 接口不包含构造函数，客户端不得不直接调用具体类的构造函数。该构造函数的规范不会出现在接口定义中，因此无法在静态层面保证不同实现会提供相同的构造函数。

为解决这个问题，我们可以通过工厂函数来实现创建操作：

```ts

/**
 * @param s 输入字符串
 * @returns 返回表示字符序列的 MyString 实例
 */
function makeMyString(s: string): MyString {
    return new FastMyString(s);
}
```

客户端在不破坏抽象屏障的情况下使用 ADT

```ts
const s: MyString = makeMyString("good morning");
console.log("第一个字符是：" + s.charAt(0));
```

完全隐藏实现是一种设计权衡——有时客户端需要根据特性差异选择不同的实现方案。

## 为什么要用接口？

接口之所以常用，是因为它：

- 作为编译器和开发者的文档；接口不仅帮助编译器检测 ADT 实现中的错误，也帮助人类读者理解代码。接口相比实现代码更易读、更聚焦于“它做什么”而不是“它怎么做”
- 支持替换式优化；不同的 ADT 实现方式，其方法性能可能差别巨大。不同的应用可能更适合不同实现，但我们希望应用层代码保持表示独立性
- 支持“未完全确定”的规格
- 支持多重视角
- 支持不同可靠性的实现，有时我们为同一个接口编写多个实现，是出于“可靠性分层”的考虑。

## 继承

实现接口是使一个类型成为另一个类型的子类型（subtype）的一种方法。另一种技术你可能已经见过，那就是继承（subclassing）。继承指的是：定义一个类作为另一个类的扩展（或子类），这样做有以下效果：

- 子类**自动继承**其父类的实例方法，包括这些方法的实现（方法体）
- 子类**可以重写**任何继承的方法实现，用自己的方法体替换它
- 子类**同时继承**父类的私有表示（private rep，也就是内部字段）
- 子类还可以**添加新的实例方法和表示字段**来满足自己的需要

上面列表中**加粗**的部分，展示了继承与实现接口的不同之处。接口本身既没有方法体，也没有内部表示（rep），因此当你实现一个接口时，不可能从它那里继承实现或内部字段。

继承是面向对象编程语言中非常常见的特性。你可能已经在 Python 中见过类似写法：

```ts
class SpottedTurtle(Turtle):
    ...
```

这表示定义了一个 `SpottedTurtle` 类，作为 `Turtle` 的子类。TypeScript 提供了相同的机制：

```ts
class SpottedTurtle extends Turtle { ... }
```

就像实现接口一样，继承也意味着子类型关系。如果 `SpottedTurtle` 是 `Turtle` 的子类，那么它必须至少具备与 `Turtle` 一样强的规范（spec），因为 TypeScript 允许在任何需要 `Turtle` 的地方使用 `SpottedTurtle`。

但与实现接口不同的是，**子类不仅继承父类的规范，还继承父类的内部表示（rep）**——即内部字段和实现逻辑。乍一看，这似乎是好事：重用实现可以让代码更加 DRY（Don’t Repeat Yourself，不重复），并更易于修改。

然而，API 设计者的多年经验揭示了这样做的风险。继承父类的内部表示会导致：

- 表示暴露：父类与所有子类共享内部状态；
- 表示依赖：父类和子类相互依赖彼此的实现；
- 表示不变式破坏：父类和子类可能无意间破坏彼此的状态约束。

因此，如果要让继承变得安全且易于维护，父类必须提供两个契约：
 一个是对外部使用者的接口契约，另一个是对子类的继承契约。
 而使用接口时，这些问题根本不会出现。

### 方法重写与动态派发

虽然接口比继承更安全，但在 TypeScript 中我们仍然无法完全避开继承。每个 TypeScript 类都自动继承自 `Object`，并且自动拥有 `Object` 的方法（比如 `toString()`）。我们经常需要重写（override）这些继承的方法，使类的行为符合预期。

例如，默认的 `Object.toString()` 输出并不利于调试：

```ts
const fms: FastMyString = new FastMyString("hello");
fms.toString(); // "[object Object]" —— 没用！
```

现在我们重写它

```ts
class FastMyString {
    ...
    public toString(): string {
        let s = "";
        for (let i = 0; i < this.length(); ++i) {
            s += this.charAt(i);
        }
        return s;
    }
}

```

假设我们把它存在一个父类型

```ts
const obj: Object = new FastMyString("hello")
obj.toString() // ?
```

此时似乎有歧义：`Object` 也有自己的 `toString()` 实现。到底调用哪一个？是 `"[object Object]"` 还是 `"hello"`？

**动态派发（dynamic dispatch）**规则告诉我们：在运行时，调用的方法取决于对象的实际类型（dynamic type），而不是变量的静态类型（static type）。

### 静态检查依赖于静态类型

既然变量的静态类型和对象的动态类型可以不同，我们再来看静态检查会发生什么：

```ts
const obj: Object = new FastMyString("hello");
obj.charAt(0);  // ?
```

运行时 `obj` 确实指向一个具有 `charAt` 方法的对象（`FastMyString`）。 但 `Object` 类型本身没有定义 `charAt` 方法。
 因此，TypeScript 编译器会认为这是一个静态类型错误，拒绝编译。因为 TypeScript 的静态类型检查必须保证：无论对象在运行时是什么类型，编译时允许的每个方法调用在运行时都必须存在。你不能用父类类型的变量（如 Object）调用只有子类才有的方法（如 FastMyString.charAt）

## 泛型

TypeScript 以及其他现代静态类型语言的一个有用特性是泛型类型（generic type）： 它是一种在定义时使用占位类型，而在稍后具体化的类型。Set 类就是一个很好的例子。与其分别为 `Set<string>`、`Set<number>` 等编写不同的规范与实现，我们可以只设计一个通用接口 `Set<T>`，它代表了一整个“set ADT”的家族。

按照惯例，类型参数（type parameters）首字母大写，就像接口和类的名字一样。

```ts
/**
 * A mutable set.
 * @typeParam Element type of elements in the set
 */
interface MySet<Element> {

    // example observer operations

    /**
     * Get size of the set.
     * @returns the number of elements in this set
     */
    size(): number;

    /**
     * Test for membership.
     * @param e an element
     * @returns true iff this set contains e
     */
    has(e: Element): boolean;

    // example mutator operations

    /**
     * Modifies this set by adding e to the set.
     * @param e element to add
     */
    add(e: Element): void;

    /**
     * Modifies this set by removing e, if found.
     * If e is not found in the set, has no effect.
     * @param e element to remove
     */
    delete(e: Element): void;

}
```

请注意：这些规范（specs）基于集合的抽象概念，而非具体实现。
 它们不能提及特定实现的内部字段等细节，应该适用于任何有效的 `MySet` 抽象数据类型实现。

我们还需要一个创建操作，这个 `makeMySet` 操作通过工厂函数实现。

```ts
// 创建函数示例
/**
 * 创建一个空集合。
 * @typeParam Element 集合中元素的类型
 * @returns 一个新的集合实例，初始为空
 */
function makeMySet<Element>(): MySet<Element> { ... }
```

注意：TypeScript 语法要求在函数声明中显式定义泛型参数，因此 `makeMySet` 需要在参数列表前写 `<Element>`，即：

```ts
function makeMySet<Element>()
```

而接口中的实例方法不需要再重复 `<...>` 声明，因为类型参数已经由外层接口 `interface MySet<Element>` 声明过了。

泛型不仅可以用于 ADT，本身也很有用。例如，我们之前讨论过 null 合并运算符（nullish coalescing operator），它常用于断言某个值不是 `undefined`。若想将此逻辑封装成一个辅助函数，可以使用泛型：

```ts
/**
 * 断言一个值不是 undefined。
 * @typeParam T 要收窄的类型
 * @param val 可能为 undefined 的值
 * @param message 出错时要显示的信息
 * @returns 已定义的值
 * @throws 如果值是 undefined，则抛出错误
 */
function assertDefined<T>(val: T | undefined, message?: string): T {
  return val ?? assert.fail(message);
}

const temperatures = [99.4, 95.2, 100];
const firstTemp: number = assertDefined(temperatures[0]);
```

### 实现泛型接口

假设我们要实现上面的 `MySet<Element>` 接口。
 可以有两种方式：

1. 非泛型实现（fixed type）：在实现时用具体类型替换 `Element`。
2. 泛型实现（generic implementation）：实现本身依然保持泛型，占位符不替换。

方式一：泛型接口 + 非泛型实现。 我们来为特定类型实现`MySet<Element>`

```ts
class DigitSet implements MySet<number>
```

在这个实现中，接口中所有提到的 `Element` 都被替换为 `number`。但这种表示显然不适合任意类型的集合。 例如，它无法直接表示 `MySet<string>`，除非我们重新定义表示不变式和抽象函数。

方式二： 泛型接口 + 泛型实现

```ts
interface MySet<Element> { ... }

class HashSet<Element> implements MySet<Element> {
    // ...
}
```

在这种实现中，`HashSet` 的代码对类型参数 `Element` 一无所知——
客户端在使用时才指定具体类型。

## 枚举

有时候，一个 ADT 包含一组小而有限、不可变的值，例如：

- 一年中的月份：January、February、…
- 一周中的天数：Monday、Tuesday、…
- 罗盘方向：north、south、east、west
- 绘图中的线端样式：butt、round、square

这种类型可以作为更复杂类型的一部分（例如 DateTime 或 Latitude），也可以作为某个方法的参数，用来改变该方法的行为（例如 drawLine）。

当这组值是有限且固定的，就很自然地将这些值定义为具名常量，称为**枚举（enumeration）**。
 TypeScript 提供了 `enum` 关键字来方便地定义这种类型：

```ts
enum Month { JANUARY, FEBRUARY, MARCH, ..., DECEMBER };
```

这个枚举定义了一个新的类型名 `Month`（就像 `class` 和 `interface` 一样定义新类型名），同时也定义了一组具名值。这些值我们通常用**全大写**来书写，因为它们相当于**公共的静态只读常量**。

在这种意义上，使用枚举感觉就像使用原始数值常量。 TypeScript 甚至允许在 `switch` 语句中使用枚举（而 `switch` 原本只允许原始数字类型、其包装类型，或字符串类型，而不能使用其他对象）：

```ts
switch (direction) {
  case Direction.NORTH: return "polar bears";
  case Direction.SOUTH: return "penguins";
  case Direction.EAST:  return "elephants";
  case Direction.WEST:  return "llamas";
}
```

TypeScript 实际上提供了**两种枚举类型**：

- 数值枚举（numeric enum）：底层表示是数字；
- 字符串枚举（string enum）：底层表示是字符串。

默认情况下是数值枚举，所以上面的 `Month` 示例使用数字来表示每个月，并从 0 开始自动递增：

- `JANUARY` → 0
- `FEBRUARY` → 1
- 以此类推。

如果希望使用字符串枚举，只需为每个成员初始化一个唯一的字符串值：

```ts
enum Direction {
  NORTH = "north",
  SOUTH = "south",
  EAST = "east",
  WEST = "west"
}
```

## Getter 和 Setter

我们经常会有一些观察者操作（observer operation），它们不需要参数，比如下面这个 `MyString` 接口中的例子：

```ts
interface MyString {
    /**
     * @returns 返回该字符串中的字符数
     */
    length(): number;

    // ...
}
```

但如果我们希望在语法上把这个观察者操作表示成一个实例变量呢？这样，客户端就可以像使用 `Set.size` 或 `Array.length` 那样，省略括号，直接写 `s.length`，而不是 `s.length()`。要在接口中声明这样的“观察者属性”其实很简单：

```ts
interface MyString {
    /**
     * 字符串中的字符数
     */
    readonly length: number;

    // ...
}
```

注意这里的 **`readonly`** 关键字——我们不希望客户端通过给这个属性赋值来“修改字符串的长度”。

但是，这样做会不会牺牲表示无关性？换句话说，会不会迫使我们在 `MyString` 的实现中必须有一个公开的实例变量 `length`？

在支持 getter 方法的语言（比如 TypeScript）中，答案是不会。我们可以用关键字 `get` 来定义一个 getter 方法，这个方法会在客户端读取该属性时被自动调用：

```ts
class FastMyString implements MyString {

    public get length(): number {
        return this.end - this.start;
    }

    // ... 
}
```

而另一种实现则可以选择直接用实例变量来表示 `length`：

```ts
class SimpleMyString implements MyString {

    public readonly length;

    // ...
}
```

关键在于：无论 `FastMyString` 还是 `SimpleMyString`，都可以自由决定这个观察者是通过一个 getter 函数实现的，还是通过一个实例变量实现的，而客户端的代码完全不受影响。对客户端来说，`length` 只是一个“看起来像实例变量”的属性。

如果某个公有实例变量希望看起来是可重新赋值的，
 那么我们可以同时定义一个 getter 方法（观察者） 和一个 setter 方法（修改者）。

`setter` 方法可以执行一切必要的操作，以确保重新赋值后对象的内部表示仍然保持一致，甚至可以在客户端赋了不合法的值时**抛出异常**。

## 非 OPP 语言的 ADT

定义 ADT 的另一种方式是：把它看作是一组可以全局访问的函数，这些函数操作一个不透明的数据类型。这种模式在 TypeScript、Python 等面向对象语言（OOP）中很少见，但在像 C 这样的早期编程语言中却很常见。

下面是一个 C 语言中文件 I/O 的例子：

```c
FILE* f = fopen("out.txt", "w"); // 打开一个文件用于写入
fputs("hello", f);               // 向文件写入内容
fclose(f);                       // 关闭文件
```

在这段代码中，抽象数据类型是 **`FILE`**，表示一个打开的文件。函数 **`fopen`**、**`fputs`** 和 **`fclose`** 是该类型的操作（operations），它们以 `FILE` 作为参数或返回值。（奇怪的是，`fputs` 把文件作为第二个参数。）

由于 C 不是面向对象语言，因此没有类（class）、方法（method）、字段（field），甚至没有 `private` 这样的访问控制机制。
 但它仍然实现了表示无关性。

客户端无法查看 `FILE` 的内部结构； 使用文件的唯一方式就是通过该类型提供的函数来操作它。

这个故事告诉我们， ADT 的概念不依赖于特定语言特性，数据抽象是强大的设计模式，在软件工程中无处不在。

## TypeScript 的 ADT

我们现在已经完成了 TypeScript 工具箱中关于 ADT 的概念总结，本次阅读的新概念在下面用黄色标出。

| ADT 概念     | 在 TypeScript 中的实现方式 | 示例                     |
| ------------ | -------------------------- | ------------------------ |
| 抽象数据类型 | 类                         | Date                     |
|              | 接口 + 类                  | ArrayLike 和 Array       |
|              | 枚举                       | PenColor                 |
| 创建者操作   | 构造函数                   | Array()                  |
|              | 静态工厂方法               | Array.of()               |
| 常量         |                            | Number.POSITIVE_INFINITY |
| 观察者操作   | 实例方法                   | String.charAt()          |
|              | 静态方法                   | Object.entries()         |
|              | Getter                     | Map.size                 |
| 生成者操作   | 实例方法                   | String.trim()            |
|              | 静态方法                   | Math.floor()             |
| 修改者操作   | 实例方法                   | Array.push()             |
|              | 静态方法                   | Object.assign()          |
|              | Setter                     |                          |
| 表示         | 私有字段                   |                          |

## 本讲小结

TypeScript 接口帮助我们将抽象数据类型的概念形式化，把它定义为一组必须被类型支持的操作。

这能让我们的代码更具以下特点：

- 避免错误。 ADT 由其操作定义，接口正好实现了这一点。 当客户端使用接口类型时，静态检查确保只能使用接口中定义的方法。 如果实现类暴露了其他方法，或者更糟的是，显示了内部表示，客户端也无法意外访问或依赖它们。 当一个数据类型有多个实现时，接口可以提供方法签名的静态检查。

- 易于理解。 客户端和维护者可以清楚地知道应在哪里查看 ADT 的规范。 接口不包含字段或实例方法的实现，因此实现细节不会混入规范，更容易理解。

- 便于修改。 我们可以通过添加实现接口的类轻松增加新的实现。 如果使用工厂函数而非构造函数，客户端只会看到接口，这意味着可以在不修改客户端代码的情况下切换实现类。
