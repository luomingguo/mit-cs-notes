---
title: Promises 语法
type: lecture
lecture: 15
tags: [promise, async-await, concurrency, error-handling]
status: complete
source: 'https://web.mit.edu/6.102/www/sp24/classes/15-promises/'
---
# Lec 15 Promises 语法

## TL;DR

- Promise 表示一个已经开始但尚未必完成的计算，其状态只会从 pending 转为 fulfilled 或 rejected，完成后不可重置。
- `async` 函数总是返回 Promise，`await` 暂停当前异步函数并把控制权交还运行时，因此代码外观顺序化但执行仍可能交错。
- `Promise.all()`、`Promise.any()` 和 `Promise.race()` 分别表达全部成功、任一成功和最先结束等聚合策略，失败语义各不相同。
- Promise 避免忙等待并改善组合性，但错误必须通过拒绝与异常传播显式处理，不能假设异步操作一定及时完成。

## Promise 与异步计算

本节讨论使用`Promise`进行并发计算。我们从最高层次的抽象开始，介绍 Promise 的抽象，以及`await`操作符和`async`函数声明，这些特性使得 TypeScript 能够非常类似同步编程的方式实现。随后我们将更深入底层。进一步理解 `Promise`、`await` 和 `async` 的运行机制。

## 1. promises

Promise 代表一个已启动但尚未完成结果的并发计算。其名称来源于“承诺”这一概念，即它保证在未来某个时刻完成计算并返回结果。TypeScript 中的 `Promise` 是泛型（generic）：`Promise<T>` 表示一个并发计算，最终会生成一个类型为 `T` 的值。

下面是用 promises 实现并发计算的一些例子：

- `readFile(pathname: string, ...)`返回 `Promise<string>`： 文件被并发加载，最终 Promise 返回文件内容。
- `diskSpace(folder: string)`返回 `Promise<number>`：在后台遍历文件系统目录树，计算所有文件的总大小，最终 Promise 返回字节数。
- `fetch(url: string)` 返回 `Promise<Reponse>`，在后台打开 URL，最终 Promise 返回 HTTP 响应对象。
- `timeout(milliseconds: number)`返回`Promise<void>`：启动一个定时器，在指定毫秒数后完成，最终 Promise 返回`void`（类似于无返回值的函数）。虽然看似空 Promise，但也很有用，可以在`timoeout`完成后触发计算。

关键点在于，这些函数**几乎立即（ almost immediately）**返回 Promise。函数启动了一个长时间运行的计算（如加载网页或扫描文件系统），但不会等待计算完成，而是返回一个与该并发计算关联的 Promise。当计算完成时，其结果将通过 Promise 提供。

Promise 的一个优势是支持并发： 通过启动多个计算并收集各自的 Promise，这些计算可以并行执行

```ts
const promise1 = fetch('http://www.mit.edu/');
const promise2 = fetch('http://www.harvard.edu/');
const promise3 = fetch('http://www.tufts.edu/');
// 此时已尝试并发访问三个网站服务器
```

具体来说，`Promise<T>`是一个可变值，具有三种状态：

1. Pending（待定）： 关联的计算尚未完成。
2. fulfilled（已兑现）： 计算已完成，Promise 现在持有 T 类型的结果值
3. rejected（已拒绝）： 计算因某些原因失败，Promise 现在持有描述错误的 Error 对象

Promise 初始状态为 Pending，随后会转换为 fulfilled 或者 rejected，但它可能永远保持 pending。一旦进入了 fulfilled 或者 rejected，就不会再改变状态（无法重置为 pending）。

如果打印 Promise 以调试，可以看到其状态和存储的结果（若非 `pending` 状态）。例如，在 `npx ts-node` 的 TypeScript 交互环境中，可以立即打印一个 Promise 查看其 `pending` 状态：

```tsx
> const promise = fs.promises.readFile('account', { encoding: 'utf-8' });
> console.log(promise);
Promise { <pending> }
> console.log(promise);
Promise { '200' }
```

如果文件 `account` 不存在，则会看到 Promise 被 `rejected`。通常用于描述错误的异常对象会被存储在 Promise 中：

```tsx
> console.log(promise);
Promise {
  <rejected> [Error: ENOENT: no such file or directory, open 'account'] { ... 	}
}
```

## 2. await

我们已经了解了如何启动并发计算并获取与之关联的 `Promise` 对象。那么如何获取这些计算最终生成的值呢？一种简单的方法是使用 `await` 关键字：

```ts
const promise: Promise<string> = fs.promises.readFile('account', { encoding: 'utf-8' });
const data: string = await promise;
// 现在 data 的值是 '200'
```

`await` 是 TypeScript 内置的操作符，用于将 `Promise<T>` 类型的值转换为 `T` 类型的值。它会等待 Promise 进入 `fulfilled` 状态，然后解包 Promise 以获取最终的计算结果。如果 Promise 被 `rejected`，则 `await` 会抛出异常，并使用 Promise 中存储的 `Error` 对象。

需要注意的是，`await` **并不会触发计算**。计算早已在生成 Promise 的函数调用时启动！在代码执行到 `await` 时，计算可能已经取得进展，甚至可能已经完成。

更准确的理解是，`await` 的作用类似于**处理一个延迟返回的函数调用**。它会等待计算完成，然后提供返回值（如果成功）或抛出异常（如果失败），就像普通函数调用一样。

利用 `await`，我们可以等待之前启动的并发计算完成：

```ts
const promise1: Promise<Response> = fetch('http://www.mit.edu/');
const promise2: Promise<Response> = fetch('http://www.harvard.edu/');
const promise3: Promise<Response> = fetch('http://www.tufts.edu/');
// 此时已并发尝试访问三个网站服务器

const response1: Response = await promise1;
const response2: Response = await promise2;
const response3: Response = await promise3;
// 此时已收到所有三个服务器的初始响应（除非某个请求失败并抛出异常）
```

不过，更高效的方式是使用 Promise.all()，来同时等待多个 Promise。

```tsx
async function getAllData() {
    const results = await Promise.all([promise1, promise2, promise3]);
    console.log(results); // ['数据1', '数据2', '数据3']
}

```

即使是“空”的 Promise（如 `Promise<void>`）也有其用途，就像返回 `void` 的函数一样：

```ts
const promise: Promise<void> = timeout(2000);
// 启动了一个 2000 毫秒的计时器

await promise;
// 虽然没有返回值，但我们可以确认 2000 毫秒已经过去
```

`void` 和 `undefined` 是不同的类型。 `Promise<void>` 适用于那些不产生具体结果、仅用于执行某些操作的异步计算（如定时器）。而 `undefined` 则用于表示“无值”本身是有意义的（例如可选参数或未初始化的变量）。

## 3. async 函数

我们之前使用的返回 Promise 的函数（如 `readFile`、`fetch`、`timeout`）都是异步函数的示例。异步函数的特点是：**在计算完成前就返回控制权给调用者**。

对比同步函数（课程中目前使用的大部分函数）：必须等待计算完成才返回，调用者会阻塞直到获得结果。在现代 TS/JS 中，可通过 `async` 关键字声明异步函数，其返回类型必须为 `Promise<T>`

```ts
async function getBalance(): Promise<number> {
    const data: string = await fs.promises.readFile('account', { encoding: 'utf-8' });
    const balance: number = parseInt(data);
    if (isNaN(balance)) throw new Error('account does not contain a number');
    return balance; // 自动包装为 Promise<number>
}
```

需要注意的是，在异步函数（`async function`）中，`return` 和 `throw` 语句的行为与同步函数类似，但它们会自动转化为对 Promise 状态的影响。`return balance`语句会使得 Promise 变为已完成状态；而`throw new Error(...)`会使得 Promise 变为已拒绝状态，并把错误对象作为拒绝原因。

由于 `getBalance()` 是异步函数（返回 Promise），调用方必须通过适当的方式处理这个 Promise，典型方式是使用 `await`

```ts
const myBalance = await getBalance();  // 等待 Promise 完成并获取结果
```

注意，`await`不能在同步函数内部使用（也就是没有声明为 `async`）。这种限制是通过 TypeScript 的静态类型检查实现的，能有效避免常见的异步调用错误。

> 示例：
>
> Consider this simple program, in which `main` calls `f` which calls `g`:
>
> ```ts
> function main(): void { console.log(f()); }
> function f(): number { return g()+50;  }
> function g(): number { return 0; }
> ```
>
> Now suppose `g()` is changed to use `await`:
>
> ```ts
> function g(): number { return await getBalance(); }
> ```
>
> The edited program is not compiling yet; there are static errors.
>
> Which additional changes need to be made to `g()`、`f()`、`main()`?

Solution：

- for g(), The `await` forces `g()` to become an `async` function, like this:

  ```ts
  async function g(): Promise<number> { return await getBalance(); }
  ```

- for f(), Because `g()` is now an `async` function, `f()` needs to wait for the promise that `g()` returns, which means that `f()` also needs to become an async function

  ```ts
  async function f(): Promise<number> { return (await g()) + 50; }
  ```

- for main()

  ```ts
  async function main(): Promise<void> { console.log(await f()); }
  ```

### 顶层`await`

我们已知 `await` 不能用于同步函数中，必须通过 `async` 声明异步函数才能使用。但如果是**模块最外层的代码**（不在任何函数内）呢？比如我们需要在最外层调用入口函数 `main()`

```ts
async function main(): Promise<void> { ... }
...
main(); // 如何处理这个返回的 Promise？
```

能否直接改为 `await main()`，即使外层没有 `async` 函数包裹？答案取决于代码运行的 JavaScript 环境。在编译为 ES6 模块（ECMAScript 6 标准引入的模块系统）的代码中，允许在顶层使用 `await`，其行为与在 `async` 函数内一致。（我们默认使用这种现代模块系统，因此支持顶层 `await`）。

在旧版脚本（非模块化代码）中，顶层代码是**同步执行**的，不允许直接使用 `await`，`await main()` 会报错。

此时的最佳实践是：

1. 将所有顶层逻辑放入 `async main()` 函数中。
2. 调用时**不等待**其 Promise 完成。

**Node.js 的自动机制**：即使不 `await`，进程也会等待 `main()` 返回的 Promise 完成（无论成功或失败）后才退出，因此不会提前终止。

某些配置下，直接调用 `main()` 会触发编译警告（未处理返回的 Promise）。`void` 运算符显式表明“忽略返回值”，消除警告

```ts
async function main(): Promise<void> { ... }
...
void main(); // 调用main()但不会等待它完成
```

## 4. 并发模型

我们来更深入地了解一下 JavaScript 运行时系统是如何执行异步函数的。运行时系统指的是负责运行 JavaScript 代码、管理 JavaScript 环境等任务的解释器。（在本课程中，我们主要使用 Node 作为运行时系统，但其他运行时也存在，比如 Deno、Bun，或者你正在阅读本文的 Web 浏览器。）

JavaScript 每个全局环境中**只有一个控制线程**。（虽然我们在之前的学习中看到，Worker 可以创建一个新的线程，但每个 Worker 会获得一个全新的全局环境，并且通常通过**消息传递**与主程序或其他 Worker 通信，而不是通过共享内存对象。）

这引出了一个问题：如果在一个 JavaScript 环境中只有一个线程，那么多个异步函数**同时进行**到底意味着什么？当一个异步函数调用后立刻返回了一个 Promise，但它的计算还没有完成，它是**什么时候**以及**如何**重新获得控制权，继续执行后续操作，最终完成（fulfill）或拒绝（reject）这个 Promise 的呢？

我们通过一个示例来看看它是如何运作的：从两个银行账户读取余额并将它们相加

```ts
async function totalBalance(): Promise<number> {
    const checkingPromise = getBalance('checking'); // 启动第一个异步操作
    const savingsPromise = getBalance('savings');   // 立即启动第二个异步操作
    return (await checkingPromise) + (await savingsPromise); // 等待两者完成
}

async function getBalance(account: string): Promise<number> {
    const data = await fs.promises.readFile(account, { encoding: 'utf-8' });
    return parseInt(data);
}
```

假设有个客户端调用了 `totalBalance()`。以下是这段代码背后的执行过程：

1. `totalBalance` 调用了 `getBalance('checking')`，该函数调用了 `readFile`，这会启动文件读取，并立即返回一个 `Promise<string>`，表示文件内容的未来结果。
1. `getBalance('checking')` 遇到一个 `await`，等待文件的 promise。这意味着它必须交出控制权。此时它会构造一个新的 `Promise<number>` 来表示自己的最终结果，并将这个 promise 返回给调用它的 `totalBalance`。
1. `totalBalance` 并不会立即等待这个 promise，而是把它存入 `checkingPromise`，然后继续调用 `getBalance('savings')`。
4. `getBalance('savings')` 也走了相同的流程：遇到 `await`，返回一个表示储蓄账户余额的 promise，`totalBalance` 把它存入 `savingsPromise`
   - 此时，`totalBalance` 实际上已经启动了两个并发的计算：一个用于读取 checking 账户，另一个用于 savings 账户。通过**先保存 promise，稍后再 await**，它允许两个计算独立进行，而不是强制先完成一个再开始另一个。这就是基于 Promise 的并发的本质

5. `totalBalance` 在计算最终结果前，必须等待这两个 promise。TypeScript/JavaScript 的表达式是从左到右求值的（并不是所有语言都这样……），所以 `await checkingPromise` 会先执行。由于此时 `checkingPromise` 还在等待中，`totalBalance` 会构造一个新的 `Promise<number>` 表示自己的最终结果，并把它返回给最初的调用者。
6. 最初的调用者（这里未展示）会继续执行。为了让 JavaScript 的并发模型正常工作，我们依赖调用者最终把控制权交还给 JavaScript 的运行时系统（运行我们代码的最初调用点）。运行时系统会负责一些底层处理，比如文件加载。
7. 假设储蓄（saving）账户的文件先加载完，并返回字符串 `"200"`。JavaScript 运行时系统会将控制权交还给 `getBalance('savings')`，后者一直在等待这个 promise，于是 `await` 表达式得到 `"200"`。`getBalance('savings')` 执行完成，将 `savingsPromise` 兑现为数值 `200`，然后把控制权交还给运行时系统。但 `totalBalance` 此时还没有 `await savingsPromise`，所以暂时不会有进一步动作。
8. 接着支票（checking）账户文件加载完成，返回字符串 `"50"`。运行时系统将控制权交给 `getBalance('checking')`，它会把 `checkingPromise` 兑现为数值 `50`，再交还控制权给运行时系统。
9. 由于 `totalBalance` 此时正在等待 `checkingPromise`，运行时系统把数值 `50` 传给 `totalBalance`。`totalBalance` 随后又 `await savingsPromise`，于是它再次把控制权交给运行时系统。但因为 `savingsPromise` 早已兑现为 `200`，运行时系统很快（可能立刻）就把控制权交回。`totalBalance` 继续执行自己的计算，最终把结果 `250` 作为自身的 promise 的兑现值返回。

这个例子揭示了关于控制流的一些高层次要点：

- 每一个 `await` 都是异步函数交出控制权的地方。
- 在异步函数中的第一个 `await`，所谓“交出控制权”意味着将函数自身的 promise 返回给调用者。之后的 `await` 则是直接把控制权交还给运行时系统。
- 当 `await` 恢复执行时，**控制权是从运行时系统回来的**。
- 一个异步函数实际上被分割成了若干段计算，每一段位于两个 `await` 之间，而这些计算片段可能会和其他异步函数调用的片段交错执行。

这种并发模型被称为 **协作式（cooperative）或非抢占式（non-preemptive）**。只有一条执行线程，并发的计算必须在明确的点（例如 `await` 或 `return`）自愿交出控制权，才能让彼此继续执行。

需要注意的是：即使 `await` 等待的 promise 已经被兑现，它仍然会交出控制权。如果 promise 已经完成，那么它可能会几乎立刻重新获得控制权，但在此之前，它会给其他并发计算一个机会来继续执行。

这是一个很好的时机来观察：**异步函数里的 `await` 和生成器函数里的 `yield` 在行为上有相似之处**。它们都交出控制权（即暂停函数的执行），但一旦条件满足，就准备恢复函数的运行：

- 在异步函数中使用 `await` 时，函数会在等待的 promise 兑现后恢复执行。
- 在生成器函数中使用 `yield` 时，函数会在调用方请求下一个值时恢复执行（例如调用 `next()`，或在 `for` 循环中迭代）。

因此，异步函数和生成器函数都被认为是 **协作式并发** 的例子。

还需要澄清的是：**“一条执行线程”** 的意思是，只有一条线程在运行我们的 TypeScript/JavaScript 代码。但 JavaScript 运行时系统在内部可能会使用其他线程，比如处理网络连接、渲染网页、读写文件系统等等。这些线程可能会使某些 promise 得到兑现（例如 `readFile()` 或 `fetch()` 返回的 promise），但等待这些 promise 的代码，只有在单一的 JavaScript 执行线程准备好时，才会恢复运行。

## 5. 聚合 Promises

在运行多个并发计算时，经常需要用类似逻辑与（AND）和逻辑或（OR）的操作组合它们的 Promise。

`Promise.all()` 类似于逻辑 AND——他把一个可迭代的 Promise 集合组合成单一的的 Promise，这个 Promise 会等待所有的子 Promise 都完成，并返回它们的结果的数组值：

```ts
const allReponses: Array<Response> = await Promise.all([
   fetch('http://www.mit.edu/'),
   fetch('http://www.harvard.edu/'),
   fetch('http://www.tufts.edu/')
]);
```

但如果其中任何一个 Promise 失败，那么整个 `Promise.all()` 也会失败。

对于逻辑 **OR**，**Promise.any()** 会返回一个新的 Promise，它会等待任意一个子 Promise 成功完成，并返回那个 Promise 的结果。只有当所有子 Promise 都失败时，它才会失败。你可以用它来运行一些可能独立失败的冗余计算：

```ts
const firstResponse: Response = 
  await Promise.any( [ fetch('http://www.mit1.edu/'),
                       fetch('http://www.mit2.edu/'),
                       fetch('http://www.mit3.edu/') ] );

```

**Promise.race()** 是另一种逻辑 **OR** ——它会等待任意一个子 Promise 先完成（无论是成功还是失败），并立即以相同的方式完成（即立刻 fulfill 或 reject）。
 `Promise.race()` 的一个用途是给某个操作加上超时：

```ts
const responseOrTimeout: Response|void =
  await Promise.race( [ fetch('http://www.mit.edu/'), 
                        timeout(5000) ] ); 
```

## 6. 永不 Busy-wait

我们已经看到，`Promise` 有一个观察者操作 —— `await`，它让客户端能够获取 Promise 的值（并且总是交出控制权，必要时等待 Promise 完成）。但是，没有方法可以直接查询一个 Promise 的状态（“你还在挂起吗？”），或者在不交出控制权的情况下提取其值。

不提供这些操作是有充分理由的。如果它们存在，Promise 的客户端可能会诱使程序员使用忙等待（busy-waiting）来等待 Promise 完成。忙等待是指在一个紧密的循环中等待某个事件发生，而不交出控制权。例如，下面是一个忙等待的计时器：

```ts
async function busyWait(milliseconds: number): Promise<void> {
    const now = new Date().getTime(); // new Date().getTime() 永远是当前的毫秒时间
    const deadline = now + milliseconds;
    while (new Date().getTime() < deadline) {
        // 什么都不做，只是在忙等待，直到系统时钟时间达到 deadline
    }
}
```

这段代码在狭义上是可行的，调用 `busyWait(500)` 确实会等待 500 毫秒，且它的 Promise 会在这段时间过去后完成。但因为 `busyWait` 在这段时间内从未释放控制权 —— 注意到它的循环体里没有任何 `await` —— 所以程序中的其他异步函数将无法运行。我们永远无法回到 JavaScript 运行时系统，去给其他函数提供执行的机会。程序会在 `busyWait()` 的整个体内执行完毕并返回之前冻结。因此，`busyWait()` 作为一个异步函数几乎没用 —— 它无法与其他异步代码并发执行。

如果一个 Promise 提供了除了 `await` 之外的观察方法，程序员可能会被诱导写出像这样的忙等待代码：

```ts
const promise = readFile('account', { encoding: 'utf-8' });
while ( promise.isPending() ) { // 假设性代码，isPending() 并不存在
  // 忙等待！糟糕的做法
}
const data: string = promise.get() // 假设性代码，get() 并不存在
```

这段代码不仅会冻结程序，而且甚至达不到程序员的预期效果。因为忙等待循环从未交出控制权，这意味着我们永远无法返回到处理文件输入输出的顶层运行时系统。所以 `readFile()` 永远不会标记它的 Promise 为完成，假设的 `promise.isPending()` 方法永远不会返回 `true`，我们也永远无法退出忙等待循环。

忙等待通常在并发编程中是个糟糕的做法（除了一些极少数的例外，如自旋锁），但对于 Promise 和 `async/await` 代码，它特别危险。正确的做法是，使用 `await` 来操作 Promise 的值，或者响应它从挂起到完成的状态转变。

## 7. 错误处理

大部分阅读内容都集中在了正常情况：一个异步函数返回一个值，这个值存储在（并使其关联的）Promise 中，然后 `await` 表达式等待该 Promise，最终产生返回值。

但是，理解异步编程中错误的处理方式也是很重要的：

- 当一个异步函数抛出异常时，Promise 会变为 **拒绝（rejected）**，异常对象会存储在关联的 Promise 中。
- 一个等待该 Promise 的 `await` 表达式现在能够继续执行，但它不会提供值，而是继续抛出异常。

你可以将 `await` 看作提供异步函数的结果，无论这个结果是一个返回值还是一个抛出的异常。

举个例子，调用同步函数时，调用和结果发生在同一行，包括任何异常处理：

```ts
try {
  // fs.readFileSync() 是同步的：它被调用，执行完毕后要么返回文件内容，要么抛出异常
  fileContents = fs.readFileSync('account', { encoding: 'utf-8' });
} catch (e) {
  // 捕获 fs.readFileSync() 抛出的异常
  console.error("can't read account file");
}
```

而调用异步函数时，调用和结果是分开的，这也意味着异常处理会被推迟：

```ts
// fs.promises.readFile() 是异步的；它返回一个 promise，但 *不会* 在这里抛出异常
promise = fs.promises.readFile('account', { encoding: 'utf-8' });
...
// 程序的其他部分会等待这个 promise，并在必要时处理异常
try {
  fileContents = await promise;
} catch (e) {
  // 捕获 fs.promises.readFile() 抛出的异常
  console.error("can't read account file");
}
```

当你编写一个异步函数时（与调用异步函数不同），正确的拒绝 Promise 的方法是直接抛出异常。例如：

```ts
async function getBalance(account: string): Promise<number> {
    const data: string = await fs.promises.readFile(account, { encoding: 'utf-8' });
    const balance: number = parseInt(data);
    if (Number.isNaN(balance)) {
      throw new Error('account balance is not an integer'); // 抛出异常会拒绝 Promise
    }
    return balance;
}
```

你不需要使用 `Promise.reject()` 来创建一个拒绝的 Promise。只需要像使用 `return` 来使 Promise 完成一样，直接使用 `throw` 和异常对象来拒绝 Promise。

## Promise 如何支撑软件质量

这篇阅读内容讨论了异步函数返回的 Promise。

- Promise 是一种并发计算，它已经开始执行，但可能仍未完成，结果可能还没有准备好。
- Promise 使我们能够编写不进行忙等待的并发代码。
- `await` 等待并访问 Promise 计算的值。
- `Promise.all()`、`Promise.any()`、`Promise.race()` 是将多个 Promise 聚合在一起的方式。
- 返回 Promise 的函数是异步函数。
- 这些函数将控制权交还给它们的调用者或 JavaScript 运行时系统。
- 一个普通的函数可以通过使用 `async` 和 `await` 关键字并返回一个 Promise 类型来转换为异步函数。

这些概念与我们良好软件的三个关键特性相联系，如下所示：

1. **避免错误**。通过静态检查 Promise 类型，以及要求通过 `await` 将 Promise 转换为值，确保依赖异步计算的代码不能在所需值未准备好之前继续执行。
2. **易于理解**。使用 `await` 将 Promise 转换为值使得异步代码看起来非常像直线型的同步代码。但像所有并发编程一样，Promise 和异步函数可能是微妙的，并可能产生意外的效果。
3. **适应变化**。Promise 可以以其他并发技术（如线程和工作者）难以支持的方式进行组合和组合。

::: insight
`await` 只让异步代码看起来像顺序代码，并没有消除并发边界。每个 `await` 都可能让其他任务运行，因此在它前后跨越的可变状态、超时、取消和重复执行都应被视为接口设计问题，而不是实现细节。
:::
