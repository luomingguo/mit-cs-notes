---
title: '回调函数 & GUI'
type: lecture
lecture: 17
tags: []
status: complete
---
# Lec 17 回调函数 & GUI

[toc]

**目标**

学习回调函数的概念，在这个回调中， 实现者调用由客户端提供的函数。

**实现者**：指的是编写和执行主要程序逻辑的部分，通常是指库、框架或服务提供的代码。

**客户端**：指的是使用这些库、框架或服务的代码部分，通常由最终用户或开发人员编写

我们在 promises 的上下文中讨论了这个概念，展示了如何使用回调函数实现 await。我们还将看到回调函数在 GUI 中的使用，在那里一种称为监听器（listener）的回调函数用于响应来自用户的输入事件

## 介绍

回调函数是客户端提供给模块以供模块调用的函数。这与正常的控制流程相反，在正常情况下，客户端调用模块提供的函数。而使用回调时，客户端提供了一段代码让实现者调用。

我们已经在函数式编程中看到了回调的一种形式：传递给`map`、`filter`或`reduce`的函数，这些函数会对序列中的每个元素进行重复调用。这是同步回调，因为它只在`map`/`filter`/`reduce`执行期间调用，并且之后不再使用。

异步回调，这种回调由模块保存，以便在将来某个时间调用，即在接收回调的函数已经返回之后。这里有一个类比来帮助理解同步和异步的区别。正常（同步）函数调用就像拿起电话拨打一个服务，比如打电话给银行查询账户余额。你提供银行操作员需要的信息，他们通过电话读回账户余额给你，然后你挂断电话。你是客户端，银行是你调用的模块。

有时银行回复得很慢。你会被搁置，你会等到他们找到答案。这就像一个同步函数调用，等待返回结果。

但有时任务可能需要很长时间，银行不想让你一直等待。于是银行会向你要一个回调电话号码，并承诺在某个不可预测的时间点把答案回拨给你。这类似于提供一个异步回调函数。

有时回调函数只会被调用一次（或最多一次），作为一次性请求的响应，就像这个账户余额的例子一样。但回调函数也可能被重复调用，每当某个事件发生时都会调用。对此类回调的一个类比可能是账户欺诈保护，当你的账户发生可疑交易时，银行会拨打你注册的电话号码。我们将在这篇阅读材料中看到这两种异步回调。

## 定时器回调函数

一个使用回调函数的简单例子是 JavaScript 内置的 `setTimeout` 函数，它接收两个参数：一个回调函数和一个等待时间（毫秒数），在时间到达后执行回调函数：

```ts
setTimeout(
    () => console.log("beep!"),
    3000
);

> setTimeout(() => console.log("beep!"), 3000); console.log("boop!");
boop!
>
3 秒后
beep!
```

可以看到回调函数是异步执行的。调用 `setTimeout()` 本身不会等待 3000 毫秒（3 秒）再打印 `boop!`。相反，它启动了一个内部计时器，存储对回调函数的引用，然后立即打印 `boop!`。当内部计时器在三秒后到期时，回调函数才被调用，打印 `beep!`。

顺便提一句：`setTimeout` 的设计有些特殊，它将回调函数作为第一个参数。这样写在一行中，可能很难看出箭头函数表达式何时结束、`setTimeout` 的剩余参数从何开始。**通常，回调函数出现在参数列表的最后**，下面阅读中的其他例子也都遵循这个惯例。

为了展示如何定义一个接受回调函数的函数，我们可以创建一个倒计时定时器：

```ts
/**
 * 启动一个定时器，每秒触发一次，直到倒计时结束。
 * @param ticks      定时器持续时间（秒），必须为大于等于 0 的整数
 * @param callback   回调函数，第一次同步调用，
 *                   之后每次计时器滴答时异步调用，
 *                   每次传入剩余秒数 ticksLeft。
 *                   ticksLeft 的取值范围是 [0, ticks]。
 */
function countdown(ticks: number, callback: (ticksLeft: number) => void): void
```

注意 `callback` 参数的类型：它是一个函数类型。在这个例子中，`countdown()` 期望的回调函数接受一个数字参数，并返回 `void`。

## 事件循环

这些定时器回调让我们看到了 TypeScript/JavaScript 编程模型的一个核心特性。在 JavaScript 的运行时系统中，核心是一个事件队列（event queue），这是一个先进先出（FIFO）的队列，用来存储从各种来源到达的事件。事件队列由事件循环（event loop）处理，它会反复检查队列中新到的事件，并调用相应的回调函数。

事件的一个来源是由 `setTimeout` 创建的定时器。定时器到期时，会在队列末尾放置一个“定时器完成”事件以及它的回调函数。当事件循环最终从队列头部取出这个事件时，它就会调用回调函数，从而履行 `setTimeout` 的契约。

在后续阅读中，我们还会看到另一类事件来源：图形用户界面（GUI）。对于在 HTML 网页中运行的 JavaScript，用户的按键、鼠标移动或点击、触屏操作，都会被放到事件队列的末尾，最终由注册的回调函数处理。

还有一种事件来源是文件系统和网络的输入输出，这部分内容将在后续阅读中讲到。

实际上，我们所有的 TypeScript/JavaScript 代码都是在事件循环中运行的——甚至程序的启动也是从事件循环开始的。为了让程序正常工作，所有代码必须及时返回事件循环，这样事件循环才能处理下一个事件，并继续处理后续的定时器到期或 GUI/文件/网络事件。

如果我们的代码阻塞了控制流——长时间没有返回调用者——事件循环就会停止处理事件。定时器回调无法触发，用户界面停止响应，网络连接也无法接收数据。如果你曾见过鼠标光标变成旋转的沙滩球或沙漏，那就是事件循环被阻塞的迹象，说明程序不再处理事件。这是很糟糕的。

下面是一个会阻塞 JavaScript 事件循环的简单函数：

```ts
/** 等待指定毫秒数后再返回。 */
function busyWait(milliseconds: number): void {
    const now = new Date().getTime(); // new Date().getTime() 返回当前时间的毫秒数
    const deadline = now + milliseconds;
    while (new Date().getTime() < deadline) {
        // 什么也不做，只等时间达到截止点
    }
}
```

调用 `busyWait(10000)` 会让程序不断循环检查时间，直到 10 秒过去。在这段时间内，事件会在事件队列中堆积，但事件循环无法处理它们，因为 `busyWait()` 没有返回。一旦 `busyWait()` 返回调用者（调用者再返回它的调用者，一直到事件循环，也就是 JavaScript 中一切的最初调用者），事件循环才能取出下一个等待的事件并调用它的回调函数，程序才恢复正常。但此时，所有堆积的定时器回调都会延迟触发！

记住，在循环中等待外部变化的做法叫做“忙等待”（busy-waiting），对于像 JavaScript 这样的事件循环运行时系统来说，这是一种非常糟糕的代码味道。像 `busyWait()` 这样的代码需要重写，应该改为使用由变化触发的回调（就像内置的 `setTimeout()`）或由变化触发的 Promise（比如我们实现的异步版本 `timeout()`）。

## 用 promises 实现回调

在 JavaScript 引入 Promise 之前，回调函数是实现异步函数行为的最常见方式，而在 JavaScript 库生态中，回调函数依然有很多用途。实际上，Promise 在内部也使用了回调函数。我们来深入了解 Promise ADT，以及理解其工作原理，以及它如何与 await 和 async 函数交互的。

一个抽象数据类型是由其操作定义的，而 `Promise<T>` 只有一个关键操作，叫做 `then`。最简单的 `then` 定义如下：

```ts
interface Promise<T> {
  then(callback: T=>U):  Promise<U> ;
}
```

`then` 操作是一个 Promise 生成器。它作用于一个已有的 Promise（该 Promise 最终会产生 T 类型的值），并附加一个回调函数。这个回调函数消费 Promise 最终生成的 T 值，并产生某种其他类型 U 的值（当然可能与 T 相同）。示例，

```ts
const promise: Promise<string> = fs.promises.readFile('account', { encoding: 'utf-8' });

const biggerPromise: Promise<number> = promise.then(function(data: string) {
  return parseInt(data);
});
```

这里，原始的 Promise（读取文件为字符串）通过 `then` 与一个回调函数组合，该回调函数将字符串解析为数字。生成的 `biggerPromise` 表示整个计算过程——读取文件并解析为数字——并承诺最终会产生这个数字。

可以把 `then` 想象成异步计算的组合操作。传统函数组合将两个函数 f 和 g 组合成一个新函数 g ⚬ f，使得 `(g ⚬ f)(x) = g(f(x))`。如果 f: S → T，g: T → U，那么组合后的函数类型是 g ⚬ f: S → U。

同样地，`then` 将一个计算 f（由返回值的 `Promise<T>` 表示）与另一个计算 g 组合，g 消费 T 值并生成 U 值。组合的结果是一个  `Promise<U>` ，承诺最终生成 U 值。

另一种理解是把 `Promise<T>` 想象成一个单元素列表，最终会包含一个 T 值。从这个角度看，`then(g)` 就像对列表做 `map(g)`——一旦 T 元素到达，g 回调就被调用，生成的 U 值成为结果  `Promise<U>`  的唯一元素。（不过这个类比在  `Promise<void>`  上不完全成立，因为 void Promise 从不包含实际元素值，但当  `Promise<void>`  完成时，`then(g)` 仍然会调用 g，只是不传值。）

我们需要扩展 `then` 的概念：回调函数不必返回已经计算好的 U 值，它也可以返回一个自身的  `Promise<U>` ：

```ts
interface `Promise<T>` {
  then(callback: T => U |  `Promise<U>` ):  `Promise<U>` ;
}
```

如果计算 U 需要另一项耗时操作，这样做就很有用。例如获取网页内容时，`fetch()` 返回 Response 对象只是意味着已经建立连接，实际下载页面可能还需要时间。示例：

```ts
const promisedResponse: Promise<Response> = fetch('http://www.mit.edu/');

const promisedText: Promise<string> = 
  promisedResponse.then(function(response: Response): Promise<string> {
    const downloadingPromise: Promise<string> = response.text();
    return downloadingPromise;
  });
```

这里有几个 Promise：

- `promisedResponse` 表示初始连接 [www.mit.edu](http://www.mit.edu) 的计算
- `downloadingPromise` 表示连接建立后下载 MIT 首页的计算
- `promisedText` 表示两步计算的组合：先连接，再下载，最终的值来自 `downloadingPromise`

即使传入 `promisedResponse.then()` 的回调没有使用 `async` 或 `await`，它仍然返回一个 Promise，因此是异步函数。

回到函数组合的类比，如果 `promisedResponse` 和 `downloadingPromise` 类似于 f 和 g，那么 `promisedText` 就像 g ⚬ f 的组合。

你可以对一个 Promise 多次调用 `then`，附加不同的回调函数，对 Promise 的值做不同处理。

无论 Promise 当前处于什么状态，都可以调用 `then`。大多数情况下，Promise 仍在 pending，那么回调将在未来某个时刻执行。如果 Promise 已经完成，回调会更快执行——但仍然是异步的。`then` 永远不会同步调用回调。它总是先返回，之后在控制权回到事件循环后，回调才会被调用。

`then` 是 Promise 的基础操作。它是访问 Promise 计算结果的唯一方式。（`await` 实际上就是使用了 `then`。）这是一个安全特性，保证客户端代码无法查看 Promise 内部的未完成值。更重要的是，`then` 是并发设计的特性，它允许通过一系列组合的计算构建并发计算——一系列 `then` 回调可以以可控、可预测的方式交错执行。

## 解析异步函数

`then` 操作现在让我们能够理解 `await` 和 `async function` 的含义，以及它们如何使用 Promise 和回调函数来构建一个计算过程。

来看一个包含 `await` 的 async 函数示例，它等待一个 Promise 完成，然后对结果做一些计算。

```ts
async function getBalance(): Promise<number> {
    const promise: Promise<string> = fs.promises.readFile('account', { encoding: 'utf-8' });
    const data: string = await promise;
    const balance: number = parseInt(data);
    return balance;
}
```

当在函数执行中遇到 `await` 时，TypeScript 会把函数后续要执行的计算封装成一个 `then` 回调。所以这段代码：

```ts
const data: string = await promise;
const balance: number = parseInt(data);
return balance;
```

实际上变成了：

```ts
promise.then(function(data: string) {
  const balance: number = parseInt(data);
  return balance;
});
```

`await` 并不会阻塞等待文件读取的 Promise 完成，而是创建了一个组合 Promise，把文件读取的计算与 `parseInt` 的计算组合起来。然后立即把控制权返回给调用者，同时返回这个组合 Promise。

所以不使用 `await` 或 `async` 的等效代码大致如下：

```ts
function getBalance(): Promise<number> {
    const promise: Promise<string> = fs.promises.readFile('account', { encoding: 'utf-8' });
    return promise.then(function(data: string) {
      const balance: number = parseInt(data);
      return balance;
    });
}

```

注意，这个版本的 `getBalance` 比较简单，因为它是顺序执行的直线代码。如果在循环中使用 `await`，那么“函数剩余的计算”包括循环的剩余迭代，这种情况下语法转换就没法像上面那样直观地表示，因为循环被拆成了多段。但这个示例在语义上展示了 `await` 的含义。

另外，这个版本的 `getBalance` 已经不再需要 `async` 关键字了，因为我们展示的是 `async` 在 TypeScript 内部如何被转换成更底层代码的含义。但它仍然是异步的，因为它返回一个 Promise，表示一个尚未完成的并发计算。

总结：当你写 `async function` 而不是普通 `function` 时，TypeScript/JavaScript 会在内部转换函数行为：

- `await` 表达式被转换为返回一个与 `then` 组合的 Promise；
- `return` / `throw` 语句被转换为完成 / 拒绝该 Promise；
- 函数通过自然结束返回时，会先完成 Promise，然后再返回。

## HTML 和 DOM

异步回调在图形用户界面中被广泛使用。要理解其机制，我们首先需要以 HTML 网页为例了解用户界面的结构。

HTML 由元素构成，这些元素由开始标签和结束标签界定。例如，以下是一个按钮的 HTML 描述：

```html
<button id='drawButton'>
  Draw
</button>
```

开始标签通常包含属性，如此按钮示例中的`id`。`id`属性是元素的唯一标识符。其他属性可指定元素的其他特性。例如，以下是一个 256x256 像素的绘图区域：

```html
<canvas id="drawingCanvas" width="256" height="256"></canvas>
```

HTML 元素可以嵌套在其他 HTML 元素中，形成树形结构。以下 HTML 代码片段使用`<div>`分组元素将两个按钮分组在一行，画布置于另一行：

```html
<div>
    <button id="drawButton">Draw</button>
    <button id="clearButton">Clear</button>
</div>
<div>
    <canvas id="canvas" width="256" height="256">
    </canvas>
</div>
```

当网页浏览器加载并显示此类 HTML 文档时，每个元素在内存中均有一个对象表示，即`HTMLElement`子类的实例。此元素树称为**文档对象模型**。树中每个元素占据屏幕的特定区域，通常为其边界框的矩形区域。该树不仅是任意层次结构，更是一个空间层次结构：子元素通常嵌套在父元素的边界框内。

几乎所有 GUI 系统都具备此类可视化元素树。元素树是一种强大的结构化概念，在典型 GUI 中承担多重职责：

- **输出**：元素的属性和子元素影响其在屏幕上的显示内容。例如，按钮的标签即是其开始与结束标签之间的文本。
- **输入**：元素可具备输入处理器，用于响应用户的鼠标、键盘输入及其他事件。下文将详述。
- **布局**：DOM 控制元素在屏幕上的布局方式，即如何分配其边界框。自动布局算法通过 CSS 编写的样式规则自动计算每个元素的位置和尺寸。CSS 布局不在 6.102 课程讨论范围内；可参考 6.104[原 6.170]、6.450 课程或 IAP Web.Lab 学习。

### 与 TypeScript 的连接

为创建交互式用户界面，HTML 亦可包含 JavaScript 代码（或已编译为 JavaScript 的 TypeScript）。代码可通过`getElementById()`获取树中元素的引用：

```ts
const drawButton: HTMLButtonElement = getElementById('button', 'drawButton');
```

请注意，此处的`getElementById()`函数并非标准的`document.getElementById()`方法，而是其类型安全的 TypeScript 版本。

DOM 元素是可变的，因此代码可通过重新分配实例变量或调用更改器来增删树中的元素，或改变其外观。例如，以下代码更改按钮标签：

```ts
drawButton.text = 'Draw Randomly';
```

## 输入处理

GUI 的输入处理方式与典型的命令行或文本输入用户界面不同。典型文本 UI 具有输入循环：显示提示符、读取用户输入的命令、解析并决定如何将其导向程序的不同模块。

若以类似方式编写 GUI，伪代码如下：

```ts
while (true) {
    read mouse click
    (x,y) = position of mouse click
    if (mouse was clicked on the Draw button) drawRandomShape();
    else if (mouse was clicked on the Clear button) clearCanvas();
    else if (mouse was clicked somewhere on the canvas) drawShapeAtPosition(x, y);
    ...
}
```

但在 GUI 中，我们并不直接编写此类代码，因其缺乏模块化。GUI 由多种库组件（按钮、滚动条、文本框、菜单）组装而成，这些组件需要自包含并能处理自身输入。图形用户界面库深处有一个输入循环，负责读取鼠标和键盘输入，并将这些输入事件传递给 GUI 的相应组件。

为使按钮在点击时执行操作，您需要为其附加监听器：

```ts
drawButton.addEventListener('click', (event: MouseEvent) => {
  drawRandomShape();
});
```

GUI 事件处理是监听器模式的一个实例。在该模式中：

- 事件源生成离散事件流
- 一个或多个其他模块订阅（或监听）事件流，提供在新事件发生时需调用的函数

在此示例中：

- 按钮是**事件源**
- 其**事件**是按钮按下
- **监听器**是客户端提供的函数

事件通常包含附加信息，这些信息可能捆绑在事件对象中（如此处的`MouseEvent`），或作为参数传递给监听函数。

当事件发生时，事件源通过调用监听回调函数将其分发给所有已订阅的监听器。因此，图形用户界面的控制流如下：

1. 事件循环读取鼠标和键盘输入。在 HTML/JavaScript 及大多数其他 GUI 框架中，此循环实际上对您隐藏，它内置于 JavaScript 运行时系统中，监听器看似被自动调用。
2. 每个监听器执行其操作（可能涉及更改用户界面中的对象），然后立即返回到事件循环。
3. 最后一部分——监听器尽快返回事件循环——至关重要，因为它保证了用户界面的响应能力。

监听器设计模式不仅用于按钮按下。每个 GUI 对象都会生成事件，这通常是输入设备（如鼠标、键盘或触摸屏）发送的某些低级输入事件组合的结果。例如，在 HTML 中：

- 鼠标发送低级事件`mousedown`（鼠标按键按下）和`mouseup`（按键释放）
- 键盘在按键按下和释放时发送类似的低级事件`keydown`和`keyup`
- 按钮在接收到`mousedown`和`mouseup`后发送`click`事件
- 下拉菜单在用户（通过鼠标或键盘）从下拉菜单中选择不同元素时发送`input`事件
- 当其内部文本因键盘或鼠标事件发生变化时，文本框发送`input`事件。

## 事件源

监听器模式是一种通用的编程思想，在 TypeScript/JavaScript 编程中以两种形式出现：

- 在网页中，如前所述，可作为事件源的对象实现了`addEventListener()`方法，这是`EventTarget`接口的一部分。
- 在 Node.js 中，事件源实现了`on()`方法，这是`EventEmitter`的一部分。`addListener()`是`on()`的同义词。

`addEventListener()`和`on()`/`addListener()`方法具有基本相同的参数：一个指定事件类型的字符串，以及一个在事件发生时调用的回调函数。

## 监听的陷阱

监听器设计模式存在一些常见的陷阱，在 GUI 时尤其要注意。

监听器应快速执行并立即返回。若监听函数需要执行耗时计算来响应事件，将导致用户界面卡顿。由于监听器由 GUI 事件循环调用，在监听器返回前，事件循环将无法继续处理其他输入事件。

例如，假设绘图按钮的监听器需要绘制大量随机图形：

```ts
drawButton.addEventListener('click', (event: MouseEvent) => {
    for (let i = 0; i < 1_000_000; i++) {
        drawRandomShape();
    }
});
```

绘制百万个矩形将导致长时间卡顿。在此期间网页会呈现冻结状态：鼠标点击无响应、滚动失效、键盘输入无法处理。多数操作系统会将鼠标光标变为沙漏或旋转彩球提示界面卡顿。当所有矩形绘制完成且监听函数返回后，事件循环才会继续处理。所有卡顿期间触发的输入事件均被存入队列，最终将按序处理。

核心启示在于：**图形用户界面中的监听函数必须快速执行并立即返回**，通常应在几毫秒内完成。若监听器需执行耗时任务，应运用我们在前序课程讨论过的并发处理机制。

警惕循环触发。当两个 GUI 元素存在相互依赖关系时（如下方代码中的文本框与滑块）：

```ts
<div>
    Size:
    <input type="number" id="sizeTextbox" value="10" min="1" max="50" maxlength="2"> 
    <input type="range" id="sizeSlider" value="10" min="1" max="50">
</div>
```

用户既可通过文本框输入数值，也可通过滑块调整尺寸。两种操作都需同步更新另一个元素以保持一致性。此时容易建立如下双向监听：

```ts
sizeTextbox.addEventListener('input', (event: ChangeEvent) => {
    sizeSlider.value = sizeTextbox.value; // 使滑块同步文本框
});
sizeSlider.addEventListener('input', (event: ChangeEvent) => {
    sizeTextbox.value = sizeSlider.value; // 使文本框同步滑块
});
```

这将形成监听循环：文本框变更触发滑块更新，滑块更新又可能触发文本框同步，进而形成无限循环风险。在此特定案例中，循环触发可通过规范避免：`input`事件仅在使用鼠标或键盘进行用户操作时触发，通过代码修改值不会激活事件。但开发者在其他场景中仍需警惕该风险。

**务必进行资源清理**。当程序不再需要监听时，应及时移除监听器。`EventTarget`的`addEventListener()`与`EventEmitter`的`on()/addListener()`都对应有移除方法`removeEventListener()`和`off()/removeListener()`。未能及时清理无用监听器将导致界面性能下降或产生异常行为。

## 本讲小结

- 回调是一等函数的典型应用，支持将函数像数据一样传递，返回和存储
  - 回调可以是同步的，也可以是异步的
- TypeScript/JavaScript 通过时间循环和事件队列机制来管理异步回调
- GUI 事件采用监听器模式，各模块可监听不同事件并绑定回调函数
- 监听器必须快速返回控制权，以避免形成循环监听
