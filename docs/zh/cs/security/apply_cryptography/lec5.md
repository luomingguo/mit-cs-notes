---
title: Diffie–Hellman 密钥交换与公钥加密
type: lecture
lecture: 5
tags: []
status: complete
---
# Lec 5 Diffie–Hellman 密钥交换与公钥加密

> MIT 6.5610 · Lecture 5 · 关键词：公钥革命、离散对数、DH 密钥交换、CDH/DDH 假设、ElGamal、IND-CPA、前向保密
> *说明：本课原版讲义未检索到，以与本课一致的标准处理撰写（Diffie–Hellman 1976、ElGamal 1985）。*

---

## 0. 一句话动机

对称加密要求双方**预先共享密钥**——但素未谋面的两方如何在**公开信道**上协商出共享秘密？1976 年 Diffie–Hellman 给出答案，开启**公钥密码（*public-key cryptography*）**时代。

> 🕯️ 历史：公钥思想其实更早由英国 GCHQ 的 Cocks/Williamson（1969–1974）秘密发明，数十年后才解密。

---

## 1. 群与离散对数（Group & Discrete Log）

工作在循环群 $\mathbb{G}=\langle g\rangle$，阶为素数 $q$（典型实例：$\mathbb{Z}_p^*$ 的素数阶子群，或椭圆曲线群）。

::: definition
**离散对数问题（*Discrete Log, DL*）**
给定 $g, h=g^x$，求 $x$。在合适的群中被认为计算上困难。
:::

> 🔎 **指数运算用快速幂**（平方-乘）在 $O(\log x)$ 次群运算内完成，但**反过来**求指数（DL）没有已知高效经典算法。这种"正向易、反向难"的单向性是公钥密码的引擎。

---

## 2. Diffie–Hellman 密钥交换

公开 $(\mathbb{G}, g, q)$：

1. Alice 选私钥 $a\xleftarrow{R}\mathbb{Z}_q$，发 $A=g^a$；
2. Bob 选私钥 $b\xleftarrow{R}\mathbb{Z}_q$，发 $B=g^b$；
3. 双方各算共享秘密 $K = B^a = A^b = g^{ab}$。

窃听者看到 $g, g^a, g^b$，要算 $g^{ab}$。

::: definition
**计算性 DH（*CDH*）**：给定 $g^a, g^b$，计算 $g^{ab}$ 困难。
**判定性 DH（*DDH*）**：区分 $(g^a, g^b, g^{ab})$ 与 $(g^a, g^b, g^c)$（$c$ 随机）困难。
:::

> ⚠️ **关系**：$\text{DL} \Rightarrow \text{CDH} \Rightarrow \text{DDH}$（越往右假设越强/越易被破）。DDH 在某些群（如 $\mathbb{Z}_p^*$ 全群）**不成立**（勒让德符号泄露），故需用素数阶子群。
> ⚠️ **中间人攻击**：裸 DH 无认证，主动攻击者可分别与双方协商，需配合签名/证书（认证 DH）。
> 🔎 **前向保密（forward secrecy）**：每次会话用**临时**私钥并在协商后丢弃，长期密钥日后泄露也无法解密历史会话——TLS 的 DHE/ECDHE 模式即此。

---

## 3. ElGamal 公钥加密

把 DH 变成加密（Taher Elgamal 1985），消息 $m\in\mathbb{G}$：

::: theorem
**ElGamal PKE**
- **KeyGen**：私钥 $a$，公钥 $A=g^a$。
- **Enc$(A,m)$**：选临时 $r\xleftarrow{R}\mathbb{Z}_q$，输出 $(c_1,c_2)=(g^r,\ m\cdot A^r)$。
- **Dec$(a,(c_1,c_2))$**：$m = c_2\cdot c_1^{-a} = m\cdot g^{ar}\cdot g^{-ar}$。
:::

直觉：$A^r=g^{ar}$ 是一次性 DH 共享秘密，充当**群上的一次性掩码**乘到 $m$ 上；每条消息用**新鲜 $r$**（否则掩码复用，类似 OTP 复用泄露）。

> 🔎 ElGamal 的 IND-CPA 安全 **等价于 DDH**：密文 $(g^r, m\cdot g^{ar})$ 与 $(g^r, m\cdot g^{c})$ 不可区分，正是 DDH。

---

## 4. 公钥加密的安全定义（IND-CPA）

::: definition
**PKE 语法**：$(\mathrm{KeyGen},\mathrm{Enc},\mathrm{Dec})$，$\mathrm{KeyGen}\to(pk,sk)$，$\mathrm{Enc}(pk,\cdot)$ 公开，$\mathrm{Dec}(sk,\cdot)$ 私有。

**IND-CPA 游戏**：敌手得 $pk$，选 $m_0,m_1$（等长），挑战者回 $\mathrm{Enc}(pk,m_b)$，敌手猜 $b$。优势可忽略即安全。
:::

> 🔎 **公钥设定下加密必须随机化**：因为人人持有 $pk$，可自由加密任意明文比对——确定性 PKE 必然不 IND-CPA（这与 L2 对称设定下"必须随机化"同源，但这里更强制）。
> ⚠️ 实战中**混合加密（hybrid / KEM-DEM）**：用公钥封装一个对称会话密钥，再用对称 AEAD 加密大消息——兼顾公钥的便利与对称的效率。

---

## 5. 本讲小结

- 公钥密码解决"无预共享密钥的陌生双方协商"问题。
- DH 协商 $g^{ab}$；安全建立在 CDH/DDH（蕴含于 DL 困难）。
- ElGamal = "DH 共享秘密作群上一次性掩码"，IND-CPA ⟺ DDH。
- PKE 必须随机化；实战用混合加密 + 认证（防中间人）+ 临时密钥（前向保密）。
- ⚠️ **DL/因子分解类假设会被 Shor 算法在量子计算机上攻破** → 引出后量子密码（L6–L7）。
