# Lec 1 介绍 & 总览

设计是一个广阔的领域。需要考量的问题与人类的需求一样繁多，即便经验丰富，也难以穷尽所有细节。众多视角的审视能带来全面的覆盖与深刻的洞察，设计师很少孤军奋战，来自合作者的设计批评是优化设计的关键，你们将在实验课中学习并实践这一点，这也是为何实验课和课堂参与是必修环节。



**课程内容**

1. 可用性设计： 人机交互原则

   - 易学性

   - 高效率

   - 安全性

2. Web平台：将原则付诸实践的基数

   - HTML
   - CSS
   - 基本是JavaScript
   - 一些Vue.js技术



这里不包括：

- 大型的客户端框架（Bookstrap、Angular、React），除了一点点Vue.js
- 服务端开发（Django、Node）
- 数据库
- 如何编码
- 如何成为高级前端开发/UX设计师， 这些需要经验！



在 Web 上，可用性（usability）就是生存问题。

“如果一个网站很难使用，人们就会离开。如果主页没有清楚说明公司提供什么以及用户可以在网站上做什么，人们就会离开。如果用户在网站中迷失，他们就会离开。如果网站的信息难以阅读，或者无法回答用户的关键问题，人们也会离开。注意到这个规律了吗？没有任何用户会去读网站使用手册，也不会花很多时间去理解一个界面。当用户遇到困难时，最直接的反应就是离开，因为还有大量其他网站可供选择。‘离开’是用户遇到使用障碍时的第一道防线。”



## 可用性设计

### 可用性的组成

要理解“什么叫好用？”，不能只像写算法一样追求唯一正确答案，而要理解人类行为本身的复杂性。算法是从少量确定规则出发，逻辑推导出结论。它是一种逻辑思维。

与算法思维不同，人机交互（HCI）/ 可用性 是归纳性的，通过大量观察人类的行为总结规律，大量观察可用性上的成功与失败案例，从海量信息中归纳总结，提炼出通用的术语、概念与原则，以便我们能够推广到新的场景。 这些原则通常都不够精确、带有启发式性质，并且依赖具体情境， 它们之间往往还存在张力与冲突，往往不存在唯一正确答案，而是有许多“差不多正确”的方案，它们各自具有不同的权衡



可用性的维度

- 易学性： 是否容易学？
- 高效性：学了是否立马可以用？
- 安全性： 错误是否很少且可以恢复？

当然还有很多维度，比如美观、输入、减压等等，但是我们只关注着三个维度（LES），还有

- Nielsen：
  - Visibility（可见性）
  - Recognition over Recall（识别优于回忆）
  - Consistency（一致性）
  - User Control（用户控制权）
- Tog
- Shneiderman等等



但它们本质上在讲类似东西，都是在把大量细节观察总结成更通用的原则。

可用性的不同维度对于不同用户的重要性是不同的。

- 新手用户需要易学性（learnability）
- 专家用户需要高效率（efficiency）
- 不同用户可能会把不同的经验带入同一个 UI
- 即使是同一个用户，也不一定在所有方面都是新手或专家

### 设计评审

需要考虑的问题和人类本身一样多， 即使经验丰富，你也不可能想到所有事情。多个人一起审视一个设计，可以提供更全面的覆盖与洞察， 设计师很少单独工作，来自协作者的设计评审（design critique）对于改进设计至关重要。

### 用户测试

![image-20251016160821303](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251016160821303.png)

## Web技术

问一个问题， 是什么成就了WEB？ 

Web带来的可用性上创新。换句话说，把原本很麻烦的事情变得极其简单。 在Web出现以前， 人们其实已经可以做这些事——访问FTP、下载文件、打开文件和搜索资源。但是有了Web后，直接点击获取。

网站是由三种核心技术构建的：

- HTML 用于结构（structure）
- CSS 用于表现（presentation）
- JS 用于行为（behavior）

它们合在一起被称为**Web 平台（Web Platform）**。这个术语用来描述用于创建网站和 Web 应用的一组开放技术。HTML、CSS 和 JS 是 Web 平台的主要技术，但还有其他技术，例如 SVG。

有时它们之间的界限会变得有些模糊（例如：动画到底属于表现还是行为？），但总体来说，将结构放在 HTML 中、表现放在 CSS 中、行为放在 JS 中，会让网站在后期更容易维护。这种做法被称为“关注点分离”。

![image-20251016161042228](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251016161042228.png)

近年来，一种新的架构正在出现：它不再按照“关注点”来划分，而是按照“自包含、独立、可复用的组件”来进行拆分。

不过，这两种方式可以共存：我们可以先按组件进行划分，然后在每个组件内部再按关注点进行分离。







 



### HTML

最小html页面

```html
<!DOCTYPE html>   --> 现代渲染的标志
<html lang="en">  --> 根元素
<head>						--> 这个header元素包含元数据
	<meta charset="UTF-8"> --> 网页编码
	<title>Hello world</title>  --> tab的头部以及书签
</head>
<body>		--> body内是可见内容
	<p>Hello <em>world</em> 👋</p>
</body>
</html>
```

我们可以通过[在线渲染](https://codepen.io/pen)网站来学习。



元素分为有无属性、有无值，有些只有元数据

```html
<!-- HTML属性提供了元数据， 属性名href，属性值是后面的链接-->
hello <a href="http://xxx.com"> world </a>
<!-- 有些元素只有元数据， 后面的/可要可不要-->
<img src="img/boby.jpg" /> 
<!-- 有些属性没有值， checked是bool属性-->
<input type="checkbox" checked>
<!-- 有些元素没有内容也没有属性，换行-->
hello <br> world
```

HTML 可能会因为以下内容而需要发起更多的 HTTP 请求：

- CSS文件:

  ```html
  <link href="presentation.css" rel="stylesheet">
  ```

- JS文件

  ```html
  <script src="behavior.js"></script>
  ```

- 媒体文件

  ```html
  <img src="baby.jpg" alt="Description">
  <video src="nyan-cat.mp4"></video>
  <audio src="o-superman.mp3"></audio>
  ```

- 甚至还包括其他 HTML 文件！

  ```html
  <iframe src="otherpage.html"></iframe>
  ```








**服务端**

有时候，返回 HTML 并不只是简单地找到一个 HTML 文件然后读取内容。有时服务器需要先执行代码，这些代码会生成 HTML 标记，通常还会从数据库中读取数据之后再生成页面。常见用于这种场景的语言包括 PHP、Node.js（服务端 JavaScript）、Ruby 等等。

在服务器端的php文件

```php+HTML
...
<body>
	<p>Hello <em>world</em> 👋</p>
	<footer>©<?= date("Y"); ?><footer>
</body>
</html>
```

发送到客户端的HTML

```html
...
<body>
	<p>Hello <em>world</em> 👋</p>
	<footer>©2023<footer>
</body>
</html>
```

服务器端编程曾经是实现动态网站的主要方式。在过去十年中，一种新的架构逐渐出现。这种方式不再使用服务器端语言在每次请求时都反复生成相同的 HTML（即使可能通过缓存来提升性能），而是使用静态站点生成器（例如 11ty）一次性生成 HTML 文件，然后直接以静态文件的形式提供服务。

任何需要的动态数据则通过 API 获取。这种方式被称为“无头架构”（headless architecture）或“JAMStack”（JavaScript + APIs + Markup）。它可以带来显著的性能和安全性提升。

![image-20251016161907647](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251016161907647.png)

但在这门课程中，我们不会涉及服务器端编程。





### CSS

```css
h1 { /*选择器Selector: 这条规则应用在哪个元素*/
  font-size: 200%;
  color: white; /* 属性: 属性值 */
}
```



**解构一个网站**

1. 打开一个你经常访问的网站
2. 打开浏览器的开发者工具（DevTools），方法包括：
   1. 右键→ 检查元素（Inspect Element）
   2. 找到 `<style>` 元素和 `<link rel="stylesheet">` 元素，并将它们删除





### JavaScript

JavaScript 是一种功能完整的编程语言，在客户端（浏览器）中执行。 它使我们能够为网页添加交互性，并自动化某些任务（例如模板生成等）。

```html
<style>
	h1 {
		color: slategray;
		color: yolo;
		font-style: red;
		font-weight: normal;
	}
</style>
<script>
	console.log("Hello");
</script>
<h1 yolo="1">
	Error handling in <strong>HTML,
		<em>CSS</strong>, JS</em>
</h1>
```

HTML、CSS 和 JS 拥有完全不同的错误处理机制：

- HTML 会尝试自动修复错误
- CSS 会忽略错误
- JavaScript 会停止执行并报错

请在新标签页中打开这个页面，并使用开发者工具检查这些错误是如何被处理的。你也可以尝试更多类型的错误，并观察会发生什么！例如：

HTML：

- 删除或修改不同元素的结束标签（如 `<h1>`、`<script>`、`<style>`），会发生什么？
- 删除属性值的结束引号

CSS：

- 使用不存在的属性
- 删除分号

JavaScript：

- 缺少引号
- 缺少左括号或右括号