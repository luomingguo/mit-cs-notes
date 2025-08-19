# Lec 9 函数式编程

我们将探讨多种用于操作元素序列的设计模式，并展示如何将**函数本身视为一等公民**（即可在程序中自由传递和操作的值），这一理念的强大之处。

## Outline

- 迭代器与生成器
- 映射/过滤/归约
- 高阶函数
- 不可变性

## 一等函数

我们从复习一个重要的核心理念开始，**函数作为一等数据值**，意味着他们能够存储在变量里面，作为函数的参数进行传递，也能动态创建。举个例子，`Math.sqrt`是是对表示`sqrt`函数的对象的引用，这种对象的类型为 `(x: number) => number`，你可以将该函数赋值给其他变量，其行为不变：

```ts
const mySquareRoot: (x: number) => number = Math.sqrt;
mySquareRoot(16.0); // return 4.0
```

此处 `mySquareRoot` 的类型是**函数类型表达式（function type expression）**。注意参数名（如 x） 不可省略。若写成 `(number) => number`，实际表示“参数名为 `number`、类型隐式为 `any` 的函数”。

你还能将函数的引用作为参数传递给其他函数，或者作为返回值，再或者存储在变量和数据结构中。换句话说，函数在TypeScript就是一等公民，意味着他们能够被认为是编程语言中任何值。

编程语言中有大量的非一等公民的东西。例如，访问控制就不是一等公民——你不能将public 或 private作为参数传递给函数，也不能将其存储在数据结构中，TypeScript 无法在运行时引用或操作它们。

在旧的编程语言中，只有数据是一等公民：内置类型（如数字）和用户定义类型。但在现代编程语言中，如 Python 和 JavaScript，数据和函数都是一等公民。一等函数是一种非常强大的编程思想。第一个使用它们的实用编程语言是 Lisp，由 MIT 的 John McCarthy 发明。但将函数作为一等公民值进行编程的想法实际上早于计算机，可以追溯到 Alonzo Church 的 lambda 演算。lambda 演算使用希腊字母 λ 来定义新函数；这个术语流传甚广，你会发现它不仅在 Lisp 及其后代语言中是一个关键词，在 Python 中也是如此。

### TypeScript中的函数表达式

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