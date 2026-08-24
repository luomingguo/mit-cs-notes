---
title: 分支预测
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
lecture: 8
kind: system
tags: []
status: complete
---
# Lec 8 分支预测
> MIT 6.1920 · Constructive Computer Architecture
> 讲师：Thomas Bourgeat / Arvind · 日期：2024-03-19

## 1. 分支指令频率与代价

::: definition
**定义 — 控制流惩罚（*Control Flow Penalty*）**

处理器在 Execute 阶段才能确定分支目标，而 Fetch 阶段每周期都必须提供下一条指令地址。若流水线有 $D$ 级在 Execute 之前，每次预测失败将白白执行 $D$ 条错误路径指令，造成 $D$ 周期惩罚。
:::

统计数据（Blem et al.，SPEC INT/FP 2006）：
- ARM Cortex-A7 整数负载：每 12 条指令中有 1 条分支
- x86 整数负载：每 10–11 条指令中有 1 条分支
- 浮点负载：每 8–27 条指令中有 1 条分支

---

## 2. RISC-V 分支指令分类

| 指令 | 方向已知时机 | 目标已知时机 |
|------|-----------|-----------|
| `JAL` | Decode（无条件） | Decode（PC 相对）|
| `JALR` | Decode（无条件） | Execute（寄存器）|
| `BEQ/BNE/...` | Execute（条件） | Decode（PC 相对）|

---

## 3. 分支目标缓冲区（*Branch Target Buffer, BTB*）

::: definition
**定义 — BTB（*Branch Target Buffer*）**

BTB 是一个小型缓存，记录历史上发生过跳转的指令的（PC → 目标 PC）映射。Fetch 阶段查询 BTB，若命中则用预测目标地址替代 PC+4；命中率很高，即使容量很小（因常跳转的指令反复被预测）。
:::

BSV 接口：

```bsv
interface AddrPred;
    method Addr nap(Addr pc);                               // Next Address Prediction
    method Action update(Addr pc, Addr nextPC, Bool taken); // 训练
endinterface
```

**更新策略**：
- 分支 taken → 用（pc, nextPC）更新 BTB
- 分支 not-taken → 删除 BTB 中该 pc 的条目

```bsv
module mkBtb(AddrPred);
    RegFile#(BtbIndex, Addr) ppcArr <- mkRegFileFull;
    RegFile#(BtbIndex, BtbTag) tagArr <- mkRegFileFull;
    Vector#(BtbEntries, Reg#(Bool)) validArr <- replicateM(mkReg(False));
    ...
endmodule
```

---

## 4. 方向预测：分支历史表（*Branch History Table, BHT*）

::: definition
**定义 — BHT（*Branch History Table*）**

BHT 是一个大型表（4K 项），每项存 2 位饱和计数器（*saturating counter*），记录该分支历史上更多 taken（≥10）还是 not-taken（≤01）。BHT 在 Decode 阶段使用（指令类型已知），可将预测准确率提高到 80–90%。
:::

**2 位饱和计数器状态机**：

$$\text{强不跳}(00) \leftrightarrow \text{弱不跳}(01) \leftrightarrow \text{弱跳}(10) \leftrightarrow \text{强跳}(11)$$

- 连续两次 not-taken 才从"弱跳"改为"不跳"（迟滞性 *hysteresis* 减少误翻转）

::: example 例题 — 1 位 vs. 2 位预测器循环分析

:::

循环分支：99 次 taken，1 次 not-taken，再循环。

- **1 位预测器**：每次循环出错 **2 次**（退出时预测 taken，进入时预测 not-taken）
- **2 位预测器**：每次循环出错 **1 次**（仅退出时出错，下次进入循环时计数器已恢复）

Sol：2 位预测器对循环类模式显著优于 1 位。

---

## 5. 多预测器流水线集成

**4 级流水线带 BTB + BHT 设计**：
- Fetch：查 BTB → `ppcF = btb.nap(pc)`
- Decode：查 BHT → 若方向预测与 BTB 不一致，更新 dEp 并重定向
- Execute：验证并训练 BTB/BHT

**双纪元（*Dual Epoch*）机制**：
- `eEp`：Execute 重定向计数
- `dEp`：Decode 重定向计数
- Execute 的重定向优先级高于 Decode（Execute 得到的是精确结果）

```bsv
// Decode 阶段：先检查 eEp，再检查 dEp
if (eEp[1] != ieEp) // Execute 已经重定向了，丢弃
else if (dEp[0] != idEp) // Decode 自身重定向了，丢弃
else // 正常指令，咨询 BHT
```

---

## 6. 返回地址栈（*Return Address Stack, RAS*）

::: definition
**定义 — RAS（*Return Address Stack*）**

JALR 用于函数返回时，其目标是运行时才确定的调用点地址，BTB 难以预测（同一函数被多处调用）。RAS 是一个硬件小栈：调用函数时 push PC+4，返回（JALR）时 pop 预测目标，准确率极高。
:::

---

## 7. 两级分支预测（*Two-Level Branch Predictor*）

利用历史相关性（*spatial correlation*）：用最近 N 条分支的方向（全局历史寄存器 *Global History Register*）作为 BHT 索引，比单用 PC 更准确：

$$\text{BHT 索引} = \text{PC}[k:0] \oplus \text{GHR}[N-1:0]$$

Pentium Pro 用最近 2 条分支历史，准确率约 95%。

::: theorem 推论 — 分支预测的本质
分支预测本质上是「记住过去」：识别（PC, 上下文历史）组合，这足以预测绝大多数分支。不可预测分支（如密码学中的数据驱动跳转）仍是安全漏洞的来源（Spectre 攻击）。
:::

---

## 本讲小结

BTB 在 Fetch 阶段提供目标地址预测；BHT 在 Decode 阶段提供方向预测；双纪元机制保证多预测器的重定向优先级正确；RAS 专门优化函数返回；两级预测器利用历史相关性进一步提升精度。现代处理器通常组合三种以上预测器，总体准确率超过 97%。
