# Lec 2 Web网页结构：HTML

- HTML语义
- 常见的HTML元素
- DOM树
- HTML的交互与用户输入
- 响应式模板



## HTML语义



### 语义的作用

HTML 元素是有语义的（除了 `<div>` 和 `<span>`等），它们应该根据其语义来使用，而不是根据它们默认的显示效果。原因是

1. 语义化的 HTML 对有障碍的用户来说更加友好。
2. 结构清晰、可被机器读取的内容可以在没有 CSS 和 JavaScript 的情况下被独立理解和使用。

因此，这也体现一种可用性。当使用更多不同语义的元素时，你更容易知道自己在代码中的位置；相比之下，如果所有内容都是 `<div>` 或 `<span>`，就会难以区分结构。

记住：**你的代码本身也是一个界面**——既是给你自己看的，也是给其他人的。 并不总是直观易做，但只要稍微花点心思，就能带来很大的收益

![image-20260513224955354](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513224955354.png)

### 常用的语义分区

作为引例，

![image-20260513211735008](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513211735008.png)

视觉效果可能是相同的，但语义是不同的。

- `<em>` 元素表示对其内容的强调（stress emphasis）
-  `<i>` 元素不是斜体按钮，而是语义标签，表示这一段文字在内容意义上是被特殊对待的。 例如外语词汇，或者当文本是在引用一个词的定义而不是表达其语义含义时。
- `<cite>`表示作品的标题（例如书名或电影名）

这两种标签都不是用于纯装饰目的的；纯装饰应该交给 CSS 来处理。如果斜体只是装饰性的，那么应该使用最后一种方式（如 `<span>`），因为 `<span>` 本身不带任何语义含义。





常用的语义化分区（semantic sectioning）的元素（HTML5 语义标签）有：

- `<header>`： 页面或某个区域的头部（如标题等）

- `<nav>`： 导航区域（每个页面通常只使用一次）

- `<main>`：页面的主要内容区域（每个页面通常只使用一次）

- `<aside>`：侧边内容（例如侧边栏中的内容）
- `<footer>`：页面或某个区域的底部信息

此外，还有 `<section>` 和 `<article>`，用于进一步对内容进行划分。

```html
<!DOCTYPE html>
<html>
<head> 
  <meta charset="utf-8">
  <title>6.4500 Design for the Web</title>
</head>
<body>
  <header>
    <h1><strong>6.4500</strong> Design for the Web</h1>
    <nav>....</nav>
  </header>
  <main>
    <section>
      <h2>Course info</h2>
      <p>This course will teach the principles and technologies for designing user interfaces for the web.</p>
    </section>
    <section>
      <h2>Grading</h2>
      <p>There will be weekly assignments that will account for 90% of your grade.</p>
    </section>
  </main>
  <aside>

  </aside>
  <footer>
    © 2020 MIT
  </footer>
</body>
</html>

```



### 可聚焦控件

焦点（Focus）决定了页面中键盘事件当前会发送到哪里。 在任何时刻， 它通常被理解为"当前处于活跃状态的元素"。

Tab 键会将焦点移动到下一个可聚焦元素（tab 顺序中的下一个元素）。Shift + Tab 则相反，会将焦点移动到上一个可聚焦元素。

默认情况下，获得焦点的元素会显示为蓝色的模糊外框或虚线框，但这个样式可以通过 CSS 修改。然而，保留某种焦点样式非常重要，因为键盘用户依赖它来知道当前在哪里。

常见的可聚焦元素：

- 表单控件（`<input>`、`<textarea>`、`<select>`、`<button>`）

- 超链接（`<a href>`）

- `<summary>` 元素

- 带有可见控件的多媒体元素（如 `<video controls>` 等）

- `<iframe>`（某种程度上可以聚焦）

- 任何元素都可以通过 `tabindex="0"` 让其变得可聚焦

  ```html
  <div tabindex="0">现在我也可以被聚焦！</div>
  ```



**Autofocus**

`autofocus` 的作用是：页面加载后自动把键盘焦点放到某个输入框或元素上。

![image-20251016170729734](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251016170729734.png)

一些可以深入了解 focus 的资源：

- [Focus](https://developers.google.com/web/fundamentals/accessibility/focus) 介绍（Introduction to Focus）
- [规范文档](https://html.spec.whatwg.org/multipage/interaction.html#focus)
- [Focusing On Focus](https://blog.whatwg.org/focusing-on-focus) 





## HTML元素

### 标题

有 6 个级别的标题：`<h1>` 到 `<h6>`，不要只是为了让文字变大而使用标题标签，这样会破坏依赖屏幕阅读器的视障用户的导航体验。应该使用 CSS 来控制样式，而且 CSS 的控制更灵活。

- 每个文档中只使用一个 `<h1>`
- 避免标题层级跳跃， 比如从h1直接跳到h3，这是不好的



### 分区元素

`<div>` = generic block container（通用块容器）

像 `<section>`、`<article>` 这样的标签用于表示内容的结构单元，按理说，在这些分区元素中的标题，应该跟随分区层级来决定层级，但实际上，浏览器并没有真正实现这个逻辑（除了表面样式）

屏幕阅读器仍然是根据标签本身（比如 `<h1>`）来理解语义的。👉 因此目前的最佳实践是：即使在 `<section>` 或 `<article>` 里，也要手动使用正确的标题级别（如 `<h2>`, `<h3>` 等）

```html
<section>
	<h1>Heading 2</h1>
	<p>JavaScript is a programming language.</p>
  <p>It is widely used in web development.</p>
  <p>上下有间距，不用换行</p>
</section>
```



### 行内元素

有多种用于“文本级语义（text-level semantics）”的元素，因为对文本进行高亮也是一种常见需求。另外，还有一个 `<code>` 元素，用于表示行内代码。

- `<span>`：通用的文本级容器，本身不具备特定语义。当没有其他合适的语义元素时可以使用它。可以通过 CSS 自由定义 `<span>` 的外观。
- `<strong>`：表示具有强烈重要性、严肃性或紧迫性的文本。浏览器通常会将其内容渲染为加粗。
- `<em>`：表示强调语气的文本。浏览器通常会将其内容渲染为斜体。
- `<mark>`： 表示被标记或高亮的文本，用于引用或注释，因为该内容在上下文中具有相关性或重要性。
- `<code>`  用于表示嵌入在文本中的简短代码片段。对于整段代码，应在 `<pre>` 中使用 `<code>`。浏览器通常会将其内容渲染为等宽字体。
- `<time>`：用于包裹日期、时间或持续时间，在提供人类可读内容的同时，也提供机器可读的时间信息。浏览器通常不会对该元素进行特殊显示（不过这种行为可以改变）。



这些元素也被称为“行内元素（inline elements）”，因为它们与文本在同一行内，不会像段落或标题那样在前后产生换行并形成一个块级区域（当然，这种行为也可以通过 CSS 改变）。它们有时也被称为“短语内容（phrasing content）”。

虽然这些元素默认带有一定的显示样式（如加粗或斜体），但它们本质上是**语义元素**，不应该仅仅为了样式而使用。如果你只是想让文本变粗或变斜，应该使用 `<span>` 加 CSS，而不是 `<strong>` 或 `<em>`。

为了更好地理解这种区别，可以参考 `<em>` 和 `<i>` 的差异（它们默认显示效果相同，但语义不同）



### 列表

有三种列表类型：

- 无序列表（`<ul>`）
- 有序列表（`<ol>`）
- 定义列表（`<dl>`，用于表示键值对）

列表项（`<li>`、`<dt>`、`<dd>`）中也可以再嵌套列表，从而形成嵌套结构。

这三种列表项的结束标签都是可选的。

在定义列表中，`<dt>`（术语）和 `<dd>`（描述）之间的对应关系不是一一固定的：可以有多个 `<dt>` 对应一个 `<dd>`，也可以有多个 `<dd>` 对应一个 `<dt>`。

```html
<ul>
	<li>Garlic</li>
	<li>Spring onion
</ul>

<ol>
	<li>Do work
	<li>Have fun</li>
</ol>

<dl>
	<dt>First name:</dt>
	<dd>Zoe</dd>
	<dt>Last name(s):</dt>
	<dd>Lilley</dd>
	<dd>Verou</dd>
</dt>
```



### 超链接

`<a>` 元素可以让你链接到其他网站，甚至是当前页面中的某个位置。 `href` 属性包含链接目标，它可以是一个绝对 URL，也可以是相对于当前页面的相对 URL。

- 如果要链接到页面中的某个具体位置，需要找到该位置附近带有 `id` 属性的元素，然后在 URL 后面加上 `#id`。

- 如果是链接到当前页面中的位置，只需要使用 `#yourId` 作为 URL 即可。

- 使用 `target="_blank"` 可以让链接在新标签页中打开。



```html
<ul>
	<li><a href="http://designftw.mit.edu" target="_blank">空白页面打开</a> 
	<li><a href="https://w3.org/TR/html/textlevel-semantics.html#the-a-element">
		&lt;a> 指定元素 (← link to specific part of page)
	</a></li>
	<li><a href='/'>返回主页</a></li>
	<li><a href='/lectures/introduction/'>另外一个相对链接</a></li>
</p>
```

#### 多媒体

HTML 提供了以下用于多媒体的元素：

- `<img>` 用于图片
- `<video>`用于视频
- `<audio>` 用于音频文件

```html
<img src="img/adamcatlace.jpg" alt="A kitten, roughly 3 weeks old">
<video src="https://leaverou.github.io/talks/intro/war-kitten.mp4" controls></video>
<audio src="https://freesound.org/data/previews/175/175409_1326576-lq.mp3" controls></audio>
```

#### figure

- `<figure>`可以包含任何媒体内容，甚至可以包含其他元素（例如用于绘制图形的元素）
- `<figcaption>` 用于包含图注（说明文字）。这与 `alt` 属性不同，`alt` 是用来为视觉障碍用户描述图片内容的。尽管在某些情况下两者的内容可能会重叠，但在这种情况下，不要在 `alt` 属性中重复 `<figcaption>` 的内容。

```html
<figure>
	<img src="img/adamcatlace.jpg" alt="A kitten, roughly 3 weeks old">
	<figcaption>Sir Adam Catlace</figcaption>
</figure>
```

![image-20260514170058055](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260514170058055.png)



### 表格

有一系列用于创建表格的元素：

- `<table>`： 包含整个表格
- `<tr>` ：表格中的一行（table row）
- `<td>`：表格单元格 （table cell）
- `<th>`：表头单元格（table header cell）
- `<thead>`： 表头
- `<tbody>`：表格主题（没有显式指定，也会自动生成）
- `<tfoot>`： 页脚

表格的设计初衷是仅用于展示表格数据（tabular data ONLY）。

如果用它来做布局，会改变 HTML 向其他解析工具传达的语义信息，对屏幕阅读器、搜索引擎机器人等尤其不友好。CSS布局用grid

```html
<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Email</th>
			<th>Office</th>
		</tr>
	</thead>
	<tr>
		<td>David Karger</td>
		<td>karger@mit.edu</td>
		<td>32G-592</td>
	</tr>
	<tr>
		<td>Lea Verou</td>
		<td>leaverou@mit.edu</td>
		<td>32G-598</td>
	</tr>	
</table>
```





## DOM 树



### 介绍

在使用 Web 平台技术时，会发现在很多地方都会被用树的结构。

HTML 的开始标签和结束标签并不是“开启/关闭指令”，而是用来界定 HTML 元素边界的分隔符。因此，HTML 元素之间存在一种包含关系，即某些元素的起始位置位于其他元素内部。这些包含关系会形成一棵树，这棵树被称为 DOM 树（*Document Object Model, DOM tree*）。 

![image-20260513233225861](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513233225861.png)

[DOM Tree](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) 是一个由不同类型对象构成的层级结构，例如：

- 文档（*DOCUMENT*）：这是根节点，不对应任何具体的 HTML 元素。
- HTML元素（*HTMLELEMENT*）：每一个 HTML 元素，例如 `<html>`、`<body>` 或 `<em>` 都属于这一类型。通常它们只是继承自 `HTMLElement`，并且是更具体类型的实例，例如 `HTMLHtmlElement`、`HTMLBodyElement` 等。
- 文本：例如示例中的 `"Hello "`、`"world"` 和 `"!"`。它们不会包含任何其他元素，始终是叶子节点。
- 注释：HTML 注释（如 `<!-- like this -->`）会被表示为这一类型的对象。



这种对象层级结构对于 CSS 样式非常关键，我们将在接下来的几节课中看到这一点。

此外，我们还可以通过 JavaScript 来访问和操作 DOM 树。

![44833275070](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/44833275070.gif)

标题元素和分区（sectioning）元素的结构会创建内容层级，也称为文档大纲（document outline）。这与这些元素所表达的语义含义有关。

DOM 树则是另一种不同的层级结构，它与页面中元素的类型以及元素之间的关系有关。



### CSS选择器的关系

CSS 选择器中很大一部分内容，都是**基于 DOM 树中元素之间的关系来选择元素**。我们来看看其中一些常见的方式。在第一节课中，我们已经见过元素选择器（也叫类型选择器），它可以选中所有某一类型的元素。

- **空格**：选择“后代关系”选择元素（后代选择器 / descendant combinator）。

-  `>` ：选择“直接子元素”（子元素选择器 / child combinator）。

-  `~` ：选择“后续的同级元素”（兄弟选择器 / sibling combinator）。

-  `+` ：选择“紧邻的下一个兄弟元素”（相邻兄弟选择器 / adjacent sibling combinator）。

- 像 `:nth-child()` 这种以冒号开头的写法被称为伪类，它会在已有选择器的基础上进一步进行过滤。这个特定的伪类是根据元素在兄弟节点中的位置来进行筛选的。你甚至可以使用类似 `:nth-child(3n+2)` 这样的表达式，匹配第 2、5、8 等等位置的子元素。

![36759213970](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/36759213970.gif)

### 小结

- DOM（文档对象模型）表示 HTML 页面中的对象层级结构
- 每一个 HTML 元素都是一个节点
- 当一个元素嵌套在另一个元素内部时，就会形成父子关系
- DOM 树的层级结构与内容层级并不完全相同
- 把 HTML 文档转换成 DOM 树的过程称为 HTML Parsing（HTML 解析）
- 可互操作（interoperable）的 HTML 解析对于 CSS 和 JavaScript 非常关键，而这一点花了大约 25 年才逐渐实现统一！

## 交互与用户输入

### 按钮和表单

`<button>` 元素用于创建按钮， 这些按钮本身不会自动执行任何操作，但你可以通过 JavaScript 或 `<form>` 元素让它们发挥作用。

具体来说， `<form>` 元素的 `action` 属性用于指定表单提交后数据发送到的目标文件。默认情况下，它指向当前页面。至于提交时包含哪些内容？只有同时满足以下两个条件的元素才会被提交：

- 元素是启用的状态
- 元素具有 `name` 属性

在这里同样可以使用 `target="_blank"`，让表单提交在新标签页中进行。

```html
<form action="https://www.google.com/search" target="_blank">
	<input name="q" required />
	<button>Search Google</button>
</form>
```

![image-20260506215519035](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260506215519035.png)

结果就是在新标签页，搜索`www.google.com?q=<你填写的内容>`



#### 输入字段

`<input>` 元素可以通过 `type` 属性生成多种不同的表单控件。如果没有指定 `type` 属性，则默认是 `type="text"`。

- 以下内容只适用于文本类输入

  | 属性          | 作用                       |
  | ------------- | -------------------------- |
  | `placeholder` | 输入框为空时显示提示文本   |
  | `maxlength`   | 限制最大字符数             |
  | `minlength`   | 限制最小字符数             |
  | `pattern`     | 使用正则表达式限制输入格式 |
  | `required`    | 必填字段                   |
  | `readonly`    | 只读                       |
  | `disabled`    | 禁用输入                   |

- 在数值和日期类型的输入中，支持：

  | 属性    | 作用   |
  | ------- | ------ |
  | `min`   | 最小值 |
  | `max`   | 最大值 |
  | `step`  | 步长   |
  | `value` | 默认值 |

- 对于 number 和 range 输入，还可以使用 `step` 属性来控制步长（默认值为 1）

  ```html
  <input
  	type="range"
  	min="0"
  	max="100"
  	step="5"
  	value="50"
  >
  ```

-  `<textarea>` 用于多行文本输入，支持`placeholder` 属性等，但不支持`pattern`，但相关支持正在推进中。



```html
<p>
	<input placeholder="Type in me!" />
</p>
<p>
	<input type="range" />
</p>
<p>
	<input type="number"
	       min="1" max="10" value="3" />
</p>
<p>
	<input type="date" value="2018-02-15"
	       min="2018-02-10" />
</p>
<p>
	<textarea>Textareas are intended for longer form text with multiple lines.</textarea>
</p>
```

![image-20260506214743109](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260506214743109.png)





#### 单选字段

多个选项中只能选择一个， input 元素的属性`type="radio"`

通过 `name` 属性将单选按钮分组，可以使它们互斥（同一组中只能选一个），则它们彼此独立，可以同时选中。 `checked` 表默认选中

```html
<input type="radio" name="size" checked> Small
<input type="radio" name="size"> Medium
<input type="radio" name="size"> Large
```

`<label>` 元素对所有表单控件都很有用，但对复选框和单选按钮尤其重要，因为它可以扩大可点击区域，提高可用性。因此推荐写法

```html
<label>
	<input type="radio" name="size">
	Medium
</label>
```



#### 复选字段

复选框允许选择多个选项，用属性`type="checkbox"`

```html
<label>
	<input type="checkbox">
	Receive newsletter
</label>
```

多个 checkbox 不会互斥

#### 下拉菜单

```html
<select name="month">
	<option selected>Jan</option> <!-- 默认是Jan -->
	<option>Feb</option>
</select>
```

多选下拉菜单

```html
<select multiple>
	<option>Apple</option>
	<option>Banana</option>
</select>
```



#### 表单分组

`<fieldset>` 用于将相关表单控件分组（效果是被框住）



#### 小结

根据选项数量不同，应选择不同的表单控件以提升用户体验：

- 当选项少于 4 个时，如果空间允许，优先使用 `radio` 按钮（有时避免界面杂乱更重要，例如模板重复使用的场景），因为它们操作效率最高。
- 当选项在 5 到 20 个之间时，`<select>` 下拉菜单是最合适的选择。
- 当选项超过 20 个时，下拉菜单的查找效率会下降（用户需要滚动查找），此时应使用 `<input>` 配合 `<datalist>` 实现自动补全。



下面是关于表单数据

![image-20260506214958183](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260506214958183.png)

```html
<p><label><input type="checkbox"> I have read the terms of service</label>
<p><label><input type="checkbox" checked> I want to subscribe the newsletter</label>

<fieldset>
	<legend>Which letter of the alphabet?</legend>
	<label><input type="radio" name="foo" checked value="A"> A</label>
	<label><input type="radio" name="foo" value="B"> B</label>
</fieldset>
<p>
	<label>
		Favorite breakfast:
		<select>
			<option value="">(none)</option>
			<option>🥑</option>
			<option>🥩</option>
			<option>🥓</option>
			<option>🥥</option>
			<option>🍳</option>
		</select>
	</label>
</p>
<p>
	<label>I’m from <input list="countries"></label>
	<datalist id="countries">
		<option>Greece</option>
		<option>United Kingdom</option>
		<option>United States</option>
	</datalist>
</p>
```







### 折叠/展开组件

- `<details>` 元素可以用来创建可隐藏的内容，其中 `<summary>` 用作标题，点击它可以展开或收起内容

- 如果没有提供 `<summary>`，浏览器会自动生成一个默认标题（通常是“Details”）。

- 布尔属性 `open` 表示该内容默认处于展开状态。当用户展开内容时，浏览器也会自动添加这个属性（因此可以用 CSS 来根据展开状态进行样式控制）。可以在示例中添加它并观察效果。

有趣的是：你现在正在阅读的这些笔记本身就是放在一个 `<details>` 元素中，只是通过 CSS 做了样式定制。你可以检查一下页面结构来验证这一点！

这个元素非常适合用来简化界面，将不需要一直显示的内容（例如设置、进阶信息等）隐藏起来。不过它也有一个学习成本的权衡：用户有时不会注意到这些隐藏内容，因此可能不会去查看它们。



```html
<details>
	<summary>Notes</summary>
	Hidden content here
</details>
<details>
	More Hidden content here
</details>
```



### 自定义HTML元素

还有一种是自定义 HTML 元素（custom HTML elements），它们通过标签名中的连字符与内置 HTML 元素区分开来。这些也被称为 Web Components（网页组件）。

我们会在本学期后面学习如何自己创建这类组件。这里我们使用的是一个已有的 Web Component，它来自一个叫 Shoelace 的库。

类似地，我们也可以使用自定义 CSS 属性，它们与内置属性的区别在于以双连字符 `--` 开头。

Web Components 在样式定制中大量使用这些自定义 CSS 属性来控制组件的不同外观部分。





## 响应式模板

手写 HTML 可能会很重复。许多相同的片段只是在细节上有一些差异，却会在不同页面中反复出现（例如：页眉、页脚、菜单等），以及在同一页面中为了展示数据列表而重复出现。

![image-20260513193039162](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513193039162.png)

有一些减少重复的方法是依赖编辑工具的（例如代码片段 snippets 或 [Emmet](https://emmet.io/)，这里展示的这些功能也已经集成在你的编辑器中）。然而，这些方法在数据发生变化、需要重新生成 HTML 时并没有帮助。此外，它们还会让 HTML 文件中充满重复的代码，从而变得臃肿。如果需要修改某个模式， 必须找到并修改每一个出现过的地方，很容易漏掉。

![image-20260513193502387](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513193502387.png)

有一些语言可以将 HTML 作为输出生成，从而支持抽象和自动化。其中一些是完整的通用编程语言，也可以用于模板生成（例如 PHP），而另一些是领域专用语言（DSL），专门为模板设计（例如 Nunjucks）。

应用程序通常以机器可读的形式管理数据，而一个重要的步骤是将这些数据以人类可读的形式呈现出来。模板（templating）正是实现这一目标的一种有效方式。

你很可能已经使用过响应式编程（reactive programming），即使你并不知道这一点。电子表格（spreadsheets）就是响应式编程的经典例子。当你改变某个单元格的值时，所有依赖它的单元格都会自动更新。

![image-20260513203253781](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513203253781.png)



看下面这个例子

```js
let a = 1;
let b = 2;
let sum = a + b; // 3
a = 3;
console.log(sum); // still 3
```

这并不是大多数编程语言（例如 JavaScript 或 Python）的工作方式。 在命令式编程中，当你改变 `a` 或 `b` 时，必须手动更新 `sum` 的值。



### CSS 响应式

```js
// 当鼠标进入
button.addEventListener("mouseenter", function() {
	button.style.boxShadow = "0 0 5px gold";
});
// 当鼠标离开
button.addEventListener("mouseleave", function() {
	button.style.boxShadow = "";
});
```



```css
button:hover {  /*hover 伪类，鼠标悬停时就是hover状态*/
	box-shadow: 0 0 5px gold;
}
/*
类似的伪类
:active —— 鼠标按下时
:focus —— 输入框被选中时
:visited —— 已访问的链接
:checked —— checkbox 被选中时
*/
```







### VueJS响应式

VueJS 允许我们创建 UI，并编写利用响应式（reactivity）的 JavaScript。这使得 DOM 更新相比原生 JS 更容易编程。

![image-20260513204635139](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513204635139.png)

`v-model` 是 Vue 的一个指令（directive）：一种特殊的 HTML 属性，用来告诉 Vue 执行某种操作。在这里，它的作用是让 `a` 和 `b` 属性与输入框的值保持同步。指令的值是 JavaScript 表达式

> 为什么叫 v-model ？
>
> 答案： 这个名字来自软件工程中的“模型-视图分离”（model-view separation）概念，也就是：视图（UI）在很大程度上是数据的一个确定性函数。



Vue 很大一部分内容围绕着一个核心：**让视图与数据对象保持同步**。那么，在 JavaScript 中数据是如何表示的呢？语法在很大程度上类似 Python，JavaScript 的对象字面量（object literals）类似于字典，数组（arrays）类似于列表（list）。



> [!NOTE]
>
> 另外还有一种更受限制的语法，称为 JSON，它也常用作文本数据交换格式。JSON 和 JavaScript 的主要区别如下：
>
> - 属性必须始终加引号： 在 JavaScript 中，如果属性名是合法标识符（例如 `age`），可以不加引号
> - 不允许尾随逗号，
> - 只允许 `null` 作为唯一的空值
> - JavaScript 的值可以是任意类型，而 JSON 只支持以下类型：
>   - 字符串
>   - 数字
>   - 布尔值
>   - 数组
>   - 对象
>   - null
> - 字符串只能使用双引号， 例如 `"foo"`，不能使用 `'foo'`
>
> ```js
> {
> 	"name": "Lea",
> 	age: 37, // 属性可以没有引号
> 	"numbers": [1, 1, 2, "three"], // 可以混用
> 	"unique-numbers": new Set([1, 1, 2, 3]), // 
> 	"nested": {
> 		"visible": true,
> 		"missing": null
> 	},
> }
> ```



Vue还允许我们再某些事情发生时执行代码。

其语法是： 使用以 `@` 开头的属性，后面跟事件名称（例如 `click`），它其实是 `v-on` 指令的一个简写形式。



![image-20260513202933838](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513202933838.png)

当我们需要将复杂的操作和计算进行抽象时，JavaScript 的语法会更加方便，属性和方法可以帮助我们把复杂的计算或者操作抽象出去，从而让模板更加简洁。 另外方法也可以用来修改数据。

注意：在 JavaScript 环境中，我们使用 `this` 来访问根级别的数据。你也可以使用 `app`（即 `createApp` 函数的返回值）。

如果你想检查当前数据状态，可以在 JavaScript 中使用：

```js
globalThis.app = app
```

这样 `app` 就会变成一个全局变量，你可以在控制台中随意查看和操作它。

不过，更推荐的方式是使用 Vue Devtools 来进行调试。





## 如何在线上获取帮助？

如何避免不可靠或过时的资源：

- 始终查看内容的发布时间
- Wiki 类资源通常更可靠。优先使用 [MDN](https://developer.mozilla.org/zh-CN/)，而不是 w3schools
- 最权威的来源是官方规范（如 W3C、WHATWG），但它们通常很难阅读，因为是为浏览器开发者编写的

不过，一般来说，越接近 Web 标准的文章质量越高。如果文章引用或提及了相关规范，通常说明它是一个更可靠的资源。

