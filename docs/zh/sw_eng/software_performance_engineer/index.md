---
sidebarDepth: 2
title: 软件性能工程


sidebar: true
aside: right
editLink: true
lastUpdated: true
outline: 2
---

# 软件性能工程

这门课涵盖与软件性能工程相关的各种主题。
## 前置学习内容
- [软件构造基础](../element_of_software_construction/index.md)
- [编程基础](../fundamentals_of_programming/index.md)

## 课表
## 主题

- Lec 1 矩阵乘法
- Lec 2 Bentley Rule
- Lec 3 比特运算技巧
- Lec 4 汇编语言和计算机体系结构
- Lec 5 C 到 汇编（基于LLVM）
- Lec 6 编译器能做什么和不能做什么
- Lec 7 多核编程
- Lec 8 竞态和并行
- Lec 9 多线程算法分析
- Lec 10 测量和计时

- Lec 11 存储分配
- Lec 12 并行存储分配
- Lec 13 Cilk运行时系统
- Lec 14 缓存和高效缓存算法
- Lec 15 缓存参数无关算法
- Lec 16 不确定性并行编程
- Lec 17 无锁同步
- Lec 18 DSL和自动调优
- Lec 19 西洋棋代码走读
- Lec 20 推测性并行
- Lec 21 TSP问题
- Lec 22 图优化
- Lec 23 高性能动态语言——Julia

# Lec 1 介绍&矩阵乘法

# Lec 2 Bentley 程序优化的法则

![image-20240928152111113](http://14.103.135.111:49153/i/66f7ae6be15b3.png)

## 总览

- 数据结构层面
- 循环语句
- 逻辑语句
- 函数层面

[lec2.md](./lec2.md)



# Lec 3 比特运算技巧

# Lec 4 汇编语言和计算机架构

如果你想写出更高效的代码，就必须了解计算机底层的工作原理。通过深入理解底层机制，你可以更好地利用计算机架构的优势。汇编语言提供了直接访问和控制计算机硬件的接口。掌握汇编语言不仅能让你编写出更高效的代码，还能帮助你理解高级语言在底层的实现方式，从而提升你的编程能力和效率。

## 总览

- x86-64 ISA 基础
- 浮点数和矢量硬件
- 计算机架构总览

[Lec4 入口](./lec4.md)

# Lec 5 从C到汇编语言（基于LLVM)

本节课我们将探讨如何C如何用x86-64的汇编实现的

## 总览

- 复习
- LLVM 概述

- C到LLVM IR
  - 直线型 C 代码到 LLVM IR
  - C 函数到 LLVM IR
  - C 条件语句 到 LLVM IR
  - C 循环语句到 LLVM IR
  - LLVM IR 属性
- LLVM IR 到 汇编
  - Linux x86-64调用约定
- 示例： Fib

[lec5.md](./lec5.md)



# Lec 6 编译器能做什么，不能做什么

在Lec 5 我们介绍了从C语言如何经过LLVM IR生成汇编语言的，这节我们将探讨LLVM IR 和汇编的 

[lec6.md](./lec6.md)

# Lec 7 多核编程

## 总览

- 共享内存硬件
- 并发平台
  - Pthread库（和WinAPI Thread）
  - 线程构建块
  - OpenMP
  - Cilk Plus

[lec7.md](./lec7.md)

# Lec 8 竞态和并行

## 总览

- 确定性竞态条件
- 什么是并行？
- 扩展性分析：Cilkscale
- 调度理论
- Cilk运行时系统

[lec8.md](./lec8.md)



# Lec 9 多线程算法分析

Schardl, Tao, William Moses, and Charles Leiserson. “[Tapir: Embedding Fork-Join Parallelism into LLVM’s Intermediate Representation](https://dl.acm.org/citation.cfm?id=3018758).” *Proceedings of the 22nd ACM SIGPLAN Symposium on Principles and Practice of Parallel Programming* (2017): 249–265.

## 总览

- 分治法
  - 主定理
- Cilk循环语句
- 矩阵乘法（TD）
- 归并排序（TD）

[lec9.md](./lec9.md)



# Lec 10 测量和计时

本节探讨如何可靠地测量软件的性能

## 大纲

- 静默系统(Quiescing System)
- 测量软件性能的工具
- 性能建模

[lec10.md](./lec10.md)

# Lec 11 存储分配

这节课关于内存的分配和释放。文献中就叫做Storage Allocation

## 总览

- 栈分配

- 堆分配 

  - 固定大小分配
  - 变长分配

- 垃圾回收

  - 引用计数法
  - 标记-清除法
  - 停止-清除法

[lec11.md](./lec11.md) 

# Lec 12 并行存储分配

## 总览

- C语言的内存分配
- 仙人掌栈

[lec12.md](./lec12.md)

# Lec 13 Cilk运行时系统

## 总览

- Cilk回顾

- 功能分析
- 性能分析
- 双端工作队列的实现
- Spawning 计算
- Stealing 计算
- synchronizing 计算

[lec13.md](./lec13.md)

# Lec 14 缓存和高效缓存算法

深入缓存和介绍如何设计高效缓存的算法。

## 总览

- 缓存硬件
- 理想的缓存模型
- 缓存感知算法
  - 分块矩阵乘法
- 缓存无关算法

[lec14.md](./lec14.md)



# Lec15 缓存无关算法

- Demaine, Erik. “[Cache-Oblivious Algorithms and Data Structures](https://erikdemaine.org/papers/BRICS2002/)” in *Lecture Notes from the EEF Summer School on Massive Data Sets*, BRICS (2002). 
- Frigo, Matteo, Charles Leiserson, et al. “[Cache-Oblivious Algorithms](https://dl.acm.org/citation.cfm?id=2071383).” *ACM Transactions on Algorithms (TALG)* 8, no. 1 (2012): article no. 4. 

## 总览

- 热扩散模拟
- 缓存无关模型计算

[lec15.md](./lec15.md)

# Lec 16 不确定性并行编程

Leiserson, Charles. “[A Simple Deterministic Algorithm for Guaranteeing the Forward Progress of Transactions](https://dspace.mit.edu/handle/1721.1/114871).” *Information Systems* 57 (2016): 69–74.

不确定性并行编程非常恶心，相比并行编程而言（就是工作量和关键路径的把握）。不确定性就是因为多线程环境由于资源竞争，导致的数据争用，导致程序的不确定性。



## 总览

- 确定性程序概念
- 互斥&原子性
- 锁的实现
- 锁的异常：死锁
- 事务性内存（TD）

[lec16.md](./lec16.md)

# Lec 17 无锁同步

阅读资料

- Leiserson, Charles. “[A Simple Deterministic Algorithm for Guaranteeing the Forward Progress of Transactions](https://dspace.mit.edu/handle/1721.1/114871).” *Information Systems* 57 (2016): 69–74.

## 总览

- 顺序一致性

- 互斥的无锁实现

- 宽松内存一致性
  - 指令重排序

  - 硬件重排序

  - 重排序的影响

- 内存屏障

- CAS

- 无锁算法（LOCK-FREE ALGORITHMS）

- ABA问题

[lec17.md](./lec17.md)

# Lec 18 DSL 和 自动调优

阅读资料

- [GraphIt: A High-Performance Graph DSL, PACMPL'18'](https://dl.acm.org/citation.cfm?id=3276491) 

- [OpenTuner: An Extensible Framework for Program Autotuning, ICPAC'14](https://dl.acm.org/citation.cfm?id=2628092)

## 总览

- DSL介绍
- GraphIt
- Halide
- Opentuning 

[lec18.md](./lec18.md)



# Lec 19 西洋棋代码走读



# Lec 20 推测性并行 & 西洋棋

## 总览

- 投机性并行
- 并行$\alpha-\beta$搜索
- Jamboree Search
- 西洋棋程序

# Lec 21 旅行商问题

## 总览

- Recursive Generaion 递归式生成
- The Traveling Salesperson Problem旅行商问题
- A Sequence of TSP Algorithms  TSP算法的一种顺序
- Principles of Algorithm Engineering 算法工程原理

[lec21.md](./lec21.md)

# Lec 22 图优化

## 总览

- 什么是图？
- 图的表示
- BFS的实现
- 优化方法
  - 并行计算
  - 图的压缩和重排序

[lec22.md](./lec22.md)

# Lec 23 高性能动态语言——Julia

 [18.S096 | Matrix Calculus for Machine Learning and Beyond ](https://ocw.mit.edu/courses/18-s096-matrix-calculus-for-machine-learning-and-beyond-january-iap-2023/pages/lecture-notes/)