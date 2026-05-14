# Lec 12 现代JS和DOM的介绍

阅读资料 

[JavaScript for Python Programmers](https://observablehq.com/@ballingt/javascript-for-python-programmers)



## 介绍

JavaScript  唯一能在浏览器中直接运行的客户端编程语言，由 Brendan Eich 在10 天快速设计出来的语言，彼时是1995年。他能做：

- 自动化：在日程表中的每个 `<td>` 内添加一个 `<time>` 元素
- 行为：当我点击这个按钮时，验证表单并显示错误信息
- API：当收到一条消息时，显示一个操作系统级别的通知弹窗
- Web API：在侧边栏显示我最近 9 条 Instagram 帖子



**标准**

核心语法被称为 **ECMAScript**。 用于与宿主环境不同部分交互的API有：

- [DOM API](https://dom.spec.whatwg.org/)： 用于查询和操作DOM树、处理事件
- [CSS OM](https://dom.spec.whatwg.org/)：用于读取和修改样式表
- [Fetch API](https://fetch.spec.whatwg.org/)： 用于发送 HTTP 请求
- 。。。。非常非常多其他API

Javascript在服务端：Node.js



> 为什么是javascript？

历史原因，可以拜读这篇论文[JavaScript: the first 20 years](https://dl.acm.org/doi/10.1145/3386327) 

这里给出枝端末节：

- 1991 —— 万维网被创建

- 1994 —— 世界开始注意到它

  - Netscape Navigator 引起巨大轰动
  - 任何人都可以编写网页
  - 浏览器大战：Netscape、微软、Sun 争夺对 Web 的主导权

- 只有 HTML，带有内联样式

  - 所有交互都通过表单发送到服务器完成
  - 甚至像验证邮政编码这样的简单操作也要依赖服务器
  - 用户体验很差

  >  如何让客户端具备交互性？

- 1994 年 5 月，Sun Microsystems 宣布推出 Java applets，可以在浏览器中运行

  使用 `<applet code="...">` 标签，应用程序在一个固定的矩形区域中运行

  “沙盒化”：与页面其他部分隔离

- Java 被视为一种“专业级”语言

  - 可以构建复杂的软件系统
  - 面向经过训练的软件工程师
  - 程序规模大，加载速度慢
  - 交互性主要面向专业人士
  - 如果只是验证邮政编码这种小事呢？



Netscape 的回应： 我们必须做点什么！如果所有有趣的功能都由 Java 来完成，那么 Web 就会被 Sun 控制。

为一些简单的场景（比如表单验证）做一个简单的东西

- 要轻量、加载快
- 要简单，让所有网页开发者都能快速理解

关键点： 让“网页本身成为应用程序”，而不是只作为应用的容器。

于是紧急聘请 Brendan Eich，让他“昨天就做出来一个东西”。他从scheme/LISP作为起点，这是最优雅的编程语言，语法非常简单，一个非常小、简单的解释器却具有极强的表达能力

## 主题

下面正式进入 JS 的主题

- 基本语法
- 控制台
- 类型与类型转换
- 变量与常量
- 作用域
- 对象
- DOM 及其操作



## 基本语法

早期受到Java的影响，

```js
statement1;
if (condition) {
  statement
}
for (init; test; step) {
  statements
}
function name(arg1, arg2) {
  return value;
}
```



### Script 标签

<script type="module">

- script 元素中的内容会在页面加载完成后执行
- 或者，也可以使用 `src` 属性，指定一个 URL，从该地址获取脚本内容并执行

较旧的代码会省略 `type="module"`

- 这样也能运行，但行为比较古怪——不推荐使用

![image-20260506155511220](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260506155511220.png)

乍一看，一切似乎都很正常：

- 常见的原始类型：Number（数字）、String（字符串）、Boolean（布尔值）
- 表示“空”的值：null 和 undefined
- 常见算术运算符：`+、-、*、/、**（幂运算）、%（取模）`
- 常见逻辑运算符：`==、!=、>、<、>=、<=、&&（与）、||（或）`
- 常见一元运算符：`+、-、!（非）`
- 函数调用：name(arguments)
- 数组：如 [1, 2, 3, "anything goes"]（里面可以放任何类型）
- 带属性的对象



## 控制台

控制台的用途：

- 检查当前窗口的运行环境（每个窗口 / 标签页都是独立的环境）
- 并且可以修改它

包括

- 你代码中定义的全局变量
- 你的代码通过 console 输出的数据
- DOM：文档结构数据（网页结构）



一些特殊的变量和函数（只有在控制台中）

- `$('#id')`：选择第一个匹配 CSS 选择器的 DOM 元素
  - 等价于 `document.querySelector('#id')`
- `$$('.class')`：选择所有匹配该 CSS 选择器的 DOM 元素，并返回数
  - 等价于`document.querySelectorAll('.class')`
- `$0` - `$4`： 最近在 Elements（元素面板）中选中的 5 个 DOM 元素，`$0` 是最新选中的那个
- `$_`： 上一次在控制台执行表达式的结果



## 类型与类型转换

下面这段会输出什么？

```javascript
4 * "2" ** 3 + 10
```

结果是：42。  与 Python 不同，类型转换在需要时会自动（隐式）发生，而这里JS的`*`只接受数字，因此它的参数会被强制转换为数字。



JS的隐式类型转换：当参数类型不正确时，JavaScript 会自动尝试将其转换为正确的类型

看这个例子，会输出什么

```js
4 * 2 ** 3 + "10" 
```

答案是 "3210"

## 变量与常量

## 作用域

## 对象

## DOM 及其操作

# 阅读资料： JS vs Python



JavaScript 和 Python 很相似！ JS早期借用了Python的一些概念，例如JS从Python引入了 generotor 和 协程， 并加以改造，发展出了 async 和 await； 随后Python 又吸收了这些改进。

《Eloquent JavaScript》是我最喜欢的一本深入学习 JavaScript 的书。不过，如果你想利用已有的 Python 经验、重点关注两者的差异，下面是一个用 Python 来类比理解 JavaScript 的简要说明。

## 变量声明

Python 和 JavaScript 在变量作用域的声明方式上有所不同。

在 Python 中，函数内变量的作用域由该函数中的赋值决定，或者由最近的外层函数作用域决定（如果在该作用域中被赋值）。除非使用 `global` 或 `nonlocal` 关键字显式改变这一行为。

```python
x = 1
def local_variable():
    x = 2
    print(x)

local_variable()  # prints 2
print(x)  # prints 1

def reference_global_variable():
    print(x)

reference_global_variable()  # prints 1

def modify_global_variable():
    global x
    x = 3
    print(x)

modify_global_variable()  # prints 3
print(x)  # prints 3
```



而在JS中，则需要显式声明变量。使用`let`表示可以重新赋值的变量，使用`const`表示不可重新赋值的绑定

```js
let x = 1;
const localVariable = () => {
  const x = 2;
  console.log(x);
}
localVariable(); // logs 2
console.log(x) // logs 1

const referenceGlobalVariable = () => {
  console.log(x);
}
referenceGlobalVariable(); // logs 1

const modifyGlobalVariable = () => {

  x = 3;
  console.log(x);
}
modifyGlobalVariable(); // logs 3
console.log(x) // logs 3
```

在 Observable 环境中，顶层的响应式绑定不需要变量声明关键字，但这是 Observable 的特殊语法；一旦在代码块中编写普通 JavaScript 代码，就需要使用变量声明。

> Observable 环境的特点是，每一段代码是一个"cell"，变量是响应式（reactive），自动根据依赖关系重新执行，例如
>
> ```js
> x = 1
> y = x + 1
> // 当你改x
> x = 5 
> y 自动变成6 
> ```





## 花括号与块作用域

JavaScript 使用花括号 `{}` 来表示代码块，而不是像 Python 用缩进；缩进通常需要与花括号结构一致，但这只是编码风格约定。

如果你更熟悉 Python，下面这个行为可能会让你有点意外：在 JavaScript 中，这段代码是不能工作的：

```js
if (true) {
  const a = 1;
}
console.log(a); // 报错
```

JavaScript 中用 `let` 和 `const` 声明的变量是**块作用域**, 变量只在当前 `{}` 代码块及其内部有效，不像Python是函数作用域。

下面通过例子，看看关键区别

Python（函数作用域）

```python
functions = [];
for i in [1, 2, 3]:
    def print_num():
        print(i)

    functions.append(print_num)


functions[0]()  # prints 3
functions[1]()  # prints 3
functions[2]()  # prints 3
```

原因是，所有函数共享同一个变量 `i` ，循环结束后 `i=3`， 所以全部输出3 



JavaScript（块作用域）

```js
const functions = [];
for (const i of [1, 2, 3]) {
  const printNum = () => {
    console.log(i);
  }
  functions.push(printNum);
}

functions[0](); // logs 1
functions[1](); // logs 2
functions[2](); // logs 3
```

原因是，JavaScript 循环中每次迭代都会创建新的变量绑定，每一次循环都会创建一个新的 `i`， 每个函数"捕获（闭包）"是不同的，所以分别输出1、2、3



## 标签模板字符串



JavaScript 的模板字符串（template literals）有点像 Python 的三引号 f-string。

 Python 示例

```python
s = f"""This is a Python triple-quoted f-string.
It's similar to a template string in JavaScript.
Code goes in here: {1 + 1}"""
```

JavaScript 模板字符串

特点是用反引号 ， 支持多行，用`${}` 插入表达式

```js
s = `This is a JavaScript template literal.
It's similar to a multi-line f-string in Python.
Code goes in here: ${1 + 1}.`
```

所谓“标签模板字符串”就是在模板字符串前面加一个函数，例如

```js
s = capitalize`a small string`
```

这不是普通字符串，而是调用函数`capitalize`。

```js
const x = 12;
const s = capitalize`my favorite numbers are ${x} and ${42}.`;
// 等价于
const s = capitalize(
  ["my favorite numbers are ", " and ", "."],
  x,
  42
);
```

函数 `capitalize` 实际接收到 1）一个字符串数组（被 `${}` 分割后的部分），2）后面是插值表达式的值



## self vs this

不用再在每个实例方法的参数里写 `self` 了！像 C++ 和 Java 一样，`this` 关键字不会出现在函数签名中，但在函数内部始终可用，通常表示当前对象（也就是 Python 里的 `self`）。

在 Python 中，方法绑定（决定 self 指向什么）发生在属性查找时：当在实例上访问一个在类中定义的属性时，会返回一个绑定方法。而在 JavaScript 中，对于使用 function 关键字定义的函数，this 指向什么是在函数调用时决定的；但对于使用“箭头函数”（=>）定义的函数，其行为大致类似于 Python。现代代码中通常大量使用箭头函数，因此这是最值得优先理解的行为。

看下面这个例子

```python
class A:
    def f(self):
        print(self)

a = A()
a.f()
```

发生了什么？ 当你写`a.f`， Python会自动把 a 塞进去，变成`A.f(a)`，self 在“访问方法的时候”就已经决定了。

```js
const obj = {
  f: function() {
    console.log(this);
  }
};

obj.f();  // this = obj

// 但如果当你这样
const g = obj.f;
g();  // this ≠ obj
```

`g()` 是“普通函数调用”， `this` 不在指向 `obj`



再看这个例子， （箭头函数 =>）：更像 Python

```js
const obj = {
  f: () => {
    console.log(this);
  }
};
```

## 用普通对象代替字典

JavaScript 提供了 Map()（类似字典）和 Set() 数据类型，但这些类型没有特殊的字符语法

```js
const holidays = new Map()
holidays.set('laborDay', 'Sept 7')
holidays.get('laborDay') // 结果为 'Sept 7'
```

不过，对象（object）有字面量语法，因此经常被用来代替 map：

```js
// 类似字典
const colors = {
  'red': '#FF0000',
  'green': '#008000',
  'yellow': '#FFFF00',
}
// 属性访问有两种写法：
console.log(colors['red']) // 输出 '#FF0000'
console.log(colors.blue)   // 输出 '#008000'

// “options object” 模式，类似于 Python 中的关键字参数
formatText('hello', {font: 'Times New Roman', size: '12pt'});
```

如果你是从头编写代码，最好使用真正的 Map 或 Set，因为使用普通对象会有一些陷阱（它们有继承的方法，很容易误以为是自己添加的属性）。但在使用已有 API 时，通常还是需要使用这些普通对象。



## 大多数数字都是浮点数

在 JavaScript 中，你遇到的大多数数字都是浮点数。除非你使用仍然不太常见的 BigInt（直到 2021 年才被 Safari 支持），或者使用类型化数组（typed arrays），否则每一个数字都相当于 NumPy 中的“double”：一种双精度 64 位浮点数。甚至在数组索引时也是如此！

整数语法不常见的一个原因是，直到最近它在 Safari 中还不被支持。就像过去写代码需要同时兼容 CPython 和 PyPy（或者 Python 2 和 Python 3）一样，JavaScript 开发者通常会尝试编写能同时在 Firefox、Chrome、Safari 和 Edge 上运行的代码——这些浏览器分别由 Mozilla 和全球三大公司开发。



## 函数表达式

在 JavaScript 中，所有创建函数的语法都可以像 Python 的 lambda 一样作为表达式使用（而不像 Python 的 def 语法）

```js
const wordCount = (s, d=' ') => s.split(d).filter(x => x).length
```

是否曾经希望在 lambda 表达式中使用多条语句？在 JavaScript 中可以做到，只需要加上花括号！

```js
const announce = s => {
  console.log(s);
  console.log('Look, multiple statements!!!');
  return "but now we need an explicit return to return something other than undefined";
}
```

编写只有一个参数且返回函数的函数（而这个返回的函数也只有一个参数，并继续返回函数），这种写法在 JavaScript 中非常简洁，因为对于只有一个参数的函数，参数外的括号是可以省略的

```js
f = x => y => z => x + y + z
```

对应的Python写法就是

```python
f = lambda x: lambda y: lambda z: x + y + z
# 等价于
f = lambda x: (lambda y: (lambda z: x + y + z))
# 或者
def f(x):
    def inner(y):
        def inner_inner(z):
            return x + y + z
        return inner_inner
    return inner

f(1)(2)(3)  # 结果为 6
```

顺带说一下`f(1)` 返回 ，`lambda y: (lambda z: 1 + y + z)`，此时 x 已经被锁住为1（闭包）



JavaScript 的等价写法：

```js
f = x => y => z => x + y + z
// 等价于
f = x => (y => (z => x + y + z))
// 或者
f = x => {
  return y => {
    return z => {
      return x + y + z;
    };
  }
};
f(1)(2)(3) // 结果为 6
```



## Async 和 事件循环

在 JavaScript 中，已经隐式内置了一个事件循环（event loop），并且一直在运行。所以不再需要像 `asyncio.run(your_async_code)` 这样手动启动异步运行环境——它本身就已经在运行了！



## 两种类型体系

你以前是否经历过 Python 在 2.2 版本（2001 年）之前，类型和类还没有统一的时代？那时的“旧式类（old-style classes）”又回来了：在 JavaScript 中，一些内置数据类型并不属于你自定义类型所在的对象继承体系。

因此，就像 Python 2 一样，JavaScript 需要两种不同方式来判断对象类型。

Python:

```python
isinstance(obj, class_) -> bool
```

JavaScript：

```js
typeof obj -> "undefined" | "object" | "boolean" | "number" | "bigint" | "string" | "symbol" | "function" | "object"
obj instanceof class_ -> boolean
```

`instanceof` 只对“object 类型”有用。

## 运算符差异

JavaScript 有类似 C 语言的运算符：

- `!`
- `i++`
- `||`
- `&&`
- `?.`

但它没有：

- `not`
- `and`
- `or`
- `is`

## 三元表达式

JavaScript：

```js
cond ? thenExpr : elseExpr
```

Python：

```python
thenExpr if cond else elseExpr
```



## 相等性

ython 的 `==` 在某种程度上接近 JavaScript 的 `===`。

但 JavaScript 中：

- 数组 `[]`
- Map
- 以及其他内置容器

👉 **不会重载相等运算符**

因此：`===` 永远是“身份比较（identity check）”，而不是“值比较（value equality）”

更广义来说，JavaScript 没有运算符重载；每个运算符在 9 种内置类型上的行为是固定的，不会随着自定义类型变化

## 赋值表达式行为

在 JavaScript 中： 所有非声明的赋值都是表达式

因此：

```
x = (y = 2)
```

是合法的。

执行顺序：

1. `y = 2` → y 变成 2，表达式值也是 2
2. `x = 2` → x 也变成 2

## 数组方法

在 Python 中：

```python
len([1,2,3])
```

在 JavaScript 中：

```js
[1,2,3].length
```

---



在 Python 中：

```python
map(lambda x: x, [1,2,3])
```

在 JavaScript 中：

```js
[1,2,3].map(x => x)
```

------



在 Python 中：

```python
filter(lambda x: x, [1,2,3])
```

在 JavaScript 中：

```
[1,2,3].filter(x => x)
```





## 展开运算符

JS：

```js
const innerArr = [1, 2]
[...innerArr, 3, 4] // 结果是 [1, 2, 3, 4]

const innerObj = {a: 1, b: 2}
{...innerObj, c: 3, d: 4} // 结果是 {a: 1, b: 2, c: 3, d: 4}
```





## 解构赋值

```js
const [x, ...rest] = [1, 2, 3]
// x = 1, rest = [2, 3]
```

JavaScript 的可迭代解构不要求取完所有元素：

```js
const [x, y] = [1, 2, 3]
// x = 1, y = 2
```

JavaScript 还将解构提升到了对象层面：

```js
const {a, ...rest} = {a: 1, b: 2, c: 3}
// a = 1, rest = {b: 2, c: 3}

const {a, c} = {a: 1, b: 2, c: 3, d: 4}
// a = 1, c = 3

const {a, b: {c}} = {a: 1, b: {c: 2}}
// a = 1, c = 2
```

和 Python 3 一样，JavaScript 的字符串是 Unicode 编码的。如果需要处理字节（bytes），需要使用 typed array（类型化数组）。

------

## 字符串

和 Python 3 一样，JavaScript 的字符串是 Unicode 编码的。如果需要处理字节（bytes），需要使用 typed array（类型化数组）。

- Python 的 `True` → JavaScript 是 `true`
- Python 的 `False` → JavaScript 是 `false`
- Python 的 `None` → JavaScript 有两个：`null` 和 `undefined`

------

一个很有用的惯用法：

```
x == null
```

👉 当 `x` 是 `null` 或 `undefined` 时都为真。

通常你需要认真考虑 `==` 的类型转换规则，但这个模式非常值得记住。

## 元编程（Metaprogramming）

如果你需要类似 Python `@property` 的动态属性，可以使用：

- `get`
- `set`

更高级的功能可以使用：

```
Object.defineProperty
```

它类似 Python 中 `__slots__` 和 descriptor 的组合能力。



## JavaScript 风格（Style）

- 变量：camelCase（驼峰命名）
- 类：TitleCase
- 全局常量：ALL_CAPS
- 推荐使用分号（Python 不需要，但 JavaScript 规范建议）
- 缩进：2 个空格（不是 4 个）





## 浏览器开发者工具（Dev Tools）

按：

> cmd + option + I

可以打开开发者工具，包括：

- debugger（调试器）
- profiler（性能分析）
- REPL（交互环境）