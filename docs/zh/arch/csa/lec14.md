# L14：内存一致性模型（*Memory Consistency Models*）

> MIT 6.5900 Fall 2024 · Daniel Sanchez 主题：一致性 vs 一致、顺序一致性（*SC*）、各种重排序如何破坏 SC、松弛内存模型、内存屏障、实现 SC、释放一致性

------

## 一、一致性 vs 一致（回顾）

- **缓存一致性**让私有 Cache 对软件不可见——关注**单个**内存位置的读写；
- **内存一致性模型**精确规定内存相对于**多处理器**读写操作的行为——关注**多个**内存位置的读写。

------

## 二、为什么一致很重要

```
处理器 1                    处理器 2
Store (a), 10;             L: Load r1, (flag);
Store (flag), 1;              if r1 == 0 goto L;
                              Load r2, (a);
```

初始 `a=0, flag=0`。`r2` 最终是多少？

> **取决于处理器 2 观察处理器 1 两次 store 的顺序**：若看到 `Store(flag)` 在 `Store(a)` 之后，则 `r2=10`；否则 `r2` 可能是 0 或 10。

------

## 三、顺序一致性（*Sequential Consistency, SC*）

> Lamport 的定义：若任何执行的结果都等同于"所有处理器的操作以某个**串行顺序**执行、且每个处理器的操作按其**程序顺序**出现"，则系统是顺序一致的。

即：**SC = 各顺序程序内存引用的、保序的任意交织**。

SC 的要求：**按序指令执行 + 原子的 load/store**。

> SC 易于理解，但体系结构与编译器作者为性能想**违反**它。许多对单处理器正确的优化会破坏 SC，从而产生新的多处理器内存模型。

------

## 四、一致性模型谱系

| 模型           | 允许的重排序            | 例子                                     |
| -------------- | ----------------------- | ---------------------------------------- |
| **顺序一致性** | 全部按序                | —                                        |
| **松弛一致性** | Load 在 Load 之后重排   | PA-RISC, Power, Alpha                    |
|                | Load 在 Store 之后重排  | PA-RISC, Power, Alpha                    |
|                | Store 在 Store 之后重排 | PA-RISC, Power, Alpha, PSO               |
|                | Store 在 Load 之后重排  | PA-RISC, Power, Alpha, PSO, **TSO, x86** |
|                | 更奇异的特性            | Alpha                                    |

------

## 五、各种优化如何破坏 SC

下面每例在 SC 下答案都是"否"，但相应优化使其变为"可能"。

### 已提交存储缓冲（*Committed Store Buffer*）

CPU 可在早先已提交的 store 还在内存系统中传播时**继续执行**（提交其他指令，含 load/store）；本地 load 可从缓冲的同地址 store **旁路**取值。

### 例 1：存储缓冲（Store Buffers）

```
进程 1                进程 2
Store (flag1), 1;     Store (flag2), 1;
Load r1, (flag2);     Load r2, (flag1);
```

> 若 load 可越过仍在存储缓冲中的 store：**可能 r1=0 且 r2=0**（SC 下不可能）。这正是 **TSO**（Total Store Order，Sun SPARC、IBM 370）。

### 例 2：Store-Load 旁路

加额外 load 在 SPARC TSO 下**无影响**，仍非 SC；IBM 370 中 load 在值对其他处理器可见前不能返回该值（隐式加屏障，看似 SC）。

### 例 3：非 FIFO 存储缓冲

```
进程 1            进程 2
Store (a), 1;     Load r1, (flag);
Store (flag), 1;  Load r2, (a);
```

> 非 FIFO 存储缓冲下 **可能 r1=1 但 r2=0**（SPARC **PSO** 模型）。

### 例 4：非阻塞 Cache

> 即使 store 有序，load 可被重排 → **可能 r1=1 但 r2=0**（Alpha、SPARC RMO、PowerPC WO）。

### 例 5：寄存器重命名

```
进程 1（初始 r1=r2=1）   进程 2
Store (flag1), r1;       Store (flag2), r2;
Load r1, (flag2);        Load r2, (flag1);
```

> 寄存器重命名**消除反依赖**（anti-dependency）→ **可能 r1=0 且 r2=0**。

### 例 6：推测执行

> 推测 load 即使 store 有序也能使 **r1=1 但 r2=0**。

### 例 7：地址推测

> 地址推测**消除 store 与 load 间的依赖** → 可能出现 SC 下不可能的结果。

### 例 8：存储原子性（*Store Atomicity*）

```
进程1        进程2        进程3            进程4
Store(a),1;  Store(a),2;  Load r1,(a);     Load r3,(a);
                          Load r2,(a);     Load r4,(a);
```

> 即使各处理器的 load 有序，若 **store 非原子**，不同处理器可观察到**不同的 store 顺序** → 可能 r1=1,r2=2 同时 r3=2,r4=1（SC 下不可能）。

### 例 9：因果性（*Causality*）

```
进程1            进程2              进程3
Store(flag1),1;  Load r1,(flag1);   Load r2,(flag2);
                 Store(flag2),1;    Load r3,(flag1);
```

> 有 load/load 重排时（Alpha）：**可能 r1=1, r2=1 但 r3=0**（违反因果性）。

------

## 六、松弛内存模型与内存屏障（*Memory Fence*）

弱内存模型架构提供**内存屏障**指令以阻止本可发生的 load/store 重排。

- 屏障类型：`Fence_rr`、`Fence_rw`、`Fence_wr`、`Fence_ww`；
- 例：`Store(a1), r2; Load r1, (a2);` 当 $a1 \neq a2$ 时可被重排，插入 `Fence_wr` 可禁止此重排；
- 各家命名：SPARC 用 `MEMBAR`（MEMBARRR/RW/WR/WW）；PowerPC 用 `Sync` / `EIEIO`。

### 用屏障强制顺序

把开头的例子改造为：

```
处理器 1                处理器 2
Store (a), 10;          L: Load r1, (flag);
Fence_ww;                  if r1 == 0 goto L;
Store (flag), 1;           Fence_rr;
                           Load r2, (a);
```

> `Fence_ww` 保证 `Store(a)` 在 `Store(flag)` 前全局可见，`Fence_rr` 保证 `Load(flag)` 在 `Load(a)` 前完成，从而恢复期望语义。

> 弱内存模型**难理解、难记、不稳定**（"年度款"），有观点主张**放弃弱模型、转而实现 SC**。

------

## 七、实现 SC

SC 的两个条件：

1. **每个处理器的内存操作按其向内存发出请求的顺序对所有处理器出现**——由缓存一致性提供（保证所有处理器观察到对某地址相同的 load/store 顺序）；
2. **任何执行等同于所有处理器操作的某个串行顺序**——通过在**每个内存操作与下一个之间强制依赖**来提供。

### SC 的数据依赖处理

- **停顿**：用按序执行 + 阻塞 Cache；缓存一致性 + 每处理器**一次只允许一个在途请求** → 提供 SC（但慢）；
- **改架构 → 松弛模型**：用乱序 + 非阻塞 Cache，允许对**不同地址**的多个并发请求（高性能），需要时加屏障强制顺序；
- **推测**。

### 顺序一致性推测（*SC Speculation*）

- 本地 load-store 顺序用标准乱序机制；
- **全局非推测的 store**：store 在 **commit 时执行** → store 按序；
- **全局推测的 load**：在 issue 时**猜测** load 用的内存位置在 issue 与 commit 之间不变（等价于 load 在 commit 时按序发生）；
- 在 commit 时**检查**：记住从 issue 起所有 load 地址，监视对这些位置的写；
- 回滚的数据管理复用单处理器乱序推测所用的机制。

------

## 八、正确同步的程序与释放一致性

### 正确同步的程序（*Properly Synchronized Programs*）

- 极少程序员依赖 SC 编程，多用更高层同步原语（锁、信号量、监视器、原子事务）；
- "正确同步的程序"指每个可写共享变量都被保护（如加锁），更新无竞争（**获锁本身仍有竞争**；且无法检查程序是否正确同步）；
- 对正确同步的程序，**只要在离开加锁区前提交更新值，指令重排无关紧要**。

### 释放一致性（*Release Consistency*）[Gharachorloo 1990]

只在**线程同步点**关心处理器间内存顺序，中间不关心；把所有同步指令当作**唯一的排序点**。

```
Acquire(lock)   // 之后所有 load 取到最新写入值
... 读写共享数据 ...
Release(lock)   // 之前所有写在释放锁之前全局可见
```

------

## 九、要点（Takeaways）

- SC 作为编程模型太底层；高层编程应基于**临界区与锁、原子事务、监视器**等；
- 高层并行编程应**对内存模型问题无感**（程序员不应受内存模型变化影响）；
- 对 Load/Store/内存屏障/同步指令的 ISA 定义应：**精确**、给硬件实现**最大灵活性**、允许高效实现高层并行构造。

------

## 小结

- 一致管多地址读写的**可见时序**；**SC** 是最直观的模型（按序 + 原子 load/store），但几乎所有性能优化（存储缓冲、非阻塞 Cache、寄存器重命名、推测、非原子 store……）都会破坏它；
- 松弛模型（TSO/PSO/RMO/WO 等）允许不同重排，用**内存屏障**在需要处恢复顺序；
- 实现 SC 可用停顿、或乱序 + 推测（store 在 commit 执行、load 推测后在 commit 校验）；
- 实践中程序员应依赖锁/事务等高层原语与**释放一致性**，而非直接面对内存模型。

> 下一讲：片上网络（On-Chip Networks）