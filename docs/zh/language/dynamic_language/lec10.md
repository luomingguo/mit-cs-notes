# L10：语义（闭包 I）——链式栈与堆上帧

> 接 L9。核心难题：闭包可引用**已被弹栈**的作用域里的变量。解法：把帧分配到**堆**上，用父指针**链接**成"链式栈"
> 记号：状态从"帧栈"升级为"**帧指针 (frame pointer) <span>$a$</span> + 堆 <span>$h$</span>**"

---

## 1. 难题：作用域逃逸（Managing Scopes）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（闭包带来的核心难题）</strong>
一个闭包可能引用某个<strong>已经被弹出栈</strong>的作用域中的变量——作用域的帧可能比"该作用域代码的单次执行"<strong>活得更久 (long-lived)</strong>。纯栈式实现（L9）无法支持。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（捕获的变量在块结束后仍存活）</strong>
<pre>
var f = 0;
{ var x = 1;
  f = fun() { print(x); x = x + 1; };
}
f(); f(); f();        // 输出 1, 2, 3
</pre>
块结束后帧本应弹出，但闭包 f 仍持有 x 并跨三次调用累加——x 的帧必须比块的执行活得更久。
</div>

### 1.1 闭包 vs. "函数"

把上例与 C 的几种写法对比，凸显闭包语义：

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（闭包 vs. C 函数）</strong>
<pre>
局部 int x=1;        每次调用重置 → 1, 1, 1
static int x=1;      静态局部     → 1, 2, 3（但全局唯一，非"每个闭包一份"）
全局 int x;          全局共享     → 1, 2, 3（共享，非捕获）
MITScript 闭包                    → 1, 2, 3（每个闭包捕获自己的作用域）
</pre>
区别在<strong>"每个闭包实例一份捕获状态"</strong>：
<pre>
var g = fun() { var x = 1; var f = fun(){print(x); x=x+1;}; return f; };
g()(); g()(); g()();      // 输出 1, 1, 1
</pre>
每次调用 <code>g()</code> 都新建一个 x，故每个返回的闭包<strong>各有独立的 x</strong> → 1,1,1（对比复用同一闭包的 1,2,3）。C 的 static/全局做不到这种"每实例独立"。
</div>

---

## 2. 解法：把帧分配到堆上（Linked Stacks）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（链式栈 / 堆上帧）</strong>
不再用连续栈，而是<strong>把每个帧作为堆对象分配</strong>：
<ul>
<li><strong>帧 (frame)</strong> = 堆中的一个记录，含若干"变量 → 地址"绑定，外加一个<strong>父指针 <code>p</code></strong> 指向外层（enclosing）帧的地址。</li>
<li><strong>帧指针 (frame pointer, FP) <span>$a$</span></strong> = 当前帧在堆中的地址。</li>
<li>帧由父指针链成一条链（"链式栈"，又称仙人掌栈 cactus stack）——一个帧可被多个子帧/闭包共享，故能在"逻辑栈帧弹出"后继续存活。</li>
</ul>
求值关系变为 <span>$\langle e, a, h\rangle \Downarrow \langle a', h'\rangle$</span>："给定帧指针与堆"求值。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（链式栈堆轨迹：<code>var x=1; var y=2; { var x=3; y=4; }</code>）</strong>
<table>
<tr><th>行</th><th>FP</th><th>堆 h</th></tr>
<tr><td>1 var x=1</td><td>100</td><td>{100:{x:200}, 200:1}</td></tr>
<tr><td>2 var y=2</td><td>100</td><td>{100:{x:200, y:208}, 200:1, 208:2}</td></tr>
<tr><td>3 进入块</td><td>108</td><td>{100:{x:200,y:208}, 108:{p:100}, 200:1,208:2}</td></tr>
<tr><td>4 var x=3</td><td>108</td><td>108:{p:100, x:216}, …, 216:3</td></tr>
<tr><td>5 y=4</td><td>108</td><td>y 不在帧 108 → 沿 p 到 100 找到 y，更新 100:{x:200, y:224}，224:4</td></tr>
<tr><td>6 出块</td><td>100</td><td>FP 回到 100（帧 108 仍在堆里，若无人引用则成垃圾）</td></tr>
</table>
要点：块帧 108 的父指针 <code>p:100</code> 把它链到外层；<code>y=4</code> 通过 lookup 沿链找到外层的 y 并就地更新。
</div>

---

## 3. 查找：沿父指针上溯（Lookup）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（链式 lookup）</strong>
$$\text{lookup}(a, x, h) = \begin{cases} h(a)[x] & x \in \text{dom}(h(a)) \\ \text{lookup}(h(a)[p],\ x,\ h) & \text{否则（沿父指针 } p \text{ 上溯）} \end{cases}$$
即先查当前帧，找不到就跟随父指针到外层帧，直至找到。
</div>

由此，变量引用规则：

$$\frac{\text{lookup}(a, x, h) = a_x}{\langle x, a, h\rangle \Downarrow \langle a_x, h\rangle}$$

**声明 var** 在当前帧 <span>$h(a)$</span> 加绑定；**赋值 update** 用 lookup 定位变量所在帧后**就地更新 (in-place update)** 其绑定。

### 3.1 块作用域规则（链式版）

$$\frac{a' \text{ fresh} \quad \langle s,\ a',\ h[a' \mapsto \{p : a\}]\rangle \Downarrow \langle a'',\ h'\rangle}{\langle \{\,s\,\},\ a,\ h\rangle \Downarrow \langle a,\ h'\rangle}$$

进块：在堆中建新帧（父指针指向当前帧 a），以新帧为 FP 求值块体；出块：FP 恢复为 a（新帧留在堆中，可能成垃圾、也可能被闭包捕获而存活）。

---

## 4. 闭包的语法、表示与语义

扩展 IMP：增加**创建闭包**与**调用闭包**的语法；表示上闭包是值、帧长寿；语义给出创建与调用规则。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（闭包值的表示）</strong>
闭包值是三元组 <span>$(a_{\text{captured}},\ \text{params},\ \text{body})$</span>：
<ul>
<li><span>$a_{\text{captured}}$</span>：<strong>创建时捕获的帧指针</strong>（定义处的环境）；</li>
<li><span>$\text{params}$</span>：形参；<span>$\text{body}$</span>：函数体代码。</li>
</ul>
如堆中 <code>116 : (208, y, {print(x); x = x + 1})</code> 表示一个捕获帧 208、形参 y、体为 <code>{print(x); x=x+1}</code> 的闭包。
</div>

### 4.1 闭包创建规则（捕获当前帧指针）

$$\frac{a' \text{ fresh}}{\langle \text{fun}(\bar{p})\{s\},\ a,\ h\rangle \Downarrow \langle a',\ h[a' \mapsto (a,\ \bar{p},\ s)]\rangle}$$

> 关键：闭包**捕获创建时的帧指针 <span>$a$</span>**——这就是**词法/静态作用域 (lexical scoping)** 的来源（自由变量在"定义处"而非"调用处"的环境中解析）。

### 4.2 闭包执行规则（新帧链到捕获帧）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（闭包调用 <code>x(e)</code>）</strong>
<ol>
<li><span>$x$</span> 求值为闭包 <span>$(a_c, \bar{p}, s)$</span>；</li>
<li>实参 <span>$e$</span> 求值为值（地址）；</li>
<li><strong>创建新帧</strong>，其<strong>父指针指向闭包捕获的帧 <span>$a_c$</span></strong>（不是调用者的帧！），并把形参绑定到实参；</li>
<li>以新帧为 FP <strong>求值闭包体</strong> <span>$s$</span>；返回其结果。</li>
</ol>
"父指针 = 捕获帧"正是词法作用域：闭包体里的自由变量沿着<strong>定义时的链</strong>解析，而非调用时的链。
</div>

---

## 5. 完整轨迹：闭包跨调用累加

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（<code>f();f()</code> 的堆演化，输出 1, 2）</strong>
<pre>
1: var f = 0;
2: { 3: var x = 1;
   4: f = fun(y) { 5: print(x); 6: x = x + 1; 7: };
8: }
9: f(1);
10: f(2);
</pre>
<table>
<tr><th>行</th><th>FP</th><th>堆 h（要点）</th></tr>
<tr><td>1</td><td>200</td><td>{100:0, 200:{f:100}}</td></tr>
<tr><td>3</td><td>208</td><td>进块建帧 208{p:200}；x→108，108:1</td></tr>
<tr><td>7</td><td>208</td><td>闭包建于 116=(208, y, {print(x);x=x+1})；f 改指 116 → 200:{f:116}</td></tr>
<tr><td>8</td><td>200</td><td>出块，FP 回 200。<strong>但帧 208 仍在堆里</strong>——被闭包 116 捕获，是"长寿帧"</td></tr>
<tr><td>9 f(1)</td><td>200</td><td>f→116 闭包；建新帧 212{p:208, y:124}（父=捕获帧 208）；print(x)：在 212 找不到 x→沿 p 到 208，x=1，打印 1；x=x+1 → 208 的 x 改指新值 132:2</td></tr>
<tr><td>10 f(2)</td><td>200</td><td>建新帧 216{p:208, y:140}；print(x)：沿 p 到 208，x=2，打印 2；x→3</td></tr>
</table>
输出 <strong>1, 2</strong>（再调一次得 3）。两次调用的实参帧不同（212/216），但<strong>父指针都指向同一捕获帧 208</strong>，所以 x 被持续累加——这正是"每个闭包一份、跨调用持久"的捕获语义。
</div>

> 对照"返回新闭包"的版本（每次 `g()` 新建 x、新建捕获帧）：每个闭包父指针指向不同的帧，故各自的 x 独立 → 输出 1,1,1。

---

## 6. 本讲小结

- 难题：闭包引用的变量所在作用域可能已弹栈，帧需比单次执行活得更久——纯栈不行。
- 解法：帧分配到堆、用父指针 `p` 链成**链式栈**；状态 = 帧指针 + 堆；lookup 沿父指针上溯。
- 闭包值 = (捕获的帧指针, 形参, 体)；创建时**捕获当前帧指针**（词法作用域之源）。
- 调用时新建帧、**父指针指向捕获帧**（非调用者帧），在其中求值体；自由变量沿定义链解析。
- 捕获帧因被闭包引用而存活于堆中，跨调用持久（1,2,3）；不同闭包实例捕获不同帧（1,1,1）。
- 下一讲（Closures II）：补全规则细节、收尾闭包语义。
