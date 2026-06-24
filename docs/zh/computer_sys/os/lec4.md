# Lec 4 操作系统的组织 & 微内核

本讲定位：承接 Lec 3 的"宏 vs 微"之争，深入微内核设计哲学；以 **L4** 为代表理解微内核的抽象与机制；通过论文《The Performance of µ-Kernel-Based Systems (1997)》考察微内核能否在保持模块化的同时不牺牲性能。
阅读：L4Linux 性能论文；可选 L4/seL4/Fiasco.OC 等延伸材料。

---

## 0. 本讲脉络

```
内核该做什么？ ──► 宏内核的优缺点 ──► 微内核的核心思想(只留 IPC + 线程)
        │                                        │
        ▼                                        ▼
  L4：抽象(任务/线程/IPC/页映射) + 服务 + 调度/缺页转 IPC
        │
        ▼
  微内核的缺陷(小众化 / 性能：页表切换 + IPC 开销)
        │
        ▼
  论文：把 Linux 移植到 L4，性能仅低 5% ──► 高性能微内核是可能的
```

---

## 1. 内核应该做什么？宏内核的取舍

不同人对"内核该做什么"有不同偏好。传统的**宏内核**把内核当作一个能做各种事的单一大程序，提供强抽象——例如给出文件/目录/文件描述符接口（而非裸磁盘硬件）、给出地址空间抽象（而非裸 MMU）。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（宏内核的特征）</strong>所有子系统（文件系统、内存分配器、调度器、虚拟内存）都是同一大程序的一部分，且全部以完整硬件权限运行（如 xv6 全程管理态）。</div>

**优点**：对应用开发者——获得可移植性、隐藏复杂性；对内核开发者——易构建抽象、子系统间易协作。**缺点**：代码庞大（Linux 数十万到数百万行）难维护；bug 与安全问题多；通用 → 对特定场景非最优；**可扩展性差**——想让应用在运行时改内核行为（如数据库自定义磁盘布局）时，宏内核没有专门机制支持。



## 2. 微内核的核心思想

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（微内核的关键思想）</strong>内核只提供进程间通信 (*IPC*) 与某种线程/任务概念；文件系统等其他功能都作为<strong>用户态进程/任务</strong>实现。</div>

注意"微内核"是一种**一般方法/概念**而非某个具体产品——按此方案设计的不同系统差异可能很大。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>人们期望微内核带来什么？</strong></div>

- 高层次而言，这是一种审美，很多人都觉得像 Linux 内核这样庞大复杂的单一程序，并不是很优雅
- 更小的内核可能更安全，代码越少， bug 越少，更少有人利用其中的 bug 来破坏安全
  - 一个被证明是安全的操作系统， seL4，它是 L4 微内核的众多后代之一
- 少量代码通常更容易优化
- 小内核可能会产生更少的设计决策，让应用程序员自己想办法，因此，它提供了灵活性
- 通过构造用户级别的服务
  - 让代码更加模块化，也就是说更容易调整，替换或修改，或者说定制。
  - 可以模拟一个或多个操作系统，在一个微内核上，所以，即使微内核几乎不直接为你做任何事情，你也可以运行 Unix 服务器或其他东西在它上面
  - 更健壮（单个用户级服务崩溃不必整机重启）

更优雅、更小更安全（代码少→bug 少）、更易优化、更灵活、更模块化、更健壮（单个用户级服务崩溃不必整机重启），还能在其上模拟一个或多个 OS。



但这些都是**期望**而非必然结果，这些都是人们希望通过使用微内核来实现的。实现微内核的两大挑战：

① 找到尽量简单又足够强的系统调用接口（要能支撑 exec/fork 直到构造出 OS 其余部分）；

② 这种架构要大量走 IPC，IPC 必须足够快，否则微内核无竞争力。

## 3. L4 微内核

L4 是早期微内核的代表（1980 年代起），高度精简：**只有 7 个系统调用**（对比今日 Linux 300–400+）。

![截屏2024-09-08 22.31.10](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66ddb5542568a.png)

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>L4 的四个基本抽象：</strong>任务（地址空间）、线程、IPC、页映射。</div>

- **任务（地址空间）**：每个任务可含多个线程，L4 负责在任务内调度线程，并管理地址空间。
- **线程**：每个线程有标识符，可对其操作（如向某线程发几个字节）。创建线程通过系统调用；可用特殊 IPC 把准备好的指令/数据映射进新任务地址空间，IPC 消息还能指定 PC 与栈指针，内核据此启动线程。
- **IPC**：进程间收发消息（寻址用线程 ID）。
- **页映射**。

L4 的服务（有些是系统调用、有些是 IPC）：创建任务/地址空间、创建/销毁线程、IPC 收发、中断另一地址空间、访问设备硬件、通过 IPC 接收设备中断。特权任务可把设备硬件/控制寄存器直接映射进自己地址空间（跳过系统调用）。L4 本身不懂具体设备，设备驱动由用户级软件实现。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（中断也走 IPC）</strong>驱动可请求内核打开某设备中断；中断发生时 L4 把它<strong>转换成 IPC 消息</strong>通知相关任务。于是"读写设备 + 获知中断"统一到消息模型里。</div>

L4 内核就这些——没有设备驱动、网络、文件系统，也不支持 fork/exec，这些都要作为用户级服务提供。

### 3.1 调度与缺页

- **调度/线程切换**：L4 为每线程/每任务保存寄存器，跳入用户空间、切页表，让线程运行一段时间；定时器中断触发后保存其寄存器、从循环里选下一个任务运行（与 xv6 调度循环很像），直到该任务 yield 或被定时器打断。
- **缺页处理**：L4 把页错误**转成 IPC 消息**通知用户态的**分页任务 (*pager*)**。分页任务可实现**懒分配**——线程写未分配内存时，分页任务向 L4 申请内存、请内核映射到出错线程地址空间，再发 IPC 恢复该线程。**写时复制**等高级内存管理也可由用户级分页任务实现而无需改内核。





## 4. 微内核的缺陷

### 4.1 小众化（生态）问题

要让人从现有系统迁移到微内核，必须解决与现有应用的**兼容性**。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>工程联想</strong>鸿蒙早期必须兼容安卓应用，否则生态空转——这与"任何新平台都要先支持既有应用"是同一个网络效应难题。人们不愿为不明显的性能优势从现有系统切换过来。</div>

### 4.2 性能问题

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题1</strong>（为什么微内核的 IPC 会比宏内核的系统调用慢？）</div>

**页表切换开销**：Linux 把整个内核映射进每个用户进程的页表，系统调用时无需切页表，开销小。L4 处理 IPC 时往往**强制切换页表**（每进程独立页表，且 L4 不知道宏内核里用户进程与内核的共享关系）——切页表本身贵，还要刷 TLB。

**上下文切换 + IPC 开销**：模块化使一次"系统调用"要经多次上下文切换、跨模块走 IPC，比宏内核更多上下文切换，带来更多缓存未命中、TLB 刷新。论文作者通过让每个进程关联一个内核任务、共享内存等策略来缓解，但效率仍不如预期。

### 4.3 适用性问题

微内核在嵌入式（手机、IoT）应用更多——这些场景性能要求相对低、灵活性更重要；而通用 OS 领域微内核优势不明显。

### 4.4 当前近况

主要用于嵌入式（微控制器、苹果的 "enclave" 安全处理器，运行专用软件）；从未在通用计算广泛流行（没有令人信服的理由从 Linux 切换）。但许多微内核思想已被现代 UNIX 吸收：Mach 推动了虚拟内存支持的采用、可加载内核模块回应了扩展需求、IPC 与用户级服务已很常见（macOS 既是宏内核又良好支持用户级服务与 IPC）。

---

## 5. 论文：µ-Kernel 系统的性能

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（论文主张）</strong>第一代微内核慢且不灵活；第二代（L4）能否克服？把 Linux 移植到 L4 上（L4Linux）与原生 Linux 对比来检验。</div>

结果：在 AIM 基准测试的最大吞吐量上，L4Linux 仅比原生 Linux **低约 5%**，表明**在微内核之上实现高性能传统 OS 是可能的**。进一步实验显示系统可扩展性很高，连实时内存管理（含二级缓存分配）都能在用户级实现并与 L4Linux 共存。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（论文的意义）</strong>它反驳了"微内核必然慢"的成见——只要 IPC/页表切换做得足够快，微内核的模块化与可扩展性收益就能在可接受的性能代价内兑现。</div>

---

## 6. 自测清单

- [ ] 宏内核的特征、优缺点各是什么？
- [ ] 微内核的核心思想（内核只留什么）？人们期望它带来哪些好处？这些是必然还是期望？
- [ ] 实现微内核的两大挑战？为什么 IPC 速度是关键？
- [ ] L4 的四个基本抽象；它如何把缺页和设备中断都转成 IPC？
- [ ] 为什么微内核 IPC 比宏内核系统调用慢（页表切换 + 上下文切换）？
- [ ] L4Linux 实验的结论是什么？它推翻了什么成见？
- [ ] 哪些微内核思想已被现代 UNIX 吸收？





## 参考资料

[The Performance of micro-Kernel-Based Systems (1997)](https://dl.acm.org/doi/pdf/10.1145/268998.266660)

可选资料：

- L4 微内核细节
  http://www.cse.unsw.edu.au/~cs9242/02/lectures/01-l4.pdf
  http://www.cse.unsw.edu.au/~cs9242/02/lectures/01-l4/01-l4.html

- L4的 fast IPC 
  https://cs.nyu.edu/~mwalfish/classes/15fa/ref/liedtke93improving.pdf

- 后来的演变版本
  https://trustworthy.systems/publications/nicta_full_text/8988.pdf

- L4背后的思想
  https://www.cs.fsu.edu/~awang/courses/cop5611_s2024/microkernel.pdf

- Fiasco.OC Microkernel——当下的L4

  https://l4re.org/doc/