---
title: 前端框架：响应式编程与 Vue
type: lecture
lecture: 13
tags: []
status: complete
---
# Lec 13 前端框架：响应式编程与 Vue

官方课件：[Front-End Frameworks with Vue](https://61040-fa25.github.io/assets/lecture-notes/reactive-programming-10-20.pdf)。前端的本质是：状态变化后，界面自动保持一致；不要把所有事件都写成手工修改 DOM 的分支。

## 从命令式事件到响应式状态

浏览器通过事件循环处理点击、HTTP 响应和定时器。命令式代码常直接操作元素：点击按钮就显示/隐藏某块页面；状态一多，事件处理器会彼此覆盖，界面很容易不同步。

响应式框架把 UI 看成状态的函数：`view = f(state)`。事件只改变状态；框架根据依赖关系重新渲染需要更新的部分。这样可从当前状态推导界面，而不是追踪“此前哪些 DOM 操作发生过”。

课件以侧边栏为例：若 Toggle 按钮直接改 `Sidebar.style.opacity`，状态散落在按钮、组件和 DOM 中，既破坏封装又产生副作用；再加文本框、滑块等控制时，彼此触发的 listener 甚至可能无限循环。响应式数据流改为声明 `opacity` 依赖于哪些 reactive values；输入变化沿依赖图传播，并按拓扑顺序更新。这样侧边栏自己持有状态，依赖也一目了然。

事件流可理解为持续到来的数据，而不是每次临时捕获的孤立事件；实际框架通常把它藏在 reactive variable 背后，暴露其最新值和依赖关系。

## Vue 的基本分工

- **响应式状态**：`ref` / `reactive` 保存会驱动视图变化的数据；状态应是单一事实来源。
- **模板**：插值、`v-if`、`v-for`、属性绑定描述状态如何映射为 DOM。
- **事件**：`@click` 等调用动作来更新状态；不要在模板里塞复杂业务逻辑。
- **组件**：封装可复用视图与局部状态；通过 props 向下传数据、通过 emits 向上报告意图。
- **异步数据**：请求有 loading、success、error 三种可见状态；响应先后顺序也要处理。

## 设计检查

每个页面先写出它需要的状态和允许的事件；派生数据用计算属性表达，不复制成第二份可变状态；列表为每项提供稳定 key；服务端仍是权限与真实状态的权威，客户端状态不可被信任。

## 配套作业：Assignment 4b — Front End Checkin / Complete

分两个检查点：**Front End Checkin**（10 月 21 日截止）与 **Front End Complete**（10 月 28 日截止）。官方作业页：[Assignment 4b](https://61040-fa25.github.io/assignments/assignment-4b)。

这个作业要求学生把 Assignment 4a 里已经实现的后端概念接上前端：用本讲学的响应式思路（状态驱动视图、组件封装、props/emits 通信）搭建 Vue 页面，调用后端 API，完成端到端可用的界面。Checkin 阶段验收的是基础页面骨架和至少一个功能闭环是否跑通；Complete 阶段验收的是前端是否覆盖了项目里预期支持的核心用户旅程，并处理好加载/成功/失败三种异步状态。

对应的 Recitation 8（Visual Design）整理在 [lec14.md](./lec14.md) 文末，因为它更贴近视觉设计这一讲的主题。
