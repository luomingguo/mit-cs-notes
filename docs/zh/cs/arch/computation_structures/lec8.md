---
title: Bluespec / Minispec 硬件综合
type: lecture
lecture: 8
tags: []
status: complete
---
# Lec 8 Bluespec / Minispec 硬件综合

[Lec 7](lec7.md) 建立了模块抽象（submodule / method / rule / input）。本讲聚焦**综合**：这些高级描述如何变成实际硬件，并用 GCD（最大公约数）这个**多周期 FSM** 完整走一遍“模块化设计一个时序计算”的流程。

## 综合模型：方法 + 规则 → 组合逻辑 + 寄存器

回顾 [Lec 6](lec6.md) 的时序电路：寄存器存状态，组合逻辑算“下一状态”和“输出”。在模块里：

- **方法（method）** 综合成算输出的组合逻辑；
- **规则（rule）** 综合成算下一状态的组合逻辑，并在每个时钟沿把结果 `<=` 进寄存器；
- **规则每个周期都触发一次**——它读当前状态与 input，算出 `<=` 的新值。

> 因此“写 Minispec ≈ 画出方法/规则两块组合逻辑，再把寄存器接上”。所有 `if`/`?:` 在组合逻辑里都成为 **mux**（[Lec 3](lec3.md)）；循环在编译期展开（[Lec 5](lec5.md)）。

## 多周期计算：GCD（欧几里得算法）

GCD 用辗转相减：当 `x >= y` 就 `x = x - y`；否则交换 `x, y`；直到 `x == 0`，此时 `y` 即结果。每一步是一拍，需要**多个周期**，正好体现“[时间比空间更灵活](lec7.md)”。

### Minispec 实现（朴素接口）

```minispec
typedef Bit#(32) Word;
module GCD;
  Reg#(Word) x(1);
  Reg#(Word) y(0);
  input Bool start default = False;
  input Word a default = 0;
  input Word b default = 0;
  rule gcd;
    if (start) begin
      x <= a; y <= b;                 // 装载新输入
    end else if (x != 0) begin
      if (x >= y) x <= x - y;         // 相减
      else begin x <= y; y <= x; end  // 交换（靠 <= 同周期生效，无需临时变量）
    end
  endrule
  method Word result = y;             // 结果
  method Bool isDone = (x == 0);      // 是否算完
endmodule
```

设置 `start = True` 并传入 `a, b` 即开始计算；若干周期后 `isDone` 变真，此时 `result` 给出答案。注意整段是**纯组合的条件**（综合成几个 mux + 减法器 + 比较器），由 `rule` 每周期推进一步。

### 这个接口很糟糕——为什么

> **踩坑**：上面接口**极易误用**：
> - 可能设了 `a/b` 却忘了 `start`；
> - 可能忘了先查 `isDone` 就去读 `result`（拿到中间结果）；
> - 即使 `start = False`，每周期也得把所有 input 都驱动一遍，很啰嗦。

根因仍是 [Lec 7](lec7.md) 强调的：**相关的输入/输出应当聚合**。理想接口只需两件事：一次性“启动（给全部参数，或一个都不给）”，以及取“一个**可能有效**的结果”。这要用到 `Maybe` 类型。

### `Maybe` 类型与干净接口

`Maybe#(T)` 要么 `Invalid`（无值），要么 `Valid(v)`（带值）；用 `isValid` 判断、`fromMaybe(d, m)` 取值。用它改写 GCD 的接口（Bluespec 风格，便于用守卫做自我保护）：

```bluespec
interface GCD;
  method Action            start(Bit#(32) a, Bit#(32) b);  // 一次给全参数
  method ActionValue#(Bit#(32)) getResult;                 // 取结果（守卫保证已算完）
endinterface

module mkGCD(GCD);
  Reg#(Bit#(32)) x <- mkReg(0);
  Reg#(Bit#(32)) y <- mkReg(0);
  Reg#(Bool)     busy <- mkReg(False);

  rule gcd (busy);                       // 仅在 busy 时推进
    if (x >= y && y != 0) x <= x - y;
    else if (y != 0) begin x <= y; y <= x; end
    // y == 0 ⇒ 结束（busy 在 getResult 里清除）
  endrule

  method Action start(Bit#(32) a, Bit#(32) b) if (!busy);  // 忙时不可启动
    x <= a; y <= b; busy <= True;
  endmethod

  method ActionValue#(Bit#(32)) getResult if (busy && y == 0); // 算完才可取
    busy <= False;
    return x;
  endmethod
endmodule
```

![image-20250429210202541](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6810cdd224655.png)

- `start` 的守卫 `if (!busy)`：**忙时拒绝再次启动**，避免覆盖正在进行的计算；
- `getResult` 的守卫 `if (busy && y == 0)`：**只有算完才能取**，从结构上杜绝“读到中间结果”；
- 方法的硬件信号见 [Lec 7](lec7.md)：`start` 是 Action（输入 + enable + ready），`getResult` 是 ActionValue（enable + 输出 + ready）。

模块的输入输出端口正是由其**接口**决定的：`start(a,b)` 对应两个输入端口，`getResult()` 对应一个输出端口（外加各自的 ready/enable 握手线）。

![image-20250429230615513](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250429230615513.png)

## 本讲小结

- **综合**：method→输出组合逻辑，rule→下一状态组合逻辑 + 寄存器更新；rule 每周期触发。
- **多周期模块**让我们能做组合逻辑做不到的变长计算（GCD、串行加法器……）。
- **好接口 = 聚合相关 I/O + 用 `Maybe` 表达有效性 + 用守卫自我保护**，让误用在结构上不可能发生——这正是 [Lec 7](lec7.md) FIFO 故事的教训落地。
