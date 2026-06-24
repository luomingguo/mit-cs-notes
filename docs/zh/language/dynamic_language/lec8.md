# L8：语义（堆与记录）——带堆的操作语义

> 接 L7。把值从"帧里的整数"搬到**堆 (heap)** 上：表达式求值返回**地址**，并把堆**线程化**穿过每一步求值
> 记号：<span>$\langle e, f, h\rangle \Downarrow \langle a, h'\rangle$</span>——在帧 f、堆 h 下，表达式 e 求值得到地址 a 与更新后的堆 h'

---

## 1. 为什么引入堆

L7 中帧直接把变量映到整数值（纯函数式、无副作用）。但真实语言有可变的、可共享的数据（记录、对象）。引入**堆**：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（帧与堆）</strong>
<ul>
<li><strong>帧 (frame) <span>$f$</span></strong>：变量 → <strong>地址</strong>（不再直接是值）。</li>
<li><strong>堆 (heap) <span>$h$</span></strong>：地址 → <strong>值</strong>（值可以是整数、None，乃至记录）。</li>
</ul>
求值表达式不再只返回一个整数，而是返回一个<strong>地址</strong>（指向堆中算出的值）以及更新后的堆。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（两种堆表示选择：<code>x=5; y=7; z=x; y=z;</code>）</strong>
<ul>
<li><strong>版本一</strong>：每次赋值都为变量新建一个对象（语义规则直接产生的形态）——堆里对象较多。</li>
<li><strong>版本二</strong>：赋值时让变量<strong>共享指向</strong>已有值的地址（如 <code>z=x</code> 让 z 与 x 指同一个 5）——堆更小。</li>
</ul>
两种只是<strong>表示选择 (representation choice)</strong>：只要把堆变化"很小心地"贯穿整套语义，<strong>程序输出相同</strong>。版本二通常得到更小的堆。
</div>

---

## 2. 带堆的求值关系

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（带堆的求值关系）</strong>
<ul>
<li>表达式：<span>$\langle e, f, h\rangle \Downarrow \langle a, h'\rangle$</span>（返回<strong>地址</strong> a 与新堆 h'）。</li>
<li>布尔表达式：<span>$\langle b, f, h\rangle \Downarrow \langle t, h'\rangle$</span>。</li>
<li>语句：<span>$\langle s, f, h\rangle \Downarrow \langle f', h'\rangle$</span>。</li>
</ul>
关键变化：表达式现在对堆<strong>有副作用</strong>（之前是纯的），所以必须把堆<strong>线程化 (thread through)</strong> 每一步。
</div>

---

## 3. 表达式的推理规则（带堆）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（表达式带堆语义）</strong>
<strong>常量</strong>——为值<strong>分配一个新地址</strong>（<span>$a$</span> 为堆中新鲜地址）：
$$\frac{a \notin \text{dom}(h)}{\langle n, f, h\rangle \Downarrow \langle a,\ h[a \mapsto n]\rangle}$$
<strong>变量</strong>——直接返回帧中记录的地址，<strong>不分配</strong>：
$$\frac{}{\langle x, f, h\rangle \Downarrow \langle f(x),\ h\rangle}$$
<strong>二元运算</strong>——依次求左右（线程化堆），再为结果分配新地址：
$$\frac{\langle e_1, f, h\rangle \Downarrow \langle a_1, h_1\rangle \quad \langle e_2, f, h_1\rangle \Downarrow \langle a_2, h_2\rangle \quad a \notin \text{dom}(h_2)}{\langle e_1 + e_2, f, h\rangle \Downarrow \langle a,\ h_2[a \mapsto h_2(a_1) + h_2(a_2)]\rangle}$$
</div>

> 注意两点：① **堆被线程化**——左子用 h 得 h₁，右子用 h₁ 得 h₂，结果基于 h₂；这把"求值顺序"显式写进了语义。② **每个运算都分配**一个地址，于是会产生<strong>大量分配</strong>，其中大多数（如中间结果 a₁、a₂）最终成为**垃圾**（只保留最终结果）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（堆语义直接引出垃圾回收）</strong>
"每运算一次分配一次、绝大多数立刻成垃圾"正是 <strong>Phase 3 垃圾回收</strong>存在的根本原因——语义层面就注定了需要回收不可达的堆对象。
</div>

---

## 4. 语句的推理规则（带堆）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（赋值带堆语义——无分配）</strong>
$$\frac{\langle e, f, h\rangle \Downarrow \langle a, h'\rangle}{\langle x := e, f, h\rangle \Downarrow \langle f[x \mapsto a],\ h'\rangle}$$
赋值<strong>不分配</strong>：只是让变量 x 在帧中指向表达式算出的地址 a。
</div>

> 设计要点：**分配发生在"计算"处（表达式），而非"赋值"处**。这与早期把分配放在赋值/声明处的版本不同——把分配下沉到运算，语义更统一（赋值只是改指向）。if/while/顺序的规则与 L7 同构，只是多线程一个堆。

---

## 5. 记录（Records）：引用 vs. 值语义

引入记录后，**堆要能存值（而非只存整数）**——一个记录值是"字段名 → 地址"的映射。

文法扩展：

```
e → { field1 : e1 ; field2 : e2 ; ... }    (创建记录)
e → e.field                                 (读字段)
s → e.field = e'                            (更新字段)
```

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（别名与引用语义）</strong>
<pre>
var a = { x : 1; y : 2 };
var b = a;
b.x = 3;
print(a.x)      // 输出？
</pre>
若记录是<strong>引用语义</strong>（变量持有指向同一堆记录的地址）：<code>b = a</code> 让 b 与 a 指向<strong>同一记录</strong>，<code>b.x = 3</code> 改的就是那个共享记录 → <code>print(a.x)</code> 输出 <strong>3</strong>。
若是<strong>值语义</strong>（b 得到一份拷贝）：则输出 <strong>1</strong>。
</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（记录的关键设计决策：值 vs. 指向值）</strong>
"记录内容如何表示"——存<strong>值本身</strong>还是存<strong>指向值的地址</strong>——直接决定了 <code>b = a</code> 是拷贝还是别名，从而决定上面的输出。MITScript（如 Python）采用引用语义，记录在堆上、变量持地址。
</div>

**自练**：用新的（带堆）语义为"在表达式中创建记录"和"给字段赋值"写出推理规则——带堆后这反而更简单（创建记录 = 在堆分配一个字段→地址的映射并返回其地址；字段赋值 = 求出记录地址与新值地址，更新堆中该记录的对应字段）。

---

## 6. 本讲小结

- 引入堆后：帧 = 变量→地址，堆 = 地址→值；表达式求值返回**地址 + 新堆**。
- 表达式现在有副作用，必须把堆**线程化**穿过每步求值（顺序被显式编码进语义）。
- 常量/运算**分配**新地址，变量/赋值**不分配**（赋值只改指向）；每运算一分配 → 大量垃圾 → 引出 GC。
- 记录在堆上，关键设计是"存值 vs. 存地址"——引用语义下别名 `b=a; b.x=3` 会让 `a.x` 也变（输出 3）。
