---
title: 认证加密（Authenticated Encryption）
type: lecture
lecture: 9
tags: []
status: complete
---
# Lec 9 认证加密（Authenticated Encryption）
> MIT 6.1600 · Introduction to Computer Security

## 1. 问题：加密 ≠ 完整性

仅仅加密不能防止消息被篡改：

- **流密码（Stream Cipher）**：$c = m \oplus \text{PRG}(k)$。攻击者翻转 $c$ 的某位，$m$ 的对应位也翻转，攻击者甚至可以对明文做定向修改（若已知明文位置）。
- **AES-CBC**：可通过修改 IV 或前置块来修改后续块的解密结果。

$$\Rightarrow \text{加密需要配合完整性保护，才能构成安全信道}$$

## 2. 认证加密（AE）定义

**AE 方案**：$(k, \text{AEnc}, \text{ADec})$，满足：

### 2.1 正确性

$$\forall k, m:\ \text{ADec}(k, \text{AEnc}(k, m)) = m$$

### 2.2 安全性：IND-CCA（选择密文攻击不可区分性）

$$\boxed{\text{IND-CCA Game}}$$

1. 挑战者生成 $k \leftarrow \text{KeyGen}$，秘密位 $b \xleftarrow{\$} \{0,1\}$
2. 对手 $\mathcal{A}$ 可查询：
   - **加密 oracle**：输入 $m$，得 $\text{AEnc}(k, m)$
   - **解密 oracle**：输入 $c$，得 $\text{ADec}(k, c)$（不能查询挑战密文）
3. $\mathcal{A}$ 输出 $(m_0, m_1)$（等长），得到挑战密文 $c^* = \text{AEnc}(k, m_b)$
4. $\mathcal{A}$ 猜测 $b' = b$

**安全**：$\Pr[\mathcal{A} \text{ wins}] \leq \frac{1}{2} + \mathrm{negl}(\lambda)$

### 2.3 密文完整性（Ciphertext Integrity）

对手无法伪造一个合法密文（即 $\text{ADec}(k, c^*) \neq \bot$ 且 $c^*$ 未经过加密 oracle）：

$$\Pr[\text{ADec}(k, c^*) \neq \bot \wedge c^* \notin Q_\text{enc}] \leq \mathrm{negl}(\lambda)$$

## 3. 构造：Encrypt-then-MAC（EtM）

$$\text{AEnc}(k_\text{enc}, k_\text{mac}, m) = (c, t)\ \text{其中}\ c = \text{Enc}(k_\text{enc}, m),\ t = \text{MAC}(k_\text{mac}, c)$$

$$\text{ADec}(k_\text{enc}, k_\text{mac}, c, t) = \begin{cases} \text{Dec}(k_\text{enc}, c) & \text{若 } \text{Verify}(k_\text{mac}, c, t) = 1 \\ \bot & \text{否则} \end{cases}$$

**正确顺序**：先 MAC 后解密——MAC 先于解密检查，不泄露部分解密结果。

**错误顺序**：MAC-then-Encrypt 或 Encrypt-and-MAC 均有安全问题。

### 为什么必须"Encrypt-then-MAC"

| 顺序 | 问题 |
|------|------|
| MAC-then-Encrypt | padding oracle：攻击者可通过解密错误信息推断明文 |
| Encrypt-and-MAC | MAC 对明文计算，可能泄露明文信息 |
| **Encrypt-then-MAC** | MAC 检查先于解密，攻击者无法构造合法密文，安全 |

## 4. AES-GCM 详解

**GCM（Galois/Counter Mode）** = AES-CTR + GHASH

### 4.1 加密部分（AES-CTR）

$$\text{keystream}_i = \text{AES}(k, \text{nonce} \| i)$$
$$c_i = m_i \oplus \text{keystream}_i$$

### 4.2 认证部分（GHASH）

定义 $H = \text{AES}(k, 0^{128})$（子密钥），GHASH 在 $\text{GF}(2^{128})$ 上计算：

$$\text{GHASH}_H(a, c) = (a_1 H^{m+n+1} + \ldots + c_n H^1 + \text{len} \cdot H) \in \text{GF}(2^{128})$$

认证标签：

$$T = \text{AES}(k, \text{nonce} \| 0) \oplus \text{GHASH}_H(\text{ad}, c)$$

### 4.3 Nonce 的要求

**关键**：AES-GCM 中 nonce **绝不能重复使用**！

若 nonce 重复：

$$c_1 = m_1 \oplus \text{keystream}, \quad c_2 = m_2 \oplus \text{keystream}$$
$$c_1 \oplus c_2 = m_1 \oplus m_2$$

攻击者可做 XOR 消掉 keystream，进而推断明文——同样的 XOR 攻击。  
更糟的是，GHASH 使用的 $H$ 也相同，认证完全失效（可伪造任意标签）。

**nonce 来源**：
- 随机生成（96-bit，$2^{96}$ 空间约够用）
- 递增计数器（更安全，无碰撞风险）

## 5. ChaCha20-Poly1305

**ChaCha20**：ARX 结构（Add-Rotate-XOR）流密码，无需 AES 硬件即可高效运行：

$$\text{ChaCha20}(k, \text{nonce}, \text{counter}) \to \text{keystream}$$

**Poly1305**：在 $\mathbb{F}_{2^{130}-5}$ 上的多项式 MAC：

$$\text{MAC}(r, s, c_1 \| c_2 \| \ldots) = \sum_i c_i r^{l-i+1} + s \in \mathbb{F}_{2^{130}-5}$$

组合：

$$\text{ChaCha20-Poly1305} = \text{ChaCha20(加密)} + \text{Poly1305(认证)}$$

**优势**：在没有 AES-NI 指令集的平台（如早期 ARM）上速度更快。

## 6. AEAD：带关联数据的认证加密

$$c \leftarrow \text{AEnc}(k, m, \text{ad})$$
$$m / \bot \leftarrow \text{ADec}(k, c, \text{ad})$$

**关联数据（AD）**：被认证但不加密的数据，如：
- TLS 记录层头部（版本、类型）
- 网络层头部（IP 地址）
- 序列号（防止重放攻击）

## 7. 序列号与重放保护

即使使用 AEAD，攻击者还可：
- **删除**消息
- **重放**旧消息
- **重排序**消息

**防护**：在关联数据中包含递增的序列号：

$$\text{ad} = \text{seq\_num} \| \text{header}$$

接收方维护期望序列号，拒绝乱序或重复。

## 8. 安全信道的完整构建

$$\boxed{\text{安全信道} = \text{AEAD}(k, m, \text{seq\_num}) + \text{密钥交换}(DH) + \text{认证}(\text{Cert} + \text{Sign})}$$

- **密钥交换（KE）**：建立共享密钥 $k$
- **认证（Auth）**：确认对端身份
- **AEAD**：保护传输数据

TLS 1.3 正是这三者的完整实现。

## 关键公式

**EtM（Encrypt-then-MAC）**：

$$c = \text{Enc}(k_e, m),\quad t = \text{MAC}(k_m, c)$$
$$\text{验证时先检查 } t \text{，再解密 } c$$

**AES-GCM 标签**：

$$T = \text{AES}(k, \text{nonce} \| 0) \oplus \text{GHASH}_H(\text{ad} \| c)$$
