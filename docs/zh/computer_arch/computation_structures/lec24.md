# Lec 24 并发与同步

同步（Synchronization）。我们已经学习OS通过时间片轮转让多个进程共享CPU，现在进一步，即使在单个进程内，也可以划分多个线程，现代CPU是多核的，我们系统尽可能并行执行多个线程。多线程执行一般分为独立线程，和协作线程，其中独立线程各自，除非访问共享资源，否则可并行运行；而协作线程则是共享数据，一起解决问题，**必须同步通信**。



## Outline

- 同步场景 & 模式
- 引例：有界缓冲区问题
- 信号量
- 死锁问题

## 同步的场景 & 模式

常见的同步场景包括：

- fork-join 模型：主线程派发多个任务，等待所有子线程完成后继续执行。
- 生产者-消费者模型：一个线程生产数据，另一个线程消费数据，消费必须在生产之后，需同步保证顺序。
- 互斥模型：多个线程不能同时访问同一共享资源，需要机制来让一个线程排他访问资源。

![image-20250420112250569](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68046895026b3.png)

> [!IMPORTANT]
>
> 线程安全（Thread-safe），是指并行程序的输出和在单处理器上串行执行时一致，换句话说，即使并发执行，结果也可预测、正确。



同步通信的模式有两种

- 基于**共享内存模型（shared memory）**，所有线程共享一个地址空间，通过写入某个内存地址，另外一个线程读取该地址即可通信
  - 优点是实现简单，就是load/store操作
  - 缺点是容易踩脚，数据竞争或冲突。
- 基于**消息传递模型（Message Passing）**，各线程地址空间不同，需发送/接收显式消息。
  - 优点：不容易踩脚
  - 缺点：通信开销大，实现复杂。



### 进程内部通信

> 为什么我们需要多进程？

Solution: 大致有几点原因：

- 并发场景。多个进程可以同时运行，利用多核CPU。
- 异步。进程可以独立等待/处理 I/O， 互不阻塞。
- 把进程作为一种编程原语。这是把“进程”当成程序的基本构建块，像函数或对象一样使用。
- 数据或事件驱动。

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

- 约束1：先生产再消费：`Send(i) ≺ Receive(i)`，即生产者必须先发送第 `i` 个字符，消费者才能接收。
- 约束2：不能覆盖未消费的旧数据：`Receive(i) ≺ Send(i+1)`，即生产者在发送第 `i+1` 个字符前，消费者必须完成对第 `i` 个字符的接收。

### FIFO缓冲区

![image-20250421170648653](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68060aace0d6a.png)

使用 FIFO 缓冲区放松约束。使用大小为 `n` 的 FIFO 缓冲区：允许生产者最多领先消费者 `n` 步；新约束变为`Receive(i) ≺ Send(i+n)` 。在生产者发送第 `i+n` 个字符前，消费者必须接收完第 `i` 个字符。

典型地， 会把这个buffer实现成环形缓冲区（Ring buffer），原理缓冲区收尾相连，写满后从头写，用两个指针：`in`：生产者写的位置； `out`：消费者读的位置。

**示例**：

假设缓冲区大小为 `3`，初始时 `in == out == 0`：

1. 生产者写入 `c0` → `in = 1`；
2. 写入 `c1` → `in = 2`；
3. 写入 `c2` → `in = 0`（回绕）；
4. 缓冲区满了，必须等待消费者读取至少一个；
5. 消费者读取 `c0` → `out = 1`，此时缓冲区腾出一个位置；
6. 生产者继续写入下一个字符到位置 `0`。

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

代码有什么问题？  不能保证precedence限制，比如rcv()均可能在任何send()之前调用。我们将会更改这个代码，满足这些约束条件，为此我们将引入一种新的**编程结构**——信号量，用于实现适当的进程间同步。

## 信号量

### 原理

Dijkstra于1962年提出，信号量（Semaphores）特殊整型变量，始终$\ge$ 0，用于控制资源访问的并发数量或实现某种执行顺序（precedence）约束。

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

### 抽象

信号量做资源分配，我们可以抽象地理解这个场景。由K个资源组成的资源池，必须保  证最多由K个资源被使用。

解决方法： 将信号量看成是**资源池的剩余资源数**，将其作为不变量。生产者消费者的代码改动如下，可以至多有K个消费者占用资源，生产者负责

```c
// shared memory
char buf[N];
int in = 0, out = 0;
samaphore chars = 0;

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
samaphore chars = 0;
samaphore spaces = N;

// producer
void send(char c) {
  wait(spaces);
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
  singal(spaces);
  return c;
}
```

### 互斥

实现互斥（Mutual Exclusion），常见的方法包括锁（locks）、信号量、互斥变量（Mutexes）。下面我们以信号量实现互斥

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

锁控制了临界区的使用。使用锁，需要考虑粒度大小。

如果我们考虑多消费者、多生产者的模型，就需要考虑buffer的临界区问题了，因此我们需要再一次改动前面的代码

```c
// shared memory
char buf[N];
int in = 0, out = 0;
samaphore chars = 0;
samaphore spaces = N;
samaphore lock = 1;

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

综上 我们发现，我们仅仅同个一个原语就能能保证互斥和先后关系。先后关系有$send(i) \prec recv(i)$ 、$recv(i) \prec send(i+K)$，以及互斥关系

### 实现

信号量的实现方式？ 或者说需要什么样的指令支持实现这种原语。关键是保证`wait()`和`signal()`操作的原子性。

**最常见的**实现方式是： Test-and-Set（TAS）指令，由硬件直接支持，基本功能是同时测试一个内存地址的值，并设置它为某个值。

```c
bool test_and_set(bool *lock) {
  bool old = *lock;
  *lock = true;
  return old;
}
```

为什么就能保证互斥，因为TAS是一个原子操作，哪怕多个线程同时竞争进入临界区，只有一个线程能成功设置标志，其它线程会在循环中等待。

用系统调用实现TAS，这种实现只适用于单处理器系统，此时内核无法被打断

示例： 基于TAS实现锁

```c
bool lock = false;
void acquire_lock() {
  while (test_and_set(lock));
}
void release_lock() {
  lock = false;
}
```

## 死锁问题

引入信号量（semaphores）可以解决**互斥访问共享资源**的问题，但同时也带来了新的危险：死锁（deadlock）。

 示例，A给B转账，但B又同时给A转账。

```c
void transfer(int account1, int account2, int amount) {
	wait(lock[account1]);
  wait(lock[account2]);
  balance[account1] = balance[account1] - amount;
  balance[account2] = balance[account2] + amount;
  signal(lock[account2]);
  signal(lock[account1]);
}
```

Thread 1： wait(lock[6031]);

Thread2： wait(lock[6004]);

此时就造成死锁

### 哲学家问题



**死锁的四个必要条件**

1. 互斥（Mutual Exclusion）
   - 每个资源（如筷子）一次只能由一个线程（哲学家）占有。
2. 保持并等待（Hold and Wait）
   - 线程持有一部分资源，同时等待另一部分。
3. 不剥夺（No Preemption）
   - 资源不能被强行回收，只能由占有者显式释放。
4. 循环等待（Circular Wait）

因此解决办法就是打破其中一个必要条件，**或者**检测和恢复