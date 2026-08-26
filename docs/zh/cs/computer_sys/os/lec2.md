---
title: 用 C 语言编程 Xv6
type: lecture
lecture: 2
tags: []
status: complete
---
# Lec 2 用 C 语言编程 Xv6

## 本讲导览

- C 语言：一门”高级汇编“
- 数据表示
- 内存安全问题
- 指针： 带类型的整数
- 声明、定义 与 `static`
- 字符串、常用库函数、结构体和位操作
- GDB： 调试内核的手法
- 内存抽象的层次：从总线到堆栈
- 自测清单

本讲定位：用 C 语言编程 Xv6、用 GDB + QEMU 调试。本讲打牢两个工具基础——把 C 当作"高级汇编"来理解内存与指针，并掌握调试内核所需的 GDB 手法；最后从硬件总线一路抽象到栈与堆，建立"内存到底是什么"的层次图景。

## 0. 本讲脉络

```text
C 作为"高级汇编" ──► 数据表示(端序/范围) ──► 内存三区(栈/堆/静态) ──► 指针(带类型的整数)
        │
        ▼
   GDB 调试内核（断点/单步/查寄存器查内存/TUI）
        │
        ▼
   内存抽象的层次：硬件总线 → 地址空间 → 栈与堆
```

## 1. C 语言：一门"高级汇编"

::: definition C 相对 Python 的关键差异
- **更接近机器**：C 代码几乎直接映射到机器指令；Python 隐藏了大量底层逻辑。

- **编译型而非解释型**：C 直接在 CPU 上执行，无需运行时环境。

- **静态类型**：类型与**变量**绑定（Python 中类型与**值**绑定），用于解释内存里那串原始字节；类型错误在**编译期**暴露，省去运行时检查 → 更快。

- **手动内存管理**：`malloc`/`free`，无垃圾回收。

- `int`/`float` 范围"具体但不确定"——依平台而定。
:::

## 2. 数据表示

### 2.1 端序 (*endianness*)

::: example 例题 1
（`0x12345678`（= 305419896）在内存里怎么放？）
:::

按地址从低到高：

大端序 (*big-endian*)：0x12, 0x34, 0x56, 0x78（高位字节在低地址）。

小端序 (*little-endian*)：0x78, 0x56, 0x34, 0x12（低位字节在低地址）。

RISC-V 是小端序。

### 2.2 三类内存区域

::: definition 定义（栈 / 堆 / 静态内存）
<table>
<tr><th>区域</th><th>分配方式</th><th>默认初始化</th></tr>
<tr><td><strong>栈 (*stack*)</strong></td><td>函数内局部变量；函数退出即销毁、内存可复用</td><td>❌ 不初始化（残留旧内容）</td></tr>
<tr><td><strong>堆 (*heap*)</strong></td><td>显式 <code>malloc</code> / <code>free</code>；释放后可被复用</td><td>❌ 不初始化</td></tr>
<tr><td><strong>静态 (*static*)</strong></td><td>函数外变量 + <code>static</code> 变量；固定地址、单一副本</td><td>✅ 默认清零</td></tr>
</table>
:::

## 3. 内存安全问题

C 把内存管理交给程序员，于是有一类典型 bug：

- **释放后使用 (*use-after-free*)**：释放后仍访问该内存。
- **重复释放 (*double-free*)**：对同一块释放两次。
- **使用未初始化内存**：读到的是残留垃圾值。
- **缓冲区溢出 (*buffer overflow*)**：写越过数组末尾（Lec 22 砸栈攻击的根源）。
- **内存泄漏 (*memory leak*)**：分配后从不释放。
- **类型混淆 (*type confusion*)**：用错误的类型解释同一段字节。

::: insight 工程联想
这正是 Rust 的所有权/借用、Go 的 GC + 边界检查想消灭的问题域。理解了这 6 类 bug，就能理解"内存安全语言"到底安全在哪、以什么为代价（编译期约束或运行时开销）。
:::

## 4. 指针：带类型的整数

::: definition 定义（指针 *pointer*）
指针本质是一个**整数**，存放某块内存的**起始地址**，同时其**类型**指明在该地址应当如何解释所存的值。
:::

声明语法（从右向左读）：

```c
int *a;          // 指向 int 的指针
float *b;        // 指向 float 的指针
int **c;         // 指向"int 指针"的指针
char (*d)(int);  // 指向函数 (int -> char) 的指针
char (**e)(int); // 指向"函数指针"的指针
void *f;         // 指向无类型内存的指针
int ******value; // 指针可任意嵌套
```

### 4.1 数组与部分初始化

::: example 例题 2（部分初始化的数组，其余元素是什么？）
```text
int my_array[6] = {1};
// my_array[0] = 1，其余元素全部被零初始化
// [0] = 1, [3] = 0, [5] = 0
```

规则：只要给了初始化列表，**未显式赋值的元素一律补 0**。

*（订正：原笔记此处写 `[3] = 100` 有误，正确为 `0`。）*
:::

### 4.2 指针运算会按类型大小缩放

- `array[n]` 等价于 `*(array + n)`；`&array[n]` 等价于 `array + n`。
- **关键：把整数加到指针上时，整数会隐式乘以所指类型的大小。**

::: example 例题（指针运算的缩放）
```text
int my_array[4];   // 设 &my_array[0] = 0x2FB0
// &my_array[3] == 0x2FBC，比起点大 12 = 3 × sizeof(int)
(long)(my_array + 3) == (long)my_array + 3 * sizeof(int);
```

对比纯整数：设 `int *p = (int*)100;`

`(int)p + 1` = **101**（先转整数再加 1）；

`(int)(p + 1)` = **104**（指针先加 1，缩放 ×4，再转整数）。
:::

::: example 例题（下标运算的对称性）
```text
int values[5] = {10, 20, 30, 40, 50};
printf("%d\n", 4[values]);  // 打印 50
```

因为 `x[y] == *(x+y) == *(y+x) == y[x]`，所以 `4[values] == values[4] == 50`。
:::

### 4.3 指针 ↔ 整数的强制转换

::: example 例题（整数与指针互转 + 缩放，订正版）
```text
int x[4] = {1, 2, 3, 4};
int *x_ptr   = &x[0];
long x_addr  = (long)x_ptr;          // 指针 → 整数
int *x2_ptr  = (int *)(x_addr + 4);  // 整数(+4 字节) → 指针，指向 &x[1]
int x2_value = x2_ptr[1];            // x2_ptr[1] = x[2] = 3
// x2_value == 3
```

要点：`x_addr + 4` 是**按字节**加 4（普通整数运算），落到 `&x[1]`；而 `x2_ptr[1]` 是**按 int 缩放**再取，落到 `x[2]`。

*（订正：原笔记最后一行写成 `x_ptr[1]` 但答案给 3，前后不一致；自洽写法应为 `x2_ptr[1]`。）*
:::

### 4.4 `void` 与指针大小

- `void` 表示"没有数据类型"，主要用于函数返回值/参数；不能定义 `void` 变量。
- 可以定义 `void *`，但<strong>不能解引用、不能做指针算术</strong>（不知道步长）。
- 指针大小依平台而定；本课的 **RISC-V 是 64 位指针，与 `long` 同宽**。

::: example 例题（数组名 vs 取数组地址）
```text
int x[5];                  // 设 x 位于 0x...7f00
printf("%p\n", x);    // 0x...7f00  —— 数组退化为首元素指针
printf("%p\n", x+1);  // 0x...7f04  —— +1 个 int = +4 字节
printf("%p\n", &x);   // 0x...7f00  —— 地址值相同，但类型是 int(*)[5]
printf("%p\n", &x+1); // 0x...7f14  —— +1 个"整个数组" = +20 字节(0x14)
```

关键区别：`x+1` 跨一个 `int`，`&x+1` 跨**整个数组**（5×4=20 字节）。
:::

## 5. 声明、定义与 `static`

::: definition 定义（声明 *declaration* vs 定义 *definition*）
- **声明**：告诉编译器某名字的类型/签名。可多次声明，只要类型一致。使用前必须先声明。

- **定义**：实际分配存储/给出函数体。整个代码库中每个名字只能定义一次（定义也算一次声明）。

- 常把声明集中放进**头文件 (*header*)**，让各部分知道彼此的类型。
:::

`static` 的两种用途：

1. **限定作用域**：把函数/变量声明为 `static`，使其仅在本文件可见，避免跨文件重名冲突。
2. **静态生命周期的局部变量**：函数内的 `static` 变量分配在静态内存，程序启动时清零一次，<strong>跨调用保持值</strong>，不会被重新初始化。

```c
int add_cumulative_numbers(int increase) {
    static int total_sum = 0;   // 启动时初始化为 0，之后跨调用累加
    total_sum += increase;
    return total_sum;
}
```

## 6. 字符串、常用库函数、结构体/联合体/位操作

- **字符串就是字符数组**，字符是 1 字节整数，以 `\0`（null 终止符）结尾。

::: definition 定义（常用内存/字符串函数）
- `malloc(n)` / `free(ptr)`：堆分配/释放；分配失败返回 `NULL`，`free(NULL)` 为空操作。

- `memset(ptr,v,n)`：把 `ptr[0..n-1]` 全设为 `v`。

- `memmove(dst,src,n)`：安全拷贝（允许重叠）。

- `memcpy(dst,src,n)`：更快但**重叠时行为未定义** → 优先用 `memmove`。

- `strlen(s)`：靠 `\0` 计算长度；缺终止符会越界。

- `strcmp(a,b)`：返回 <0 / 0 / >0。

- `strcpy(dst,src)` ≈ `memcpy(dst,src,strlen(src)+1)`（含终止符；不限长 → 砸栈隐患，见 Lec 22）。
:::

**结构体 vs 联合体**：结构体每个字段有独立内存、可同时安全使用；<strong>联合体 (*union*)</strong> 所有字段共享同一块内存——往 `x`（float）写、再从 `y`（int）读，会得到对同一段字节的整数解释（类型双关）。

**位操作**（`unsigned short a=0x1313, b=0x3232`）：`a&b==0x1212`、`a|b==0x3333`、`a^b==0x2121`、`~a==0xECEC`。常用惯用法：

```c
my_int |=  1 << N;            // 置第 N 位
my_int &= ~(1 << N);          // 清第 N 位
if (my_int & MASK)            // MASK 中有任一位被置
if ((my_int & MASK) == MASK)  // MASK 中所有位都被置
if (my_int && !(my_int & (my_int - 1)))  // 判断是否 2 的幂
```

## 7. GDB：调试内核的手法

xv6 在 QEMU 里跑，调试靠 GDB 远程连接。后续 Lec 3 / Lec 6 大量用到，这里先备一份速查。

::: definition 定义（GDB 常用命令速查）
<table>
<tr><th>命令</th><th>作用</th></tr>
<tr><td><code>b *0x80000000</code> / <code>b main</code></td><td>在地址或符号处下断点</td></tr>
<tr><td><code>c</code> / <code>stepi</code> / <code>n</code></td><td>继续运行 / 单步一条指令 / 单步一行 C</td></tr>
<tr><td><code>delete 1</code></td><td>删除 1 号断点</td></tr>
<tr><td><code>info reg</code></td><td>查看所有寄存器（如 a0–a7 传参、a7 系统调用号）</td></tr>
<tr><td><code>p $pc</code> / <code>p/x $satp</code></td><td>打印寄存器；<code>/x</code> 以十六进制、<code>/a</code> 以地址形式</td></tr>
<tr><td><code>x/2c $a1</code></td><td>检查内存：<code>/2</code> 两项，<code>c</code> 字符（<code>i</code> 指令 / <code>x</code> 十六进制 / <code>a</code> 地址）</td></tr>
<tr><td><code>p/3i 0xe14</code></td><td>反汇编从 0xe14 起的 3 条指令</td></tr>
</table>
:::

::: theorem TUI（Text User Interface）模式
`tui enable` 分屏同时显示源码/汇编/寄存器/命令行。布局：`layout src` / `asm` / `split` / `regs`；快捷键 `Ctrl-x 1`（仅代码窗）、`Ctrl-L`（刷新）、`Ctrl-x s`（切布局）。

另一个常用技巧：QEMU 监视器里 `Ctrl-a c` 进入，`info mem` 查看当前页表映射（调试 VM/trap 时极有用，Lec 5/6 会用）。
:::
**TUI 视图常见操作**

- `layout src`（显示源代码窗口）
- `layout asm`（显示反汇编窗口）
- `layout split`（分屏显示源代码和汇编）
- `layout regs`（显示寄存器窗口）

**TUI 视图常见快捷键：**

- `Ctrl-x 1`（仅显示代码窗口）

- `Ctrl + L`：刷新屏幕。
- `Ctrl + P / Ctrl + N`：在历史命令中导航。
- `Ctrl + x s`：切换布局（源码视图、汇编视图等）。

**Bootloader（先埋个伏笔）**：上电后内核被加载到 RAM 起始地址 `0x80000000`，第一条指令跳到 `entry.S` 的 `_entry`，设置栈后进入 `start()` → `main()`。完整启动流程在 Lec 3 展开。

## 8. 内存抽象的层次：从总线到栈堆

这是本讲承上启下的关键——同一个"内存"，在不同层次有完全不同的样貌。

![image-20240918200623155](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac2483bc4a.png)

### 8.1 硬件层：总线、缓存、I/O

![image-20240918200655503](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac265274a6.png)

![image-20240918200757704](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac2a5daeee.png)

- **总线 (*bus*)** 在 CPU、内存、I/O 设备之间传输数据。
- **缓存 (*cache*)** 记住最近从总线取得的数据，通过减少总线访问来加速 CPU。

### 8.2 CPU / OS 层：地址空间

![image-20240918200840683](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac2cf327d5.png)

::: definition 定义（地址空间 *address space*）
把底层总线抽象成一个**按字节索引的巨大数组**，每个元素 1 字节（8 位）。软件用 `LOAD`/`STORE` 在这个数组上读写。
:::

四个递进的想法：

1. **地址空间可以有空洞**：能访问的地址称"已映射 (*mapped*)"，访问不到的"未映射 (*unmapped*)"；地址空间通常远大于物理 RAM。
2. **地址带权限**：读（R，可 load）/ 写（W，可 store）/ 执行（X，可作为代码）。无权限访问会触发异常——这是隔离与安全的基石。
3. **统一 RAM 与设备**：把 I/O 设备寄存器也放进地址空间（内存映射 I/O），用 load/store 即可操作设备。"代码和数据同为内存"即<strong>冯·诺依曼架构 (*von Neumann*)</strong>。（注：x86 早期把 I/O 放在独立地址空间。）映射粒度通常是一个<strong>页 (*page*, 4KB)</strong> 而非一字节。
4. **虚拟内存 + 缓存一致性**：让每个进程拥有独立地址空间；让多 CPU 共享同一地址空间（Lec 5 展开）。

![image-20240918201321559](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac3e689551.png)

![image-20240918201427638](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20240918201427638.png)

### 8.3 编译器 / 库层：栈与堆

地址空间仍太底层——"数据放数组哪个位置"这个<strong>内存分配 (*memory allocation*)</strong> 问题，有两种基本答案：

::: definition 定义（栈 vs 堆）
- **栈**：随函数调用/返回自动分配/释放，高效、简单。

- **堆**：分配与释放独立于函数调用，由**堆分配器 (*heap allocator*)** 跟踪哪些区域已用/空闲——这至今仍是活跃研究领域，存在大量权衡，最优方案取决于分配模式。
:::

::: theorem 推论（栈与堆的选择原则）
默认优先用**栈**；仅当对象需要在函数返回后存活、或对象过大放不下栈时，才用堆。栈的分配/释放自动且高效，但空间有限。

对应的内存管理陷阱（务必牢记）：用已释放内存、重复释放、忘记初始化、写越界、忘记释放（泄漏）、错误类型转换、忘记检查分配是否失败、返回指向栈上局部变量的指针。
:::

![image-20240918202102337](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66eac5b4f12cf.png)

## 9. 自测清单

- [ ] C 相对 Python 的 5 点差异？"静态类型"中类型绑定到变量还是值？
- [ ] `0x12345678` 在小端/大端下的字节序列？RISC-V 是哪种？
- [ ] 栈/堆/静态三区的分配方式与默认初始化各是什么？
- [ ] 6 类内存安全 bug 分别是什么？
- [ ] 为什么 `(int)p+1` 与 `(int)(p+1)` 结果不同？`x+1` 与 `&x+1` 差多少字节？
- [ ] `static` 局部变量的生命周期与初始化行为？
- [ ] `memcpy` 与 `memmove` 的区别？为何优先 `memmove`？
- [ ] 地址空间的 4 个递进想法（空洞/权限/统一 I/O/虚拟内存）。
- [ ] 何时该用堆而非栈？列出至少 5 个内存管理陷阱。
