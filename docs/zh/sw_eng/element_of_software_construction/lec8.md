# Lec 8 接口 & 子类型

本节将介绍实现抽象数据类型的各种方法，包括：

- 接口： 将抽象数据类型（ADT）的接口与其实现分离
- 泛型：用泛型类型参数定义一系列的数据类型（ADT）
- 枚举： 定义具有一小组有限值的ADT
- 对不透明类型操作的全局函数（一种对用户隐藏内部实现细节的类型，仅能通过特定的全局函数交互。例如C的`FILE*`的模块抽象类型）：在 TypeScript 中很少见，但在非面向对象语言中很常见。

我们还将讨论子类型（subtyping），即由其规范确定的两种类型之间的关系，并会区分子类化（subclassing）

完成今天的课程后，你应该能够： 使用类、接口、泛型和枚举定义 ADT 判断一个类型是否是另一个类型的子类型。

## Outline

- 接口
- 子类型
- 子类
- 泛型
- 枚举
- Getter和Setter
- 非面向对象语言的抽象数据类型
- TypeScript的抽象数据类型
- 总结



## 接口

TypeScript的**接口（interface）**是一种表达抽象数据类型的机制。在TS中，接口是一个方法签名列表，这些方法没有方法体。当一个类在其 implements 子句中实现了某个接口，并为该接口的所有方法提供具体实现（方法体）时，就认为该类实现了这个接口。

因此，在 TypeScript 中定义抽象数据类型的一种方式，就是通过接口来定义该类型的规范（即方法签名），而将该类型的具体实现放在实现该接口的类中。

接口可以只向客户端程序员暴露使用契约（contract），而不会暴露实现细节。客户端程序员只需阅读接口定义，就能了解该抽象数据类型的功能，无需也无法依赖其内部表示，因为接口中根本就没有这些内容（甚至连私有字段也没有）。这样，接口和实现被彻底地分离，位于不同的类中，遵循了良好的模块化设计原则。

### TypeScript的接口

TypeScript 的接口语法上只包含抽象数据类型的规范，即它的 公共方法签名 和 公共实例方法签名。每个方法签名都以分号结尾。

接口**不能包含实现信息**，所以不能声明任何私有字段，也不能包含方法体。

接口中也**不应包含**抽象函数（abstraction function）、表示不变量（rep invariant）、或者“防止表示暴露”的说明，因为这些内容都依赖于具体表示（即类中的内部状态）。

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
> 2. 标签A的一行有问题，因为它不是表示无关性（representation independence）

Solution：

1.  错误。 在 TypeScript 中，类和接口之间的循环引用是合法的，有时甚至是必要的。就像函数可以是递归的（调用自身）或相互递归的（相互调用）一样，类型也可以是递归的（使用自身）或相互递归的（相互使用），这意味着循环引用。我们将在后续课程中更多地了解递归数据类型。
2. 正确。 返回 ArrayCurve 会使所有 Curve 客户端知晓 ArrayCurve 的实现，甚至可能依赖于该实现。连接操作应该返回 Curve，而不是 ArrayCurve。

## 子类型

回想一下，类型（type）是一组值以及相关操作。例如，TypeScript ArrayLike 类型由一个接口定义，该接口具有长度和 [..] 索引操作。

如果我们考虑所有可能的 ArrayLike 值，它们实际上都不是 ArrayLike 类型的对象：我们无法创建接口的实例。相反，这些值可能是字符串对象、数组对象，或者任何提供 ArrayLike 所需操作（即长度和 [..] 索引）的类的对象。 

**子类型（subtype）**只是超类型（supertype）的子集：字符串和数组是 ArrayLike 的子类型。B 是 A 的子类型 意味着 "每个 B 都是 A"。就规范而言："每个 B 都满足 A 的规范"。

这意味着，只有当 B 的规范至少与 A 的规范一样强时，B 才是 A 的子类型。当我们声明一个实现接口的类时，TypeScript 编译器会自动强制执行部分要求：例如，它会确保 A 中的每个方法都出现在 B 中，并具有兼容的类型签名。类 B 必须实现 A 中声明的所有操作才能实现接口 A。 但编译器无法检查我们没有以其他方式弱化规范：例如，强化方法某些输入的先决条件、弱化后置条件、弱化接口抽象类型向客户端通告的保证。如果您在 TypeScript 中声明一个子类型（我们当前的重点是实现接口），那么您必须确保子类型的规范至少与超类型的规范一样强。

### TypeScript的子类型

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

### TypeScript的结构子类型

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

结构子类型在TS中很方便，并且经常是必需的，但在类型安全方面存在漏洞，因为即使B的规范不兼容，他也允许B成为A的子类型（不看功能契约，只看结构契约）。举个例子， Array 和 ReadOnlyArray

```ts
const readonlyArr: ReadlyArray<number> = [1, 2, 3];
```

`[1, 2, 3]` 是一个 普通的 `Array`，是可变的，TS允许它赋值给`ReadOnlyArray<number>`，因为`Array`包含了其所有的方法（如 map、 foreach等），只是多个变更操作（如push， pop），所以`Array`是`ReadOnlyArray`的结构子类型，你不能调用变更操作：

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
> 方案1：
>
> ```ts
> 
> /** Set this square's dimensions to width x height. Requires width == height. */
> public setSize(width: number, height: number) { ... }
> 
> ```
>
> 方案2：
>
> ```ts
> /** Set this square's dimensions to width x height. Throws if width != height. */
> public setSize(width: number, height: number) {
>     if (width != height) throw new Error("Not a square");
> }
> ```
>
> 方案3：
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

方案1： 不合法 —— 因为它 加强了前置条件

方案2： 不合法 —— 因为它的行为 不兼容

方案3： 不合法 —— 因为 弱化了后置条件。 原始 `MutableRectangle.setSize()` 的语义是“设置并成功生效”，但这个子类却说“有时不一定生效”。



### 为什么要用接口？

接口之所以常用，是因为它：

- 让规范清晰易读；
- 支持替换式优化；
- 容纳模糊规范；
- 表达多角色对象；
- 区分不同可信度实现；
   从而帮助我们构建更**抽象、模块化、灵活、安全**的程序。

## 子类

