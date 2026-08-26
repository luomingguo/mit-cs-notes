---
title: 全同态加密 II：Bootstrapping
type: lecture
lecture: 10
tags: []
status: complete
---
# Lec 10 全同态加密 II：Bootstrapping

> MIT 6.5610 · Lecture 10 · 关键词：bootstrapping、层级 FHE → 全 FHE、circular security、模数切换、噪声管理
> *说明：以标准处理撰写（Gentry 2009），要点与本课"FHE 2"一致。*

---

## 0. 主线

L9 给出层级 FHE（有限深度）。本讲用 **bootstrapping** 把它升级为**无限深度的全 FHE**：核心思想是"**同态地运行解密电路来刷新噪声**"。

---

## 1. Bootstrapping 的精确机制

设有一个噪声接近上限的密文 $c=\mathrm{Enc}_{pk}(\mu)$，私钥 $sk$。

::: theorem
**Bootstrapping 步骤**
1. 先把私钥加密：公开 **bootstrapping key** $\widetilde{sk}=\mathrm{Enc}_{pk}(sk)$。
2. 把"将 $c$ 解密"这一过程写成电路 $\mathrm{Dec}_{(\cdot)}(c)$（以密钥为输入、$c$ 为常量）。
3. 在密文层面**同态求值**该解密电路，输入用 $\widetilde{sk}$：
$$\mathrm{Eval}\big(\mathrm{Dec}_{(\cdot)}(c),\ \widetilde{sk}\big) = \mathrm{Enc}_{pk}\big(\mathrm{Dec}_{sk}(c)\big) = \mathrm{Enc}_{pk}(\mu).$$
4. 输出是 $\mu$ 的**全新密文**，其噪声 = "同态求值一个浅解密电路"所引入的噪声，而非原密文的高噪声 → 噪声被**重置**。
:::

> 🔎 **关键洞察**：第 3 步同态运行解密，得到的不是明文 $\mu$（那需要真私钥），而是 $\mu$ 的**重新加密**。因为我们用的是**加密过的私钥** $\widetilde{sk}$，整个过程不泄露 $sk$。这就像"在密封箱里换了个噪声更低的新箱子装同一个秘密"。

---

## 2. 成功条件

::: example
**两个必要条件**
1. **解密电路足够浅**：方案的剩余噪声预算必须能容纳"同态求值解密电路"所需的深度。若解密电路太深、自身就耗尽预算，则 bootstrapping 后噪声反而更高，失败。→ 需要把解密做得尽量浅（模数切换、近似解密等技巧）。
2. **循环安全（circular security）**：发布 $\mathrm{Enc}_{pk}(sk)$ 要求"用公钥加密自己的私钥仍安全"。这是一个额外假设（标准 LWE 不直接蕴含），但被广泛认为成立。
:::

---

## 3. 配套的噪声管理技巧

- **模数切换（modulus switching）**：把密文从模 $q$ 缩放到更小的模 $p$，按比例缩小噪声的绝对量，延长可计算深度（BGV 的关键技巧）。
- **重线性化（relinearization）**：GSW/BGV 中乘法会让密文"维度膨胀"，用 evaluation key 把它压回标准维度。
- **自举频率**：层级方案在每若干层乘法后做一次 bootstrapping，使**任意深度**电路可计算 → 真正的 FHE。

> 🔎 **层级 vs 全**：很多实际应用电路深度已知且不深 → 直接用**层级 FHE**（不 bootstrapping）更快；只有当深度无界或很大时才付 bootstrapping 的高昂代价。

---

## 4. 工程视角

> - Bootstrapping 是 FHE 最贵的操作；TFHE 的卖点正是把单次 bootstrapping 压到毫秒级（适合逐门布尔电路）。
> - CKKS 的"近似 + rescale"让密文计算适配神经网络推理（容忍小误差）。
> - 部署权衡：电路深度 → 选层级还是全；数据类型（整数/实数/布尔）→ 选 BGV/BFV、CKKS 或 TFHE。

---

## 5. 本讲小结

- Bootstrapping = 用加密的私钥同态运行解密电路 → 输出同明文、低噪声的新密文。
- 成功要件：解密电路够浅 + circular security。
- 配套：模数切换、重线性化压制噪声与维度。
- 层级 FHE 够用就别 bootstrapping；它是性能瓶颈。
