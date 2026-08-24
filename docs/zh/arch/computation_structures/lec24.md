---
title: 并发与同步
course: 6.1910 计算结构（Fall 25）
course_id: '6.1910'
lecture: 24
kind: system
tags: []
status: complete
---
# Lec 24 并发与同步

[[toc]]

我们已经学习 OS 通过时间片轮转让多个进程共享 CPU，现在进一步.在单个进程内，划分多个线程，由于现代 CPU 是多核的，我们系统尽可能并行执行多个线程，为了能够正确地配合执行任务，**必须同步（Synchronization）通信**

## 同步

我们可以将计算任务分配给多线程执行。

- 多个**独立（independent）**的顺序线程，它们竞争共享资源
- 多个**协作（cooperating）**的顺序线程，他们相互通信

同步模型有两种：

- 基于**共享内存模型（shared memory）**，所有线程**共享同一地址空间**，通过写入某个内存地址，另外一个线程读取该地址即可通信
  - 优点是实现简单，就是 load/store 操作
  - 缺点是容易踩脚，数据竞争或冲突。
- 基于**消息传递模型（Message Passing）**，各线程**地址空间不同**，需发送/接收显式消息。
  - 优点：不容易踩脚
  - 缺点：通信开销大，实现复杂。

每当系统中存在并行进程时，就需要同步，

- fork-join ：并行进程可能需要等待多个事件发生
- 生产者-消费者：消费者进程必须等到生产者进程生成数据
- 互斥：操作系统必须确保资源在给定时间内仅由一个进程使用

![image-20250420112250569](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68046895026b3.png)

> [!IMPORTANT]
>
> 线程安全（Thread-safe），是指并行程序的输出和在单处理器上某一个串行执行结果一致，换句话说，即使并发执行，结果也可预测、正确。

> 进程之间如何通信？

Solution: 大致有几种：

- 共享内存。
- 同步指令（需要硬件支持）。比如锁、信号量、原子操作
- 系统调用

## 引例：有界缓冲区问题

### 单字符缓冲区

有两个线程：Producer（生产者）：执行一系列操作，生成一个字符 `c`，然后发送给消费者；Consumer（消费者）：接收字符 `c`，然后执行一系列操作。

![image-20250421165957035](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68060a59402b2.png)

每个线程内部是顺序执行的，但跨线程之间没有同步机制，可能出现以下问题：消费者在数据还没被生产时就尝试读取；生产者在数据还没被消费完就覆盖已有数据。

我们使用符号 `≺`（"precede"）来表示先后约束

- 约束 1：先生产再消费：`Send(i) ≺ Receive(i)`，即生产者必须先发送第 `i` 个字符，消费者才能接收。
- 约束 2：不能覆盖未消费的旧数据：`Receive(i) ≺ Send(i+1)`，即生产者在发送第 `i+1` 个字符前，消费者必须完成对第 `i` 个字符的接收。

### FIFO 缓冲区

![image-20250421170648653](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68060aace0d6a.png)

使用 FIFO 缓冲区放松约束。使用大小为 `n` 的 FIFO 缓冲区：允许生产者**最多领先消费者 `n` 步**；新约束变为`Receive(i) ≺ Send(i+n)` 。在生产者发送第 `i+n` 个字符前，消费者必须接收完第 `i` 个字符。

通常来说，会把这个 buffer 实现成**环形缓冲区（Ring buffer）**，原理缓冲区收尾相连，写满后从头写，用两个指针：`in`：生产者写的位置； `out`：消费者读的位置。

**示例**：

假设缓冲区大小为 `3`，初始时 `in == out == 0`：

1. 生产者写入 `c0` → `in = 1`；
2. 写入 `c1` → `in = 2`；
3. 写入 `c2` → `in = 0`（回绕）；
4. 缓冲区满了，必须等待消费者读取至少一个；
5. 消费者读取 `c0` → `out = 1`，此时缓冲区腾出一个位置；
6. 生产者继续写入下一个字符到位置 `0`。
7. ![image-20250904004010029](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250904004010029.png)

```c
// Shared memory
char buf[N];  // The buffer
int in = 0, out = 0;

// Producer
void send(char c) {
  buf[in] = c;
  in = (in + 1) % N;
}

// Consumer
char rcv() {
  char c;
  c = buf[out];
  out = (out + 1) % N;
  return c;
}
```

代码有什么问题？  不能保证 precedence 限制，比如 rcv()均可能在任何 send()之前调用。我们将会更改这个代码，满足这些约束条件，为此我们将引入一种新的**编程结构**——**信号量（Semaphores）**，用于实现适当的进程间同步。

### 信号量

Dijkstra 于 1962 年提出，**信号量（Semaphores）**是特殊整型变量，始终$\ge$ 0，用于控制资源访问的并发数量或实现某种执行顺序（precedence）约束。

```c
semaphore s = K; // initialize s to K
```

信号量操作

```python
wait(semaphore s):
	wait until s > 0  # 如果 s == 0，则阻塞
  s = s - 1					# 获取资源（或占用一个槽）
```

```python
signal(semaphore s):
	s = s + 1 				# 释放资源（或归还一个槽）
```

语义保证： 当信号量初始化为 K，这确保了“最多允许 K 个并发”，或说“最多允许领先 K 步”

$signal(s)_i \prec wait(s)_{i+K}$

#### 抽象

信号量做资源分配，我们可以抽象地理解这个场景。由 K 个资源组成的资源池，必须保证最多有 K 个资源被使用。 主要思想就是， 将信号量看成是**资源池的剩余资源数**，将其作为不变量。生产者消费者的代码改动如下，可以至多有 K 个消费者占用资源，生产者负责

```c
// shared memory
char buf[N];
int in = 0, out = 0;
samaphore chars = 0; // 当前最多可以有0个消息可以被访问

// producer
void send(char c) {
  buf[in] = c;
  in = (in + 1) % N;
  signal(chars);
}

// consumer
char recv() {
  char c;
  wait(chars);
  c = buf[out];
  out = (out + 1) % N;
  return c;
}
```

> 代码有什么问题？

能保证$send(i) \prec recv(i)$，但是不能保证数据被覆盖即$recv(i) \prec send(i+K)$

正确的实现如下

```c
// shared memory
char buf[N];
int in = 0, out = 0;
samaphore chars = 0; // 当前最多可以有0个消息可以被访问
samaphore spaces = N; // 当前最多可以有K个空间可以防止消息

// producer
void send(char c) {
  wait(spaces);
  buf[in] = c;
  in = (in + 1) % N;
  signal(chars);	// 
}

// consumer
char recv() {
  char c;
  wait(chars);
  c = buf[out];
  out = (out + 1) % N;
  singal(spaces);
  return c;
}
```

对于单个生产者和消费者， 用信号量管理的资源：字符、空间都采用 FIFO 机制。 但如果是**多个生产者和消费者**呢？ 将会遇到互斥的问题

#### 互斥

编写并发程序时，尤其是在修改共享数据时，对于某些代码段（称为**临界区 critical sections**）， 我们希望确保任何两次执行都不会重叠，这种约束称为**互斥（mutual exclusion）**

解决方案：将临界区嵌入包装器（例如“事务”）中，以保证其原子性，即，使它们看起来像是单个、瞬时的操作。

下面是用信号量也可以实现互斥的例子

```c
semaphore mutex = 1;

void debit(int amount) {
  wait(mutex);        // wait for exclusive access
  int bal = account.balance;
  bal = bal - amount;
  account.balance = bal;

  signal(mutex);      // 离开临界区（解锁）
}

```

锁控制了临界区的使用。使用锁，需要**考虑粒度大小**，比如

- 所有账户共用一把锁？
- 为每个账户分配一把？
- 还是以 004 解决的账户共用一把锁？

如果我们考虑多消费者、多生产者的模型，就需要考虑 buffer 的临界区问题了，因此我们需要再一次改动前面的代码

```c
// shared memory
char buf[N];
int in = 0, out = 0;
samaphore chars = 0;
samaphore spaces = N;
samaphore lock = 1; // 只有一个能访问

// producer
void send(char c) {
  wait(spaces);
  wait(lock);
  buf[in] = c;
  in = (in + 1) % N;
  singal(lock);
  signal(chars);
}

// consumer
char recv() {
  char c;
  wait(chars);
  wait(lock);
  c = buf[out];
  out = (out + 1) % N;
  signal(lock);
  singal(spaces);
  return c;
}
```

综上我们发现信号量的强大，我们仅仅同个一个原语就能能保证**互斥**和**先后**关系。先后关系有$send(i) \prec recv(i)$ 、$recv(i) \prec send(i+K)$

#### 实现

信号量本身是共享数据，实现`wait` 和 `signal`操作需要 读/修改/写 三步骤，这些序列必须作为临界区执行。那么，如何在不使用信号量的情况下保证这个临界区的互斥呢？

实现方式是：

- 使用特殊的原子指令（比如，Test-and-Set 指令），由硬件直接支持，这是最常见的方法。
- 使用系统调用实现他们。 仅适用于单核处理器，其中内核不可中断。

示例： 基于 TAS 实现锁

```c
bool lock = false;
void acquire_lock() {
  while (test_and_set(lock));
}
void release_lock() {
  lock = false;
}
```

同步的阴暗面： 死锁

## 死锁问题

示例，A 给 B 转账，但 B 又同时给 A 转账。

```c
void transfer(int account1, int account2, int amount) {
	wait(lock[account1]);
  wait(lock[account2]);
  balance[account1] = balance[account1] - amount;
  balance[account2] = balance[account2] + amount;
  signal(lock[account2]);
  signal(lock[account1]);
}

Thread 1: wait(lock[6031]);
Thread 2: wait(lock[6004]);
Thread 1: wait(lock[6004]); // cannot complete
// until thread 2 signals
Thread 2: wait(lock[6031]); // cannot complete
// until thread 1 signals
No thread can make progress a Deadloc
```

**死锁的四个必要条件**

1. 互斥（Mutual Exclusion），每个资源（如筷子）一次只能由一个线程（哲学家）占有。
2. 保持并等待（Hold and Wait），线程持有一部分资源，同时等待另一部分。
3. 非抢占（No Preemption），资源不能被强行回收， 只能由占有者显式释放
4. 循环等待（Circular Wait）
