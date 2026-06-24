# Lec 18 — P2P 与 Chord 查找协议

> 论文：*Chord: A Scalable Peer-to-Peer Lookup Service for Internet Applications*, SIGCOMM 2001.
> Ion Stoica, Robert Morris, David Karger, M. Frans Kaashoek, Hari Balakrishnan（MIT LCS）

---

## 1. 问题背景

 P2P（*Peer-to-Peer*）系统是没有中心控制、没有层级结构的分布式系统，每个节点运行的软件在功能上是**对等**的。这类系统的特性很多（冗余存储、持久性、就近选择、匿名、搜索、认证、层级命名……），但其**核心操作**几乎都归结为一件事：

> **高效地定位存储了某个数据项的节点。**

Chord 把这个核心问题抽象为一个极简的接口——只提供一个操作：给定一个键 $k$，Chord  将其映射到一个节点

$$
\text{lookup}(k) \;\longmapsto\; \text{successor}(k)
$$
即返回**负责**存储该键的节点的 IP 地址。具体存什么、怎么认证、怎么缓存、怎么复制，全部交给上层应用决定。



Chord 与其它 P2P 查找协议相比，有三个突出特点：**简单性**、**可证明的正确性**、**可证明的性能**。

| 指标                        | 复杂度        |
| :-------------------------- | :------------ |
| 每个节点维护的路由状态      | $O(\log N)$   |
| 一次 lookup 的消息数 / 跳数 | $O(\log N)$   |
| 节点加入/离开需要的消息数   | $O(\log^2 N)$ |

其中 $N$ 是系统中的节点数。

> **与既有系统的对比**：
>
> - Napster 有中心目录（单点故障）；
> - Gnutella 用广播查询（不可扩展）；
> - DNS 依赖特殊的根服务器且命名结构受行政边界约束。
> - Chord  没有特殊节点、键空间是**扁平**的、且在路由信息部分过期时性能也只是**优雅降级**而非崩溃——这是它能在频繁加入/离开的动态环境中工作的关键。



## 2. 系统模型与设计目标

Chord  以**库**的形式与应用链接，向应用暴露两件事：(1) `lookup(key)` 返回负责该键的节点 IP；(2) 当本节点负责的键集合发生变化时**通知**上层（以便迁移数据）。

它通过解决以下难题来简化 P2P 系统设计：

- **负载均衡（Load balance）**：作为一个分布式哈希函数，把键均匀散布到各节点。
- **去中心化（Decentralization）**：完全分布式，没有任何节点比其它节点更重要。
- **可扩展性（Scalability）**：查找代价随节点数对数增长，无需任何参数调优。
- **可用性（Availability）**：自动调整内部表以反映节点的加入与失效，即使系统持续变化也能找到负责键的节点。
- **灵活命名（Flexible naming）**：键空间扁平，不对键的结构施加任何约束。

> **典型应用**：协作镜像（*Cooperative Mirroring*）、分时存储（*Time-Shared Storage*）、分布式索引（支持类 Gnutella/Napster 的关键词搜索）、大规模组合搜索（如密码破解）。

---

## 3. 一致性哈希（Consistent Hashing）

Chord  的底层是 (*consistent hashing* / 一致性哈希) 的一个变体。

<div style="background-color:#e6f2ff; padding:12px 16px; border-left:5px solid #3399ff; border-radius:4px;"> Define：<strong>标识符与标识符环</strong></div>

用基础哈希函数（如 (*SHA-1*)）给每个节点和键分配一个 $m$ 比特的标识符：

- 节点标识符 = $\text{hash}(\text{节点 IP})$
- 键标识符 = $\text{hash}(\text{key})$

所有标识符按模 $2^m$ 排列在一个**标识符环**（*identifier circle*）上。$m$ 要足够大，使两个节点或键碰撞的概率可忽略（实现中用 160 比特）。



<div style="background-color:#e6f2ff; padding:12px 16px; border-left:5px solid #3399ff; border-radius:4px;">Define：<strong>successor</strong></div>

键 $k$ 被分配给标识符**等于或顺时针紧随** $k$ 的第一个节点，记为
$$
\text{successor}(k) = \text{从 } k \text{ 顺时针方向遇到的第一个节点}
$$





<div style="background-color:#e8f5e9; padding:12px 16px; border-left:5px solid #43a047; border-radius:4px;"> <strong>最小扰动性质</strong>

当节点 $n$ 加入时，原本属于 $n$ 后继的部分键转交给 $n$；当 $n$ 离开时，它的所有键转交给后继。除此之外不需要任何其它键的重分配。

**推论（定理 1，一致性哈希的负载性质）**：对任意 $N$ 个节点和 $K$ 个键，以高概率（w.h.p.）：

1. 每个节点负责至多 $(1+\varepsilon)\dfrac{K}{N}$ 个键；
2. 当第 $(N{+}1)$ 个节点加入或某节点离开时，只有 $O\!\left(\dfrac{K}{N}\right)$ 个键的归属发生变化（且仅在加入/离开的节点与其相邻节点间转移）。

朴素实现下 $\varepsilon = O(\log N)$；让每个真实节点运行 $O(\log N)$ 个**虚拟节点**（virtual node）可把 $\varepsilon$ 降到任意小常数。

</div>

> **关于 "with high probability"**：论文用 (*SHA-1*) 作为确定性哈希，严格说 "高概率" 不再适用。但构造一组在 SHA-1 下碰撞的键相当于 "反演/解密" SHA-1，被认为是困难的。因此把结论表述为 **"基于标准困难性假设成立"**。
>
> **为何最终不用虚拟节点**：所需虚拟节点数取决于系统规模 $N$，而 $N$ 难以预先确定。论文为简化表述放弃虚拟节点，代价是单节点负载以高概率至多超出均值 $O(\log N)$ 倍。

---

## 4. 可扩展的键定位（Scalable Key Location）

### 4.1 朴素方案的问题

只要每个节点知道自己的**后继**（successor），就能沿环传递查询直到命中——**正确但低效**，最坏需遍历全部 $N$ 个节点。为加速，Chord  引入额外路由信息：**finger table**。

> 关键设计哲学：**finger table 是为了快，successor 指针是为了对**。只要后继指针正确，查找的正确性就有保证；finger 过期只影响速度。

### 4.2 Finger Table

<div style="background-color:#e6f2ff; padding:12px 16px; border-left:5px solid #3399ff; border-radius:4px;">


**定义（finger table）**：节点 $n$ 维护一张至多 $m$ 项的路由表。第 $i$ 项（$1 \le i \le m$）指向环上**至少**领先 $n$ 距离 $2^{\,i-1}$ 的第一个节点：

$$
n.\text{finger}[i].\text{node} = \text{successor}\big((n + 2^{\,i-1}) \bmod 2^m\big)
$$

相关字段：
$$
\text{finger}[i].\text{start} = (n + 2^{\,i-1}) \bmod 2^m, \qquad 1 \le i \le m
$$

$$
\text{finger}[i].\text{interval} = \big[\,\text{finger}[i].\text{start},\; \text{finger}[i{+}1].\text{start}\,\big)
$$

每一项同时存储该节点的 Chord 标识符与 IP 地址（+端口）。第 1 个 finger 就是直接后继（successor）。

</div>

两个重要特征：

1. 每个节点只存储少量其它节点的信息，且**对环上离自己近的节点了解更多**，对远的了解少（finger 间距呈指数 $2^{i-1}$ 增长）。
2. 一个节点的 finger table **通常不足以**直接确定任意键的后继。

<div style="background-color:#ffebee; padding:12px 16px; border-left:5px solid #e53935; border-radius:4px;">


**例子（$m = 3$ 的环，节点 {0, 1, 3}，键 {1, 2, 6}）**：

- 键映射：$\text{successor}(1)=1$，$\text{successor}(2)=3$，$\text{successor}(6)=0$。

- 节点 1 的 finger table：

  | $i$  | start | interval | succ. |
  | :--: | :---: | :------: | :---: |
  |  1   |   2   | $[2,3)$  |   3   |
  |  2   |   3   | $[3,5)$  |   3   |
  |  3   |   5   | $[5,1)$  |   0   |

- 注意节点 3 的 finger table 中**没有**节点 1，所以节点 3 不能直接知道键 1 的后继——这正说明了 finger table 信息不完整的特征。

</div>

### 4.3 查找算法

当节点 $n$ 不知道键 $id$ 的后继时，它在自己的 finger table 中找到 ID **最紧邻地先于** $id$ 的节点 $f$，向 $f$ 询问。$f$ 比 $n$ 更了解 $id$ 附近的区域。如此迭代，逐步逼近目标。

```text
// 找 id 的后继
n.find_successor(id):
    n' = find_predecessor(id)
    return n'.successor

// 找 id 的前驱（join 操作也会用到，故显式实现）
n.find_predecessor(id):
    n' = n
    while id ∉ (n', n'.successor]:
        n' = n'.closest_preceding_finger(id)
    return n'

// 返回 finger table 中最接近且先于 id 的节点
n.closest_preceding_finger(id):
    for i = m downto 1:
        if finger[i].node ∈ (n, id):
            return finger[i].node
    return n
```

> 记号约定：`n.foo()` 表示在远程节点 $n$ 上执行 `foo()`（RPC）；不带前缀的是本地调用。

<div style="background-color:#ffebee; padding:12px 16px; border-left:5px solid #e53935; border-radius:4px;">


**例子（节点 3 查询 $\text{successor}(1)$）**：

1. $1$ 落在 $3.\text{finger}[3].\text{interval}$，节点 3 查第 3 项 finger → 指向节点 0。
2. 节点 0 先于 1，于是节点 3 请节点 0 去 `find_successor(1)`。
3. 节点 0 从自己的 finger table 推断出 $1$ 的后继就是节点 1 本身，返回节点 1。

</div>

### 4.4 性能分析

<div style="background-color:#e8f5e9; padding:12px 16px; border-left:5px solid #43a047; border-radius:4px;">


**推论（定理 2，查找跳数）**：在 $N$ 节点网络中，一次查找需要联系的节点数为 $O(\log N)$（w.h.p. / 基于标准困难性假设）。

</div>

**直觉证明（距离减半论证）**：设节点 $p$ 是 $id$ 的直接前驱，目标 $p$ 落在当前节点 $n$ 的第 $i$ 个 finger 区间内。该区间非空，故 $n$ 会 finger 到区间内某节点 $f$：

- $n$ 与 $f$ 的距离 $\ge 2^{\,i-1}$；
- 但 $f$ 与 $p$ 同在第 $i$ 个区间内，故二者距离 $\le 2^{\,i-1}$。

于是 $f$ 到 $p$ 的距离至多是 $n$ 到 $p$ 距离的**一半**。初始距离至多 $2^m$，故 $m$ 步内必到达。进一步在随机化假设下，$O(\log N)$ 次转发后剩余距离缩到 $2^m / N$，期望落入 1 个节点，再 $O(\log N)$ 步即命中。

> **实测路径长度 $\approx \frac{1}{2}\log_2 N$**：把节点到查询的距离写成二进制，每个为 1 的比特需要跟一次 finger，为 0 则跳过。随机距离下期望约一半比特为 1，故平均跳数约为 $\frac{1}{2}\log_2 N$。

---

## 5. 节点加入（基础版本）

动态网络中，加入/离开必须保持"能定位每个键"的能力。Chord  维护两条**不变式**：

<div style="background-color:#e6f2ff; padding:12px 16px; border-left:5px solid #3399ff; border-radius:4px;">


**定义（Chord 不变式）**：

1. 每个节点的 **successor 被正确维护**；
2. 对每个键 $k$，节点 $\text{successor}(k)$ **负责** $k$。

（为了查找**快**，还希望 finger table 正确，但这不是正确性所必需。）

</div>

为支持加入/离开，每个节点额外维护一个 **predecessor**（前驱）指针，可逆时针绕环行走。

单节点 $n$ 加入时（已知一个现有节点 $n'$）需完成三项任务：

1. **初始化** $n$ 的 predecessor 和 finger table（向 $n'$ 查询）；
2. **更新**现有节点的 finger 与 predecessor，使之反映 $n$ 的加入；
3. **通知**上层软件，迁移 $n$ 现在负责的键。

```text
// n 加入网络，n' 是网络中任意已知节点
n.join(n'):
    if (n'):
        init_finger_table(n')
        update_others()
        // 从后继处迁移 (predecessor, n] 区间的键
    else:                       // n 是网络中唯一节点
        for i = 1 to m: finger[i].node = n
        predecessor = n
```

**初始化 finger table 的优化**：朴素地对 $m$ 个 finger 各做一次 `find_successor` 需 $O(m\log N)$。利用"第 $i$ 个 finger 往往也是第 $i{+}1$ 个 finger"的性质，可把需要真正查找的 finger 数降到 $O(\log N)$，总时间 $O(\log^2 N)$。实践中还可直接向邻居要一份完整 finger table 作为提示。

<div style="background-color:#e8f5e9; padding:12px 16px; border-left:5px solid #43a047; border-radius:4px;">


**推论（定理 3，加入/离开代价）**：以高概率，任意节点加入或离开 $N$ 节点网络，需要 $O(\log^2 N)$ 条消息来重建路由不变式与 finger table。

</div>

---

## 6. 并发操作与失效（生产级机制）

基础版的"激进维护所有 finger"在大规模并发加入下难以维持。论文把**正确性**与**性能**目标分离：

- 用一个轻量的 **stabilization（稳定化）协议**专门保证 successor 指针最终正确 → 保证查找正确；
- 再用 successor 指针去**校正** finger → 让查找又快又对。

### 6.1 Stabilization

```text
n.join(n'):
    predecessor = nil
    successor = n'.find_successor(n)   // 此时还未让网络知道 n

// 每个节点周期性运行：验证后继，并告知后继自己的存在
n.stabilize():
    x = successor.predecessor
    if x ∈ (n, successor):
        successor = x
    successor.notify(n)

// n' 认为它可能是 n 的前驱
n.notify(n'):
    if predecessor is nil or n' ∈ (predecessor, n):
        predecessor = n'

// 周期性刷新随机一项 finger
n.fix_fingers():
    i = random index (>1) into finger[]
    finger[i].node = find_successor(finger[i].start)
```

<div style="background-color:#ffebee; padding:12px 16px; border-left:5px solid #e53935; border-radius:4px;">


**例子（节点 $n$ 插入 $n_p$ 与 $n_s$ 之间）**：

1. $n$ 通过 `join` 获得后继 $n_s$；
2. $n$ 调用 `notify`，$n_s$ 把前驱改为 $n$；
3. $n_p$ 下次 `stabilize` 时向 $n_s$ 问前驱，得到 $n$，于是把后继改为 $n$；
4. $n_p$ 再 `notify`，$n$ 把前驱设为 $n_p$。至此所有前驱/后继指针均正确。

</div>

**stabilization 期间的三种查找行为**：

- (常见) finger 基本最新 → $O(\log N)$ 步命中；
- (中间) successor 对但 finger 不准 → 正确但较慢；
- (最坏) successor 错或键尚未迁移 → 查找失败，上层稍后重试即可（稳定化很快修复后继）。

<div style="background-color:#e8f5e9; padding:12px 16px; border-left:5px solid #43a047; border-radius:4px;">


**推论（定理 4–6，并发加入的影响是暂时的）**：

- **定理 4**：一旦某节点能成功解析某查询，将来永远能；
- **定理 5**：最后一次加入之后的某时刻起，所有 successor 指针都正确；
- **定理 6**：稳定网络有 $N$ 个节点，再有至多 $N$ 个节点加入（finger 未建但 successor 正确），查找仍以高概率耗时 $O(\log N)$。

更一般地：只要"调整 finger 的时间 < 网络规模翻倍的时间"，查找就持续保持 $O(\log N)$ 跳。

</div>

### 6.2 失效与复制（Successor List）

节点失效的核心威胁是后继指针断裂（最坏情况下 `find_predecessor` 只靠后继也能推进）。解决办法：

<div style="background-color:#e6f2ff; padding:12px 16px; border-left:5px solid #3399ff; border-radius:4px;">


**定义（successor-list）**：每个节点维护一张包含其环上 $r$ 个最近后继的列表。当节点发现后继失效时，用列表中第一个存活项替换它；随后 stabilize 会逐步修正 finger 与列表中指向失效节点的项。

</div>

successor-list 同时方便上层做**数据复制**：把某键的数据副本存在该键之后的 $k$ 个节点上；节点掌握 $r$ 个后继的来去，从而通知上层何时传播新副本。

<div style="background-color:#e8f5e9; padding:12px 16px; border-left:5px solid #43a047; border-radius:4px;">


**推论（定理 7–8，successor-list 的鲁棒性）**：取 $r = O(\log N)$，在初始稳定的网络中让**每个节点以概率 $1/2$ 失效**，则：

- **定理 7**：`find_successor` 以高概率返回查询键的**最近存活后继**；
- **定理 8**：失效后的网络中 `find_successor` 期望耗时 $O(\log N)$。

直觉：一个节点的 $r$ 个后继全部失效的概率为 $2^{-r} = 1/N$，故节点几乎总能向其最近存活后继转发消息。

</div>

---

## 7. 仿真与实验结果

| 维度              | 结论                                                         |
| :---------------- | :----------------------------------------------------------- |
| **负载均衡**      | 无虚拟节点时键分布方差大（某些节点存 0 个键，最大可达均值 $9.1\times$）；引入 $r$ 个虚拟节点后，99 分位从 $4.8\times$ 降到 $1.6\times$，1 分位从 0 升到 $0.5\times$。代价是 finger table 空间增大 $r$ 倍。 |
| **路径长度**      | 平均 $\approx \frac{1}{2}\log_2 N$，随节点数对数增长，与定理 2 吻合。 |
| **同时失效**      | $10^4$ 节点、随机失效比例 $p$，稳定化后查找失败率 $\approx p$（即只丢失失效节点本应负责的键），无额外失败 → 对大规模同时失效鲁棒。 |
| **持续加入/失效** | 失败率对"加入/失效频率 vs 稳定化频率"敏感；500 节点、稳定化每 30 秒一次时，约 3 次失效/稳定化对应 $\sim 9\%$ 失败率。 |
| **真实部署**      | 基于 (*RON* testbed) 的 10 个美国站点、(*SHA-1*) 160 比特键、TCP、迭代式查找。中位延迟 180–285 ms；180 节点时一次查找约 5 次往返（4 次 Chord 跳 + 1 次到后继），与 60 ms 往返估算的 ~300 ms 吻合。 |

> **迭代式 vs 递归式**：迭代式由发起节点主导全部通信（仿真采用）；递归式由中间节点逐跳转发。递归式更利于"server selection"式的延迟优化。

---

## 8. 局限与未来工作

- **环分裂（partition）无专门修复机制**：分裂后的子环对稳定化可能"看起来局部一致"。检测思路：节点周期性请别人 lookup 自己，若结果不是自己则可能有分裂；或让节点长期记忆一组随机遇到过的节点。
- **恶意/有 bug 的参与者**可呈现错误的环视图。若数据本身经密码学认证，则这只威胁**可用性**而非**真实性**。要求节点 ID 由其 IP 的 SHA-1 派生，可增加"插入紧邻目标键的节点来劫持数据"这类攻击的难度。
- **降低跳数**：把 finger 间距从 $2$ 的幂改为 $(1+1/d)$ 的整数次幂，可把跳数降到 $O(\log_{1+1/d} N)$，代价是 finger 数增加到约 $O(d\log N)$。
- **降低延迟**：每个 finger 项指向区间内前 $k$ 个节点，测量网络时延后转发给最低延迟者（递归式更有效）。

---

## 9. 一句话总结

Chord  用**一致性哈希 + 指数间距的 finger table + 稳定化协议**，在完全去中心、节点频繁来去的环境中，以**每节点 $O(\log N)$ 状态、每次查找 $O(\log N)$ 消息**的代价，提供了一个"给键 → 找负责节点"的、**可证明正确且性能可证明、并优雅降级**的查找原语。

---

### 附：核心符号速查

| 符号                            | 含义                                              |
| :------------------------------ | :------------------------------------------------ |
| $N$                             | 节点数                                            |
| $K$                             | 键数                                              |
| $m$                             | 标识符比特数（实现中 160）                        |
| $2^m$                           | 标识符环大小（模数）                              |
| $\text{successor}(k)$           | 顺时针紧随 $k$ 的第一个节点                       |
| $\text{finger}[i].\text{start}$ | $(n + 2^{\,i-1}) \bmod 2^m$                       |
| $\text{finger}[i].\text{node}$  | $\text{successor}(\text{finger}[i].\text{start})$ |
| $r$                             | successor-list 长度，取 $O(\log N)$               |