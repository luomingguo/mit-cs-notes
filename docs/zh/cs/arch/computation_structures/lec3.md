---
title: 用 Bluespec 描述组合电路
course: 6.1910 计算结构（Fall 25）
course_id: '6.1910'
lecture: 3
kind: system
tags: []
status: complete
---
# Lec 3 用 Bluespec 描述组合电路

算术计算和布尔算术有很强的联系。数字可以用二进制（base 2）来表示，并且能对其进行算术运算。更进一步，二进制的算术运算和布尔代数中的逻辑运算之间存在一一对应关系，比如，二进制加法可以用 XOR 和 AND 实现（比如半加器、全加器）

因此，我们可以把所有的算术操作（像加、减、乘等）用布尔表达式来表示，而这些布尔表达式就可以被实现成**组合逻辑电路**（combinational circuits）

## 本讲导览

- 加法器
- 多路复用器
- 移位器

## 加法器实现

![image-20250424131138468](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250424131138468.png)

加法器的组合逻辑：

- 半加器（Half addr）：将两个输入，两个输出，其中一个是 sum、另外一个是 carry
- 全加器（Full addr）： 三个输入（多了一个 carry 位），产生两个输出。
  - 可以由两个半加器组合成
- 级联全加器可以执行二进制加法

![image-20250424145134116](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250424145134116.png)

**描述一个 32 位的加法器**

### 半加器

| A    | B    | S    | C    |
| ---- | ---- | ---- | ---- |
| 0    | 0    | 0    | 0    |
| 0    | 1    | 1    | 0    |
| 1    | 0    | 1    | 0    |
| 1    | 1    | 0    | 1    |
|      |      |      |      |

布尔表达式为， `s = ~a·b + a·(~b) = a ⊕ b`（异或），`c = a · b`

电路组合逻辑为

![image-20250424180319629](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250424180319629.png)

```verilog
function Bit#(2) ha(Bit#(1) a, Bit#(1) b);
    Bit#(1) s = a ^ b;
    Bit#(1) c = a & b;
  	return {c, s};
endfunction

Bit#(2) t = ha(1, 0);
%%eval t[0]
%%eval t[1]

```

其中 {c, s} 表示比特的连接。注意输出`t[0] = 'h1`，`t[0] = 'h0`

### 全加器

![image-20250424182240093](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250424182240093.png)

```verilog
// 全加器
function Bit#(2) fa(Bit#(1) a, Bit#(1)b, Bit#(1) c_in);
    Bit#(2) ab = ha(a, b);
    Bit#(2) abc = ha(ab[0], c_in);
    Bit#(1) c_out = ab[1] | abc[1];
    return {c_out, abc[0]};
endfunction
```

#### Let 语法

强类型语言，当编译器能推断的时候，不需要指定变量类型，

```verilog
// 全加器
function Bit#(2) fa(Bit#(1) a, Bit#(1)b, Bit#(1) c_in);
    let ab = ha(a, b);
    let abc = ha(ab[0], c_in);
    let c_out = ab[1] | abc[1];
    return {c_out, abc[0]};
endfunction
```

### 2-bit 行波进位加法器

2 位行波进位加法器（2-bit Ripple-Carry Adder），实现两个 2 位二进制数的加法，输出 2 位和可能的进位。通过级联两个 FA 构建，利用行波进位（Ripple-Carry）传递机制。

![image-20250424231017383](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680a546b298ab.png)

```verilog
// 级联FA, 自己的实现
function Bit#(3) add2(Bit#(2) x, Bit#(2) y);
    let t = fa(x[0], y[0], 'h0);
    let t2 = fa(x[1], y[1], t[1]);
    return {t2[1], t2[0], t[0]};
endfunction
// 完全根据图上的话
function Bit#(3) add2(Bit#(2) x, Bit#(2) y);
  Bit#(2) s = 0;
  Bit#(3) c = 0;
  c[0] = 0;
  let cs0 = fa(x[0], y[0], c[0]);
  s[0] = cs0[0];
  c[1] = cs0[1];
  let cs1 = fa(x[1], y[1], c[1]);
  s[1] = cs1[0];
  c[2] = cs1[1];
  return {c[2], s};
endfunction
```

#### 多比特字赋值规则

整体赋值

```verilog
Bit#(3) c = 0;
```

部分赋值

```verilog
c[0] = c0;
```

**初始化要求：**多比特字的每一位都**必须**有初始值。使用未初始化的比特会：

- 编译器发出警告 ⚠️
- 程序行为不可预测 ❗️

## 多路复用器

### 背景： 选择某一位`x[i]`

假设`x`是 4-bit 宽，若使用常量选择器（如 `x[2]`）这仅仅是引用了一个具体的线网，并不生成额外的硬件；当使用变量选择器（如 `x[i]`）时，生成的硬件通常是一个多路选择器（例如 4 位宽的 `x` 就会生成一个 4 路 mux），因为它需要在运行时动态决定选哪一位。

![image-20250425001218478](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250425001218478.png)

### 2 路多用复用器

对于 bluespec

```verilog
(s == 0)? a: b;
```

对于 python

```python
a if s == 0 else b
```

![image-20250425001404767](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c2ed5d84e9.png)

> *踩坑：硬件没有“条件执行”*。软件里 `s ? foo(x) : bar(y)` 会**先**算 `s`，再**只**执行其中一个分支（以避免做无用的昂贵计算）。但在组合硬件里做不到这一点——`foo(x)` 和 `bar(y)` 两个电路都会被**实例化并并行求值**，mux 只是最后在两个已经算好的结果中**选一个**。因此 `?:`、`if`、`case` 在组合逻辑里统统综合成 mux，**所有分支的硬件都真实存在**。（真正的“条件执行”要到时序逻辑才有，见 [lec6](lec6.md)。）

如果你构造一个 2 路多路复用器，用于两个 n 位信号 a 和 b 之间进行选择，那么这个多路复用器的硬件实际上会被 按位复制 n 次。

举个例子，

```verilog
Bit#(4) a = 4'b1010;
Bit#(4) b = 4'b1100;
Bit#(1) s = 1'b1;
Bit#(4) out = s == 0 ? a: b;
```

背后其实是 4 个 1-bit mux

```verilog
out[0] = s? b[0]: a[0];
out[1] = s? b[1]: a[1];
out[2] = s? b[2]: a[2];
out[3] = s? b[3]: a[3];
```

每一位都独立地选择，但共享相同的选择信号 `s`

### 4 路多路复用器

```verilog
case ({s1, s0})
  0: a;
  1: b;
  2: c;
  3: d;
endcase
```

![image-20250426090345432](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c30f3e19cf.png)

```python
def mux(a, b, s):
  if s == 0:
    return a
  elif s == 1:
    return b
  elif s == 2:
    return c
  else:
    return d
```

n 路多路复用器可以用 n-1 个两路多路复用器实现。

## 移位器

 固定长度的移位操作在硬件中非常廉价，只需完成接线操作（纯布线操作）

![image-20250426091522007](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c33b0de0c6.png)

循环移位和算术移位也差不多。循环移位就是把最高位接回最低位即可，仍然是接线；算术右移为例，保留符号位，最左边补原来的符号位，其他仍然通过布线完成。算术移位对于，乘除$2^n$的操作非常方便。

![image-20250426091537653](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c33bc85f92.png)

### 逻辑右移 n 位

**暴力法**

![image-20250426093648656](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c38b449578.png)

假设我们想要实现一个把 x 左移 n 位（$0 \le n \le 31$）的动态移位器，该怎么做？

一个简单的方法，就是准备 32 个移位器，通过 n 路的多路复用器连接。

>  这种方式需要多少个 2 路 1 位的多路复用器实现该结构？

Solution： n * (n-1)。 意思是把所有可能的移位结果（不需要 mux，只要移位连线）都准备好，然后用 n 路的大 mux 选择，对于每一位而言，例如 y[0]， 可能来自 x[0], x[1]...x[7]中的任何一个，换句话说，需要 8:1mux，因此最终结果就是 n * (n-1) 个 mux。

**分级移位**（barrel）法

我们把 "移 k 位" 拆成几个固定移位的“步骤”，每个步骤只处理一种移位大小（比如移 1 位、移 2 位、移 4 位……），为什么可行？ 任何整数 `k` 都可以分解为 2 的幂的和（，例如移位 `x` 5 位 ，5 的二进制是`101`，所以先左移 4 位，再左移 1 位。

![image-20250426131430571](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/680c6bbd79e8d.png)

结构上来说，假如我们处理 8 位数据：

1. **shift by 1**：通过 2:1 mux 决定是否左移 1 位
2. **shift by 2：再通过一层 mux 决定是否左移 2 位
3. **shift by 4**：再通过一层 mux 决定是否左移 4 位

这样就可以组合出 0～7 的任何移位值 。一般地，对 $N$ 位输入，移位量 $s$ 用 $\log_2 N$ 个比特编码，每一位 $s[i]$ 控制“是否移 $2^i$ 位”的一层 mux。

**条件移位： 移位 vs. 不移位对比**

我们需要一个多路复用器（mux）来从两个输入中选择合适的线路：如果选择信号`s == 1`，mux 会选择左边的线路，否则将选择右边的线路

> **成本对比（重点）**：
> - 暴力法（$N$ 个固定移位器 + 一个 $N$:1 大 mux）：每个输出位需要 $N{-}1$ 个 2:1 mux，共约 $N(N{-}1)$ 个 1 位 mux（$N{=}32$ 时约 992 个），即 $\Theta(N^2)$。
> - barrel shifter：只有 $\log_2 N$ 层，每层 $N$ 个 1 位 mux，共 $N\log_2 N$ 个（$N{=}32$ 时 160 个），即 $\Theta(N\log N)$。
>
> N=4 的 Minispec barrel shifter 示例：
> ```bluespec
> function Bit#(4) barrelShifter(Bit#(4) x, Bit#(2) s);
>   Bit#(4) r1 = (s[1] == 0) ? x : {2'b00, x[3:2]};  // 是否右移 2 位
>   Bit#(4) r0 = (s[0] == 0) ? r1 : {1'b0, r1[3:1]}; // 是否再右移 1 位
>   return r0;
> endfunction
> ```
