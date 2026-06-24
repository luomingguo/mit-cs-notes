# L16：低级虚拟机 II（Low-Level VM II）——语法制导翻译与控制流图

> 接 L15。本讲讲**怎么把 AST 翻译成字节码**：用**推理规则**（语法制导翻译）逐结构生成指令，把控制流显式化为**控制流图 (CFG)**。与 L2–L5 里"正则表达式→有限自动机"的构造法形成漂亮的类比。

---

## 1. 翻译要做的三件事

`Language → High-Level VM → Low-Level VM → Machine Code`，本讲做的是 `AST → CFG + Instructions`。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语法制导翻译 Syntax-Directed Translation 的三项任务）</strong>
把高级结构翻译成 VM 指令时必须：
<ol>
<li><strong>拆分复杂表达式</strong>为一串简单指令（每条只做一个操作）；</li>
<li><strong>把变量名关联到显式存储位置</strong>（局部槽下标 / 全局名下标 / 常量池下标）；</li>
<li><strong>用跳转把控制流显式化</strong>（if/while 不再是嵌套结构，而是带条件跳转的基本块图）。</li>
</ol>
本质：<strong>AST → CFG + Instructions</strong>。
</div>

我们用一个最小语言（"Simple Language"）来讲，它含四种语句构造：

- 顺序组合 (sequential composition) `s1; s2`
- 条件 (if-then-else)
- 循环 (loop / while)
- 赋值 (assignment)

加上无控制流的表达式 `E`（常量、变量、运算）。

---

## 2. 控制流图（CFG）：另一种程序表示

例子程序：

```
while (x > 1) {
  if (x > 10) {
    x = x - 2;
  } else {
    x = x - 1;
  }
}
```

**AST（解析得到）** 是嵌套树：`while` 节点下挂条件 `e` 与循环体 `s`，循环体里又是 `if(e){s1}else{s2}`。

**CFG** 则把它摊平成一张图：

```
        ┌─────────┐
   ┌───▶│  x > 1  │──False──▶ (出口)
   │    └────┬────┘
   │       True
   │    ┌─────────┐
   │    │ x > 10  │
   │    └──┬───┬──┘
   │   True│   │False
   │  ┌───────┐ ┌───────┐
   │  │x = x-2│ │x = x-1│
   │  └───┬───┘ └───┬───┘
   └──────┴─────────┘   (回到 x>1)
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（控制流图 Control Flow Graph）</strong>
CFG 由<strong>基本块 (basic block)</strong> 作为结点、<strong>控制转移</strong>作为有向边组成。
<ul>
<li><strong>基本块</strong>：一段<strong>无内部控制流</strong>的直线指令序列——一旦进入就从头执行到尾，中途不分支、不被跳入；</li>
<li><strong>边</strong>：块末尾的跳转（无条件 / 条件 True / 条件 False）指向后继块。</li>
</ul>
</div>

> **执行模型的转变**：AST 的执行模型是**递归**（解释器递归下降）；CFG 的执行模型是**迭代**（VM 取指—执行—按边跳转的循环）。这正是 L15 说的"从树遍历到线性指令流"的结构基础。

---

## 3. 用推理规则做翻译

核心思想：**翻译规则和语义规则长得几乎一样**。语义规则形如"在某状态下表达式求值到某个值"，翻译规则则形如"某构造翻译到某段指令序列"。

### 3.1 Step 1：为无控制流构造生成基本块

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（基本块生成）</strong>
先定义"无控制流构造"（表达式 E、赋值）的翻译——它们翻译成<strong>一个基本块</strong>。<br>
更精确地：翻译是带状态的——<strong>给定一个常量列表，构造翻译成（更新后的常量列表 + 一个基本块）</strong>。<br>
（因为生成 <code>load_const i</code> 时，需要把字面量加入函数的 constants 池并拿到它的下标 i。）
</div>

这解释了一个实现细节：**`load_const i` 里的下标 `i` 从哪来？** 翻译器维护一个常量池，遇到字面量 `c` 时——若池里已有则复用其下标，否则追加并返回新下标。所以翻译函数的签名概念上是：

```
translate(constants, term) -> (constants', basic_block)
```

### 3.2 表达式翻译规则（举例）

**整数常量 / 加载常量**：把字面量分配进常量池得到 `i`，生成 `load_const i`。

```
// load_const i: 把常量压栈
// Stack: S => S :: f.constants()[i]
```

**变量引用**：根据变量绑定到局部/全局，生成 `load_local i` 或 `load_global i`（具体绑定到哪个存储位置，"稍后再回来讲"——涉及作用域/闭包，见 L17 与 L10/L11）。

**一元负号**：

```
// neg: 整数取负
// Stack: S :: v => S :: (-v)
```

翻译规则：先翻译子表达式得到压栈代码，再追加 `neg`。

**二元加法（其余 sub/mul/div 同理）**：

```
// add: 加法（语义同 Assignment #2）
// Stack: S :: a :: b => S :: op(a, b)   // a 是左值, b 是右值
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（翻译规则 ≈ 语义规则）</strong>
二元运算的语义规则是"分别求值左、右子式，再对两个值做 op"；翻译规则就是"<strong>先翻译左子式（生成压左值的代码），再翻译右子式（生成压右值的代码），最后追加 op 指令</strong>"。求值顺序在语义里规定，在翻译里就体现为<strong>生成代码的先后顺序</strong>——栈式 VM 天然保证操作数顺序正确。
</div>

### 3.3 例：翻译 `1 + 2`

目标：`f = fun(){ return 1 + 2; }` →

```
function {
  local_vars = [],
  constants  = [1, 2, None],
  instructions = [
    load_const 0   # 1
    load_const 1   # 2
    add
    return
  ]
}
```

翻译 `1 + 2` 的步骤：

1. 翻译左子式 `1` → 把 1 加入常量池（下标 0）→ 生成 `load_const 0`；
2. 翻译右子式 `2` → 把 2 加入常量池（下标 1）→ 生成 `load_const 1`；
3. 追加 `add`。

> 注意常量列表是**线程式（threaded）地**穿过整个翻译过程：翻译完左子式后得到的 `constants'` 继续喂给右子式的翻译，保证下标不冲突、字面量可复用。

---

## 4. Step 2：翻译带控制流的语句

语句的翻译规则把子块"接线"成 CFG。三种构造分别对应正则表达式三种运算的自动机构造——这是本讲最重要的类比。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（控制流构造 ↔ 正则→自动机构造的类比）</strong>
<table>
<tr><th>语句构造</th><th>对应的正则运算</th><th>自动机构造类比</th></tr>
<tr><td>顺序组合 s1; s2</td><td>连接 (concatenation)</td><td>把 s1 的出口接到 s2 的入口</td></tr>
<tr><td>if-then-else</td><td>选择 (alternation, |)</td><td>条件分叉成两支，再汇合</td></tr>
<tr><td>while 循环</td><td>Kleene 星 (*)</td><td>条件真则进入体、体末回到条件；条件假则退出</td></tr>
</table>
就像 Thompson 构造把正则表达式逐运算拼成 NFA，语法制导翻译把语句逐构造拼成 CFG。
</div>

### 4.1 顺序组合 `s1; s2`

翻译 `s1` 得到块（及更新后的常量池），再以该常量池翻译 `s2`；把 `s1` 末块的出口边连到 `s2` 的入口块。常量池一路线程传递（"missing constants!" 提醒：别忘了把常量状态传下去）。

### 4.2 if 语句

```
if (cond) { s1 } else { s2 }
```

- 生成 `cond` 的求值代码（压一个布尔到栈）；
- 生成**条件跳转**：真→`s1` 块，假→`s2` 块；
- `s1`、`s2` 末尾都无条件跳到汇合块（join），后续代码从汇合块继续。

> 类比正则的 `s1 | s2`：一个分叉点 + 一个汇合点。

### 4.3 while 语句

```
while (cond) { body }
```

- **条件块**：求值 `cond`；真→进入 `body` 块，假→跳出到出口块；
- `body` 末尾**无条件跳回条件块**。

> 类比 Kleene 星：有一条"返回"边形成回路；CFG 里的回边 (back edge) 正是循环的标志（后面静态分析/优化判定循环都靠它）。

---

## 5. 完整例子的 CFG（贯穿全讲）

回到 §2 的 `while(x>1){ if(x>10){x=x-2}else{x=x-1} }`，翻译产物是一张 CFG：

- 块 A：`x > 1`，条件跳转（真→B，假→出口）；
- 块 B：`x > 10`，条件跳转（真→C，假→D）；
- 块 C：`x = x - 2`，无条件跳回 A；
- 块 D：`x = x - 1`，无条件跳回 A。

每个块内部是一串栈式指令（`load_local / load_const / gt / store_local / 条件跳转`），块之间用跳转边连接——这正是 L15 那台基于栈的 VM 能直接迭代执行的形态。

---

## 6. 与 Crafting Interpreters 的对应（参考补充）

- **第 17 章 Compiling Expressions**：单遍 Pratt parser 直接发射字节码，对应本讲"表达式翻译规则"——常量进常量池、二元运算先发左再发右后发 op。
- **第 21 章 Global Variables / 第 22 章 Local Variables**：变量名→存储位置的解析（全局表 vs. 局部槽下标），对应本讲"变量引用翻译"留的伏笔。
- **第 23 章 Jumping Back and Forth**：用 `OP_JUMP_IF_FALSE`、`OP_JUMP`、`OP_LOOP` 编译 if / while，并用 **backpatching（回填）** 解决"跳转目标地址此刻还未知"的问题——对应本讲 if/while 的接线。
- 书中是单遍即时回填，课程更强调先建 **CFG（基本块图）**再线性化；CFG 表示是后续 L19 优化、L21 寄存器分配、L23 静态分析的共同基础。

---

## 7. 本讲小结

- **语法制导翻译**把 AST 变成 **CFG + 指令**，三件事：拆复杂表达式、变量名绑存储位置、跳转显式化控制流。
- **CFG** 以基本块为结点、跳转为边；执行模型从 AST 的**递归**变为 CFG 的**迭代**。
- 翻译用**推理规则**表达，且与**语义规则同构**；表达式翻译需把字面量加入**常量池**并线程式传递常量状态以拿到 `load_const i` 的下标。
- 三种控制流构造对应正则→自动机的三种构造：**顺序↔连接、if↔选择、while↔Kleene 星**。
- 这为后续把 CFG 线性化、做数据流优化、寄存器分配打下表示基础。下一讲（L17）继续低级 VM 的剩余话题（函数/闭包/调用约定的翻译等）。
