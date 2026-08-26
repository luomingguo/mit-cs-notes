---
title: GKR 协议
type: lecture
lecture: 16
tags: []
status: complete
---
# Lec 18 GKR 协议

> MIT 6.5610 · Lecture 18 · 关键词：GKR、可验证计算、电路求值、逐层 sumcheck、多线性扩展、对数空间验证者
> *说明：以标准处理撰写（Goldwasser–Kalai–Rothblum 2008），要点与本课"GKR Protocol"一致。*

---

## 0. 目标

把一个**分层算术电路**的求值结果交给验证者，让其以**远低于重新计算**的代价确信结果正确——"委托计算（delegating computation）"。GKR 让验证者工作量近似与电路**深度**成正比、而非电路规模，且无需密码假设（信息论安全的交互证明）。

---

## 1. 设置：分层算术电路

电路有 $d$ 层，每层是 $\mathbb{F}$ 上的加法/乘法门。第 $i$ 层的值由第 $i+1$ 层决定。把每层的值看成函数 $W_i:\{0,1\}^{k_i}\to\mathbb{F}$（输入是门的二进制编号），取其**多线性扩展（*multilinear extension, MLE*）** $\widetilde{W}_i$ 延拓到整个 $\mathbb{F}^{k_i}$。

> 🔎 **MLE 唯一性**：布尔超立方上的任意函数有唯一的多线性扩展。把"层的值表"提升为低次多项式，正是为了能用 sumcheck（L15）这类多项式工具去验证。

---

## 2. 核心：逐层归约 + Sumcheck

::: theorem
**GKR 主循环**
对每一层 $i$，相邻层之间满足一条 **"布线恒等式"**：
$$\widetilde{W}_i(z) = \sum_{u,v\in\{0,1\}^{k_{i+1}}} \Big(\widetilde{\mathrm{add}}_i(z,u,v)\big(\widetilde{W}_{i+1}(u)+\widetilde{W}_{i+1}(v)\big) + \widetilde{\mathrm{mult}}_i(z,u,v)\,\widetilde{W}_{i+1}(u)\widetilde{W}_{i+1}(v)\Big),$$
其中 $\widetilde{\mathrm{add}}_i,\widetilde{\mathrm{mult}}_i$ 是描述布线（哪个门连哪两个门）的"布线谓词"多项式。
- 对该求和跑一次 **sumcheck**：把"验证第 $i$ 层在随机点 $z$ 的值"**归约为**"验证第 $i+1$ 层在两个随机点 $u,v$ 的值"。
:::

> 🔎 **逐层下推**：验证者从**输出层**（它能直接看到声称的输出）开始，用 sumcheck 把对第 $i$ 层的信任，转化为对更靠近输入的第 $i+1$ 层在某随机点取值的信任；一层层推到**输入层**，验证者对输入有完整访问，可**自行单点求值** $\widetilde{W}_d$ 完成最终核对。每层一次 sumcheck，可靠性由 Schwartz–Zippel 累积控制。

（两点 $u,v$ 通常用一条直线 + "reduce-to-one-point"技巧合并成单点，避免点数指数膨胀。）

---

## 3. 复杂度与意义

- **验证者**：$O(d\cdot\mathrm{polylog}\,|C|)$ —— 与电路深度 $d$、对数规模成正比，**远小于** $|C|$。
- **证明者**：$O(|C|)$（精心实现可做到线性）。
- **轮数**：$O(d\cdot\log|C|)$。
- **信息论安全**：无需任何密码假设（可用 Fiat–Shamir 去交互后再变成密码假设下的非交互论证）。

::: definition
**完备性**：诚实证明者必通过。
**可靠性**：错误结果通过概率 $\le O(d\cdot\deg/|\mathbb{F}|)$，大域下可忽略。
:::

---

## 4. 工程视角

> - GKR 是"**结构化计算的高效可验证外包**"代表：把可表示为浅而规则电路的计算（如某些 ML 推理、数据并行任务）委托给不可信方并廉价验证。
> - 是许多现代 SNARK（如基于 sumcheck 的 Spartan/Hyrax/Libra）的骨架；配合多项式承诺即得简洁论证。
> - 局限：要求电路**分层、规则**（布线谓词可低次表示）；非结构化电路 GKR 优势减弱。

---

## 5. 本讲小结

- GKR 验证分层算术电路求值，验证者代价 ~ 深度而非规模。
- 每层一条 add/mult 布线恒等式 → 一次 sumcheck，把"信任本层"下推为"信任下一层随机点"。
- 推到输入层时验证者自行求值收尾；信息论安全。
- 现代 sumcheck 系 SNARK 的核心。
