---
title: 低级虚拟机 III（Low-Level VM III）——表示与符号表
course: 6.112 动态计算机语言工程
course_id: '6.112'
lecture: 17
kind: theory
tags: []
status: complete
---
# Lec 17 低级虚拟机 III（Low-Level VM III）——表示与符号表

> 接 L16。本讲的主题是**表示 (Representations)**：变量怎么命名/寻址（global/local/field/free）、用**符号表**在编译期把作用域算清楚、用**引用**加速自由变量（闭包）、以及记录 (Record) 的高效布局。一句话主旨贯穿全讲：**高效的低级表示靠的是把程序的静态信息固化下来、并据此强制高效的执行编码。**

---

## 1. 出发点：变量引用的翻译

L16 留了个伏笔——变量引用到底翻译成什么指令？答案取决于变量的**种类**。两条加载指令：

```text
// load_local i: 读局部变量压栈
// Stack: S => S :: value_of(f.local_vars[i])

// load_global i: 读全局变量压栈
// Operand 0: 变量名在 names 列表中的下标
// Stack: S => S :: global_value_of(f.names[i])
```

例子：

```text
x = 1;
f = fun(y) { return x + y; };
f(1);
```

内层函数里 `x` 是全局、`y` 是局部，于是函数体翻译为：

```text
function {
  local_vars = [y],
  names      = [x],
  instructions = [
    load_global 0   # x
    load_local  0   # y
    add
    return
  ]
}
```

---

## 2. 组织/表示的三个目标

::: definition 定义（表示设计的三目标）
- **匹配源语言设计**：源语言里的一等公民（None、整数、布尔、闭包）在 VM 里通常也是一等公民；

- **效率**：把源语言与语义的**静态信息具体化 (reify)**，并据此换取性能；

- **灵活性**：源语言小改时 VM 尽量少改；甚至支持多种源语言。
:::

---

## 3. 命名与寻址：解释器 vs. VM

考察一段嵌套程序里变量的访问方式：

```text
x = 1;
f = fun(y) {
  g = fun(z) { return x + y + z.f; };
  g({ f : y + 1 });
};
f(x + 1);
```

- `z` 怎么访问？——**局部 (local)**
- `f`（`z.f`）怎么访问？——**字段 (field)**
- `x` 怎么访问？——**全局/自由 (global/free)**
- `y` 怎么访问？——**自由 (free)**（在 g 里它既非全局也非 g 的局部）

::: theorem 定理（命名/寻址方式对照）
<table>
<tr><th>变量种类</th><th>解释器 (Interpreter)</th><th>VM</th></tr>
<tr><td>Global 全局</td><td>名字（哈希查找）</td><td>名字（哈希查找）</td></tr>
<tr><td>Local 局部</td><td>名字（哈希查找）</td><td><strong>下标（数组索引）</strong></td></tr>
<tr><td>Field 字段</td><td>名字（哈希查找）</td><td>名字（哈希查找）</td></tr>
<tr><td>Free 自由</td><td><strong>指针追逐 (pointer chasing)</strong></td><td><strong>引用 (reference)</strong></td></tr>
</table>

VM 的优化点：局部变量从"按名哈希"变"按下标取数组"；自由变量从"沿父帧链一路追指针"变"一次性解析好的直接引用"。
:::

---

## 4. 符号表（Symbol Tables）

::: definition 定义（符号表）
编译中的核心概念，编译器用它**静态地**确定作用域。

- **基本操作：查找 (Lookup)**——给一个字符串名字，找到它的描述符 (descriptor)；

- 动态语言里描述符主要记**作用域**；静态语言里还含**类型**信息；

- 典型实现：**层级哈希表 (hierarchical hash tables)**。
:::

::: definition 定义（符号表的层级）
层级来自**嵌套作用域**（静态 OO 语言中还来自继承）。查找沿层级**向上**进行，直到找到描述符。

关键直觉：**符号表是运行时栈帧的"静态版本"**——编译期用它模拟运行时帧的嵌套结构。
:::

### 4.1 四个定义 + 三个静态标注

::: definition 定义（变量种类）
- **Global（全局）**：最外层帧里的变量；

- **Local（局部）**：在本帧定义的变量；

- **Free（自由）**：既非全局也非本帧局部的变量（来自外层某个函数帧）；

- **Referenced（被引用）**：被某个嵌套帧引用的（本帧）变量。

编译器为每个作用域**静态计算**并打标签：globals → "global"、locals → "local"、被嵌套帧用到的 → "ref"。
:::

### 4.2 符号表分析示例

```text
x = 1;
f = fun(y) {
  g = fun(z) { return x + y + z; };
  return g;
};
f(2)(3);
```

逐层符号表（每个作用域问三个问题：global? local? reference?）：

| 作用域 | 变量 | 标注 |
|--------|------|------|
| 顶层 | x | global |
| 顶层 | f | global |
| f | y | **local, ref**（y 被内层 g 引用） |
| f | g | local |
| g | z | local |
| g | x | （自由，解析到全局 x） |
| g | y | （自由，解析到 f 的 y——而 y 在 f 里被标 ref） |

> 关键：`y` 在 `f` 里既是 local 又被标 **ref**，因为内层 `g` 用到它。这个 ref 标记决定了 `y` 要被"提升"成一个可被闭包共享的**引用单元**，而不是普通的栈槽（否则 f 返回后栈帧销毁，g 就拿不到 y 了——这正是 L10/L11 的闭包逃逸问题）。

---

## 5. 代码生成：按种类发指令

::: definition 定义（按变量种类生成指令）
- **Global** → `load_global`；

- **Local** → `load_local`；

- **Referenced（本帧 local 但被嵌套帧引用）** → 用 `load_local` 或 `push_ref`/`load_ref`；

- **Free（自由）** → 通过引用访问：`push_ref`/`load_ref`。
:::

---

## 6. 局部变量：哈希表 vs. 数组

### 6.1 局部变量作为哈希表（解释器做法，慢）

```cpp
void Frame::store(vector<Bucket*> frame, string name, Value* val) {
  uint64_t h = hash(name);
  Bucket* bucket = frame[h % frame.size()];
  frame[h % frame.size()] = new Bucket(bucket, name, val);
}
Value* Frame::lookup(vector<Bucket*> frame, string name) {
  uint64_t h = hash(name);
  return frame[h % frame.size()]->find(name);
}
```

每次存取都要算哈希、可能链表查找。

### 6.2 局部变量作为数组（VM 做法，快）

::: theorem 定理（局部变量集合是静态的）
一个函数的局部变量名集合在**编译期就完全确定**，于是可以给每个局部分配一个固定**下标**，运行时用数组直接索引：
:::

```text
fun() { x = 1; y = 2; z = 3; }
```

```text
function {
  local_vars = [x, y, z],
  constants  = [1, 2, 3],
  instructions = [
    load_const 0  store_local 0
    load_const 1  store_local 1
    load_const 2  store_local 2
  ]
}
```

```cpp
void   Frame::store (vector<Value*> frame, uint64_t i, Value* v) { frame[i] = v; }
Value* Frame::lookup(vector<Value*> frame, uint64_t i)          { return frame[i]; }
```

> 从哈希 O(1)（带常数大）变成数组 O(1)（常数极小、缓存友好）。这就是"把静态信息固化"的典型收益。

---

## 7. 自由变量：从指针追逐到引用

### 7.1 慢版本：沿父帧指针链查找

闭包帧用 parent pointer `p` 串成链。访问自由变量 `x`、`y` 时要从当前帧沿 `p` 一路向上找到定义它的帧——**指针追逐**，可能很贵。好处是：最近的定义可静态确定。

### 7.2 快版本：引入引用 (Reference)

::: definition 定义（引用 Reference）
一个**指向某个数据的指针**。把被嵌套帧引用的变量（标了 ref 的那些）**装箱进堆上的 Reference 单元**，闭包创建时把这些引用直接**捕获**进自己的 free_vars 数组。

效果：在编译期就静态解析好"该变量在哪个帧"，运行时直接通过引用访问——**不再需要 parent pointer、不再沿链追逐**。
:::

逐步演化（slides 的动画）：原来 g 要靠 `p` 指针找到 f 帧里的 `y`；改造后，`y` 被提升为一个堆上的 `Reference{...}`，f 和 g 都持有这个引用，于是 **f 返回、栈帧销毁后 g 仍能访问 y**——闭包正确捕获，且访问是一次解引用而非链式查找。

### 7.3 生成的字节码

内层 `g = fun(z){ return x + y + z; }`：

```text
function {
  local_vars = [z],
  free_vars  = [y],      # 捕获的自由变量
  names      = [x],
  instructions = [
    load_global 0   # x（全局）
    push_ref 0      # 取 free_vars[0] 这个引用（y）
    load_ref        # 解引用得到 y 的值
    add             # x + y
    load_local 0    # z（局部）
    add             # (x+y) + z
    return
  ]
}
```

外层 `f`（要为 g 准备引用并建闭包）：

```text
function {
  local_vars     = [y, g],
  local_ref_vars = [y],   # y 是本帧 local 且被引用 → 提升为引用
  free_vars      = [],
  instructions = [
    load_func 0     # g 的函数对象
    push_ref 0      # y 的引用
    alloc_closure 1 # 用 1 个捕获引用建闭包
    store_local 1   # 存到 g
    load_local 1
    return
  ]
}
```

> 这里 `load_global`（全局，按名）、`push_ref/load_ref`（自由，按引用）、`load_local`（局部，按下标）三种访问方式同台出现，正好印证 §3 的对照表。

---

## 8. 记录（Records）的表示

### 8.1 记录作为哈希表

```text
fun() { r = { x : 1 }; }
```

```text
function {
  local_vars = [r],
  constants  = [1],
  names      = [x],
  instructions = [
    alloc_record    # 在堆上建空 Record
    dup             # 复制记录引用（一个留着存字段、一个存到 r）
    load_const 0    # 1
    field_store 0   # r.x = 1（字段名 names[0]）
    store_local 0   # 存到局部 r
  ]
}
```

记录内部是哈希桶 `Bucket{x:1}`，字段访问要算哈希。

### 8.2 动态行为的影响

::: definition 定义（动态 vs. 静态语言的对象布局）
- **动态语言**：记录/对象可以**运行时增删字段**（如 `r[y] = 2`，字段名来自运行时输入）——必须用哈希表式布局；

- **静态语言（C++/Java）**：对象字段集合**静态确定**，布局是**静态数组**，字段访问就是固定偏移量，极快。
:::

### 8.3 "能不能更好？"——预计算静态部分

::: theorem 定理（预计算 field 的哈希）
当字段名是**静态常量**（如源码里写死的 `r.x`）时，可在**编译期预先算出哈希值**，把它作为指令操作数传入，运行时省去 hash 计算：
:::

```cpp
// 把 hash 作为参数传进来（编译期算好），运行时不再 hash(name)
Value* Frame::lookup(vector<Bucket*> frame, uint64_t h, string name) {
  Bucket* bucket = frame[h % frame.size()];
  return bucket->find(name);
}
```

> 注意区分：静态字段名 `r.x` 用 `field_load/field_store i`（可预计算哈希）；**动态字段名** `r[expr]` 需要另一条指令，因为名字到运行时才知道。

---

## 9. 与 Crafting Interpreters 的对应（参考补充）

- **第 22 章 Local Variables**：局部变量编译成栈槽下标（数组化）——对应 §6。
- **第 25 章 Closures**：upvalue 机制——开放 upvalue 指向栈、闭合 upvalue 提升到堆，正是本讲"自由变量→引用单元、栈帧销毁后仍可访问"的实现，对应 §7。
- **第 28 章 Methods and Initializers / 第 30 章 Optimization**：用哈希表存字段，以及"缓存/预计算"加速字段访问——对应 §8。
- 课程比书更系统地用**符号表 + global/local/free/ref 四分类**来驱动代码生成，这是工业编译器的标准做法。

---

## 10. 本讲小结

- 主旨：**高效的低级表示 = 把程序的静态信息固化进编码**。
- 变量四分类（global/local/field/free），VM 相对解释器的优化：**局部按下标数组、自由按引用**（而非哈希 / 指针追逐）。
- **符号表**是运行时栈帧的静态版本，编译期沿嵌套作用域向上查找，给每个变量打 global/local/ref 标签。
- 被嵌套帧引用的局部变量提升为**堆上引用单元**并被闭包捕获，从而消除 parent pointer 与链式查找、正确支持闭包逃逸。
- 记录：动态语言需哈希式布局以支持增删字段；静态字段名可**预计算哈希**，动态字段名需专门指令。
- 至此低级 VM（L15–L17）讲完。下一讲（L18）进入**代码生成 I**：把这些 IR/字节码进一步下沉到机器码。
