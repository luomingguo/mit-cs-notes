---
title: 函数、类和 this
course: 6.4500 Web设计：语言和用户接口
course_id: '6.4500'
lecture: 16
kind: design
tags: []
status: complete
---
# Lec 16 函数、类和 this

## 函数与参数

js 函数的声明

```js
function hypot(x, y) {
  return Math.sqrt(x ** 2 + y ** 2)
}
```

函数表达式为

```js
let hypot = function (x, y) {
  return Math.sqrt(x ** 2  + y ** 2)
}
```

箭头函数写法，这是更紧凑的一种写法。

- 如果只有一个参数，参数外面的括号甚至也可以易忽略
- 除了语法上的区别之外，箭头函数与普通函数之间还存在一些行为差异，后续会讲

```js
let hypot = (x, y) => Math.sqrt(x ** 2 + y ** 2);
let hypot = (x, y) => {
  return Math.sqrt(x ** 2 + y ** 2)
}
```

上述函数的调用都是相同的，`hypot(3, 4); //5`

**函数调用 vs 函数引用**

JavaScript 里一个非常常见的错误，把函数调用和引用搞混。

```js
let handler = evt => console.log("Thank you");
button.addEventListener("click", handler)
```

这个箭头函数没有返回值，因此默认返回 undefined 作为事件监听器，

```js
button.addEventListener("click", undefined);
```

**参数缺失**

```js
let hypot = (x, y) => Math.sqrt(x ** 2 + y ** 2);
console.log(hypot(5)); // What does this log?
```

答案是 `NaN`，

**可变参数函数**

JavaScript 允许你在调用函数时传入任意数量的参数，而不会报错。
 不过，如果你想把“可变数量的参数”收集成一个数组，可以使用 [rest parameter syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)（剩余参数语法）。

注意，你也可以使用  [spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)（展开语法）把数组中的元素“展开”为位置参数，例如用于调用另一个函数。

还要注意，剩余参数语法可以和普通参数一起使用（只要它放在普通参数后面即可）。
 这也是为什么它被称为 **剩余参数** ，因为它会捕获“剩下的所有参数”

```js
let sum = function (...numbers) {
	let total = 0;

	for (let n of numbers) {
		total += n;
	}

	return total;
}

let avg = function(...numbers) { // 剩余参数
	return sum(...numbers) / numbers.length; // 展开参数
}
```

**缺省参数**

```js
let hypot = (x, y = x) => Math.sqrt(x ** 2 + y ** 2);
console.log(hypot(5)); // What does this log?
```

答案是 `7.071067812`

位置参数 vs 字典参数

API 设计上，要避免使用位置参数，和可选参数

```js
let event = document.createEvent('KeyboardEvent');
event.initKeyEvent("keypress", true, true, null, null,
                   true, false, true, false, 9, 0); // 非常难懂和难用
```

为了可以清楚知道每个参数代表什么，不需要记忆参数的位置，和额外提供一些无意义的参数。 最好使用字典参数

```js
let event = new KeyboardEvent("keypress", {
	ctrlKey: true,
	shiftKey: true,
	keyCode: 9
});
```

## 函数是一等公民

如果一门编程语言把函数当作头等公民，那么它就被认为支持头等函数。这意味着它支持把函数作为参数传递给其他函数，从其他函数返回函数作为返回值，并且可以将函数赋值给变量或存储在数据结构中。

二等函数：函数是可执行代码，程序员编写函数，函数用于创建和操作数据，参数和返回值都是数据，函数可以减少管理数据时的重复代码。（古早的汇编语言）

例子：一个函数， 多个引用

下面这个段会生成什么？

```js
let f = x => x + 1;
let g = f;
f = 42;
g(1);
```

1. f 一开始是一个指向 `x=>x+1`的引用，它是一个函数
2. 现在 g 也是指向同一个函数
3. 现在 f 被重新赋值指向 42， g 则没有改变
4. g 调用函数 `x => x + 1`， 并将 x 绑定为 1， 因此返回 2

例子：函数作为对象属性

```js
let greet = function() {
	console.log(`Hi, I’m ${this.name}`);
};
let instructors = [
	{name: "Lea", greet: greet},
	{name: "David", greet: greet}
];

for (let instructor of instructors) {
	instructor.greet();
}
```

**方法**

当函数作为对象的属性存在时，它们被称为方法（Methods）。对象的这些属性没有任何特殊限制，它们可以被覆盖、重新赋值，也可以被添加到我们不拥有的对象中等。当一个函数作为方法被调用时，它的特殊 `this` 参数会指向该对象本身，这被称为函数上下文，我们很快会更详细地讨论它。注意，console.log() 是 console 对象的一个方法。

一个值得记住的启发式规则是判断是否需要使用方法：**如果我们实际上不需要访问某个对象，那么就没有必要把这个函数设计成方法**。

方法 =  函数 + 函数属性

```js
" Hello!   ".trim() // "Hello!"
```

**函数作为返回值**

```js
function interpolate(min, max) {
	return function (p) {
		return min + (max - min) * p;
	}
}
// 调用
let range = interpolate(1, 10);
console.log(range(.1), range(.5), range(.9));
```

> 为什么要将函数作为一等公民？

Sol：

- 回调： 由浏览器调用的代码（例如事件处理）
- 异步执行：稍后才会被调用的代码
- 抽象：可以用来对其他代码进行参数化的代码

我们将 满足 将函数作为参数传入，和/或 返回一个函数的函数称为高阶函数

## Map、Reduce、Filter

三个高阶函数 Map、Reduce、Filter。 在 JavaScript 中，这些都是 Array 对象上的方法，每一个方法都接收一个回调函数：这个函数会被应用到每一个元素上。它们是对一组数据进行批量处理时常见的模式。

- map：对每个元素进行转换 👨 👨 👧 ➡ 👨🏼 👨🏼 👧🏼
- filter：筛选出符合条件的元素 👨 👨 👧 ➡ 👨 👧
- reduce：将多个元素合并成一个结果 👨 👨 👧 ➡ 👨‍👨‍👧

例子，Map

```js
// 没有用map
let numbers = [1, 2, 3, 4];
let squares = [];
for (let n of numbers) {
  squares.push(n ** 2);
}
// 运用map
let numbers = [1, 2, 3, 4];
let squares = numbers.map(n=>n**2);
```

![925761115022513](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/925761115022513.gif)

例子， Filter

```js
// 没有用filter情况
let numbers = [1, 2, 3, 4, 5];
let odd = [];

for (let n of numbers) {
	if (n % 2) {
		odd.push(n);
	}
}

// 使用filter的情况
let numbers = [1, 2, 3, 4, 5];
let odd = numbers.filter(n => n % 2);
```

例子， Reduce

```js
// 没有用reduce的方法
let numbers = [1, 2, 3, 4, 5];
let sum = 0;

for (let n of numbers) {
	sum += n;
}

// 使用reduce方法
let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce(
	(acc, current) => acc + current,
	0 // initial value
);
```

**链式调用**

计算 1 到 5 中所有奇数的平方和：

```js
let numbers = [1, 2, 3, 4, 5];
let result = numbers
    .filter(n => n % 2)
    .map(n => n ** 2)
    .reduce((acc, cur) => acc + cur, 0);
```

因为每一个数组方法都会返回一个新的数组，所以我们可以在结果上继续调用其他数组方法。这种写法叫做链式调用（chaining），在 JavaScript 中非常常见.

需要注意其性能影响：这段代码实际上遍历了 3 次数组，而一个精心设计的循环版本只需要遍历一次， 不过，从算法复杂度来看，这两种方式都是 O(N)。

### 本讲小结

从软件工程上讲， `map`、`filter`、`reduce` 这些函数用来描述“你想做什么”，而不是“你如何去做”。 这种方式让开发者的意图更加清晰，从而让其他开发者更容易理解和修改代码。同时，它也允许系统在不改变代码的情况下，替换底层实现以提升效率。

还有其他迭代函数：

- [`sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort/)
- [`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter/)
- [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map/)
- [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce/)
- [`find`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find/)
- [`Object.groupBy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy/)
- [`flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap/)
- [`every`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every/)
- [`some`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some/)
- [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach/)
- [`reduceRight`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight/)
- [`Map.groupBy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy/)

## 闭包

引例， 下面函数会打印什么？

```js
let i = 5;
function logI() {
	console.log(i);
}

logI();
i = 6;
logI();
```

答案是  5 和 6

那下面呢？

```js
function logI() {
	console.log(i);
}
let i = 5;

logI();
i = 6;
logI();
```

a. 5, 6 / b. `Uncaught ReferenceError: i is not defined`， 答案是 a 🤯

在下面呢？

```js
let i = 5;
function logI() {
	console.log(i);
}

logI();
{
	let i = 6;
	logI();
}
```

答案是 5 和 5

这里原因归结于，词法作用域。函数使用词法作用域：它在函数被定义的时候就会捕获变量，而不是在函数“执行”的时候。这种通过闭包实现。

闭包会保持外部变量不变，这就解释了第 3 个引例为什么是 5 和 5.

**let 作用域**

下面看一个常犯错的例子

```js
let i;
for (i = 1; i <= 3; i++) {
	button.addEventListener("click", evt => {
		console.log(i);
	});
}
```

答案是 4,4,4

```js
let i;
for (i = 1; i <= 3; i++) {
	let j=i;
	button.addEventListener("click", evt => {
		console.log(j);
	});
}
```

答案是 1,2,3。  原因是`let`声明的是块级作用域，它的作用域是 `for` 循环内部的代码块，并且每一次循环迭代得到一个不同的变量。

**通过闭包实现计数**

```js
function counter(start = 0) {
	let i = start;
	return () => ++i;
}
let a = counter();
console.log(a(), a()); // 1, 2

// 简化
const counter = (s = 0) => () => ++s; 

```

这里为什么要用`const`?

**优先使用 const**

优先使用 const， 在闭包中，使用`let`意味着被捕获（闭包引用）的变量绑定可能在之后发生变化。 这样一来，如果你想知道一个函数最终返回什么，就必须继续阅读周围的代码，去检查这个变量绑定是否发生了改变。

因此，除非你确实需要可变性，否则应优先使用 `const`

## 类

很多时候，我们需要创建大量同一类型的对象：

- 它们有相同的属性和方法
- 但是属性的具体值不同

类（class）可以检查这个过程（遵循 DRY 原则：Don't Repeat Yourself）

做法是：

- 在类的定义中统一声明属性和方法
- 使用 `new` 来构造对象
- 所有创建出来的对象都会继承这个类的结构（属性和方法）

```js
class Person {
	constructor (name, birthday) {
		this.name = name;
		this.born = new Date(birthday);
	}
	getAge () {
		const ms = 365 * 24 * 60 * 60 * 1000;
		return (new Date() - this.born) / ms;
	}
}
let david = new Person(
	"David Karger",
	"1967-05-01T01:00"
);
let lea = new Person(
	"Lea Verou",
	"1986-06-13T13:00"
);
console.log(lea.getAge(),
	david.getAge());
```

### 继承

子类继承用`extends`

```js
class PowerArray extends Array {
	constructor(...args) {
		super(...args);
	}

	isEmpty() {
		return this.length === 0;
	}
}

let arr = new PowerArray(1, 2, 5, 10, 50);
console.log(arr.isEmpty()); // false

let arr2 = PowerArray.from([1, 2, 3]);
console.log(arr2.isEmpty()); // false
```

通常我们会想要在已有的类（class）基础上添加新的属性和方法，做法是创建一个新类，并让它继承（extends）原来的类（包括属性和方法，方法也包括构造方法）。

- `super` 关键字绑定到你所继承的父类，用于访问父类的属性或方法。

- 需要注意的是，即使是静态方法也会被继承。

JavaScript 只支持两种属性可见性：public 和 private， 意味着子类实际上无法读取父类的私有属性。 私有属性和方法以井号（`#`）开头表示，与可以随时创建的普通（public）属性不同，私有属性必须提前声明。访问私有属性会抛出 `TypeError`，而不是返回 `undefined`，但不能通过这种方式把构造函数设为私有。也可以定义私有方法、私有静态字段等。

```js
class Clicker {
  #clicks = 0;

  click () {
    this.#clicks++
  }
  getClicks () {
    return #clicks;
  }
}
```

下面给出一个自定义 HTML 元素的例子

```js
class ClickCounter extends HTMLElement {
	#clicks = 0;

	constructor() {
		super();
		this.#render();
		this.addEventListener('click', this.#clicked)
	}
	#render () {
		this.innerHTML = `Clicked ${this.#clicks}x`;
	}
	#clicked () {
		this.#clicks++;
		this.#render();
	}
}

customElements.define('click-counter', ClickCounter);
```

这里我们创建了一个简单的自定义元素（custom element），用于显示它被点击的次数。

我们通过继承 `HTMLElement` 类来创建自定义元素，然后使用 `customElements.define()` 将这个类与一个标签名关联起来。

我们定义了用于更新元素渲染和处理点击事件的方法，但这些方法是私有的，因此对于其他开发者来说，这个组件的对外 API 看起来就像一个普通的 HTML 元素。

```html
<click-counter> </click-counter>
```

## 方法和 `this`

JavaScript 非常灵活。 他的设计它的设计受 Self programming language 的影响，这种特性不仅适用于类， 我们经常可以直接创建 JavaScript 对象，而完全不需要任何类定义。

方法可以直接添加到对象字面量中

```js
let greet = function() {
	console.log(`Hi, I’m ${this.name}`);
};
let instructors = [
	{name: "Lea", greet: greet},
	{name: "David", greet: greet}
];

for (let instructor of instructors) {
	instructor.greet();
}
```

我们可以把一个函数作为属性添加进去，并且这个函数可以使用 `this` 来进行调用。

![image-20260511181548622](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260511181548622.png)

当函数被调用时，JavaScript 会隐式地将 `this` 传递给函数。运行时会隐式地为每个函数提供一个 `this` 变量，并根据函数被调用时的上下文来设置它。通常情况下，`this` 指向点号（`.`）前面的那个对象。

> [!IMPORTANT]
>
> this 在所有的作用域中都是一个特殊的变量声明

举个例子，在模块（module）中，顶层作用域里的 `this` 虽然存在，但它的值是 `undefined`。如果你在 `<script>` 标签上忘记写 `type="module"`，那么行为就会不同，因为此时全局对象会是 `window` 对象。

```html
<script type="module">
	console.log(this); // 会打印什么呢？ undefined
</script>

// 另外一个例子
<script type="module">
	let logContext = function() {
		console.log(this); // 会打印是什么呢？ Window
	}

	logContext();
</script>
```

**全局对象**

- 原生的全局函数或全局变量其实也是 `globalThis` 对象的属性
- 在大多数浏览器环境中，  `globalThis === window`
- 模块下顶层的 `this` 会是 `undefined`

```html
<script type="module">
    console.log(globalThis); // Window
    console.log(globalThis.HTMLElement === HTMLElement); // true
    console.log(globalThis.globalThis); // Window
    console.log(this); // undefined
</script>
```

Context 是上下文绑定

我们可以在不同对象上调用同一个函数，并得到不同的 `this` 值。这和普通参数一样，也是一种动态绑定！

```html
<script type="module">
	globalThis.logContext = function() {
		console.log(this);
	}
</script>

<script type="module">
	logContext(); // undefined
	globalThis.logContext(); // Window
</script>
```

将`this`绑定到 event.currentTarget 上，这个会打印什么？

```js
button.addEventListener("click", function(event) {
	console.log(this);
});
```

答案是 一个 HTMLButtonElement

再看这个例子，点击后会怎么样？

```html
<button class="btn">Old</button>
```

```js
document.querySelector(".btn").addEventListener("click", function () {
	setTimeout(function () {
		this.textContent = "New";
	}, 100);
});
```

答案： ✅ 什么事情也没发生 ； ❌100ms 后按钮文字变成 New。 原因：内部 `function()` 会拥有它自己的 `this`，因此它不再指向这个按钮。具体说，如果按钮在 module 中，这个 this 最终变成`undefined`，所以更新不会发生。

由于 `this` 本质上只是一个特殊变量，因此在箭头函数中解析 `this`，与解析其他普通变量完全一样；遵循普通的词法作用域规则。

```js
let person = {
	name: "David",
	hello: () => console.log(this)
};
person.hello(); // undefined
```

下面再看这个例子

```html
<button class="btn">Old</button>
```

```js
document.querySelector(".btn").addEventListener("click", function () {
	setTimeout(() => {
		this.textContent = "New";
	}, 100);
});
```

答案：100ms 后按钮文字变成 New。 原因是因为箭头函数，复用外层事件监听函数中的 `this`，而在外层事件监听函数里，`this` 指向的是这个按钮

### 函数的方法

- [`func.call(context, ...args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call/)
- [`func.apply(context, args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply/)

```js
function logContext() {
	console.log(this);
}

logContext(); // logs undefined
logContext.call(document); // logs document
```

注意，由于函数是一等公民，它们也可以拥有方法， 就像其他任何对象一样！我们接下看看这个例子

![image-20260511214323933](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260511214323933.png)

### bind 函数

永久绑定 `this`：`func.bind(context, ...args)`，返回一个新的函数，这个函数的上下文始终绑定为第一个参数。

![image-20260511214801871](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260511214801871.png)

```js
function logContext() {
	console.log(this);
}
let logContext2 = logContext.bind({foo: 1});

logContext2(); // logs {foo: 1}
logContext2.call(document); // logs {foo: 1}
```

当你想要“传递一个函数”（例如把它作为事件监听器，或者作为参数传给其他函数）时，并且你希望它的上下文（context，也就是 `this`）始终是你预期的那个对象；或者你只是希望在不使用 `.call()` 或 `.apply()` 的情况下，也能让函数的上下文保持可用；那么，这种情况下就可以使用 `.bind()`。

`.bind()` 返回的是什么类型的函数？

### 本讲小结

- this 是灵活的、始终存在的，并且是在运行时动态解析的，但这种灵活性也可能成为“坑”（容易出错的点）。

- this 在类和简单对象中使用效果最好。
- 如果你在某个上下文中对 this 的绑定感到困惑，那么最好考虑移除它。

## 访问器

到目前为止我们已经看到 1）**属性**用来保存数据 `arr[0] = "hi";`；2）方法用来执行代码的 `arr.slice(0,1)`，那么像`arr.length`又是什么呢？

JavaScript 以及它的各种 API 中，有很多“看起来像属性”的东西，但在你读取或设置它们时，实际上会执行代码。我们在 DOM 中也见过很多类似的例子，例如 element.textContent、element.innerHTML 等等

可以把访问器理解成，看起来像属性，但背后在跑函数的机制。

我们看这个例子

```js
//  序列化body的内容成HTML字符串返回
console.log(document.body.innerHTML);
// 浏览器先解析这个字符串, 然后替换掉body的子树
document.body.innerHTML = "<em>Hi</em>";
```

**定义 getter**

```js
let lea = {
  name: "Lea",
  birthday: new date("1986-06-13T13:00"),
  // 默认情况下，我们用这种语法定义的访问器
  get age() {
		const ms = 365 * 24 * 60 * 60 * 1000;
		return (new Date() - this.birthday) / ms;
  }
}
lea.age = 30;

console.log(lea.age); // 39.82507970709665
lea.birthday = new Date("1992-04-01T13:00")
console.log(lea.age); // 34.01948786888001
```

**定义 setter**

```js
let lea = {
	birthday: new Date("1986-06-13T13:00"),
	set age (a) {
		const ms = 365 * 24 * 60 * 60 * 1000;
		this.birthday = new Date((Date.now() - ms * a));
	},
}
lea.birthday = new Date("1990-04-01T13:00");
lea.age = 3;
console.log(lea.birthday); // ... 2023 ...
```

**API 设计提示** —— 什么时候使用访问器？

- 当某个东西在语义上“应该是一个属性”，但实际需要计算才能得到时

- 当某个属性依赖另一个属性（避免重复代码，DRY 原则）时

- 当需要经常进行相对操作时，例如：

  比较： `obj.foo++`; vs. `obj.setFoo(obj.getFoo() + 1)`;

- 需要注意“被误以为是高性能”的问题

## 用 module 进行模块化

### 为什么

这是计算机科学中的一个核心思想：

- 把复杂系统拆分成许多小的组件（components）
- 每个组件只负责某一个特定功能所需要的内容
- 尽量减少组件之间的相互依赖和交互

这样做的好处是：

- 可以把注意力（工作记忆）集中在当前相关的那一部分
- 不需要关心系统其他部分的细节 —— 这就是“抽象（abstraction）”

### 怎么做

实现模块化的方法包括：

- 创建不同的“上下文（context）”，并使用不同的命名空间（namespace）
- 允许同一个词或名字在不同上下文中出现而不会混淆
- 文件系统中的目录（directories）
- 具有作用域的局部变量（scoped local variables）
- 对象（objects）

JS 的模块化

- 一段代码（通常在一个文件中），拥有自己的命名空间
- 在其中定义的名字，只在该模块内部可见
- 使用 export 可以让这些名字在其他地方可见
- 使用 import 可以把其他模块中的名字引入当前模块中

语法

```html
<script type="module">
```

```js
export const obj = 'square';
export { obj, draw, ... };
import { obj, draw } from './modules/square.js';
import { obj as square } from './modules/square.js';
```

作用：

- `import file as module`： 把一个文件作为模块导入
- 让 `obj` 可以被外部 `import` 使用（通过 export）
- 导出在文件中定义的变量 / 函数 / 对象等名字
- 把这些名字引入到当前模块的命名空间中
- 导入 `obj`，但在当前作用域中把它改名为 `square`

说明：

- 任何名字都可以被导出——包括 `let`、`function`、`const` 定义的内容
- 使用 `as` 进行重命名，可以避免不同模块之间的命名冲突
- 每个模块只会执行一次，即使它被多次导入也是如此
