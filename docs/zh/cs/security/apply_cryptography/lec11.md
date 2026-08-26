---
title: 交互式证明与零知识
type: lecture
lecture: 11
tags: []
status: complete
---
# Lec 11 交互式证明与零知识

> MIT 6.5610 · Lecture 11 · 关键词：交互式证明、完备性/可靠性、零知识、模拟器、Σ 协议、Schnorr、Fiat–Shamir
> *说明：以标准处理撰写（GMR 1985），要点与本课"Interactive Proofs & Zero-Knowledge"一致。*

---

## 0. 主线

证明者 $P$ 想让验证者 $V$ 相信某命题为真，**却不泄露任何额外信息**——尤其不泄露"为什么真"（如不暴露秘密见证 $w$）。这就是**零知识（*zero-knowledge, ZK*）**。

---

## 1. 交互式证明（Interactive Proof）

$P$ 与 $V$ 多轮交互；$V$ 多项式时间、可掷币。对语言 $L$：

::: definition
**完备性（Completeness）**：$x\in L$ 时，诚实 $P$ 能让 $V$ 接受（概率 $\ge 1-\mathrm{negl}$）。
**可靠性（Soundness）**：$x\notin L$ 时，**任何**（作弊）$P^*$ 让 $V$ 接受的概率 $\le \mathrm{negl}$（或某小常数，可由重复放大）。
:::

> 🔎 与 NP 证明的区别：NP 是**单向、静态**证书；交互式证明引入**随机性 + 交互**，能证明更广的语言（IP = PSPACE），且为零知识打开空间。

---

## 2. 零知识：模拟器范式

如何形式化"没泄露额外信息"？

::: definition
**零知识（Simulator paradigm）**：存在多项式时间**模拟器（*simulator*）** $S$，**不知道见证 $w$**，却能生成与"真实 $P$-$V$ 交互记录（view）"**不可区分**的对话。
:::

> 🔎 **直觉**：若验证者看到的一切都能由一个不知道秘密的模拟器自行伪造出来（且无法区分），那么这段交互对验证者就是"无信息增量"的——它本可以自己脑补。这是密码学最优雅的定义之一。
> 区分强度：完美 ZK（分布相同）/ 统计 ZK / 计算 ZK（计算不可区分）。

---

## 3. 经典例子

::: example
**图同构 ZK（直觉版）**
命题："$G_0, G_1$ 同构"，见证 = 同构映射 $\pi$。
1. $P$ 随机置换得 $H=\sigma(G_0)$，发 $H$（承诺）。
2. $V$ 掷币 $b\in\{0,1\}$，要求 $P$ 给出 $H$ 到 $G_b$ 的同构。
3. $P$ 回应（$b=0$ 给 $\sigma$，$b=1$ 给 $\sigma\circ\pi^{-1}$）。
- **可靠性**：若 $G_0\not\cong G_1$，作弊者无法同时应对两个挑战，每轮被抓概率 $\ge 1/2$，重复放大。
- **零知识**：模拟器先猜 $b$，构造能回答该 $b$ 的 $H$；猜错就重来。无需知道 $\pi$。
:::

---

## 4. Σ 协议与 Schnorr 身份认证

**三步式（commit–challenge–response）**结构称 **Σ 协议**。典范是 **Schnorr**（证明知道离散对数 $x$ 使 $h=g^x$）：

::: theorem
**Schnorr 协议**
1. $P$ 选随机 $r$，发承诺 $a=g^r$。
2. $V$ 发随机挑战 $c$。
3. $P$ 回 $z=r+cx$。$V$ 验 $g^z \stackrel?= a\cdot h^c$。
:::

- **特殊可靠性**：对同一 $a$ 的两个不同挑战 $(c,z),(c',z')$ 可**抽取**出 $x=\frac{z-z'}{c-c'}$（知识抽取器）→ 证明者"确实知道" $x$（*proof of knowledge*）。
- **honest-verifier ZK**：模拟器先选 $z,c$，反算 $a=g^z h^{-c}$，分布正确。

---

## 5. Fiat–Shamir：去交互

把交互式 Σ 协议变成**非交互**（NIZK / 签名）：用哈希函数生成挑战
$$c = H(\text{statement} \,\|\, a).$$

> 🔎 在**随机预言机模型**下，$H$ 替代了验证者的随机挑战，证明者无法预先操纵 → 可靠性保持。这把 Schnorr 变成 **Schnorr 签名**（消息也喂进哈希），是 EdDSA 等现代签名的基础，也是 zk-SNARK（L19）去交互的关键工具。

---

## 6. 工程视角

> - ZK 应用：隐私身份/凭证（证明"我已成年"而不暴露生日）、隐私区块链（zk-rollup）、可验证计算、防作弊审计。
> - Σ + Fiat–Shamir 是落地最轻量的路径；复杂命题用 zk-SNARK/STARK（L19）。
> - ⚠️ Fiat–Shamir 必须把**完整上下文**喂进哈希（statement + 所有公开参数），否则会出现"weak Fiat–Shamir"漏洞。

---

## 7. 本讲小结

- 交互式证明 = 完备性 + 可靠性，靠随机+交互超越 NP。
- 零知识 = 存在不知见证的模拟器能伪造不可区分的对话。
- Σ 协议（commit-challenge-response）：Schnorr 是模板，含知识抽取。
- Fiat–Shamir（RO 模型）去交互 → NIZK / 签名 / SNARK 基石。
