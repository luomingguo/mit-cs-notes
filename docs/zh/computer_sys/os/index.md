# 6.1810 操作系统工程

[fall 2025](https://pdos.csail.mit.edu/6.1810/2025/schedule.html)

## 前置课程

无·

## 课程描述

主要涵盖操作系统的设计和实现，以及系统编程。课程内容包括虚拟内存、文件系统、线程、上下文切换、内核、中断、系统调用、进程间通信，以及软件与硬件之间的协调与交互。课程使用多处理器操作系统 RISC-V 的 xv6 作为示例，用来说明这些主题。个别实验作业包括扩展 xv6 操作系统，例如支持复杂的虚拟内存特性和网络功能。

xv6是一个类似 Unix v6 的操作系统，而不是最新和最好的 Linux、Windows 或 BSD Unix 版本。xv6 大到足以展示操作系统设计和实现的基本思想，但比任何现代生产操作系统都要小得多，因此更容易理解。xv6 的结构类似于许多现代操作系统；一旦你探索了 xv6，你会发现类似的设计在诸如 Linux 内核等操作系统中也很常见。

### 参考资料

**UNIX**

- [Youtube Unix intro](https://www.youtube.com/watch?v=tc4ROCJYbm0)
- [The UNIX Time-Sharing System](https://pdos.csail.mit.edu/6.1810/2025/readings/ritchie78unix.pdf), [Dennis M. Ritchie](http://cm.bell-labs.com/who/dmr/) and [Ken L.Thompson](http://cm.bell-labs.com/who/ken/), Bell System Technical Journal 57, number 6, part 2 (July-August 1978) pages 1905-1930.
- [The Evolution of the Unix Time-sharing System](http://www.read.seas.harvard.edu/~kohler/class/aosref/ritchie84evolution.pdf), Dennis M. Ritchie, 1979.
- *The C programming language (second edition)* by Kernighan and Ritchie. Prentice Hall, Inc., 1988. ISBN 0-13-110362-8, 1998.

**Linux内核文档**

https://www.kernel.org/doc/html/latest/

**RISC-V 模拟器**

- 虚拟I/O标准 [Virtual I/O Device (VIRTIO) Version 1.1 (mit.edu)](https://pdos.csail.mit.edu/6.828/2023/readings/virtio-v1.1-csprd01.pdf)
- QEMU - A fast and popular RISC-V platform and CPU emulator.
  - [User manual](http://wiki.qemu.org/Qemu-doc.html)

- [SiFive FU540-C000 Manual](https://pdos.csail.mit.edu/6.1810/2025/readings/FU540-C000-v1.0.pdf)

**RISC-V**

- *The RISC-V Reader: An open architecture atlas* by D. Patterson and A. Waterman, Strawberry Canyon, 2017.
- [RISC-V unprivileged instructions](https://drive.google.com/file/d/1uviu1nH-tScFfgrovvFCrj7Omv8tFtkp/view?usp=drive_link)
- [RISC-V privileged instructions](https://drive.google.com/file/d/17GeetSnT5wW3xNuAHI95-SI1gPGd5sJ_/view?usp=drive_link)
- [Calling conventions](https://pdos.csail.mit.edu/6.1810/2025/readings/riscv-calling.pdf)

## 实验

- [Lab: Xv6 and Unix utilities (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/util.html)
- [Lab: System calls (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/syscall.html)
- [Lab: page tables (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/pgtbl.html)
- [Lab: Traps (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/traps.html)
- [Lab: Copy-on-Write Fork for xv6 (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/cow.html)
- [Lab: Multithreading (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/thread.html)
- [Lab: networking (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/net.html)
- [Lab: locks (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/lock.html)
- [Lab: file system (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/fs.html)

- [Lab: mmap (mit.edu)](https://pdos.csail.mit.edu/6.1810/2025/labs/mmap.html)



## 相关课程



[CS 161: Operating Systems (harvard.edu)](https://read.seas.harvard.edu/cs161/2024/)

[6.5810 高阶OS, Fall22](https://abelay.github.io/6828seminar/schedule.html)

[6.5810 高阶OS, Fall23](https://kaashoek.github.io/65810-2023/)



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



# Lec 3 操作系统设计

阅读资料

- [xv6 教材的第二章](https://pdos.csail.mit.edu/6.1810/2025/xv6/book-riscv-rev5.pdf)

  - 会解释内核设计动机和实现方式

- 阅读 xv6 内核的完整实现代码

  - kernel/proc.h

    kernel/defs.h

    kernel/entry.S

    kernel/main.c

    user/init.c

思考如下问题，

- 如果某个进程调用`exec()`会发生什么？ 
- 如果某个进程调用`fork()`会调用什么？
- 如果某个进程对一个已有PID调用`kill()`，然后再调用`fork()`会发生什么？



[lec3.md](./lec3.md)



# Lec 4 操作系统的组织 & 微内核

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

[lec4.md](./lec4.md)

# Lec 5 虚拟内存/页表

阅读 xv6 内核的完整实现代码

- `kernel/memlayout.h`
- `kernel/vm.c`
- `kernel/kalloc.c`
- `kernel/riscv.h`
- `kernel/exec.c`

阅读 [xv6 教材的第3章](https://pdos.csail.mit.edu/6.1810/2025/xv6/book-riscv-rev5.pdf)



[lec5.md](./lec5.md)

# Lec 6 系统调用的出入口

今天的目标是学习从用户空间到达内核空间，以及从内核空间返回回用户空间的整个过程。系统调用、异常、设备中断进入内核都是以相同的方式，里面涉及到很多细致的设计和重要的细节，对于隔离性（安全性）和性能都非常重要。



[lec6.md](./lec6.md)

# Lec 7 系统调用拦截

在本节课中，我们将讨论“系统调用拦截（system call interposition）”，作为一种通用技术，用于限制有缺陷或恶意应用程序对系统其他部分造成的破坏。

请完成以下阅读：

1. [A Secure Environment for Untrusted Helper Applications，CH1~3](https://pdos.csail.mit.edu/6.1810/2025/readings/janus-usenix96.pdf)
   - 用于理解系统调用拦截的动机和目标
2. [Traps and Pitfalls: Practical Problems in System Call Interposition Based Security Tools](https://pdos.csail.mit.edu/6.1810/2025/readings/garfinkel-ndss-2003.pdf)
   -  该论文总结了作者在构建此类系统时遇到的实际问题和挑战



[lec7.md](./lec7.md)

# Lec 8 页错误

阅读xv6内核的实现，

- `kernel/sysproc.c:sbrk()`
- `kernel/trap.c:usertrap()`
- `kernel/vm.c:vmfault()`

阅读xv6第5章的实现理解页错误



[lec8.md](./lec8.md)



# Lec 9 磁盘分页 & 超级页





[lec9.md](./lec9.md)



# Lec 10 用户级虚拟内存



阅读论文 [Virtual Memory Primitives for User Programs, 1991](https://www.cs.princeton.edu/~appel/papers/vmpup.pdf)

思考一下如何将xv6支持`TRAP`、`PORT1` 和 `UNPORT`？

用户应用程序的虚拟内存，按照阅读论文的论点，用户应用程序应该受益于或应该具有相同的能力，用户应用程序也可以使用虚拟内存。 真正的意思是，它们希望有与内核相同的机制，在用户模式访问用户应用程序，应用程序能够接受页面错误，然后可以响应这些页面错误，可以修改保护位，或修改页表中的特权级别。

## 总览

- 应用场景
- 虚拟内存原语
- 应用领域

[lec10.md](./lec10.md)



# Lec 11 设备驱动 & 中断

阅读 xv6 内核的完整实现代码

- `kernel/console.c`
- ``kernel/uart.c``
- `kernel/kernelvec.S`

阅读 [xv6 教材的第6章]()



[lec11.md](./lec11.md)



# Lec 12 锁

阅读xv6内核的实现，

- `kernel/spinlock.h`
- `kernel/spinlock.c`

阅读xv6第7章的实现理解页错误

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



[lec12.md](./lec12.md)

# Lec 13 调度



任何操作系统都可能会运行比计算机 CPU 数量更多的进程，因此需要一个计划来在进程之间共享 CPU。理想情况下，这种共享对用户进程是透明的。一种常见的方法是通过将多个进程多路复用到硬件 CPU 上，为每个进程提供虚拟 CPU 的假象。下面我们介绍xv6如何实现这种多路复用技术。

> 为什么要有线程和线程切换？

1. 人们希望计算机能够支持多任务处理
2. 简化程序结构，通过使用线程，可以优雅地分解复杂的程序，降低编程的复杂性
   - 比如实验0的素数筛选的例子
3. 多核并行加速，可以充分利用多核CPU
   - 可将 xv6 内核视为一个多核并行程序





[lec13.md](./lec13.md)

# Lec 14 协调



阅读 xv6 内核的完整实现代码

- `kernel/proc.c`
- `kernel/uart.c`
- `kernel/pipe.c`

阅读 [xv6 教材的第9章]()



调度和锁可以帮助隐藏线程之间的互相影响，但我们还需要一些抽象机制让线程能够有意地进行交互。例如，在 xv6 中，管道（pipe）的读取者可能需要等待写进程产生数据；父进程调用 `wait` 时，可能需要等待子进程退出；一个读取磁盘的进程，需要等待磁盘硬件完成读取操作。

[lec14.md](./lec14.md)







# Lec 15 网络



阅读材料

[Eliminating Receive Livelock in an Interrupt-driven Kernel, 1996](https://pdos.csail.mit.edu/6.828/2023/readings/mogul96usenix.pdf)

本节的主题有：

- 数据包格式与协议
- 内核中软件栈
- 过载行为——这节课的论文





[lec15.md](./lec15.md)

# Lec 16 高性能网络与调度



[lec16.md](./lec16.md)

# Lec 17 文件系统

本节学习文件系统，先理解为什么需要文件系统，在学习文件系统的原理，在物理上，逻辑上是如何进行组织的。

## 总览

- 文件系统的作用
- inode
- 磁盘上的布局



[lec17.md](./lec17.md)

# Lec 18 崩溃恢复 & 日志记录 

[lec18.md](./lec18.md)

# Lec 19 文件系统性能 & 快速崩溃恢复

[The benefits and costs of writing a  POSIX kernel in a high-level language OSDI'18](https://pdos.csail.mit.edu/6.828/2020/readings/biscuit.pdf)

[lec19.md](./lec19.md)





# Lec 20 多核可扩展性 & RCU

阅读资料：[RCU Usage In the Linux Kernel: One Decade Later, 2013](https://pdos.csail.mit.edu/6.828/2018/readings/rcu-decade-later.pdf)

如何在多核CPU计算机上获得好的性能，这是一个非常有趣，深入且令人着迷的话题。今天我们只会涉及这个话题的很小的一个部分，**也就是在面对内核中需要频繁读但是不需要频繁写的共享数据时，如何获得更好的性能？** 在不同的场景下有不同的方法可以在多核CPU的机器上获得更好的性能，我们今天要看的是**Linux的RCU**，它对于需要频繁读的内核数据来说是一种非常成功的方法。



**总览**

- 引言
- 使用锁带来的问题
- 读写锁局限性
- RCU
  - RCU的实现
  - 代码示例
  - 性能分析
  - 使用场景

[lec20.md](./lec20.md)



# Lec 21 容器与虚拟机

## 总览

- 虚拟机
- trap-and-emulate 虚拟化
- 硬件虚拟化（Intel VT-x / VMX)
- 论文阅读： Dune

[lec21.md](./lec21.md)



# Lec 22 内核可扩展性

阅读资料： 《The BSD packet Filter》

本节的核心问题是，如何在内核中“安全地运行用户代码”来扩展内核能力。该问题出现的缘由是为了监控原始网络包。具体来说是，某个用户空间进程需要检查所有in-comming的网络包，而不是针对某个TCP连接或端口，但由于多个程序同时运行，每个程序关心的包不同，内核无法提前知道哪个包应该给哪个进程。



[lec22.md](./lec22.md)



# Lec 23 熔断

阅读论文：[Meltdown: Reading Kernel Memory from User Space](https://meltdownattack.com/meltdown.pdf)



[lec23.md](./lec23.md)

