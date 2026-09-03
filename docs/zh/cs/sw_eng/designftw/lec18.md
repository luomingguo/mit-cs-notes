---
title: '异步编程'
type: lecture
lecture: 18
tags: [asynchronous-programming, promises, async-await, reactive-programming, signals]
status: complete
---
# Lec 18 异步编程

## TL;DR

- 轮询主动检查状态，事件与回调由变化推送执行；两种模式在控制权、延迟和调试难度上不同。
- Promise 把一次性异步结果表示为可组合值，链式传值、并行组合与错误传播共同解决回调嵌套问题。
- async/await 提升顺序异步流程的可读性，但仍需理解 Promise 的并发与异常语义。
- 响应式系统用 ref、computed、watch 与 watchEffect 表达数据依赖，以较少控制流换取更可预测的界面更新。

## 异步任务为何不能同步等待


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
- 也可以通过`removeEventListener`来取消订阅

这种方式相比定时器中的 `clearTimeout` 和 `clearInterval` 更统一、更规范，而不是针对不同情况的特殊处理。

```js
let img=document.createElement('img');

img.addEventListener('load',init); // 当资源加载完成时，会触发（trigger）load 事件
img.src='https://pictures.com/mine.jpg'

doOtherStuff(); //runs during img load
```

代码的实际执行顺序，并不一定和你看到的书写顺序一致，这会带来很多让人混淆的情况。比如， 资源可能在开始监听之前就已经加载完成了， 这样程序就永远收不到这个事件。这类问题通常非常难调试， 而且再次运行程序时，执行顺序又可能发生变化。

### 回调函数

是通过函数来把执行控制权交给异步任务，我们其实两次见到这种回调模式了。那么当我们需要把多个异步任务串联起来时

```js
setInterval(() => {
  button.textContent = ++i;
}, 500);
```

## `Promise`

### 问题背景

回调地狱。

嵌套回调的写法虽然能用，但可读性很差：

```js
getUser("jopo", user => {
  getUser(user.bestFriendId, friend => {
    getUser(friend.bestFriendId, friendOfFriend => {
      console.log(friendOfFriend.name);
    });
  });
});
```

每一层异步操作都要嵌套一层回调，层数越多，代码越难以理解和维护。这种现象通常被称为回调地狱（*Callback Hell*）

我们希望代码的结构能直接反映我们的意图： 查找我 → 查找我的好友 → 查找好友的好友。用Promise 改写后：

```js
getUser("jopo")
  .then(user => getUser(user.bestFriendId))
  .then(friend => getUser(friend.bestFriendId))
  .then(friendOfFriend => {
    console.log(friendOfFriend.name);
  });
```

三层嵌套变成三行链式调用，逻辑清晰，顺序一目了然。

### 工作原理

Promise 是一个**代表"将来某个时刻会完成的操作"的对象**，具有以下特点：

- 只会完成一次
- 完成时携带一个结果值
- 通过`.then()`方法指定完成后要做什么？

链式调用`.then(callback)` 的工作原理：

- `callback` 接收上一步 Promise 的结果值作为参数
- `callback`的返回值会自动包装成新的Promise，传递给下个`.then()`
- 可以无限链式迪迦，每一步只关注当前值

```js
getUser("jopo")              // 返回 Promise<User>
  .then(user => getUser(user.bestFriendId))   // 返回 Promise<User>
  .then(friend => getUser(friend.bestFriendId)) // 返回 Promise<User>
  .then(friendOfFriend => console.log(friendOfFriend.name));
```

无竞态条件保证：

```js
p = delayed("hi", 1000);
// Promise 将在 1000ms 后以 "hi" 作为结果完成

p.then(res => console.log(res));
// → 1000ms 后输出 "hi"

// ...中间执行大量其他代码...

p.then(res => console.log("bye"));
// 如果 p 此时已经完成，回调立即执行
// → 立即输出 "bye"
```

这意味着你永远不会因为"注册晚了"而错过结果，彻底消除了异步编程中常见的竞态条件问题

旧有的 callback 风格 API 可以用 `Promise` 构造函数包装，使其更简洁易用。`Promise` 构造函数接收一个函数作为参数，该函数的第一个参数 `fulfiller`（也常命名为 `resolve`）就是完成时要调用的回调。

```js
function getUserPromise(userId) {
    return new Promise(fulfiller => {
        getUser(userId, fulfiller);  // 直接把 fulfiller 当回调传进去
    });
}

getUserPromise("jopo").then(user => console.log(user.name));
```

这里的关键技巧是：原来的 `getUser(userId, callback)` 在任务完成后会调用 `callback`，而 Promise 的 `fulfiller` 本身就是一个函数——所以可以直接把 `fulfiller` 作为回调传入，省去了手动调用 `resolve(result)` 的步骤。封装后，所有调用方都可以用干净的 `.then()` 链式写法，无需再接触原始的 callback 结构。

思考题：

```js
wait(1000)	//promise fulfilled after 1000ms
.then(() => console.log(1))
.then(() => console.log(2))
.then(() => console.log(3))


wait(1000)	//promise fulfilled after 1000ms
.then(() => console.log(1))
.then(console.log(2))
.then(() => console.log(3))

```

这两个分别输出什么？

答案：第一个： 延迟， 1，2，3； 第二个：2， 延迟， 1， 3

**原因：** `.then(console.log(2))` 这里并不是传入一个函数——`console.log(2)` 是一个立即执行的表达式，在代码解析时就已经调用，返回值是 `undefined`。相当于`then(undefined)`，这一步被跳过

### 链式传值

每一步的结果传给下一步：

```js
// 传统写法：由内到外，层层嵌套
y = f(g(h(x)));

// Promise 写法：由上到下，线性链式
// Promise.resolve是Promise类的静态方法的
Promise.resolve(x)   // 创建一个以 x 为结果的已完成 Promise
  .then(h)           // h 接收 x，返回 h(x)
  .then(g)           // g 接收 h(x)，返回 g(h(x))
  .then(f)           // f 接收 g(h(x))，返回 f(g(h(x)))
  .then(res => y = res);
```

两者的计算结果完全等价，但 Promise 写法的执行顺序与阅读顺序一致，更符合人的思维习惯

因为 `.then()` 始终返回一个promise，在 Promise 代码中出现深层嵌套往往是错误或设计不良的信号。 看到 Promise 里还在嵌套 `.then()`，通常意味着忘记了 `return`，导致内层 Promise 与外层链断开，既难以维护，也可能引发难以追踪的 bug

### 并行Promise

当多个异步操作互不依赖时，没必要一个等一个，可以同时发起，用 `Promise.all()` 统一等待：

```js
let p1 = fetch(url1);
let p2 = fetch(url2);
let p3 = fetch(url3);

Promise.all([p1, p2, p3])
  .then(([c1, c2, c3]) => {
    // 三个请求全部完成后处理结果
  }, err => {
    // 任意一个失败就进入这里
  });
```

### 错误处理

异步操作不总是成功，Promise 内建了失败处理机制：

- Promise 除了完成（*fulfilled*） 还可以拒绝（*rejected*）
- `.then()` 可以接收**两个回调**：第一个处理成功，第二个处理失败

```js
getUserPromise("jopo")
  .then(
    user => console.log(user.name),   // 成功时调用
    err  => console.log("失败:", err)  // 失败时调用
  );
```

关键规则： 无论哪个回调被调用，它的返回值都会包装成新的 Promise 继续传递给下一个 `.then()`，链不会中断。

实践中更常见的写法是用 `.catch()` 统一处理整条链上的错误：

```js
getUserPromise("jopo")
  .then(user => getUser(user.bestFriendId))
  .then(friend => console.log(friend.name))
  .catch(err => console.log("出错了:", err));  // 捕获上面任意一步的错误
```

### Promise 的组合结论

| 概念            | 要点                                                   |
| --------------- | ------------------------------------------------------ |
| Promise         | 代表一个尚未完成的异步操作，只会结束一次               |
| `.then(f, r)`   | `f` 在完成时调用，`r` 在拒绝时调用                     |
| 链式传值        | 回调的返回值自动包装成 Promise 传给下一步              |
| 返回空值        | 自动包装 `undefined` 继续传递，链不中断                |
| `Promise.all()` | 并行等待多个 Promise，全部完成才继续，任一失败立即拒绝 |

**核心思想：** Promise 把"将来的值"变成了可以像普通值一样传递和组合的对象，让异步代码的结构与逻辑顺序保持一致，从根本上解决了回调地狱的问题。

### 其他常用方法

`p.catch(c)`：专门处理拒绝情况，完成的 Promise 原样传递不受影响：

```js
getUserPromise("jopo")
  .then(user => getUser(user.bestFriendId))
  .catch(err => console.log("出错:", err));  // 只处理错误，不影响正常链
```

本质上是 `.then()` 的简写

```js
p.catch(foo)
// 完全等价于
p.then(x => x, foo)
```

注意：`.catch()` 和 `.then()` 一样，也返回一个新 Promise，可以继续链式调用，也可能再次拒绝。

`p.finally(c)`：无论完成还是拒绝，都会执行回调 `c`，适合做清理工作（如关闭 loading、释放资源）

```js
showLoadingSpinner();
fetchData()
  .then(data => render(data))
  .catch(err => showError(err))
  .finally(() => hideLoadingSpinner());  // 成功或失败都会执行
```

`Promise.race([a, b, c, ...])`：与 `Promise.all()` 相反——最快完成的那个决定结果，其余忽略

```js
Promise.race([fetchFromServer1(), fetchFromServer2()])
  .then(res => console.log("最快的结果:", res));
```

| 方法             | 触发条件               |
| ---------------- | ---------------------- |
| `Promise.all()`  | **全部**完成才触发     |
| `Promise.race()` | **任意一个**完成就触发 |

静态方法汇总

| 方法                  | 作用                                     |
| --------------------- | ---------------------------------------- |
| `Promise.resolve(x)`  | 返回一个**已完成**的 Promise，值为 `x`   |
| `Promise.reject(r)`   | 返回一个**已拒绝**的 Promise，原因为 `r` |
| `Promise.all([...])`  | 全部完成才完成，任一拒绝即拒绝           |
| `Promise.race([...])` | 最快的那个决定结果                       |

`Promise.resolve(x)` 的典型用途是把普通值转为 Promise，传给那些**只接受 Promise 作为输入**的函数或接口。

## `Async` 和 `Await`

async/await 是 Promise 的语法糖，本质上没有引入新的功能，只是让异步代码读起来更像普通的同步代码。

用 Promise 写法时，每一步的结果只能在下一个 `.then()` 的回调里使用，跨步骤引用很麻烦。比如想在最后同时打印 `user` 和 `friendOfFriend`，用 `.then()` 链就需要额外处理作用域问题。async/await 直接解决了这个问题：

```js
async function showFriendOfFriend() {
  const user = await getUser("jopo");
  const friend = await getUser(user.bestFriendId);
  const friendOfFriend = await getUser(friend.bestFriendId);
  console.log(user, friendOfFriend.name); // user 在这里依然可以直接访问
}
```

`await` 会暂停当前 async 函数的执行，等 Promise 完成后再继续，但不会阻塞主线程。`await` 拿到的是 Promise 的实际结果值，而不是 Promise 对象本身，所以可以在函数内任意位置使用。async 函数本身返回一个 Promise，所以它与现有的 Promise 代码完全兼容。`await` 甚至可以用在循环里：

```js
for (let i = 1; i <= 5; i++) {
  let result = await delayed('answer', 5000);
  console.log(i + result);
}
```

### 四种异步模式对比

- polling 的思路是反复主动检查结果，通常是坏主意，浪费大量资源，只在不得不与不友好的系统交互时才考虑。
- callback不需要学习新语法，但嵌套多了会形成回调地狱，难以维护。
- `Promise` 把嵌套拍平成线性的 `.then()` 链，还提供了 `Promise.all()` 等额外 API，但引入了新的概念和写法负担。
- `async/await` 创造了同步编程的假象，心智模型最简单，也支持在循环等结构中使用，但需要语言层面的支持，表达能力上比 Promise 的 API 略弱，不过大多数场景下已经足够。

## 响应式编程与异步的关系

回顾异步运行时模型：JavaScript 代码运行在主线程上，异步系统在边缘处理耗时操作，完成后通过事件或回调通知主线程。async/await 的思路是把所有异步事件"拉进"同步代码里处理，而响应式编程的思路不同——它把程序分成两块：一块是我们写的同步逻辑，另一块是不断向我们发送信息的异步外部世界。

async/await 表达能力很强，可以写任意复杂的异步逻辑，可以把异步任务和其他工作自由穿插，适合需要严格按顺序执行的异步任务。但正因为太灵活，执行顺序变得复杂，难以推理。

响应式编程的表达能力不如通用异步，但它专注于同步与异步的交界处，让我们思考的是"值是什么、值怎么变"，而不是"代码按什么顺序执行"。这种约束反而让程序更容易理解和维护。

![image-20260602123002963](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602123002963.png)

async/await响应式编程表达能力强，可写任意异步逻辑较弱，专注于值的变化，适合场景有顺序依赖的异步任务数据驱动的界面更新推理难度高，执行顺序复杂低，只关心值和变化思维模型执行顺序值与依赖关系。

![image-20260602123022427](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602123022427.png)

|          | async/await          | 响应式编程           |
| -------- | -------------------- | -------------------- |
| 表达能力 | 强，可写任意异步逻辑 | 较弱，专注于值的变化 |
| 适合场景 | 有顺序依赖的异步任务 | 数据驱动的界面更新   |
| 推理难度 | 高，执行顺序复杂     | 低，只关心值和变化   |
| 思维模型 | 执行顺序             | 值与依赖关系         |

### Signal 与 响应式三原语

你在用 Vue 写界面时，最核心的需求是：数据变了，页面自动跟着变。Vue 是怎么做到这件事的？答案就是响应式系统，而 signal 是这个系统的基础构件。Signal 是现代响应式编程的核心概念。

**三种角色，各司其职**。 你可以把一个 Vue 应用想象成一条流水线，数据从左流向右：

```text
外部世界的变化 → ref（存数据）→ computed（算数据）→ watchEffect（用数据做事）
```

`ref` 是数据的容器，外部世界（用户点击、网络返回）只能通过它来修改数据。`computed` 负责从已有数据推导出新数据，比如从单价和数量算出总价，它只读不写，也不做任何"副作用"的事情。`watchEffect` 是流水线的终点，负责把数据的变化同步到外部世界，比如更新页面、发请求、打日志。

这三者职责严格分离，好处是：你出了 bug，可以很快判断问题出在哪个环节。

```js
const price = ref(5)
const quantity = ref(2)

const total = computed(() => price.value * quantity.value)

watchEffect(() => {
  document.title = `Total: ${total.value}`
})
```

----

**为什么要这样设计**?

在这之前，异步编程（callback、Promise、async/await）解决的是"什么时候做"的问题，但执行顺序很复杂，容易出错。响应式编程换了一种思路：你不用管代码什么时候执行，只需要描述"数据之间是什么关系"，框架自己决定什么时候更新。这就是为什么说响应式是一种"受限的异步"——它牺牲了一部分灵活性，换来了更简单的心智模型。

---

Composition API 是什么

Vue 有两种写法，Options API 是旧写法，强制你把所有数据放一块、所有计算放一块、所有方法放一块。

```js
// Optional API写法
createApp({
  data() {
    return { price: 5, quantity: 2 }
  },
  computed: {
    total() {
      return this.price * this.quantity
    }
  }
}).mount("#app")
```

Composition API 是新写法，让你把同一个功能相关的数据、计算、副作用写在一起，代码组织更自然，也直接暴露了 `ref`、`computed`、`watchEffect` 这些底层概念，所以学响应式原理时用它更合适。

```js
import { createApp, ref, computed } from "vue"

function setup() {
  const price = ref(5)
  const quantity = ref(2)
  const total = computed(() => price.value * quantity.value)
  return { price, quantity, total }
}

createApp({ template: "#template", setup }).mount("#app")
```

![image-20260602123907717](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602123907717.png)

----

`watch()` vs `watchEffect()`

`watchEffect()` 会自动追踪内部读取到的所有响应式值，只要任何一个变了就重新执行。`watch()` 则让你明确指定监听哪个值，并且可以拿到变化前后的两个值：

```vue
const query = ref('')

watch(query, (newQuery, oldQuery) => {
  console.log('changed from', oldQuery, 'to', newQuery)
  fetchResults(newQuery)
})
```

当你只想对某个特定值的变化做响应，或者需要对比前后值时，用 `watch()` 而不是 `watchEffect()`。

---

为什么我们很少手写 effect

渲染 DOM 本身就是一个 effect。当你在模板里插值一个响应式值时，Vue 内部自动安排了类似 `watchEffect()` 的机制在值变化时更新对应的 DOM 节点：

```js
const count = ref(0)

// 你写的模板
// <p>Count: {{ count }}</p>

// Vue 内部大概做了这件事
watchEffect(() => {
  paragraph.textContent = `Count: ${count.value}`
})
```

所以你自己通常不需要显式写 effect，模板插值已经帮你处理好了。

----

**不要在 effect 里写 signal**

在 `watch` 或 `watchEffect` 内部修改 `ref` 的值是危险的，因为写入会触发 effect 重新执行，重新执行又触发写入，形成死循环。signal 的写入应该来自外部世界，比如用户输入、网络响应或定时器。如果你发现自己在 effect 里用一个 signal 推导另一个 signal，那几乎一定应该改用 `computed()`

```js
const state = ref({
  todos: ["Create slides", "Release HW"],
  total: 0
})

// 危险写法，可能死循环
watchEffect(() => {
  state.value.total = state.value.todos.length
})

// 正确写法，派生状态用 computed
const total = computed(() => state.value.todos.length)
```

----

对象与数组

对象和数组可以直接放进 `ref()` 里，适合做响应式字典、查找表和列表：

```js
const scores = ref({
  ada: 10,
  grace: 12
})

const todos = ref([
  { id: 1, text: 'Sketch', done: false },
  { id: 2, text: 'Prototype', done: true }
])

scores.value.ada++
todos.value.push({ id: 3, text: 'Ship', done: false })
```

用 `v-for` 渲染数组时，要给每个元素加稳定的 `:key`，帮助 Vue 高效对比差异并保持每个渲染项的身份：

```html
<li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
```

`:key` 的值应该是每个元素唯一且稳定的标识，比如数据库 id，不要用数组下标，因为下标会随增删操作变化，导致 Vue 错误复用 DOM 节点。

----

模板自动解包

在模板里使用 `ref` 和 `computed` 时，Vue 自动解包，不需要写 `.value`。在 JavaScript 代码里则必须通过 `.value` 访问，这是初学者最容易踩的坑：

```js
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 模板里，直接用，不加 .value
// {{ count + 1 }}
// {{ doubled }}

// JavaScript 里，必须加 .value
count.value++
```

## Signal 如何工作

理解 signal 最好的方式是从零开始，一步步搭建一个最小可用的响应式系统，看看每一步解决了什么问题、又引入了什么新问题。

Model 0：最基础的 ref

最简单的 `ref` 只做两件事：存一个值，以及在值变化时通知所有订阅者。

```js
function ref(initial) {
  let value = initial
  let subs = new Set()

  return {
    subscribe(reaction) {
      subs.add(reaction)
    },
    get value() {
      return value
    },
    set value(newValue) {
      if (newValue === value) return
      value = newValue
      for (let sub of subs) sub()
    }
  }
}
```

用起来是这样的：

```js
const count = ref(0)
count.subscribe(() => console.log(count.value))
count.value++ // 输出 1
```

这个模型的问题是：一个订阅者只能依赖一个 signal。如果你的 effect 需要同时依赖 `first` 和 `last` 两个值，没有办法表达.

Model 1：显式依赖列表

引入一个 `watch` 函数，接受一个依赖列表，把 effect 订阅到所有依赖上：

```js
function watch(deps, fn) {
  for (let dep of deps) {
    dep.subscribe(fn)
  }
}
```

```js
const first = ref("jo")
const last = ref("po")

watch([first, last], () => {
  console.log(first.value + last.value)
})

first.value = "th" // 输出 "thpo"
last.value = "eia" // 输出 "theia"
```

能用了，但有新问题：你必须手动写出依赖列表，而且必须写得准确。如果 effect 里有条件分支，实际用到的 signal 可能每次都不一样，手动维护依赖列表很容易出错。理想情况是根本不需要写依赖列表。

Model 2：自动追踪依赖

核心思路是：当一个 effect 正在执行时，如果它读取了某个 signal 的值，这个 signal 就应该自动把这个 effect 加入自己的订阅者列表。

做法是维护一个全局变量 `currEffect`，记录当前正在执行的 effect。`ref` 的 getter 里检查这个变量，如果有值就自动订阅：

```js
let currEffect

function ref(initial) {
  let value = initial
  let subs = new Set()

  return {
    subscribe(reaction) { subs.add(reaction) },
    get value() {
      if (currEffect) subs.add(currEffect) // 自动订阅
      return value
    },
    set value(newValue) {
      if (newValue === value) return
      value = newValue
      for (let sub of subs) sub()
    }
  }
}
```

`watchEffect` 在执行 `fn` 之前把自己设为 `currEffect`，执行完再恢复，这样 `fn` 里读取的任何 signal 都会自动完成订阅：

```js
function watchEffect(fn) {
  const execute = () => {
    const prevEffect = currEffect
    currEffect = fn
    try {
      fn()
    } finally {
      currEffect = prevEffect
    }
  }
  execute() // 必须立即执行一次，否则什么都没订阅
}
```

注意 `execute()` 必须立即调用一次，这一次执行的目的不是为了产生结果，而是为了触发所有 signal 的 getter，完成自动订阅。

```js
const first = ref("jo")
const last = ref("po")

watchEffect(() => {
  console.log(first.value + last.value)
})

first.value = "th" // 输出 "thpo"
last.value = "eia" // 输出 "theia"
```

Model 3：用 ref 和 watchEffect 实现 computed

有了自动追踪之后，`computed` 其实非常简单——创建一个内部 `ref` 存缓存值，用 `watchEffect` 在依赖变化时更新它。因为 `watchEffect` 会自动追踪 `fn` 里读到的所有 signal，所以 `computed` 天然依赖正确：

js

```js
function computed(fn) {
  const cachedValue = ref()
  watchEffect(() => cachedValue.value = fn())
  return cachedValue
}
```

js

```js
const first = ref("jo")
const last = ref("po")

const full = computed(() => first.value + last.value)

watchEffect(() => console.log(full.value))

first.value = "th" // 输出 "thpo"
last.value = "eia" // 输出 "theia"
```

整个系统的完整实现就是上面四个函数：`ref`、`watch`、`watchEffect`、`computed`，加在一起不超过 40 行代码。

---

这个模型还缺什么?

这个最小实现离生产可用还有三个主要差距。动态依赖方面，如果 effect 里有 `if` 分支，每次执行实际读到的 signal 可能不同，但当前实现只在第一次执行时订阅，后续依赖变了也不会更新订阅列表。懒执行方面，当前的 `computed` 只要依赖变化就立刻重新计算，即使没有任何 effect 在用这个值，这是浪费。生产级实现只在有 effect 需要时才重新计算。glitch-freedom 方面，当 `first` 和 `last` 先后变化时，中间会出现 `"thpo"` 这种只有部分更新完成的状态，真实框架会把同一轮的所有变化批量处理，确保 effect 只在所有依赖都更新完之后才执行一次。

::: insight
Promise 主要描述“一个结果何时完成”，signal 主要描述“一个值变化后哪些派生关系需要更新”。两者都处理时间，但一个强调一次性控制流，另一个强调持续的数据依赖，不能简单互相替代。
:::
