# Lecture 10: Cryptography

> MIT 6.1200J Mathematics for Computer Science, Spring 2024

------

## 1. 密码学基础概念

**密码学**（*cryptography*）：保护信息的艺术与科学。核心目标：加密（*encrypt*）消息，使得只有指定接收方能解密（*decrypt*）。

**角色约定：**

- **Alice**：发送方
- **Bob**：接收方
- **Eve**：窃听者（*eavesdropper*），能看到所有传输内容

**密码方案**（*cryptographic scheme*）= 加密算法 + 解密算法。

------

## 2. 历史演进（概览）

### 2.1 Caesar 密码 → Caesar 移位

- **Caesar 密码：** 每个字母固定向后移 3 位（$\text{A-Z}$ 视为 $1$-$26$，加 $3 \pmod{26}$）。"Security by Obscurity"，已知方案即可破解。
- **Caesar 移位：** 引入秘密密钥 $k$，加密 $+k \pmod{26}$，解密 $-k \pmod{26}$。但密钥空间仅 26，**暴力破解**（*brute force attack*）可轻松穷举。

### 2.2 代换密码 (*Substitution Cipher*)

密钥是一张字母映射表（$26!$ 种可能），穷举不可行。
 但可被**频率分析**（*frequency analysis*）破解：高频密文字母对应高频明文字母（如英文中的 E）。

### 2.3 德国 Enigma 机

机械式变位设备，约 $3 \times 10^{114}$ 种配置。"Security by Hubris"——设计者自认无法破解，但盟军仍将其攻破，关键利用了**已知明文攻击**（*known plaintext attack*，如固定格式的气象报文）。

### 2.4 一次性密码本 (*One-Time Pad*)

将消息视为大整数 $m$（$0 \leq m < n$），加密：$\text{enc}(m, k) = (m + k) \operatorname{rem} n$，解密：$m = (\text{enc} - k) \operatorname{rem} n$。

**优点：** $k$ 均匀随机时，密文完全均匀随机，信息零泄露（*information-theoretically secure*）。

**致命缺点——密钥不可复用：**

- 已知明密文对 $\Rightarrow$ 可还原 $k$（已知明文攻击）。
- 两条密文之差 $= $ 两条明文之差（模 $n$），信息泄露。

**根本矛盾：** 安全地传送新密钥，本身就需要一个已有的安全信道——循环依赖。

------

## 3. Diffie-Hellman 密钥交换

**目标：** Alice 和 Bob 在公开信道上协商出共同秘密 $k$，Eve 无法得知。

**依赖的困难问题：** 离散对数问题（*discrete logarithm problem*）——已知 $c$、$c^a \bmod n$，求 $a$ 计算上不可行（$n$ 为大质数时）。

**协议：**

1. 公开大质数 $n$ 和随机基 $c$（$1 < c < n-1$）；
2. Alice 选随机私钥 $a$，计算并发送 $c^a \bmod n$；
3. Bob 选随机私钥 $b$，计算并发送 $c^b \bmod n$；
4. Alice 计算 $(c^b)^a \bmod n = c^{ab} \bmod n$；
5. Bob 计算 $(c^a)^b \bmod n = c^{ab} \bmod n$；
6. 共同秘密 $= c^{ab} \bmod n$。

Eve 知道 $c^a \bmod n$ 和 $c^b \bmod n$，但无法从中高效推出 $c^{ab} \bmod n$（需解离散对数）。

**实现细节：** 计算 $c^a \bmod n$（$a$ 有数百位）使用**快速幂**（*repeated squaring*），仅需 $O(\log a)$ 次模乘运算。

------

## 4. RSA 公钥密码系统

**背景：** Rivest、Shamir、Adleman 三人于 MIT 发明，2002 年获图灵奖。现代互联网安全基石。

**公钥密码**（*public-key cryptosystem*）的惊人之处：加密密钥可以公开，但只有持有私钥的人才能解密。

### 4.1 密钥生成

1. 选取两个大质数 $p, q$（保密），令 $n = pq$（公开）；
2. 选取与 $(p-1)(q-1)$ 互质的整数 $e$（公开）；
3. 用 Pulverizer 计算 $d \equiv_{(p-1)(q-1)} e^{-1}$（保密），即 $ed \equiv_{(p-1)(q-1)} 1$；
4. **公钥** $k_p = (n, e)$，**私钥** $k_s = (n, d)$。

### 4.2 加解密

$$\text{加密：}\quad E(m, k_p) = m^e \bmod n$$ $$\text{解密：}\quad D(c, k_s) = c^d \bmod n$$

### 4.3 正确性证明

需证 $m^{ed} \equiv_n m$。

设 $ed = 1 + t(p-1)(q-1)$。对模 $p$（设 $\gcd(m, p) = 1$）：

$$m^{ed} = m^{1 + t(p-1)(q-1)} = m \cdot (m^{p-1})^{t(q-1)} \equiv_p m \cdot 1^{t(q-1)} \equiv_p m$$

（最后一步用了 Fermat 小定理：$m^{p-1} \equiv_p 1$）

同理 $m^{ed} \equiv_q m$，故 $p \mid (m^{ed} - m)$ 且 $q \mid (m^{ed} - m)$。
 因 $\gcd(p, q) = 1$，由 CRT 得 $pq \mid (m^{ed} - m)$，即 $m^{ed} \equiv_n m$。$\blacksquare$

### 4.4 安全性

- **公开：** $n = pq$，$e$。
- **保密：** $p$，$q$，$d$。
- **安全假设：** 分解大整数 $n = pq$ 计算上不可行（**大整数分解困难假设**）。
- 额外假设：**RSA 假设**（计算 $e$ 次方根模 $pq$ 困难）和**扩展黎曼假设**（ERH）。
- 量子计算机可高效分解大整数（Shor 算法），RSA 届时将不安全。

### 4.5 寻找大质数

- 用 **Miller-Rabin 算法**高效检验一个数是否为质数。
- **质数定理**（*Prime Number Theorem*）：$\pi(k) \sim k / \ln k$，即在 $k = 10^{300}$ 附近，约每 $\ln(10^{300}) \approx 700$ 个数中有一个质数，随机试验期望约 700 次即可找到。

------

## 5. 中国剩余定理 (*Chinese Remainder Theorem, CRT*)

> **Theorem (CRT).** 设 $p, q$ 互质，$a, b \in \mathbb{Z}$。则在模 $pq$ 意义下，方程组
>
> $$x \equiv_p a, \qquad x \equiv_q b$$
>
> 存在唯一解 $x$（$0 \leq x < pq$）。

**构造解（存在性）：**

定义：

- $p^{-1}$：$p$ 模 $q$ 的逆元；$e_q = p^{-1} \cdot p$，则 $e_q \equiv_p 0$，$e_q \equiv_q 1$；
- $q^{-1}$：$q$ 模 $p$ 的逆元；$e_p = q^{-1} \cdot q$，则 $e_p \equiv_p 1$，$e_p \equiv_q 0$；
- $x = a e_p + b e_q$。

验证：

$$x \equiv_p a \cdot 1 + b \cdot 0 = a, \qquad x \equiv_q a \cdot 0 + b \cdot 1 = b \qquad \checkmark$$

**唯一性：**

设 $x, x'$ 均满足，令 $y = x - x'$。则 $p \mid y$ 且 $q \mid y$。
 由 $\gcd(p, q) = 1$，用 Bézout 恒等式可推出 $pq \mid y$，即 $x \equiv_{pq} x'$。$\blacksquare$

**Example.** $0 \leq x < 55$，$x \equiv_5 4$，$x \equiv_{11} 7$。
 满足 $x \equiv_{11} 7$ 的数：$7, 18, 29, 40, 51$；其中 $29 \equiv_5 4$，故 $x = 29$。

------

## 6. 关键术语速查

| 英文                              | 中文                    |
| --------------------------------- | ----------------------- |
| *Cryptography*                    | 密码学                  |
| *Encrypt / Decrypt*               | 加密 / 解密             |
| *Eavesdropper*                    | 窃听者                  |
| *Cryptographic scheme*            | 密码方案                |
| *Brute force attack*              | 暴力破解                |
| *Frequency analysis*              | 频率分析                |
| *Known plaintext attack*          | 已知明文攻击            |
| *One-time pad*                    | 一次性密码本            |
| *Discrete logarithm problem*      | 离散对数问题            |
| *Diffie-Hellman key exchange*     | Diffie-Hellman 密钥交换 |
| *Repeated squaring*               | 快速幂 / 反复平方法     |
| *Public-key cryptosystem*         | 公钥密码系统            |
| *RSA*                             | RSA 加密算法            |
| *Public key / Secret key*         | 公钥 / 私钥             |
| *Prime Number Theorem*            | 质数定理                |
| *Miller-Rabin*                    | Miller-Rabin 素性检验   |
| *Chinese Remainder Theorem (CRT)* | 中国剩余定理            |