# Lec 2 C语言和GDB

## 总览

- C语言入门
- GDB
- Bootloader
- 栈的布局



## C语言入门

### 对比Python

- **C 更像是“高级汇编语言”**
  - C 语言的代码结构直接映射到实现它们的机器指令上。
  - 相比之下，Python 目录反映了很多隐藏的底层代码。
- **C 是编译型语言，而不是解释型语言**
  - C 代码可以直接在处理器上执行，无需任何底层运行时环境。
- **C 是静态类型的**
  - 在 C 语言中，类型与变量关联，并用于解释值的原始字节。
  - 在 Python 中，类型是与变量中的值关联的。
  - C 中的类型错误会在编译时被捕捉。
  - 如果不需要检查数据类型，代码的执行速度可以更快。
- **C 使用手动内存管理，而不是垃圾回收**
- **C 中的 int 和 float 有具体但不确定的范围**

### 端序问题

原生浮点类型

![image-20240918161120044](http://47.115.50.83:49153/i/66ea8b39d83a0.png)

>  在内存中中如何表示0x12345678 (= 305419896) ?

Solution: 假如是大端序，0x12, 0x34, 0x56, 0x78；假如是小端序：0x78, 0x56, 0x34, 0x12

RISC-V是小端序

### 内存类型

#### 栈内存

- 函数内分配的局部变量。这部分内存在函数退出后会被销毁，并可能被重新使用
- 默认情况下不会初始化。它会反映该内存区域中之前的内容

#### 堆内存

- 通过显式分配（`malloc`）和释放（`free`）
- 在释放后，内存可能会被重新使用（全部或部分）以用于未来的分配
- 默认情况下不会初始化。它会反映该内存区域中之前的内容

#### 静态内存

- 在任何函数外部声明的变量，以及用“static”声明的变量。
- 只存储一个副本，位于预定义且不变的内存地址
- 默认初始化为零

### 内存安全

- **释放后使用**：如果程序释放了一块内存区域后，仍然继续使用它。
- **重复释放**：如果程序对同一块内存区域释放了两次而不是一次。
- **未初始化的内存**：如果程序使用了从未初始化的内存。
- **缓冲区溢出**：如果程序修改了超出内存区域末尾的内存。
- **内存泄漏**：如果程序分配了内存，但从未释放它。
- **类型混淆**：如果程序无意中使用了错误的数据类型进行操作。

### 指针要点

指针是**整数**，指定一块内存区域的起始地址，并指明预期在该地址找到的值的类型。

```c
int *a; // pointer to int
float *b; // pointer to float
int **c; // pointer to pointer to int
char (*d)(int); // pointer to a function (int -> char)
char (**e)(int); // pointer to pointer to function (int -> char)
void *f; // pointer to untyped memory
void **g; // pointer to pointer to untyped memory
// 指针可以被随意嵌套
int ******value; 
```

#### 数组

- 部分被初始化的数组的其他元素也会被初始化

  - ```c
    int my_array[6] = {1};
    printf(“my_array: [0] = %d, [3] = %d, [5] = %d\n”,my_array[0], my_array[3], my_array[5]);
    // Answers: [0] = 1, [3] = 100, [5] = 0.
    ```

#### 指针运算

- 取数组的第 n 个元素的值， `` array[n]`` 与``(*(array + n))``相同的 

- 取数组第 n 个元素的地址， ``&array[n]``与(array+n)是相同的

- ```c
  int my_array[4];
  printf("Locations: %x %x %x %x\n", &my_array[0], &my_array[1], &my_array[2], &my_array[3]);
  // Prints: Locations: 2FB0 2FB4 2FB8 2FBC
  
  ```

  - &my_array[3] 是 0x2FBC， 比 0x2FB0 大了 12，**这是因为指针运算会乘以基础数据类型的大小！**

  - ```c
    (long) (my_array + 3) == ((long) my_array) + 3 * sizeof(int)
    ```

- 如果int \*p = (int\*)100，那么(int)p + 1和(int)(p + 1)是不同的数字：第一个是101，而第二个是104。当将整数添加到指针时，如第二种情况，整数会隐式乘以指针指向的对象的大小。

##### 指针运算的一个副作用

> ```c
> int values[5] = {10, 20, 30, 40, 50};
> printf("%d/n", 4[values]);
> 
> ```
>
> 会打印什么

Sol: x[y] = *(x+y) = *(y+x) = y[x]， 因此结果是50

#### 类型转换

#### 指针和整数之间

```c
// 将指针强转换为整数
int x[4] = {1, 2, 3, 4};
int *x_ptr = &x[0];
long x_address = (long) x_ptr;

// 将整数强转为指针
int *x2_ptr = (int *)(x_address + 4);
int x2_value = x_ptr[1];

printf("x2_value = %d\n", x2_value)
```

Sol: x2_value = 3

#### 指针大小

- 取决于平台
- 我们使用的RISC-V是64位的指针，使得其与long类型的大小相同



### void类型

- 表示没有数据类型
- 主要用于函数的返回类型和参数
- 你不能定义void类型的变量，因为，这将没有任何意义
- 可以定义``void *``类型的变量，但是不能解引用；不允许对其进行指针操作



### 定义与声明

- 在每个文件中，必须先声明变量或函数才能使用，因为 C 需要知道它的类型或类型签名
  - 你可以声明一个变量或函数多次，只要它的类型或类型签名保持一致
-  在代码库中，必须对每个变量或函数定义一次
  - 定义也算作声明，但只能在定义之后才有效
  - 你可以在一个文件中定义一个函数或变量，并在另一个文件中使用它
- 我们通常把许多声明放在单独的 "头文件" 中，以便程序的各个部分知道其他部分的重要类型



### 声明static函数和变量

- 如果在两个不同的文件中使用相同的函数名，它们会产生冲突！C 语言会难以区分它们。
  - 为了避免冲突，我们可以将变量和函数声明为 `static`

-  虽然函数中的局部变量通常分配在栈上，但我们可以指定它们分配在静态内存中

  ```c
  int add_cumulative_numbers(int increase) {
      static int total_sum = 0;
      total_sum += increase;
      return total_sum;
  }
  ```

  - `total_sum` 在程序启动时将初始化为零，并且在每次调用 `add_cumulative_numbers` 时保持其值！它不会被重新初始化

### 字符串、字符

- 字符串仅仅是字符的数组。
- 字符是一个1字节的整数

total_sum will be initialized to zero at program start, and it will keep its 
value across calls to add_cumulative_numbers! It won’t be reinitialized

### 通用函数

● malloc(n): allocates a region of n bytes from heap memory, and returns a  pointer to the start of it. If there’s no memory left to allocate, returns NULL.

● free(ptr): frees the region of memory starting at ptr that was previously allocated by malloc. If ptr is NULL, does nothing.

● memset(ptr, v, n): sets every byte from ptr[0] to ptr[n-1] to v.

● memmove(dst, src, n): copies src[0]...src[n-1] to dst[0]...dst[n-1]

● memcpy(dst, src, n): alternate faster version of memmove, which may misbehave if dst and src overlap in any way. (Discouraged! Prefer memmove.)

● strlen(str): computes and returns the length of str, based on finding its null terminator. Will misbehave if the null terminator is missing!

● strcmp(a, b): compares two strings a and b, and returns an integer < 0, == 0, or > 0, depending on whether a < b, a == b, or a > b.

● strcpy(dst, src): equivalent to memcpy(dst, src, strlen(src)+1);

### 结构体

```c
struct xy_point {
  double x;
  double y;
};
struct xy_point my_point = { 12.5, -6.2 };
```

你可以通过名称进行初始化结构体

```c
struct xy_point my_point = {
  .y = -6.2,
  .x = 12.5,
};
```

### 联合体

所有字段共享相同的内存地址，也就是说，联合体中的所有字段都占用同一块内存空间。

```c
union my_union {
  float x;
  int y;
}
```

- 在这个例子中，`x` 和 `y` 使用相同的内存区域。因此，如果你在 `x` 中存储一个浮点数，而后从 `y` 中读取，它将返回一个整数解释的内存数据。

- 结构体中每个字段都有自己独立的内存地址，因此你可以同时安全地使用结构体中的所有字段。每个字段依次存储在内存中，不会互相覆盖。

### 比特范围操作

```c
unsigned short a = 0x1313, b = 0x3232;
(a & b) == 0x1212;
(a | b) == 0x3333;
(a ^ b) == 0x2121;
~a == 0xECEC;

unsigned int my_int;
// Set the Nth bit of an integer:
my_int |= 1 << N;
// Clear the Nth bit of an integer
my_int &= ~(1 << N);
// Check if any bits in MASK are set
if (my_int & MASK) { /* ... */ }
// Check if all bits in MASK are set
if ((my_int & MASK) == MASK) { /* ... */ }
// Check if integer is a power of two
if (my_int && !(my_int & (my_int - 1))) { /* ... */ }


```



### 测验

```c
int main() {
  int x[5]; // x is at 0x7fffdfbf7f00
  printf("%p\n", x); // -> 0x7fffdfbf7f00
  printf("%p\n", x+1); // -> 0x7fffdfbf7f04
  printf("%p\n", &x); // -> 0x7fffdfbf7f00
  printf("%p\n", &x+1); // -> **0x7fffdfbf7f14**
  return 0;
}
```

## 内存抽象

![image-20240918200623155](http://47.115.50.83:49153/i/66eac2483bc4a.png)

### 硬件层面

![image-20240918200655503](http://47.115.50.83:49153/i/66eac265274a6.png)

- **总线**在计算机内部的各个组件之间传输数据。

- **缓存**记住之前从总线获取的数据。

- 缓存通过减少总线访问的次数来加速CPU的运行。

- **问题**：什么是I/O设备？

> 总线如何工作？

![image-20240918200757704](http://47.115.50.83:49153/i/66eac2a5daeee.png)

### CPU / OS 层面：地址空间

地址就是按字节索引的数组

![image-20240918200840683](http://47.115.50.83:49153/i/66eac2cf327d5.png)

- **问题**：总线接口过于底层，无法做任何有用的操作！
- **想法**：将总线表示为一个巨大的数据数组。这被称为**地址空间**。
- 每个数组元素是一个字节（8位）。

#### 如何与一个地址空间进行交互？



思想1： 地址空间可以有空洞

![image-20240918201247397](http://47.115.50.83:49153/i/66eac3c326ae0.png)

Ex：``STORE 0xF0``、``LOAD -> 0xF0``

- 通常地址空间比RAM大得多。
  - 可以访问的地址称为“已映射”。
  - 不能访问的空洞称为“未映射”。
- **问题**：如果CPU加载或存储到未映射的区域，会发生什么？



思想2： 地址空间有权限

![image-20240918201321559](http://47.115.50.83:49153/i/66eac3e689551.png)

读（R） -> 可以加载数据

写（W） -> 可以存储数据

执行（X） -> 可以作为代码执行

**问题**：为什么要有权限？

**问题**：如果CPU在没有权限的情况下加载或存储某个地址，会发生什么？



思想3： 结合RAM和设备

![image-20240918201427638](http://47.115.50.83:49153/i/image-20240918201427638.png)

- 这并不像看起来那么明显；例如，x86最初将I/O放在一个与内存分开的地址空间中。

- 程序员可以通过加载和存储来与I/O设备进行交互！

- 将代码和数据视为相同（即内存）也是一个强大的思想，称为冯·诺依曼架构。

典型的映射粒度是一个页面（4KB），而不是一个字节

- 思想4：虚拟内存
  - 允许每个进程拥有自己的地址空间
- 思想5：缓存一致性和一致性
  - 允许多个CPU在一个地址空间中共享内存



### 编译器/库 层面： 栈和堆

- 问题：地址空间仍然过于底层！

- 我们如何决定在数组中的哪个位置存储数据？
  - 这个问题被称为**内存分配**

- 两种基本方法：
  1. **栈**：在函数调用时分配内存，并在函数返回时释放内存
  2. **堆**：管理独立于函数调用的内存分配和释放

![image-20240918201744643](http://47.115.50.83:49153/i/66eac4efc3e07.png)

#### 堆分配器

- 问题：需要跟踪哪些区域在内存数组（堆）中是已分配的，哪些是空闲的
- 事实证明，这直到今天仍然是一个有趣的研究领域
- 存在许多设计上的权衡；最好的解决方案取决于内存分配的模式

#### 栈和堆的选择

- 通常情况下，应该优先使用栈，除非对象在函数返回后需要保持有效，或者对象过大无法在栈中存储。

- 栈的分配和释放更高效，操作也更加简单。栈的内存分配是自动的，函数调用时分配，函数返回时释放，无需手动管理。

- 栈的大小通常比堆小很多，栈的空间有限，因此如果对象过大或需要长期存储，才需要使用堆。

![image-20240918202102337](http://47.115.50.83:49153/i/66eac5b4f12cf.png)

### 内存管理陷阱

- 使用已经释放的内存

- 对同一个对象多次调用释放操作

- 忘记初始化内存（内存不会自动清零）

- 写入数组末尾之外的内存区域（缓冲区溢出）

- 忘记释放对象（内存泄漏）

- 将对象强制转换为错误的类型

- 忘记检查内存分配是否失败

- 使用指向栈上位置的指针（如果这些位置可能被返回）







