#  6.1910 计算结构（Fall 25）

https://6191.mit.edu/spring26

- [Student's 6.004 notes from FA20](https://web.stanford.edu/~lindrew/6.004.pdf)



Computation Structure

## 先行条件

（无）

## 课程描述


本课程介绍数字系统与计算机体系结构的设计方法，重点强调使用高级硬件描述语言（HDL）表达硬件设计并完成综合（synthesizing）。主要内容包括：

- 组合逻辑与时序电路
- 可编程硬件的指令集抽象
- 单周期与流水线处理器实现
- 多级存储层次（缓存、主存等）
- 虚拟内存机制
- 异常处理与输入/输出（I/O）系统
- 并行计算体系结构

 

## 阅读资料

-  [Digital Design A Systems Approach.pdf](Digital Design A Systems Approach.pdf) , William J. Dally and R. Curtis Harting, Cambridge University Press, 1st ed., 2012.
-  [6004_student_notes_FA20.pdf](6004_student_notes_FA20.pdf) 
-  [Computer Organization and Design RISC.pdf](Computer Organization and Design RISC.pdf) , David A. Patterson and John L. Hennessy, Morgan Kaufmann, 1st ed., 2017.
-  [6.004ComputationStructures.pdf](6.004ComputationStructures.pdf) *Note: These materials correspond to the old version of 6.004, and parts of it are out of date.*

|                                                       | Digital Design: A Systems Approach           | Computer Organization and Design, RISC-V Edition | Computation Structures Online Materials                      |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| L01 The digital abstraction                           | Chapter 1, 1.1, 1.2 (pages 3-8)              |                                                  | [Notes 5.1-5.8](https://web.archive.org/web/20251115181415/http://computationstructures.org/notes/digitalabstraction/notes.html) |
| L02 Boolean algebra                                   | Chapter 3, 3.1-3.5                           |                                                  | [Notes 7.1-7.7 (skip 7.7.1)](https://web.archive.org/web/20251115181415/http://computationstructures.org/notes/combinational_logic/notes.html) |
| L03 Combinational logic 1                             | Chapter 8, 8.1-8.7                           |                                                  | Minispec combinational tutorial                              |
| L04 Combinational logic 2                             | Chapter 12, 12.1                             |                                                  | [Minispec combinational tutorial, Notes 12.2](https://web.archive.org/web/20251115181415/https://computationstructures.org/notes/tradeoffs/notes.html) |
| L05 CMOS                                              | Chapter 4; Chapter 5, 5.1-5.3                |                                                  | [Notes 6.1-6.4](https://web.archive.org/web/20251115181415/https://computationstructures.org/notes/cmos/notes.html) |
| L06 Sequential logic 1                                | Chapter 14, 14.1-14.3; Chapter 15, 15.1-15.3 |                                                  | [Notes 8.1-8.3.5](https://web.archive.org/web/20251115181415/http://computationstructures.org/notes/sequential_logic/notes.html) |
| L07 Sequential logic 2                                | Chapter 14, 14.1-14.3; Chapter 15, 15.1-15.3 |                                                  | Minispec sequential tutorial                                 |
| L08 Pipelining                                        | Chapter 23, 23.1-23.3                        |                                                  | [Notes 11.5-11.7](https://web.archive.org/web/20251115181415/http://computationstructures.org/notes/performance/notes.html) |
| L09 Design tradeoffs                                  | Chapter 23, 23.4-23.5                        |                                                  | [Notes 12.3](https://web.archive.org/web/20251115181415/https://computationstructures.org/notes/tradeoffs/notes.html) |
| L10 Compilers and Assembly                            |                                              | Chapter 2, 2.1-2.3, 2.5-2.7, 2.10                |                                                              |
| L11 Single-cycle processor                            |                                              | Chapter 4, 4.1-4.4                               |                                                              |
| L12 The memory hierarchy                              |                                              | Chapter 5, 5.1-5.3                               | [L14 notes, up to slide 24](https://web.archive.org/web/20251115181415/https://computationstructures.org/lectures/caches/caches.html) |
| L13 Caches                                            |                                              | Chapter 5, 5.3-5.4, 5.8                          | [L14 notes, slides 25-40](https://web.archive.org/web/20251115181415/https://computationstructures.org/lectures/caches/caches.html) |
| L14 Pipelined processors 1                            |                                              | Chapter 4, 4.5-4.6                               |                                                              |
| L15 Pipelined processors 2                            |                                              | Chapter 4, 4.6-4.8 (until page 309)              |                                                              |
| L16 Operating systems                                 |                                              | Chapter 4, 4.9; Chapter 5, 5.6                   |                                                              |
| L17 Virtual memory 1                                  |                                              | Chapter 5, 5.7                                   | [VM lecture notes](https://web.archive.org/web/20251115181415/https://computationstructures.org/lectures/vm/vm.html) |
| L18 Virtual memory 2                                  |                                              | Chapter 5, 5.7                                   | [VM lecture notes](https://web.archive.org/web/20251115181415/https://computationstructures.org/lectures/vm/vm.html) |
| L19 Exceptions and I/O                                |                                              |                                                  |                                                              |
| L20 Synchronization                                   |                                              |                                                  | [L19 notes](https://web.archive.org/web/20251115181415/http://computationstructures.org/lectures/synchronization/synchronization.html) |
| L21 Cache coherence                                   |                                              | Chapter 5, 5.10                                  | [L21 notes, slides 23-27](https://web.archive.org/web/20251115181415/http://computationstructures.org/lectures/parallel/parallel.html#23) |
| L22 Parallel Processing                               |                                              |                                                  |                                                              |
| L23 Modern Processor Architecture - Branch prediction |                                              | Chapter 4, 4.8 (pages 310-315)                   |                                                              |





### 课程内容

模块一： 数字系统设计（组合和时序电路）

---

- 二进制的表示和运算
- RISC-V 指令集
- RISC-V汇编语言编程
- 用汇编语言表示高级语言
- 过程调用约定

模块二： 计算机架构（汇编语言、处理器、缓存和流水线）

---

- 数据抽象
- boolean 运算和组合逻辑
- 时序逻辑
- 用Bluespec表达逻辑设计，一种现代的硬件设计语言
- 逻辑语法
- 流水线和折叠电路

- 实现非流水线RISC-V计算机
- Cache
- 实现流水线RISC-V计算机
  - 控制冒险和数据冒险，旁路技术
- 分支预测

模块三： 计算机系统（OS、VM、I/O）

---

- 操作系统
- I/O中断和异常
- 虚拟内存

模块四：并行编程和多核问题

---

- 同步
- 缓存一致性

### 学习目标

完成后，期望你能掌握

1. 理解抽象在大型数字系统设计中的作用，并能阐述现代计算机系统中的主要软硬件抽象层次。
2. 运用延迟（latency）和吞吐量（throughput）等指标分析数字系统性能。
3. 基于多种数字抽象方法设计简单硬件系统，包括：
   - 只读存储器（ROM）与逻辑阵列
   - 逻辑树
   - 状态机
   - 流水线
   - 总线
   - 通过组件库综合数字系统，并在仿真环境下测试设计。
4. 深入理解中等复杂度数字系统（基于简易RISC架构的计算机）的运作机制，直至门级实现，具备其组件的综合、实现与调试能力。
5. 掌握数字系统工程师所需的核心技术能力。

## Labs

https://github.com/bonbon-on-fire/computation_structures_class_2026

1. 组合电路
2. ALU设计
3. 时序电路
4. 处理器实现
5. 设计Cache
6. Pipelined 处理器
7. OS

## 相关课程

UC伯克利： [Home | CS 61C Spring 2024](https://cs61c.org/sp24/)

CMU： [CMU  18-447 Introduction to Computer Architecture – Spring 2015\] (cmu.edu)](https://course.ece.cmu.edu/~ece447/s15/doku.php?id=labs)



## 参考资料

- Minispec
  - Minispec tutorials
    - Combinational logic [[interactive\]](https://web.archive.org/web/20240104095049/https://6004hub.csail.mit.edu/hub/user-redirect/git-pull?repo=%2Fhome%2Fvagrant%2Fminispec-tutorials&urlpath=tree%2Fminispec-tutorials%2FCombinational.ipynb) [[pdf\]](https://web.archive.org/web/20240104095049/https://6191.mit.edu/_static/fall23/resources/references/minispec_combinational.pdf) [[pdf, executed\]](https://web.archive.org/web/20240104095049/https://6191.mit.edu/_static/fall23/resources/references/minispec_combinational_executed.pdf)
    - Sequential logic [[interactive\]](https://web.archive.org/web/20240104095049/https://6004hub.csail.mit.edu/hub/user-redirect/git-pull?repo=%2Fhome%2Fvagrant%2Fminispec-tutorials&urlpath=tree%2Fminispec-tutorials%2FSequential.ipynb) [[pdf\]](https://web.archive.org/web/20240104095049/https://6191.mit.edu/_static/fall23/resources/references/minispec_sequential.pdf) [[pdf, executed\]](https://web.archive.org/web/20240104095049/https://6191.mit.edu/_static/fall23/resources/references/minispec_sequential_executed.pdf)
    - These tutorials provide a first introduction to Minispec. They are interactive Jupyter notebooks, but we also provide PDF printouts for offline use.
  - Minispec reference
    - This is the primary reference for the Minispec language, covering its syntax and semantics in full. It is more more detailed than the Minispec tutorials, and is useful mainly to answer particular questions on syntax and to learn the language in depth.
  - 6.004 JupyterHub
    - JupyterHub server used for Minispec tutorials and to learn the language. (Please do not use this for labs, use Athena instead.)
  - Minispec syntax setup [[vim\]](https://web.archive.org/web/20240104095049/https://github.mit.edu/6004/minispec/blob/master/syntax/vim.md) [[emacs\]](https://web.archive.org/web/20240104095049/https://github.mit.edu/6004/minispec/blob/master/syntax/emacs.md) [[nano\]](https://web.archive.org/web/20240104095049/https://github.mit.edu/6004/minispec/tree/master/syntax/nano) [[pygments\]](https://web.archive.org/web/20240104095049/https://github.mit.edu/6004/minispec/blob/master/syntax/pygments/minispec.py)
    - To set up other editors, since Minispec's syntax is a subset of Bluespec's, you can use any available syntax files for Bluespec and configure your editor to treat Minispec files (ending in `.ms`) as Bluespec files. Bluespec syntax files: [[Atom\]](https://web.archive.org/web/20240104095049/https://atom.io/packages/language-bluespec-system-verilog) [[VSCode\]](https://web.archive.org/web/20240104095049/https://github.com/Raamakrishnan/bsv-for-vscode) [[Sublime Text\]](https://web.archive.org/web/20240104095049/https://github.com/thotypous/sublime-bsv)
- RISC-V
  - 6.191 (6.004) ISA Reference Tables
    - Reference for the subset of RISC-V covered in 6.191 (Includes references for assembly programming as well)

# Module 1 数字逻辑设计

- 布尔计算
- 组合电路
- 时序电路
- 用Bluespec表达逻辑电路
- 逻辑综合：
  - 从Bluespec 到逻辑电路
  - 从逻辑电路到标准的门电路库
- 并发问题

# Lec 1 数字系统抽象

这门课的聚焦点是： 设计通用处理器。

通用处理器，意味着设计出能上运行Py，Java，C等高级语言的硬件，这是一个挑战，对于执行的任何一个高级语言的特性对于硬件来说，并不敏感。机器码是软件-硬件之间的接口约定

微处理器是构建计算机系统的基本块： 即便你不从事硬件设计，但是理解他们的工作原理对于程序员来说也是很重要的。微处理器是世界上最复杂的数字系统：理解它能够帮助你设计各种各样的硬件。

本课程依赖的工具：**minispec**， 简化版的Bluespec SystemVerilog（BSV）。我们用一个高级的编程语言来表达设计，它最终会被编译产生电路描述。

一个观点——即使我们将来在职业生涯中不从事硬件的构建，我们可能仍然会设计一些尖端系统，因此我们需要具备良好的硬件知识。更重要的是，在现代社会中，系统变得越来越专业化。通用处理器的性能改进正在达到极限——如果我们回顾自80年代以来处理器的性能，我们已经取得了惊人的的（50000倍）提升，主要是首先遵循摩尔定律（告诉我们可以在芯片上拥有指数级数量的晶体管），然后是德纳德缩放。但在目前，这种性能改进基本上已经停止，公司现在开始构建定制硬件以满足他们的需求。因此，我们可能需要使用和设计专用硬件，而不仅仅依赖于通用处理器。

## Outline

- 数字信号系统
- 电压转换特性

[lec1.md](./lec1.md)



# Lec 2 组合逻辑设备和布尔算术

组合逻辑设备（combinational device）是一种电路器件满足：

- 一个或多个输入
- 一个或多个输出
- 功能规范（functional specfication），必须明确定义所有可能输入组合对应的输出值。
- 时序规范（Timing Specification），必须指定传播延迟，从输入稳定到输出稳定的最长时间上限。确保器件在$t_{PD}$​内完成计算并输出有效结果

上述四个标准统称为**静态准则**，是所有组合逻辑器件必须满足的基本要要求。

![image-20250423160210914](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6809686d658e1.png)

功能规范，有不少方法用于详述组合逻辑设备的功能规范。我们将使用两种系统性方法：真值表和布尔表达式（boolean expression）

## Outline

- 布尔算术
- 从布尔算术到门电路
- 总结

[lec2.md](./lec2.md)

# ISA 与汇编（见 Lec 9）

RISC-V ISA、寄存器、指令类型、控制流、存取、编码限制、伪指令，以及编译高级语言、过程调用/栈、内存布局与 MMIO 等内容已整理至 [lec9.md](./lec9.md)（可编程机器）。

# Lec 3 用Bluespec描述组合电路

算术计算和布尔算术有很强的联系。数字可以用二进制（base 2）来表示，并且能对其进行算术运算。更进一步，二进制的算术运算和布尔代数中的逻辑运算之间存在一一对应关系，比如，二进制加法可以用 XOR 和 AND 实现（比如半加器、全加器）

因此，我们可以把所有的算术操作（像加、减、乘等）用布尔表达式来表示，而这些布尔表达式就可以被实现成**组合逻辑电路**（combinational circuits）

## Outline

- 加法器
- 多路复用器
- 移位器

[lec3.md](./lec3.md)

# 编译表达式、函数与栈（见 Lec 9）

编译表达式/条件/循环、过程调用约定、栈与活动记录等内容已整理至 [lec9.md](./lec9.md)。

# Lec 4 二进制计算

## Outline

- 二进制运算
- 加法器实现优化

[lec4.md](./lec4.md)

# Lec 5 CMOS技术 & 组合电路：从布尔计算到门电路

实验2的目标是设计一个32位的ALU，这是计算机中极为常见的组件。已经见过两位全加器（FA）串联组成的 2-bit ripple-carry adder，如果要扩展成 W 位加法器，该怎么办？今天要讲如何通过循环来描述参数化的电路（比如位宽是参数）。在硬件中是没有真正“循环”的——组合逻辑电路本质上就是盒子之间的循环连接。

- 在硬件设计语言（比如 BlueSpec）中，所有数据结构最终都会被转换为位向量（bit vectors）。不管是整数、布尔值、颜色等等，最后统统是0和1。

- **循环**：必须是**可以在编译时完全展开的**。如果循环依赖数据（动态条件），编译器会直接报错，因为硬件是静态的、不能在运行时决定循环次数。

- **函数调用**：也不会有动态调用或堆栈，而是通过内联（inlining）——函数体在编译时直接展开，变成一块具体电路。
- **最终生成的硬件结构是一个无环图（DAG）**：节点是逻辑门、运算器，连线是信号传递，没有循环反馈。





最重要的是记住：Bluespec 的目标是描述电路，电路本质上像是画图（画出各种盒子和连线），只不过每个盒子（比如与门、或门或者更大的模块）都有具体、可定义的功能，可以用真值表来描述。这和普通画图不同，它们有确定的意义。

虽然 Bluespec 设计的首要目的是描述并综合硬件，但同样重要的是，它也能模拟电路，以验证功能正确性（functional correctness）。所以，每当你写一个 Bluespec 程序时，除了可以综合成电路，还能通过输入输出测试来验证其行为。**Bluespec 存在的根本原因是为了生成电路，而不是为了计算答案**。因此，Bluespec 的编译过程与传统软件语言不同。Bluespec 在编译过程中会执行大量静态展开（static elaboration）：比如所有数据结构最终都会转换成位向量（bit vectors），整数、布尔值、枚举颜色等在电路中统统变成 0 和 1；



需要特别小心的是，优化器（compiler）可能会对电路做大量优化，导致生成的电路和你原本写的程序结构差异很大。比如，如果你只想让电路做“加 4”的操作，编译器可能合成出比一般加法器更小、更快的专用电路。通过 Lab 2，你会慢慢体会这种优化带来的不同。

回到 ripple-carry adder。展开（unfold）循环时，如果你设定了宽度 W，比如 2 位，就可以按照如下步骤进行静态展开：首先用 i=0 替换循环体，得到第一个 full-adder，输出 c1 和 s0；接着用 i=1 替换，第二个 full-adder 输入 c1，输出 c2 和 s1。这样，carry 位的连接关系是自动建立起来的。编译器也会确保命名的一致性，比如 c1 始终表示同一根连线。

[lec5.md](./lec5.md)

# Lec 6 时序电路



[lec6.md](./lec6.md)

# Lec 7 用接口实现时序电路模块

[lec7.md](./lec7.md)

# Lec 8 Bluespec 硬件综合



[lec8.md](./lec8.md)

# Lec 9 可编程机器

ISA 抽象、RISC-V 汇编、编译高级语言、过程调用与栈、内存布局与 MMIO。

[lec9.md](./lec9.md)

# Lec 10 单周期处理器

[lec10.md](./lec10.md)

# Lec 11 多周期处理器

# Lec 13 缓存

[lec13.md](./lec13.md)

# Lec 14 缓存实现

[lec14.md](./lec14.md)

# Lec 15 流水线的介绍

[lec15.md](./lec15.md)

# Lec 16 处理器流水线： 数据和控制冒险

## Outline

- 回顾
- 数据冒险
- 控制冒险
- 总结

[lec16.md](./lec16.md)

# Lec 17 实现流水线：模块接口 & 并发



[lec17.md](./lec17.md)

# Lec 19 操作系统

[lec19.md](./lec19.md)



# Lec 20 虚拟内存

[lec20.md](./lec20.md)

# Lec 21 处理器流水线

[lec21.md](./lec21.md)



# Lec 22 复杂流水线和分支预测

[lec22.md](./lec22.md)

# Lec 23 旁路技术和EHR

旁路技术（bypassing， 又叫 forwarding）是一种为了减少stall，在数据的生产-消费者之间的提供额外的数据通路的技术。常规途经而言，一个值会被写回寄存器文件（register file），然后由 decode 阶段读取。而Bypassing允许值被计算出来的同时，就直接被decode阶段使用，而不等写回。

**副作用**：Bypassing 会引入新的组合逻辑路径，可能导致组合延迟增加，从而延长时钟周期，也会增加芯片面积。

**权衡**：是否启用bypassing取决于软件/程序运行时使用模式，必须通过实际综合（synthesis）去评估性能收益 vs. 成本。

![image-20250422064445680](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6806ca6952f5d.png)

EHR（Explicitly Handled Registers）是Bluespec 中一种机制，用于精确控制寄存器的写入和读取，搭配 bypassing 使用时，可以实现更灵活的控制路径数据传递和调度。

[lec23.md](./lec23.md)

# Lec 24 并发与同步

同步（Synchronization）。我们已经学习OS通过时间片轮转让多个进程共享CPU，现在进一步，即使在单个进程内，也可以划分多个线程，现代CPU是多核的，我们系统尽可能并行执行多个线程。多线程执行一般分为独立线程，和协作线程，其中独立线程各自，除非访问共享资源，否则可并行运行；而协作线程则是共享数据，一起解决问题，**必须同步通信**。



## Outline

- 同步场景 & 模式
- 引例：有界缓冲区问题
- 信号量
- 死锁问题

[lec24.md](./lec24.md)

# Lec 25 缓存一致性

缓存一致性（Cache coherence），在现代微处理器中，往往会有多个核心，每个核心都有一个私有缓存（以提高加载/存储性能），但是，主存是所有核心共享的。因此核心经常通过与主内存的交互来进行通信。因此，我们需要确保操作看起来像是在一个共享内存上进行。

![image-20250419151459671](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68044c354bb11.png)

问题出现在，如下示例。0号核心通过加载指令获取0xA地址上的值为2，接着2号核心向0xA地址设置值为3，此时0号核心上私有缓存的0xA的值是过时的。 解决办法就是，通过一个缓存一致性协议来控制缓存的内容，避免出现过期缓存行，比如，核心2在写入3之前将核心0的副本无效化（invalidate）。

## Outline

- 缓存一致性协议
- 基于监听的缓存一致性
- 基于目录的缓存一致性
- 缓存一致性的实践经验

[lec25.md](./lec25.md)
