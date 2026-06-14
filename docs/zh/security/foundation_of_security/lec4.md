# Lec 4 — 消息认证码（*MAC*）
> MIT 6.1600 · Introduction to Computer Security

## 1. 问题背景

哈希函数（CRHF）保护文件完整性，但**无法防止主动篡改**：

- Alice 发送 $(m, H(m))$ 给 Bob
- 攻击者截获后把 $m$ 换成 $m'$，同时发送 $H(m')$
- Bob 验证通过——完整性被破坏

根本问题：没有**密钥**，任何人都能计算哈希。

**MAC（Message Authentication Code）** 引入共享密钥，解决此问题。

## 2. MAC 的定义

MAC 是一个三元组 $(\text{KeyGen}, \text{MAC}, \text{Verify})$：

$$k \leftarrow \text{KeyGen}(1^\lambda)$$
$$t \leftarrow \text{MAC}(k, m)$$
$$b \leftarrow \text{Verify}(k, m, t) \in \{0, 1\}$$

- $k$：共享密钥（Alice 和 Bob 共享，攻击者不知道）
- $t$：标签（tag）
- **正确性**：对所有 $k, m$，$\text{Verify}(k, m, \text{MAC}(k, m)) = 1$

## 3. 安全定义：EUF-CMA

**EUF-CMA**（Existential Unforgeability under Chosen-Message Attack）：

### 安全游戏

$$\boxed{\text{EUF-CMA Game}}$$

1. 挑战者（Challenger）生成 $k \leftarrow \text{KeyGen}(1^\lambda)$
2. 对手 $\mathcal{A}$ 可自适应地查询 oracle：
   - **MAC oracle**：输入 $m_i$，得到 $t_i = \text{MAC}(k, m_i)$
3. $\mathcal{A}$ 输出伪造 $(m^*, t^*)$

**$\mathcal{A}$ 胜利条件**：
$$\text{Verify}(k, m^*, t^*) = 1 \quad \wedge \quad m^* \notin \{m_1, m_2, \ldots\}$$

（即伪造的消息不在已查询列表中）

**安全要求**：对任意 PPT 对手 $\mathcal{A}$：
$$\Pr[\mathcal{A} \text{ wins}] \leq \mathrm{negl}(\lambda)$$

## 4. PRF（伪随机函数）

### 4.1 定义

**PRF（Pseudorandom Function）**：

$$F: \mathcal{K} \times \mathcal{X} \to \mathcal{Y}$$

对手无法区分 $F(k, \cdot)$ 和真正随机函数 $R: \mathcal{X} \to \mathcal{Y}$，其中 $k \xleftarrow{\$} \mathcal{K}$。

### 4.2 PRF 的 MAC 构造

若 $F$ 是安全的 PRF 且 $|\mathcal{Y}|$ 足够大（$|Y| \geq 2^{128}$）：

$$\text{MAC}(k, m) = F(k, m)$$
$$\text{Verify}(k, m, t) = [t \stackrel{?}{=} F(k, m)]$$

**安全性**：若 $F$ 是 PRF，则上述 MAC 满足 EUF-CMA（对于**单消息**安全，或消息集合有限时）。

## 5. 实际 MAC 构造

### 5.1 HMAC（基于哈希的 MAC）

$$\text{HMAC}(k, m) = H\big((k \oplus \text{opad}) \| H((k \oplus \text{ipad}) \| m)\big)$$

- $\text{opad} = \texttt{0x5c5c5c...}$，$\text{ipad} = \texttt{0x363636...}$（固定常数）
- 防止对哈希函数 Length-Extension 攻击
- 基于 SHA-256/SHA-512

### 5.2 PMAC / CMAC

基于分组密码（AES），可并行化：

$$\text{PMAC}(k, m_1 \| m_2 \| \ldots) = \bigoplus_i F(k, m_i \oplus \Delta_i)$$

$\Delta_i$ 为与块位置相关的 tweak，防止消息块顺序被调换。

### 5.3 多项式 MAC（GHASH / Poly1305）

对消息块作为多项式系数，在有限域 $\mathbb{F}_{2^{128}}$ 上求值：

$$\text{MAC}(k, m_1 \| \ldots \| m_\ell) = m_1 k^\ell + m_2 k^{\ell-1} + \cdots + m_\ell k \in \mathbb{F}_{2^{128}}$$

**安全性**：对不同消息，标签碰撞概率 $\leq \ell / 2^{128}$（差分有界）。

## 6. MAC 的应用

### 6.1 消息完整性

Alice 和 Bob 共享密钥 $k$：

$$\text{Alice}: t \leftarrow \text{MAC}(k, m),\ \text{发送}\ (m, t)$$
$$\text{Bob}: \text{Verify}(k, m, t) \stackrel{?}{=} 1$$

攻击者不知 $k$，无法伪造合法 $(m', t')$。

### 6.2 API Token

服务器对用户 ID 生成 token：

$$\text{token} = \text{userid} \| \text{MAC}(k_\text{server}, \text{userid})$$

客户端存储 token，之后每次请求带上。服务器验证 MAC，确认 token 未被篡改。

### 6.3 HMAC 用于密钥派生（HKDF）

$$\text{HKDF}(k, \text{info}) = \text{HMAC}(k, \text{info} \| \texttt{0x01})$$

## 7. 反例：不安全的 MAC 构造

### 7.1 $\text{MAC}(k, m) = H(m \| k)$（Length Extension 攻击）

MD 结构哈希中：

$$H(m \| k) = H(\text{pad}(m \| k))$$

攻击者已知 $(m, t = H(m \| k))$ 后，可构造：

$$m' = \text{pad}(m \| k) \| \text{extra}$$
$$t' = H(t \| \text{extra})$$（无需知道 $k$）

从而 $H(m' \| k) = t'$，伪造成功。

### 7.2 $\text{MAC}(k, m) = H(k \| m)$（对 CRHF 而非 PRF 可能不安全）

依赖 $H$ 满足 PRF 性质；SHA-256 实践中安全，但理论无保证。HMAC 双层结构是更严格的做法。

## 8. MAC 与签名的区别

| 特性 | MAC | 数字签名 |
|------|-----|--------|
| 密钥 | 对称（共享） | 非对称（私钥/公钥）|
| 验证者 | 仅知 $k$ 的人 | 任何人（有 $vk$）|
| 不可否认性 | ✗ | ✓ |
| 计算速度 | 快 | 慢（RSA/ECDSA）|

## 关键公式

**EUF-CMA 定义**（简化）：

$$\Pr\left[\text{Verify}(k, m^*, \mathcal{A}^{\text{MAC}(k,\cdot)}(1^\lambda)) = 1\ \wedge\ m^* \notin Q\right] \leq \mathrm{negl}(\lambda)$$

**HMAC**：

$$\text{HMAC}(k, m) = H\big((k \oplus \text{opad}) \| H((k \oplus \text{ipad}) \| m)\big)$$
