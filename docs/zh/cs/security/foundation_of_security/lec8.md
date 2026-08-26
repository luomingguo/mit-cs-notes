---
title: 传输层安全导论（Intro to Transport Security）
type: lecture
lecture: 8
tags: []
status: complete
---
# Lec 8 传输层安全导论（Intro to Transport Security）
> MIT 6.1600 · Introduction to Computer Security

## 1. 传输安全的目标

Alice 和 Bob 通过不可信网络通信，威胁模型：

- **窃听者（Eavesdropper）**：观察所有传输数据
- **主动攻击者（Active Attacker）**：可修改、注入、重放、删除消息

**安全通信信道的目标**：

| 性质 | 含义 |
|------|------|
| **机密性（Confidentiality）** | 攻击者无法了解消息内容 |
| **完整性（Integrity）** | 攻击者无法篡改消息 |
| **认证（Authentication）** | 确认通信对端身份 |
| **前向安全（Forward Secrecy）** | 长期密钥泄露不影响历史会话 |

## 2. 对称密钥加密回顾

### 定义

$$\text{Enc}(k, m) \to c, \quad \text{Dec}(k, c) \to m$$

**IND-CPA 安全**：密文不泄露明文任何信息（即使攻击者可自选明文加密）

**IND-CCA 安全**：在此基础上允许攻击者解密其他密文（更强）

### 流密码 vs 块密码

| 类型 | 示例 | 特点 |
|------|------|------|
| 流密码 | ChaCha20 | 高速，适合软件实现 |
| 块密码（+模式） | AES-CTR, AES-GCM | 硬件加速（AES-NI）|

## 3. 认证加密（Authenticated Encryption, AE）

同时提供机密性 + 完整性的原语：

$$c \leftarrow \text{AEnc}(k, m), \quad m/\bot \leftarrow \text{ADec}(k, c)$$

解密失败返回 $\bot$，不返回部分结果。

### AEAD（带关联数据的认证加密）

$$c \leftarrow \text{AEnc}(k, m, \text{ad}), \quad m/\bot \leftarrow \text{ADec}(k, c, \text{ad})$$

**关联数据（Associated Data, AD）**：被认证但不被加密（如包头、序列号）。

### 主流 AEAD 方案

| 方案 | 加密 | 认证 |
|------|------|------|
| **AES-GCM** | AES-CTR | GHASH（多项式 MAC）|
| **ChaCha20-Poly1305** | ChaCha20 | Poly1305 |

## 4. 密钥交换：问题设定

Alice 和 Bob 从未见面，如何建立共享密钥 $k$？

若攻击者监听所有流量，能否计算出 $k$？

## 5. Diffie-Hellman 密钥交换

### 5.1 协议

公开参数：群 $\mathbb{G}$（如椭圆曲线），生成元 $g$，阶 $q$。

$$\text{Alice}: a \xleftarrow{\$} \mathbb{Z}_q, \quad A = g^a$$
$$\text{Bob}: b \xleftarrow{\$} \mathbb{Z}_q, \quad B = g^b$$
$$\text{交换 } A \leftrightarrow B$$
$$\text{共享密钥}: K = B^a = A^b = g^{ab}$$

### 5.2 安全性

**Computational Diffie-Hellman（CDH）假设**：给定 $(g, g^a, g^b)$，难以计算 $g^{ab}$。

注意：DH 不提供认证——中间人攻击：

$$\text{Alice} \leftrightarrow \text{Mallory}\ (g^{am}) \quad \text{Mallory}\ (g^{mb}) \leftrightarrow \text{Bob}$$

Mallory 分别与 Alice 和 Bob 建立密钥，双方以为在通信，但 Mallory 可读取全部内容。

### 5.3 需要配合认证

DH 必须与身份认证结合使用（证书 + 签名），才能防止 MITM。

## 6. TLS 1.3 握手概述

TLS 1.3 是当前 HTTPS 的标准协议。

### 6.1 握手流程（简化）

```text
Client                          Server
  |                               |
  |-- ClientHello (支持的算法) -->|
  |   [key_share: g^a]            |
  |                               |
  |<-- ServerHello --------------|
  |    [key_share: g^b]           |
  |    [Certificate]              |
  |    [CertificateVerify]        |  ← Sign(sk_server, transcript)
  |    [Finished]                 |  ← MAC(handshake_key, transcript)
  |                               |
  |-- Finished ----------------->|
  |   [MAC(handshake_key, ...)]   |
  |                               |
  |<===== 应用数据（加密）======>|
```

### 6.2 密钥派生

$$g^{ab} \xrightarrow{\text{HKDF}} k_\text{handshake} \xrightarrow{\text{HKDF}} k_\text{application}$$

**前向安全**：每次握手用临时 DH 密钥（ephemeral），服务器长期密钥 $sk$ 仅用于签名，不参与加密。即使 $sk$ 泄露，历史会话内容仍安全。

### 6.3 0-RTT（Early Data）

TLS 1.3 支持 0-RTT 会话恢复：

- 上次会话结束时服务器发 PSK（Pre-Shared Key）
- 下次连接时客户端直接用 PSK 发送数据（无需完整握手）
- **风险**：不提供前向安全，且易受重放攻击

## 7. 旧版本 TLS 的问题（历史）

| 漏洞/攻击 | 版本 | 原因 |
|-----------|------|------|
| BEAST | TLS 1.0 | CBC 模式 IV 可预测 |
| POODLE | SSL 3.0 | Padding oracle |
| CRIME/BREACH | TLS 1.2 | 压缩+加密导致侧信道 |
| DROWN | SSL 2.0 | 弱导出密钥 |
| Heartbleed | 任意 | OpenSSL 实现 bug |

TLS 1.3 通过大幅简化握手、禁用弱算法、强制 AEAD 解决了上述问题。

## 8. 常见密码套件（TLS 1.3）

| 套件 | 密钥交换 | 加密 | 哈希 |
|------|---------|------|------|
| TLS_AES_128_GCM_SHA256 | — | AES-128-GCM | SHA-256 |
| TLS_AES_256_GCM_SHA384 | — | AES-256-GCM | SHA-384 |
| TLS_CHACHA20_POLY1305_SHA256 | — | ChaCha20-Poly1305 | SHA-256 |

（TLS 1.3 中密钥交换统一为 ECDHE 或 DHE，套件中不再列出）

## 关键定义

**前向安全（Perfect Forward Secrecy, PFS）**：

$$\text{长期密钥 } sk \text{ 泄露} \not\Rightarrow \text{历史会话可解密}$$

实现方式：每次握手生成临时（ephemeral）DH 密钥对，会话结束后销毁。

**AEAD 正确性**：

$$\text{ADec}(k, \text{AEnc}(k, m, \text{ad}), \text{ad}) = m$$
$$\text{任何修改} \Rightarrow \text{ADec 返回 } \bot$$
