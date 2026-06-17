# Lec 1 引言





## 什么是计算机架构？ 

![image-20260613120530699](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613120530699.png)

通过对比EDSAC（1949年，英国剑桥大学制造的早期计算机）与现代计算设备，可以直观感受到计算机在体积、速度、成本、可靠性等方面的巨大进步。

计算机架构（*computer architecture*）的核心任务，是在功耗、性能、成本、体积等约束条件下设计机器。

研究计算机架构通常有三种方法：

1. 构建法（*construction*），即给出可以被仿真并可被综合成硬件的机器描述；本课程的重点是construction。
2. 量化评估（*quantitative evaluation*），即定量评估设计在多大程度上满足各种设计指标；
3. 测试与验证（*testing and verification*），即验证机器是否真正实现了预期功能。



## 课程目标与方法论

本课程的核心目标包括：通过构建多种不同的机器来学习计算机架构。 

学习一种新的架构描述方法，相比传统电路图，更强调可执行描述（*executable description*）

每一种架构及其每个组成部分都会用Bluespec System Verilog（BSV）的可执行代码来定义；学习BSV本质上是在学习一种并行编程（*parallel programming*）模型，因为所有硬件本身都是并行运作的；

此外还会学习如何设计测试平台（*test bench*） ，以及如何对涉及进行量化评估。



## BSV设计流程

![截屏2024-07-02 21.01.34](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6683fa3615da7.png)

BSV源代码经Bluespec编译器处理后可以走两条路径：一条是直接在Bluespec Simulator中进行周期精确（*cycle-accurate*）的仿真；另一条是先生成Verilog RTL，再交给Xilinx Vivado做仿真或综合（*synthesis*），综合结果可进一步生成gate级电路，用于功耗分析（*power analysis*），并最终可制成专用集成电路（ASIC）。

本课程中所做的所有设计，理论上都可以不修改源代码直接实现为ASIC；受时间限制，课程不会真正动手做ASIC流程，但会synthesize许多设计，并研究其时序（*timing*）和面积（*area*）结果。



## 组合电路与ALU概览

组合电路（*combinational circuit*）是一个纯函数：相同的输入永远产生相同的输出。理论上可以用真值表（*truth table*）描述任意 组合电路，但当输入规模变大时并不现实，例如一个32位加法器的真值表 需要2的64次方行。本课程统一用BSV来描述所有电路。

算术逻辑单元（Arithmetic-Logic Unit，ALU）是组合电路的典型例子：它接收两个数据输入a、b和一个操作码函数（如Add、Sub、And、Or等），输出结果；ALU内部本质上是若干个分别实现某种运算的组合电路，再通过一个由 函数控制的多路选择器（*mux*）将它们组合起来，选出对应的输出。



![image-20260613122427603](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613122427603.png)

## BSV类型系统

类型（*type*）是对值的分组，例如Integer（数学意义上的无界整数）、Bool（True/False）、Bit（0/1）等。BSV程序中每一个表达式都有且仅有一个type，这个type可以由程序员显式声明，也可以由编译器自动推导。

用户自定义类型（*user-defined type*）主要有三种：

- 结构体： 把多个字段组合成一个整体，例如包含`x_coord`和`y_coord`两个Word字段的MyStruct。

- 枚举：列举一组互斥的标签，例如表示ALU操作的AluFunc（Add、Sub、And、Or、Xor、Nor、Slt、Sltu、LShift、RShift、Sra），以及表示分支条件的BrFunc（Eq、Neq、Le、Lt、Ge、Gt、AT、NT）。

  基于枚举类型可以很自然地实现ALU：

  ```verilog
  function Data alu(Data a, Data b, AluFunc func);
    Data res = case(func)
       Add   : addN(a,b);
       Sub   : subN(a,b);
       And   : andN(a,b);
       Or    : orN(a,b);
       Xor   : xorN(a,b);
       Nor   : norN(a,b);
       Slt   : zeroExtend(pack(signedLT(a,b)));
       Sltu  : zeroExtend(pack(lt(a,b));
       LShift: shiftLeft(a,b[4:0]);
       RShift: shiftRight(a,b[4:0]);
       Sra   : signedShiftRight(a,b[4:0]);
    endcase;
    return res;
  endfunction
  
  
  // 类似地，函数aluBr(a, b, brFunc)用case语句根据brFunc返回一个Bool
  function Bool aluBr(Data a, Data b, BrFunc brFunc);
    Bool brTaken = case(brFunc)
      Eq  : (a == b);
      Neq : (a != b);
      Le  : signedLE(a,b);
      Lt  : signedLT(a,b);
      Ge  : signedGE(a,b);
      Gt  : signedGT(a,b);
      AT  : True;
      NT  : False;
    endcase;
    return brTaken;
  endfunction
  ```

- 类型别名：例如Byte等价于`Bit#(8)`，Word等价于`Bit#(32)`。

以颜色为例说明枚举的价值：如果直接用`Bit#(2)`表示三种颜色（00=Red，01=Blue，10=Green），编译器无法阻止把这些bit值和其他普通bit数据混用；而如果定义`typedef enum {Red, Blue, Green} Color deriving(Bits, Eq)`，自动按声明顺序给Red、Blue、Green分配2-bit编码（00、01、10），自动生成对应的pack和unpack函数，以及自动生成基于bit比较的==实现。这样类型系统就能防止"颜色"和"普通bit"被错误地混合使用。如果不写deriving，就需要程序员自己指定编码方式和相等性判断函数。自己写的话如下

```verilog
typedef enum {Red, Blue, Green} Color;

instance Bits#(Color, 2);
  function Bit#(2) pack(Color c);
    case (c)
      Red:   2'b00;
      Blue:  2'b01;
      Green: 2'b10;
    endcase
  endfunction

  function Color unpack(Bit#(2) b);
    case (b)
      2'b00: Red;
      2'b01: Blue;
      2'b10: Green;
      default: Red;
    endcase
  endfunction
endinstance

instance Eq#(Color);
  function Bool \== (Color a, Color b);
    return pack(a) == pack(b);
  endfunction
endinstance
```





关于Integer与`Bit#(32)`的区别：数学中的整数是无界的，但计算机系统中的整数总有固定位宽；BSV同时提供这两种类型，其中Integer仅作为编程时的便利（例如用作for循环的计数变量），并不会出现在最终生成的硬件中。

类型检查（*type checking*）的意义在于：程序员声明部分表达式的类型，编译器推导剩余表达式的类型；如果推导失败或类型声明之间互相矛盾，编译器就会报错；这能在编译期防止很多"非法连接"之类的低级错误。

关于位向量（*bit vector*）的赋值：写`Bit#(3) c=0`表示c是一个3位向量，且每一位都被初始化为0；之后单独写c[0]=0只会改变第0位，其余位不受影响；如果向量的初始值未知，可以用"?"表示。



## 用 BSV 构建加法器

全加器（*full adder*，简写fa）可以作为黑盒（*black box*）使用：它接收`x[i]`、`y[i]`和进位`c[i]`，输出本位结果`s[i]`和进位输出`c[i+1]`。将多个fa级联（*cascade*），就构成 **行波进位加法器**（*ripple-carry adder*）；例如一个2位行波进位加法器就是把两个fa按位串联，前一位的进位输出作为后一位的进位输入。

![image-20260613124928251](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613124928251.png)

如果要构建w位的行波进位加法器，按照同样模式逐位手写`c[1],s[0]=fa(...)、c[2],s[1]=fa(...)`直到`c[w],s[w-1]=fa(...)`，会非常繁琐且重复。

![image-20260613125004390](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613125004390.png)

解决方法是使用for循环，并依靠编译器在编译期把循环完全展开（*unfold*）：

```verilog
for(i=0; i<w; i=i+1)
    c[i+1], s[i] = fa(x[i], y[i], c[i]);
return {c[w], s}
```

写成上面这样，最终效果等价于把`c[1],s[0]=fa(...)`一直到`c[w],s[w-1]=fa(...)`这一长串等式手写出来。需要特别注意的是，这里的for并不是Python等语言中真正的运行时循环，而只是编译器在编译期用来减少重复代码的一种简写，它必须在w的值编译期已知的前提下被完全展开。



## 组合ALU的整体结构





## 1. 课程概述

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 建构式计算机体系结构（<em>Constructive Computer Architecture</em>）</strong><br>
以可执行描述为核心，用 BSV（<em>Bluespec System Verilog</em>）语言构造并仿真各种计算机体系结构，强调「设计即代码」，所有描述均可综合为真实硬件（ASIC/FPGA）。</div>


**设计流程（*BSV Design Flow*）**：

```
BSV 源代码 → Bluespec 编译器 → Verilog RTL → Xilinx Vivado 综合 → 门级网表
                                              ↓
                                    Bluespec 仿真器（周期精确）
```

---

## 2. 组合电路基础

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 组合电路（<em>Combinational Circuit</em>）</strong><br>
组合电路是纯函数：给定相同输入，始终产生相同输出，不含任何状态。可用真值表（<em>Truth Table</em>）完全描述，但对于大位宽电路真值表行数指数级增长（例如 32 位加法器有 $2^{64}$ 行）。</div>


### 2.1 算术逻辑单元（*ALU*）

BSV 中的组合 ALU：

```bsv
function Data alu(Data a, Data b, AluFunc func);
  Data res = case(func)
     Add   : addN(a, b);
     Sub   : subN(a, b);
     And   : andN(a, b);
     Or    : orN(a, b);
     Xor   : xorN(a, b);
     LShift: shiftLeft(a, b[4:0]);
     RShift: shiftRight(a, b[4:0]);
     Sra   : signedShiftRight(a, b[4:0]);
  endcase;
  return res;
endfunction
```

本质上是由 `func` 信号控制的多路选择器（*MUX*）。

---

## 3. BSV 类型系统

### 3.1 基础类型

| 类型      | 说明                                     |
| --------- | ---------------------------------------- |
| `Integer` | 无界整数（仅用于编译期计算，如循环展开） |
| `Bit#(n)` | n 位位向量                               |
| `Bool`    | True / False                             |

### 3.2 用户自定义类型

**枚举（*Enumeration*）**：

```bsv
typedef enum {Add, Sub, And, Or, Xor, LShift, RShift, Sra}
    AluFunc deriving(Bits, Eq);
```

**结构体（*Struct*）**：

```bsv
typedef struct {
    Word x_coord;
    Word y_coord;
} MyStruct deriving(Eq, Bits, FShow);
```

**类型别名（*Type Synonym*）**：

```bsv
typedef Bit#(8)  Byte;
typedef Bit#(32) Word;
```

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 类型系统的价值</strong>　BSV 的强类型系统在编译期拒绝非法连接（如将颜色枚举与原始位向量混用），大幅减少硬件设计中的低级错误。</div>

---

## 4. 组合电路的 BSV 编程

### 4.1 进位传播加法器（*Ripple-Carry Adder*）

全加器（*Full Adder*）：

$$\{c_{out}, s\} = a + b + c_{in}$$

w 位加法器通过 `for` 循环展开（注意：BSV 中的 `for` 是编译期展开，**不是**运行时循环）：

```bsv
for(Integer i = 0; i < w; i = i+1)
    c[i+1], s[i] = fa(x[i], y[i], c[i]);
```

### 4.2 组合 32 位乘法器

通过 32 次移位加法实现，使用 32 个串联的 `add32` 电路：

$$\text{延迟} = 32 \times T_{add32} \quad (\text{约 } 2n \text{ 个 FA 延迟})$$

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 组合乘法器面积与延迟分析</strong></div>

32 位组合乘法器使用 32 个 `add32` 电路（每个约 32 个 FA），则：

- 总 FA 数量 ≈ $32 \times 32 = 1024$
- 关键路径长度 ≈ $2 \times 32 \times 32 = 2048$ 个 FA 延迟（串联进位）

Sol：延迟过长，实用中需改用时序电路（折叠）或 Wallace Tree 结构。

---

## 5. BSV 编译阶段

1. **类型检查（*Type Checking*）**：确保每个表达式类型唯一
2. **静态展开（*Static Elaboration*）**：
   - 展开所有循环（`for` 以 `Integer` 控制）
   - 内联所有函数（包括递归函数，但需可在编译期完全展开）
   - 消除所有 `Integer` 类型（无界整数在硬件中无意义）
3. **门级生成**：生成 Verilog RTL

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 参数化设计</strong>　BSV 支持参数化电路（如 n 位加法器），编译时确定 n 后自动生成正确电路，实现了设计重用与类型安全的统一。</div>

---

## 本讲总结

BSV 通过强类型系统和静态展开，将函数式高级描述编译为可综合的门级 Verilog；组合电路以纯函数定义，所有循环在编译期展开，设计者获得「写高级代码、得硬件电路」的体验。