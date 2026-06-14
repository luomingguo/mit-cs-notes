# Lec 6 — 数字签名: RSA
> MIT 6.1600 · Introduction to Computer Security

## 1. RSA 数学基础

### 1.1 欧拉函数

给定 $n = p \cdot q$（$p, q$ 为大素数）：

$$\phi(n) = (p-1)(q-1)$$

**欧拉定理**：若 $\gcd(a, n) = 1$，则：

$$a^{\phi(n)} \equiv 1 \pmod{n}$$

### 1.2 RSA 密钥生成

$$p, q \xleftarrow{\$} \text{大素数}, \quad n = pq$$
$$e: \gcd(e, \phi(n)) = 1 \quad (\text{通常 } e = 65537)$$
$$d \equiv e^{-1} \pmod{\phi(n)}$$

**公钥**：$(n, e)$；**私钥**：$(n, d)$（或等价地 $(p, q, d)$）

### 1.3 RSA 核心性质

$$\forall m \in \mathbb{Z}_n^*: \quad (m^e)^d \equiv m^{ed} \equiv m \pmod{n}$$

因为 $ed \equiv 1 \pmod{\phi(n)}$，所以 $m^{ed} = m^{k\phi(n)+1} = (m^{\phi(n)})^k \cdot m \equiv m \pmod{n}$。

## 2. 朴素 RSA 签名（不安全！）

### 2.1 基本思路

$$\text{Sign}(sk, m): \quad \sigma = m^d \bmod n$$
$$\text{Verify}(vk, m, \sigma): \quad \sigma^e \stackrel{?}{\equiv} m \pmod{n}$$

### 2.2 朴素 RSA 的攻击

**存在性伪造**：
- 攻击者选 $\sigma^*$，计算 $m^* = (\sigma^*)^e \bmod n$
- 得到合法的 $(m^*, \sigma^*)$ 对，无需知道 $sk$！

**乘法可延展**：

$$\text{Sign}(sk, m_1) \cdot \text{Sign}(sk, m_2) = m_1^d \cdot m_2^d = (m_1 m_2)^d = \text{Sign}(sk, m_1 m_2) \bmod n$$

因此可组合已知签名伪造新签名。

## 3. RSA-FDH（Full Domain Hash）

### 3.1 方案

引入哈希函数 $H: \{0,1\}^* \to \mathbb{Z}_n^*$：

$$\text{Sign}(sk, m): \quad \sigma = H(m)^d \bmod n$$
$$\text{Verify}(vk, m, \sigma): \quad \sigma^e \stackrel{?}{\equiv} H(m) \pmod{n}$$

### 3.2 安全性

- 哈希先消除消息的结构，伪造需要对 $H(m^*)$ 开 $d$ 次方
- 在**随机预言模型**（Random Oracle Model, ROM）下，RSA-FDH 的 EUF-CMA 安全性可规约到 RSA 问题的难度

**RSA 问题**（RSA Assumption）：给定 $(n, e, y)$，难以找 $x$ 使 $x^e \equiv y \pmod{n}$。

## 4. RSA-PSS（实际标准）

RSA-PSS（Probabilistic Signature Scheme）是 PKCS#1 v2 标准，在随机预言模型下可证明安全：

### 签名

1. 选随机盐 $r \xleftarrow{\$} \{0,1\}^\lambda$
2. 计算 $w = H(m \| r)$
3. 从 $w, r$ 生成填充串（通过 MGF——Mask Generation Function）
4. $\sigma = (\text{填充串})^d \bmod n$

### 验证

1. 计算 $\sigma^e \bmod n$，解析出 $w', r'$
2. 验证 $w' \stackrel{?}{=} H(m \| r')$

## 5. 椭圆曲线数字签名（ECDSA）

### 5.1 椭圆曲线 DLP

定义在素域 $\mathbb{F}_p$ 上的曲线 $E: y^2 = x^3 + ax + b$，取 $n$ 阶生成元 $G$。

**ECDLP**：给定 $Q = xG \in E$（$x \in \mathbb{Z}_n$），求 $x$。

目前最好算法时间 $\approx 2^{n/2}$（$n = 256$ 时 $\approx 2^{128}$），比 RSA 效率更高。

### 5.2 密钥生成

$$sk = d \xleftarrow{\$} \mathbb{Z}_n^*, \quad vk = Q = dG \in E$$

### 5.3 ECDSA 签名

$$k \xleftarrow{\$} \mathbb{Z}_n^*, \quad R = kG, \quad r = R_x \bmod n$$
$$s = k^{-1}(H(m) + dr) \bmod n$$
$$\sigma = (r, s)$$

### 5.4 ECDSA 验证

$$u_1 = s^{-1} H(m) \bmod n, \quad u_2 = s^{-1} r \bmod n$$
$$R' = u_1 G + u_2 Q$$
$$\text{接受当且仅当 } R'_x \equiv r \pmod{n}$$

### 5.5 Nonce 重用漏洞

若同一 $k$ 被用于签名两条不同消息 $m_1, m_2$：

$$s_1 = k^{-1}(H(m_1) + dr) \bmod n$$
$$s_2 = k^{-1}(H(m_2) + dr) \bmod n$$

$$s_1 - s_2 = k^{-1}(H(m_1) - H(m_2)) \Rightarrow k = \frac{H(m_1) - H(m_2)}{s_1 - s_2}$$

然后可求 $d = (s_1 k - H(m_1)) / r \bmod n$——**私钥泄露！**

2013 年 PlayStation 3 即因 $k$ 固定为常数被破解私钥。

## 6. Schnorr 签名（基于 Fiat-Shamir）

$$k \xleftarrow{\$} \mathbb{Z}_q, \quad R = g^k, \quad e = H(R \| m), \quad s = k + ex \bmod q$$
$$\sigma = (R, s)$$

验证：$g^s \stackrel{?}{=} R \cdot y^e$（其中 $y = g^x$ 为公钥）

**优势**：签名长度 $2 \times 32 = 64$ bytes（secp256k1），线性代数结构支持多重签名聚合（MuSig）。

## 7. RSA vs ECDSA vs Schnorr 对比

| 方案 | 密钥大小 | 签名大小 | 安全基础 |
|------|---------|---------|---------|
| RSA-2048 | 256 bytes | 256 bytes | 整数分解 |
| ECDSA-256 | 32 bytes | 64 bytes | ECDLP |
| Ed25519（Schnorr） | 32 bytes | 64 bytes | ECDLP |

## 关键公式

**RSA-FDH**：

$$\sigma = H(m)^d \bmod n, \quad \text{验证：} \sigma^e \equiv H(m) \pmod{n}$$

**ECDSA 签名**：

$$s = k^{-1}(H(m) + dr) \bmod n$$

**Schnorr（Fiat-Shamir）**：

$$e = H(R \| m),\ s = k + ex \bmod q$$
$$\text{验证：} g^s = R \cdot y^e$$
