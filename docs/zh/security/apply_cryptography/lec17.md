---
title: zk-SNARKs
course: 6.5610 应用密码学与安全（Spring 2026）
course_id: '6.5610'
lecture: 17
kind: theory
tags: []
status: complete
---
# Lec 19 zk-SNARKs

> MIT 6.5610 · Lecture 19 · 关键词：SNARK、简洁性、算术电路化（R1CS/QAP）、多项式承诺、Fiat–Shamir、可信设置、zk
> *说明：以标准处理撰写，要点与本课"zk-SNARKs"一致。*

---

## 0. 是什么

**zk-SNARK** = Zero-Knowledge **S**uccinct **N**on-interactive **AR**gument of **K**nowledge：

| 字母 | 含义 |
|------|------|
| ZK | 零知识：不泄露见证 $w$ |
| Succinct | 证明**极短**（常数/对数级）、验证**极快**（与计算规模无关或对数级） |
| Non-interactive | 单条证明，无需来回交互 |
| ARgument | 计算可靠（对**计算受限**的作弊者可靠，弱于无条件 soundness 的"proof"） |
| of Knowledge | 不仅命题真，证明者**确实持有**见证（可抽取） |

目标：对"我知道满足某电路 $C(x,w)=1$ 的见证 $w$"出具一个**任何人都能快速验证、却不泄露 $w$、且体积远小于重算 $C$** 的证明。

---

## 1. 流水线：算术电路化 → 多项式 → 承诺

::: theorem
**典型 SNARK 三段式**
1. **算术化（arithmetization）**：把计算 $C$ 编码为代数约束系统，如 **R1CS**（一组 $\langle a_i,z\rangle\cdot\langle b_i,z\rangle=\langle c_i,z\rangle$）或进一步转成 **QAP**（多项式整除关系 $A(X)B(X)-C(X)=H(X)Z(X)$）。"计算正确" ⟺ "某多项式恒等成立"。
2. **交互式 oracle 证明**：用 sumcheck（L15）/ PCP 类协议，让验证者通过**少数随机点求值**检验多项式恒等（Schwartz–Zippel：错误恒等在随机点几乎必露馅）。
3. **多项式承诺（*polynomial commitment*）**：证明者先**承诺**到多项式（KZG / IPA / FRI / Merkle），之后在挑战点"打开"求值并证明打开正确 —— 这把"oracle 求值"落实为可验证的密码操作，同时压缩证明体积。
:::

---

## 2. 去交互与零知识

- **Fiat–Shamir（L11）**：把验证者的随机挑战换成 $H(\text{transcript})$，在随机预言机模型下变成**非交互**证明。
- **零知识**：在承诺/打开中加入随机盲化（blinding），使证明对 $w$ 不泄露——验证者只看到"恒等成立"，看不到具体见证。

---

## 3. 设置假设与家族

::: example
**几类主流方案**
- **Groth16**：基于配对（pairing）+ **电路相关的可信设置（trusted setup）**，证明极短（~3 群元素），验证极快；但每个电路需一次 setup。
- **PLONK / Marlin**：**通用可信设置**（一次 setup 多电路复用）。
- **STARK / Bulletproofs**：**无可信设置**（透明），抗量子（STARK 基于哈希），代价是证明更大。
:::

> ⚠️ **可信设置的"有毒废料"**：Groth16/PLONK 的 setup 会产生秘密随机数，若泄露可**伪造证明**，故需多方仪式（MPC ceremony）销毁。透明方案（STARK/Bulletproofs）避开此风险。

---

## 4. 工程视角

> - 应用：**zk-rollup**（链下计算、链上只验小证明，扩容）、隐私支付（Zcash）、隐私身份/合规证明（证明"满足 KYC/年龄"而不暴露数据）、可验证外包计算。
> - 选型：要最短证明/最快验证 → Groth16；要无可信设置/抗量子 → STARK；要通用 setup 平衡 → PLONK。
> - 成本：证明者**很重**（生成证明慢、内存大），验证**很轻**——典型"证明贵、验证廉"的非对称，正适合"一次证明、多次/链上验证"场景。
> - 与 GKR（L18）/ sumcheck（L15）关系：它们提供 SNARK 的"信息论核心"，再叠加多项式承诺 + Fiat–Shamir 即成完整 zk-SNARK。

---

## 5. 本讲小结

- zk-SNARK = 零知识 + 简洁 + 非交互 + 知识论证。
- 流水线：算术化（R1CS/QAP）→ 多项式恒等 + 随机点检验 → 多项式承诺 → Fiat–Shamir 去交互 + 盲化做 ZK。
- 家族取舍：Groth16（短证明/电路相关 setup）、PLONK（通用 setup）、STARK（透明/抗量子）。
- 证明贵、验证廉；可信设置需多方仪式销毁毒废料。
