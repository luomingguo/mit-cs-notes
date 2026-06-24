# Lecture 05：语义分析（Semantic Analysis）

> 配套复习课：R4 Phase 2（IR + 语义检查项目，与 L4/L5 同属一个项目阶段）
> 参考：Cooper et al., Ch.4 §4.2 类型系统导论 / Ch.5 §5.5 类型信息

---

## 1. 问题来源（Error Issue）

L4 构建 IR 时**假设了一切正常**。但翻译过程中有许多**静态检查 (static checks)** 必须做——这就是**语义分析**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（语义分析的目标）</strong>
确保程序通过若干"理智检查 (sanity checks)"：
<ul>
<li>所有使用的变量都已定义；</li>
<li>类型被正确使用；</li>
<li>方法调用的参数个数、类型、返回值正确。</li>
</ul>
这些检查在<strong>构建 IR 时</strong>进行，由<strong>符号表驱动</strong>。
</div>

> 核心思想：语义检查与 IR 构建是**同一趟遍历**里交织进行的——很多检查恰好对应"为了能正确建 IR，所需实体是否存在"。

---

## 2. 声明层面的检查（Declarations）

### 2.1 参数 / 局部描述符

构建参数描述符或局部描述符时，手头有"类型名 + 变量名"。**检查：类型名是否标识一个合法类型**：

1. 在**类型符号表**里查；
2. 查不到 → 在**程序符号表**里查（可能是类类型）；
3. 仍查不到 → 语义检查失败。

### 2.2 局部 / 参数 / 字段符号表

构建局部符号表时有一串局部描述符，**检查重复变量名、被遮蔽（shadowed）变量名**；时机是**插入描述符时**。参数表、字段表同理。

### 2.3 类描述符

构建类描述符时有"类名 + 超类名 + 字段符号表 + 方法符号表"，检查：

- 超类名对应一个真实存在的类；
- 子类与超类字段名无冲突；
- **被重写（overridden）的方法**与超类声明的参数、返回类型匹配。

---

## 3. 表达式层面的检查（Loads & Operations）

### 3.1 Load 指令

手头是变量名 → 查找：在局部表则引用局部描述符；参数表则参数描述符；字段表则字段描述符；**找不到则语义错误**。

### 3.2 Load Array 指令

手头是"变量名 + 下标表达式"：查变量名（找不到则错）；**检查下标表达式类型是否为整数**（非整数则错）。

### 3.3 Add 等运算

手头是两个表达式。可能出错：**操作数类型不对**（如要求都是整数）。机制：

> load 指令记录所访问变量的类型；运算记录所产生表达式的类型；因此只需检查类型，错则报语义错误。

---

## 4. 类型推断与强制转换（Type Inference & Coercion）

多数语言允许 int/float/double 相加，涉及两个问题：**结果类型**与**操作数的强制转换 (coercions)**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（加法的类型规则）</strong>
数值类型构成层级：<span>$\text{int} \prec \text{float} \prec \text{double}$</span>。所有强制转换<strong>沿层级向上</strong>（int→float；int、float→double）。<strong>结果类型 = 层级中较高的那个操作数类型</strong>：
$$\text{int}+\text{float}=\text{float},\quad \text{int}+\text{double}=\text{double},\quad \text{float}+\text{double}=\text{double}$$
</div>

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（有趣的历史怪癖）</strong>
C 语言会把 <code>float</code> 类型的<strong>过程实参</strong>转换成 <code>double</code>。原因与早期 C 不写函数原型、统一用 double 传浮点以简化调用约定有关。
</div>

> **类型推断 (type inference)**：在没有显式类型声明时推断类型。加法只是其极受限的特例；它是编程语言研究的大课题，与多态（polymorphism）密切相关——"能省略多少类型声明？"

---

## 5. 类型兼容性（Compatibility）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（兼容性 / 可替换性）</strong>
赋值 <code>A = B</code> 必须检查类型兼容：<strong>B 兼容于 A</strong> 意味着——任何需要 A 的地方都能用 B 替代，B 满足 A 的所有要求，B 至少能做 A 能做的一切（Liskov 替换思想）。
<ul>
<li>Int 兼容 Int；</li>
<li>Int 与 Float 互相兼容（含强制转换）；</li>
<li>若 <strong>D 继承自 C</strong>，则 <strong>类 D 兼容于 类 C</strong>（反之不成立）。</li>
</ul>
</div>

### 5.1 对象接口与方法可用性

接口（可调用的方法集）：Point=`{getColor, distance}`，CartesianPoint=`{getColor, distance}`，PolarPoint=`{getColor, distance, angle}`。语义检查用**声明类型**判断对象是否实现了每个被调方法。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（合法与非法序列）</strong>
<p><strong>合法</strong>：</p>
<pre>
Point p = new Point();          p.distance();   // ✓
Point p = new CartesianPoint(); p.distance();   // ✓（声明类型 Point 有 distance）
PolarPoint o = new PolarPoint(); o.angle();      // ✓
Point p; PolarPoint o; p = o;                    // ✓（子类赋给父类）
</pre>
<p><strong>非法</strong>：</p>
<pre>
Point p = new PolarPoint(); p.angle();   // ✗（声明类型 Point 无 angle）
Point p; PolarPoint o; o = p;            // ✗（父类不能赋给子类）
</pre>
关键：检查基于<strong>声明类型</strong>，而非运行期实际类型。
</div>

---

## 6. 语句与调用层面的检查（Stores & Invocations）

### 6.1 Store 指令

手头是"变量名 + 表达式"：查变量名（在局部表→局部描述符；**在参数表→错**（参数通常不可被赋值，依语言而定）；字段表→字段描述符；找不到→错）；再**检查变量类型与表达式类型兼容**，不兼容则错。

### 6.2 Store Array 指令

额外**检查下标表达式为整数**，并检查数组**元素类型**与被存表达式类型兼容。

### 6.3 方法调用

手头是"方法名 + 接收者表达式 + 实参"。检查：

- 接收者表达式是类类型；
- 方法名在接收者类类型中有定义；
- 实参类型与形参类型**匹配**——"匹配"指同类型还是兼容类型？由语言规则界定。

---

## 7. 本讲小结

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定理（语义检查总览）</strong>
<ul>
<li>语义检查在<strong>构建 IR 时</strong>进行，符号表驱动；</li>
<li>许多检查对应"确保构建正确 IR 所需的实体存在"（声明、查找）；</li>
<li>其余对应简单理智检查（重复名、类型兼容、参数匹配）；</li>
<li>每门语言都有一张必须检查的清单，可在编译期标记大量潜在错误。</li>
</ul>
</div>

- 声明检查：类型名合法、无重复/遮蔽、超类存在、重写签名匹配。
- 表达式检查：变量可查到、下标为整数、运算操作数类型正确。
- 类型系统：数值层级 + 向上强制转换；兼容性 = 可替换性（含继承的子类→父类）。
- store/调用检查：可赋值性、类型兼容、接收者类型、形实参匹配。
