# Lec 06 流水线处理器
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-02-22

## 1. 流水线的动机

$$\text{Time} = \frac{\text{Instructions}}{\text{Program}} \times \frac{\text{Cycles}}{\text{Instruction}} \times \frac{\text{Time}}{\text{Cycle}}$$

非流水线处理器 CPI ≈ 2–3；流水线目标：CPI → 1，使各阶段硬件同时忙碌。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 4 级流水线（<em>4-Stage Pipeline</em>）</strong><br>
将指令执行分为 4 个流水级，每级用级间寄存器（<em>pipeline register</em>）暂存中间结果：<br>
<strong>Fetch（IF）→ Decode（ID）→ Execute（EX）→ Writeback（WB）</strong><br>
访存（MEM）并入 Execute 或 Writeback 阶段。</div>

---

## 2. BSV 4 级流水线结构

### 2.1 级间 FIFO

```bsv
FIFO#(Fetch2Decode)   f2d <- mkPipelineFIFO;
FIFO#(Decode2Execute) d2e <- mkPipelineFIFO;
FIFO#(Maybe#(Exec2WB)) e2w <- mkPipelineFIFO;
```

### 2.2 各级规则

```bsv
rule fetch;
    iMem.enq(pc[1]);
    f2d.enq(Fetch2Decode{pc: pc[1], epoch: epoch[1]});
    pc[1] <= pc[1] + 4;
endrule

rule decode;
    let inst = iMem.first; iMem.deq;
    let x = f2d.first;   f2d.deq;
    let dInst = decode(inst);
    d2e.enq(Decode2Execute{dInst, pc: x.pc, epoch: x.epoch, ...});
endrule

rule execute;
    let x = d2e.first; d2e.deq;
    if (x.epoch != epoch[0])
        e2w.enq(Invalid);     // 冲刷无效指令
    else begin
        let eInst = exec(x.dInst, rVal1, rVal2, x.pc);
        if (mispredicted) begin pc[0] <= correct_pc; epoch[0] <= epoch[0]+1; end
        e2w.enq(Valid(Exec2WB{eInst, pc: x.pc}));
    end
endrule

rule writeback;
    let vx = e2w.first; e2w.deq;
    if (vx matches tagged Valid .x) begin
        if (isValid(x.eInst.dst)) rf.wr(...);
        if (x.eInst.iType == Ld) dMem.deq;
    end
    sb.remove;
endrule
```

---

## 3. 数据冒险（*Data Hazard*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 读后写冒险（<em>RAW Hazard, Read-After-Write</em>）</strong><br>
当指令 i2 的源寄存器与尚未写回的指令 i1 的目标寄存器相同时，出现 RAW 冒险。若不处理，i2 将读到旧值。</div>

### 3.1 计分板（*Scoreboard*）

用于跟踪"哪些寄存器正在被流水线中的指令写"：

```bsv
interface Scoreboard;
    method Action insert(Maybe#(RIndx) dst);   // 指令进入 Decode 时登记
    method Action remove;                        // 指令完成 Writeback 时释放
    method Bool search1(Maybe#(RIndx) src);     // 检查 src 是否"脏"
    method Bool search2(Maybe#(RIndx) src);
endinterface
```

Decode 阶段检查冒险：

```bsv
let stall = sb.search1(dInst.src1) || sb.search2(dInst.src2);
if (!stall) begin
    sb.insert(dInst.dst);
    d2e.enq(...);
    f2d.deq; iMem.deq;
end  // stall: 不 deq，保持 f2d 和 iMem 不动
```

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 旁路（<em>Bypassing / Forwarding</em>）</strong>　计分板 stall 会降低 CPI。旁路网络（forwarding network）将 EX/MEM 阶段的计算结果直接送回 Decode 或 Execute 阶段作为源操作数，消除大多数 RAW stall，使 CPI 接近 1。</div>

---

## 4. 控制冒险（*Control Hazard*）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 控制冒险与 Epoch（<em>Control Hazard & Epoch</em>）</strong><br>
分支/跳转指令在 Execute 阶段才确定真实目标，而 Fetch 已提前取了下一条指令。若预测错误，需<strong>冲刷（flush）</strong>流水线中错误路径上的指令。BSV 用<strong>纪元计数器（epoch）</strong>标记每条指令所属时代，Execute 检测到错误预测时递增 epoch，后续各级遇到旧 epoch 的指令直接丢弃。</div>

冲刷机制流程：
1. Execute 发现 ppc ≠ 真实 nextPc
2. `pc[0] <= correct_pc; epoch[0] <= epoch[0] + 1;`
3. Decode / Writeback 中旧 epoch 指令 → `e2w.enq(Invalid)`
4. 计分板也需同步清理

---

## 5. 流水线性能

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 流水线 CPI 估算</strong></div>

假设：分支占 20%，预测全部 pc+4，分支实际 taken 60%；无 RAW stall（假设有旁路）：
- 分支错误率 = 20% × 60% = 12%
- 每次分支错误冲刷 3 条指令（4 级流水）
- CPI = $1 + 0.12 \times 3 = 1.36$

Sol：提升分支预测精度（加 BTB、BHT）可将 CPI 降低至接近 1。

---

## 本讲总结

4 级 BSV 流水线通过级间 FIFO 和 epoch 机制实现正确的指令执行；计分板防止 RAW 冒险；epoch 机制处理控制冒险；旁路网络消除 stall，是提升 CPI 的关键硬件投入。
