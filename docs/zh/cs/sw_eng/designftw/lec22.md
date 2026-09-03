---
title: '动画与反馈'
type: lecture
lecture: 22
tags: [animation, motion-design, interaction-feedback, web-accessibility]
status: draft
---
# Lec 22 动画与反馈

## TL;DR

- 动作会快速吸引注意力，动画速度、位置变化和触发情境必须服务于用户当前任务。
- 过渡在属性值变化之间插值，关键帧动画则能定义多个状态、迭代、方向和时间函数。
- 高频操作中的装饰动画会累积等待成本，应保持简短并尊重减少动态效果等可访问性偏好。
- 源笔记尚未展开 @property 的完整用法和动画可访问性实现，因此该讲仍为草稿。

## 动画的任务边界


本节主题关于

- 为什么 & 何时使用动画
- 实现动画

## 理解动作

一个良好的动作效果设计可以传达如下信息：

- 各个元素之间有什么关系？
- 可以进行哪些操作？
- 我的操作导致了什么后果

说到元素之间的关系，动效设计可以用来传达层级结构（hierarchy）。在这里，动画体现了父元素（如收件箱 inbox）与子元素（收件箱中的邮件 inbox message）之间的层级关系。

https://designftw.mit.edu/lectures/animation/videos/hierarchy-parentchild.mp4

**反馈**

动效可以提供及时反馈（feedback），并显示用户或系统操作的状态。

当动画元素对键盘输入做出响应时，它可以通过反馈来表明该操作是否成功。“摇头（shaking head）”是一种隐喻，用来表达“否定”或“操作失败”的含义。

![image-20260509173631280](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260509173631280.png)

**占位**

动画列表项作为占位符，用来表示内容正在加载中

![image-20260509173809850](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260509173809850.png)

> [!IMPORTANT]
>
> 人在周边视觉中感知到的运动，会触发一种由刺激驱动的注意力转移，这属于自下而上加工（bottom–up processing）。
>
> 这与目标驱动的注意力转移（top–down processing）形成对比，在后者中，人会主动、有意识地将注意力集中到某个感兴趣的区域。
>
> 这种对“运动即注意”的本能反应，可以追溯到远古时期——人类需要快速察觉草丛中的蛇，或其他潜在的危险与猎物。
>
> 在网页中，“周边区域”通常指的是阅读的 F 型浏览模式之外的区域。右侧栏中闪烁的图片和视频广告，就是利用周边动画来实现商业目的的典型例子（但这种过度使用会导致“横幅盲视”和“右侧栏盲视”）。即使是出于善意的动画，也可能变得分散注意力甚至令人厌烦（比如 Clippy，我们都懂）。
>
> 屏幕边缘出现的通知，用来提示相关功能、最近活动或在线聊天功能等，也是周边动画的例子。它们本意是提醒用户关注相关内容，但在实际体验中，往往和弹窗一样具有干扰性和令人不适的效果。
>
> — NNGroup (“Animation for Attention and Comprehension”)

![86926325541](/Users/mac/Downloads/gif/6.4500/86926325541.gif)

> [!IMPORTANT]
>
> 视觉注意力在周边视野中转向一个移动物体的速度，取决于该物体被感知为“具有生命性”（animacy）的程度。
>
> 影响这种“生命感知”的因素包括：
>
> - 物体移动速度的增加
> - 位置变化的幅度（移动距离的大小）
> - 这种运动是否看起来是“自我驱动的”（self-propelled），而不是由外部碰撞等因素引起的
>
> 这些因素都会影响人们对“它像不像一个有生命、主动在移动的物体”的判断。这意味着：
>
> 任何以“滑入（slide in）”或其他位置变化方式出现的界面元素，不管速度快慢，都会比“慢慢淡入（fade in）”的元素更快吸引用户注意力。

[页面](https://designftw.mit.edu/lectures/animation/videos/Fade-BackToTopElement.mp4)右侧边缘的箭头按钮会在用户向下滚动页面时逐渐淡入（fade in），用于返回页面顶部。

这种缓慢的动画，并且不涉及位置移动，相比[前一个例](https://designftw.mit.edu/lectures/animation/videos/SlideUp-BackToTopElement.mp4)子中的“滑入动画（slide-in）”，对视觉的干扰要小得多。

当然，还有另一种解决方案：可以将该链接始终固定在页面中的某个位置，这样可以避免动画可能打断用户浏览商品这一任务的注意力。

### 选择合适的动画

较慢的过渡动画：更不容易引起注意力转移，也更不容易造成干扰。适用于那些由用户间接触发，或并非由用户主动发起的动画。

较快的动画： 在用户注意力不在该区域时，更容易吸引注意力。适用于那些重要的元素，需要用户关注并采取行动的情况。

要考虑当前情境以及用户的情绪。

下面是来自 Mac 代码编辑器 Espresso 的一个例子：当使用“跳转到某一行（Go to line…）”功能时，在编辑器实际滚动到目标行之前，会先播放一个弹出窗口消失的动画。这个动画并没有传达任何信息，本质上只是装饰性的。

虽然这种动画在某些情况下可能会让人感到愉悦，但在调试场景中，用户通常已经处于挫折状态，并且目标导向非常强。他们没有时间去“欣赏设计”，而是希望尽快完成任务、继续前进。随着需要查找的行数增加，用户对这种无意义动画的容忍度会进一步下降。

---

动效可以用来强调用户旅程中的关键时刻，为常见的交互增添个性，并能够体现品牌的风格

[图标内的动感](https://designftw.mit.edu/lectures/animation/videos/icons-owl.mp4)

[Newton Running](https://designftw.mit.edu/lectures/animation/videos/Menu-SlowRepeatedAnimation.mp4 )的主菜单是在一段较长的动画序列结束时才被展示出来的，而当用户选择某个选项后，这段动画还会再倒放一遍。

因此，每当用户想要使用主菜单时，都必须再次经历完整的动画过程。这种多余的、没有实际目的的动画会降低用户继续与网站交互的意愿，因为它无谓地浪费了本可以用来浏览实际内容的宝贵时间。

这个故事告诉我们： 不要妨碍用户。要考虑在一次典型访问中某个操作的出现频率， 对于高频使用的动画，应尽量保持非常简短。

## 实现动画

### 过渡

![image-20260515031829173](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260515031829173.png)

[`transition`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)  会在可能的情况下，让样式变化变得平滑。 他实际是[`transition-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-duration)，[`transition-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-delay)，[`transition-property`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-property)，[`transition-timing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function)的简写形式。它至少需要一个持续时间，但也可以接受属性、延迟、缓动函数。

![image-20260515032242823](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260515032242823.png)

`transition` 以及它的各个长属性都支持逗号分隔列表，从而可以为不同属性创建具有不同参数的多个过渡效果。关键字的变化无法进行插值（interpolate），但长度、数值、颜色、变换等可以。

对于自定义缓动函数，可以使用 `cubic-bezier()` 函数。[cubic-bezier.com](https://cubic-bezier.com) 可以帮助你以可视化方式生成这些曲线。

小结： **Transitions 会把突然的值变化转换为平滑的变化**。

### 动画

如果我们想要更多的控制呢？ 动画。

动画比过渡更加复杂，但能给我们更多的控制能力。

我们使用 [`@keyframes`](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes)  规则来定义动画，使用[`animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)属性将动画应用到元素上。而`animation` 属性实际上是以下属性的简写：

- [`animation-name`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name)：运行哪个动画？
- [`animation-duration`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration)： 每次动画迭代持续多久？
- [`animation-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay)： 开始前是否需要延迟？
- [`animation-iteration-count`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count)： 播放多少次？（数字或 `infinite`）
- [`animation-timing-function`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function)： 动画应如何随时间推进？
- [`animation-direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction)： 某些迭代是否需要反向播放？
- [`animation-fill-mode`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode)： 在动画应用前后应如何表现？
- [`animation-play-state`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state)：动画是否暂停？

![image-20260515033155268](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260515033155268.png)

一个动画至少需要名称和持续时间才能播放。所有动画属性都支持逗号分隔的参数列表，从而可以在同一个元素上应用多个动画。

我们可以通过 `animationstart`、`animationiteration` 和 `animationend` 事件来监控 CSS 动画的执行过程。

```css
@keyframes jump {
	to { transform: translateY(-.4em); }
}

button:hover {
	animation: jump 250ms 10 alternate;
}

```

小结： **CSS 动画允许我们创建能够经过任意数量自定义状态的运动效果**。

为了能够进行插值，所有中间值都必须能够用 CSS 表示

![image-20260515133602401](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260515133602401.png)

![74864443654068](/Users/mac/Downloads/gif/6.4500/74864443654068.gif)

这里并没有真正发生动画，因为自定义属性默认是不能被动画化的。不过，我们可以通过 `@property` 规则来“教会”浏览器如何对它们进行动画处理。

> 当前源笔记尚未展开 `@property` 的完整用法与动画可访问性实现。
