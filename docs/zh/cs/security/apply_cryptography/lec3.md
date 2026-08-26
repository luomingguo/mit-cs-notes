---
title: 对称原语 I：PRF、计数器模式与 ChaCha20
type: lecture
lecture: 3
tags: []
status: complete
---
# Lec 3 对称原语 I：PRF、计数器模式与 ChaCha20

> MIT 6.5610 · Lecture 3 · 关键词：PRF 安全游戏（具体界）、CPA 具体安全、计数器模式、ChaCha20、ARX、侧信道
> *来源：2025 版讲义（Henry Corrigan-Gibbs），2026 同主题"Symmetric-key primitives I"，内容一致。*

---

## 0. 为何研究对称原语

对称原语是**实践中最重要**的密码构件——你每台联网设备的加密几乎都在用。目标不是让你自己写实现/设计密码，而是**深入理解加密系统在实践中如何运作**。

---

## 1. PRF 安全游戏（具体安全视角）

::: definition
**定义 1–2（PRF 安全游戏与 PRF）**
游戏由 PRF $F:K\times X\to Y$、敌手 $\mathcal{A}$、比特 $b$ 参数化：
- 挑战者抽 $k\xleftarrow{R}K$；若 $b=0$ 置 $f(\cdot):=F(k,\cdot)$，若 $b=1$ 置 $f\xleftarrow{R}\mathrm{Funs}[X,Y]$（全体函数）。
- 敌手自适应查询 $x_i$，得 $y_i=f(x_i)$，最后输出 $\hat b$。

记 $W_b$ 为敌手在比特 $b$ 下输出"1"的概率，定义优势
$$\mathrm{PRFAdv}[\mathcal{A},F] := \big|\Pr[W_0]-\Pr[W_1]\big|.$$
$F$ 为 PRF 当且仅当对所有高效 $\mathcal{A}$ 该优势"可忽略"。
:::

> 🔎 **两种视角**：
> - *理论*：一切按安全参数 $\lambda$（可理解为密钥长度）参数化，算法与敌手多项式时间，可忽略 = 关于 $\lambda$ 可忽略。
> - *实践*：固定密钥 128/256 位，要求 PRF "够快"，防御 $2^{80}$ 级攻击者，"可忽略"取某小常数如 $2^{-64}$。

::: theorem
**若 $P=NP$ 则 PRF 不存在。**
攻击者查询 $x_1,\dots$ 得 $y_1,\dots$，用电路-SAT 求解器找满足 $C(k)=\bigwedge_i (y_i = F(k,x_i))$ 的密钥 $k$：若存在这样的 $k$，几乎肯定身处 PRF 世界。故安全 PRF 的存在**蕴含 $P\ne NP$**。
:::

---

## 2. 对称原语的"假设哲学"

- **"漂亮"假设**：如 Rabin 基于因子分解困难——双赢局面（要么密码安全，要么得到惊人的分解算法）。但基于此类假设的分组密码**太慢**。
- **ad-hoc 假设**：直接假设 AES 是安全分组密码——没有干净的数学假设可归约。评估流程：用已知攻击试破 → 办竞赛互相攻击 → 经数年审视后认定"够好"。
- 有趣的是：多数密码学家对"AES 是安全 PRF"的信心，**高于**对"因子分解/离散对数困难"的信心。当下密码设计的难点常常不是安全，而是在各种硬件上拿到好性能。

---

## 3. 计数器模式（CTR / Counter Mode）

设 PRF $F:K\times\{0,1\}^n\to\{0,1\}^n$，参数 $\ell$ 决定可加密的消息长度。

::: theorem
**CTR 加密**
$$\mathrm{Enc}(k,(m_1,\dots,m_\ell)): r\xleftarrow{R}\{0,1\}^n\ (\text{nonce}),$$
$$\text{输出}\ (r,\ F(k,r)\oplus m_1,\ F(k,r{+}1)\oplus m_2,\ \dots,\ F(k,r{+}\ell{-}1)\oplus m_\ell).$$
解密对应逐块异或回去。
:::

**具体安全界**：对任意做至多 $T$ 次长度-$\ell$ 加密查询的敌手 $\mathcal{A}$，存在运行时间相近的 PRF 敌手 $\mathcal{B}$，使
$$\mathrm{CPAAdv}[\mathcal{A},E] \le 2\cdot\mathrm{PRFAdv}[\mathcal{B},F] + \frac{2T^2\ell^2}{2^n}.$$

> 🔎 **证明思路**：先把 PRF 换成真随机函数（误差 = PRF 优势）；只要 nonce 不重用，敌手看到的就是明文异或真随机值（OTP）。第二项 $\frac{2T^2\ell^2}{2^n}$ 即 nonce 碰撞的生日界。当 $T^2\ell \ll 2^n$ 时安全；当 $T^2\ell \approx 2^n$ 时**真的可被攻破**（存在 CPA 攻击）。

**工程要点**：
- **可并行**：各块独立，多核/SIMD 友好——现代密码性能关键。
- **有状态 CTR**：nonce 不必随机，只需**绝不重用** $F(k,r)$。共享状态时可从 $r=0$ 递增，省去传输 $r$，代价是维护同步状态。
- **为何从小原语搭起**：理论上想知道最小假设；实践上密码分析极其昂贵，从极少数核心原语搭出大量工具，能让分析者聚焦这几个关键原语。

---

## 4. ChaCha20：用作 CTR 加密的 PRF

TLS 中用于保护 HTTPS 的流密码，本质是"构造一个 PRF 再用计数器模式"。

$$F_{\text{chacha}}:\{0,1\}^{256}\times\{0,1\}^{128}\to\{0,1\}^{512}.$$

::: example
**ChaCha20 PRF 构造**
基于一个 $\{0,1\}^{512}$ 上的**公开置换** $\Pi$（"信仰之跃"：把它当作理想随机对象就能在理想模型下证明 PRF 安全，但它其实有极短实现）。
$$F_{\text{chacha}}(k,x) := \mathrm{pad}(k,x)\ \oplus\ \Pi(\mathrm{pad}(k,x)),$$
其中 $\mathrm{pad}$ 把密钥、输入和 128 位常量映射成 $4\times4$ 的 32 位矩阵（常量拼出 `expand 32-byte k`，是"nothing-up-my-sleeve"数）。
:::

**置换 $\Pi$ 的核心**——`quarterRound`（Salsa 版，比 ChaCha 略简）：

```text
quarterRound(a,b,c,d):
  b ^= (a + d) <<< 7;
  c ^= (b + a) <<< 9;
  d ^= (c + b) <<< 13;
  a ^= (d + c) <<< 18;     // <<< 为循环左移
```

故称 **ARX 密码**（Add-Rotate-XOR）。$\Pi$ 把矩阵视为 $4\times4$，先对**列**应用 quarter-round，再对**移位后的列**（对角）应用，迭代 10 次。

> ⚠️ **安全工程**：4 个 quarter-round 可并行（SIMD 指令加速）；且**无秘密相关/数据相关的内存访问**——这对防御**时序与缓存侧信道**（攻击者通过内存访问耗时窃取秘密比特）至关重要。

---

## 5. 本讲小结

- PRF 安全用**优势游戏**刻画；安全 PRF 存在 ⟹ $P\ne NP$。
- CTR 模式把定长 PRF 扩成长消息加密，安全界含 PRF 优势 + nonce 生日项，**nonce 绝不可重用**。
- ChaCha20 = pad ⊕ 公开置换，ARX 结构、常时实现防侧信道，TLS 实战首选之一。
- CPA 安全只是"够用的构件"，实战请用 AEAD（认证加密）。
