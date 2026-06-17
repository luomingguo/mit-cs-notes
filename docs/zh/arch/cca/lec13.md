# Lec 13 缓存一致性
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-04-02

## 1. 缓存一致性问题

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 缓存一致性问题（<em>Cache Coherence Problem</em>）</strong><br>
多处理器系统中，每个核心有私有 L1 缓存。当核心 A 修改了变量 x，核心 B 的缓存中仍可能持有 x 的旧值。若不加处理，两个核心对同一内存地址将看到不同的值，违反一致性。</div>

**一致性需求**：同一地址的任意两次写操作，所有处理器看到的顺序相同；读操作返回最近一次写操作的值。

---

## 2. MSI 协议

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — MSI 状态机（<em>Modified-Shared-Invalid</em>）</strong><br>
每个缓存行有三种状态：<br>
<ul style="margin:4px 0; padding-left:20px;">
<li><strong>M（<em>Modified</em>）</strong>：本缓存独占该行，且数据已修改（与内存不同）。可读写，无需通知其他核。</li>
<li><strong>S（<em>Shared</em>）</strong>：本缓存有该行的只读副本，可能有其他核也持有 S 副本。可读，写时必须升级。</li>
<li><strong>I（<em>Invalid</em>）</strong>：本缓存没有该行的有效副本。任何访问都是缺失。</li>
</ul></div>

**状态转换（核心视角）**：

| 当前状态 | 事件 | 动作 | 新状态 |
|--------|------|------|--------|
| I | 处理器 Load | 发送 GetS，等待数据 | S |
| I | 处理器 Store | 发送 GetM，等待数据 | M |
| S | 处理器 Store | 发送 UpgradeM，作废其他 S | M |
| M | 收到 Inv（目录要求降级）| 写回数据 | I 或 S |

---

## 3. 基于目录的缓存一致性（*Directory-Based Coherence*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 目录（<em>Directory</em>）</strong><br>
目录是一个集中式数据结构，为每个内存行记录：哪些缓存持有该行的副本（<em>sharers</em>），以及当前的状态（M/S/I）。目录位于内存控制器附近，负责协调所有一致性消息，避免总线广播（可扩展到多核）。</div>

**目录消息类型**：
- 核 → 目录：`GetS`（读请求）、`GetM`（写请求）、`PutS`（自愿降级）、`PutM`（写回 M 行）
- 目录 → 核：`Fwd-GetS`（转发读请求）、`Inv`（作废）、`Data`（数据响应）
- 核 → 核：`Data`（点对点数据转发）

---

## 4. BSV 缓存一致性实现

### 4.1 两个方向的消息队列

```bsv
// 上行（核 → 目录）
FIFO#(CacheMsg)  c2m <- mkFIFO;   // cache to memory

// 下行（目录 → 核）
FIFO#(CacheMsg)  m2c <- mkFIFO;   // memory to cache
```

### 4.2 关键规则（客户端 / 核心侧）

```bsv
rule startMiss (mshr == Ready && cacheMiss);
    c2m.enq(CacheMsg{type: GetS/GetM, addr: missAddr});
    mshr <= SendFillReq;
endrule

rule sendFillReq (mshr == SendFillReq);
    mshr <= WaitFillResp;
endrule

rule waitFillResp (mshr == WaitFillResp);
    let msg = m2c.first; m2c.deq;
    // 填充缓存行，更新 MSI 状态
    mshr <= Ready;
endrule

rule parentResp;  // 处理目录发来的 Fwd/Inv
    let msg = m2c.first; m2c.deq;
    // 修改本地 MSI 状态，可能需要发送 Data 给另一核
endrule
```

### 4.3 关键规则（目录 / 父节点侧）

```bsv
rule dwn;     // 目录降级请求（downgrade）
    // 向持有 M 行的核发送 Fwd 或 Inv
endrule

rule dwnRsp;  // 收到核的降级响应
    // 更新目录状态，转发数据
endrule

rule dng;     // 自愿降级（voluntary downgrade）
    // 核主动发 PutS/PutM，目录更新 sharer 列表
endrule
```

---

## 5. 8 种一致性场景

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — GetS 命中 M 状态行</strong></div>

场景：核 A 持有 M 状态（独占写），核 B 发送 GetS 读请求。

1. 核 B 发 `GetS` → 目录
2. 目录发 `Fwd-GetS` → 核 A（"把数据转给 B"）
3. 核 A 将缓存行状态降为 S，发 `Data` → 核 B，发 `PutM-Ack` → 目录
4. 目录更新：sharer = {A, B}，状态 = S
5. 核 B 收到 `Data`，状态置为 S

Sol：目录协议避免了广播，仅涉及 A、B、目录三方的点对点消息。

---

## 6. 协议不变量

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — MSI 不变量</strong>　任意时刻，对于同一地址：（1）至多一个缓存处于 M 状态；（2）若有缓存处于 M 状态，则所有其他缓存必须处于 I 状态；（3）处于 S 状态的缓存中的数据必须与内存（或 M 行）一致。BSV 实现中可以通过断言（<em>assertion</em>）在仿真中验证这些不变量。</div>

---

## 本讲总结

MSI 三状态协议通过 M→S→I 的状态转换维持缓存一致性；基于目录的实现用点对点消息替代总线广播，可扩展到众核；BSV 用独立规则实现目录的每个动作（startMiss、sendFillReq、parentResp、dwn 等），自然对应协议状态机；实际处理器（Intel/AMD）使用 MESI 或 MOESI 协议，添加了 Exclusive 和 Owned 状态以减少无效写缺失。
