---
title: 密钥交换与公钥加密
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 10
kind: theory
tags: []
status: complete
---
# Lec 10 密钥交换与公钥加密
> MIT 6.1600 · Introduction to Computer Security

## 1. 问题背景

Alice 和 Bob 不共享秘密，如何建立加密信道？

两种解决路径：

1. **密钥交换（Key Exchange）**：双方交互，协商出共享密钥（DH）
2. **公钥加密（Public-Key Encryption, PKE）**：Alice 用 Bob 的公钥加密，只有 Bob 能解密

## 2. 安全定义：IND-CPA

**IND-CPA（Indistinguishability under Chosen Plaintext Attack）**：

$$\boxed{\text{IND-CPA Game}}$$

1. 挑战者生成 $(pk, sk)$，公布 $pk$
2. 对手 $\mathcal{A}(pk)$ 可查询加密 oracle
3. $\mathcal{A}$ 提交 $(m_0, m_1)$，得 $c^* = \text{Enc}(pk, m_b)$（$b$ 随机）
4. $\mathcal{A}$ 猜测 $b$

**安全**：$\Pr[\mathcal{A} \text{ wins}] \leq \frac{1}{2} + \mathrm{negl}(\lambda)$

IND-CPA 要求加密必须**随机化**——相同明文每次加密结果不同。

## 3. IND-CCA（更强安全性）

在 IND-CPA 基础上，增加解密 oracle（不能解密挑战密文 $c^*$）：

对 TLS 等需要多轮交互的协议，需要 IND-CCA 安全（防止选择密文攻击）。

## 4. 教科书 RSA 加密（不安全！）

$$\text{Enc}(pk = (n, e), m) = m^e \bmod n$$
$$\text{Dec}(sk = (n, d), c) = c^d \bmod n$$

**问题**：
- 确定性——同一明文总产生同一密文（违反 IND-CPA）
- 乘法同态——$\text{Enc}(m_1) \cdot \text{Enc}(m_2) = \text{Enc}(m_1 m_2)$，可延展

## 5. RSA-OAEP（实际标准）

RSA-OAEP（Optimal Asymmetric Encryption Padding）引入随机性：

### 填充过程

$$r \xleftarrow{\$} \{0,1\}^\lambda$$
$$X = m \| 0^{k_1} \oplus G(r), \quad Y = r \oplus H(X)$$
$$c = (X \| Y)^e \bmod n$$

其中 $G, H$ 为哈希函数（随机预言模型下建模）。

**安全性**：在 ROM 下，RSA-OAEP 满足 IND-CCA，基于 RSA 困难问题。

## 6. ElGamal 加密（基于 DH）

### 6.1 密钥生成

$$sk = x \xleftarrow{\$} \mathbb{Z}_q, \quad pk = g^x \in \mathbb{G}$$

### 6.2 加密

$$r \xleftarrow{\$} \mathbb{Z}_q$$
$$c = (g^r,\ m \cdot (g^x)^r) = (C_1, C_2)$$

### 6.3 解密

$$m = C_2 / C_1^x = m \cdot g^{rx} / g^{rx} = m$$

### 6.4 安全性

**CDH 假设**：若对手无法从 $(g^x, g^r)$ 计算 $g^{xr}$，则无法解密 $C_2$。

注意：基本 ElGamal 满足 IND-CPA，不满足 IND-CCA（可延展：$C_2' = 2C_2$ 解密得 $2m$）。

需要 Hash-ElGamal 或 ECIES 版本来实现 IND-CCA。

## 7. 椭圆曲线 Diffie-Hellman（ECDH）

实践中 DH 通常在椭圆曲线群上实现：

$$\text{Alice}: a \xleftarrow{\$} \mathbb{Z}_q,\quad A = aG$$
$$\text{Bob}: b \xleftarrow{\$} \mathbb{Z}_q,\quad B = bG$$
$$\text{共享密钥}: K = aB = bA = abG \in E(\mathbb{F}_p)$$

**常用曲线**：
- P-256（NIST）：FIPS 标准
- X25519（Curve25519）：更快、抵抗时序攻击，TLS 1.3 默认

### ECDH 密钥派生

原始共享点 $K$ 不直接作为密钥，需经 KDF：

$$k = \text{HKDF}(K_x, \text{context})$$

## 8. 密钥封装机制（KEM）

现代密码学将密钥交换抽象为 **KEM（Key Encapsulation Mechanism）**：

$$\text{Encap}(pk) \to (c, k)$$
$$\text{Decap}(sk, c) \to k$$

- Alice 调用 $\text{Encap}(pk_B)$ 得到密文 $c$ 和共享密钥 $k$
- Bob 调用 $\text{Decap}(sk_B, c)$ 得到同样的 $k$
- Alice 用 $k$ 加密数据，Bob 解密

**KEM + DEM（Data Encapsulation Mechanism）** = 混合加密：

$$c_\text{data} = \text{AEAD}(k, m)$$
$$\text{发送}: (c_\text{KEM}, c_\text{data})$$

效率高：大量数据用对称加密（快），只有密钥用非对称（慢）。

## 9. 前向安全的密钥交换

### 静态 DH（不提供前向安全）

$$\text{Alice}: A = g^a\ (\text{长期静态}), \quad \text{Bob}: B = g^b\ (\text{长期静态})$$

若 $a$ 或 $b$ 泄露，所有历史会话可被解密。

### 临时 DH（Ephemeral DH，提供前向安全）

每次会话生成新的随机 $(a, b)$，会话结束后销毁：

$$\text{每次}: a \xleftarrow{\$} \mathbb{Z}_q,\quad \text{会话结束}: \text{erase}(a)$$

即使服务器长期密钥泄露，攻击者也无法恢复历史会话的 $a$，因此无法解密历史流量。

**TLS 1.3** 强制使用 Ephemeral ECDH（ECDHE）。

## 10. HPKE（Hybrid Public Key Encryption）

HPKE（RFC 9180）是现代 KEM+AEAD 混合加密标准，被 MLS、TLS ECH 采用：

$$\text{SetupS}(pk_B) \to (\text{enc}, \text{ctx})$$
$$\text{SetupR}(sk_B, \text{enc}) \to \text{ctx}$$
$$\text{ctx.Seal}(m, \text{ad}) \to c$$
$$\text{ctx.Open}(c, \text{ad}) \to m$$

## 关键公式

**ElGamal 加密**：

$$c = (g^r,\ m \cdot pk^r),\quad \text{解密}: m = C_2 / C_1^x$$

**ECDH 共享密钥**：

$$K = aB = bA = abG,\quad k = \text{KDF}(K_x)$$

**混合加密（KEM+DEM）**：

$$(c_K, k) \leftarrow \text{Encap}(pk),\quad c_D = \text{AEAD}(k, m)$$
$$\text{发送}: (c_K, c_D)$$
