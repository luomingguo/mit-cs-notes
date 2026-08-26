---
title: WebAPI
course: 6.4500 Web设计：语言和用户接口
course_id: '6.4500'
lecture: 20
kind: design
tags: []
status: complete
---
# Lec 20 WebAPI

## HTTP

1990 年代，通过 HTTP 与 Web 服务器进行交互。与最初 Tim Berners Leed 定义的方法类似，提供了 6 个主要方法：

- OPTIONS： 告诉我你的信息
- GET
- POST： 上传新资源
- PUT： 替换已存在资源
- PATCH： 修改资源
- DELETE

### 请求参数

请求包含：

- URL
- BODY： PUT、POST、PATCH 的内容
- 头部：
  - Referer： 该请求的页面
  - Accept： 接受的资源类型（text,pdf, json 等等）
  - Cookie

响应包含：

- 状态码
- Body
- 头部：
  - Content-Type
  - Set-Cookie
  - Location：  **告诉客户端去其他地方获取资源**

### 幂等与安全方法

这是对 HTTP 方法副作用的两种重要描述：

- 安全： 没有副作用
  - 例如 GET，只是获取资源，不改变服务器状态
  - OPTIONS 也是安全的
- 幂等：每次调用产生相同的副作用，重复执行不会改变结果
  - PUT，重复执行仍然是替换为相同内容
  - DELETE，删除一次后再删仍然“无变化”，因为资源已经不存在
- 既非安全也非幂等：每次调用都会产生不同的副作用
  - POST，每次都会创建一个不同的新资源
  - PATCH，每次应用修改（如累加操作），可能累积效果

### HTML 请求例子

```html
get请求
<a href="http://.../echo?myname=David..."></a>
post请求
<form method="post" action="http://.../echo?rulArg=newUser">
  Input: <input name="textbox" type="text">
</form>

```

## AJAX

在 90 年代 Web 应用主要运行在服务器端，用户执行操作时，需要提交表单，为了看到更新，需要不断刷新页面，浏览器仅仅负责显示结果和接受用户输入。

一个洞察：许多操作只改变界面的一小部分，许多操作只改变界面的一小部分，为什么还要每次都让服务器参与？

首先 AJAX 是异步的，使用 Promise 机制，JS 在客户端进行计算，以及 XML 作为数据序列化格式（现在已经被 json 替代）

![image-20251017181015263](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017181015263.png)

**WebAPI**

最初，网站是为人类访问而设计的。现在，代码也可能希望与网站交互，一个想法：让代码获取网页并操作它？

问题：

- 网页大多是为人类展示而布局的
- 人类根据背景知识可以理解其中含义
- 人类能理解不规范的文本
- HTML 中充满了无关的展示信息
- 计算机希望获得可机器读取的内容
- 让代码通过发送鼠标点击来触发操作，非常笨拙

**封装（Encapsulation）**

1. 应用 API 调用被封装在 HTTP API 调用中
2. 你的代码将应用 API 调用转换为可通过 HTTP 发送的数据
3. 将你的 JSON 对象“打印”成字符串，以便通过 HTTP 传输
   1. 浏览器将 HTTP API 调用封装为网络流量
   2. 将字符串编码并拆分为网络数据包中的字节
   3. HTTP 调用被封装在 TCP 网络流量中
4. 服务器接收到网络流量，服务器提取出 HTTP 调用，交给 Web 服务器处理
5. Web 服务器提取应用 API 调用，交给应用程序处理

**封装库**

- 客户端代码依赖服务器功能
- 不应该关心如何构造 HTTP 消息
- 通常会创建一个封装库，为每个 Web API 方法提供对应的 JavaScript 方法
- 客户端代码调用封装库
- 封装库的职责：
  - 接收参数
  - 生成并发送 HTTP 请求
  - 接收并解析 HTTP 响应
  - 将 JSON 数据返回给客户端代码
- 由于封装库依赖异步（async）的 HTTP 调用，封装库的方法通常也是 **异步的**

## RESTful API

在许多传统服务中，服务器会记住与客户端的会话状态：

- 用户是谁
- 用户在活动中进行到哪一步
- 接下来做什么

很多信息都是短暂的（ephemeral），用户关闭页面后就不再需要，服务器维护这些状态带来了很大负担：

- 服务器无法知道用户已经离开
- 必须为每个曾访问过的用户一直保存状态

**解决方案**

- **表示性状态转移（REpresentational State Transfer, REST）**
- 将所有短暂状态保存在客户端
- 每次方法调用都必须包含服务器提供该方法所需的全部状态
- 服务器仍然保存 持久状态
  - 例如：你的文件上传、购买记录

**与对象交互**

- `put(partialObject, session)`
  - partialObject: No URL -> create, URL -> replace
  - session: 通过登录后得到
- `delete(objectOrUrl, session)`
- `patch(jsonPatch, objectOrUrl, session)`
- `get(objectOrUrl, schema, session)`

## 安全预授权

2010 年代

基于令牌（Token）的授权

- 给客户端发放一种“令牌（token）”，表示客户端被授权可以执行某个操作。
- 经典例子：**用户名和密码**
  - 用来识别客户端身份，
  - 服务器据此判断是否有权限。
- 在 **REST** 模型中：客户端每次请求时都要附带这个令牌。
- 但还需要解决一个问题：**客户端最初是如何获得这个令牌的？**（TBD = To Be Determined）
- 如果令牌是**不可伪造的**，它就可以作为客户端被授权的**证明**。
- 但如果令牌被**盗取**，那么窃取者就可以**冒充合法用户**。

## 组件式开发

### 引言

![image-20260514021054740](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260514021054740.png)

在早期，网站通常在设计中大量使用原生的按钮、列表、输入框等基础控件。但在如今，界面的很大一部分往往由大量文本、图片、符号和图形组成，并对它们应用复杂的样式设计来构建。当我们开始放置大量元素时，HTML 代码会变得非常庞大。理想情况下，我们希望将所有 HTML 代码（以及任何相关的逻辑）封装起来，这样我们就可以在应用程序中轻松地重复使用这张卡片（如下图），而无需每次都复制粘贴所有这些 div 元素。

![image-20260514021308406](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260514021308406.png)

```html
<div class="location-card">
  <div class="card-map-header">
    <img src="map.jpg" alt="Joshua Tree map">
    <div class="card-photo-ring">
      <img class="card-photo"
           src="turtle-rock.jpg"
           alt="Turtle Rock">
    </div>
  </div>
  <div class="card-body">
    <div class="card-title-row">
      <div class="card-titles">
        <h2 class="card-name">Turtle Rock</h2>
        <p class="card-subtitle">
          Joshua Tree National Park
        </p>
      </div>
      <span class="card-region">California</span>
    </div>
    <hr class="card-divider">
    <section class="card-about">
      <h3>About Turtle Rock</h3>
      <p>Descriptive text goes here.</p>
    </section>
  </div>
</div>

<!--使用组件，我们可以将所有内容折叠成一个自定义元素，该元素将所需的数据作为属性传递。 -->
<location-card
  name="Turtle Rock"
  subtitle="Joshua Tree National Park"
  region="California"
  map-src="map.jpg"
  photo-src="turtle-rock.jpg"
  description="Descriptive text goes here.">
</location-card>
```

近年来，一种新的架构正在兴起：它不再按关注点分离，而是按自包含、独立、可重用的组件进行分离。这种方法在 2014-2015 年左右由 React 推广开来，尽管早期的 UI 框架和面向对象编程中也存在类似的雏形。然而，这两种方法可以共存：一种是按组件分离，另一种是在每个组件内部进行关注点分离。

**组件的文件结构**

![image-20260514021614611](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260514021614611.png)

这就是这种关注点分离在实践中的样子。我们为每个组件创建一个单独的文件夹，其中只包含定义该组件所需的 HTML、CSS 和 JS 文件。

### Vue.js 组件

Vue 组件是纯 JavaScript 对象，包含两个主要部分：

- `setup()`： 用于存放响应式状态和逻辑——返回模板需要访问的值
- `template`： 组件的 HTML 代码，以模板字符串的形式存在

我们使用 *default* 导出，因此可以从任何地方按名称导入组件：
