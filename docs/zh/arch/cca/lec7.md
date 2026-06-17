# Lec 07 高速缓存与存储缓冲区
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind / Thomas Bourgeat · 日期：2024-03-07

## 1. 存储器层次结构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 存储器层次（<em>Memory Hierarchy</em>）</strong><br>
$$\text{容量}：\text{RegFile} \ll \text{SRAM（Cache）} \ll \text{DRAM}$$
$$\text{延迟}：\text{RegFile} \ll \text{SRAM} \ll \text{DRAM}$$
处理器通过利用<strong>时间局部性</strong>（<em>temporal locality</em>）和<strong>空间局部性</strong>（<em>spatial locality</em>）将热数据保留在快速 SRAM（缓存）中。</div>

**缓存命中（*hit*）**：数据在缓存中，低延迟返回。  
**缓存缺失（*miss*）**：数据不在缓存，需访问 DRAM，高延迟。

---

## 2. 直接映射缓存（*Direct-Mapped Cache*）

地址字段划分（字节地址，行大小为 $2^L$ 字）：

$$\underbrace{[31 \quad \cdots \quad L+\log_2 N+2]}_{\text{Tag}} \underbrace{[L+\log_2 N+1 \quad \cdots \quad L+2]}_{\text{Index}} \underbrace{[L+1 \quad \cdots \quad 2]}_{\text{Offset}} \underbrace{[1 \quad 0]}_{\text{字节}}$$

```bsv
function CacheIndex getIndex(Addr addr) = truncate(addr >> (2 + valueOf(logLineSz)));
function CacheTag   getTag(Addr addr)   = truncateLSB(addr);
```

**缺陷**：步长 = 缓存大小的访问模式会产生大量冲突缺失（*conflict miss*）。

---

## 3. 阻塞缓存 BSV 实现

### 3.1 状态元素

```bsv
BRAM2Port#(...)     dataArray;    // 数据
BRAM1Port#(...)     tagArray;     // 标签
RegFile#(...)       dirtyArray;   // 脏位（写回策略）
FIFO#(Data)         hitQ    <- mkBypassFIFO;
Reg#(MemReq)        missReq <- mkRegU;
Reg#(ReqStatus)     mshr    <- mkReg(Ready);
FIFO#(MemReq)       memReqQ <- mkFIFO;
FIFO#(Line)         memRespQ <- mkFIFO;
```

### 3.2 缺失状态机

$$\text{Ready} \to \text{StartMiss} \to \text{SendFillReq} \to \text{WaitFillResp} \to \text{Ready}$$

```bsv
rule startMiss (mshr == StartMiss);
    // 若该槽有脏数据，先写回 DRAM
    if (tag valid && line dirty) memReqQ.enq(storeReq);
    mshr <= SendFillReq;
endrule

rule sendFillReq (mshr == SendFillReq);
    memReqQ.enq(missReq);   mshr <= WaitFillResp;
endrule

rule waitFillResp (mshr == WaitFillResp);
    let data = memRespQ.first; memRespQ.deq;
    // 更新 tagArray, dataArray, dirtyArray
    if (missReq.op == Ld) hitQ.enq(extractWord(data, missReq.addr));
    mshr <= Ready;
endrule
```

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 阻塞 vs. 非阻塞缓存</strong>　阻塞缓存（<em>blocking cache</em>）一次只处理一个缺失；非阻塞缓存（<em>non-blocking cache</em>）可在等待缺失响应时继续处理命中，显著提升内存并发度，但 BSV 实现更复杂（需 MSHR 队列）。</div>

---

## 4. 写策略

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 写回 vs. 写穿（<em>Write-Back vs. Write-Through</em>）</strong><br>
<ul style="margin:4px 0; padding-left:20px;">
<li><strong>写回（<em>Write-Back</em>）</strong>：写操作只更新缓存，标记为"脏"；置换时才写回 DRAM。节省带宽，需要脏位数组。</li>
<li><strong>写穿（<em>Write-Through</em>）</strong>：每次写操作同时写缓存和 DRAM。实现简单，无需脏位，但带宽消耗大。</li>
</ul></div>

写缺失策略：
- **写缺失分配（*Write-Miss Allocate*）**：缺失时先把行取入缓存，再写。（配合写回使用）
- **写缺失不分配（*Write-Miss No-Allocate*）**：缺失时直接写 DRAM，不取行入缓存。（配合写穿使用）

---

## 5. 存储缓冲区（*Store Buffer, STB*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 存储缓冲区（<em>Store Buffer</em>）</strong><br>
存储缓冲区是处理器与 L1 之间的队列，Store 指令先进入 STB，处理器继续执行；STB 在后台将最旧的 Store 写入 L1 或 DRAM。Load 指令先搜索 STB（取最近匹配），再查 L1。</div>

**STB 加速原理**：Store 不直接等待 L1 缺失处理，延迟被隐藏。

```bsv
// Req 方法中
if (r.op == Ld) begin
    let x = stb.search(r.addr);
    if (isValid(x)) hitQ.enq(x);  // STB 命中
    else // 查 L1 ...
end else   // Store
    stb.enq(r.addr, r.data);      // 进入 STB
```

---

## 6. 组相联缓存（*Set-Associative Cache*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — N 路组相联（<em>N-Way Set-Associative</em>）</strong><br>
N 路组相联 = N 个直接映射缓存并联。一个地址映射到唯一的"组"（<em>set</em>），但可以存放在组内 N 个"路"（<em>way</em>）的任意一个。通过并行比较 N 个标签来减少冲突缺失，置换策略常用 LRU（<em>Least Recently Used</em>）。</div>

比较：

| 类型 | 冲突缺失 | 标签比较 | 面积 |
|------|---------|---------|------|
| 直接映射 | 多 | 1 路 | 小 |
| N 路组相联 | 少 | N 路并行 | 中 |
| 全相联 | 极少 | 全部并行 | 大 |

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 缓存参数计算</strong></div>

32KB 直接映射缓存，行大小 16 字节（4 字），32 位地址：
- 行数 = 32K/16 = 2048 = $2^{11}$，Index 位数 = 11
- Offset 位数 = $\log_2 16 = 4$
- Tag 位数 = 32 - 11 - 4 = 17

Sol：每个缓存行需额外存储 17 位 Tag + 1 位 Valid + 1 位 Dirty。

---

## 本讲总结

缓存通过时间/空间局部性加速访存；阻塞缓存用四状态 MSHR 状态机处理缺失；写回策略节省带宽但需脏位；存储缓冲区将 Store 延迟隐藏在后台；组相联通过多路并行查找消除冲突缺失，是现代处理器的标准配置。
