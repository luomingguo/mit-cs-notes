# L11：语义（闭包 II / 收官）——作用域语义对比与"免费的对象"

> 接 L10，收尾语义单元。重点：IMP / MITScript / JS / Python 的**作用域规则对比**，记录即对象，以及"如何造一门语言"的总结

---

## 1. 四种语言的作用域语义对比

同样写"闭包 + 嵌套作用域"，不同语言规则不同。理解差异是实现 MITScript 语义的关键。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（IMP / JS / Python / MITScript 作用域规则）</strong>
<ul>
<li><strong>IMP</strong>：块 <code>{}</code> 引入作用域；<code>var</code> 在<strong>执行到时</strong>把变量加入当前作用域；任何可达作用域都可修改。</li>
<li><strong>JS</strong>（指经典 <code>var</code>）：<strong>块不引入作用域</strong>（仅"装饰性"）；<code>var</code> 声明被<strong>提升 (hoisting)</strong>——只要函数体内出现，无论 if/何时执行都加入当前（函数）作用域；任何可达作用域可改；在作用域但未初始化 → 值为 <code>undefined</code>。</li>
<li><strong>Python</strong>：<strong>没有块</strong>；<strong>没有 var 声明</strong>——<strong>赋值</strong>即把变量引入作用域（即便该赋值未被执行）；<strong>只有当前作用域与全局作用域可修改</strong>（中间的外层需 <code>nonlocal</code>/<code>global</code>）；在作用域但未初始化时访问 → <strong>NameError</strong>。</li>
<li><strong>MITScript</strong>：<strong>Python 语义 + 块仅装饰性（不引入作用域）</strong>。</li>
</ul>
</div>

> 这张表是本讲核心：同一段代码在四种规则下行为不同。MITScript 选了"Python 语义、块装饰性"，实现时要据此决定 var/赋值如何改帧、自由变量如何解析。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（Python：赋值使变量"提前"成为局部 → 错误）</strong>
<pre>
x = 7
def g():
    x = 8
    def h():
        print(x)        # ← 这里出错
        x = x + 1
    h(); h()
    return h
print(x)                # 7
hh = g(); hh()
print(x)                # 仍 7（g 内对 x 的赋值不改全局）
</pre>
<code>h()</code> 里因为有 <code>x = x + 1</code>（赋值），Python 规则把 <code>x</code> 当作 <strong>h 的局部变量（对整个函数体生效）</strong>；于是开头的 <code>print(x)</code> 访问"已在作用域但尚未初始化"的局部 x → 报错（UnboundLocalError，属 NameError 类）。这正演示了"赋值把变量引入作用域，即便赋值尚未执行"。
</div>

> 对照 JS：未初始化得 `undefined`（不报错）；对照 IMP：var 执行到时才声明。规则差异直接来自 L9–L10 那套"帧 + 链式栈 + lookup"在"何时/向何处加绑定、向上能改到哪层"上的不同设定。

---

## 2. 记录即对象（Objects for Free）

有了"记录 + 闭包 + 引用语义"，对象/类是**免费**得到的（L2 语法糖的回响）：

```
var Point = fun(x, y) {
    var this = {
        x : x;  y : y;
        print : fun(){ log("Point(" + this.x + ", " + this.y + ")"); };
    };
    return this;
};
var p = Point(5,5);
p.print();
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（对象 = 记录 + 闭包）</strong>
对象就是一个堆上的<strong>记录</strong>，字段值可以是<strong>闭包</strong>（方法）；方法通过捕获的 <code>this</code>（指向该记录的引用）访问字段。构造函数就是返回这样一个记录的普通函数。无需在语言里专门加"类"原语。
</div>

记录的关键设计仍是**值 vs. 指向值**（L8）：引用语义下 `var b = a; b.x = 3; print(a.x)` 输出 `3`（b、a 指向同一堆记录）。文法含创建记录 `{f1:e1; …}`、读字段 `e.f`、更新字段 `e.f = e'`。

---

## 3. 我们造出了一门完整的语言

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（语言设计方法论）</strong>
<ul>
<li><strong>从小的核心演算 (core calculus) 起步</strong>，再<strong>尽量正交地</strong>只添加必要特性。历史范例：
<ul>
<li>λ 演算 — 函数式编程（Church, 1930）</li>
<li>IMP — 命令式编程（Winskel, 1993）</li>
<li>Featherweight Java — Java 核心（Igarashi, Pierce, Wadler, 2002）</li>
<li>JavaScript 操作语义（Maffeis, Mitchell, Taly, 2008）</li>
<li>RustBelt — Rust（Jung 等, 2018）</li>
</ul></li>
<li><strong>从语义到解释器</strong>：手写递归解释器；或像"解析器生成器"那样<strong>自动</strong>从语义生成（K framework，kframework.org）。</li>
</ul>
</div>

> 回顾路线：表达式（L6）→ 语句/IMP（L7）→ 堆（L8）→ 作用域/帧栈（L9）→ 链式栈/闭包（L10）→ 作用域语义对比 + 记录/对象（L11）。一套"帧 + 堆 + 推理规则"逐步扩展，就精确定义了一门带闭包与对象的动态语言——这正是 Phase 2 解释器要实现的规格。

---

## 4. 本讲小结

- 作用域语义因语言而异：IMP（块引入作用域、var 执行时声明）、JS（块装饰性、var 提升、未初始化为 undefined）、Python（无块无 var、赋值即声明、仅当前+全局可改、未初始化报 NameError）、MITScript（Python 语义 + 块装饰性）。
- Python 的"赋值使变量对整个函数成为局部"导致先读后赋的 UnboundLocalError。
- 记录 + 闭包 + 引用语义 = 免费的对象/类；this 通过捕获引用访问字段。
- 语言设计：从核心演算起步、正交加特性；语义可手写或自动（K framework）生成解释器。
- 至此语义单元完结，下一单元进入 Phase 3：垃圾回收（L12–14）。
