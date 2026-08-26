---
title: 语义（作用域 Scopes）——帧栈与块作用域
type: lecture
lecture: 9
tags: []
status: complete
---
# Lec 9 语义（作用域 Scopes）——帧栈与块作用域

> 开启**闭包 (Closures)** 单元。路线：作用域（栈）→ 长寿作用域（链式栈）→ 函数
> 记号：把求值关系从"帧 + 堆"升级为"**帧栈 (stack)** + 堆"

---

## 1. 什么是闭包（Closure）

各语言里都有它：Python `lambda x,y: x+y`、JS `(x,y)=>{...}`、C++ `[](int x,int y){...}`、Java `(x,y)->{...}`。

::: definition 定义（闭包）
闭包 = **一个函数 + 一个用于运行它的作用域 (scope)**。两个性质：

- **一等公民 (first-class)**：闭包是一个**值**，可存变量、传递、返回；

- **高阶 (higher-order)**：函数可把闭包当作参数。
:::

::: example 例题（闭包捕获并修改外层变量）
```text
var x = 1;
var f = fun() { x = 2; };
print(x);                 // 1（f 还没调用）
var g = fun(h) { h(); };
print(x);                 // 1
g(f);                     // 通过高阶函数 g 调用 f，f 修改了捕获的 x
print(x);                 // 2
```

输出 **1, 1, 2**。闭包 f 捕获了定义处的作用域（含 x），即便经由 g 间接调用，改的仍是同一个 x。
:::

> 用途：回调 (callbacks)、匿名辅助函数。理解闭包要先理解**作用域**——这正是本讲主题。

---

## 2. 作用域问题（Scoping）

::: definition 定义（作用域 Scope）
作用域是一个**持有一组变量的上下文**。核心问题：一处对 `x`、`y` 的引用，究竟指向**哪个**声明？（局部变量？参数？外层块？字段？静态变量？）
:::

不同声明位置（局部、参数、嵌套块、类字段、静态字段）会让同名引用指向不同实体——需要一套明确的查找规则。

---

## 3. 块作用域（Block Scopes）

::: definition 定义（块作用域）
用花括号 `{}` 引入一个**新的局部帧（作用域）**。`var` 在**当前帧**声明一个新变量；不带 `var` 的赋值则修改**已存在**的变量。这提供用户可控的作用域，也是其他语言构造的基本积木。
:::

::: example 例题（var 声明 vs. 普通赋值）
```text
var x = 1;          var x = 1;
{                   {
  var x = 2;          x = 2;
  print(x);           print(x);
}                   }
print(x)            print(x)
输出: 2, 1          输出: 2, 2
```

左：块内 `var x` 在新帧里**新建/遮蔽**一个 x，块结束后外层 x 仍是 1。
右：块内 `x=2` **修改**外层已有的 x，故块后也是 2。
:::

### 3.1 块作用域作为积木：for 循环的语法糖

```text
for (int i = 0; i < n; ++i) { ... }
≡
{ int i = 0; while (i < n) { ... ++i; } }    // 把 i 限制在块作用域内
```

带 `int i`（声明）则 i 局部于块；不带声明（`for(i=...)`）则用外层 i。

---

## 4. 表示选择：帧栈（Stack of Frames）

块作用域可用"每变量多绑定"或"多个帧"实现。MITScript 用后者——**一个帧栈**：

::: definition 定义（帧栈与查找）
状态 = **帧栈 stack**（每帧是"变量 → 地址"的映射）+ **堆 heap**（地址 → 值）。

- 进入块：**压入**一个新帧；离开块：**弹出**该帧。

- `var x`：在**栈顶帧**加绑定。

- 查找变量 x（lookup）：从**栈顶帧向下**逐帧搜索，返回首个含 x 的帧中的地址。

- 赋值 x = e（update）：用 lookup 定位 x 所在帧，更新其绑定指向新值地址。
:::

求值关系升级为 <span>$\langle e, \text{stk}, h\rangle \Downarrow \langle a, h'\rangle$</span>（栈在求值中不被表达式改变结构，但块语句会压/弹帧）。

---

## 5. 推理规则（带栈与堆）

::: definition 定义（表达式：变量引用 = 查找）
$$\frac{\text{lookup}(\text{stk}, x) = a}{\langle x, \text{stk}, h\rangle \Downarrow \langle a, h\rangle}$$
其中 lookup 从栈顶向下搜索第一个绑定 x 的帧。整数常量、一元负号等与 L8 类似（常量分配新地址）。
:::

::: definition 定义（语句：块作用域 = 压栈/弹栈）
进入块时压入新空帧 $\varnothing$，对块体求值，结束后**弹出**该帧（其局部变量随之离开作用域）：
$$\frac{\langle s,\ \varnothing :: \text{stk},\ h\rangle \Downarrow \langle f' :: \text{stk}',\ h'\rangle}{\langle \{\,s\,\},\ \text{stk},\ h\rangle \Downarrow \langle \text{stk}',\ h'\rangle}$$
**var 声明**在栈顶帧加绑定；**赋值 update** 用 lookup 定位后改绑定。
:::

::: example 例题（同帧重复 var）
```text
{ var x = 1; var x = 2; }
```

第二个 `var x` 在同一栈顶帧再次声明——后者覆盖前者的绑定（具体行为依语言规则而定）。
:::

---

## 6. 综合示例：作用域 + 堆地址联动

::: example 例题（管理作用域，堆地址演化）
```text
1: var f = 0;
2: {
3:   var x = 1;
4:   f = 5;
5: }
```

<table>
<tr><th>行</th><th>栈（顶→底）</th><th>堆 h</th></tr>
<tr><td>1</td><td>[ {f:100} ]</td><td>{100:0}</td></tr>
<tr><td>2</td><td>[ {}, {f:100} ]（压新帧）</td><td>{100:0}</td></tr>
<tr><td>3</td><td>[ {x:101}, {f:100} ]</td><td>{100:0, 101:1}</td></tr>
<tr><td>4</td><td>[ {x:101}, {f:102} ]（f 改指 102）</td><td>{100:0, 101:1, 102:5}</td></tr>
<tr><td>5</td><td>[ {f:102} ]（弹出块帧）</td><td>{100:0, 101:1, 102:5}</td></tr>
</table>

要点：① `f=5` 先把常量 5 分配到新地址 102，再让外层帧的 f 改指 102（旧的 100:0 成垃圾）。② lookup 时 `f` 不在栈顶块帧、向下在外层帧找到。③ 块结束弹帧，`x`(101) 离开作用域、其堆对象成垃圾。
:::

---

## 7. 本讲小结

- 闭包 = 函数 + 作用域；一等、高阶；捕获的外层变量可被读写（输出 1,1,2 例）。
- 作用域决定引用指向哪个声明；块作用域用 `{}` 引入新帧，`var` 在栈顶帧声明、裸赋值修改已有变量。
- 实现用**帧栈** + 堆：进块压帧、出块弹帧；lookup 从栈顶向下搜索；for 循环是块作用域的语法糖。
- 求值关系升级为 <span>$\langle e, \text{stk}, h\rangle\Downarrow\langle a,h'\rangle$</span>；块语句规则压入空帧、求值、弹出。
- 下一讲：长寿作用域（链式栈）与函数/闭包的语义——为什么栈不够、需要把作用域放到堆上链起来。
