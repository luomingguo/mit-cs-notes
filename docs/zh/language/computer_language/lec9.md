---
title: 循环优化（Loop Optimizations）
course: 6.1100 计算机语言工程
course_id: '6.1100'
lecture: 9
kind: theory
tags: []
status: complete
---
# Lec 09 循环优化（Loop Optimizations）

> 参考：循环是优化重点——"90% 的执行时间花在 10% 的代码（多在循环）里"

---

## 1. 为什么优化循环

大量计算发生在循环中。本讲学两类优化：**循环不变式外提 (loop-invariant code motion)** 与 **归纳变量消除 (induction variable elimination)**。前提是先**识别循环**。

---

## 2. 什么是循环（Defining Loops）

直觉上循环是：**单一入口的头节点 (loop header)**——所有迭代都经过它；加上至少一条回到头节点的**回边 (back edge)**。异常情形：两条回边两个循环共用一头（编译器合并为一个循环）；无头节点则无循环。

### 2.1 支配关系（Dominators）

::: definition 定义（支配 / 直接支配）
节点 $n$ **支配 (dominate)** 节点 $m$，当且仅当从起始节点到 $m$ 的所有路径都经过 $n$。若 $d_1, d_2$ 都支配 $n$，则二者间必有支配关系（$d_1$ 支配 $d_2$ 或反之）。$n$ 的**直接支配者 (immediate dominator)** 是从起点到 $n$ 任意路径上的最后一个支配者。
:::

**支配树 (dominator tree)**：节点即 CFG 节点，从 <span>$d$</span> 到 <span>$n$</span> 有边当 <span>$d$</span> 直接支配 <span>$n$</span>，根为起始节点。

**支配者计算**（数据流式不动点算法）：

$$D(n_0) = \{n_0\}, \qquad D(n) = \{n\} \cup \bigcap_{p \in \text{pred}(n)} D(p)$$

```text
D(n0) = {n0}
for n ≠ n0: D(n) = N      // 初始化为全集
while D 变化:
    for n ≠ n0: D(n) = {n} ∪ ⋂_{p∈pred(n)} D(p)
```

> 算法完成：单调收缩、有限格保证不动点。条件"<span>$n$</span> 支配 <span>$m$</span> ⟺ <span>$n$</span> 支配 <span>$m$</span> 的所有前驱（或 <span>$n=m$</span>）"提示了上面的交集形式。

### 2.2 用回边定义循环

::: definition 定义（回边与自然循环）
**回边 (back edge)** 是头支配尾的边 $n \to d$（即 $d$ 支配 $n$）。由回边 $n \to d$ 确定的循环 = $d$、$n$ 加上"所有不经过 $d$ 就能到达 $n$ 的节点"（即 $d$ 与 $n$ 之间的全部节点）；$d$ 是循环头。
:::

**循环构造算法**（从 <span>$n$</span> 反向扩展前驱直到 <span>$d$</span>）：

```sql
loop(d, n):
    loop = {d}; stack = ∅; insert(n)
    while stack 非空:
        m = pop; for p ∈ pred(m): insert(p)
insert(m): if m ∉ loop: loop ∪= {m}; push m
```

**嵌套循环**：两循环若不同头，则一个内嵌于另一个、或互不相交；同头则通常并起来当一个循环处理。

### 2.3 循环前置头（Preheader）

许多优化要在循环前插入代码——为此在循环前放一个特殊节点 **loop preheader** 来承载这些代码。

---

## 3. 循环不变式外提（Loop-Invariant Code Motion）

::: definition 定义（循环不变语句）
一条语句是**不变的 (invariant)**，若其操作数满足：① 是常量；或 ② 所有到达定义都在循环外；或 ③ 恰有一个到达定义，且该定义来自一条不变语句。**出口节点 (exit node)** 是有后继在循环外的节点。
:::

**检测算法**（不动点迭代，反复加入新发现的不变语句直到无变化）：先标记操作数为常量或到达定义全在循环外的语句，再迭代加入"恰一个到达定义来自不变语句"的语句。

::: definition
**定理（外提语句 `s: x = y+z` 到前置头的条件）**

- **$s$ 支配循环的所有出口节点**（否则循环后某使用可能读到错误值）；替代条件：$s$ 中 $x$ 的定义到达不了循环外的任何使用（但外提可能增加运行时间）。

- 循环中**没有其他语句给 $x$ 赋值**（否则赋值顺序可能被打乱）。

- 循环中对 $x$ 的使用**不被 $s$ 以外的定义到达**（否则可能改变使用读到的值）。

前置头中语句顺序须保留原程序的数据依赖（按算法发现顺序即可）。
:::

---

## 4. 归纳变量（Induction Variables）

::: definition 定义（基本 / 派生归纳变量）
- **基本归纳变量 (base IV)**：循环内唯一赋值形如 $i = i \pm c$（$c$ 常量或循环不变），三元组 $\langle i, 1, 0\rangle$。

- **派生归纳变量 (derived IV)**：值是某基本归纳变量的线性函数，循环内 $j = c\cdot i + d$，三元组 $\langle i, c, d\rangle$（即 $j = i\cdot c + d$，属 $i$ 的家族）。数组下标 `a[i]` 产生的 `p = a + 4*i` 极常见。
:::

三套算法：检测归纳变量、对派生归纳变量做强度削弱、消除多余归纳变量。

### 4.1 检测算法

```text
扫描循环找出所有基本归纳变量
do:
    找 k = j*b（j 是 IV<i,c,d>）：令 k 为 IV<i, c*b, d*b>
    找 k = j±b（j 是 IV<i,c,d>）：令 k 为 IV<i, c, b±d>
until 无新归纳变量
```

### 4.2 强度削弱（Strength Reduction）

::: theorem 定理（派生归纳变量的强度削弱）
对每个派生归纳变量 $j$（三元组 $\langle i,c,d\rangle$）：新建变量 $s$；把 $j = i*c+d$ 替换为 $j = s$；在每条 $i = i+e$ 之后紧插 $s = s + c*e$（$c*e$ 为常量）；在前置头插入 $s = c*i+d$。
:::

::: example 例题（用加法替代乘法）
```text
原:  i=0; while(i<10){ i=i+1; p=4*i; use(p); }
削弱后: i=0; p=0; while(i<10){ i=i+1; p=p+4; use(p); }   // 4*i 的乘法 → p+=4 的加法
```
:::

### 4.3 消除多余归纳变量（Elimination）

::: theorem 定理（归纳变量消除）
选一个基本归纳变量 $i$，其用途只有"终止条件 $i < n$"和"赋值 $i = i + m$"；选其家族的派生归纳变量 $k$（$\langle i,c,d\rangle$）；把终止条件改写为 $k < c\cdot n + d$。
因为 $k = i\cdot c + d$，故 $i < n \Leftrightarrow ic < cn \Leftrightarrow ic+d < cn+d \Leftrightarrow k < cn+d$。
:::

接上例：消去 <code>i</code>，循环变为 <code>p=0; while(p<40){ p=p+4; use(p); }</code>。

---

## 5. 本讲小结

- 识别循环：先算支配者（不动点交集）与支配树，找回边（头支配尾），自然循环 = 头 + 尾 + 之间节点；前置头承载外提代码。
- 循环不变式外提：检测不变语句（操作数常量/定义在外/来自不变语句），满足支配出口 + 唯一定义 + 不被其他定义干扰三条件后提到前置头。
- 归纳变量：基本（<span>$i=i\pm c$</span>）与派生（<span>$\langle i,c,d\rangle$</span>）；检测 → 强度削弱（乘改加）→ 消除多余者（改写终止条件）。
- 这些优化收益大，正因为时间集中在循环。
