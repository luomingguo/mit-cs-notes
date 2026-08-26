---
title: 目录式缓存一致性（Directory-Based Cache Coherence）
type: lecture
lecture: 13
tags: []
status: complete
---
# Lec 13 目录式缓存一致性（*Directory-Based Cache Coherence*）

> MIT 6.5900 Fall 2024 · Daniel Sanchez 主题：目录式 vs 侦听式、MSI 目录协议、MSHR、目录组织与不精确表示、协议竞争与死锁、多级层级与原子操作

------

## 一、维持一致性的充分条件

只要硬件保证：

- 任一时刻**只有一个处理器**对某位置有写权限；
- 写之后**没有处理器能 load 该位置的陈旧副本**。

一种正确做法：

- **写请求**：写执行前，在所有其他 Cache 中作废该地址；
- **读请求**：若某 Cache 有脏副本，先写回再读内存。

------

## 二、目录式 vs 侦听式 [Censier and Feautrier, 1978]

|          | 侦听式（*Snoopy*）            | 目录式（*Directory*）                  |
| -------- | ----------------------------- | -------------------------------------- |
| 请求方式 | 在内存总线上**广播**          | 只向**可能持有该行的 Cache** 发消息    |
| 可扩展性 | 难扩展到大量处理器            | 可扩展到大量处理器                     |
| 额外开销 | 需对 Cache tag 的额外侦听带宽 | 需额外的**目录存储**来跟踪可能的共享者 |

------

## 三、MSI 目录协议

- **Cache 状态**：M / S / I；

- 目录状态

  ：

  - **Uncached（Un）**：无共享者；
  - **Shared（Sh）**：一个或多个共享者有读权限（对应 S）；
  - **Exclusive（Ex）**：单一共享者有读写权限（对应 M）。

- 为清晰起见瞬态未画；先假设无竞争请求。

目录每项记录：`Tag | State | Sharers`（共享者集合）。

### Cache 端的转换

- **由处理器访问触发**：`PrRd/ShReq`（I→S）、`PrWr/ExReq`（I→M 或 S→M）；
- **由目录请求触发**：`InvReq/InvResp`（作废，M 态附带数据、S 态不带数据）、`DownReq/DownResp`（降级，M→S 附带数据）；
- **由逐出触发**：`Eviction/WbReq`（M 态附带数据写回，S 态不带数据）。

### 目录端的转换

由数据请求触发：

```text
Un --ShReq--> Sh : Sharers = {P}; ShResp
Sh --ShReq--> Sh : Sharers += {P}; ShResp
Un --ExReq--> Ex : Sharers = {P}; ExResp
Sh --ExReq--> Ex : Inv(Sharers - {P}); Sharers = {P}; ExResp
Ex --ShReq--> Sh : Down(Sharer); Sharers = Sharer + {P}; ShResp
Ex --ExReq--> Ex : Inv(Sharers); Sharers = {P}; ExResp
```

由写回请求触发：`WbReq` 时按共享者数更新（>1 则移除该 P，==1 则清空），`WbResp`。

### 协议示例要点

- **LD（读）**：Cache 发 `ShReq`，目录置 `Sh {P}` 并 `ShResp` 回数据；
- **ST（写）且原为 Sh**：发 `ExReq`，目录向其他共享者发 `InvReq`，收齐 `InvResp` 后置 `Ex {P}` 并 `ExResp`；
- **逐出 M 行**：发 `WbReq`（附数据），目录写回主存并置 `Un`。

> 一个核先写回 0xA 再请求 0xB，两者会被**串行化**（受同一 MSHR/通道约束）——可考虑分离资源来并行化。

------

## 四、缺失状态保持寄存器（*Miss Status Holding Register, MSHR*）

MSHR 保存 Cache 之外的 load 缺失与写。

- **逐出/写回时**：无空闲项则停顿；分配新项；通道可用时发 `WBReq` 与数据；收 `WBResp` 后释放；
- **load 缺失时**：先在 MSHR 中找匹配地址。未找到则（无空闲项停顿，否则）分配新项；找到则只填入对应 ld/st 槽；发 `ShReq`（或 `ExReq`），收响应后把数据转发给 CPU 与 Cache，再释放；
- **每项含多个 ld/st 槽**：允许用一个项服务**对同一块的多个请求**。

------

## 五、目录组织

需求：目录要跟踪共享某块的所有核。挑战：每块存共享者列表的空间随**可能共享者数**增长。

### 1. 平坦的、基于内存的目录（*Flat, Memory-based*）

为每行用主存中的若干位存状态与共享者，用**位向量**编码共享者。

> 简单；但**慢**，且处理器多时极低效（约 P 位/行）。

### 2. 稀疏全映射目录（*Sparse Full-Map*）

只需跟踪**在私有 Cache 中**的行。**把目录组织成一个 Cache**（含 Line Address / State / Sharer Set，多路组相联）。

> 优点：低延迟、节能。缺点：位向量随核数增长 → 面积扩展差；相联度有限 → **目录诱发的作废**。

**目录诱发的作废**（*Directory-Induced Invalidations*）：为保持包含性（inclusion），把某项复用给新地址前，必须作废该项的所有共享者。

### 3. 共享者集合的不精确表示

- **粗粒度位向量**（如 1 位代表 4 个核）；
- **有限指针**（*Limited pointers*）：只维护少量共享者指针，溢出时标记"全部"并广播（或作废一个共享者）；
- **允许假阳性**（如 Bloom filter）。

> 优点：减少面积与能量。缺点：开销仍不可扩展（只是调常数因子）；不精确的共享者 → 广播、作废或多余的作废/降级。

------

## 六、协议竞争与延迟优化

### 协议竞争（*Protocol Races*）

目录对同地址的多请求串行化（排队或 NACK 重试），但冲突请求仍有竞争。

> **升级竞争**（Upgrade race）：Cache 0 与 1 同时对 0xA 发 `ExReq`；目录先服务 0 的请求、把 1 的排队；Cache 1 本期望 `ExResp` 却收到 `InvReq` → 它应从 `S→M` 转为 `I→M` 并发 `InvResp`。

### 额外跳数与三跳协议（*3-Hop*）

- **问题**：别的 Cache 中的数据要经目录中转，增加延迟；
- **优化**：让持有者**直接把数据转发给请求者**（如 `ExFwd` + `ExResp` + `ExAck`），减少跳数。

### 多级层级中的一致性

- 可在多级用相同或不同协议；**关键不变式**：在所有中间层级保证足够的权限；
- 例：8-socket Xeon E7（每 socket 8 核）—— socket 内用 **MESI** + L3 内嵌目录，socket 间用 **MESIF** + 侦听（QPI）。

### 内嵌 Cache 目录（*In-Cache Directories*）

把目录信息嵌入**共享末级 Cache 的 tag**（共享 Cache 必须**包含**私有 Cache 内容）。

> 优点：避免独立 tag 开销与单独查找。缺点：当共享 Cache ≫ 私有 Cache 总和时可能低效。

### 避免协议死锁

即使网络无死锁，协议也可能死锁（如两节点用请求塞满所有中间缓冲，阻塞响应进入网络）。

> 解法：**分离虚拟网络**（不同虚通道与端点缓冲，共享同一物理路由器与链路）。多数协议至少需 2 个虚拟网络（请求与回复），常需 >2。

------

## 七、同步与原子操作

实现同步需**原子读-改-写**（如 swap）。一致性协议会让 mutex 在各核 Cache 间 ping-pong；可用 **test&test&set** 减少。

### 实现原子指令的选项

- 侦听式：**锁总线** → 昂贵；
- 目录式：**锁住 Cache 中的行**（原子操作完成前禁止作废/逐出）→ 复杂；
- 现代处理器用 **load-reserve / store-conditional**。

### Load-reserve & Store-conditional

```text
Load-reserve R, (a):           Store-conditional (a), R:
    <flag, adr> ← <1, a>           if <flag, adr> == <1, a>
    R ← M[a]                           then 取消其他处理器对 a 的预约; M[a] ← R; status ← succeed
                                       else status ← fail
```

> 若 Cache 收到对预约寄存器地址的作废，预约位清 0。用 LR/SC 实现 swap：

```bash
# Swap(R1, mutex):
L: Ld-Reserve R2, (mutex)
   St-Conditional (mutex), R1
   if (status == fail) goto L
   R1 <- R2
```

> 性能：一致性事务总数不必然减少，但拆分原子指令可提高利用率（尤其分裂事务总线与目录）、减少 ping-pong（尝试获锁者不必每次 store）。

------

## 本讲小结

- 目录式一致性只向相关 Cache 发消息，以**额外目录存储**换取**可扩展性**，目录是排序点，支持无序网络；
- MSI 目录协议用目录状态 Un/Sh/Ex 与共享者集合，配 InvReq/DownReq/WbReq 等消息；**MSHR** 管理在途缺失与写；
- 目录组织在面积与精度间权衡：平坦位向量 → 稀疏全映射 → 不精确表示（粗粒度/有限指针/Bloom）；
- 需处理协议竞争（如升级竞争）、用三跳转发降延迟、分离虚拟网络避死锁；原子操作用 **LR/SC** 实现。

> 下一讲：一致性与松弛内存模型
