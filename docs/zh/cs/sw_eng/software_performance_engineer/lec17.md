---
title: 内存模型和无锁同步
type: lecture
lecture: 17
tags: []
status: stub
---
# Lec 17 内存模型和无锁同步

阅读资料

- Leiserson, Charles. “[A Simple Deterministic Algorithm for Guaranteeing the Forward Progress of Transactions](https://dspace.mit.edu/handle/1721.1/114871).” *Information Systems* 57 (2016): 69–74.

## 本讲导览

- 顺序一致性

- 互斥的无锁实现

- 宽松内存一致性
  - 指令重排序

  - 硬件重排序

  - 重排序的影响

- 内存屏障

- CAS

- 无锁算法（LOCK-FREE ALGORITHMS）

- ABA 问题

## 内存模型

### 顺序一致性

示例， 一开始 a = b = 0;

```asm
; 处理器0
mov 1, a   ; Store
mov b, %ebx ; Load

```

```asm
; 处理器1
mov 1, b  ; Store
mov a, %eax ; Load
```

> 有没有一种可能，就是在这些处理器都执行完他们的代码后，处理器 0 的%ebx 和处理器 1 的%eax 都包含 0 值，

这取决于**内存模型**，即在并行计算机系统上内存操作行为是怎么样的。

> [!NOTE]
>
> 顺序一致性是是一致性的**最标准**的的一种
>
> 任何执行的结果 都与所有处理器的操作按某个顺序执行的结果相同，并且每个处理器的操作按其程序指定的顺序出现在这个序列中    by  Leslie Lamport [1979]

进一步的解释：

- 一个处理器程序定义的指令序列与其他处理器程序定义的相应序列**交错**，以生成所有指令的全局**线性顺序**。
- 根据该**线性顺序**，LOAD 指令接收的值，来源于由最近的、且在 LOAD 指令之前的 STORE 指令存储到某个地址的
- 硬件可以执行任何操作，但为了使执行保持顺序一致性，LOAD 和 STORE 应该遵循某种全局线性顺序。

回到刚刚的例子，我们把四个语句标号，他们的交错结果，以及最终产生的值的比较如图

![image-20240912062321533](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6852e2f5be18f.png)

顺序一致性揭示了没有一种执行结果是 %eax = %ebx = 0

> [!IMPORTANT]
>
> 现实中，没有一个计算机系统会实现成顺序一致性的。它太简单粗暴了，严重限制性能

**形式化顺序一致性**

- 指令的执行会带来了一种“**发生在之前**”（happens before) 的关系，我们可以用``->``表示

- ``->``的关系是是**线性**的，意味着对于两个不同的指令x, y要么是``x->y``要么是``y->x``
- ``->``的关系遵循**处理器顺序**，即每个处理器中指令的顺序
- 内存中的某个位置的 LOAD 操作读取的值， 来自``->``关系**最近** STORE 操作写入的值

- 要使执行后的内存达到顺序一致性，必须存在这样的``->``的线性顺序，使得内存状态成立

## 互斥的无锁实现

并发理论早期最著名成果之一，无需锁也能实现互斥。

**回顾**

临界区是访问共享数据结构的代码片段，这些数据结构不允许同时被两个或多个线程访问（互斥访问）。 互斥锁大部分实现会利用原子操作指令，确保对锁的获取（加锁）和释放（解锁）是原子的、不可分割的操作。例如

- **xchg**：交换操作，可以原子地交换寄存器和内存中的值
- **test-and-set**：测试并设置操作，用于原子地设置锁的状态
- **compare-and-swap**：比较并交换操作，原子地比较内存中的值与预期值，如果相等则交换
- **Load-link/store-conditional**：加载链接-存储条件操作，用于实现乐观锁（optimistic locking)

虽然锁能解决临界区的问题，但是引入了一些问题——死锁，护航效应（convoying）

> 互斥可以仅仅通过使用 LOAD 和 STORE 这些内存操作来实现？

Theodorus J. Dekker 和 Edsgar Dijkstra 展示了这是可以做到的，只要计算机系统是顺序一致的。

但是这里不讲解，因为它足够复杂。我们该用比较简单且优雅的方法表达他们的想法。用 Peterson'算法。

Alice 想玩弄这个称为 x 小物件，而 Bob 想将它放好，但是小物件并不能同时满足，所以他们是互斥。他们将重复不断执行各自的代码。

直觉上看，

- 如果 Alice 和 Bob 都试图进入临界区域，那么最后写入的那个会自旋，而另一个会继续执行
- 如果只有 Alice 试图进入临界区域，那么她会继续执行，因为 B_wants 为 false
- 如果只有 Bob 试图进入临界区域，那么他会继续执行，因为 B_wants 为 false

> [!IMPORTANT]
>
> Perterson's 算法实现了临界区的互斥

证明方法：

- 假设为了反证，Alice 和 Bob 都同时进入了临界区域。
- 考虑他们进入临界区域之前各自的最新时间点（the most-recent time）
- 我们将推导出一个矛盾。

![截屏 2024-06-27 04.35.17](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667c7b949cb9f.png)

- 不失一般性， 假设 Bob 是最后写入 turn 的： write_A(turn = B) -> write_B(turn = A)
- Alice 的程序顺序是：write_A(A_wants = true) -> write_A(turn = B)
- Bob 的程序顺序是：write_B(turn = A) -> read_B(A_wants) -> read_B(turn)
- Bob 实际读到了什么？
  - A_wants: A; turn: A =>  Bob 应该自旋。

与前提矛盾，证毕。

> [!IMPORTANT]
>
> Peterson's 算法保证了饥饿自由: 当 Alice 想要执行临界区，Bob 不能重复在临界区执行两次，反之亦然。

> 顺序一致性的唯一问题是什么？

到目前为为止， 没有机器支持顺序一致性。

----

## 宽松的内存一致性模型

> [!IMPORTANT]
>
> Never synchronize through memory. 千万不要用内存来同步
>
> （因为很难做到正确）

当代内存模型现状

- 当代的处理器没有实现顺序一致性。
- 所有处理器都实现了某种形式的宽松一致性。
- 硬件会主动重新排序指令。
- 编译器也可能重新排序指令。

---

### 指令（编译器）重排序

![image-20241001065418732](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb2c1d80664.png)

> 为什么硬件和编译器决定重排序这些指令？为什么硬件更喜欢先做 load 操作？

Solution：为了通过**掩饰**加载延迟（load latency）来获得更高的性能——提高**指令级并行性**。（这种优化可以使处理器在等待某些指令的执行结果时，不必闲置，而是继续执行其他不依赖于这些结果的指令）

> 对于硬件或者编译器而言，什么  情况下进行的指令重排序可视为安全的

1. 当 a  != b
   - 指令之间不存在数据依赖
2. 并且没有并发访问
   - 线程之间不会有数据竞争

### 硬件重排序

在内存总线上，处理器可以非常快速地发出（issue）存储指令，速度超过总线（网络），因此使用了存储缓冲区（store buffer）来解决存储指令和网络速度不匹配的问题，以防止出现停顿（stall）

![截屏 2024-06-27 12.22.37](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667ce91c8ca65.png)

由于加载（LOAD）指令可能会使处理器停顿（stall）直到加载完成（每当你执行 LOAD 指令时，如果这个数据不在处理器的缓存中，处理器将不得不等待内存子系统返回数据） ，因此 LOAD 指令优先于 STORE 指令，通过 LOAD 旁路技术在实现。

![截屏 2024-06-27 12.31.47](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667ceb3b9a8a8.png)

>  如果 LOAD 的地址刚好是在 STORE 缓冲区的怎么办？

SOLUTION： 从存储缓冲区找到该地址的结果并返回。

![截屏 2024-06-27 12.38.09](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667cecc0995be.png)

因此，总的来说**加载指令**可以**Bypass**不同地址的存储指令.

#### x86-64 完全存储定序

完全存储定序（TSO， Total Store Order） ，硬件实现的

![截屏 2024-06-27 13.06.36](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667cf365b5b40.png)

> [!NOTE]
>
> 【定理】House rule
>
> 1.  LOAD 指令不会与其他 LOAD 指令重排序
>
> 2. STORE 指令不会与其他 STORE 指令重排序
>
> 3. STORE 指令不会与前面的 LOAD 指令重排序
> 4. LOAD 指令可以与之前的 STORE 指令重排序，但有一种情况一定不能重排序，就是当与两者的存储位置（location）相同时。 前面例子中 A != B
>
> 5. LOAD 和 STORE 指令都不会与 LOCK 指令重排序。
>
> 6. 对相同存储位置的 STORE 指令遵循全局总顺序（global total order）。
>
> 7. LOCK 指令遵循全局总顺序。
>
> 8. 内存排序保留传递可见性（因果性）。

 TSO 一致性比顺序一致性要更弱一些

### 重排序的影响

回到最开始的例子 ![截屏 2024-06-27 13.47.16](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667cfcf1c69f2.png)

,如果按照<2, 4, 1, 3>的顺序，将产生 %eax = %ebx = 0，我们说**指令重排序违背了顺序一致性**， 这不仅会发生在硬件重排序，还有可能发生在编译重排序上。这就要求我们

> [!IMPORTANT]
>
> Nerver write non-determisitic code
>
> 永远不要写不确定的代码

#### 重排序对 Perterson‘s 算法的影响

![截屏 2024-06-27 13.55.29](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667cfee969052.png)

B_wants 和 A_wants 的 LOAD 指令可能重排序到 A_wants 和 B_wants 的 Store 指令前面，最终可能导致 Alice 和 Bob 同时进入临界区！

## 内存屏障

- 内存栅栏（或内存屏障， Memory fence/Memory barrier）是一种**硬件操作**，它强制要求在它前后的指令按一定的**顺序**执行

- 内存栅栏，可以通过特定的指令来显式地发出 Issue（例如 x86 架构中的 mfence 指令），用于确保栅栏之前和之后的内存操作的顺序关系。或者隐式地由某些同步指令（如 locking、cas 等）执行内存栅栏操作。

- Tapir/LLVM 编译器通过在 C 语言头文件 stdatomic.h 中定义的 atomic_thread_fence()函数实现内存栅栏

- 内存栅栏的典型成本与 L2 缓存访问的成本相当。

我们要知道，系统都是人类做的，人们通过 benchmark 代码跑出的结果来判断并行计算的性能，那我也可以将锁的性能做的比内存屏障还要好。

### 恢复示例的一致性

![截屏 2024-06-27 14.14.23](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667d034adb1c8.png)

这样一来，内存屏障前后的指令能保持相对的顺序一致性了。

但是！！！ **你还需要确保编译器不会把你搞砸**。

### 过去的解决方案

![截屏 2024-06-27 14.40.39](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667d097d231a2.png)

**过去**在使用内存屏障（memory fence）时的额外注意事项

1. 在过去，为了防止编译器优化掉内存引用，必须将变量声明为 `volatile`。`volatile` 关键字告诉编译器，该变量的值可能随时会被外部因素改变，因此每次引用都必须从内存中读取，而不是依赖于寄存器中的缓存值。
2. 你需要在``frob()``和``borf()``放置编译器屏障来阻止被编译器重排序

### 用 C11 恢复一致性

C11 语言标准定义了自己的弱内存模型，通过以下方式可以控制**硬件和编译器**对内存操作的重新排序：

1. **声明变量为_Atomic**：在 C11 标准中，可以通过声明变量为 `_Atomic` 类型来指示编译器该变量是原子类型，需要进行原子操作。原子类型的变量可以保证在多线程或并发环境中，其操作是原子的，即不会被中断或重排序。
2. **使用原子函数**：C11 标准提供了一系列的原子操作函数，例如 `atomic_load()`、`atomic_store()` 等。这些函数能够确保对原子类型变量的读取和写入是原子性的，不会被硬件或编译器进行重新排序或优化。

![截屏 2024-06-27 14.44.01](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667d0a3e2cbce.png)

---

### 实现通用的锁

> [!IMPORTANT]
>
> Thm1 [Burns-Lynch]
>
> 任何仅使用 LOAD 和 STORE 内存操作的 n 线程不发生死锁的互斥算法都需要Ω(n)的空间。（这个定理突显了使用简单的内存操作来实现复杂的并发控制是非常昂贵的）
>
> The2 [Attiya et al.]
>
> 在现代计算机上，任何 n 线程不发生死锁的互斥算法必须使用类似**内存屏障**或**原子的 CAS**这样昂贵的操作。
>
> 因此，硬件设计者在支持这些特殊操作时是合理的。这些操作不仅确保了程序在并发执行时的正确性和可靠性

## CAS（比较-交换法）

无锁的内存操作

- LOAD
- STORE
- CAS(compare-and-swap)

### 介绍

由 x86-64 架构上的 `cmpchg` 指令提供。C 语言的头文件 `stdatomic.h` 通过内置函数 `atomic_compare_exchange_strong()` 提供了 CAS（Compare-And-Swap），该函数可以对各种整数类型进行操作。CAS 做的事情是，检查下该内存地址上的值与旧值相同，相同则将内存地址的值改成新值返回 true，否则直接返回 false;

```c
// 规范
bool CAS(T *x, T old, T new) {
  if (*x == old) {
    *x = new;
    return ture
  }
  return false;
}
```

它是，原子执行， 因为有隐式屏障，他们的执行顺序不会重排序。硬件操作将不会中间插入到他们

### 用 CAS 实现互斥锁

> [!IMPORTANT]
>
> 【定理】用 CAS 实现 n 线程无死锁的互斥算法，能在$\Theta(1)$的空间复杂度实现

证明：

```c
void lock(int *lock_var) {
  while (!CAS(*lock_var, false, true)) // 自旋锁
}

void unlock(int *lock_var) {
  *lock_var = false;
}
```

只需要给锁本身提供空间即可。

#### 示例：累加问题

```c
int compute(const X& v);
int main() {
  const int n = 1000000;
  extern X myArray[n];
  // ...
  int result = 0;
  cilk_for(int i = 0; i < n; ++i) {
    result += compute(myArray[i]); // note: 这里有竞态数据
  }
  printf("The result is: %f\n", result);
  return 0;
}

```

常规的互斥锁解法

```c
int compute(const X& v);
int main() {
  const int n = 1000000;
  extern X myArray[n];
  mutex L;  // new add
  // ...
  int result = 0;
  cilk_for(int i = 0; i < n; ++i) {
    L.lock();  // new add
    result += compute(myArray[i]);
    L.unlock();  // new add
  }
  printf("The result is: %f\n", result);
  return 0;
}
```

> 一个循环获取了锁以后，如果 OS 此时将循环迭代换出了，会发生什么？

所有的循环迭代都必须等待。在这个例子中，我们想要的达到的效果是，执行完对 x 的 LOAD 操作后自动执行 STORE 操作。

#### CAS 的解决方案

```c
int result = 0;
clik_for(int i = 0; i < n; i++) {
  int temp = compute(myArray[i]);
  int old, new;
  do {
    old = result;
    new = old + temp;
  } while (!CAS(&result, old, new));
}
```

> 一个循环获取了锁以后，如果 OS 此时一个循环迭代的线程交换了，会发生什么？

没有其他循环迭代需要等待。算法是非阻塞的

## 无锁算法 TODO

无锁栈

```c
struct Node {
  Node* next;
  int data;
};
struct Stack {
  Node* head
}
```

![截屏 2024-06-28 14.17.56](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/667e559c75f1f.png)无锁push

```c
void push(Node* node) {
  do {
    node->next = head;
  } while (!CAS(&head, node->next, node))
}
```

## CAS 异常： ABA 问题

示例：

![image-20241001041021574](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb05b06ac11.png)

1. 线程 1 开始弹出包含 15 的节点，但在读取到 ``current->next``之后停顿（stall）。

![image-20241001041220522](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb06273b6ba.png)

2. 线程 2 弹出包含 15 的节点。

![image-20241001041237995](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb0638ae6c4.png)

3. 线程 2 弹出包含 94 的节点。

![image-20241001041324081](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb0666bac9b.png)

4. 线程 2 推入节点 7，重用包含 15 的节点。

![image-20241001041440150](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fb06b2c91a1.png)

5. 线程 1 恢复（resume），且它的 CAS 成功，移除 7，但将垃圾放回列表中。

### 解决方案

版本控制

- **将版本号与每个指针一起打包**：在每个原子可更新的字中，包含一个版本号。
- **每次更改指针时递增版本号**：每次对指针进行修改时，相应的版本号也要增加。
- **原子操作的比较和交换**：将指针和版本号作为一个原子操作进行比较和交换。

- 问题
  - **版本号可能需要非常大**：随着指针频繁更改，版本号可能变得非常大，导致存储和管理上的挑战。

回收机制

- **防止在请求未完成时重用节点**：确保在某个线程执行时，不允许节点（例如节点 15）被重用为其他节点（如节点 7）。
- **示例**：例如，当线程 1 仍在执行时，防止节点 15 被其他线程重用为节点 7，以确保数据的一致性和正确性。
