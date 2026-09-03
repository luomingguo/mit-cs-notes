---
title: 'Vue 响应式模板'
type: concept
tags: [vue, reactive-programming, template-rendering, data-binding]
status: complete
---
# Vue 响应式模板

## TL;DR

- Vue 将 JavaScript 数据对象与 HTML 模板建立响应式关系，数据变化会触发依赖该数据的界面更新。
- 插值和属性绑定负责读取数据，v-model 提供表单双向绑定，v-for 与 v-if/v-show 控制列表和条件渲染。
- v-on 及其简写 @ 连接用户事件与动作，计算属性复用派生值，方法则封装可产生副作用的操作。
- v-if 会移除 DOM 节点，v-show 只切换可见性；选择时应考虑切换频率和初始化成本。

## 响应式模板的数据模型


Vue 是一个使用**响应式模板**（*templates*）将应用数据渲染为 HTML 的库。数据以 JavaScript 对象的形式表示；你可以在[这里](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Basics)阅读 JavaScript 对象模型与语法。每个 Vue 应用都关联一个特定的 JavaScript 对象。每当该对象发生变化，模板就会自动用新数据重新渲染页面。

本文档使用如下数据对象作为示例：

```js
{
    first_name: "John",
    last_name: "Smith",
    age: 25,
    pets: {
        cats: 4,
        dogs: 2,
        ducks: 3
    },
    children: [
        { first_name: "Jason", age: 7 },
        { first_name: "Ajax", age: 12 }
    ]
}
```

## 模板语法

`{{ foo }}` 用于在文本中输出响应式表达式， `:attrname="foo"` 用于设置HTML属性的值。

表达式可以是任意JavaScript代码，并可以引用关联数据模型中的属性。例如 `{{ pets.cats + pets. dog}}`  会渲染数字9，并在任意pets字段变化时自动更新。注意必须写 `pets.cats`，而不能只写 `cats`，Vue 应用的作用域根是整个对象。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#vue-is-reactive)
- [Vue 官方文档](https://vuejs.org/guide/essentials/template-syntax.html)

### `v-model`

将数据与表单元素（或支持它的自定义元素）关联，并保持双向同步。例如 `<input type="number" v-model="pets.ducks"/>` 会创建一个数字输入框，改变其中的数值会同步修改数据对象中 `pets.ducks` 的值。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#vue-is-reactive)
- [Vue 官方文档](https://vuejs.org/guide/essentials/forms.html)
- [Vue 官方参考](https://vuejs.org/api/built-in-directives.html#v-model)

### `v-for`

通过重复模板来渲染列表数据。

```html
<span v-for="(child, i) in children">
    {{ child.first_name }} ({{ child.age }})
</span>
```

会被渲染为

```html
<span>Jason (7)</span>
<span>Ajax (12)</span>
```

当前项（上例中的 `child`）和当前索引（上例中的 `i`）相当于局部变量，名称由你自定义。注意在本例中 `v-for="child of children"` 同样有效：在 `v-for` 中，`in` 和 `of` 可以互换使用；如果不需要引用索引，也不必使用 `(child, i)` 的语法。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#vue-lists)
- [Vue 官方文档](https://vuejs.org/guide/essentials/list.html)
- [Vue 官方参考](https://vuejs.org/api/built-in-directives.html#v-for)

### 条件渲染：`v-if` 与 `v-else`

当条件为假时，从 DOM 中移除该元素。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#vue-lists)
- [Vue 官方文档](https://vuejs.org/guide/essentials/conditional.html)
- [Vue 官方参考](https://vuejs.org/api/built-in-directives.html#v-if)

### `v-show`

当条件为假时，隐藏该元素（但不从 DOM 中移除）。

- [Vue 官方文档](https://vuejs.org/api/built-in-directives.html#v-show)

### 事件动作（`@eventname` / `v-on:eventname`）

在某个事件发生时修改数据。可以调用一个函数（如 `@click="addItem()"`），也可以直接在属性值中写操作逻辑（如 `@click="list.push({})"`）。

还可以使用修饰符，例如监听 Enter 键按下：`@keyup.enter="doSomething()"`。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#vue-actions)
- [Vue 官方文档](https://vuejs.org/api/built-in-directives.html#v-on)

常用事件：

| 事件名         | 说明                                                         |
| -------------- | ------------------------------------------------------------ |
| `click`        | 点击                                                         |
| `input`        | 表单输入变化（如拖动滑块时持续触发）                         |
| `change`       | 表单输入完成变化（如松开鼠标后触发）                         |
| `keyup`        | 键盘按键抬起                                                 |
| `keydown`      | 键盘按键按下                                                 |
| `pointerenter` | 鼠标指针移入元素                                             |
| `pointerleave` | 鼠标指针移出元素                                             |
| `focus`        | 元素获得焦点                                                 |
| `blur`         | 元素失去焦点                                                 |
| `submit`       | 表单提交。通常配合 `.prevent` 修饰符阻止默认行为（如 `@submit.prevent="doSomething()"`），否则浏览器会跳转页面 |

- [所有事件完整列表](https://developer.mozilla.org/en-US/docs/Web/Events)

### 计算属性

为响应式表达式命名，以便复用。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#calc-abstractions)
- [Vue 官方文档](https://vuejs.org/guide/essentials/computed.html)

### 方法

自定义函数，可在表达式中调用。方法与计算属性类似，可以计算值，但不同之处在于方法还可以修改数据。

- [入门幻灯片](https://designftw.mit.edu/lectures/html/#calc-abstractions)
- [Vue 官方文档](https://vuejs.org/guide/essentials/computed.html)

::: insight
响应式模板的价值不是省略 DOM API，而是把界面声明为状态的函数。数据绑定越清晰，开发者越容易从“当前状态是什么”推导页面，而不必追踪一连串命令式修改。
:::
