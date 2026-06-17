# Lec 02 — 时序电路与模块设计（*Sequential Circuits & Module Design*）
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-02-08

## 1. 时序电路的本质

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 时序电路（<em>Sequential Circuit</em>）</strong><br>
时序电路是组合逻辑 + 状态寄存器的组合。每个时钟周期，寄存器先读取旧值，经组合逻辑计算后，在时钟上升沿（<em>rising edge</em>）写入新值。</div>

寄存器的 BSV 声明：

```bsv
Reg#(Bit#(32)) x <- mkReg(0);    // 初始值为 0
Reg#(Bit#(32)) y <- mkRegU;      // 初始值不确定
```

读取是组合操作（`x` 即当前值）；写入 `x <= expr` 在时钟沿执行。

---

## 2. GCD 算法的 BSV 实现

最大公约数（*Greatest Common Divisor, GCD*）利用辗转相减法：

$$\gcd(a, b) = \begin{cases} a & \text{if } a = b \\ \gcd(a-b, b) & \text{if } a > b \\ \gcd(a, b-a) & \text{if } a < b \end{cases}$$

BSV 规则实现：

```bsv
rule swap (a > b);
    a <= b;
    b <= a - b;
endrule

rule sub (a <= b && a != 0);
    b <= b - a;
endrule
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 规则（<em>Rule</em>）</strong><br>
规则是 BSV 的基本执行单元，包含条件（<em>guard</em>）和动作体（<em>body</em>）。规则在条件为真时可以触发；每个时钟周期，调度器（<em>scheduler</em>）选择一个或多个兼容规则执行。</div>

### 2.1 带接口的 GCD 模块

```bsv
interface GCD;
    method Action start(Bit#(32) a, Bit#(32) b);
    method ActionValue#(Bit#(32)) getResult;
endinterface
```

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 保护接口（<em>Guarded Interface</em>）</strong>　BSV 方法可以携带隐式条件（guard）。`start` 方法只在模块空闲时可调用（例如 `a == 0`）；`getResult` 只在结果就绪时可调用。调用者无需显式检查——guard 自动组合在上层规则的条件中。</div>

---

## 3. FIFO 设计

### 3.1 一元素 FIFO（*1-Element FIFO*）

```
状态：Reg#(Maybe#(t)) data  ← tagged Invalid（空）
enq(x)：data <= tagged Valid x；条件：!isValid(data)
deq   ：data <= Invalid；条件：isValid(data)
first ：return fromMaybe(?, data)；条件：isValid(data)
```

**限制**：enq 和 deq 不能在同一周期并发执行（SC 冲突）。

### 3.2 两元素 FIFO（*2-Element FIFO*）

增加第二个寄存器，使入队和出队可以在同一周期进行：

```
状态：d0, d1（两个 Maybe 寄存器）
enq：写入空槽
deq：移动 d1 → d0，清空 d1
```

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 流水线吞吐量</strong>　两元素 FIFO 允许 enq CF deq（无冲突并发），使得上下游规则可同一周期同时触发，实现吞吐量为 1 的弹性流水线（<em>elastic pipeline</em>）。</div>

---

## 4. 时序乘法器设计

### 4.1 折叠乘法器（*Folded Multiplier*）

通过重复使用 **1 个** `add32` 电路，迭代 31 次完成 32 位乘法：

```bsv
Reg#(Bit#(32)) partial_product <- mkReg(0);
Reg#(Bit#(32)) x <- mkReg(0);
Reg#(Bit#(6))  i <- mkReg(32);  // 初始为 32 表示空闲

rule mul_step (i < 31);
    if (x[0] == 1) partial_product <= partial_product + (b << i);
    x <= x >> 1;
    i <= i + 1;
endrule
```

### 4.2 三种乘法器比较

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 乘法器设计权衡</strong></div>

| 类型 | 延迟（周期） | 吞吐量 | 硬件面积 |
|------|------------|--------|---------|
| 组合（*Combinational*） | 1 | 1 | 大（32 个 add32）|
| 折叠（*Folded Sequential*） | 31 | 1/31 | 小（1 个 add32）|
| 流水线（*Pipelined*） | 31 | 1 | 大（31 个 add32）|

Sol：折叠乘法器面积最小但吞吐量最低；流水线乘法器吞吐量恢复为 1，面积与延迟各取折中。

---

## 5. 模块化与抽象

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 接口（<em>Interface</em>）</strong><br>
BSV 中 `interface` 定义模块的外部可见 API（方法集合），与模块实现解耦。任何满足同一接口的模块都可以替换，实现硬件多态性（<em>polymorphism</em>）。</div>

**`if` 条件 vs. `guard` 条件的区别**：
- `if` 在规则体内：条件为假时规则仍可触发，但不执行该分支
- `guard` 在接口方法上：条件为假时整个调用该方法的规则**不能触发**

---

## 本讲总结

时序电路通过寄存器保持状态，BSV 的规则语义保证每个规则原子执行；GCD、FIFO 和迭代乘法器是时序电路的典型案例，三种乘法器设计揭示了面积—延迟—吞吐量之间的经典权衡。
