---
title: 公钥加密：从 LWE 构造（Regev）
type: lecture
lecture: 7
tags: []
status: complete
---
# Lec 7 公钥加密：从 LWE 构造（Regev）

> MIT 6.5610 · Lecture 7 · 关键词：LWE 假设、带噪线性方程、Regev 加密、解密正确性、噪声预算、后量子、格归约
> *说明：以标准 Regev (2005) 处理撰写，要点与本课"PKE from LWE"一致。*

---

## 0. 主线

后量子公钥的主力来自**格密码**。本讲建立 **LWE（Learning With Errors，带误差学习）** 假设，并用它构造一个简单的后量子 IND-CPA 公钥加密（Regev 方案）。核心直觉：**解线性方程组很容易，但一旦给方程加上少量噪声就变得困难。**

---

## 1. LWE 假设

参数：维度 $n$、模数 $q$、误差分布 $\chi$（小幅度、如离散高斯）。秘密 $\mathbf{s}\in\mathbb{Z}_q^n$。

::: definition
**LWE 分布**：随机取 $\mathbf{a}_i\xleftarrow{R}\mathbb{Z}_q^n$ 与小误差 $e_i\leftarrow\chi$，给出样本
$$(\mathbf{a}_i,\ b_i=\langle\mathbf{a}_i,\mathbf{s}\rangle + e_i \bmod q).$$

**判定-LWE**：区分上述样本与均匀随机 $(\mathbf{a}_i, u_i)$ 困难。
**搜索-LWE**：由多个样本恢复 $\mathbf{s}$ 困难。
:::

> 🔎 **为何难**：若 $e_i=0$，收集 $n$ 个样本做高斯消元即解出 $\mathbf{s}$。**误差破坏了消元**——任何线性组合都会累积/放大噪声，使消元失效。判定-LWE 与搜索-LWE 多项式等价；且 Regev 证明（量子归约）LWE **最坏情况**困难性可归约到格问题（如 GapSVP/SIVP），是"最坏-平均"归约的典范，赋予 LWE 很强的可信度。

---

## 2. Regev 公钥加密

设 $q$ 为模数，消息为单比特 $\mu\in\{0,1\}$。

::: theorem
**Regev PKE（单比特版）**
- **KeyGen**：私钥 $\mathbf{s}\in\mathbb{Z}_q^n$；公钥为 $m$ 个 LWE 样本，写成矩阵形式 $(\mathbf{A},\ \mathbf{b}=\mathbf{A}\mathbf{s}+\mathbf{e})$，$\mathbf{A}\in\mathbb{Z}_q^{m\times n}$。
- **Enc$(\mu)$**：选随机 $\mathbf{r}\in\{0,1\}^m$，输出
$$\mathbf{c}_1=\mathbf{A}^\top\mathbf{r},\qquad c_2=\mathbf{b}^\top\mathbf{r}+\mu\cdot\lfloor q/2\rfloor.$$
- **Dec**：计算 $c_2-\mathbf{s}^\top\mathbf{c}_1 = \mathbf{e}^\top\mathbf{r}+\mu\lfloor q/2\rfloor$。若结果接近 $0$ 判 $\mu=0$，接近 $q/2$ 判 $\mu=1$。
:::

**解密正确性 / 噪声预算**：
$$c_2-\mathbf{s}^\top\mathbf{c}_1 = (\mathbf{A}\mathbf{s}+\mathbf{e})^\top\mathbf{r}+\mu\lfloor q/2\rfloor - \mathbf{s}^\top\mathbf{A}^\top\mathbf{r}=\underbrace{\mathbf{e}^\top\mathbf{r}}_{\text{小噪声}}+\mu\lfloor q/2\rfloor.$$
只要累积噪声 $|\mathbf{e}^\top\mathbf{r}| < q/4$，就能正确从"靠近 $0$ 还是 $q/2$"判出 $\mu$。

> 🔎 **直觉**：把 $\mu$ 编码到 $\{0, q/2\}$ 两个"极点"，噪声只要不超过半径 $q/4$ 就不会越界。这条 $q/4$ 不等式就是**噪声预算（noise budget）**——后续 FHE（L9–L10）的全部技术都在和噪声预算搏斗。

---

## 3. IND-CPA 安全直觉

- 公钥 $(\mathbf{A},\mathbf{b})$ 由判定-LWE **与均匀随机不可区分**；
- 一旦把 $\mathbf{b}$ 换成均匀随机，密文 $(\mathbf{A}^\top\mathbf{r},\ \mathbf{b}^\top\mathbf{r}+\mu\lfloor q/2\rfloor)$ 中的掩码项由**留一散列引理（leftover hash lemma）**变得近均匀，从而完全掩盖 $\mu$。
- 两步归约即得 IND-CPA。

---

## 4. 工程视角

> - LWE/格是 NIST 后量子标准（ML-KEM/Kyber、ML-DSA/Dilithium）的数学基础——SaaS 长期密钥与 TLS 迁移 PQC 时会遇到。
> - 实战多用 **Module-LWE / Ring-LWE**：用多项式环结构压缩公钥与密文体积、加速运算。
> - 代价：公钥/密文比 ECC 大得多（KB 级 vs 几十字节），是迁移时的带宽/存储权衡。
> - LWE 的**加法/有限乘法同态**性质是 FHE 的起点（见 L9）。

---

## 5. 本讲小结

- LWE = "带噪线性方程难解"；判定/搜索等价，且有最坏-平均格归约背书。
- Regev PKE：公钥是 LWE 样本，加密 = 用随机子集和掩盖 $\mu\lfloor q/2\rfloor$，解密靠噪声 $< q/4$。
- 安全两步归约：判定-LWE（公钥伪随机）+ 留一散列（掩码近均匀）。
- 噪声预算 $q/4$ 是格密码的核心约束，直接通向 FHE。
