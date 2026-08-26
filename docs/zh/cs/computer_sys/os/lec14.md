---
title: 协调
type: lecture
lecture: 14
tags: []
status: complete
---
# Lec 14 协调

本讲定位：调度和锁有助于向另一个线程隐藏一个线程的操作，但线程还需要**有意**地交互——等待某个条件成立。

xv6 用 sleep/wakeup 实现这种顺序协调，核心难点是避免"丢失唤醒"。

## 1. 为什么需要 sleep/wakeup

管道读者要等写者产数据、父进程 `wait` 要等子进程退出、读磁盘要等硬件完成……这些都需要"等待某条件变真"。

::: definition
**定义（睡眠和唤醒，又称顺序协调*sequence coordination* / 条件同步*conditional synchronization*）**
`sleep(chan, lk)` 把当前进程标记 SLEEPING 并让出 CPU，在等待通道 `chan` 上睡眠；
`wakeup(chan)` 唤醒所有在相同 `chan` 上睡眠的进程。
:::

sleep/wakeup 的接口如下：

```c
void sleep(void *chan, struct spinlock *lk)
void wakeup(void *chan)
```

`chan` 是个"透明值"（通常 64 位指针），内核只比较是否相等，不解释其含义。

睡眠和唤醒提供了相对低级的同步接口。为了激发它们在 xv6 中的工作方式，我们将使 用它们构建一个称为 信号量（*semaphore*） 的更高级别同步机制，用于协调生产者和消费者（xv6 不使用信号量）。信号量维护计数并提供两个操作。

## 2. xv6 的实现：两把锁的接力

::: definition 定义（sleep 的加锁顺序）
sleep 先 `acquire(p->lock)`，再 `release(lk)`（条件锁）；然后记录 chan、置 SLEEPING、调 sched。全程至少持有两把锁中的一把。
:::

```c
void sleep(void *chan, struct spinlock *lk){
  struct proc *p = myproc();
  acquire(&p->lock);   // 先拿 p->lock
  release(lk);         // 才放条件锁
  p->chan = chan; p->state = SLEEPING;
  sched();             // 让出 CPU
  p->chan = 0;
  release(&p->lock); acquire(lk);  // 醒来后复原
}
void wakeup(void *chan){
  for(p = proc; p < &proc[NPROC]; p++) if(p != myproc()){
    acquire(&p->lock);
    if(p->state==SLEEPING && p->chan==chan) p->state = RUNNABLE;
    release(&p->lock);
  }
}
```

::: theorem 推论（为何不会丢失唤醒）
睡眠者从"检查条件"到"标记 SLEEPING"全程持有条件锁或 `p->lock`（或两者），而 wakeup 必须同时拿这两把锁。于是要么唤醒者先拿到锁、在睡眠者检查条件前就把条件置真（睡眠者根本不会睡），要么唤醒者被阻塞到睡眠者完全睡下并释放锁、此时它必看到 SLEEPING 而将其唤醒。
:::

注意 `p->lock` 在标记 SLEEPING 之前**绝不能释放**（否则 wakeup 可能在中途看到不一致状态）。

## 3. 丢失唤醒与条件锁

::: example 例题 1
（`sleep` 第二个参数"条件锁" `lk` 有什么用？为什么必须持有它再调 sleep？）
:::

为防**丢失唤醒 (*lost wakeup*)**：若在"检查条件"与"调用 sleep"之间，另一线程调了 `wakeup`，那时还没有进程在睡，wakeup 直接返回；之后本线程才睡下，便永远等不到唤醒了。解决：调 sleep 时持有保护该条件的"条件锁"并传给 sleep。以管道为例（标记 ZZZ 处即危险窗口）：

```c
piperead(p){ 
  acquire(&p->lock);
  while(no data) sleep(&p, &p->lock);  // 检查→sleep 期间一直持 p->lock
  remove data; release(&p->lock); 
}
pipewrite(p){ 
  acquire(&p->lock);
  append data; wakeup(&p); 
  release(&p->lock); 
}
```

因为 piperead 从检查条件到调 sleep 全程持 `p->lock`，pipewrite 无法插入执行 wakeup，丢失唤醒被杜绝。

## 4. 伪唤醒与 p->lock

::: example 例题 2
（多个进程在同一 chan 上睡眠，一次 wakeup 全唤醒，为什么 sleep 必须放在 while 循环里？）
:::

因为一次 wakeup 唤醒所有等待者，但通常只有一个能真正消费到资源（如管道里只有一份数据）。其余进程醒来发现条件仍不满足——这叫**伪唤醒 (*spurious wakeup*)**，必须重新睡下。所以模式恒为 `while(条件不满足) sleep(...)`，每次醒来都重新检查条件。这也使得"两个不同用途的 sleep/wakeup 误用同一 chan"不会出错——最多触发伪唤醒，循环检查会兜住。

进程锁 `p->lock` 是 xv6 中最复杂的锁：读写 `p->state`、`p->chan`、`p->killed`、`p->xstate`、`p->pid` 时必须持有它，因为这些字段会被其他进程或别的核上的调度器线程访问。

---

## 5. 现代系统

避免丢失唤醒的不同做法：原始 Unix（单 CPU）靠 sleep 时关中断；xv6/FreeBSD 用显式锁；Plan 9 用进入睡眠前运行的回调做最后检查；Linux 用带内部锁的**等待队列 (*wait queue*)**（比扫描整个进程表高效）。许多线程库把这套机制叫**条件变量 (*condition variable*)**，sleep/wakeup 对应 wait/signal。**惊群效应 (*thundering herd*)**：广播唤醒大量进程让它们争抢——故条件变量常分 signal（唤醒一个）与 broadcast（唤醒全部）。**信号量 (*semaphore*)** 用显式计数避免丢失唤醒与伪唤醒。xv6 对 `kill` 的支持不完善：kill 与 sleep 间存在竞态，被 kill 的进程可能要等到所等条件发生才注意到 `p->killed`（甚至永远等不到，如等控制台输入）。

## 6. 自测清单

- [ ] sleep/wakeup 解决什么问题？chan 是什么？
- [ ] 什么是丢失唤醒？条件锁如何避免它（用管道例子）？
- [ ] sleep 为什么先拿 p->lock 再放条件锁？标记 SLEEPING 前为何不能放 p->lock？
- [ ] 用"两种情况"论证为何不会丢失唤醒。
- [ ] 什么是伪唤醒？为什么 sleep 必须在 while 循环里？
- [ ] 等待队列、条件变量、信号量、惊群效应分别是什么？

## 参考资料

阅读：`kernel/{proc.c, uart.c, pipe.c}`，xv6 第 9 章。

阅读 xv6 内核的完整实现代码

- `kernel/proc.c`
- `kernel/uart.c`
- `kernel/pipe.c`

阅读 [xv6 教材的第 9 章]()

调度和锁可以帮助隐藏线程之间的互相影响，但我们还需要一些抽象机制让线程能够有意地进行交互。例如，在 xv6 中，管道（pipe）的读取者可能需要等待写进程产生数据；父进程调用 `wait` 时，可能需要等待子进程退出；一个读取磁盘的进程，需要等待磁盘硬件完成读取操作。

在这些场景（以及更多类似场景）中，xv6 内核使用一种叫做 **sleep 和 wakeup** 的机制。`sleep` 允许一个内核线程等待某个条件变为真，另一个线程或中断处理程序可以让这个条件成立（通常是通过修改某些变量），然后调用 `wakeup`，通知那些正在等待这个条件的线程继续执行。sleep 和 wakeup 通常被称为顺序协调（sequence coordination）或 条件同步（conditional synchronization）机制

## 接口定义

sleep()` 会把当前进程标记为 **SLEEPING（不可运行）**，并通过上下文切换把 CPU 让给调度器，让其他进程运行。`chan` 参数被称为“等待通道”（wait channel）。`wakeup(chan)` 会唤醒所有调用过 `sleep(chan, ...)` 且使用相同 `chan` 的进程。

`chan` 是一个“透明值”，通常是 64 位；内核只做一件事：比较是否相等。

>  `sleep()`第二个参数`lk`是什么？

Solution： `lk` 是“条件锁”，之所以在调用 sleep 时必须持有条件锁，并且要把这个锁传递给 sleep，是为了防止出现这样一种情况：在检查条件和调用 sleep 之间，另一个线程调用了 wakeup。如果在这个时间点发生了 wakeup，它会发现当前没有任何进程处于睡眠状态，于是 wakeup 会直接返回。但随后当前线程才调用 sleep，这样它可能就再也不会被唤醒了，因为本应唤醒它的那次 wakeup 已经发生过了。这种不希望出现的情况称为“丢失唤醒”（lost wake-up）

## 代码： pipe

```c
piperead(pipe){
  acquire(&pipe->lock);
  while(no data in pipe->buffer){
    // ZZZ
    sleep(&pipe, &pipe->lock);
  }
  remove the data from the pipe;
  release(&pipe->lock);
}

pipewrite(pipe){
  acquire(&pipe->lock);
  append data to pipe->buffer;
  wakeup(&pipe);
  release(&pipe->lock);
}

```

在上面的管道（pipe）示例中，需要避免的“丢失唤醒”是这样一种情况：在 piperead 检查条件与调用 sleep 之间（标记为 ZZZ 的位置），另一个 CPU 上的线程可能调用了 pipewrite。由于 piperead 在检查条件到调用 sleep 的这段时间内一直持有管道锁，pipewrite 就无法执行，从而避免了丢失唤醒的问题。

**xv6 的 sleep / wakeup 实现**

基本思想是：sleep 将当前进程标记为 SLEEPING，然后调用 sched 释放 CPU；wakeup 则查找在指定等待通道（wait channel）上睡眠的进程，并将其状态标记为 RUNNABLE。

sleep 会先获取 `p->lock`，然后才释放条件锁 lk。sleep 在整个过程中始终持有这两把锁中的至少一把，这一点非常关键：它可以阻止并发的 wakeup（wakeup 必须同时获取这两把锁）执行，从而避免丢失唤醒。此时 sleep 只持有 `p->lock`，它可以通过记录等待通道、将进程状态改为 `SLEEPING`，并调用 sched 来让进程进入睡眠，很快就会看到，为什么在进程被标记为 `SLEEPING` 之前，`p->lock` 绝不能被释放。

在某个时刻，一个进程会获取条件锁，设置睡眠者正在等待的条件，然后调用`wakeup(chan)`。 重要的是，调用 wakeup 时必须持有条件锁。wakeup 会遍历进程表， 获取每个进程对应的`p->lock`。当 wakeup 发现某个进程处于 SLEEPING 状态且其 chan 匹配时，就会把该进程的状态改为 RUNNABLE。下一次 scheduler 运行时，就会发现这个进程已经可以被调度执行。

```c
// Sleep on channel chan, releasing condition lock lk.
// Re-acquires lk when awakened.
void
sleep(void *chan, struct spinlock *lk)
{
  struct proc *p = myproc();
  
  // Must acquire p->lock in order to
  // change p->state and then call sched.
  // Once we hold p->lock, we can be
  // guaranteed that we won't miss any wakeup
  // (wakeup locks p->lock),
  // so it's okay to release lk.

  acquire(&p->lock);  //DOC: sleeplock1
  release(lk);

  // Go to sleep.
  p->chan = chan;
  p->state = SLEEPING;

  sched();

  // Tidy up.
  p->chan = 0;

  // Reacquire original lock.
  release(&p->lock);
  acquire(lk);
}

// Wake up all processes sleeping on channel chan.
// Caller should hold the condition lock.
void
wakeup(void *chan)
{
  struct proc *p;

  for(p = proc; p < &proc[NPROC]; p++) {
    if(p != myproc()){
      acquire(&p->lock);
      if(p->state == SLEEPING && p->chan == chan) {
        p->state = RUNNABLE;
      }
      release(&p->lock);
    }
  }
}
```

为什么 sleep 和 wakeup 的加锁规则能够保证一个即将进入睡眠的进程不会错过并发的 wakeup？原因在于：从检查条件开始，到将自身标记为 SLEEPING 为止，这个进程始终持有条件锁或自己的 `p->lock`（或两者都持有）,见图 9.1。而调用 wakeup 的进程必须获取这两把锁。可能出现两种情况：

- 唤醒者先获取锁，这意味着它会在消费者线程检查条件之前就将条件置为真，因此消费者线程根本不需要调用 sleep；
- 或者唤醒者获取锁时被阻塞，直到消费者线程完全进入睡眠并释放锁，此时唤醒者会看到该线程已被标记为 SLEEPING，从而将其唤醒。

有时会有多个进程在同一个通道上睡眠，例如多个进程同时从管道读取数据。一次 wakeup 调用会把它们全部唤醒。其中一个进程会先运行并获取 sleep 时使用的锁（在管道的例子中），然后读取可用数据。其他进程虽然被唤醒，但会发现没有数据可读。从它们的角度看，这次 wakeup 是“伪唤醒”（spurious wakeup），因此它们必须再次进入睡眠。正因为如此，sleep 总是放在循环中调用，每次醒来都要重新检查条件。

![image-20260428114738346](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260428114738346.png)

如果两个不同用途的 sleep/wakeup 不小心使用了相同的等待通道，也不会造成严重问题：它们可能会遇到伪唤醒，但通过上述循环检查机制可以正确处理

## 进程锁

每个进程关联的锁（p->lock）是 xv6 中最复杂的一把锁。一个比较直观的理解方式是：在读取或修改以下 struct proc 字段时，必须持有 `p->lock`：

- `p->state`
- `p->chan`
- `p->killed`
- `p->xstate`
- `p->pid`

这些字段可能会被其他进程，或者运行在其他 CPU 上的调度器线程访问，因此用锁保护是很自然的。

## 现代操作系统

睡眠（sleep）和唤醒（wakeup）是一种简单而有效的同步方法，但还有许多其他方法。它们的第一个挑战是避免本章开头提到的“丢失唤醒”问题。原始 Unix 内核的 sleep 通过禁用中断来解决这个问题，因为 Unix 运行在单 CPU 系统上。而 xv6 运行在多处理器上，因此它在 sleep 中添加了一个显式锁。FreeBSD 的 msleep 采取了相同的方法。Plan 9 的 sleep 使用一个回调函数，它在进入睡眠之前调度锁被持有时运行；该函数作为对睡眠条件的最后检查，以避免丢失唤醒。Linux 内核的 sleep 使用了一个显式的进程队列，称为等待队列（wait queue），而不是等待通道（wait channel）；该队列有自己的内部锁。

扫描整个进程集以唤醒所有进程是低效的。更好的解决方案是将 sleep 和 wakeup 中的 chan 替换为一种数据结构，用于保存睡眠在该结构上的进程列表，如 Linux 的等待队列。Plan 9 的 sleep 和 wakeup 将该结构称为会合点（rendezvous point）或 Rendez。许多线程库将相同的结构称为条件变量（condition variable）；在这种上下文中，sleep 和 wakeup 操作被称为等待（wait）和信号（signal）。所有这些机制都有相似的特点：睡眠条件通过某种锁进行保护，并在进入睡眠时原子性地释放锁。

wakeup 的实现会唤醒所有在特定通道上等待的进程，而可能有许多进程在等待该通道。操作系统将调度所有这些进程，它们将争相检查睡眠条件。表现出这种行为的进程有时被称为惊群效应（thundering herd），最好避免这种情况。大多数条件变量有两个唤醒原语：signal，用于唤醒一个进程；broadcast，用于唤醒所有等待的进程。

信号量（semaphores）通常用于同步。计数通常对应于管道缓冲区中的可用字节数或进程拥有的僵尸子进程数。使用显式计数作为抽象的一部分可以避免“丢失唤醒”问题：有一个显式的计数表示发生了多少次唤醒。计数还可以避免虚假唤醒和惊群效应的问题。

终止进程并清理它们在 xv6 中引入了很多复杂性。在大多数操作系统中，这一过程更加复杂，因为受害进程可能在内核中深度休眠，解开其调用栈需要小心处理，因为调用栈中的每个函数可能需要执行一些清理工作。一些编程语言通过提供异常机制来简化这一过程，但 C 语言没有。此外，还有其他事件可能会导致正在睡眠的进程被唤醒，即使它正在等待的事件尚未发生。例如，当一个 Unix 进程正在睡眠时，另一个进程可能向它发送信号。在这种情况下，进程将从中断的系统调用中返回值-1，并将错误代码设置为 EINTR。应用程序可以检查这些值并决定接下来的操作。xv6 不支持信号，因此这种复杂性不会出现。

xv6 对 kill 的支持并不完全令人满意：有些睡眠循环可能应该检查 p->killed。一个相关的问题是，即使对于那些检查 p->killed 的睡眠循环，在 sleep 和 kill 之间仍然存在竞争条件；kill 可能在受害进程检查 p->killed 之后但在调用 sleep 之前设置 p->killed 并尝试唤醒受害进程。如果发生这种问题，受害进程不会注意到 p->killed，直到它等待的条件发生。这可能需要很长时间，甚至可能永远不会发生（例如，如果受害进程正在等待来自控制台的输入，但用户没有输入任何内容）。

一个真正的操作系统会使用显式的空闲列表以常量时间找到空闲的 proc 结构，而不是像 allocproc 那样使用线性时间扫描；xv6 为了简单性使用了线性扫描。
