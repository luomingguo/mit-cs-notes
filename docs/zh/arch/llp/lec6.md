



# Lec 6 例程



## 基本步骤 & 寄存器分组

**过程(procedure)**，根据提供的参数执行特定任务的存储子程序。在执行一个例程时，程序必须遵循以下六个步骤：

```
1. 将参数放在procedure可以访问到的地方。
2. 将控制权转移到procedure。
3. 过程获取所需的存储资源。
4. 执行所需的任务。
5. 将结果值放在调用程序可以访问到地方。
6. 将控制权返回给调用的起始点，因为过程可以从程序中的多个点被调用。
```

RISC-V汇编语言遵循以下约定来分配其32个寄存器

- `x10`~`x17`： 8个寄存器用于参数传递或返回值
- `x1` / `ra`/`rd`：一个返回地址寄存器，用于返回调用点
- `x0` / `zero`: 常量0（只读，写入无效）
- `x2` / `sp`：stack pointer，栈指针
- `x3`/`gp`: global pointer，全局指针
- `x4`/`tp`: thread pointer，线程指针
- `x5~x7`/`t0~t2`: 临时寄存器
- `x8`~`x9`/`fp(s0)`,`s1`: 帧指针, 保存寄存器s1
- `x18`~`x27`/ `s2`~`s11`: 保存寄存器
- `x28`~`x31`/`t3~t6`: 临时寄存器

一个专门用于函数调用指令`jal`（jump-and-link instruction）：它将控制转移到一个地址，同时“链”上原来的返回地址（link），存到`ra`寄存器。

```asm
jal x1, ProcedureAddress ; jump to ProcedureAddress and write return address to x1
```

为了支持跳转到返回地址， RISC-V还使用一种间接跳转指令，即跳转到寄存器保存的地址。这个例子也告诉我们， jump-and-link 指令可用做无条件分支。

```asm
jalr x0, 0(x1)
```

> [!IMPORTANT]
>
> jal 指令实际将当前PC值加4保存到rd寄存器中



当调用一个过程时，可能会需要使用比参数寄存器更多的寄存器。但是，在过程完成后，调用者寄存器中的值必须恢复到它们调用过程之前的原始值。这个保存和恢复寄存器的过程被称为“将寄存器溢出到内存(spill registers to memory)”。

用于这个目的的理想数据结构是栈，它是一个后进先出（LIFO）的队列。一个栈需要一个指针来指示栈中最近分配的地址。这个指针指示了procedure应该下一个将要溢出到栈中的寄存器放置在哪里。在RISC-V架构中，栈指针（`x2`或`sp`）用于跟踪栈的顶部。栈指针的值会根据每个保存或恢复的寄存器而进行调整，通常每个寄存器占用一个双字（doubleword），即8字节，因为是64位RISC-V

当需要将数据（如寄存器值）推入栈时，栈指针会向较低的地址方向移动，这意味着栈的内存区域会逐渐减小。因此，**将数据推入栈中实际上是通过将栈指针减小来完成的**。这个操作可以通过减去双字（通常是8字节）的大小来实现，**因为每个双字大小的内存块都被用来存储一个数据项**。

![截屏2024-05-30 05.14.42](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6838020caa50f.png)

要保存的寄存器有： 所有的保存寄存器 + sp + fp + ra

不需要保存的寄存器： 所有的临时寄存器和参数寄存器



![截屏2024-05-30 10.03.50](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68380af3d50ad.png)

## 基本场景

> ```c
> long long int leaf_example (long long int g, long long int
> h, long long int i, long long int j)
> {
> long long int f;
> f = (g + h) −(i + j);
> return f;
> }
> 
> ```
>
> RISC-V的汇编码会做什么操作？

Solution： 

- 参数变量 g, h, i, 和 j 对应寄存器 x10, x11, x12和 x13
- 局部变量 f （不是参数也不是返回值）对应x20。它不能用参数寄存器（x10~x17）来存储，也不能用 `t0`~`t6` 这种可能随时被覆盖的临时寄存器。
- 编译后的程序从标签`` leaf_example: ``开始
- 下一步是保存寄存器。在由于有赋值语句， 需要使用两个临时寄存器(x5和x6)，因此我们需要保存x5、x6和x20。为了保存这些寄存器的旧值，我们需要将它们推入栈中，以便在过程结束后能够恢复。推入栈中的操作涉及到两个步骤：一是为寄存器的旧值在栈中分配空间，二是将这些旧值存储到栈中。在这个例子中，栈指针`sp`被减去了24个字节的大小，因为每个寄存器需要8个字节的空间。

```asm
addi sp, sp, -24 ; adjust stack to make room for 3 items
sd x5, 16(sp) ; save register x5 for use afterwards
sd x6, 8(sp) ; save register x6 for use afterwards
sd x20, 0(sp) ; save register x20 for use afterwards
```

![截屏2024-05-30 02.58.12](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66577acc18b54.png)

接着是过程的主体

```asm
add x5, x10, x11 ; register x5 contains g + h
add x6, x12, x13 ; register x6 contains i + j
sub x20, x5, x6 ; f = x5 − x6, which is (g + h)−(i + j)
; 为了函数f返回值，我们将他拷贝到参数寄存器
addi x10, x20, 0 ; returns f (x10 = x20 + 0)
; 在返回前，我们恢复三个寄存器的旧值
ld x20, 0(sp) ; restore register x20 for caller
ld x6, 8(sp) ; restore register x6 for caller
ld x5, 16(sp) ; restore register x5 for caller
addi sp, sp, 24 ; adjust stack to delete 3 items
; 过程以一个使用返回地址的寄存器跳转指令结束
jalr x0, 0(x1) ; branch back to calling routine

```



## 嵌套场景

函数嵌套场景下的一种方法是将所有必须保留的其他寄存器都推送到堆栈上，就像我们对保存的寄存器做的那样。调用者在调用后将任何需要的参数寄存器（x10–x17）或临时寄存器（x5-x7和x28-x31），调用者推送返回地址寄存器x1 都推送到堆栈上。堆栈指针sp根据堆栈上放置的寄存器数量进行调整。

```c
long long int fact (long long int n)
{
	if (n < 1) return 1;
	else 
    return (n * fact(n −1));
}
```

RISV-V的汇编码如下

```asm
fact:
addi sp, sp, -16 ; adjust stack for 2 items
sd x1, 8(sp)	; save the return address
sd x10, 0(sp)	; save the argument n
addi x5, x10, -1 ; x5 = n - 1
bge x5, x0, L1 ; if (n - 1) >= 0, go to L1
addi x10, x0, 1 ; return 1
addi sp, sp, 16 ; pop 2 items off stack
jalr ; return to caller

L1: 
addi x10, x10, -1 ; n >= 1: argument gets (n −1)
jal x1, fact ; call fact with (n −1)
addi x6, x10, 0 ; return from jal: move result of fact(n - 1) to x6
ld x10, 0(sp) ; restore argument n
ld x1, 8(sp) ; restore the return address
addi sp, sp, 16 ; adjust stack pointer to pop 2 items
mul x10, x10, x6 ; return n * fact (n −1)
jalr x0, 0(x1) ; return to the caller
```

- 参数n对应寄存器x10
- 编译程序首先从标签开始，然后保存两个寄存器(返回地址和x10)到栈上
- 然后当fact第一次被调用，``sd``保存两个寄存器到栈上。 
- n < 1时，fact 返回1。在函数结束时，因为在这种情况下 x1 和 x10 的值没有改变，所以在恢复栈上保存的值之前，可以跳过加载 x1 和 x10 的指令

> [!IMPORTANT]
>
> C语言中的变量本质上是内存中的一个位置（存储单元），这个变量的含义（如何解释这块内存）取决于两个方面：
>
> - 类型
> - 存储类别：两种，一种是局部的还是静态的。
>   - 所有在函数外面声明的变量，默认是 `static`（全局变量）
>
> 为了简化对静态数据的访问，一些RISC-V编译器会为全局指针`gp`保留一个寄存器（通常是x3），汇编语言中用于指向静态数据区域。静态数据包括在程序运行期间始终存在的数据，如全局变量和静态变量。

> [!NOTE]
>
> 静态变量和全局变量的核心区别
>
> 全局变量：在**整个程序范围内可见**，任何源文件中的函数都可以访问（如果使用 `extern` 声明）
>
> 静态变量：如果在函数外定义（**静态全局变量**）仅在当前**源文件内可见**，无法被其他文件访问；如果在函数内定义（**静态局部变量**），仅在**该函数内部可见**，不会被外部访问。



## 栈上分配空间

最后一个复杂性是栈还用于存储局部变量，这些变量不适合存储在寄存器中，比如局部数组或结构体。包含一个过程的保存寄存器和局部变量的栈段称为**过程帧(procedure frame)**或**激活记录(activation record)**，下图展示了在过程调用前中后栈的状态。

帧指针(fp或者x8)指向当前栈帧的第一个双字，栈指针指向栈的顶部，当一个新的过程调用发生时，栈指针会调整，以腾出空间给保存的寄存器和局部变量，由于栈指针在过程执行期间可能会改变，使用帧指针作为稳定的基准点来引用局部变量更为方便。如果没有局部变量需要存储在栈中，编译器可以优化，不设置和恢复帧指针，节省时间。帧指针的初始化通常在过程调用开始时使用栈指针的当前值，然后在过程结束时使用帧指针来恢复栈指针。这样确保在过程调用结束时，栈恢复到调用之前的状态。



![截屏2024-05-30 05.43.02](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6657a16d7d350.png)

> [!NOTE]
>
> **procedure frame** Also called activation record. The segment of the stack containing a procedure’s saved registers and local variables

一些 RISC-V 编译器使用寄存器 `x8`（即 `fp`）作为**帧指针**，它指向该函数**栈帧的起始位置**（通常是第一个 doubleword，也就是 8 字节对齐的位置）

`sp`（栈指针）在过程执行期间可能会发生变化（比如调用其他函数、临时分配空间等），这样程序中访问局部变量时相对于 `sp` 的偏移量就可能变化。这会使代码的可读性变差，调试困难。

相比之下，`fp` 是在进入函数时设定好的、在整个函数执行期间不变，因此以 `fp` 为基准来访问局部变量会更稳定、更容易理解。前面我们写的汇编例子里没有使用 `fp`，是因为我们**在过程内部并不修改 `sp`**，只在进入和退出函数时调整了一次栈指针，这样局部变量的偏移就始终固定，不需要额外的 `fp`

## 堆上分配空间

```
低地址
│
├── Reserved 区域（操作系统保留）
├── Text segment（代码段：程序的机器码）
├── Static data segment（全局变量、常量等）
├── Heap（堆：动态分配内存，如 malloc 的空间）
│         ↑（向上增长）
│         ↓（向下增长）
├── Stack（栈：局部变量、函数调用）
高地址
```



这些地址只是软件约定，并不是 RISC-V 架构的一部分。用户地址空间设置为 $2^{38}$，占总的 2^64 地址空间。栈指针初始化为 `0x0000 003f ffff fff0`，并向下增长到数据段（data segment)。另一方面，程序代码（“text”）从 `0x0000 0000 0040 0000`开始。

![截屏2024-05-30 09.56.51](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/%E6%88%AA%E5%B1%8F2024-05-30%2009.56.51.png)

下图总结了汇编中寄存器使用的约定，大多数程序可以使用多达八个参数寄存器、十二个保存寄存器(saved register)和七个临时寄存器而无需访问内存。

如果有超过八个参数怎么办？RISC-V 的约定是将额外的参数放在栈上，紧挨着帧指针。程序随后会期望前八个参数在寄存器 x10 到 x17 中，其余的参数在内存中，通过帧指针可寻址。



