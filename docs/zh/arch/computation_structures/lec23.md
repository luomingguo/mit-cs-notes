# Lec 23 旁路技术和EHR

旁路技术（bypassing， 又叫 forwarding）是一种为了减少stall，在数据的生产-消费者之间的提供额外的数据通路的技术。常规途经而言，一个值会被写回寄存器文件（register file），然后由 decode 阶段读取。而Bypassing允许值被计算出来的同时，就直接被decode阶段使用，而不等写回。旁路技术的**副作用**：Bypassing 会引入新的组合逻辑路径，可能导致组合延迟增加，从而延长时钟周期，也会增加芯片面积。bypass的效率取决于它被使用的频率。

![image-20250422064445680](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68354a192fba3.png)



EHR（Ephemeral History Registers）是Bluespec 中一种机制，用于精确控制寄存器的写入和读取，搭配 bypassing 使用时，可以实现更灵活的控制路径数据传递和调度。

## Outline

- Bluespec中的旁路技术



## Bluespec中旁路技术

在Bluespec看来，Bypassing是一种作为减少的周期数，即减少两个有冲突的规则或方法之间执行所需的时钟周期数。举个例子：

> 假设你设计了一个 FIFO，如果已经满了，通常不能 `enq`（入队）

如果在 **同一个周期**，另一条规则要执行 `deq`（出队），那 FIFO 实际上会腾出一个位置。如果你能在逻辑上“看到未来”这次 `deq` 会发生，就可以允许同时执行 `enq`，即使此时 FIFO 是满的。

另外一个例子——规则重写（rule transformation）。

**目标**： 让 `ra` 和 `rb` 在**同一个周期**并发执行，并且让 `rb` 用到的是 `ra` 刚刚计算出的新值 `x`，外加一个约束`ra < rb`（表示：ra 的优先级比 rb 高，ra 在 rb 之前执行）

```
rule ra;
	x <= y + 1;  // 读取 y，写入 x
endrule

rule rb;
	y <= x + 2; // 读取 x，写入 y
endrule
```

### 寄存器的限制

使用寄存器这种基本的硬件原语时，无法在同一个原子动作（也就是一个时钟周期内）完成以下通信：

- 两个方法之间（method 是模块对外提供的接口）
- 两个规则之间（rule 是 模块内部的原子动作，通常带有条件和动作）；
- 一个规则和一个方法之间

> 为什么不行？

Solution：register 是时钟边沿触发的，它的输入值在当前周期写入，但直到下一个时钟周期才会出现在输出端。因此，它不能用于“同周期通信”。□

EHR（Ephemeral History Register） 是为了解决普通寄存器无法在同一周期内完成通信的问题而设计的。一个“会记住这个周期你已经写过什么”的寄存器 —— 所以即使是在同一个周期中先写再读，读操作也能看到写操作的值。



## EHR

我们可以看到有一个触发器

![image-20250528085401338](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/68365eb79f0ef.png)

`r[1]`返回：

- 如果`w[0]`没有使能，返回当前状态
- 如果`w[0]`使能，返回写入到`w[0].data`值

`w[i+1]`领先于`w[i]`，即 w[i] $\prec$​ w[i+1]

且r[0] $\prec$ w[0]； r[1] $\prec$ w[1]

| w[0].enable | w[1].enable | r[1]      | r[0] |
| ----------- | ----------- | --------- | ---- |
| 0           | 0           | cur state |      |
| 0           | 1           | cur state |      |
| 1           | 0           | w[0].data |      |
| 1           | 1           | w[0].data |      |



### 寄存器 和 EHRs 的冲突矩阵

CF: f 和 g 不冲突且不影响

C：冲突，不能同时调用



**寄存器**

|       | reg.r   | reg.w   |
| ----- | ------- | ------- |
| reg.r | CF      | $\prec$ |
| reg.w | $\succ$ | C       |

**EHR**

|        | EHR.r0  | EHR.w0  | EHR.r1  | EHR.w1  |
| ------ | ------- | ------- | ------- | ------- |
| EHR.r0 | CF      | $\prec$ | CF      | $\prec$ |
| EHR.w0 | $\succ$ | C       | $\prec$ | $\prec$ |
| EHR.r1 | CF      | $\succ$ | CF      | $\prec$ |
| EHR.w1 | $\succ$ | $\succ$ | $\succ$ | C       |









## 用EHR设计FIFO

1. 无冲突FIFO。 当 FIFO 不满也不空的时候，enq和deq可以同时进行，但是当前周期入队的值不会被同一个周期的出队看到。**入队和出队是解耦的**，互相看不到对方的“当前操作”。
2. 流水线型FIFO。正常来说：向满的 FIFO 入队是不允许的。但如果在同一个周期中同时执行一个 `deq`，那就允许 `enq`，因为 `deq` 腾出空间，`enq` 正好填补进去。
3. 旁路FIFO。正常来说：从空的 FIFO 出队是不允许的；但如果你在同一个周期中同时执行 enq，则允许出队；这个新入队的数据会直接送给出队口，好像绕过 FIFO 存储一样









