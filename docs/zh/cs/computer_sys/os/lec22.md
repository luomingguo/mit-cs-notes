---
title: 内核可扩展性（BPF）
course: 6.1810 操作系统工程
course_id: '6.1810'
lecture: 22
kind: system
tags: []
status: complete
---
# Lec 22 内核可扩展性（BPF）

阅读论文

[The BSD Packet Filter: A New Architecture for User-level Packet Capture, 93](https://www.tcpdump.org/papers/bpf-usenix93.pdf)

Berkeley Packet Filter 在 Linux kernel 中被广泛使用，而且用途远不止网络过滤，如果你好奇，可以阅读文章 《[A thorough introduction to eBPF](https://lwn.net/Articles/740157/)》，了解 Linux 内核使用 BPF 的一些方式。

由于 BPF 过滤器指令来自任意应用程序，内核不能信任这些指令是“行为良好”的（well-behaved）。

> 核心问题：内核如何确保过滤器**不会访问任意内存**？**不会无限运行**？并且**性能开销尽可能低**？

本节的核心问题是，如何在内核中“**安全地运行用户代码**”来扩展内核能力。该问题出现的缘由是为了监控原始网络包：某个用户空间进程需要检查所有 incoming 的网络包，而不是针对某个 TCP 连接或端口，但由于多个程序同时运行，每个程序关心的包不同，内核无法提前知道哪个包应该给哪个进程。

## 本讲导览

- 应用场景与动机：监控原始网络包
- 性能挑战：为什么不能把所有包都拷贝到用户态
- BPF 的核心思想：把过滤器写成字节码程序，在内核中执行
- 一种新的隔离模型：软件故障隔离（SFI）
- 三种实现方案及其安全性与性能
  - 方案一：解释器（interpreter）
  - 方案二：先验证、后执行的快速解释器
  - 方案三：JIT 编译为本地机器码
- Linux eBPF：BPF 的现代化扩展
- 论文重点图（BPF 论文）

---

## 一、应用场景与动机：监控原始网络包

很多工具需要检查“进入主机的原始网络包”，而不是某一条具体的 TCP 连接或 UDP 端口，例如：

- `tcpdump`（抓包分析）
- `arpwatch`（监控 ARP）
- `rarpd`（反向 ARP 服务）

这些应用各自关心**不同类型**的包，而内核开发者无法提前知道每个应用想要哪些包。

```bash
# tcpdump -n -i wlan0 udp
# tcpdump -n -i wlan0 udp and port 123
```

> 目标：让用户进程能够“声明”自己想要哪些包，内核据此在内核中就地判断该拷贝还是丢弃。

## 二、性能挑战

如果每个包都送到用户态去让应用自己过滤，代价非常高：

- 内核需要为每个包**做一份拷贝**
- 需要把包**送到用户态应用**（跨越用户/内核边界）
- 而应用会**丢弃**它不关心的大部分包 —— 拷贝这些包的工作全是浪费

> 因此希望：在**内核内部**根据用户指定的规则判断包的去留，如果应用不要这个包，就避免拷贝开销。论文给出了一种高效、通用的过滤器描述方式。

## 三、BPF 的核心思想

论文的思路：**把过滤器写成一段用简单字节码语言（“BPF”）表达的程序**。

- 应用把它的需求翻译成一段 filter 程序
- 字节码语言足够灵活，可以表达各种不同类型的包匹配
- 内核可以**高效执行**这段 filter 程序
- 这段过滤器甚至可以**在收包的中断处理程序中运行**

```bash
# tcpdump -n -i wlan0 -d udp      # -d 反汇编出 tcpdump 生成的 BPF 程序
```

数据流：`tcpdump` 把表达式（如 `udp`）翻译成 BPF 程序 → 下发到内核 → 内核对每个收到的包运行这段 BPF。

### 一种通用而强大的内核扩展手段

事实证明，这是一种非常强大的扩展内核的方法：**让内核安全、低开销地运行“用户提供的代码”**。

它采用了与传统“进程级隔离”不同的隔离模型：

- 有时称为 **软件故障隔离（Software Fault Isolation, SFI）**
- 类似技术也用于 **WebAssembly**，甚至 **JavaScript**

相比进程，BPF 代码有一些**限制**：

- 代码必须用 BPF 语言编写
- 代码必须**立即返回**（不能睡眠、不能开线程……）
- 没有虚拟内存
- 没有标准的系统调用

> 这些限制带来的最大收益是：**性能**，并且解锁了新的使用场景。

### 另一个应用：seccomp

`seccomp-bpf` 用 BPF 过滤系统调用：进程每次发起 syscall 前先经过 filter，由 filter 决定 allow / deny / kill 等。

```bash
$ make seccomp.bpf
$ seccomp-tools disasm seccomp.bpf
$ bwrap --bind / / --seccomp 5 5<seccomp.bpf -- sh
```

## 四、要让这件事跑起来的技术挑战

> 如何保证 filter 程序：
> - 不会崩溃（破坏内存）？
> - 不会泄露（读到其他数据）？
> - 不会永远运行下去？
> - 能高性能地执行？

下面给出三种递进的实现方案。

### 方案一：写一个解释器（interpreter）

最接近论文描述的做法：循环遍历指令，对每条指令用 switch 分发执行。

**解释器需要哪些安全检查？**

- 不能访问超出**包缓冲区大小**的内存
- 不能执行超出**有效指令范围**的 BPF 指令
- 不能执行**未知操作码**
- 必须**初始化状态**（`a = 0`），否则可能读到内核遗留的数据（信息泄露）

**怎么保证解释器一定会结束（不会死循环）？**

- 跳转偏移是**无符号 8 位**，所以只能**向前**跳 0 或更多
- 每条指令把 PC 至少推进 1（跳转可能更多）
- 如果 PC 越过程序末尾，解释器会捕获错误
- 解释器最多运行有界数量的指令（至多 `nins` 条）
- 每条指令只做一个有界的简单步骤
- 因此整个 BPF 程序的解释执行会“很快”结束

**性能**：约 **24 ns/次**调用。

> 对比：切到用户态（如 `getpid`）大约 100 ns。所以即便是解释器，BPF 已经是很大的胜利 —— 对 seccomp 来说，比一次系统调用开销还便宜。

### 方案二：把检查移出关键路径的快速解释器

解释器慢的部分原因是它在**执行时反复做检查**，而这些检查其实与“当前要过滤的包”**无关**！

思路：**预先验证（`bpf_prepare()`）一次**，之后 `bpf_run` 就可以跳过逐条的内存/PC 检查。

**验证规则（upfront validation）：**

- 至少要有 1 条指令（这样才能开始运行）
- 最后一条指令必须是 **return**（这样不会跑过末尾）
- 所有 load 必须落在**包边界**内（内核即使还没拿到包，也知道包缓冲区会有多大）
- 所有 jump 不能跳过指令末尾

**性能**：**16 ns**（相比 24 ns）。

> 如果一个程序会被运行很多次，那么预先验证非常值得。

### 方案三：把 BPF 字节码翻译成硬件指令（JIT）

BPF 字节码本身就很像真实 CPU 指令，那能不能直接翻译成 CPU 指令来跑？（类似 QEMU 在 x86/ARM 上跑 RISC-V 的做法。）

**需要规划好寄存器用途（以 x86-64 为例）：**

- 第一个函数参数放在 `%rdi` → 用它存**指向包的指针**
- 函数返回值放在 `%eax` → 用它存 **return 指令的值**
- `%eax` 是 caller/callee 可改的寄存器 → 用它存 BPF 的 **“A” 寄存器**

**JIT 需要做什么：**

- 仍然需要和快速解释器**一样的安全检查**
- 对每条指令填入对应的 x86 代码（把具体常量/偏移编码进指令）
- 处理跳转目标：BPF 用“BPF 指令号”表示跳转，而生成的 x86 需要“x86 代码偏移”
  - **两遍扫描**：第一遍生成 x86 代码（跳转可能是错的，但大小正确），记录每条 BPF 指令对应的 x86 偏移；第二遍重新生成，填入正确的跳转
- 在开头填入把 `%eax` 清零的代码（否则会读到未初始化的 `%eax`）
- JIT 设置完成后，运行 filter 就只是“跳到生成的代码”

**性能**：**3.8 ns**（相比 16 ns），相对解释器是巨大的提升。

**还能更快吗？**

- 用更高效的指令编码（短跳转）
- 消除清零 `%eax`：需要分析“在每条执行路径上 BPF 都先 load 再使用”——这是一种依赖分支选择的分析

**三种方案性能对比小结：**

| 方案 | 每次调用耗时 |
| --- | --- |
| 解释器 | ~24 ns |
| 先验证的快速解释器 | ~16 ns |
| JIT 编译 | ~3.8 ns |
| （对比）切到用户态 syscall | ~100 ns |

---

## 五、补充阅读：A thorough introduction to eBPF

Linux 支持一个更复杂的 BPF 版本 —— **eBPF**：

- 更丰富的操作码（**多个寄存器**）以提升性能
- 允许**部分循环**（需要更复杂的验证器）
- 允许访问**某些共享状态**（如哈希表）
- 允许**调用某些内核代码**（同样需要复杂验证器）
- 用 **JIT** 翻译成本地代码以提升性能

### 从 cBPF 到 eBPF 的演进

- 经典 BPF（cBPF）1993 年为抓包设计，是寄存器虚拟机，但随处理器走向 64 位和多核而显得过时
- Alexei Starovoitov 引入扩展 BPF（eBPF）做现代化改造：寄存器从 2 个扩到 **10 个**、值从 32 位变 **64 位**、新增如 `XADD`（原子加）等指令，使 eBPF 指令更贴近硬件 ISA
- 性能收益显著：在 x86-64 上某些网络过滤微基准比经典 BPF **快约 4 倍**
- 2014 年起 eBPF 通过 `bpf()` 系统调用直接暴露给用户态

### eBPF 虚拟机架构

- **10 个 64 位寄存器** R0–R10：参数通过寄存器传递，贴近原生硬件
  - **R0** 存返回值
  - **R10** 是只读的帧指针（frame pointer）
- **BPF_CALL** 指令：低开销地调用内核内部函数
- 多架构 **JIT** 支持：x86-64、SPARC、PowerPC、ARM、arm64、MIPS、s390

### 验证器（Verifier）—— 安全的核心

加载前进行多阶段验证：

1. **控制流分析**：对程序控制流图做深度优先搜索（DFS），确保程序会终止、**没有无限循环**；**不允许不可达指令**，否则加载失败
2. **状态模拟**：逐条**模拟执行**，在每条指令前后校验寄存器与栈状态；禁止越界跳转和越界数据访问
3. **路径剪枝优化**：当当前状态与之前已验证的状态相同时，跳过模拟（因为之前的路径都已合法）

安全约束：

- **未初始化寄存器不可读**，否则加载失败
- **指针运算限制**：非特权用户（无 `CAP_SYS_ADMIN`）处于“安全模式”，完全禁止指针运算；特权模式允许，但会做类型、对齐、边界检查
- 安全模式防止内核地址泄露给非特权用户

### 程序加载：`bpf()` 系统调用

```c
int bpf(int cmd, union bpf_attr *attr, unsigned int size);
```

- 用 `BPF_PROG_LOAD` 加载程序；`bpf_attr` 联合体在内核/用户态间传递数据
- 命令大致分三类：程序操作、map 操作、程序+map 联合操作
- 还可把程序附加到 cgroup 或 socket、遍历对象、把对象 **pin 到文件**以便持久化

### 程序类型（Program Types）

程序类型决定了：内核中的附加点、可用的 helper 函数、是否能直接访问网络包数据、传入的第一个参数类型。常见类型：

- `BPF_PROG_TYPE_SOCKET_FILTER`：网络包过滤
- `BPF_PROG_TYPE_KPROBE` / `TRACEPOINT` / `PERF_EVENT`：条件性的 kprobe / tracepoint / perf 事件
- `BPF_PROG_TYPE_SCHED_CLS` / `SCHED_ACT`：流量分类 / 流量控制动作
- `BPF_PROG_TYPE_XDP`：驱动收包路径上的高性能包处理
- `BPF_PROG_TYPE_CGROUP_SKB` / `CGROUP_SOCK`：cgroup 级 socket 过滤 / 参数修改
- `BPF_PROG_TYPE_SK_SKB`：socket 间转发包等

### eBPF Maps：数据结构

map 是通用的 key-value 存储，用于“内核↔用户态”“程序↔程序”通信：

- 通过 `bpf()` 创建/管理，成功返回 fd，关闭 fd 即销毁
- 每个 map 定义四要素：类型、最大元素数、value 大小、key 大小
- 常见类型：`HASH`、`ARRAY`、`PERCPU_ARRAY`/`PERCPU_HASH`、`LRU_HASH`、`LPM_TRIE`（最长前缀匹配，适合 IP 段）、`STACK_TRACE`、`PROG_ARRAY`（fd 数组，可做跳转表/尾调用）、`PERF_EVENT_ARRAY`、`DEVICE_MAP`、`SOCKET_MAP`、`ARRAY_OF_MAPS`/`HASH_OF_MAPS`（map 套 map）
- 都支持 `bpf_map_lookup_elem()` / `bpf_map_update_elem()`，可从 eBPF 或用户态访问

### 编写与工具链

- 现代开发用 LLVM/Clang 的 eBPF 后端，把 C 编译成字节码：`clang -march=bpf -c program.c -o program.o`
- 内核提供 `libbpf`；**BCC（BPF Compiler Collection）** 提供完整工具链，无需链接内核源码即可编译
- 典型流程：读入字节码 → `bpf_load_program()` → eBPF 程序通过 map 与用户程序交换数据

### 主要使用场景

- **网络处理**：XDP（express data path）在驱动收包路径做高性能处理；附加到 socket 做过滤/分类/改写
- **系统调用过滤**：seccomp-BPF 限制进程可调用的 syscall
- **性能分析与调试**：附加到 tracepoint / kprobe / perf 事件，直接访问内核数据结构，**无需重新编译内核**就能写入和测试新的调试代码；甚至能用 USDT 调试用户态程序

### Linux 中的实际演示

```c
# bpftrace -l                     # 列出可用探针
# bpftrace -e 'tracepoint:syscalls:sys_enter_mkdir { printf("PID %d calling mkdir(%s)\n", pid, str(args.pathname)); }'
# bpftrace -e 'tracepoint:irq:irq_handler_entry { printf("intr %d: %s\n", args.irq, str(args.name)); }'

# XDP：丢弃 ICMP / 修改 TTL
# ip link set wlan0 xdp object drop_icmp.o
# bpftool prog show
# ip link set wlan0 xdp off
```

> eBPF 验证器（`kernel/bpf/verifier.c`）非常复杂，是内核开发和研究的活跃领域。

---

## 六、论文重点图（The BSD Packet Filter）

> 按要求，论文部分只记录图中最重点的内容。

**图：BPF 在系统中的位置（the tap & the filter）**

- BPF 在链路层之上设置一个“tap（抽头）”，监听网络接口收发的所有包
- 每个包先经过用户下发的 **filter**；只有被过滤器**接受**的包才被拷贝到该进程的缓冲区
- 关键：**过滤发生在拷贝之前**，从而避免为不需要的包付出拷贝代价

**图：BPF 伪机器（pseudo-machine）指令集**

- 一个**累加器 A**、一个**索引寄存器 X**，外加一小块（16 字）scratch 内存
- 指令格式为 `(opcode, jt, jf, k)`：操作码、为真时跳转、为假时跳转、常量/偏移
- 指令类别：load / store / ALU 运算 / 条件分支 / 返回
- 这是一个 **register-based** 的简单机器，便于内核高效解释执行

**图：CSPF 的布尔表达式树模型 vs BPF 的控制流图（CFG/DAG）模型**

- 旧的 **CSPF**（CMU/Stanford Packet Filter）用基于栈的**布尔表达式树**来表达过滤逻辑，会重复计算、难以短路
- BPF 用**控制流图（有向无环图）**：例如判断 `ip or arp`，先取以太网类型字段，按值分支，能**短路**并避免重复求值
- CFG 模型更贴合寄存器机器，是 BPF 高效的根本原因

**图/数据：性能对比**

- BPF 的 CFG 模型在典型过滤器上比 CSPF 的树模型**快出一个量级**（论文报告数倍至数十倍）
- 在内核中就地过滤，相比“把所有包都拷到用户态”可节省绝大部分拷贝与跨界开销

[Lec bpf](https://pdos.csail.mit.edu/6.1810/2025/lec/l-bpf.txt)
