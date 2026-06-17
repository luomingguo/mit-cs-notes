# 6.1920 建构式计算机架构，CCA



## 先行条件

6.1910 计算结构

## 课程介绍

本课程展示了一种“构造式（constructive）”而非“描述式（descriptive）”的计算机体系结构研究方法。课程内容包括：

- 组合式与流水线算术逻辑单元（ALU）
- 乱序执行（in-order）流水线微架构
- 分支预测
- 阻塞与非阻塞缓存（blocking and unblocking caches）
- 中断机制
- 虚拟内存支持
- 缓存一致性（cache coherence）与多核架构

课程实验使用现代硬件描述语言（HDL），用于展示处理器设计的不同方面。课程的期末项目中，学生将完成一个多核处理器设计，并在 FPGA 开发板上实现并运行该设计。



### 参考资料

- BSV Reference Manual；
- 《Introduction to Digital Design as Cooperating Sequential Machines》（Arvind等著，2019）
- 《Computer Architecture: A Constructive Approach》（Arvind等著，2014，仅需阅读第5、6、9、10、11、12章，注意其中部分内容可能与课堂讲解不完全一致）。



## 相关课程

[Digital Design and Computer Architecture - Spring 2023](https://safari.ethz.ch/digitaltechnik/spring2023/doku.php?id=start)

## 实验

https://github.com/6192-sp24



# Lec 1 引言

[lec1.md](./lec1.md)





# Lec 2 组合电路

组合电路是纯函数，给定相同的输入，它产生相同的输出。虽然可以用真值表来表达，但是对于大量的输入而言，这样做并不实际。我们将使用一种名为Bluespec SystemVerilog（BSV）的编程语言来表达所有的电路。

[lec2.md](./lec2.md)



# Lec 3 存储器与多规则系统

[lec3.md](./lec3.md)



# Lec 4 调度约束与EHRs

[lec4.md](./lec4.md)



# Lec 5 非流水线处理器

[lec5.md](./lec5.md)

# Lec 6 流水线处理器

[lec6.md](./lec6.md)





# Lec 7 高速缓存与存储缓冲区

[lec7.md](./lec7.md)



# Lec 8 分支预测



[lec8.md](./lec8.md)



# Lec 9 超标量处理器

[lec9.md](./lec9.md)

# Lec 10 多线程处理器

[lec10.md](./lec10.md)



# Lec 11 乱序执行

[lec11.md](./lec11.md)



# Lec 12 同步与顺序一致性

[lec12.md](./lec12.md)





# Lec 13 缓存一致性

[lec13.md](./lec13.md)



# Lec 14 向量机与 SIMD

[lec14.md](./lec14.md)





# Lec 15 片上网络 I：基础

[lec15.md](./lec15.md)





# Lec 16 片上网络 II：拓扑与路由

[lec16.md](./lec16.md)



# Lec 17 连接加速器

[lec17.md](./lec17.md)



# Lec 18 从 BSV 到芯片：硅综合与 FPGA

[lec18.md](./lec18.md)



# 参考资料

6.1920：Constructive Computer Architecture

[6.1920/6.175: Constructive Computer Architecture, SP24](https://canvas.mit.edu/courses/25337)

https://github.com/6192-sp24