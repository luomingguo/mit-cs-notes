# L1：课程概览（Course Overview）

> 课程：MIT 6.1120 Dynamic Computer Language Engineering（Prof. Michael Carbin）
> 项目：MITScript（一门 Python 风格的动态语言）→ x86
> 网站：6112-fa25.github.io

---

## 1. 什么是"动态"语言（Dynamic Language）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（动态语言的两个特征）</strong>
<ul>
<li><strong>变量可改变类型</strong>：同一变量在不同时刻可持不同类型（<code>x="foo"</code> 后又 <code>x=5</code>）；甚至在<strong>同一程序点</strong>因控制流不同而有不同类型。</li>
<li><strong>数据类型本身灵活</strong>：可运行时给对象动态添加字段（<code>x = new object(); x.f = 5;</code>）。</li>
</ul>
</div>

> 与之对照的"静态语言"在编译期固定变量类型。动态语言（Python、Ruby、JavaScript）灵活、表达力强，但给高效实现带来巨大挑战——这正是本课的主线。

---

## 2. MITScript 项目：Python → x86

目标是把一门高层动态语言**翻译**到机器码。两端的张力：

- **语言端**：资源无限、无性能规格（如 `fun(y){ x=y-2; return x; }`）。
- **机器端**：资源有限（寄存器、控制、ALU、CPU）、对性能极度敏感。

翻译要做四件事：读懂程序、精确判定其要求的动作、设计如何忠实执行、指挥机器执行。

### 2.1 四级翻译流水线

```
语言 (Language)        fun(y){ x=y-2; return x; }
   ▼
高层 VM (High-Level VM)  字节码：load_local / load_const / sub / store_local / return
   ▼
低层 VM (Low-Level VM)   类 SSA/LLVM IR：%2 = sub %0 %1; store %x %2; ...
   ▼
机器码 (Machine Code)    sub 8 %rsp; mov ...; sub %rcx %rax; ret
```

---

## 3. 项目的五个阶段（The Five Phases）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（MITScript 五阶段）</strong>
<ol>
<li><strong>Parser</strong>（形式文法与解析理论）</li>
<li><strong>Interpreter</strong>（程序语义）</li>
<li><strong>Garbage Collector</strong>（内存管理）</li>
<li><strong>Virtual Machine</strong>（语法制导翻译，syntax-directed translation）</li>
<li><strong>Code Generation and Optimization</strong>（效率）</li>
</ol>
Phase 1–2 个人完成（学完应完整掌握 MITScript 语法与语义）；Phase 3–5 三人一组；最后一天是 Project Derby。可用语言 C/C++。允许用 LLM（见网站政策）。
</div>

> 注意阶段顺序：本课先实现**解释器**（直接执行语义）再实现 **VM/编译器**——与"先编译"的传统课程不同，体现了"先把语义讲清楚"的教学路线。

---

## 4. 语言环境的三个层次

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（MITScript 环境的三层）</strong>
<ul>
<li><strong>语言（"What"，做什么）</strong>：Parser（语法）+ Interpreter（语义）。</li>
<li><strong>虚拟机（"How"，怎么做）</strong>：指令集（单步操作）+ 执行组织（code/stack/heap）+ 内存管理。</li>
<li><strong>机器码（"the truth"，真相）</strong>：指令集 + 执行组织（段、栈、页）。</li>
</ul>
</div>

### 4.1 解释器即语义规格

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（好的语义规格的标准）</strong>
解释器（Interpreter）的目标是<strong>给出程序行为的规格</strong>，应当：
<ul>
<li><strong>精确 (Precise)</strong>：细到足以产出一个实现；</li>
<li><strong>完整 (Complete)</strong>：覆盖语言的所有特性；</li>
<li><strong>无歧义 (Unambiguous)</strong>：合理的解读导向相同结果；</li>
<li><strong>平衡 (Balanced)</strong>：传达设计目标（正确性），又给实现者选择空间（性能）。</li>
</ul>
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（语义的微妙：Ruby 的乘法重载）</strong>
Ruby 的 <code>*</code> 按操作数类型重载：<code>multiply(string,int)→string</code>，<code>multiply(float,float)→float</code>。
<pre>
print ARGV[0] * 2.2   # "100" * 2.2 → Ruby 把 2.2 强制为 2 → "100100"
print 2.2 * ARGV[0]   # 2.2 * "100" → TypeError: String can't be coerced into Float
</pre>
顺序不同结果迥异——语义必须精确到这种程度。
</div>

---

## 5. MITScript 虚拟机（栈式字节码 VM）

源程序 `f = fun(y){ x=y-2; }; f(1);` 编译为两个 function 对象（外层 + `f` 的函数体），各含 `constants`、`local_vars/names`、`instructions`。

### 5.1 执行组织（Code / Stack / Heap）

- **Code**：指令、函数、元数据。
- **Globals**：全局变量。
- **Stack**：若干**栈帧 (frame)**，每帧含 Locals、指令指针 IP、**操作数栈 (operand stack)**。
- **Heap**：关联数组（associative array）等堆对象。

### 5.2 一次执行的栈机轨迹（节选）

外层指令 `load_const 1 / load_func 0 / alloc_closure / store_global 0 / ... / call / pop / load_const 0 / return`：

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（栈式 VM 执行 <code>f(1)</code>）</strong>
<pre>
alloc_closure  → 堆上建 Closure{f:…, ctx:[]}，存入 Globals[f]
load_global 0  → 操作数栈压入闭包
load_const 2(=1), swap, ...  → 准备实参
call           → 新建栈帧：Locals={y:1, x:.}，IP=0，跳入 f 体
  load_local 0 → 压 y=1
  load_const 1(=2) → 压 2
  sub          → 1-2 = -1
  store_local 1→ x = -1
  load_const 0(=None); return → 返回 None，弹帧
pop            → 丢弃返回值
load_const 0; return → 外层返回 None
</pre>
</div>

> 这套"操作数栈 + 帧 + 字节码解释循环"就是 Phase 4 要实现的 VM 雏形。

---

## 6. 动态语言为什么慢（Why Dynamic Languages Are Slow）

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（一条 <code>x=(y+7)+t</code> 的代价）</strong>
静态 C 只需 3 条指令（<code>mov; add; add</code>）。动态语言却要：检查 y 的类型 → 从 y 的值对象取整数 → 从 7 的值对象取整数 → 分配新对象存 y+7 → 检查新值是整数 → 检查 t 是整数 → 分配新对象存 (y+7)+t → 让 x 指向新对象。
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（字段访问 <code>t.x=5; v=t.x</code> 的代价）</strong>
静态结构体 <code>struct X{int x,y;}</code> 只是几条带偏移的 mov。动态语言要：新建字符串→值的 map、新建值 5、检查 t 是 map、对 key "x" 做插入、再检查 t 是 map、对 key "x" 做查找、写回 v。
</div>

> 这就是 Phase 5（代码生成与优化）的动机：通过**分析**识别"y 一定是整数"等事实，再**变换**消除类型检查、装箱与堆分配。一段 `fun(y){x=y-2;}` 经优化可从"1000+ 指令、10+ 次函数调用、100+ 次内存访问、>1 次分配"压到"7 指令、1 次调用、2 次内存访问、0 次分配"。

---

## 7. 优化预览：`sumcalc` 案例

与经典编译器课相同的引子——同一段 C 经逐步优化（常量传播 → 代数化简 → 复制传播 → CSE → 死代码消除 → 循环不变外提 → 强度削弱 → 寄存器分配），内层循环从 29 条指令降到 12 条，执行时间从 43 秒降到 17 秒。（详见 L19 优化讲。）

**优化的目标维度**：性能/速度、代码体积、能耗、编译速度、安全/可靠性（如 Spectre 与 Meltdown）、可调试性。

---

## 8. 本讲小结

- 动态语言 = 变量类型可变 + 数据类型灵活；强表达力，但实现昂贵。
- MITScript 项目把动态语言经"高层 VM 字节码 → 低层 VM IR → x86"四级降级；五阶段：Parser / Interpreter / GC / VM / CodeGen+Opt。
- 三层视角：语言（What）/ 虚拟机（How）/ 机器码（truth）；解释器即语义规格，应精确、完整、无歧义、平衡。
- 栈式字节码 VM：Globals + 帧（Locals/IP/操作数栈）+ Heap，解释循环逐条执行。
- 动态语言慢在类型检查、装箱、堆分配；优化通过分析+变换消除之，这是后续大量内容的动机。
