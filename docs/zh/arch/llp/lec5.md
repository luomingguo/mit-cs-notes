



# Lec 5 调用约定 & 内存布局



本节内容：

本节主要学习 RISC-V 调用约定，并且从细节上，学习栈和活动记录了解，调用过程的细节问题，最后会学习一种特殊的过程——嵌套过程。







## 调用约定

函数调用中，如何传递参数 & 返回值？  这就需要**调用约定**（*calling converntion*） 

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>调用约定</strong>  在不同过程（procedure， 即函数/子程序）之间，关于如何使用寄存器的一套规则 </div>

过程（*procedure*），根据提供的参数执行特定任务的存储子程序。在执行一个例程时，程序必须遵循以下六个步骤：

1. 将参数放在procedure可以访问到的地方。
2. 将控制权转移到procedure。
3. procedure过程获取所需的存储资源。
4. 执行所需的任务。
5. 将结果值放在调用程序可以访问到地方。
6. 将控制权返回给调用的起始点，因为过程可以从程序中的多个点被调用。



**控制转移指令**

过程调用中，控制权的转移依赖两条跳转指令：

`jal x1, ProcedureAddress`（*jump-and-link*）：跳转到目标过程的地址，同时把下一条指令的地址（即 PC+4）保存到 x1（*ra*）中，作为返回地址（*return address*）。"link"就是指这个被保存下来的、指向调用点的链接，让过程执行完后能跳回来。

`jalr x0, 0(x1)`（*jump-and-link register*）：跳转到 x1 中保存的地址，即回到调用者。目标寄存器写 x0 意味着不保存新的返回地址（因为我们只是"回去"，不需要再记住从哪里回去的）。

所以，调用者用 `jal x1, X` 跳到过程 X，被调用者执行完后用 `jalr x0, 0(x1)` 跳回调用者。

> jal 也可以用来做无条件跳转（不保存返回地址）：`jal x0, Label`，因为写入 x0 等于丢弃返回地址。

函数的参数/返回值

| 符号名   | 寄存器     | 描述       |
| -------- | ---------- | ---------- |
| a0 到 a7 | x10 到 x17 | 函数参数   |
| a0 到 a1 | x10 到 x10 | 函数返回值 |

注：第一个参数在 a0， 第二个参数在a2 ... 以此类推。调用者有责任在调用一个过程之前将必要的参数放入寄存器中

![image-20260613050427555](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613050427555.png)



第一个返回值在a0，第二个在a1。 被调用者有责任在返回前将返回值放入到必要的寄存器中。

![image-20260613050650205](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613050650205.png)



> 如果一个例程超过了寄存器所需的存储量怎么办？

Sol： 分配一个特殊的内存区域进行存储， 在过程完成后，再必要的时候进行恢复，将寄存器溢出到内存（*spill registers to memory*）。实现这个功能理想的结果就是栈，一个后进先出（LIFO）的队列。一个栈需要一个指针来指示栈中最近分配的地址。这个指针指示了procedure应该下一个将要溢出到栈中的寄存器放置在哪里



![image-20260613052747549](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613052747549.png)



RISC-V的栈的几个基本性质：

- 栈是从高地址往低地址方向增长的，后进先出（LIFO）

- SP指向栈顶

- push 操作:先腾出空间,再存数据

  ```assembly
  addi sp, sp, -4 # 分配空间
  sw a1, 0(sp) # 把元素放进去
  ```

- pull（pop）操作:先取数据,再移动指针

  ```assembly
  lw a1, 0(sp) # 把元素拿走
  addi sp, sp, 4 # 释放空间
  ```

  



| 寄存器  | 符号名 | Description                          | 中文描述         | 保存者   |
| ------- | ------ | ------------------------------------ | ---------------- | -------- |
| x0      | zero   | Hardwired zero                       | 硬件固定为 0     | —        |
| x1      | ra     | Return address                       | 返回地址         | 调用者   |
| x2      | sp     | Stack pointer                        | 栈指针           | 被调用者 |
| x3      | gp     | Global pointer                       | 全局指针         | —        |
| x4      | tp     | Thread pointer                       | 线程指针         | —        |
| x5-x7   | t0-t2  | Temporary registers                  | 临时寄存器       | 调用者   |
| x8-x9   | s0-s1  | Saved registers                      | 保存寄存器       | 被调用者 |
| x10-x11 | a0-a1  | Function arguments and return values | 函数参数和返回值 | 调用者   |
| x12-x17 | a2-a7  | Function arguments                   | 函数参数         | 调用者   |
| x18-x27 | s2-s11 | Saved registers                      | 保存寄存器       | 被调用者 |
| x28-x31 | t3-t6  | Temporary registers                  | 临时寄存器       | 调用者   |





**叶子过程与非叶子过程**

叶子过程（*leaf procedure*）是不调用其他过程的过程。由于它内部不会再发生 `jal` 调用，ra 不会被覆盖，所以叶子过程不需要保存 ra。如果它只用到临时寄存器（t 系列）和参数寄存器（a 系列），甚至连栈都不需要碰——这就是最简单的情况。

非叶子过程（*non-leaf procedure*）会调用其他过程。一旦内部执行了 `jal x1, ...`，ra 就会被新的返回地址覆盖，所以非叶子过程必须在调用之前把 ra 压栈保存，返回前再恢复。同样，如果它用了 saved 寄存器（s 系列），也必须先存后恢复。

**跨调用保存规则总结**

| 需要保存（跨调用不变） | 不需要保存（可能被覆盖）     |
| ---------------------- | ---------------------------- |
| saved 寄存器：s0–s11   | 临时寄存器：t0–t6            |
| 栈指针：sp             | 参数/返回值寄存器：a0–a7     |
| 帧指针：fp（如果使用） | 返回地址：ra（caller-saved） |
| 栈中 sp 以上的内容     |                              |

保护栈的方式有三种：callee 不写 sp 以上的区域（保护栈内容）；callee 退出时把 sp 加回和减去的等量值（保护 sp 本身）；callee 把要用的 saved 寄存器存到栈里再恢复（保护寄存器值）。

**C 的两种存储类别**

C 变量除了有类型（int、char 等），还有存储类别（*storage class*）。自动变量（*automatic*）是过程内部的局部变量，过程退出后就消失，对应栈上的空间。静态变量（*static*）在整个程序生命周期内存在，不随过程退出而消失——在所有过程外部声明的变量默认是 static，过程内部用 `static` 关键字声明的变量也是。RISC-V 编译器保留寄存器 x3（gp，全局指针）指向静态数据区（*static data segment*），方便访问全局变量和常量。

**手动翻译 C 到汇编的三个步骤**

教材中给出了一个通用的翻译方法：

1. 为程序变量分配寄存器（*register allocation*）——参数用 a0–a7，局部变量用 saved 或 temporary 寄存器。
2. 为过程体生成汇编代码（*produce code for the body*）——逐行翻译 C 的运算、控制流等。
3. 保存和恢复寄存器（*preserve registers*）——根据调用约定，在过程开头保存需要的寄存器到栈上，结尾恢复。

后面的例题都按照这三步来展开。



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题1 </strong> RISC-V的汇编码会做什么操作？ </div>

```c
long long int leaf_example (long long int g, long long int
                            h, long long int i, long long int j)
{
  long long int f;
  f = (g + h) −(i + j);
  return f;
}
```

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







> 注意：上面的例子中我们保存了 x5、x6、x20 三个寄存器。但根据调用约定，x5 和 x6 是临时寄存器（caller-saved），callee 不需要负责保存和恢复它们。实际上只有 x20（saved 寄存器）才必须由 callee 保存。所以优化后只需要保存和恢复 x20 一个寄存器，省掉了 x5 和 x6 的两次 sd 和两次 ld，共减少四条指令。



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题2</strong> swap 过程——叶子过程的完整翻译 </div>

```c
void swap(long long int v[], long long int k)
{
    long long int temp;
    temp = v[k];
    v[k] = v[k+1];
    v[k+1] = temp;
}
```

按三步法翻译：

第一步，寄存器分配：参数 v 在 x10，k 在 x11。局部变量 temp 分配给 x5（swap 是叶子过程，可以用临时寄存器）。

第二步，过程体代码。注意一个常见易错点：RISC-V 内存按字节寻址，doubleword 之间相隔 8 字节而不是 1，所以索引 k 要先乘以 8（左移 3 位）再加上数组基地址：

```asm
slli x6, x11, 3      ; x6 = k * 8
add  x6, x10, x6     ; x6 = v + (k * 8)，即 v[k] 的地址
ld   x5, 0(x6)       ; temp = v[k]
ld   x7, 8(x6)       ; x7 = v[k+1]（相邻元素地址 +8）
sd   x7, 0(x6)       ; v[k] = v[k+1]
sd   x5, 8(x6)       ; v[k+1] = temp
```

第三步，保存寄存器。swap 是叶子过程，且只用了临时寄存器（x5、x6、x7），没有用到任何 saved 寄存器，所以不需要任何保存/恢复操作。

完整的 swap 过程：

```asm
swap:
  slli x6, x11, 3      ; x6 = k * 8
  add  x6, x10, x6     ; x6 = v + (k * 8)
  ld   x5, 0(x6)       ; temp = v[k]
  ld   x7, 8(x6)       ; x7 = v[k+1]
  sd   x7, 0(x6)       ; v[k] = v[k+1]
  sd   x5, 8(x6)       ; v[k+1] = temp
  jalr x0, 0(x1)       ; 返回调用者
```

这个例子展示了叶子过程的最简形式：没有栈操作，没有保存/恢复寄存器，开头就是过程体，结尾就是 jalr 返回。



**帧指针（*frame pointer*）**

有些 RISC-V 编译器会使用帧指针 fp（即寄存器 x8/s0）指向当前栈帧的第一个 doubleword（通常是最先被保存的那个寄存器）。帧指针的好处是：它在过程执行期间保持不变，而 sp 可能在过程体中被进一步调整（比如为局部数组分配空间）。如果 sp 在过程中间变化了，同一个局部变量在过程的不同位置可能需要不同的偏移量来访问，代码变得更难读懂。帧指针提供了一个稳定的基地址，所有栈上变量都可以用相对于 fp 的固定偏移来访问。

帧指针在调用时用 sp 的值来初始化，返回时用 fp 来恢复 sp。如果过程内部不改变 sp（像我们前面的例子那样，只在入口和出口各调整一次），编译器会省略帧指针以节省一条指令。RISC-V 的 C 编译器只在过程体中会改变 sp 的情况下才使用帧指针。



## 堆上分配空间

```
低地址
│
├── Reserved 区域（操作系统保留）
├── Text segment（代码段：程序的机器码）
├── Static data segment（全局变量、常量等）
├── Heap（堆：动态分配内存，如 malloc 的空间）
│          ↓（向下增长）
│          ↑（向上增长）
├── Stack（栈：局部变量、函数调用）
高地址
```



这些地址只是软件约定，并不是 RISC-V 架构的一部分。用户地址空间设置为 $2^{38}$，占总的 2^64 地址空间。栈指针初始化为 `0x0000 003f ffff fff0`，并向下增长到数据段（data segment)。另一方面，程序代码（“text”）从 `0x0000 0000 0040 0000`开始。

![截屏2024-05-30 09.56.51](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/%E6%88%AA%E5%B1%8F2024-05-30%2009.56.51.png)

下图总结了汇编中寄存器使用的约定，大多数程序可以使用多达八个参数寄存器、十二个保存寄存器(saved register)和七个临时寄存器而无需访问内存。

如果有超过八个参数怎么办？RISC-V 的约定是将额外的参数放在栈上，紧挨着帧指针。程序随后会期望前八个参数在寄存器 x10 到 x17 中，其余的参数在内存中，通过帧指针可寻址。

**堆的动态内存分配**

静态数据区适合存放大小固定的数据（全局变量、常量、固定长度的数组等），但链表、树这类数据结构在运行时会不断增长和缩小，不适合放在静态区。堆（*heap*）就是为这类动态数据结构准备的内存区段，它紧挨着静态数据区的上方，向高地址增长——注意这和栈的增长方向相反（栈从高地址向低地址增长）。这种布局让栈和堆朝着彼此生长，可以灵活地共享中间的空闲内存。

C 中用两个显式的函数来管理堆：`malloc()` 在堆上分配指定大小的空间，返回指向这块空间的指针；`free()` 释放之前分配的空间。这意味着程序员完全手动控制内存的分配和释放，而这正是许多常见且难以调试的 bug 的来源：

内存泄漏（*memory leak*）：分配了内存但忘记释放。程序运行时间越长，被"遗忘"的内存就越多，最终可能耗尽所有可用内存，导致操作系统崩溃或程序被杀死。

悬空指针（*dangling pointer*）：过早释放了内存，但仍然有指针指向那块已经被释放的区域。如果之后通过这个指针去读写，就会访问到意义不明的数据，或者访问到已经被重新分配给别的用途的内存，导致不可预测的行为。

Java 为了避免这两类 bug，采用了自动内存管理和垃圾回收（*garbage collection*），程序员不需要手动 free。







## 栈与活动记录

当过程需要的存储超出寄存器容量时,在一块专门的、不属于寄存器的内存区域——栈（*stack*）上分配空间。RISC-V 的栈从高地址向低地址增长，遵循后进先出（LIFO）。栈指针（*stack pointer, sp*）指向栈顶。任何过程都可以使用栈,但在返回之前必须把栈恢复成进入时的样子，即 sp 必须重置为过程开始时的值。

**活动记录** （*activation record*）保存一个过程中所有放不进寄存器的存储需求（如需要保存的寄存器、返回地址、较大的局部变量），它被分配在栈上,遵循 LIFO。活动记录也叫栈帧（stack frame）。当前正在执行的过程的活动记录,永远位于栈顶。

如果 caller 和 callee 需要用到同一个寄存器怎么办？  RISC-V 调用约定规定了共享规则。临时寄存器（*temporary*， t 系列）不保证跨调用保留；保存寄存器（*saved*，s 系列）保证跨调用保留。属于被调用者保存（callee-saved）的寄存器(如 s0–s11、sp)，callee 若要使用必须先存到栈，返回前恢复，使 caller 看到的值不变。 属于调用者保存（*caller-saved*）的寄存器（如 t0–t6、a0–a7、ra）, 被调用者可随意覆盖， 调用者 若调用后还需要原值就得自己提前保存。





## 嵌套过程

**嵌套过程**（*nested procedures*）中，因为 callee 自己又会调用别的过程从而覆盖 `ra`， 所以必须先把 `ra` 压栈保存，返回前再恢复，然后才能正确地跳回 `ra`。递归（*recursion*）是嵌套过程的特例，每层调用都有自己的活动记录。





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



**尾递归优化（*tail recursion*）**

有些递归过程可以被改写成迭代形式，从而避免递归调用的开销（每层递归都要压栈、保存寄存器、恢复、弹栈）。典型的场景是尾递归（*tail call*）——递归调用是过程的最后一个操作，调用返回后不需要再做任何计算。例如：

```c
long long int sum(long long int n, long long int acc) {
    if (n > 0)
        return sum(n - 1, acc + n);
    else
        return acc;
}
```

调用 `sum(3, 0)` 会产生 `sum(2,3)` → `sum(1,5)` → `sum(0,6)`，然后 6 被逐层返回四次。但因为每次递归调用之后没有其他操作（直接 return 结果），可以优化成循环，完全不用栈：

```asm
sum:
  ble  x10, x0, sum_exit  ; 如果 n <= 0，跳到 sum_exit
  add  x11, x11, x10      ; acc = acc + n
  addi x10, x10, -1       ; n = n - 1
  jal  x0, sum            ; 跳回 sum（无条件跳转，不保存返回地址）
sum_exit:
  addi x10, x11, 0        ; 返回值 = acc
  jalr x0, 0(x1)          ; 返回调用者
```

没有 `addi sp` ，没有 `sd`/`ld`，整个过程不碰栈。这就是尾递归优化的威力：把 $O(n)$ 的栈空间开销降为 $O(1)$。



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题3</strong> sort 过程——非叶子过程 + 嵌套循环 + 过程调用的完整翻译 </div>

```c
void sort(long long int v[], long long int n)
{
    long long int i, j;
    for (i = 0; i < n; i += 1) {
        for (j = i - 1; j >= 0 && v[j] > v[j+1]; j -= 1) {
            swap(v, j);
        }
    }
}
```

这是一个冒泡排序，内部调用了前面写好的 swap 过程。按三步法翻译：

第一步，寄存器分配：参数 v 在 x10，n 在 x11。但 sort 内部要调用 swap，而 swap 也需要 x10 和 x11 传参数，所以必须把 sort 自己的参数拷贝到 saved 寄存器里保护起来：x21 保存 v，x22 保存 n。循环变量 i 分配给 x19，j 分配给 x20。

第二步，过程体代码（从外到内展开两层 for 循环）：

```asm
; ---- 保存寄存器（prologue） ----
  addi sp, sp, -40        ; 为 5 个寄存器腾出空间
  sd   x1, 32(sp)         ; 保存 ra（sort 是非叶子过程）
  sd   x22, 24(sp)        ; 保存 x22
  sd   x21, 16(sp)        ; 保存 x21
  sd   x20, 8(sp)         ; 保存 x20
  sd   x19, 0(sp)         ; 保存 x19
; ---- 拷贝参数 ----
  mv   x21, x10           ; x21 = v
  mv   x22, x11           ; x22 = n
; ---- 外层循环 ----
  li   x19, 0             ; i = 0
for1tst:
  bge  x19, x22, exit1    ; if i >= n，退出外层循环
  addi x20, x19, -1       ; j = i - 1
; ---- 内层循环 ----
for2tst:
  blt  x20, x0, exit2     ; if j < 0，退出内层循环
  slli x5, x20, 3         ; x5 = j * 8
  add  x5, x21, x5        ; x5 = v + (j * 8)
  ld   x6, 0(x5)          ; x6 = v[j]
  ld   x7, 8(x5)          ; x7 = v[j+1]
  ble  x6, x7, exit2      ; if v[j] <= v[j+1]，退出内层循环
; ---- 调用 swap(v, j) ----
  mv   x10, x21           ; 第一个参数 = v
  mv   x11, x20           ; 第二个参数 = j
  jal  x1, swap           ; 调用 swap
  addi x20, x20, -1       ; j -= 1
  j    for2tst             ; 跳回内层循环测试
exit2:
  addi x19, x19, 1        ; i += 1
  j    for1tst             ; 跳回外层循环测试
exit1:
; ---- 恢复寄存器（epilogue） ----
  ld   x19, 0(sp)
  ld   x20, 8(sp)
  ld   x21, 16(sp)
  ld   x22, 24(sp)
  ld   x1, 32(sp)
  addi sp, sp, 40
  jalr x0, 0(x1)          ; 返回调用者
```

这个例子的关键点在于：sort 是非叶子过程（调用了 swap），所以必须保存 ra；sort 用了四个 saved 寄存器（x19–x22），按调用约定都要保存和恢复；sort 的原始参数 x10/x11 在调用 swap 之前会被覆盖（因为 swap 也需要 x10/x11 做参数），所以必须在过程一开始就把它们拷贝到 saved 寄存器里。C 的 9 行代码变成了 34 行 RISC-V 汇编。

> **过程内联（*procedure inlining*）** 是一种编译器优化：不通过 jal 调用过程，而是直接把被调用过程的代码复制到调用点。在 sort 的例子里，内联 swap 可以省掉参数传递和跳转的开销（大约 4 条指令）。缺点是如果被内联的过程在多处被调用，代码体积会膨胀，可能导致缓存未命中率（*cache miss rate*）上升，反而变慢。





<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>栈追踪(2023 春季 Q4 第 5 题)</strong> 下面这段代码用来计算 a0 在 a1 为底数下的对数,涉及 ilog2(求以 2 为底的整数对数)和 idiv(整数除法)两个递归过程。题目在若干时间点记录了内存和寄存器的值,要求据此填表。这里保留题面代码供你对照分析</div>

```asm
jal ra, log_a_x        # TIME POINT 0(本行执行后)

ilog2:                 # 求 a0 的 ilog2
  addi sp, sp, -4
  sw   ra, 0(sp)
  addi t1, zero, 1
  blt  t1, a0, ilog_else
  addi a0, zero, 0
  beq  zero, zero, ilog_ret
ilog_else:
  srli a0, a0, 1
  jal  ra, ilog2
  addi a0, a0, 1
ilog_ret:
  lw   ra, 0(sp)
  addi sp, sp, 4
  jalr zero, 0(ra)

idiv:                  # 求 a0 / a1
  addi sp, sp, -4
  sw   ra, 0(sp)
  addi t1, zero, 0
  bge  a0, a1, idiv_else
  addi a0, zero, 0
  beq  zero, zero, idiv_ret
idiv_else:
  sub  a0, a0, a1
  jal  ra, idiv
  addi a0, a0, 1
idiv_ret:
  lw   ra, 0(sp)
  addi sp, sp, 4
  jalr zero, 0(ra)

log_a_x:               # 计算以 a1 为底 a0 的对数
  addi sp, sp, -12
  sw   ra, 0(sp)
  sw   s0, 4(sp)
  sw   s1, 8(sp)
  add  s0, a0, zero    # TIME POINT 1(第 38 行执行后)
  addi a0, a1, 0
  jal  ra, ilog2
  addi s1, a0, 0
  addi a0, s0, 0       # TIME POINT 2(第 42 行执行后)
  jal  ra, ilog2
  addi a1, s1, 0
  jal  ra, idiv
  lw   s1, 8(sp)       # TIME POINT 3(第 46 行执行后)
  lw   s0, 4(sp)
  lw   ra, 0(sp)
  addi sp, sp, 12
  jalr zero, 0(ra)     # TIME POINT 4(第 50 行执行后)
```

分析这类题的关键点:log_a_x 在入口处用 `addi sp, sp, -12` 开了一个 3 个字的栈帧,分别保存 ra、s0、s1(因为它们是 callee-saved,且后续调用 ilog2/idiv 会覆盖 ra);ilog2 和 idiv 各自递归,每层都把 ra 压栈,所以靠观察栈上 ra 的变化和 sp 的移动,可以反推递归发生了几层、各时间点寄存器的值。
