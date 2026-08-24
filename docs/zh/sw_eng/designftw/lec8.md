---
title: CSS 基本概念 II
course: 6.4500 Web设计：语言和用户接口
course_id: '6.4500'
lecture: 8
kind: design
tags: []
status: complete
---
# Lec 8 CSS 基本概念 II

本节将学习：

- 继承
- 级联
- 简写
- DRY 原则
- 级联变量的自定义属性

## 继承

注意， `<p>`、 `<em>`和`<mark>`元素的字体、自豪和颜色都与他们的父元素`<body>`相同。

如果我们给`<body>`添加边框会发生什么？ 边框也会被继承？

![image-20260512125556429](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512125556429.png)

答案是不会， 有些属性会继承，而有些并不会。

下面列举常见的，会/不会继承的属性

![image-20260512125651737](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512125651737.png)

我们也可以通过改变全局关键字来改变默认行为

```css
border: inherit;
font-size: initial;
```

## 级联

我们知道 CSS 的全称是 **Cascading Style Sheets**。 [The Cascade on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade)

什么是级联？ 就是定义如何解决冲突的算法。

举个例子，下面哪个写法会生效？

```css
h1#title {
	color: red;
}
/* vs */
* {
	color: blue !important;
}
```

元素的文字将是 blue。 原因，虽然`#title`的选择器优先级高，但是`!important`会提高声明优先级。

**参数**

- 重要性： 是否使用了 `!important`？
- 来源： 样式来自 User Agent（浏览器默认样式）、User 还是 Author
- 特异性（Specificity）：用于计算哪个选择器更具体的评分规则
  - 是一种启发式规则，用于从查询逻辑中推断优先级的重要性。
- 顺序（Order）：后面的规则优先于前面的规则
- 继承（Inheritance）：直接应用的样式优先于继承得到的样式
- 作用域接近性（Scoping proximity）：如果使用了 `@scope`，则会考虑作用域距离
- 层叠层（Cascade layer）：如果使用了 `@layer`，则会考虑所在层叠层的优先级

**补充来源参数的细节**

Author 样式表通常比 UA 具有更高优先级，UA 样式只是那些没有定义任何 CSS 的网页的后备默认样式

User 的优先级位于两者之间，这个想法并没有真正流行起来，于是浏览器后来移除了相关 UI，这项能力依然可以通过扩展实现，例如 Stylus

有趣的事实：在 `!important` 规则下，这个优先级层级实际上是反过来的。也就是说，浏览器默认样式中的 `!important` 规则会优先于网站的 `!important` 规则，因此无论你怎么写，都无法覆盖它。

![image-20260512132836514](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512132836514.png)

在同一个元素上，Author 写的样式会覆盖 UA 样式

### 计算特异性

CSS 通过选择器特异性来解决冲突，而不是通过代码的先后顺序。特异性的计算方式如下：

1. A = 选择器中 id 的数量
2. B = class 选择器、属性选择器以及伪类的数量
3. C = 标签选择器的数量
4. 比较特异性时，按顺序逐项比较这三个组成部分：先比较 A 值，A 值更大的特异性更高； 如果 A 值相同，再比较 B 值，B 值更大的特异性更高；如果 B 值也相同，再比较 C 值，C 值更大的特异性更高；如果三个值都相同，则两个特异性相等。

如果特异性相同，则通过源码顺序来解决冲突。

**特异性的特殊情况**

| 选择器                    | 特异性    |
| ------------------------- | --------- |
| `style="background: red"` | (∞, ∞, ∞) |
| `:not(em, strong#foo)`    | (1, 0, 1) |
| `:is(em, #foo) `          | (1, 0, 0) |
| ``:where(em, #foo)``      | (0, 0, 0) |

- style 属性中的声明具有无限特异性
- 以选择器作为参数的伪类（例如 `:not()`、`:is()`）不会像普通伪类那样计入特异性计算
- `:where()`，无论其参数是什么，其特异性始终为 0

举个例子，

`#container *` vs `div.dox`

```html
<div id="container">
  <p>Hello</p>
  <div>
    <span>World</span>
  </div>
</div>

<div class="box">✔</div>
<div class="box big">✔</div>
<span class="box">❌（不是 div）</span>
<div class="card">❌（没有 box）</div>
```

前者会选中 `<p>、<div>、<span>`， 空格代表子代。 根据，其选择特异性为 100

后者会选中前面两个。  其选择特异性为 010，因此优先级为前者大于后者

**调整特异性**

增加特性的方式：

- 重复：`.foo.foo.foo`
- 反选：`:not(#nonexistent)`

降低特异性

- 将`#foo` 改为 `[id="foo"]`
- `:where()`

### 继承

即使父元素的样式：

- 来自更高优先级来源
- specificity 更高
- 写得更晚

只要是继承过来的，都会被元素自身直接设置的值覆盖

## 简写/展开属性

简写属性是一种 CSS 属性，用来同时表示多个其他属性，也就是它对应的展开属性或组成属性。设置一个简写属性，等价于同时设置它的所有展开属性

![image-20260512164235260](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512164235260.png)

```css
/*下面表达都可*/
border: .3em dotted steelblue;
border: dotted .3em steelblue;
border: steelblue .3em dotted;
```

另外展开属性也可以用简写

![image-20260512164452666](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512164452666.png)

![image-20260512164510671](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260512164510671.png)

### 背景

| 属性                    | 作用             |
| ----------------------- | ---------------- |
| `background-color`      | 背景颜色         |
| `background-image`      | 背景图片         |
| `background-repeat`     | 是否重复         |
| `background-size`       | 背景尺寸         |
| `background-position`   | 背景位置         |
| `background-position-x` | 横向位置         |
| `background-position-y` | 纵向位置         |
| `background-attachment` | 是否随页面滚动   |
| `background-clip`       | 背景绘制范围     |
| `background-origin`     | 背景定位参考区域 |

有些简写属性使用的是“混合语法”：它们的大部分展开属性可以按任意顺序书写，但某些值必须放在另一些值后面，用来避免歧义。

在这种情况下，`background-size` 只能写在 `background-position` 后面，并且要用 `/` 与其分隔

```css
background: url(foo.png) 50% 50% / 100% auto no-repeat gold;
/*分别是：
background-image background-pisition-x background-pisition-y / background-size backgroun-repeat background-color
*/
background: gold no-repeat 50% 50% / 100% auto url(foo.png);
/*分别是：
background-color backgroun-repeat background-pisition-x background-pisition-y / background-size background-image 
*/
```

```css
background: url(cat.jpg)
            0 10% / 100% 100%
            no-repeat
            content-box border-box
            fixed;
background-image: url(cat.jpg);
background-position: 0 10%;
background-size: 100% 100%;
background-repeat: no-repeat;
background-origin: content-box;
background-clip: border-box;
background-attachment: fixed;
```

## DRY 原则

## CSS 自定义属性

CSS 变量（也叫自定义属性）以 `--` 开头，其行为和普通 CSS 属性类似。

我们通过 `var()` 函数读取它们的值，并且几乎可以在任何地方使用（包括 `calc()` 内部），唯一不能使用的地方是 `url()` 中。

它们是动态的，可以在内联样式中设置，甚至可以通过 JavaScript 修改！

CSS 变量可以减少重复代码，从而让代码更容易维护。

它们也有助于封装：其他人可以使用你的组件，并通过你暴露出的变量来自定义样式，而不需要了解或覆盖你 CSS 的内部结构。

注意这里的重复：

我们不得不把按钮颜色重复写 3 次！而修改颜色时，也需要重复修改大量代码。

CSS 变量如何帮助我们减少这种重复，并更容易创建主题样式呢？
