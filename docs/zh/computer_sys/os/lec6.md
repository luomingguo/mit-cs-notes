---
title: 系统调用入口/出口
course: 6.1810 操作系统工程
course_id: '6.1810'
lecture: 6
kind: system
tags: []
status: complete
---
# Lec 6 系统调用入口/出口

今天的目标是学习从用户空间到达内核空间，以及从内核空间返回回用户空间的整个过程。系统调用、异常、设备中断进入内核都是以相同的方式，里面涉及到很多细致的设计和重要的细节，对于隔离性（安全性）和性能都非常重要。

## 要点

- 系统调用需要做什么
- 陷入——ecall
- 保存用户寄存器
- 设置内核页表
- 内核 C 代码执行
- 恢复执行

## 系统调用概述

有三种事件会导致 CPU 暂停正常的指令执行，并强制将控制权转移到处理该事件的特殊代码。

- 系统调用（System Call），当用户执行``ecall``指令请求内核执行某些操作时。
- 异常（exception），一条指令（不管是用户还是内核的）执行了非法操作
- 设备中断

很多书会把这些情况统称为 Trap（陷入）。在 trap 发生时，执行的代码需要在稍后恢复运行，也就是说，我们希望 trap 对被中断的代码来说是透明的。

期望的 trap 处理流程是：

1. trap 强制将控制权转移到内核，也就是说，切换到管理员模式
2. 保存 32 个用户寄存器和 PC
3. 切换到内核页表
4. 切换到内核栈
5. 跳转到内核 C 代码

6. 恢复运行

额外的目标是：

- 对用户代码透明——程序“感觉不到”这件事发生过
- 不要让用户代码干扰到从用户态到内核态的转化，例如，即不要用管理员模式执行用户代码

示例： Write

```asm
preview:
  write()                        write() returns
  ecall                                                     User
  ----------------------------------------------------------------
                                 sret                       Kernel
  uservec in trampoline.S        userret in trampoline.S  
  usertrap() in trap.c           usertrapret() in trap.c
  syscall() in syscall.c           ^
  sys_write() in sysfile.c      ---|
```

在高层次看，调用链为左边自上而下，右边自下而上的顺序。

我们来看下 xv6 系统调用如何进入/离开内核的。xv6 shell 会在终端显示写入一个``$``字符，这是一种设备中断。在 Xv6 代码具体步骤为：

1. user/sh.c line 137: `write(2, "$ ", 2)`;
2. user/usys.S line 29
   - 这是个 write()函数，仍然在用户空间
3. a7 寄存器告诉内核它想要哪个系统调用——`SYS_write= 16`
4. `ecall`被调用 —— 执行用户/内核空间的转换。

我们尝试在`ecall`加入断点，在`user/sh.asm`，搜索`write`，能找到`write`函数地址入口是`0xe24`，

![image-20241120060039782](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673d0a8a252df.png)

于是我们打上断点

```shell
(gdb) b *0xe24
(gdb) c
(gdb) delete 1
(gdb) info reg # 可以看到a1-a3为传入的参数，a7为代号
(gdb) x/2c $a1	 # x表示检查内存 /2表示显示2条内容， 
		#c解释为 ASCII 字符
		#i代表汇编指令
		#x代表hex
		#a代表地址
		#后面接$p寄存器或者0x地址； 结果可以看到"$"
(gdb) p/a $satp  # 打印satp寄存器的值，并用地址形式展示

# 打印寄存器信息
(gdb) p $pc
$2 = (void (*)()) 0xe16
(gdb) p $sp 
#  $pc 和 $sp都是低地址的, 用户内存从0开始


(gdb) p/3i 0xe14
	 0xe14:       li      a7,16
=> 0xe16:       ecall
   0xe1a:       ret
   接下来我们执行ecall
(gdb) stepi  
0x0000003ffffff000 in ?? ()
=> 0x0000003ffffff000:  73 10 05 14     csrw    sscratch,a0
	可以看出PC现在指向高地址（虚拟地址）
	检查QEMU的监控器，发现这个地址是跳板页trampoline开头，记得那张图吗？映射到了低物理地址
(gdb) x/6i 0x0000003ffffff000
=> 0x3ffffff000:        csrw    sscratch,a0
   0x3ffffff004:        lui     a0,0x2000
   0x3ffffff008:        addiw   a0,a0,-1
   0x3ffffff00a:        slli    a0,a0,0xd
   0x3ffffff00c:        sd      ra,40(a0)
   0x3ffffff010:        sd      sp,48(a0)
(gdb) p/x $pc
$4 = 0x3ffffff000 
	这是内核的trampoline trap handling代码
	csrw sscratch,a0 是将两个寄存器的值交换
(gdb) p/x $sepc
$5 = 0xe16

```

> 为什么$pc 会跳到 trampoline 页呢？

Solution: 这是因为，当陷入（trap）发生时，寄存器`$stvec`（Supervisor Trap Vector Register）指定了特权模式下用来处理陷入的入口地址（处理程序的起始地址，通常指向内核函数）和模式（模式是最低两位，指定了陷入向量模式）

> ecall 到底做了哪些事情？

Solution:

1. 将用户模式切换为管理员模式
2. 将\$pc 保存到 \$sepc
3. 跳转到`$stvec` （即将`$pc`设置为`$stvec`）
4. 关闭中断

> [!NOTE]
>
> 【ecall 的作用补充】
>
> ecall 调用让用户代码从用户模式切换到了内核模式，而且设置\$pc =\$stvec，因此内核可以立马获得控制权，又因为也只有 ecall 才能设置\$stvec，因此用户程序不能通过管理员模式来执行。

> [!NOTE]
>
> 【技巧： Qemu 提供查看页表功能】
>
> Trip: 在 QEMU 模拟器里面，我们可以进入 QEMU 监视器来获取页表，具体操作是
>
> ``ctrl + a c`` ，然后``info mem``

`trampoline` 的作用

![截屏 2024-09-07 23.08.45](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66dc6c992a2fa.png)

![image-20240920140622652](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66ed10ed817e0.png)

`trampoline` 是一种特殊的内存区域，用于处理从用户态到内核态的过渡。在 RISC-V 系统中，`ecall` 指令会触发陷入，`trampoline` 包含了陷入后执行的最初几条指令，完成模式切换、堆栈设置等工作，然后跳转到内核的 trap 处理逻辑。

> 为什么`trampoline` 必须在用户页表中？

Solution：

- 当用户态执行 `ecall` 时，`satp`（管理页表基地址的寄存器）不会改变，意味着 CPU 使用的仍然是用户页表
- 为了确保陷入后能找到并执行 `trampoline` 中的指令 ▯

一个保护机制：通过去掉 `PTE_U`（用户权限位），即使用户代码尝试访问，也会触发访问异常，保证内核代码的安全性。

> 为什么`trampoline`放在虚拟地址空间顶部？

Solution：用户程序的虚拟地址空间通常从低地址开始增长。如果把 `trampoline` 放在中间，会在用户地址空间中造成“空洞”（未分配的区域），浪费地址空间。 ▯

我们至今还没执行内核 C 代码。还需要做的事情：

- 保存 32 个用户寄存器的值（为了后面透明恢复执行）
- 切换到内核页表
  - 并将栈指针指向内核栈
- 为执行内核 C 代码的设置栈
- 跳转到内核 C 代码——usertrap() ▯

> 为什么 ecall 不帮我们做完上面这些工作？

Solution：这是为了给 OS 设计者提供优化系统调用，异常处理和中断处理的自由空间，从而实现非常快速的处理。具体来说：

- OS 可能可以处理某些陷入而无需切换页表
- OS 可以同时映射用户态和内核态到同一页表
- 可能有些寄存器不需要保存
- 可能不需要堆栈处理简单的系统调用 ▯

## 2. 保存用户寄存器

> 我们是否可以将 32 个寄存器的值写入物理内存中的某个方便的地址？

Solution： 不行，因为即使在管理员模式下，仍然会受到页表的约束，而当前页表是用户页表，而不是内核页表。 ▯

> 能否首先将``satp``设置为内核页表？

Solution：管理员模式下确实可以设置``satp``，但是这点上，我们还不知道内核页表的地址 ▯

那怎么办？

思路： 从 32 个通用寄存器中挑出的一个，来保存一个地址，这个地址指向我们将保存 32 个用户寄存器值的内存位置。但是，这 32 个寄存器中都保存着用户的值，我们必须保留这些值以便最终返回给用户。

保存 32 个用户寄存器的值解决方案有两个部分：

1. Xv6 将一个额外的内核页映射到用户页表中，称为**trapframe**

   - 映射在用户页表中已知的虚拟地址上，始终是同一地址：``0x3fffffe000``
   - trapframe 有空间来存储被保存的寄存器值
   - 内核为每个进程分配一个不同的 trapframe 页
   - 可以查看 kernel/proc.h 中的``struct trapframe``

   （尽管如此，我们仍然需要一个寄存器来保存 trapframe 的地址）

2. RISV-V 提供了``sscratch``寄存器

   - 管理员模式下代码可以使用该寄存器作为临时存储
   - 用户态无法使用，因此不需要保存值

> 为什么寄存器的值要在 trapframe 保存，而不在用户栈中？

Solution: 因为我们不知道用户代码中是否有栈，我们作为内核不能限制用户层使用什么编程语言，有些甚至没有用到栈，栈指针指向 0，或者有栈，但是格式很不一样，可能是一块特殊区域作为栈，内核无法理解。因此，内核不能对用户内存做出任何假设， 为了能够透明 恢复执行，我们需要将这些寄存器值放到内核中。 ▯

![image-20241120200837843](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673dd1487e89c.png)

我们可以看到有个``tp``寄存器，线程指针，xv6 用它来维护处理器核的 hartid（core 号），是 cpus[]的索引

## 3. 设置内核页表

在前面 trampoline.S 的 uservec 的 handling 处理过程，分为两个部分，上半部分是保存用户寄存器，下半部分就是设置内核栈，并跳转需要执行的内核代码了。

![image-20241120201555823](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673dd2fee7483.png)

- 该图是下半部分的处理函数

> 一个有趣的现象，现在页表已经换成了内核页表，为什么 PC 还能够按照顺序继续执行，没有发生 crash？

因为 trampoline 是内核和用户页表都有映射，并映射到同一块区域。直到``jr t0``挑出 trampoline.

## 4. 内核 C 代码执行

![image-20241120223459540](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673df397093a2.png)

t0 指向的地址 trap.c 的 usertrap 的函数入口。我们来看它干了什么事：

1. 检查\$sstatus 寄存器是否来自用户模式
   - **sstatus**：supervisor status register
     - `sstatus`中的 SIE 位控制设备中断是否被启用。如果内核清除了 SIE 位，RISC-V 将推迟设备中断，直到内核重新设置 SIE 位
     - ``SPP``位表示trap来自用户模式还是管理模式，并控制`sret`返回到哪个模式。
2. 将\$stvec 从用户模式下陷入 handling 处理函数更改为内核模式的 handling 处理函数
3. 为了不被在进程切换时将之前保存用户 PC 的\$sepc 寄存器给污染，需要将其保存到用户内存上
4. 检查\$scausej 寄存器判断是什么原因导致。
5. 当保存了这些信息后，开启中断，之前是通过 ecall 由硬件关闭的
6. 执行系统调用

后面的``syscall()``的执行过程就不展开了， 因为重点是介绍系统调用的入口和出口

## 5. 恢复执行

usertrap() 最后会调用 usertrapret()，此时就开始处理返回给用户程序的处理过程了，我们需要做如下变动：

1. 关闭中断
2. 恢复 stvec = uservec，为能够顺利下一次 ecall
3. trapfram stap = 内核页表，为了下一次 uservec 能找到
4. trapframe sp = 内核栈顶
5. trapframe trap = usertrap
6. trapframe hartid = hartid(in tp)

![image-20241120223609765](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673df3dcf1a94.png)

在最后，trampoline 用到了 RISV-V 的``sret``指令，为了能让该指令使用，需要准备一些寄存器

- sstatus： 其"privious mode"字段 设置 为 0，意味着在用户模式
- sepc： 保存着用户程序的 PC（能够返回陷入的入口）

我们还需要将切换到用户页表，在 usertrapret()没有搞定，因为这里面没有用户的页表，需要在一个页表，它被映射到用户和内核页表——trampoline，因此会跳到 trampoline.S 的``userret``；

此时，我们知道寄存器 a0 持有者返回值，``csrw satp``指令切换到了用户地址空间，然后加载 32 个用户寄存器，我们跳过它。最后的最后，调用 sret

#### sret 的作用

是一个硬件硬件操作

1. 将 sepc 复制到 pc
2. 将模式切换为用户模式
3. 重新打开中断（将 SPIE 复制到 SIE）
4. 继续在新的 PC 执行指令

---

## 源码精读：trap 入口/出口的汇编与 C

> 前面用截图讲了流程，这里贴出三份参考源码（`trampoline.S` / `trap.c` / `riscv.h`）的真实代码逐行拆解。代码取自 xv6-riscv（rev5）。
>
> ⚠️ **命名提示**：本讲早期讲义里的返回函数叫 `usertrapret()`，在 rev5 源码里已拆分/改名为 **`prepare_return()`**（负责出口前的寄存器/控制位准备），下文以源码为准。

## 0. 关键寄存器速查（riscv.h 视角）

| 寄存器 | 作用 | 谁能写 |
| --- | --- | --- |
| `satp` | 当前页表的物理基址（+模式） | 仅 S 模式 |
| `stvec` | trap 入口地址（CPU 进入 S 模式时跳到这） | 仅 S 模式 |
| `sepc` | trap 时自动保存的用户 PC，`sret` 据此返回 | 由 `ecall`/硬件设置 |
| `sscratch` | S 模式临时寄存器，用户态用不了 | 仅 S 模式 |
| `sstatus` | `SPP`=来自哪个模式 / `SIE`=中断使能 / `SPIE`=之前的中断使能 | 仅 S 模式 |
| `scause` | trap 原因（8=系统调用，13/15=页错误…） | 硬件设置 |
| `stval` | 出错地址（页错误时） | 硬件设置 |

## 1. `trampoline.S:uservec` —— 入口（汇编）

`ecall` 后 CPU 跳到 `stvec`（= 这里），此时**仍在用户页表、已在 S 模式**：

```asm
uservec:
        # 把用户 a0 暂存到 sscratch，腾出 a0 当指针用
        csrw sscratch, a0

        # 每个进程的 trapframe 都映射在同一个已知虚拟地址 TRAPFRAME(=0x3fffffe000)
        li a0, TRAPFRAME

        # 把 31 个用户寄存器存进 trapframe（注意此处还没存 a0）
        sd ra, 40(a0)
        sd sp, 48(a0)
        ...
        sd t6, 280(a0)

        # 用户 a0 此刻在 sscratch 里，取出来存进 trapframe->a0
        csrr t0, sscratch
        sd t0, 112(a0)

        # 从 trapframe 取出内核侧上下文：
        ld sp, 8(a0)     # kernel_sp   → 切到内核栈
        ld tp, 32(a0)    # kernel_hartid → tp 保存核号
        ld t0, 16(a0)    # kernel_trap → usertrap() 地址
        ld t1, 0(a0)     # kernel_satp → 内核页表

        sfence.vma zero, zero   # 等之前的访存在用户页表下完成
        csrw satp, t1           # ★ 切换到内核页表
        sfence.vma zero, zero   # 刷掉 TLB 里旧的用户映射

        jalr t0                 # 跳进 usertrap()
```

::: theorem 三个关键设计点
- **为什么先 `csrw sscratch,a0`？**保存 32 个寄存器需要一个「指针寄存器」指向 trapframe，但所有寄存器都装着用户值。于是借 `sscratch`（用户态碰不到、无需保存）把 a0 暂存，腾出 a0 当指针；最后再从 sscratch 取回用户 a0 存好。注意它是「写入」不是「交换」。

- **为什么切了 `satp` 还能继续顺序执行不崩？**因为 trampoline 页在用户页表和内核页表里都映射在**同一个虚拟地址 TRAMPOLINE**，所以换页表后 PC 指向的下一条指令仍然有效——这正是 trampoline「双映射」的意义。

- **偏移量（40/48/…/280）**对应 `struct trapframe` 里各寄存器的位置；前几项（0/8/16/32）是内核预先填好的 kernel_satp/kernel_sp/kernel_trap/kernel_hartid。
:::

## 2. `trap.c:usertrap()` —— 分派（C）

```c
uint64
usertrap(void)
{
  int which_dev = 0;
  if ((r_sstatus() & SSTATUS_SPP) != 0)
    panic("usertrap: not from user mode");   // SPP 必须=0，确认来自用户态

  w_stvec((uint64)kernelvec);    // ★ 既然进了内核，后续 trap 改走 kernelvec（内核态处理）
  struct proc *p = myproc();
  p->trapframe->epc = r_sepc();  // 保存用户 PC（防被进程切换污染 sepc）

  if (r_scause() == 8) {
    // —— 系统调用 ——
    if (killed(p)) kexit(-1);
    p->trapframe->epc += 4;      // ecall 是 4 字节，返回时要落在它的下一条
    intr_on();                   // 保存好关键寄存器后再开中断（ecall 进来时硬件已关）
    syscall();
  } else if ((which_dev = devintr()) != 0) {
    // —— 设备中断 ——
  } else if ((r_scause() == 15 || r_scause() == 13) &&
             vmfault(p->pagetable, r_stval(), (r_scause()==13)?1:0) != 0) {
    // —— 页错误（惰性分配等）——
  } else {
    printk("usertrap(): unexpected scause ...\n");
    setkilled(p);                // 无法处理 → 杀进程
  }

  if (killed(p)) kexit(-1);
  if (which_dev == 2) yield();   // 定时器中断 → 让出 CPU

  prepare_return();              // ★ 准备返回用户态
  return MAKE_SATP(p->pagetable);// 把用户页表 satp 返回给 trampoline.S（在 a0 里）
}
```

要点：

- **第一件事就是 `w_stvec(kernelvec)`**：进入内核后，如果再发生中断/异常，应该走「内核态 trap 处理（kernelvec）」而不是 uservec。返回用户前会在 `prepare_return` 里改回 uservec。
- **`p->trapframe->epc += 4`**：`sepc` 指向触发的 `ecall` 指令本身，但系统调用返回后要执行**它的下一条**，所以 +4。（页错误则不加，因为要重跑出错指令。）
- **`intr_on()` 的时机**：必须等 `sepc`/`scause` 等被读出并保存后才能开中断，否则新中断会覆盖这些寄存器。

## 3. `trap.c:prepare_return()` —— 出口准备（C）

```c
void
prepare_return(void)
{
  struct proc *p = myproc();

  intr_off();   // 即将把 trap 目标切回 uservec；此刻若来中断会跳进 usertrap 造成灾难，故先关中断

  // 下次 trap 走 trampoline 里的 uservec
  uint64 trampoline_uservec = TRAMPOLINE + (uservec - trampoline);
  w_stvec(trampoline_uservec);

  // 填好 trapframe，供下次 uservec 使用
  p->trapframe->kernel_satp   = r_satp();          // 内核页表
  p->trapframe->kernel_sp     = p->kstack + PGSIZE;// 内核栈顶
  p->trapframe->kernel_trap   = (uint64)usertrap;  // 下次的 C 处理入口
  p->trapframe->kernel_hartid = r_tp();            // 核号

  // 准备 sret 要用的控制位
  unsigned long x = r_sstatus();
  x &= ~SSTATUS_SPP;   // SPP=0 → sret 回到用户模式
  x |= SSTATUS_SPIE;   // SPIE=1 → 回用户态后重新开中断
  w_sstatus(x);

  w_sepc(p->trapframe->epc);  // sret 的目标 PC = 之前保存的用户 PC
}
```

> 对照原笔记「恢复执行」一节列的 6 步：`stvec→uservec`、填 `kernel_satp/sp/trap/hartid`、设 `SPP/SPIE`、设 `sepc`——一一对应。注意它**只做准备**，真正切回用户页表 + 恢复 32 个寄存器 + `sret` 是在 `userret` 里完成的，因为这些得在「两个页表都映射的 trampoline」里干。

## 4. `trampoline.S:userret` —— 出口（汇编）

```asm
userret:
        # usertrap() 返回值（用户页表 satp）在 a0
        sfence.vma zero, zero
        csrw satp, a0           # ★ 切回用户页表
        sfence.vma zero, zero

        li a0, TRAPFRAME        # a0 重新指向 trapframe

        # 恢复除 a0 外的 31 个用户寄存器
        ld ra, 40(a0)
        ...
        ld t6, 280(a0)

        ld a0, 112(a0)          # 最后恢复用户 a0（里面是系统调用返回值）

        sret                    # ★ 回用户态：见下
```

#### `sret` 做了什么（硬件一条指令）

1. 把 `sepc` 复制到 `pc`（回到陷入点 / 下一条指令）
2. 根据 `sstatus.SPP` 切回用户模式（前面已设 SPP=0）
3. 把 `SPIE` 复制回 `SIE`（重新开中断）
4. 从新的 PC 继续执行

## 5. 状态变化全景

| 阶段 | 模式 | 页表 | PC 所在 | 中断 |
| --- | --- | --- | --- | --- |
| 用户执行 `ecall` 前 | U | 用户 | 用户低地址 | 开 |
| `ecall` 后 → `uservec` | S | **仍用户** | trampoline(高址) | 关 |
| `csrw satp` 后 → `usertrap` | S | **内核** | trampoline→内核 | 关→（保存后）开 |
| `prepare_return` | S | 内核 | 内核 | 关 |
| `userret` 切 satp 后 | S | **用户** | trampoline | 关 |
| `sret` 后 | **U** | 用户 | 用户(回 sepc) | 开 |

> 一句话串起来：**`ecall` 只切模式 + 跳 `stvec`（最小化）→ `uservec` 借 `sscratch` 存寄存器、换内核页表 → `usertrap` 认 `scause` 分派 → `prepare_return` 备好返回控制位 → `userret` 换回用户页表、恢复寄存器 → `sret` 切回用户态。** 全程靠「双映射的 trampoline + 已知地址的 trapframe + S 模式专属的 sscratch」三件套，既透明又隔离。

---

## 参考资料

- [lec](https://pdos.csail.mit.edu/6.1810/2025/lec/l-internal.txt)
- 阅读 xv6 的第 4 章
- 研读 xv6 源码
  - `kernel/riscv.h`
  - `kernel/trampoline.S`
  - `kernel/trap.c`
