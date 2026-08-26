---
title: 非流水线处理器
type: lecture
lecture: 5
tags: []
status: complete
---
# Lec 5 非流水线处理器
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Arvind · 日期：2024-02-20

## 1. RISC-V 指令集概述

::: definition
**定义 — RISC-V（*Reduced Instruction Set Computer V*）**

RISC-V 是一个开放的精简指令集（*ISA*），本课程使用 RV32I（32 位整数基础子集）。寄存器 x0 恒为 0；31 个通用寄存器（x1–x31）；PC（程序计数器）；所有指令定长 32 位。
:::

**主要指令格式**：
- **R 型**：`add rd, rs1, rs2`——寄存器-寄存器运算
- **I 型**：`addi rd, rs1, imm`——立即数运算；`lw rd, imm(rs1)`——加载
- **S 型**：`sw rs2, imm(rs1)`——存储
- **B 型**：`beq rs1, rs2, offset`——条件跳转
- **J 型**：`jal rd, offset`——无条件跳转并链接

---

## 2. 指令执行的五个阶段

::: definition
**定义 — 五阶段执行（*Five-Stage Execution*）**

每条指令按顺序经历：取指（*Fetch, IF*）→ 译码（*Decode, ID*）→ 执行（*Execute, EX*）→ 访存（*Memory, MEM*）→ 写回（*Writeback, WB*）。非流水线处理器中这五步串行完成，CPI（每指令周期数）约为 5。
:::

---

## 3. BSV 非流水线实现

### 3.1 状态元素

```bsv
Reg#(Addr)                    pc  <- mkReg(0);
RegisterFile#(RIndx, Data)    rf  <- mkRegFileFull;
Memory                       mem  <- mkMemory;
```

### 3.2 单规则实现

```bsv
rule doInst;
    // 1. Fetch
    Data inst = mem.req(MemReq{op: Ld, addr: pc, data: ?});
    
    // 2. Decode
    DecodedInst dInst = decode(inst);
    
    // 3. Register Read
    Data rVal1 = rf.rd1(dInst.src1);
    Data rVal2 = rf.rd2(dInst.src2);
    
    // 4. Execute
    ExecInst eInst = exec(dInst, rVal1, rVal2, pc);
    
    // 5. Memory Access
    if (eInst.iType == Ld) eInst.data = mem.req(MemReq{op:Ld, addr:eInst.addr, ...});
    if (eInst.iType == St) mem.req(MemReq{op:St, addr:eInst.addr, data:eInst.data});
    
    // 6. Writeback
    if (isValid(eInst.dst)) rf.wr(fromMaybe(?,eInst.dst), eInst.data);
    
    // 7. PC Update
    pc <= eInst.nextPc;
endrule
```

::: theorem 推论 — 单规则的局限性
单规则实现清晰但低效：每条指令独占整个处理器 1 个或多个时钟周期（取决于存储器延迟），硬件利用率低。流水线将各阶段并行化，使 CPI 趋近于 1。
:::

---

## 4. 执行函数（exec）

```bsv
function ExecInst exec(DecodedInst dInst, Data rVal1, Data rVal2, Addr pc);
    ExecInst eInst = ?;
    eInst.iType = dInst.iType;
    
    Data aluVal2 = (dInst.iType == Alu) ? rVal2 : signExtend(dInst.imm);
    eInst.data = alu(rVal1, aluVal2, dInst.aluFunc);
    
    eInst.addr  = rVal1 + signExtend(dInst.imm);  // 存储/加载地址
    eInst.nextPc = (brTaken) ? pc + signExtend(dInst.imm) : pc + 4;
    eInst.dst   = dInst.dst;
    return eInst;
endfunction
```

---

## 5. 性能分析

::: example 例题 — CPI 计算

:::

假设指令存储器（I-Mem）和数据存储器（D-Mem）各需 1 周期（理想化），则：
- 所有指令：取指 1 周期 + 执行 1 周期 = **2 周期**（无访存）
- 加载/存储指令：+ 访存 1 周期 = **3 周期**

Sol：若 30% 指令为加载/存储，则平均 $\text{CPI} = 0.7 \times 2 + 0.3 \times 3 = 2.3$。

---

## 6. 处理器测试

**RISC-V 测试套件**：标准测试程序（`rv32ui-p-*`）验证每条指令的正确性，通过向特殊地址写入 `1`（pass）或错误码（fail）来报告结果。

```bsv
if (req.addr == 'hf000_fff8) begin
    if (req.data == 0) $fdisplay(stderr, "PASS");
    else $fdisplay(stderr, "FAIL (%0d)", req.data);
    $finish;
end
```

---

## 本讲小结

RISC-V RV32I 提供简洁的 32 位指令集；非流水线处理器用单规则实现所有执行阶段，CPI 约 2–3，硬件利用率低；exec 函数统一处理 ALU、分支和存储器地址计算；性能瓶颈为各阶段串行执行，流水线是提升的核心方向。
