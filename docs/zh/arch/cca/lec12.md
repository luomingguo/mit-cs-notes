# Lec 12 同步与顺序一致性
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-03-26

## 1. 生产者-消费者同步问题

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 同步（<em>Synchronization</em>）</strong><br>
多线程程序中，当线程 A 生产数据、线程 B 消费数据时，B 必须等到 A 完成写入后才能读取，否则读到无效数据。同步机制确保线程间的执行顺序约束。</div>

**锁（*Lock*）的基本用法**：

```c
// 线程 A（生产者）
data = compute();
lock_release(&lock);   // 发布数据

// 线程 B（消费者）
lock_acquire(&lock);   // 等待数据就绪
use(data);
```

---

## 2. 原子操作（*Atomic Operations*）

普通 load/store 组合不是原子的（存在竞态条件），需要专用硬件指令：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — Test-and-Set / Swap（<em>原子交换</em>）</strong><br>
<code>TAS(addr)</code>：原子地读取地址 addr 的旧值，并写入 1，返回旧值。若旧值为 0（锁未占用），则当前线程获得锁；若旧值为 1，则自旋等待。<br>
<code>SWAP(addr, val)</code>：原子地将 val 写入 addr，返回旧值。</div>

RISC-V 实现（LR/SC，*Load-Reserved / Store-Conditional*）：

```asm
lock_acquire:
    lr.w  t0, (a0)        # Load-Reserved：读锁，设监控位
    bnez  t0, lock_acquire # 锁被占用，自旋
    li    t1, 1
    sc.w  t1, t1, (a0)    # Store-Conditional：若监控位仍有效则写
    bnez  t1, lock_acquire # sc 失败（被抢占），重试
    ret
```

---

## 3. 顺序一致性（*Sequential Consistency, SC*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 顺序一致性（<em>Lamport, 1979</em>）</strong><br>
多处理器系统是<em>顺序一致的</em>，当且仅当：任意执行的结果，等价于所有处理器的操作按某个全局顺序（<em>total order</em>）交织执行，且每个处理器内的操作保持程序顺序（<em>program order</em>）。</div>

**SC 的两个条件**：
1. 每个处理器内部的操作按程序顺序执行
2. 内存操作是原子的（所有处理器同时看到相同的写结果）

**SC 违反示例**：

```
初始：x = 0, y = 0
P1: x = 1; r1 = y;
P2: y = 1; r2 = x;
```

SC 保证：不可能出现 r1 = 0 且 r2 = 0（至少一个读到另一方的写）。

---

## 4. TSO 内存模型（*Total Store Order*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — TSO（<em>Total Store Order</em>）</strong><br>
TSO 是 x86 和 SPARC 使用的放松内存模型：每个处理器有一个 FIFO Store 缓冲区（<em>store buffer</em>），Store 先进 STB 再异步写入共享内存。Load 先查自己的 STB，不命中再访问共享内存。</br>
TSO 允许后面的 Load 超越前面的 Store（Store-Load 重排序）。</div>

**TSO 违反 SC 的场景**：

```
初始：x = 0, y = 0
P1: store x=1（进 STB，未写内存）; load y（读内存得 0）; r1=0
P2: store y=1（进 STB，未写内存）; load x（读内存得 0）; r2=0
结果：r1=0 且 r2=0 ← 在 SC 下不可能，但在 TSO 下可能！
```

---

## 5. 内存屏障（*Memory Fence*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 内存屏障（<em>Memory Fence / Barrier</em>）</strong><br>
内存屏障指令强制处理器在继续执行后续访存操作之前，先将 Store Buffer 中所有 pending 的 Store 写入共享内存（对 StoreLoad 屏障），或保证 Load 的全局可见性。RISC-V 使用 <code>fence</code> 指令。</div>

**RISC-V fence 语法**：

```asm
fence predecessor, successor
# predecessor: 屏障前的操作类型（r=load, w=store, rw=both）
# successor:   屏障后的操作类型
fence rw, rw   # 全屏障（最强，保证前后所有访存不重排）
fence r, r     # FenceLL（Load-Load 屏障）
fence w, w     # FenceSS（Store-Store 屏障）
```

修正 TSO 场景：

```asm
store x, 1
fence w, r     # 强制 store 刷新到内存后再 load
load r1, y
```

---

## 6. 锁实现对内存模型的依赖

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 锁释放需要屏障吗？</strong></div>

在 TSO 模型下：

```c
// 线程 A
data = 42;          // store data（进 STB）
lock = 0;           // store lock=0（进 STB）
// 若 STB 未立即刷新，线程 B 可能看到 lock=0 但 data 还是旧值！
```

Sol：`lock_release` 必须在 `store lock` 之前加 `fence w, w`（Store-Store 屏障），保证 data 写入先于 lock 的释放对所有核可见。

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 内存模型越放松，性能越高但编程越复杂</strong>　SC 最简单但限制了 Store Buffer 等硬件优化；TSO 允许 Store Buffer 提升性能，但程序员/编译器必须在关键点插入 fence；ARMv8 的 RISC 内存模型更弱，需要更多 fence，但可获得更高并行度。</div>

---

## 本讲总结

顺序一致性（SC）是最直观的多处理器内存模型；TSO 通过 Store Buffer 提升性能但破坏 SC；内存屏障在必要时强制操作有序完成；LR/SC 原子对实现无锁正确的 mutex；了解内存模型对编写正确的多线程程序（无数据竞争）至关重要。
