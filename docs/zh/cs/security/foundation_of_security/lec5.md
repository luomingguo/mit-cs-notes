---
title: 数字签名：基于哈希
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 5
kind: theory
tags: []
status: complete
---
# Lec 5 数字签名：基于哈希
> MIT 6.1600 · Introduction to Computer Security

## 1. 为什么需要数字签名

MAC 使用对称密钥，只有知道密钥的人才能验证——验证者即可伪造者。

**数字签名**提供非对称方案：
- **私钥 $sk$**：签名者持有，秘密
- **公钥 $vk$**：任何人都可验证，公开

$$\sigma \leftarrow \text{Sign}(sk, m) \qquad b \leftarrow \text{Verify}(vk, m, \sigma)$$

**不可否认性（Non-repudiation）**：签名者事后无法否认，因为只有他知道 $sk$。

## 2. 安全定义：EUF-CMA

与 MAC 相同的游戏，但密钥为非对称：

1. 挑战者生成 $(sk, vk) \leftarrow \text{KeyGen}(1^\lambda)$，公布 $vk$
2. 对手 $\mathcal{A}(vk)$ 自适应查询 $\text{Sign}(sk, \cdot)$ oracle
3. $\mathcal{A}$ 输出 $(m^*, \sigma^*)$

**胜利**：$\text{Verify}(vk, m^*, \sigma^*) = 1$ 且 $m^* \notin Q$

$$\Pr[\mathcal{A} \text{ wins EUF-CMA}] \leq \mathrm{negl}(\lambda)$$

## 3. 基于哈希的签名：Lamport 一次签名

### 3.1 密钥生成

对每个消息位 $i \in \{1, \ldots, n\}$：

$$sk: \quad x_{i,0}, x_{i,1} \xleftarrow{\$} \{0,1\}^\lambda$$
$$vk: \quad y_{i,b} = H(x_{i,b}) \quad \forall\ i, b \in \{0,1\}$$

**私钥**：$2n$ 个随机值 $\{x_{i,b}\}$  
**公钥**：$2n$ 个哈希值 $\{y_{i,b}\}$

### 3.2 签名

对消息 $m = m_1 m_2 \ldots m_n \in \{0,1\}^n$：

$$\sigma = (x_{1, m_1},\ x_{2, m_2},\ \ldots,\ x_{n, m_n})$$

即：对每一位 $m_i$，公开 $x_{i, m_i}$（另一个 $x_{i, 1-m_i}$ 保密）。

### 3.3 验证

收到 $(m, \sigma = (z_1, \ldots, z_n))$ 后，验证：

$$\forall i:\ H(z_i) \stackrel{?}{=} y_{i, m_i}$$

### 3.4 安全性分析

**若要伪造**消息 $m'$（某位 $m'_i \neq m_i$），需知道 $x_{i, m'_i}$——但从公钥 $y_{i, m'_i} = H(x_{i, m'_i})$ 反推 $x_{i, m'_i}$ 需破解预像抗性。

因此 Lamport 签名安全性基于：**CRHF 的预像抗性**。

### 3.5 关键限制

**一次性（One-time）**：私钥每对 $(x_{i,0}, x_{i,1})$ 中公开一个后，另一个也间接可推断——**不能用同一私钥签名两次**！

否则攻击者可组合两个签名伪造其他消息。

**密钥/签名较大**：$n = 256$ 时，私钥、公钥各 $512 \times \lambda$ bits，签名 $256 \times \lambda$ bits。

## 4. Winternitz 签名（改进 Lamport）

### 核心思想

将消息 $n$ 位分成 $w$ 位一组处理（$w$ 为 Winternitz 参数），每组用哈希链代替单次哈希：

$$sk_i \xleftarrow{\$} \{0,1\}^\lambda, \quad vk_i = H^{2^w}(sk_i)$$

签名第 $i$ 组（值为 $v_i$）时：

$$\sigma_i = H^{v_i}(sk_i)$$

验证：

$$H^{2^w - v_i}(\sigma_i) \stackrel{?}{=} vk_i$$

**优势**：密钥/签名大小减少 $w$ 倍，代价是验证计算增加。

## 5. 哈希树签名：Merkle 签名方案（MSS）

### 解决 Lamport 的一次性问题

Merkle 树允许用**一个**公钥支持 $2^h$ 次签名（$h$ 为树高）：

$$\text{生成 } 2^h \text{ 对 Lamport 密钥对 }(sk_i, vk_i)$$

以所有 $vk_i$ 为叶节点构建 Merkle 树，根 $\text{root}$ 作为最终公钥。

**第 $i$ 次签名**：
1. 用 $sk_i$ 签名消息，得 $\sigma_\text{Lamport}$
2. 提供 $vk_i$ 和 Merkle 树认证路径（$h$ 个兄弟节点）

**验证**：
1. 验证 Lamport 签名 $\sigma_\text{Lamport}$ 在 $vk_i$ 下合法
2. 验证 $vk_i$ 在 Merkle 树中的认证路径通向 $\text{root}$（公钥）

### 签名大小

$$|\sigma| = |\sigma_\text{Lamport}| + h \cdot \lambda$$

认证路径长度 $O(\log 2^h) = O(h)$。

## 6. 现代基于哈希的签名方案

| 方案 | 特点 |
|------|------|
| **XMSS** | 有状态，需跟踪已用密钥索引，RFC 8391 |
| **SPHINCS+** | 无状态（多层 Merkle + 随机化），NIST PQC 标准 |

**SPHINCS+** 优势：不需要维护状态（不担心重用密钥），代价是签名较大（约 8–49 KB）。

## 7. 后量子安全性

经典方案（RSA、ECDSA）依赖整数分解/离散对数——量子计算机可用 Shor 算法破解。

**基于哈希的签名安全性仅依赖哈希函数的预像抗性**，量子计算机对预像抗性的攻击优势仅为 Grover 算法提供的 $\sqrt{}$ 加速——增加哈希输出长度即可抵抗。

$$\text{SHA-512 预像抗性 vs 量子}: 2^{512/2} = 2^{256} \text{ 次量子操作，仍安全}$$

## 关键公式

**Lamport 签名**：

$$\sigma_i = x_{i, m_i}, \quad \text{验证：} H(\sigma_i) \stackrel{?}{=} y_{i, m_i}$$

**Merkle 认证路径验证**（叶节点 $vk_j$，路径 $\pi_1, \ldots, \pi_h$）：

$$h_0 = H(vk_j),\quad h_{k+1} = H(h_k \| \pi_{k+1}) \text{ 或 } H(\pi_{k+1} \| h_k)$$
$$\text{接受当且仅当 } h_h = \text{root}$$
