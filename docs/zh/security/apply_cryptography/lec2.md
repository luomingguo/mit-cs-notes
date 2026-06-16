# L2 · 对称加密：从 PRF 构造

> MIT 6.5610 (Spring 2026) · Lecture 2 · 2026-02-04
> 关键词：加密语法、完美保密、一次性密码本、计算不可区分性、CPA 安全、伪随机函数、ChaCha20、MAC

---

## 0. 一句话主线

本讲沿着"**安全定义的演化**"展开：从 Shannon 的完美保密（OTP）出发，发现它无法多次复用 → 放宽到**计算不可区分性** → 得到现代标准 **CPA 安全** → 用**伪随机函数（PRF）**这一"魔法"把不可达的理想（无限随机密码本）变为可高效计算的真实方案。

---

## 1. 加密方案的语法（Syntax）

<div class="definition">
**定义 1（对称加密方案 · *Symmetric Encryption Scheme*）**
由密钥空间 $\{K_\lambda\}$、消息空间 $\{M_\lambda\}$、密文空间 $\{C_\lambda\}$ 与两个算法 $(\mathrm{Enc}, \mathrm{Dec})$ 组成：
$$\mathrm{Enc}_\lambda : K_\lambda \times M_\lambda \to C_\lambda, \qquad \mathrm{Dec}_\lambda : K_\lambda \times C_\lambda \to M_\lambda.$$
**正确性**：对每个 $\lambda$、每个 $m \in M_\lambda$、每个 $k \in K_\lambda$，
$$\mathrm{Dec}_\lambda(k, \mathrm{Enc}_\lambda(k, m)) = m.$$

</div>

语法只规定"能正确解密"，**完全没说安全**。安全是本讲真正要打磨的东西。

---

## 2. 安全定义的三次迭代（Take 1 → 2 → 3）

### Take 1：完美保密（单消息）

<div class="definition">

**定义 2（Take 1 · 完美保密）**
对每个 $\lambda$、每对消息 $m_0, m_1 \in M_\lambda$：
$$\mathrm{Enc}(k, m_0) \equiv \mathrm{Enc}(k, m_1), \quad k \xleftarrow{R} K_\lambda,$$
其中 $\equiv$ 指两个分布**完全相同**：$\forall c,\ \Pr_k[\mathrm{Enc}(k,m_0)=c] = \Pr_k[\mathrm{Enc}(k,m_1)=c]$。

</div>

<div class="example">

**满足 Take 1 的方案：一次性密码本（*One-Time Pad, OTP*，Vernam 1917）**
取 $K_\lambda = M_\lambda = \{0,1\}^\lambda$：
$$\mathrm{Enc}(k,m) = k \oplus m, \qquad \mathrm{Dec}(k,c) = k \oplus c.$$
Shannon 证明了它满足完美保密。

</div>

**但 OTP 一旦复用密钥就崩**：

- 看到两个密文 $c_1, c_2$，攻击者算 $c_1 \oplus c_2 = m_1 \oplus m_2$，泄露两明文的异或；
- 看到一个**已知明文** $m$ 的密文 $c$，立刻恢复密钥 $k = c \oplus m$。

> 🔎 **核心观察**：密文是密钥的函数，因此**会泄露密钥信息**。我们需要"即便看到很多密文也安全"的方案。

### Take 2：多消息完美保密（不可达）

<div class="definition">

**定义 6 前身（Take 2）**
对所有 $\ell$、所有 $(m_1,\dots,m_\ell)$ 与 $(m_1',\dots,m_\ell')$：
$$(\mathrm{Enc}(k,m_1),\dots,\mathrm{Enc}(k,m_\ell)) \equiv (\mathrm{Enc}(k,m_1'),\dots,\mathrm{Enc}(k,m_\ell')).$$

</div>

> ⚠️ **两个不可达性结论**：
> 1. 确定性加密下，重复加密同一消息会被识别 → 必须允许 **Enc 随机化**（相应地把正确性改为以概率 1 成立，对 Enc 的硬币取概率）。
> 2. 即便随机化，**多次完美保密仍不可达**——直觉：每条密文都泄露一点 $k$ 的信息，密文足够多后 $k$ 的全部信息都被泄出。

### 计算不可区分性：打破不可达

密码学的"魔法"在于**放宽要求**：不要求两侧分布完全相同，只要求**对多项式时间敌手看起来相同**。

<div class="definition">

**定义 4（可忽略 · *Negligible*）** $\mu:\mathbb{N}\to\mathbb{N}$ 可忽略：对每个 $c$，存在 $n_c$，使 $\forall n > n_c$ 有 $\mu(n) < n^{-c}$。

</div>

<div class="definition">

**定义 5（计算不可区分 · *Computational Indistinguishability*，记作 $\approx$）**
分布族 $A=\{A_\lambda\}$ 与 $B=\{B_\lambda\}$ 计算不可区分，若对每个 PPT 区分器 $\mathcal{D}$，存在可忽略 $\mu$，使
$$\big|\Pr[\mathcal{D}(a)=1] - \Pr[\mathcal{D}(b)=1]\big| \le \mu(\lambda),\quad a\leftarrow A_\lambda,\ b\leftarrow B_\lambda.$$

</div>

> 🔎 **"优势"视角**：玩一个游戏——以 $\tfrac12$ 概率给 $\mathcal{D}$ 来自 $A$ 或 $B$ 的样本，约定 $A$ 时输出 0 算赢、$B$ 时输出 1 算赢。则
> $$\Pr[W] = \tfrac12 + \tfrac12\big(\Pr[\mathcal{D}(b)=1]-\Pr[\mathcal{D}(a)=1]\big).$$
> 括号内即**区分优势**；要它可忽略，等价于 $\Pr[W]$ 仅比抛硬币的 $\tfrac12$ 多出可忽略量。

### Take 3：计算版多消息安全

<div class="definition">

**定义 6（Take 3）** 把 Take 2 里的 $\equiv$ 换成 $\approx$：
$$(\mathrm{Enc}(k,m_1),\dots) \approx (\mathrm{Enc}(k,m_1'),\dots).$$

</div>

这已经很强，但"黄金标准"更强——还允许敌手**自适应地选消息**、甚至**索要任意密文的解密**（抗选择密文攻击 *CCA*）。本讲聚焦其中的 **CPA 安全**。

---

## 3. CPA 安全：现代标准（Chosen-Plaintext Attack）

<div class="definition">

**定义 7（CPA 安全 · 抗自适应选择明文攻击）**
方案 $(\mathrm{Enc},\mathrm{Dec})$ CPA 安全，若对每个 PPT 敌手 $\mathcal{A}$ 存在可忽略 $\mu$，使其在下述游戏中获胜概率至多 $\tfrac12 + \mu(\lambda)$：

1. 挑战者选密钥 $k \leftarrow K_\lambda$。
2. **学习阶段**：$\mathcal{A}(1^\lambda)$ 选 $m_i$，得到 $c_i \leftarrow \mathrm{Enc}_\lambda(k,m_i)$；可重复多项式次。
3. **挑战阶段**：$\mathcal{A}$ 选 $m_0, m_1$；挑战者掷 $b \leftarrow \{0,1\}$，回 $c \leftarrow \mathrm{Enc}(k, m_b)$。
4. $\mathcal{A}$ 输出 $b'$，当 $b' = b$ 时获胜。

</div>

> 🔎 直觉：即使敌手能**先随意点播**任意明文的加密（学习阶段），仍无法在挑战阶段分辨加密的是 $m_0$ 还是 $m_1$。这要求 Enc 必须随机化——否则学习阶段查一下 $m_0, m_1$ 的密文，挑战时比对即可。

---

## 4. 构造 CPA 安全方案

### 4.1 理想版：无限随机密码本

观察：若密钥是一个**真正随机函数** $F:\{0,1\}^\lambda \to \{0,1\}$（相当于无限长密码本），则可每次取一段新鲜的"伪密码本"：
$$\mathrm{Enc}(F, m) = (r,\ F(r) \oplus m),\qquad \mathrm{Dec}(F,(c_1,c_2)) = F(c_1) \oplus c_2,$$
$r \xleftarrow{R} \{0,1\}^\lambda$。只要加密次数远小于 $2^{\lambda/2}$，由生日界几乎不会出现 $r$ 重复（一旦 $r$ 不重，每条都退化为一次性 OTP，安全）。

> ⚠️ 问题：真正的随机函数无法存储/计算。于是引入它的高效"赝品"——**PRF**。

### 4.2 伪随机函数（PRF）

<div class="definition">

**定义 8（伪随机函数 · *Pseudorandom Function, PRF*）**
函数族 $\{F_\lambda\}$，$F_\lambda : K_\lambda \times X_\lambda \to Y_\lambda$，是 PRF，若对每个 PPT 敌手 $\mathcal{A}$ 存在可忽略 $\mu$，对每个 $\lambda$：
$$\Big| \Pr\big[\mathcal{A}^{F_\lambda(k,\cdot)}(1^\lambda)=1\big] - \Pr\big[\mathcal{A}^{R_\lambda(\cdot)}(1^\lambda)=1\big] \Big| \le \mu(\lambda),$$
其中 $k \xleftarrow{R} K_\lambda$，$R_\lambda : X_\lambda \to Y_\lambda$ 为真随机函数；$\mathcal{A}$ 对其预言机（$F_\lambda(k,\cdot)$ 或 $R_\lambda$）有**自适应**查询权。具体可设 $X=\{0,1\}^n,\ Y=\{0,1\}^m$。

</div>

> 🔎 **PRF vs PRG**：PRG 保证"输入随机时单个输出像随机"；PRF 更强——只要密钥随机抽取，**所有输出（无论输入怎么选）整体看像随机函数**。PRF 是带密钥的、可被任意点播的随机外观映射。

### 4.3 用 PRF 构造 CPA 安全加密

<div class="corollary">

**构造**：设 $F_\lambda : K_\lambda \times X_\lambda \to \{0,1\}^{m(\lambda)}$ 为 PRF。
$$\mathrm{Enc}_\lambda(k,m) = (r,\ m \oplus F(k,r)),\quad r \xleftarrow{R} X_\lambda; \qquad \mathrm{Dec}_\lambda(k,(r,c)) = F(k,r)\oplus c.$$
该方案 CPA 安全。

</div>

**证明思路（归约）**：用真随机函数 $R$ 替换 $F(k,\cdot)$。
1. 由 PRF 定义，"用 $F$"与"用 $R$"两个世界对任意 PPT 敌手计算不可区分（否则该敌手即破 PRF）。
2. 在"用 $R$"的世界里，只要挑战与各次查询的 $r$ 互不相同，$F(k,r)$ 被替换为新鲜均匀的 $R(r)$，密文退化为一次性 OTP，对 $b$ 完全无信息。
3. $r$ 发生碰撞的概率由生日界控制（查询数 $\ll 2^{|X|/2}$ 时可忽略）。
综合两步，敌手优势可忽略。（下一讲会**具体量化**两边敌手成功概率的关系。）

> 🔎 这是密码学最常用的"**混合论证 / 归约**"骨架：先用理想对象（$R$）替换真实对象（$F$），借不可区分把误差吸收进可忽略项，再在理想世界里直接证安全。

---

## 5. 实例与扩展

<div class="example">
**PRF 实例：流密码 ChaCha20（TLS 中使用）**
$$F_k(i) = \mathrm{ChaCha20}_k(\text{nonce}, i),$$
$i$ 为计数器；将 $F_k(i)$ 与明文流逐段异或得密文流（即计数器模式 *counter mode* 的思想）。下一讲展开 ChaCha20 细节。

</div>

### 用 PRF 保证完整性：MAC

加密保证机密性，但不保证**密文未被篡改**。可用同一 PRF 构造**消息认证码（*Message Authentication Code, MAC*）**：对消息（这里记作密文 $c$）附加标签
$$\text{tag} = F(k, c).$$
验证时重算比对。公钥设定下的对应物即**数字签名（signature）**，本课后续展开。

> ⚠️ **工程提醒**：机密性与完整性要**分别**保证。加密 + MAC 的正确组合是 **Encrypt-then-MAC**；实践中直接用 **AEAD**（如 ChaCha20-Poly1305、AES-GCM）一并搞定，避免手工拼装出错。

---

## 6. 小结（定义演化脉络）

```
完美保密(单消息, OTP)  →  多消息完美保密(不可达)  →  计算不可区分(≈)  →  CPA 安全(现代标准)
      Shannon                  必须随机化              放宽到 PPT 视角        允许自适应点播
```

- OTP 完美但不可复用；现代加密用 **PRF + 随机 nonce** 复现"无限密码本"。
- 安全的关键放宽是 **$\equiv \to \approx$**（信息论 → 计算论）。
- 归约证明 = "理想替换 + 不可区分吸收误差"。
- 落地务必用 AEAD 同时保机密性与完整性。
