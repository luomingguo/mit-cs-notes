# Lec 6 RISC-V调用约定 & GDB

## 总览

- C代码编译成机器指令
- Debugging

## C代码编译成机器指令

- 机器在更底层是如何工作的？
- 这种翻译过程是如何进行的？
- 如何在 C 和汇编之间进行交互？
- 为什么这很重要：有时需要编写无法用 C 表达的代码

### RISC-V 抽象机器

- 没有类似 C 的控制流，没有变量和类型的概念……

- 基础 ISA（指令集架构）：程序计数器，32 个通用寄存器（x0 到 x31）

| 寄存器  | 名称   | 保存者 | 描述                                                |
| ------- | ------ | ------ | --------------------------------------------------- |
| x0      | zero   |        | 硬布线0                                             |
| x1      | ra     | caller | 返回地址                                            |
| x2      | sp     | callee | 栈指针                                              |
| x3      | gp     |        | 全局指针                                            |
| x4      | tp     |        | 线程指针                                            |
| x5-x7   | t0-t2  | caller | 临时寄存器                                          |
| x8      | s0/fp  | callee | 帧指针/saved 寄存器(由callee负责保存和恢复的寄存器) |
| x9      | s1     | callee | saved 寄存器                                        |
| x10-x11 | a0-a1  | caller | 函数参数/返回值                                     |
| x12-x17 | a2-a7  | caller | 函数参数                                            |
| x18-x27 | s2-s11 | callee | saved寄存器                                         |
| x28-x31 | t3-t6  | caller | 临时寄存器                                          |
| pc      |        |        | 程序计数器                                          |

### 示例：累加

```c
// sum_to(n)
int sum_to(int n) {
  int acc = 0;
  for (int i = 0; i <= n; i++) {
    acc += i;
  }
  return acc;
}
```

其汇编代码为

```assembly
.section .text 		# 告诉编译器/汇编器接下来的内容是代码，并将其（定义的函数）放置在 .text 段中
.global sum_to  	# .global表示你可以从其他文件中调用sum_to函数

# sum_to(n)
# expectes argument in a0
# return result in a0
sum_to:
	mv t0, a0    		# t0 <- a0
	li a0, 0		 		# a0 <- 0
loop:
	add a0, a0, t0	# a0 <- a0 + t0
	addi t0, t0, -1 # t0 <- t0 - 1
	bnez t0, loop   # if t0 != 0; pc <- loop
	ret
```

### 受限的抽象

- 在汇编语言的中，没有高级语言的类型化，位置参数化和局部变量的概念。
- 没有类似C中的局部变量或者函数参数传递机制，所有数据的操作都发生在寄存器中。具体的值通过寄存器传递和处理

> 如何调用sum_to(n)?

```assembly
main:
	li a0, 10   # a0 <- 10
	call sum_to # call sum_to
	
```

> call 指令的语义是什么？

汇编指令``call label``会执行以下两个操作：

1. **保存返回地址**： ``ra <- pc + 4``，即将返回地址存储在ra寄存器中，返回地址是当前指令的一
2. **跳转到目标函数**：``pc <- label``，将程序计数器PC设置为label（目标函数的地址）

> label 的语义是什么？

机器指令中没有标签的概念，标签（如 `sum_to`）在编译时会被转换为**相对跳转**或者**绝对跳转**。这意味着，机器看到的不是人类可读的标签，而是目标指令地址

> ret 指令的语义是什么

执行一个操作：

编指令 `ret`（函数返回）会将程序计数器 `pc` 设置为 `ra` 寄存器的值

## 参考材料

- [RISC-V ISA 规范(ISA specification)](https://riscv.org/specifications/)
  - [非特权指令集 - Google 云端硬盘](https://drive.google.com/file/d/1uviu1nH-tScFfgrovvFCrj7Omv8tFtkp/view)
  - [特权指令集 - Google 云端硬盘](https://drive.google.com/file/d/17GeetSnT5wW3xNuAHI95-SI1gPGd5sJ_/view)
- [RISC-V ISA 用户参考手册(ISA Reference)](https://www.cs.sfu.ca/~ashriram/Courses/CS295/assets/notebooks/RISCV/RISCV_CARD.pdf)
- [RISC-V 汇编语言参考手册](https://michaeljclark.github.io/asm.html)

