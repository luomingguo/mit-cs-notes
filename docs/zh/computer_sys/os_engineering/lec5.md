# Lec 5 系统调用入口/出口

今天的目标是学习从用户空间到达内核空间，以及从内核空间返回回用户空间的整个过程。系统调用、异常、设备中断进入内核都是以相同的方式，里面涉及到很多细致的设计和重要的细节，对于隔离性（安全性）和性能都非常重要。

## 总览

- 系统调用需要做什么
- 陷入——ecall
- 保存用户寄存器
- 设置内核页表
- 内核C代码执行
- 恢复执行



## 系统调用需要做什么？

有三种事件会导致CPU暂停正常的指令执行，并强制将控制权转移到处理该事件的特殊代码。

- 系统调用（System Call），当用户执行``ecall``指令请求内核执行某些操作时。
- 异常（exception），一条指令（不管是用户还是内核的）执行了非法操作
- 设备中断

很多书会把这些情况统称为Trap（陷入）。在trap发生时，执行的代码需要在稍后恢复运行，也就是说，我们希望trap对**被中断的代码**来说是**透明（transparent）**的。

期望的trap处理流程是：

1. trap强制将控制权转移到内核，也就是说，切换到管理员模式
2. 保存32个用户寄存器和PC
3. 切换到内核页表
4. 切换到内核栈
5. 跳转到内核C代码

额外的目标：不要让用户代码干扰到从用户态到内核态的转化，例如，即不要用管理员模式执行用户代码

6. 对于用户代码透明——也就是说需要恢复运行。

### 示例： Write

```
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



## 1. 陷入——用户/内核态切换

我们以shell程序启动为例，我们知道，他会在命令行写入一个``$``字符，这里涉及到向终端设备输出一个字符，是一种设备中断。在Xv6代码中，具体步骤为：

1. user/sh.c line 137: write(2, "$ ", 2);
2. user/usys.S line 29
   - 这是个write()函数，仍然在用户控件
3. a7寄存器告诉内核它想要哪个系统调用——SYS_write= 16
4. ecall被调用 —— 执行用户/内核空间的转换

### 调试方法

在user/sh.asm，搜索\<write\>函数的地址，找到write调用地址0xc24上

![image-20241120060039782](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673d0a8a252df.png)

于是我们打上断点

```sh
(gdb) b *0xc24
(gdb) c
(gdb) delete 1
(gdb) info reg # 可以看到a1-a3为传入的参数，a7为代号
(gdb) x/2c $a1	 # x表示检查内存 /2表示显示2条内容， 
		c解释为 ASCII 字符
		i代表汇编指令
		x代表hex
		a代表地址
		后面接$p寄存器或者0x地址； 结果可以看到"$"
(gdb) p/a $satp  # 打印satp寄存器的值，并用地址形式展示
(gdb) p $pc
$2 = (void (*)()) 0xe16
(gdb) p $sp 
		$pc 和 $sp都是低地址的, 用户内存从0开始
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

> 为什么$pc会跳到trampoline页呢？

Solution: 这是因为，当陷入（trap）发生时，\$stvec（Supervisor Trap Vector Register）指定了特权模式下用来处理陷入的入口地址（trap handler base address）和模式
- 入口地址指定了处理程序的起始地址，通常指向内核函数
- 模式是最低两位，指定了陷入向量模式 ▯

### ecall 到底做了哪些事情？

1. 将用户模式切换为管理员模式
2. 将\$pc 保存到 \$sepc
3. 跳转到\$stvec （即将\$pc设置为$stvec）
4. 关闭中断

> [!NOTE]
>
> 【ecall的作用补充】
>
> ecall调用让用户代码从用户模式切换到了内核模式，而且设置\$pc =\$stvec，因此内核可以立马获得控制权，又因为也只有ecall才能设置\$stvec，因此用户程序不能通过管理员模式来执行。

> [!NOTE]
>
> 【技巧： Qemu提供查看页表功能】
>
> Trip: 在QEMU模拟器里面，我们可以进入QEMU监视器来获取页表，具体操作是
>
> ``ctrl + a c`` ，然后``info mem``



### `trampoline` 的作用

![截屏2024-09-07 23.08.45](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66dc6c992a2fa.png)

![image-20240920140622652](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66ed10ed817e0.png)

`trampoline` 是一种特殊的内存区域，用于处理从用户态到内核态的过渡。在 RISC-V 系统中，`ecall` 指令会触发陷入（trap），`trampoline` 包含了陷入后执行的最初几条指令，完成模式切换、堆栈设置等工作，然后跳转到内核的 trap 处理逻辑。

> 为什么`trampoline` 必须在用户页表中？

Solution：

- 当用户态执行 `ecall` 时，`satp`（管理页表基地址的寄存器）不会改变，意味着 CPU 使用的仍然是用户页表
- 为了确保陷入后能找到并执行 `trampoline` 中的指令 ▯

一个保护机制：通过去掉 `PTE_U`（用户权限位），即使用户代码尝试访问，也会触发访问异常，保证内核代码的安全性。

> 为什么`trampoline`放在虚拟地址空间顶部？

Solution：用户程序的虚拟地址空间通常从低地址开始增长。如果把 `trampoline` 放在中间，会在用户地址空间中造成“空洞”（未分配的区域），浪费地址空间。 ▯

> 现在我们到了哪？

Solution：我们至今还没执行内核C代码。还需要做的事情：

- 保存32个用户寄存器的值（为了后面透明恢复执行）
- 切换到内核页表
  - 并将栈指针指向内核栈
- 为执行内核C代码的设置栈
- 跳转到内核C代码——usertrap() ▯

> 为什么ecall不帮我们做完上面这些工作？

Solution：这是为了给OS设计者提供优化系统调用，异常处理和中断处理的自由空间，从而实现非常快速的处理。具体来说：

- OS可能可以处理某些陷入而无需切换页表
- OS可以同时映射用户态和内核态到同一页表
- 可能有些寄存器不需要保存
- 可能不需要堆栈处理简单的系统调用 ▯

## 2. 保存用户寄存器

> 我们是否可以将32个寄存器的值写入物理内存中的某个方便的地址？

Solution： 不行，因为即使在管理员模式下，仍然会受到页表的约束，而当前页表是用户页表，而不是内核页表。 ▯

> 能否首先将``satp``设置为内核页表？

Solution：管理员模式下确实可以设置``satp``，但是这点上，我们还不知道内核页表的地址 ▯

那怎么办？

思路： 从32个通用寄存器中挑出的一个，来保存一个地址，这个地址指向我们将保存32个用户寄存器值的内存位置。但是，这32个寄存器中都保存着用户的值，我们必须保留这些值以便最终返回给用户。

保存32个用户寄存器的值解决方案有两个部分：

1. Xv6将一个额外的内核页映射到用户页表中，称为**trapframe**

   - 映射在用户页表中已知的虚拟地址上，始终是同一地址：``0x3fffffe000``
   - trapframe有空间来存储被保存的寄存器值
   - 内核为每个进程分配一个不同的trapframe页
   - 可以查看kernel/proc.h中的``struct trapframe``

   （尽管如此，我们仍然需要一个寄存器来保存trapframe的地址）

2. RISV-V 提供了``sscratch``寄存器

   - 管理员模式下代码可以使用该寄存器作为临时存储
   - 用户态无法使用，因此不需要保存值

> 为什么寄存器的值要在trapframe保存，而不在用户栈中？

Solution: 因为我们不知道用户代码中是否有栈，我们作为内核不能限制用户层使用什么编程语言，有些甚至没有用到栈，栈指针指向0，或者有栈，但是格式很不一样，可能是一块特殊区域作为栈，内核无法理解。因此，内核不能对用户内存做出任何假设， 为了能够透明 恢复执行，我们需要将这些寄存器值放到内核中。 ▯

![image-20241120200837843](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673dd1487e89c.png)

我们可以看到有个``tp``寄存器，线程指针，xv6 用它来维护处理器核的hartid（core号），是cpus[]的索引



## 3. 设置内核页表

在前面trampoline.S的uservec的handling处理过程，分为两个部分，上半部分是保存用户寄存器，下半部分就是设置内核栈，并跳转需要执行的内核代码了。

![image-20241120201555823](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673dd2fee7483.png)

- 该图是下半部分的处理函数

> 一个有趣的现象，现在页表已经换成了内核页表，为什么PC还能够按照顺序继续执行，没有发生crash？

因为trampoline是内核和用户页表都有映射，并映射到同一块区域。直到``jr t0``挑出trampoline.



## 4. 内核C代码执行

![image-20241120223459540](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673df397093a2.png)

t0指向的地址trap.c的usertrap的函数入口。我们来看它干了什么事：

1. 检查\$sstatus寄存器是否来自用户模式
   - **sstatus**：supervisor status register
     - `sstatus`中的SIE位控制设备中断是否被启用。如果内核清除了SIE位，RISC-V将推迟设备中断，直到内核重新设置SIE位
     - ``SPP``位表示trap来自用户模式还是管理模式，并控制`sret`返回到哪个模式。
2. 将\$stvec从用户模式下陷入handling处理函数更改为内核模式的handling处理函数
3. 为了不被在进程切换时将之前保存用户PC的\$sepc寄存器给污染，需要将其保存到用户内存上
4. 检查\$scausej寄存器判断是什么原因导致。
5. 当保存了这些信息后，开启中断，之前是通过ecall由硬件关闭的
6. 执行系统调用

后面的``syscall()``的执行过程就不展开了， 因为重点是介绍系统调用的入口和出口



## 5. 恢复执行

usertrap() 最后会调用 usertrapret()，此时就开始处理返回给用户程序的处理过程了，我们需要做如下变动：

1. 关闭中断
2. 恢复 stvec = uservec，为能够顺利下一次ecall
3. trapfram stap = 内核页表，为了下一次uservec能找到
4. trapframe sp = 内核栈顶
5. trapframe trap = usertrap
6. trapframe hartid = hartid(in tp)

![image-20241120223609765](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/673df3dcf1a94.png)

在最后，trampoline用到了RISV-V 的``sret``指令，为了能让该指令使用，需要准备一些寄存器

- sstatus： 其"privious mode"字段 设置 为0，意味着在用户模式
- sepc： 保存着用户程序的PC（能够返回陷入的入口）

我们还需要将切换到用户页表，在usertrapret()没有搞定，因为这里面没有用户的页表，需要在一个页表，它被映射到用户和内核页表——trampoline，因此会跳到trampoline.S的``userret``；

此时，我们知道寄存器a0持有者返回值，``csrw satp``指令切换到了用户地址空间，然后加载32个用户寄存器，我们跳过它。最后的最后，调用sret

#### sret的作用

是一个硬件硬件操作

1. 将sepc复制到pc
2. 将模式切换为用户模式
3. 重新打开中断（将SPIE 复制到 SIE）
4. 继续在新的PC执行指令







