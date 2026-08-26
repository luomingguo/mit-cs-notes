---
title: 隐私与零信任证明
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 20
kind: theory
tags: []
status: complete
---
# Lec 20 隐私与零信任证明
> MIT 6.1600 · Introduction to Computer Security

## 1. 超越"全有或全无"的加密

本课程前面介绍的密码学原语都是"全有或全无"的：

- 持有密钥 $k$ → 完全解密消息
- 不持有密钥 → 无法获取任何信息

**零信任证明（Zero-Knowledge Proof）** 提供更精细的语义：

> 证明者（Prover）可以向验证者（Verifier）证明其"知道"某个秘密，而不泄露关于该秘密的任何其他信息。

## 2. 零信任证明的形式化定义

**设定**：双方共同持有函数 $f$ 和值 $y = f(x)$。证明者知道 $x$，想向验证者证明这一点，但不透露 $x$ 本身。

**证明系统（Proof System）**：证明者与验证者交互，最终验证者接受或拒绝。

（术语：秘密值 $x$ 称为**见证（Witness）**）

### 2.1 三个安全性质

**完备性（Completeness）**：  
若证明者真正知道 $x$，则诚实的验证者总是接受：

$$P[\text{诚实证明者} \Rightarrow \text{验证者接受}] = 1$$

**可靠性（Soundness）**：  
若验证者接受，则证明者真的知道 $x$；欺骗的证明者无法让验证者接受：

$$\forall\ \text{作弊证明者}:\ P[\text{验证者接受}] \leq \mathrm{negl}(\lambda)$$

**零信任性（Zero-Knowledge）**：  
验证者除了"$y = f(x)$ 有解"这一事实外，什么都没学到。  
形式化：验证者可以在不与真正证明者交互的情况下，模拟（Simulate）出与真实交互**计算上不可区分**的记录（Transcript）。

### 2.2 "知道"的定义：可提取性

"知道 $x$" 的形式化含义：存在高效的**提取器（Extractor）**，通过与证明者交互并观察其内部状态，可高效提取 $x$。

## 3. 离散对数问题（DLP）回顾

**设定**：群 $\mathbb{G}$，素数阶 $q$，生成元 $g \in \mathbb{G}$。

给定 $y = g^x \in \mathbb{G}$（$x \xleftarrow{\$} \mathbb{Z}_q$），**离散对数问题**要求求 $x$。

实践中 $q \approx 2^{256}$，最优算法时间 $\approx 2^{128}$。

## 4. Schnorr 协议：离散对数的零信任证明

### 4.1 协议设置

- 公开：$g \in \mathbb{G}$，群阶 $q$，验证者知道 $y \in \mathbb{G}$
- 证明者知道：$x \in \mathbb{Z}_q$ 使得 $y = g^x$

### 4.2 协议流程（挑战位 $c \in \{0, 1\}$）

$$\text{Prover} \xrightarrow{R = g^r,\ r \xleftarrow{\$} \mathbb{Z}_q} \text{Verifier}$$
$$\text{Prover} \xleftarrow{c \xleftarrow{\$} \{0,1\}} \text{Verifier}$$
$$\text{Prover} \xrightarrow{z = r + cx \bmod q} \text{Verifier}$$

**验证**：$g^z \stackrel{?}{=} R \cdot y^c$

验证正确性：

$$g^z = g^{r+cx} = g^r \cdot (g^x)^c = R \cdot y^c \quad \checkmark$$

### 4.3 为什么需要交互

证明者**不能提前知道 $c$**——否则可选 $z \xleftarrow{\$} \mathbb{Z}_q$ 并令 $R = g^z y^{-c}$，无需知道 $x$ 即可"通过"验证。

**可靠性误差**：单轮协议中作弊者成功概率为 $1/2$。  
重复 $\lambda$ 次后，成功概率降至 $2^{-\lambda}$。

### 4.4 完整 Schnorr 协议（挑战 $c \in \mathbb{Z}_q$）

将挑战扩展为 $c \xleftarrow{\$} \mathbb{Z}_q$（而非仅 $\{0, 1\}$）：

$$\text{可靠性误差} \approx 1/q \approx 2^{-256} \quad \text{一轮即安全}$$

代价：只满足**诚实验证者零信任（Honest-Verifier ZK）**，不满足完整零信任性。

## 5. Schnorr 协议的安全性分析

### 5.1 可靠性（通过 Extractor）

构造提取器：与（可能作弊的）证明者 $P^*$ 交互两次，使用**不同挑战**：

1. 运行 $P^*$，获得 $(R, c=0, z)$ — 验证通过：$g^z = R$
2. **倒带（Rewind）** $P^*$ 到发送 $R$ 后的状态
3. 重新发送挑战 $c=1$，获得 $(R, c=1, z')$ — 验证通过：$g^{z'} = R \cdot y$

两次同一 $R$，不同挑战 $c$：

$$g^z = R,\quad g^{z'} = Ry \Rightarrow g^{z'-z} = y \Rightarrow x = z' - z \bmod q$$

证明了**若 $P^*$ 能以概率 1 说服验证者，则提取器能提取 $x$**。

### 5.2 零信任性（通过 Simulator）

构造模拟器，无需知道 $x$，生成与真实交互**计算上不可区分**的 Transcript：

1. 猜测挑战 $c' \xleftarrow{\$} \{0, 1\}$
2. 选 $z \xleftarrow{\$} \mathbb{Z}_q$，令 $R = g^z y^{-c'}$
3. 运行验证者 $V^*$，输入 $R$，得到挑战 $c$
4. 若 $c = c'$，输出 $(R, c, z)$ 作为模拟 Transcript
5. 否则**重试**（每次成功概率 $1/2$，平均 2 次成功）

**关键**：在真实交互中，$(R, c, z)$ 满足 $g^z = Ry^c$；模拟器生成的 $(R, c, z)$ 同样满足该关系，且由于 $z$ 均匀随机，两者分布相同。

**为什么真实协议中验证者学不到 $x$？** 验证者在真实交互中**不能倒带证明者**，因此无法运行提取器算法。

## 6. Fiat-Shamir 变换：从交互到非交互

**问题**：Schnorr 协议需要多轮消息交换。

**Fiat-Shamir 变换**：用哈希函数（建模为随机预言 Random Oracle）替换验证者的随机挑战：

$$c = H(R \| m) \quad \text{（加入消息 $m$，形成签名方案）}$$

证明者完全独立地计算出证明，无需与验证者交互：

1. $r \xleftarrow{\$} \mathbb{Z}_q,\quad R = g^r$
2. $c = H(R \| m)$
3. $z = r + cx \bmod q$
4. 输出 $\sigma = (R, z)$

**验证**：$g^z \stackrel{?}{=} R \cdot y^{H(R \| m)}$

这就是 **Schnorr 签名方案**！椭圆曲线版本（Ed25519）是现代最重要的签名方案之一。

## 7. 零信任证明的应用

### 7.1 认证（Authentication）

- $x$ = 用户私钥，$y$ = 公钥，$f(x) = g^x$
- 证明者向验证者证明"我知道对应公钥的私钥"，而不传递私钥本身

传统 MAC/签名方案也可看作一种知识证明，但不严格满足 ZK 的定义。

### 7.2 匿名凭证（Anonymous Credentials）

用户可以向服务证明"我是合法用户（某 CA 签发了我的证书）"，而不泄露身份：

$$\text{ZKP}\{x:\ \text{Verify}(vk_\text{CA},\ x,\ \sigma) = 1\}$$

用户知道某个被 CA 签名的证书，但选择性地只公开"我有合法证书"这一事实。

### 7.3 zkSNARKs（简洁非交互式知识证明）

现代 ZKP 系统可以对**任意可计算函数**生成简洁证明（几百字节）：

$$\text{ZKP}\{x:\ C(x) = y\} \quad \text{证明大小 O(1)，验证时间 O(1)}$$

- **Groth16**、**PLONK**、**STARKs**：用于区块链隐私交易（Zcash）和 L2 Rollup 证明

## 关键公式

**Schnorr 协议**：

$$z = r + cx \bmod q,\quad \text{验证：}\ g^z = g^r \cdot (g^x)^c = R \cdot y^c$$

**Fiat-Shamir（Schnorr 签名）**：

$$c = H(R \| m),\quad z = r + cx \bmod q$$
$$\sigma = (R, z),\quad \text{验证：}\ g^z \stackrel{?}{=} R \cdot y^{H(R \| m)}$$

**提取器输出**（两轮倒带）：

$$x = z' - z \bmod q \quad \text{（由 } g^z = R,\ g^{z'} = Ry \text{ 推导）}$$
