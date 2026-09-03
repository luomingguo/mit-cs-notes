---
title: 消息传递和网络 · 软件构造基础
type: lecture
lecture: 18
tags: ['typescript', 'concurrent']
status: complete
---

# Lec 18 消息传递 & 网络

网络通信本质上是并发的，因此在构建客户端和服务器时，我们需要能够推理他们的并发行为，并以线程安全的方式实现它们。同时我们必须设计C/S之间的通信协议，就像我们设计ADT时，为客户端定义与之交互的操作一样。

本节的目标是：

- 学会使用消息传递（message passing） 而不是共享内存的方式实现TypeScript Worker之间的通信
- 理解C/S通信如何通过网络进行消息传递的

## 并发的两种模型

在共享内存模型中，并发模块通过**读取和写入共享的可变对象**来进行交互。在单个进程内创建多个线程是共享内存并发的典型例子。由于TypeScript没有创建线程的API，我们再代码实例中使用文件系统作为共享的可变状态

在消息传递模型中，并发模块通过通信通道发送不可变消息进行交互。这个通信通道可以连接不同计算机之间的进程，比如我们之前看到的例子：网页浏览、即时通信等。与共享内存相比，消息传递模型最大的优势在于更高的安全性。

本节将讨论的两种消息传递场景

1. 在同一个进程中运行的 TypeScript worker 之间 的消息传递
2. 在不同计算机上运行的 进程之间通过网络通信 的消息传递

对于 TypeScript worker 之间 的消息传递，我们将使用一个通道抽象（channel abstraction）来发送与接收消息，并通过回调函数来处理接收到的消息。

对于 网络通信，我们将使用 HTTP 客户端与服务器 进行消息传递。

## Workers之间的消息传递

我们先来看 TypeScript worker 之间的消息传递。我们主要关注 Node.js 的 `Worker` 接口（位于 `worker_threads` 模块中）。浏览器中的版本叫做 Web Workers，它在细节上略有不同，但消息传递的基本机制是相同的。

当创建一个 worker 时，它会自动附带一个双向通信通道（two-way communication channel）。通道的两端被称为消息端口（message ports）。

主线程（创建 worker 的一方）可以通过 `Worker` 对象的 `postMessage` 方法发送消息：

```ts
import { Worker } from 'worker_threads';

const worker = new Worker('./hello.js');
worker.postMessage('hello!'); // 向 worker 发送一条消息
```

而 worker 一侧可以通过 `worker_threads` 模块提供的全局对象 `parentPort` 访问另一端：

```ts
// hello.ts
import { parentPort } from 'worker_threads';

parentPort.postMessage('bonjour!'); // 向主线程发送消息
```

这些示例仅演示了发送字符串消息，目前两边都还没有真正接收消息。接下来我们看看如何接收消息。

### 消息类型

消息端口通常可以传输多种类型的数据，包括数组、Map、Set 以及记录类型（record types）。但有一个重要限制：**不能传输用户自定义类的实例**，因为类的方法代码不会被复制到另一端。

一个常见的做法是使用记录类型表示消息。例如，下面的记录类型用于表示从冰箱中取出或放入饮料后的结果：

```ts
type FridgeResult = {
  drinksTakenOrAdded: number,
  drinksLeftInFridge: number
};
```

当通道上可能会传输不同种类的消息时，可以使用判别**联合类型（discriminated union）**将它们统一起来：

```ts
type DepositRequest  = { name: 'deposit', amount: number };
type WithdrawRequest = { name: 'withdrawal', amount: number };
type BalanceRequest  = { name: 'balance' };
type BankRequest = DepositRequest | WithdrawRequest | BalanceRequest;
```

这里的 `name` 字段是一个文字类型，用于区分三种不同的请求类型，而各类型的其他字段会根据需要包含不同的信息。

### 接受消息

要接收来自消息端口的消息，我们需要提供一个事件监听器，即：每当有新消息到达时就调用的函数。例如，worker 可以这样监听来自主线程的消息：

```ts
import { parentPort } from 'worker_threads';

parentPort.on('message', (greeting: string) => {
  console.log('received a message', greeting);
});
```

当主线程调用 `worker.postMessage('hello!')` 时，worker 就会接收到这条消息，并触发上面的匿名函数，其中参数 `greeting` 的值为 `"hello!"`。

### 消息传递示例

下面是一个使用消息传递机制实现的“冰箱（refrigerator）”模块。

**drinksfridge.ts**

```ts
/**
 * 可变类型，表示一个存放饮料的冰箱。
 */
class DrinksFridge {

    private drinksInFridge: number = 0;

    // 抽象函数(AF)：
    //   AF(drinksInFridge, port) = 一个包含 drinksInFridge 个饮料的冰	箱，接收来自 port 的请求并通过 port 回复消息
    // 表示不变式：
    //   drinksInFridge >= 0

    /**
     * 构造一个 DrinksFridge 实例，监听请求并生成回复。
     *
     * @param port 用于接收请求与发送回复的通信端口
     */
    public constructor(
        private readonly port: MessagePort
    ) {
        this.checkRep();
    }

    ...
}
```

冰箱有一个 `start` 方法，用于开始监听传入的消息，并将它们转发到处理函数中：

```ts
/** 开始处理饮料请求。 */
public start(): void {
    this.port.on('message', (n: number) => {
        const reply: FridgeResult = this.handleDrinkRequest(n);
        this.port.postMessage(reply);
    });
}
```

传入的消息是一个整数，表示取出或放入的饮料数量：若整数为正数，则表示取出相应数量的饮料；若整数为负数，则表示放入相应数量的饮料。

```ts
/**
 * @param n 请求从冰箱取出的饮料数（若 >0），或放入冰箱的饮料数（若 <0）
 */
private handleDrinkRequest(n: number): FridgeResult {
    const change = Math.min(n, this.drinksInFridge);
    this.drinksInFridge -= change;
    this.checkRep();
    return { drinksTakenOrAdded: change, drinksLeftInFridge: this.drinksInFridge };
}
```

返回的消息是一个 `FridgeResult` 记录类型的实例：

```ts
/** DrinksFridge 回复消息的记录类型。 */
type FridgeResult = {
    drinksTakenOrAdded: number, // 从冰箱取出的饮料数量（若 >0）或放入的数量（若 <0）
    drinksLeftInFridge: number
};
```

在 `loadfridge.ts` 中有一些用于加载并使用这个冰箱的示例代码。



## 停止机制

如果我们想要关闭 `DrinksFridge` 使其不再等待新输入，该怎么做？一种策略是使用毒丸：一种特殊的消息，用于通知接收方结束工作。

由于冰箱的输入消息仅为整数，要关闭它，我们不得不选择一个有特殊含义的"毒丸"整数（或许永远不会有人要求 0 杯饮料……？这是个坏主意，不要使用魔术数字）或者使用 `null`（同样是个坏主意，避免使用 `null`）。取而代之的是，我们可以将输入消息的类型改为可辨识联合：

```ts
type FridgeRequest = DrinkRequest | StopRequest;
type DrinkRequest = { name: 'drink', drinksRequested: number };
type StopRequest =  { name: 'stop' };
```

当我们需要停止冰箱时，我们发送一个 `StopRequest`，即 `fridge.postMessage({ name:'stop' })`。 当 `DrinksFridge` 收到此停止消息时，它需要停止监听传入的消息。这就要求我们跟踪记录监听器的回调函数，以便后续可以移除它。

## 竞态条件

在之前的阅读材料中，我们在银行账户示例中看到，消息传递并不能消除竞态条件的可能性。并发的消息传递进程仍然可能以不良的方式交错执行它们的操作。

当客户端必须向模块发送多条消息才能完成其所需操作时，这种情况尤其会发生，因为这些消息（以及客户端对其响应的处理）可能会与其他客户端发送的消息交错执行。`DrinksFridge` 的消息协议经过精心设计以管理部分此类交错，但在某些情况下仍然可能出现竞态条件。

## 客户端/服务器设计模式

现在让我们将注意力转向另一种重要的消息传递：用于网络通信的客户端/服务器设计模式。

在此模式中，有两种进程：客户端和服务器。客户端通过连接到服务器来发起通信。客户端向服务器发送请求，服务器则发送回复回来。最后，客户端断开连接。一个服务器可能同时处理来自多个客户端的连接，客户端也可能连接到多个服务器。

许多互联网应用都以这种方式工作：Web 浏览器是 Web 服务器的客户端；像 Outlook 这样的电子邮件程序是邮件服务器的客户端，等等。

在互联网上，客户端和服务器进程通常运行在不同的机器上，仅通过网络连接，但也并非必须如此——服务器可以是与客户端运行在同一台机器上的进程。

## Web API

当 Web 客户端与 Web 服务器建立网络连接时，双方通过网络交换字节序列。不像内存中那样可以直接传递对象，这里需要一种通信协议来组织数据。

HTTP就是整个Web语言，`curl` 是命令行下的 HTTP 客户端，大多数系统自带。
 例如访问 CERN 的第一个网站：

```sh
$ curl -L http://info.cern.ch/
<html><head></head><body>...</body></html>
```

服务器返回 HTML，用于人类浏览。

Web API 返回的通常是结构化数据（机器可读），比如美国气象局的天气数据

```sh
$ curl -L https://api.weather.gov/gridpoints/BOX/69,75/forecast
{
  "properties": {
    ...
    "periods": [
      {
        "name": "Tonight",
        "temperature": 33,
        "shortForecast": "Clear",
        "detailedForecast": "Clear, with a low around 33."
      },
      ...
    ]
  }
}
```

这些是 JSON（JavaScript 对象表示法） 格式。 JSON 是一种受限的 JavaScript 语法，可以表示字符串、数字、数组和对象，是 Web 上传输结构化数据的标准。现代浏览器能直接以易读方式显示 JSON，例如你可以直接访问：
 https://api.weather.gov/gridpoints/BOX/69,75/forecast

### 路由

Web 服务器通常会将站点内容划分为不同的“路由”，例如：

- `/education` → http://web.mit.edu/education
- `/research`
- `/campus-life`

在 Web API 中，路由通常对应一个“函数”或“操作名”，例如美国国家气象局的 API：

- `https://api.weather.gov/points/...` → 获取经纬度信息
- `https://api.weather.gov/gridpoints/...` → 获取某区域预报
- `https://api.weather.gov/alerts/active...` → 获取天气警报信息

### 参数

要把调用 Web API 看作调用函数，我们必须理解如何传递参数以及如何获取结果。 传参有三种方式：

1. 路径参数：URL 的路径由用 `/` 分隔的部分组成。除了指定函数名，路径中的其余部分也可以作为参数。
   - `https://api.weather.gov/gridpoints/BOX/69,75/forecast`
      其中包含三个路径参数：预报中心标识 `BOX`、网格位置 `69,75`、请求类型 `forecast`。
2. 查询参数：URL 的路径后面可以有一个查询部分，以 `?` 开头，由 `name=value` 对组成，用 `&` 分隔。例如
   - `https://www.google.com/search?q=MIT`
      这里有一个查询参数：`q=MIT`
   - ``https://api.weather.gov/alerts/active?area=MA&severity=Minor`
      这里有两个查询参数：`area=MA` 和 `severity=Minor`。
3. 请求体参数，较少使用。格式可能是：
   - 纯文本（plain text）
   - 二进制数据（binary blob，例如文件）
   - 表单数据（form data），与查询参数类似的键值对集合
   - JSON



HTTP 请求主要有两种常见类型：

- GET
- POST
- PUT
- DELETE
- PATCH

### 结果

客户端发出 HTTP 请求后，服务器通常会返回一个 **HTTP 响应**，包含两类信息：

#### 状态码

每个响应都有三位数字的状态码，表示是否成功。常见的包括：

- `200 OK` —— 请求成功
- `404 Not Found` —— 请求的页面或接口不存在
- `400 Bad Request` —— 请求参数错误
- `500 Internal Server Error` —— 服务器出错

一些不常见但有趣的状态码：

- `412 Precondition Failed` —— 请求的前提条件未满足
- `418 I’m a teapot` —— 拒绝煮咖啡，因为它是一只茶壶（愚人节彩蛋）

#### 响应体

响应也可以携带一个 body，类型多样，例如：

- HTML（用于网页浏览）
- 纯文本（plain text）
- JSON（结构化数据）

简单结果适合用文本表示（例如两个用逗号分隔的数字）。复杂结果则通常用 JSON，正如我们在天气 API 示例中看到的那样。



### 指定 Web API

仅仅定义参数和返回值的格式还不够，它们相当于 ADT 的“方法签名”。 我们还需要补充完整规范：

- 前置条件：参数必须满足什么条件？例如一个字符串参数必须是合法的数字 ID 吗？
- 后置条件：请求会触发什么服务器操作？哪些数据会被修改？服务器会返回什么结果？



## 用TypeScript编写Web服务器

接下来，我们看看如何用 TypeScript 编写一个简单的 Web 服务器。我们将构建一个示例服务器，它echo客户端发来的消息。

### 路由处理

Web 服务器的控制流基本是一个循环：等待请求 → 解析请求 → 根据路径分派给对应的路由处理函数 → 生成响应。路由前缀匹配机制允许将 `http://web.mit.edu/community/topic/arts.html` 匹配到 `/community` 路由（若没有更具体匹配）。

Express 是 Node.js 最常用的路由框架。 创建一个 Express 应用：

```ts
import express, {Request, Response} from 'express';
const app = express();
```

`express()` 是一个工厂函数，返回一个 Application 对象。

```ts
const PORT = 8000;
app.listen(PORT);
```

添加路由处理函数：

```ts
app.get('/echo', (request: Request, response: Response) => {
  ...
});
```

这里的 `get` 对应 HTTP 的 GET 方法。当浏览器访问 `/echo` 路由时，会调用我们注册的回调函数。`request` 对象提供请求信息（观察者方法）， `response` 对象用于生成响应（修改者方法）。

获取查询参数：

```ts
const greeting = request.query('greeting');
```

返回响应

```ts
// 链式调用（method chaining）使代码更简洁
response
  .status(StatusCodes.OK)
  .type('text')
  .send(`${greeting} to you too!`);

// 完整实例
app.get('/echo', (request: Request, response: Response) => {
  const greeting = request.query['greeting'];
  response
    .status(StatusCodes.OK)
    .type('text')
    .send(`${greeting} to you too!`);
});
```

这是一个监听器回调函数：当匹配到请求时，Express 调用我们提供的函数。





### 查询参数 vs 路由参数

如前所述，向Web API传递参数有多种方式。在我们目前的示例中，`greeting` 作为查询参数传递：

```ts
app.get('/echo', (request: Request, response: Response) => {
  const greeting = request.query['greeting'];
  ...
      .send(`${greeting} to you too!`);
})
```

当服务器收到客户端请求 `http://localhost:8000/echo/Ben?greeting=Gday` 时，将返回响应：

```
Gday to you too!
```

现在让我们扩展示例，引入**路径参数**（也称为路由参数）。实现方式是在路由的相应位置添加以冒号开头的参数名：

```ts
app.get('/echo/:person', (request: Request, response: Response) => {
  const person   = request.params['person'];   // <-- 注意！路由参数位于 request.params 中
  const greeting = request.query['greeting'];  // <--     而查询参数位于 request.query 中
  ...
      .send(`${greeting} to you too, ${person}!`);
})
```

当服务器收到客户端请求 `http://localhost:8000/echo/Ben?greeting=hi` 时，"Ben"将被绑定到路由参数 `person`，而 "hi" 则被绑定到查询参数 `greeting`，最终返回响应：

```
hi to you too, Ben!
```

一个Web API可以包含任意数量的查询参数或路由参数。**路由参数**必须在路径中按特定顺序排列（类似于Python和TypeScript中的函数参数），而**查询参数**可以按任意顺序提供，但必须包含参数名（类似于Python中的Key参数）。

（In a word, 路径参数必须按顺序出现；查询参数顺序不限，但必须显式写出参数名。）

### 客户端

在前面阅读中，客户端 意为使用某个类的代码。 在网络通信中，client 指发出请求的一方。在 Express 中要区分两种含义：

1. Web 服务器的客户端 → 浏览器（通过网络发请求），例如：`GET /echo?greeting=hello`
2. Express 应用对象的客户端 → 我们编写的代码，例如：调用 `app.get()` 注册回调函数

### 错误处理

Express 中最简单的错误处理方式是：在回调函数中抛出异常（`throw new Error()`），浏览器会显示错误栈：

```ts
// 访问 http://localhost:8000/bad
app.get('/bad', (request: Request, response: Response) => {
  throw new Error('always fails');
});
```

显示：

```ts
Error: always fails
    at ./server.ts:30:11
    at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
    at next (./node_modules/express/lib/router/route.js:137:13)
    at Route.dispatch (./node_modules/express/lib/router/route.js:112:3)
    at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
    at ./node_modules/express/lib/router/index.js:281:22
    at Function.process_params (./node_modules/express/lib/router/index.js:335:12)
    at next (./node_modules/express/lib/router/index.js:275:10)
    at expressInit (./node_modules/express/lib/middleware/init.js:40:5)
    at Layer.handle [as handle_request] (./node_modules/express/lib/router/layer.js:95:5)
```

生产环境不应直接暴露栈信息，但开发时非常有用。

### 在回调中使用 await

Web 服务器通常需要执行异步操作，例如：

- 读取文件
- 查询数据库
- 写入数据

若回调中需要 `await` 异步函数，则必须用 `async` 声明：

```ts
app.get('/lookup', async (request: Request, response: Response) => {
  const data = await database.lookup(query);
  ...
});
```

这样即可在路由处理函数中安全地等待异步结果。

### 客户端

## TL;DR

消息传递系统通过共享通信信道（如数据流或队列）来规避因共享可变数据同步操作而引发的程序错误。与我们在"互斥"阅读材料中提及的并发安全访问的可变抽象数据类型不同，并发模块（线程、进程、独立机器）仅相互传递（不可变的）消息，而数据更改被严格限制在各个模块内部。

在客户端/服务器设计模式中，并发是固有特性：多个客户端与多个服务器通过网络连接同时收发消息，并期望获得及时响应。若某个服务器因处理一个响应缓慢的客户端而阻塞，导致其他等待连接或接收回复的客户端无法得到服务，这样的设计显然无法满足多客户端需求。

在设计网络客户端与服务器时，我们需要全面应对确保并发代码安全性、提升可理解性及保持可维护性的所有挑战。这些进程（通常运行于不同机器）彼此并发执行，任何需要同时与多客户端通信的服务器（或需要与多服务器交互的客户端），都必须有效管理这种并发性。
