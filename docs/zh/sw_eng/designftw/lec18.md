# Lec 18 异步编程







![image-20260511081334969](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260511081334969.png)

JavaScript是一个单线程，但我们经常需要调用一些外部的、耗时较长的任务，或者是那些会根据用户输入而不可预测地触发的任务，比如定时器、DOM 事件、网络请求（例如加载图片、调用大语言模型）、以及数据库和文件访问等。 

如果我们把所有这些工作都以同步方式执行，也就是在 JavaScript 程序的主流程中顺序执行，那么代码就会在等待这些任务完成时被阻塞，无法继续运行。

这些任务都可以以异步方式运行，也就是说，它们可以独立于 JavaScript 代码的其余部分并行进行。我们将学习用于处理异步代码的编程设计模式和抽象机制。







## 轮询

我们希望从网络上加载一张图片到一个 image 元素中，然后再通过 `init()` 启动某些 UI 功能。

```js
let img = document.createElement('img');

// 设置 src 会触发图片加载
img.src = 'https://pictures.com/mine.jpg'

while (!img.complete) {
    // 干等着（无所事事地等待）
}

init();
```

主线程永远无法执行完那个 `while` 循环，因此异步的图片加载过程也会一直被阻塞。

改为周期性轮询，而不是在 `while` 循环中阻塞等待。这样浏览器就可以在两次轮询之间继续处理其他工作。但这种方式仍然会反复不断地检查。而且一旦图片加载完成，它还会持续不断地调用 `init()`。

```js
let img = document.createElement('img');

img.src = 'https://pictures.com/mine.jpg';

let pollId = setInterval(() => {
  if (img.complete) {
    init();
  }
}, 250);

doOtherStuff();
```

为了让`init`函数只执行一次，可以在满足条件后停止后续的轮询。

```js
let img = document.createElement('img');

img.src = 'https://pictures.com/mine.jpg';

let pollId = setInterval(() => {
  if (img.complete) {
    clearInterval(pollId);
    init();
  }
}, 250);

doOtherStuff();
```

但这种方式相比**直接收到通知**仍然更繁琐、也更浪费资源。这也促使了事件监听器（event listeners）以及其他异步抽象机制的出现。



**小结**

轮询**有时候有必要**， 对"不配合的"对象进行监控，例如持续跟踪另外一个网站上的网页是否发生变化。 对方不会主动通知你，所以你只能不断询问

**缺点**是轮询是粗粒度的，在真正去检查之前，我们并不知道内容已经更新了。 当什么都没有变化时，仍然会浪费时间和计算资源（能源）不断检查



## 响应式编程

优点

- 利用可用的并行性
  - 一次同时做 10 件事，完成速度可以快 10 倍
- 在等待较慢任务时仍然保持响应
  - 不会因为等待某个耗时操作而让整个程序卡住

缺点

- 必须向用户展示“正在等待”的状态
- 必须记住当前正在等待什么任务
- 异步编程之所以令人困惑，是因为它不是顺序执行的
  - 无法按顺序追踪代码执行， 存在许多可能的执行顺序
- 代码会变得复杂且难以阅读
- 是许多 Bug 的来源
- 调试困难



### 事件



而轮询是拉取模式，程序周期性询问是否有新的消息。

而**事件（event）**是推送模式，我们为某个时间绑定一个回调函数，当新消息出现时，事件就会主动调用这个回调，把信息推送给我们。

同是事件是一种观察者模式

- 我们可以通过`addEventListener`来订阅事件
- 也可以通过`remoteEventListener`来取消订阅

这种方式相比定时器中的 `clearTimeout` 和 `clearInterval` 更统一、更规范，而不是针对不同情况的特殊处理。



```js
let img=document.createElement('img');

img.addEventListener('load',init); // 当资源加载完成时，会触发（trigger）load 事件
img.src='https://pictures.com/mine.jpg'

doOtherStuff(); //runs during img load
```

代码的实际执行顺序，并不一定和你看到的书写顺序一致，这会带来很多让人混淆的情况。比如， 资源可能在开始监听之前就已经加载完成了， 这样程序就永远收不到这个事件。这类问题通常非常难调试， 而且再次运行程序时，执行顺序又可能发生变化。



### 回调函数

是通过函数来把执行控制权交给异步任务，我们其实两次见到这种回调模式了。那么当我们需要把多个一步任务chuanlianshi

```js
setInterval(() => {
  button.textContent = ++i;
}, 500);
```

