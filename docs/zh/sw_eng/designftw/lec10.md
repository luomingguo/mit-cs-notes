# Lec 10 布局

- 定位
- 浮动元素
- 一维布局
- 网络系统





## 定位



有几个属性对于这些盒子的尺寸计算非常关键：

- `padding`（内边距）控制的是元素内容到元素边缘之间的间距。
- `margin`（外边距）指定的是元素边缘与周围其他元素之间的距离，它甚至可以是负值，这样元素会更靠近其他元素，而不是更远。

- `border`（边框）允许你为元素设置可见边框，它位于 `padding` 的外侧。

- `padding` 和 `border` 的宽度会被加到 `width` 和 `height` 上，而不是从中扣除。

- `outline`（轮廓）、阴影等效果不会以任何方式影响盒子的实际尺寸。

- 始终要使用足够的 `padding`，否则文字会让人阅读起来不舒服。正如你在图形设计课程中学到的那样，通常水平方向需要的内边距会比垂直方向更多。



块级元素：

- 从上到下排列
- 元素前后会自动换行
- 盒子宽度会占满所有可用空间
- 盒子高度由其内容决定（内容会自动换行）
- 文本会在盒子内部换行
- 我们可以设置 [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width), [`height`](https://developer.mozilla.org/en-US/docs/Web/CSS/height), [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)



行内元素：

- 按从左到右的方式排列
- 与周围文本处于同一行
- 盒子的宽度由内容决定
- 盒子的高度通常只有一行高
- 文本换行是通过盒子被拆分到多行中实现的
- [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width), [`height`](https://developer.mozilla.org/en-US/docs/Web/CSS/height), [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)  属性不起作用



行内块级元素（inline-block）：

- 按从左到右的方式排列
- 与周围块处于同一行
- 盒子的宽度由内容决定

- 盒子宽度会占满所有可用空间
- 盒子高度由其内容决定（内容会自动换行）
- 文本会在盒子内部换行
- 我们可以设置 [`width`](https://developer.mozilla.org/en-US/docs/Web/CSS/width), [`height`](https://developer.mozilla.org/en-US/docs/Web/CSS/height), [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin)



**替换元素（Replaced elements）**

理论上： 替换元素指的是一种元素，它的具体呈现内容不由 CSS 本身控制，而是来自外部资源或浏览器内部机制。

它们在布局中的行为通常类似于 `inline-block`，会与周围内容一起排布；但它们内部的内容不会受到当前文档样式的影响。

只有替换元素才可能拥有固有尺寸和固有宽高比。常见的替换元素有：

- `<img>`
- `<video>`
- `<iframe>`
- `<canvas>`
- `<input>`





**定位元素**

定位元素（positioned element）指的是任何 `position != static` 的元素。也就是说，只要元素的 `position` 不是默认的 `static`，它就是“定位元素”。

使用偏移属性来控制定位元素的位置，这些偏移属性包括`top、right、bottom、left`

使用相对定位的元素，仍然会占据原来的空间，但可以通过偏移属性移动自己的显示位置

绝对定位元素会让元素脱离正常文档流，并覆盖在其他内容之上。



## 锚定定位





## 网格系统

在平面设计中，就像在建筑中一样，成品的核心部分是由一个底层支撑结构支撑的，这个结构通常对观众来说是不可见的，但它却能轻易地成就或毁掉一个设计。

网格无处不在。

![img](https://media-s3-us-east-1.ceros.com/ceros-marketing/images/2016/10/24/ddad31747373bd0169a985ebbd60cad2/poster.jpg?imageOpt=1&fit=bounds&width=510) 

![image-20260513085011442](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513085011442.png)

![image-20260513085043230](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513085043230.png)

![image-20260513085112703](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513085112703.png)



**在Web，网格必须灵活**

![flexible-grid](/Users/mac/Downloads/gif/6.4500/flexible-grid.gif)



### 如何做？

`display: grid` 会在一个元素上启用网格布局。这个元素会变成“网格容器”，它的子元素则称为“网格项”。

`display: grid` 本身并不会产生太多效果，你还需要定义网格模板（Grid template）。可以使用多种属性来完成，例如：

- `grid-template-rows`：定义行
- `grid-template-columns`：定义列
- `grid-template`：同时定义行和列的简写方式
- ……以及更多相关属性

`fr` 单位允许我们以“分数”的方式分配可用空间，而不需要使用百分比进行复杂计算

`gap` 属性可以设置网格单元之间的间距。

`grid-row` 和 `grid-column` 属性可以用来将元素放置到指定的行或列中。注意，多个元素可以被放在同一个网格单元格中，此时它们会发生重叠。

```css
body {
  display: grid; 
   
}
```



其他属于

- 网格槽（Gutter）： 网格中行与列之间的空隙。
- 网格列： 网格中的一条垂直轨道。
- 网格行： 网格中的一条水平轨道。
- 网格轨道（Grid track）：网格中两个网格线之间的空间，可以是水平的也可以是垂直的。
- 网格区域（Grid area）： 一个网格区域可以包含任意数量的网格单元格。



![image-20260513091742408](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260513091742408.png)



定义命名区域是指定网格布局的另一种方式。`grid-area` 可以让你把一个元素分配到某个命名区域中。之后，只需要修改网格模板，就可以重新排列网格中的元素！