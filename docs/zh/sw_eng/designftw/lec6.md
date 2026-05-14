# Lec 6 CSS的基本概念 I



- 文档流
- 盒子模型
- 值和单元
- 选择器





## 快速总览

在CSS中，所有元素都是一个盒子。 CSS关于盒子如何展示，以及如何影响到其他盒子的

### CSS使用方式

页面应用 CSS 的 3 种方式：

1. 通过外部 CSS 文件，并使用 `<link>` 元素引入。这是大多数情况下推荐的方式。
2. 在 `<style>` 元素中编写 CSS。如果 CSS 只作用于当前页面，这种方式是可行的。
3. 在少数一次性使用的情况下，可以使用 `style` 属性，它的优先级高于作用于同一元素的其他 CSS。但不推荐使用，因为它难以维护，不利于关注点分离，也缺乏灵活性。

`<link>` 和 `<style>` 元素都应该只放在 `<head>` 标签中。

```html
<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="style.css">
	<style>
		a { color: gray; }
	</style>
</head>
<body>
	<h1 style="color: #f06">Title</h1>
</body>
</html>
```



### CSS的规则

```css
h1 { /* */
    font-size: 200%;
    color: white;
}
```

- 大多数 CSS 都由一系列 CSS 规则组成。

- 选择器（selector）告诉浏览器这个规则作用于哪些元素，这里是 `<h1>` 标题
- 声明（declaration）是“属性-值”对，每个声明控制某一种样式效果。
- 多个声明之间用分号分隔，最后一个分号是可选的（但建议保留）
- 这里可以看到两个 CSS 属性：
  - `color`：设置文字颜色
  - `font-size`：设置字体大小



示例， 

html

```html
<h1>My first CSS code</h1>
<p>One morning, when <a href="https://en.wikipedia.org/wiki/The_Metamorphosis">Gregor Samsa</a> woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.</p>
<p>He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.</p>
<p>The bedding was hardly able to cover it and seemed ready to slide off any moment.</p>
<p>His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. "What's happened to me? " he thought. It wasn't a dream.</p>
```

css

```css
h1, h2, h3, h4, h5, h6 {
	font-family: Helvetica, Segoe UI, sans-serif;
	line-height: 1;
}

h1 {
	color: purple;
}

p {
	hyphens: auto;
	text-align: justify;
}

a {
	text-decoration: none;
}
```

这里我们可以看到几个最基础的 CSS 属性：

- `font-family`：设置字体类型，按优先级顺序排列。因为在 Web 上你无法准确知道用户安装了哪些字体（除非通过 `@font-face` 规则直接引入字体文件），所以通常会提供一个字体列表，并在最后加上一个通用字体作为兜底。
- `color`：设置文本颜色，同时也会为一些其他效果设置默认颜色，比如边框和阴影。它当前的值可以通过关键字 `currentColor` 在其他属性中引用。
- `hyphens`：启用单词断字（自动连字符拆分）。
- `text-decoration`：用于设置或（在这里）取消文本的下划线、上划线或删除线。

我们也可以通过开发者工具中 Elements 面板的 Styles 标签来修改 CSS，同时它也会显示每条 CSS 的实际生效情况。



> 如果我们想使用“元素类型”以外的标准来选择元素怎么办？

Sol：

| 分组依据 | 示例选择器       | 能匹配的元素                                                 | 不能匹配的                                            |
| -------- | ---------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| id       | `#about`         | `<section id="about">`                                       | `<section id="about-me">`<br />`<input name="about">` |
| 类       | `.notice`        | `<p class="tip notice">`、`<p class="notice">`、`<p class="important notice warning">` | `<notice>`、`<div class="warning-notice">`            |
| 属性     | `[href]`         | `<a href="http://designftw.mit.edu">`、`<a href>`、`<link rel="stylesheet" href="style.css">` | `<a>`                                                 |
| 属性值   | `[type="range"]` | `<input type="range">`、`<yolo type="range">`                | `<input type="number">`                               |

最常见的 CSS 选择器

| 选择器    | 含义                   | 示例                | 作用                      |
| --------- | ---------------------- | ------------------- | ------------------------- |
| `*`       | 通配选择器（所有元素） | `* { margin: 0; }`  | 选择页面中的所有元素      |
| `element` | 元素/标签选择器        | `p { color: red; }` | 选择某种 HTML 标签        |
| `.class`  | class 选择器           | `.message {}`       | 选择拥有某个 class 的元素 |
| `#id`     | id 选择器              | `#header {}`        | 选择某个 id 的元素        |

属性选择器

- [`[attr\]`](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)

- [`[attr="value"\]`](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)

- [`[attr^="starts"\]`](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)

- [`[attr$="ends"\]`](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)

- [`[attr*="anywhere"\]`](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)



**自定义选择器**

不过，CSS 中还有其他类型的规则，通常统称为“At-rules（@规则）”。

其中一些 @规则用于扩展或补充其他 CSS，例如：

- `@font-face`：链接自定义字体
- `@keyframes`：定义动画
- `@import`：导入其他样式表
- `@page`：设置打印相关的页面元数据

还有一些 @规则内部可以包含 CSS 规则（甚至其他 @规则），并用于限制这些 CSS 在什么条件下生效。这类规则称为“条件型 @规则（conditional at-rules）”。

例如：

- `@media`：限制 CSS 只在特定媒体类型下生效
- `@supports`：限制 CSS 只在支持某个 CSS 属性的浏览器中生效

## 文档流

## Box模型

## 值与单位



`<length>`表示距离的度量单位，有些属性允许负长度，有些则不允许。当值为0时，可以省略单位。对于`<length>`的单位，有绝对的，和相对单位。 [更多关于 lengths](https://developer.mozilla.org/en-US/docs/Web/CSS/length)。

- 对于绝对单位，在任何地方都表示相同的尺寸。 例如：`px`、`cm`、`mm`、`in`、`pt`

- 对于相对单位，依赖于其他因素而变化：

  - 字体相关单位适合用于通过改变一个`font-size`属性来整体缩放组件。例如，`em`、`ch`、`rem`、`ex`

  - 视口相关单位适合用于创建能够随c大小自适应缩放的布局。例如， `vh`, `vw`, `vmin`, `vmax`




一些常用的单位含义：

- `em`：相对于当前字体大小
- `rem`：相对于 `<html>` 元素的字体大小
- `ch`：表示当前字体中字符“0”的宽度。在等宽字体中，每个字符宽度相同，这个单位很有用
- `vw`：视口宽度的百分比（100vw = 窗口宽度）
- `vh`：视口高度的百分比（100vh = 窗口高度）



> 为什么字体相关单位很有用？

Sol：我们看一个例子，

![55860955750](/Users/mac/Downloads/gif/6.4500/55860955750.gif)

通过`Shift` + ↑， 可以快速增大字体大小。注意，此时其他样式（如 padding、line-height、border-radius 等）会显得相对过小、不成比例。如果我们使用字体相关单位，就可以让所有元素一起自适应变化。
现在我们的按钮只需要通过修改一个参数，就能整体等比例缩放。甚至我们还可以把 `font-size` 本身也设置为字体相关单位，使其能够随周围的字体大小自动调整。



视口可缩放单位（viewport scalable units）允许我们根据视口大小来缩放文本。[`calc`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) 允许我们对不同单位进行计算。返回值的类型取决于参与计算的单位类型。`min()`、`clamp()` 和 `max()` 可以用来为数值设置上下界，它们也可以参与 `calc()` 表达式。 这些函数当然可以组合使用，例如 `min()` 可以嵌套在 `calc()` 中，反过来也可以。

```css
width: calc(100% - 30px);
```

需要注意的是，与 Python 或大多数编程语言不同，这些计算会在任何变化发生时重新计算（例如视口大小或字体大小发生变化时）。



**百分比**

```css
width: 50%
```

表示宽度占容器的50%

## 选择器

选择器是告诉浏览器这条规则作用于哪些元素，在这个例子中是`<h1>`标题元素

```css
h1 {
  font-size: 300%;
  line-height: 1;
}
```

通用选择器（universal selector）允许我们将某些声明应用到页面中的每一个元素。

它可以用于重置（undo）浏览器默认样式，但也非常危险。例如，`* { font-weight: normal }` 看起来像是一个合理的默认设置，但这也意味着我们的 `<strong>` 元素同样会从非加粗的基础样式开始显示。



### 伪类

### 伪元素

