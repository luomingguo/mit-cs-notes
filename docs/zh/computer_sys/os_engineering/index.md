---
title: 操作系统工程
description: Ron的计算机课堂

layout: doc
sidebar: true
aside: true
lastUpdated: true
# editLink: true
---

# 6.1810 操作系统工程

[fall 2024](https://pdos.csail.mit.edu/6.1810/2024/schedule.html)

## 前置课程

无

## 课程描述

主要涵盖操作系统的设计和实现，以及系统编程。课程内容包括虚拟内存、文件系统、线程、上下文切换、内核、中断、系统调用、进程间通信，以及软件与硬件之间的协调与交互。课程使用多处理器操作系统 RISC-V 的 xv6 作为示例，用来说明这些主题。个别实验作业包括扩展 xv6 操作系统，例如支持复杂的虚拟内存特性和网络功能。

 xv6是一个类似 Unix v6 的操作系统，而不是最新和最好的 Linux、Windows 或 BSD Unix 版本。xv6 大到足以展示操作系统设计和实现的基本思想，但比任何现代生产操作系统都要小得多，因此更容易理解。xv6 的结构类似于许多现代操作系统；一旦你探索了 xv6，你会发现类似的设计在诸如 Linux 内核等操作系统中也很常见。

## 实验

- [Lab: Xv6 and Unix utilities (mit.edu)]
- [Lab: System calls (mit.edu)]
- [Lab: page tables (mit.edu)]
- [Lab: Traps (mit.edu)]
- [Lab: Copy-on-Write Fork for xv6 (mit.edu)]
- [Lab: Multithreading (mit.edu)]
- [Lab: networking (mit.edu)]
- [Lab: locks (mit.edu)]
- [Lab: file system (mit.edu)]
- [Lab: mmap (mit.edu)]

## 参考资料

### 参考书

- [xv6: A simple, Unix-like teaching operating system](https://pdos.csail.mit.edu/6.S081/2022/xv6/book-riscv-rev2.pdf) by R. Cox, F. Kaashoek, and R. Morris.
- The C programming language (second edition) by Kernighan and Ritchie. Prentice Hall, Inc., 1988. ISBN 0-13-110362-8, 1998.

### RISC-V的手册

虚拟I/O标准

[Virtual I/O Device (VIRTIO) Version 1.1 (mit.edu)](https://pdos.csail.mit.edu/6.828/2023/readings/virtio-v1.1-csprd01.pdf)

## 相关课程

[CS 161: Operating Systems (harvard.edu)](https://read.seas.harvard.edu/cs161/2024/)

### 进阶课程





# Lec 1 OS 总览

## 总览

- 操作系统定义
- 操作系统目标
- OS内核一般提供什么服务？
- OS设计及实现的挑战
- 系统调用

[lec1.md](./lec1.md)

# Lec 2 C语言和内存抽象

## 总览

- C语言入门
- 内存抽象

[lec2.md](./lec2.md)

# Lec 3 OS设计

## 总览

- OS设计（以高层次视角）
- RISC-V & Xv6

[lec3.md](./lec3.md)

# Lec 4 虚拟内存/页表

假设我们在扁平的物理空间，0 到 $2^{64}$，应用程序和内核共享同一块内存，hell程序有一个 bug： 它有时会写入一个随机的内存地址。此时我们有两个问题，

- 我们如何防止它破坏内核？
- 并且防止它破坏其他进程呢？

## 总览

- 地址空间
- 分页硬件
- Xv6 虚拟内存

[lec4.md](./lec4.md)

# Lec 5 系统调用入口/出口

## 总览

[lec5.md](./lec5.md)

# Lec 6 RISC-V调用约定 & GDB

## 总览

[lec6.md](./lec6.md)

# Lec 7 页错误

## 总览

很大一部分内存实际上并没有被应用程序使用，而是由缓冲器高速缓存使用。这在操作系统中很常见，

[lec7.md](./lec7.md)



# Lec 8 xv6



[lec8.md](./lec8.md)



# Lec 9 设备驱动 & 中断

一个CPU需要与连接各种设备： 存储设备、通信设备、显式设备等等，操作系统的设备驱动控制着他们，设备驱动之所以难，有以下原因：

- 设备通常具有固定而复杂的接口
- 驱动和CPU是并行运行的——引发了并发问题
- 中断
  - 硬件需要立即响应，比如数据包到达
  - 软件必须放下当前的工作进行响应
    - 在RISC-V上，与系统调用和异常有相同的中断机制
  - 中断可能会在不合适的时间到来

## 总览

- 内存映射I/O
- 中断I/O
- 示例： 控制台/串口
- DMA



[lec9.md](./lec9.md)



# Lec 10 锁

## 总览

- 为什么要使用锁？
- 锁的抽象
  - 不同角度理解锁
- 什么时候需要用锁？
- 锁是否可以自动的？
- 锁的问题
  - 死锁
  - 模块化
  - 性能
- 示例：URAT， CAS

[lec10.md](./lec10.md)

# Lec 11 调度

任何操作系统都可能会运行比计算机 CPU 数量更多的进程，因此需要一个计划来在进程之间共享 CPU。理想情况下，这种共享对用户进程是透明的。一种常见的方法是通过将多个进程多路复用到硬件 CPU 上，为每个进程提供虚拟 CPU 的假象。下面我们介绍xv6如何实现这种多路复用技术。

> 为什么要有线程和线程切换？

1. 人们希望计算机能够支持多任务处理
2. 简化程序结构，通过使用线程，可以优雅地分解复杂的程序，降低编程的复杂性
   - 比如实验0的素数筛选的例子
3. 多核并行加速，可以充分利用多核CPU
   - 可将 xv6 内核视为一个多核并行程序



[lec11.md](./lec11.md)

# Lec 12 协调（Sleep & wakeup）

[lec12.md](./lec12.md)



# Lec 13 文件系统

本节学习文件系统，先理解为什么需要文件系统，在学习文件系统的原理，在物理上，逻辑上是如何进行组织的。

## 总览

- 文件系统的作用
- inode
- 磁盘上的布局

[lec13.md](./lec13.md)

# Lec 14 崩溃恢复 & 日志记录

这节的主题是崩溃恢复。 崩溃会导致磁盘文件系统的不一致性，解决方法就是通过写前日志（write-ahead logging）

[lec14.md](./lec14.md)

# Lec 15 Linux ext3的崩溃恢复

本节以 Linux 的 ext3 文件系统中的日志记录为案例研究，重点关注性能和实际设计细节。

阅读资料

- [Journaling the Linux ext2fs Filesystem, 1997](https://e2fsprogs.sourceforge.net/journal-design.pdf)

## 总览

- Review
- ext3

[lec15.md](./lec15.md)

# Lec 16 用户级虚拟内存

阅读资料

- [Virtual Memory Primitives for User Programs](https://www.cs.princeton.edu/~appel/papers/vmpup.pdf)

用户应用程序的虚拟内存，按照阅读论文的论点，用户应用程序应该受益于或应该具有相同的能力，用户应用程序也可以使用虚拟内存。 真正的意思是，它们希望有与内核相同的机制，在用户模式访问用户应用程序，应用程序能够接受页面错误，然后可以响应这些页面错误，可以修改保护位，或修改页表中的特权级别。

## 总览

- 应用场景
- 虚拟内存原语
- 应用领域

[lec16.md](./lec16.md)

# Lec 17 操作系统的组织 & 微内核

主题：

- 一个内核应该做什么？
- 它应该提供怎样的抽象？
- 宏内核 和 微内核 设计哲学？

答案取决于应用程序和程序员的喜好！ 没有单一的最佳答案 这个主题更多是关于思想，而不是具体的机制

阅读资料：

- [The Performance of micro-Kernel-Based Systems (1997)](https://pdos.csail.mit.edu/6.828/2024/readings/microkernel.pdf)

- (Optional) 

  - L4 微内核细节
    http://www.cse.unsw.edu.au/~cs9242/02/lectures/01-l4.pdf
    http://www.cse.unsw.edu.au/~cs9242/02/lectures/01-l4/01-l4.html

  - L4的 fast IPC 
    https://cs.nyu.edu/~mwalfish/classes/15fa/ref/liedtke93improving.pdf

  - 后来的演变版本
    https://trustworthy.systems/publications/nicta_full_text/8988.pdf

  - L4背后的思想
    https://www.cs.fsu.edu/~awang/courses/cop5611_s2004/microkernel.pdf

  - Fiasco.OC Microkernel——当下的L4

    https://l4re.org/doc/

## 总览

- 传统的宏内核背后的设计哲学
- 宏内核的缺点
- 微内核介绍
- L4微内核
- 论文阅读：微内核的性能

[lec17.md](./lec17.md)

# Lec 18 虚拟机

## 总览

- 虚拟机
- trap-and-emulate 虚拟化
- 硬件虚拟化（Intel VT-x / VMX)
- 论文阅读： Dune

[lec18.md](./lec18.md)



# Lec 19 内核和高级语言

[The benefits and costs of writing a  POSIX kernel in a high-level language OSDI'18](https://pdos.csail.mit.edu/6.828/2020/readings/biscuit.pdf)

# Lec 20 网络与OS

谈谈网络，以及它与操作系统的关系，

## 总览

- 数据包格式与协议
- 内核中软件栈
- 过载行为——这节课的论文

阅读材料

[Eliminating Receive Livelock in an Interrupt-driven Kernel, 1996](https://pdos.csail.mit.edu/6.828/2023/readings/mogul96usenix.pdf)

[lec20.md](./lec20.md)

# Lec 21 Meltdown（熔断）

安全性是OS的关键目标，我们说内核主要策略是隔离，当你用户/管理员模式，页表，防御性的系统调用等等都做好了，还有什么可能出错？

# Lec 22 多核可扩展性 & RCU

如何在多核CPU计算机上获得好的性能，这是一个非常有趣，深入且令人着迷的话题。今天我们只会涉及这个话题的很小的一个部分，**也就是在面对内核中需要频繁读但是不需要频繁写的共享数据时，如何获得更好的性能？** 在不同的场景下有不同的方法可以在多核CPU的机器上获得更好的性能，我们今天要看的是**Linux的RCU**，它对于需要频繁读的内核数据来说是一种非常成功的方法。

阅读资料：

- [RCU Usage In the Linux Kernel: One Decade Later](https://pdos.csail.mit.edu/6.828/2018/readings/rcu-decade-later.pdf)

## 总览

- 引言
- 使用锁带来的问题
- 读写锁局限性
- RCU
  - RCU的实现
  - 代码示例
  - 性能分析
  - 使用场景

[lec22.md](./lec22.md)

