# 6.1904 C语言的底层汇编



## 先行条件

无

## 课程描述

| 周次    | 主题                                                         |
| ------- | ------------------------------------------------------------ |
| 第 1 周 | 无符号二进制编码、十六进制编码、位运算、补码编码（two's complement）、ASCII 字符编码、 |
| 第 2 周 | C 语法、C 中的数据类型、                                     |
| 第 3 周 | 数组与指针、字符串、结构体、指针算术（pointer arithmetic）   |
| 第 4 周 | RISC-V 汇编语言、RISC-V 指令编码（instruction encoding）、指令内存（instruction memory） |
| 第 5 周 | RISC-V 调用约定（calling convention）、栈（stack）           |
| 第 6 周 | 内存布局（memory layout）、堆（heap）、动态内存分配（dynamic memory allocation） |



它旨在帮助学生建立对内存和相关主题的理解，包括指针、不同数据结构在内存中的存储方式、堆栈和堆，以便对现代计算系统中操作复杂数据结构的限制有一个深入的理解。此外，该课程还研究汇编语言，以便让学生深入了解高级语言是如何被翻译成机器级指令的。

*J. Steinmeyer*

在线C语言运行环境： [replit](https://replit.com/languages/c)

### 参考书

- [The C Programming Language, Second Edition](./The C Programming.Language.2nd.pdf)
- [Digital Design: A Systems Approach](http://library.mit.edu/item/002135433), William J. Dally and R. Curtis Harting, Cambridge University Press, 1st ed., 2012.
- [Computer Organization and Design: The Hardware Software Interface, RISC-V Edition](http://library.mit.edu/item/002588034), David A. Patterson and John L. Hennessy, Morgan Kaufmann, 1st ed., 2017.
- [Computation Structures Online Materials](http://computationstructures.org/)
  - 对于6.004课程，部分内容已经过时


![截屏2024-07-03 01.19.42](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/668436b408331.png)

## 测验

[fall 2022a](resources/qf22a_quiz.pdf)	[solution](resources/qf22a_quiz_soln.pdf)

[fall 2022b](resources/qf22b_quiz.pdf)	[solution](resources/qf22b_quiz_soln.pdf) 

[spring 2022b](resources/qs22b_quiz.pdf)	[solution](resources/qs22b_quiz_soln.pdf)  

[spring 2025a](resources/qs25a_quiz.pdf)	[qs25a_quiz_soln.pdf](resources/qs25a_quiz_soln.pdf) 





[qs24b_quiz_soln.pdf](resources/qs24b_quiz_soln.pdf)  

[qs24a_quiz_soln.pdf](resources/qs24a_quiz_soln.pdf)  

[qs23b_quiz_soln.pdf](resources/qs23b_quiz_soln.pdf)  

[qs23a_quiz_soln.pdf](resources/qs23a_quiz_soln.pdf)  







# Lec 1 二进制基础

- **二进制运算**：字节/字/位、无符号整数、进位、固定位宽的回绕（模运算）、十六进制
- **位运算**：`& | ^ ~ << >>` 六个运算符、常用惯用法（取/置/清/翻转某位、掩码、清最低位 1）、XOR 性质
  - *踩坑*：`&` vs `&&`、移位优先级低于 `+ -`
- **有符号数与补码**：MSB 符号位、`−A = ~A + 1`、表示范围、逻辑移位 vs 算术移位
  - *踩坑*：有符号溢出 UB / 无符号环绕、有符号⇄无符号比较、补码不对称（`INT_MIN`）、移位三坑、八进制字面量、`char` 符号性、整数提升
- **字节序（endianness）**：小端 vs 大端、`int` 在内存里的字节排列、`int*→char*` 检测字节序、网络字节序
- **浮点数**：指数格式与近似本质、IEEE 754 字段划分、偏移码、特殊值（±0 / 次正规 / ∞ / NaN）
  - *踩坑*：不能用 `==` 比浮点、加法不满足结合律、大数吸收小数、`int→float` 丢精度、`NaN != NaN`、±0
- **printf**：格式说明符必须匹配实参类型

[lec1.md](./lec1.md)



# Lec 2 C语言基础

- **统一框架**：作用域 / 生命周期 / 链接三个正交属性，四类对象挂在同一张表上
- **外部变量**：跨函数共享数据；逆波兰计算器实例（栈放哪、参数求值顺序陷阱、`getch`/`ungetch` 回退）
- **作用域规则**：自动变量 vs 外部变量、声明 vs 定义、`extern` 跨文件
- **`static`**：外部 `static`（文件级隐藏／调链接）、内部 `static`（函数内持久／调生命周期）；练习 4-11 用内部 static 干掉 `ungetch`
- **C 预处理器**：宏定义 / `#undef`、字符串化 `#`、记号粘贴 `##`、条件编译与 include guard、`swap` 宏的 `do{}while(0)`

[lec2.md](./lec2.md)



# Lec 3 C语言的数组 & 字符串 & 结构体

- **数组与指针**：指针概念、连续内存的数组、`sizeof` 运算符、指针算术五条规则
  - *踩坑*：指针大小依架构（4/8 字节）、`a` vs `&a`、数组退化丢长度、`void*` 算术、越界 UB
- **函数指针**：从变量名出发逐层解读声明
- **字符串**：char 数组与 `'\0'`、ASCII、`string.h` 常用函数（strcpy/strcat/strcmp/strtok…）
  - *踩坑*：字符串字面量只读、`strncpy` 不补 `'\0'`、`==` 比的是指针、缓冲区要 +1、`strlen` 是 O(n)
- **结构体**：成员访问、传指针避免拷贝、初始化、NULL
  - *踩坑*：`sizeof` 因对齐 padding 大于成员和、不能用 `==` 比较、赋值是浅拷贝、按值传/返回整体复制

[lec3.md](./lec3.md)



# Lec 4 RISC-V 汇编：寄存器与指令

- **处理器组成与设计原则**：三原则（规整 / 越小越快 / 好折中）、存储程序概念、指令内存 vs 数据内存
- **寄存器及其作用**：load/store 架构为何依赖寄存器、`x0` 硬连线 0、ABI 命名与完整约定表
- **指令类型及其区别**（按功能）：计算（R/I、符号扩展、lui/auipc）、存取（字节寻址与对齐）、控制流（6 条分支、jal/jalr）、伪指令
- **指令格式**（按编码）：R / I / S / B / U / J 六种，及 S/B 型立即数为何被打散
- **寻址模式总结**：立即数 / 寄存器 / 基址偏移 / PC 相对寻址
- **例题**：if-else、while 循环、数组求和
- **扩展阅读**：单周期处理器数据通路

[lec4.md](./lec4.md)



# Lec 5 调用约定、栈与内存布局

- **调用约定与调用过程**：过程六步骤、`jal`/`jalr` 控制转移、参数/返回值寄存器、caller-saved vs callee-saved、完整寄存器约定表
- **栈与活动记录**：寄存器溢出到栈、栈性质与 push/pop、活动记录（栈帧）、叶子 vs 非叶子过程、帧指针、C 的存储类别
- **过程翻译三步法 + 例题**：leaf_example、swap
- **嵌套过程与递归**：fact、尾递归优化、sort（非叶子+嵌套循环+过程调用）、栈追踪真题
- **内存布局**：text / static / heap / stack 四段、超过 8 个参数、堆的动态分配（malloc/free、内存泄漏、悬空指针）

[lec5.md](./lec5.md)



# 实验部分





[lab.md](./lab.md)



# 参考资料

- https://catherinetu.onrender.com/notes.html

- [6.1904 Introduction to Low-level Programming in C and Assembly](https://llp.mit.edu/6190)

- [6.1904 Introduction to Low-level Programming in C and Assembly, spring 2023](https://llp.mit.edu/6190/S23A)
