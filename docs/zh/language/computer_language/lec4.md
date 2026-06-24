# Lecture 04：中间表示（OPP）

> 配套复习课：R3 解析器生成器（ANTLR4，见末节）；本讲为 Phase 2 项目（IR + 语义检查）的核心
> 参考：Cooper et al., Ch.5 中间表示；§ 名字空间 / 命名环境

---



## 1. 程序表示的目标（Program Representation Goals）

中间表示 (*intermediate representation, IR*) 服务两大目标：

1. **支持程序分析与变换**：语义检查、正确性检查、优化。
2. **结构化地组织"翻译到机器码"的过程**：把一步到位的翻译拆成若干小步。

典型多级降级流水线：

```
语法树 (Parse Tree)
   │  语义分析 (Semantic Analysis)
   ▼
高层中间表示 (High-Level IR)
   ▼
低层中间表示 (Low-Level IR)
   ▼
机器码 (Machine Code)
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（高层 IR vs. 低层 IR）</strong>
<ul>
<li><strong>High-Level IR</strong>：保留对象结构、保留结构化控制流；首要目标是<strong>分析程序</strong>。</li>
<li><strong>Low-Level IR</strong>：把数据模型搬到<strong>扁平地址空间</strong>，消除结构化控制流；适合低层任务——寄存器分配、指令选择。</li>
</ul>
</div>




## 2. 对象的运行期表示

理解 IR 前，先看程序**运行时**对象在内存里长什么样。以向量类为例：

```java
class vector {
    int v[];
    void add(int x) {
        int i;
        i = 0;
        while (i < v.length) { v[i] = v[i]+x; i = i+1; }
    }
}
```

- **数组表示**：元素连续存储，**第一个字 (first word) 存长度**，随后是元素。
- **对象表示**：第一个字指向**类信息 (Class Info)**——方法表、垃圾回收数据；后续字是对象字段（对 vector，下一个字是数组引用）。



### 2.1 方法调用的活动记录（Activation Record）

执行 `vect.add(1)` 时在栈上**创建活动记录**：
1. 把 `this` 压栈；
2. 把参数（`1` 给 `x`）压栈；
3. 为局部变量（`i`）在栈上留空间。

随后逐句执行 `i=0; while(...) v[i]=v[i]+x; i=i+1;`，数组元素被就地更新（如 `3 7 4 8` → `3 8 5 9`）。

> 编译器要做什么才能让这一切成立？确定对象/数组格式、确定调用栈格式、生成读/写值的代码（this、参数、局部、数组元素、字段）、生成求表达式与控制构造的代码。

---



## 3. 符号表：编译的关键概念（Symbol Tables）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（符号表）</strong>
符号表把<strong>标识符（字符串）映射到描述符（关于标识符的信息）</strong>。基本操作是 <strong>Lookup</strong>：给定字符串找描述符，典型实现是哈希表。
</div>

### 3.1 符号表的层级（Hierarchy）

层级来自两个来源：**嵌套作用域**（局部作用域嵌在字段作用域里）和**继承**（子类嵌在父类里）。**Lookup 沿层级向上查找，直到找到描述符**。

vector.add 内部的查找层级：

```
局部 i  → Locals 符号表
参数 x  → Parameters 符号表（其父为 Fields 符号表）
字段 v  → Fields 符号表
this    → （特殊）this 描述符
```

查 `v[i] = v[i]+x` 中的 `i`：先查 Locals 找到；查 `x`：Locals 没有 → 上溯 Parameters 找到。

### 3.2 各类描述符（Descriptors）内容

描述符存代码生成与语义分析所需信息：

- **局部描述符**：名字、类型、栈偏移（stack offset）
- **字段描述符**：名字、类型、对象内偏移（object offset）
- **方法描述符**：签名（返回值/接收者/参数类型）、对局部符号表的引用、对方法代码的引用

### 3.3 整体符号表结构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（符号表的总体组织）</strong>
<ul>
<li><strong>程序符号表</strong>（类名 → 类描述符）</li>
<li><strong>类描述符</strong>：含<strong>字段符号表</strong>（父表为超类字段符号表）+ <strong>方法符号表</strong>（父表为超类方法符号表）+ 对父类描述符的引用</li>
<li><strong>方法描述符</strong>：含<strong>局部变量符号表</strong>（其父为<strong>参数符号表</strong>，参数符号表父为接收者类的字段符号表）+ 方法代码引用</li>
<li><strong>类型符号表</strong>：基类型描述符（int、boolean）、数组类型描述符（含元素类型引用）、类描述符</li>
</ul>
</div>

---

## 4. 在高层 IR 中表示代码

基本思路：**向汇编靠拢，但保留高层结构**——对象格式、结构化控制流、参数/局部/字段的区分。用汇编的高层抽象：load / store 节点访问**抽象的**局部/参数/字段，而非直接内存地址。

### 4.1 表达式：表达式树（Expression Trees）

内部节点是运算（`+`、`-`…），叶子是 **load 节点**表示变量访问：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（load 节点种类）</strong>
<ul>
<li><code>ldf</code>：字段访问（field descriptor，隐式访问 this）</li>
<li><code>ldl</code>：局部变量访问（local descriptor）</li>
<li><code>ldp</code>：参数访问（parameter descriptor）</li>
<li><code>lda</code>：数组访问（含"数组表达式树" + "下标表达式树"）</li>
<li><code>len</code>：数组长度运算（如 <code>v.length</code>）</li>
</ul>
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（表达式 <code>v[i]+x</code> 的 IR 树）</strong>
<pre>
        +
       / \
     lda  ldp x        // ldp x：参数 x
    /   \
ldf v   ldl i          // ldf v：字段 v；ldl i：局部 i
</pre>
即"取数组 v 的第 i 个元素，再加参数 x"。
</div>

### 4.2 赋值：store 节点

- `stf`：存字段（字段描述符 + 值表达式树）
- `stl`：存局部（局部描述符 + 值表达式树）
- `sta`：存数组元素（数组表达式树 + 下标表达式树 + 值表达式树）

### 4.3 过程调用

`call` 语句引用被调方法的方法描述符，并带参数列表（**this 是第一个参数**）。例 `vect.add(1)`：`call` 节点下挂 `ldl vect`（接收者）与常量 `1`，引用 vector 类方法符号表中 `add` 的方法描述符。

### 4.4 控制流：语句节点

- **sequence 节点**：第一条语句 + 下一条语句
- **if 节点**：条件表达式树 + then 语句节点 + else 语句节点
- **while 节点**：条件表达式树 + 循环体语句节点
- **return 节点**：返回值表达式树

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（<code>while (i &lt; v.length) v[i]=v[i]+x;</code> 的 IR，简记法）</strong>
<pre>
while
 ├─ 条件:  <
 │         ├─ ldl i
 │         └─ len ─ ldf v
 └─ 体:    sta
            ├─ ldf v          // 目标数组
            ├─ ldl i          // 下标
            └─ +
                ├─ lda
                │   ├─ ldf v
                │   └─ ldl i
                └─ ldp x
</pre>
</div>

---

## 5. 从 AST 构建符号表与 IR

- **AST → 符号表**：递归遍历树，访问节点时逐步建立符号表（类→字段/方法→参数→局部）。
- **AST → IR**：递归遍历，**自底向上**构建——在符号表里查标识符 → 建 load 节点 → 用 load 与运算节点组装表达式 → 为赋值建 store 节点 → 把 store 与控制流节点组合。

构建 IR 的三种工程路线：(a) 解析得具体树→转 AST→转 IR；(b) 解析直接得 AST→转 IR；(c) 把 IR 构建直接揉进解析过程。

---

## 6. 继承与动态分派（Inheritance & Dynamic Dispatch）

```java
class point { int c; int getColor(){return c;} int distance(){return 0;} }
class cartesianPoint extends point { int x,y; int distance(){return x*x+y*y;} }
class polarPoint extends point { int r,t; int distance(){return r*r;} int angle(){return t;} }
```

### 6.1 字段布局

每个对象是一段连续内存，**继承层级的字段按顺序排布**：polarPoint 对象 = `[Class Info][c][r][t]`，cartesianPoint = `[Class Info][c][x][y]`。子类字段紧接父类字段之后——保证了"子类对象可当父类用"时父类字段偏移不变。

### 6.2 动态分派问题

```java
Point p;
if (...) p = new point();
else if (...) p = new cartesianPoint(x,y);
else p = new polarPoint(r,t);
y = p.distance();    // 调哪个 distance？
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（动态分派与方法表）</strong>
被调用的方法取决于<strong>接收者的运行期类型 (type of receiver)</strong>。实现机制是<strong>方法表 (method table)</strong>：编译器在每个继承层级内给方法编号（getColor=0, distance=1, angle=2），调用点访问方法表中对应编号的条目。该机制仅适用于<strong>单继承</strong>，不支持多继承、多分派或接口。
</div>

### 6.3 静态查找 vs. 动态查找

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（静态查找与动态查找可能不同）</strong>
<ul>
<li><strong>静态查找</strong>：编译期做，用于类型检查与代码生成；以方法<strong>名</strong>为索引，从接收者<strong>声明类型</strong>的方法符号表起，沿层级上溯，可能跨多张表。</li>
<li><strong>动态查找</strong>：运行期做，用于分派调用；以方法<strong>编号</strong>为索引，<strong>只访问一张表的一个元素</strong>。</li>
</ul>
例：<code>point p = new cartesianPoint(); p.distance();</code> ——静态查找在 point 表里定位 distance（用于类型检查），动态分派实际调用 cartesianPoint 的 distance。
</div>

---

## 7. 补充（R3）：解析器生成器（Parser Generator）

L2–L3 讲的是**手写递归下降（自顶向下）**；与之对偶的工程路线是用**解析器生成器**（自底向上的 LR/LL 工具）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（解析器生成器的取舍）</strong>
<ul>
<li><strong>不用的理由</strong>：通常比手写递归下降慢；复杂语言难以正确指定。</li>
<li><strong>用的理由</strong>：生成"正确"的代码；适合原型；词法/语法错误处理"白送"；无需处理被改造（hacked）的具体语法树，可直接产 AST。</li>
</ul>
</div>

- **ANTLR4**（ANother Tool for Language Recognition）：业界标准，**LL(\*)**——从左到右、最左推导、（近似）无限前看、自适应处理左递归；一份文法可生成多语言目标（Java/Scala、TypeScript、Go、C++、C#、Python、Swift…）。
- Rust 项目推荐用 **Tree-sitter**。

---

## 8. 本讲小结

- IR 的两大目标：支持分析/变换、结构化降级；高层 IR 留结构（分析友好），低层 IR 扁平化（后端友好）。
- 运行期对象 = `[类信息][字段…]`，数组首字存长度；调用建活动记录（this、参数、局部）。
- 符号表把标识符映射到描述符，按作用域/继承分层，Lookup 上溯；描述符记录类型、偏移、签名、代码引用。
- 高层 IR 用表达式树（load/运算）+ store 节点 + 结构化控制流节点；从 AST 自底向上构建。
- 继承下字段顺序布局；动态分派靠方法表（按编号一次索引），静态查找按名上溯——两者结果可不同。
