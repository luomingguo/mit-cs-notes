# Lec 3 — Collision Resistance & File Authentication
> MIT 6.1600 · Introduction to Computer Security

## 1. 哈希函数的基本定义

**密码哈希函数（Cryptographic Hash Function, CHF）**：

$$H: \{0,1\}^* \to \{0,1\}^n$$

将任意长度输入映射到固定长度 $n$ bits（通常 $n = 256$ 或 $512$）。

## 2. 碰撞抗性（Collision Resistance）

### 2.1 定义

**碰撞（Collision）**：存在两个不同输入 $x \neq x'$，使得 $H(x) = H(x')$。

**碰撞抗性（CRHF）**：对任意 PPT（概率多项式时间）对手 $\mathcal{A}$：

$$\Pr\left[(x, x') \leftarrow \mathcal{A}(H)\ :\ x \neq x'\ \wedge\ H(x) = H(x')\right] \leq \mathrm{negl}(\lambda)$$

注意：碰撞一定存在（鸽巢原理，$|\{0,1\}^* > |\{0,1\}^n|$），但无法有效找到。

### 2.2 生日界（Birthday Bound）

若攻击者随机采样 $q$ 个输入并寻找碰撞：

$$\Pr[\text{collision found}] \approx \frac{q^2}{2^{n+1}}$$

当 $q \approx 2^{n/2}$ 时碰撞概率约 $1/2$。

因此 $n = 256$ bits 的哈希函数，暴力碰撞攻击需 $\approx 2^{128}$ 次，安全。

### 2.3 CRHF 的意义

碰撞抗性是比预像抗性（Preimage Resistance）更强的性质：

| 性质 | 定义 |
|------|------|
| 预像抗性（One-way） | 已知 $h$，难找 $x$ 使 $H(x) = h$ |
| 第二预像抗性 | 已知 $x$，难找 $x' \neq x$ 使 $H(x) = H(x')$ |
| **碰撞抗性** | 难找任意 $(x, x')$ 使 $x \neq x'$ 且 $H(x) = H(x')$ |

$$\text{CRHF} \Rightarrow \text{第二预像抗性} \Rightarrow \text{预像抗性}$$

## 3. 文件认证（File Authentication）

### 3.1 问题设定

Alice 想从不可信服务器下载文件 $F$，保证下载到的内容没有被篡改。

**方案**：
- 下载前，Alice 从**可信渠道**获得 $H(F)$（例如软件官网上列出的 SHA-256 校验和）
- 下载完成后，计算 $H(F')$，与已知的 $H(F)$ 比对

如果 $H(F') = H(F)$，那么由碰撞抗性可知 $F' = F$（否则即发现了碰撞）。

### 3.2 摘要（Digest）作为简洁表示

哈希值可视为文件的**指纹（fingerprint）**：
- 固定长度（32 bytes for SHA-256），无论文件多大
- 可公开发布在小带宽信道（如邮件、公告板）
- 对比时 $O(n)$ 时间

### 3.3 Merkle 树（用于大规模文件认证）

当文件被分为 $n$ 块 $F_1, \ldots, F_n$ 时，Merkle 树允许：
- **完整性验证**：无需下载全部块即可验证某块 $F_i$ 的合法性
- **认证路径长度**：$O(\log n)$

构造方式（二叉树底向上）：

$$h_i = H(F_i) \quad \text{（叶节点）}$$
$$h_{\text{parent}} = H(h_{\text{left}} \| h_{\text{right}}) \quad \text{（内节点）}$$

根哈希 $h_\text{root}$ 为整棵树的摘要，需从可信渠道获取。

验证 $F_i$ 时只需提供从 $F_i$ 到根的兄弟节点哈希（认证路径），验证者自底向上重新计算即可。

## 4. 现实中的哈希函数

### SHA-2 系列

| 变体 | 输出长度 | 安全性 |
|------|---------|--------|
| SHA-256 | 256 bits | $2^{128}$ 安全 |
| SHA-512 | 512 bits | $2^{256}$ 安全 |

**SHA-256 内部结构**：Merkle-Damgård 构造

$$H(m) = f(f(f(IV, m_1), m_2), \ldots, m_k)$$

其中 $IV$ 是固定初始值，$m_1, \ldots, m_k$ 为填充后的消息块，$f$ 是压缩函数。

### SHA-3（Keccak）

基于 Sponge 结构，吸收（absorb）阶段与挤出（squeeze）阶段分离，抗 Length-Extension 攻击。

## 5. 不可以用 CRHF 做的事

CRHF **不提供**密钥控制的认证！如果 Alice 直接发送 $(m, H(m))$ 给 Bob：
- 攻击者拦截消息，把 $m$ 换成 $m'$，同时发送 $H(m')$
- Bob 验证通过——但收到了假消息

$\Rightarrow$ 需要 **MAC** 来提供**带密钥的消息认证**（见 Lec 4）

## 6. 承诺方案（Commitment Scheme）

### 定义

承诺方案允许 Alice 在不透露内容的情况下"锁定"一个值，之后再公开：

- **Commit**：$c \leftarrow \mathrm{Commit}(m; r)$，$r$ 为随机数
- **Open**：公开 $(m, r)$，验证者检查 $c \stackrel{?}{=} \mathrm{Commit}(m; r)$

### 安全性质

| 性质 | 含义 |
|------|------|
| **隐藏性（Hiding）** | $c$ 不泄露 $m$ 的任何信息 |
| **绑定性（Binding）** | Alice 无法在公开后更改 $m$（不存在 $m' \neq m$ 使 $c = \mathrm{Commit}(m'; r')$） |

### 基于 CRHF 的简单构造

$$c = H(r \| m) \quad r \xleftarrow{\$} \{0,1\}^{256}$$

- **绑定**：找到 $(m', r')$ 使 $H(r \| m) = H(r' \| m')$ 即找到碰撞
- **隐藏**：$r$ 随机且足够长，$H$ 的预像抗性保证 $m$ 被隐藏

## 关键要点

1. CRHF 是文件完整性验证的基础：$H(F)$ 即文件指纹
2. 生日攻击要求 $n \geq 256$ bits 才安全（$2^{128}$ 暴力代价）
3. Merkle 树将认证开销从 $O(n)$ 降为 $O(\log n)$
4. CRHF 不提供消息认证（无密钥），需 MAC 配合
