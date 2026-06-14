# Lec 2 — 身份认证



## 1. 认证的基本框架

认证（Authentication）是大多数安全讨论的起点：**确认发出请求的是谁**。

系统处理请求的流程：

1. **认证（Authenticate）**：请求来自哪个用户/主体（principal）？
2. **授权（Authorize）**：该主体是否允许执行这一操作？
3. **审计（Audit）**：记录请求及决策日志，便于事后追责

## 2. 三种基本认证手段

| 类别                             | 示例          | 核心特点                 |
| -------------------------------- | ------------- | ------------------------ |
| **Something you know（知道的）** | 密码、PIN     | 可猜测，需高熵           |
| **Something you have（拥有的）** | 设备、U2F Key | 需物理获取才能攻击       |
| **Something you are（是什么）**  | 指纹、人脸    | 不可更改，需可信输入路径 |

## 3. 攻击模型（由弱到强）

### 3.1 直接攻击（Direct Attack）

攻击者从未见过用户认证，直接尝试猜测。  
适用防护：PIN/密码（本地设备）。

### 3.2 窃听攻击（Eavesdropping Attack）

攻击者观察用户多次认证的全部流量，再尝试冒充。  
适用防护：一次性密码（OTP）、TOTP。

### 3.3 主动攻击（Active Attack）

攻击者控制服务器，与用户交互后再冒充。  
适用防护：数字签名（U2F）。

**防护强度**：主动攻击防护 ⊃ 窃听攻击防护 ⊃ 直接攻击防护

## 4. 密码（Passwords）

### 4.1 好密码的标准

密码安全性取决于**对手视角下的熵**，而非格式复杂度：

- "password" 和 "passW0rd1!" 的熵都可能很低（在常见密码列表中）
- "yellow-elephant-reading" 三个随机单词拼接熵更高

**典型现象**：实际密码分布极度偏斜，5000 个最常用密码覆盖约 20% 的账户。

$$\text{若密码熵为 } b \text{ bits，攻击者需约 } 2^b \text{ 次猜测}$$

实践中用户密码熵约 20 bits，即 $2^{20} \approx 10^6$ 次即可破解大部分账户。

### 4.2 密码的防护措施

**限制猜测次数**：是核心防御——即使密码熵低，也能限制暴力攻击。

- 问题：可能导致 DoS（锁定合法用户）
- 网络上难以强制限制（来源 IP 多样、绕过方式多）

**密码强度建议**：

- 密码管理器生成高熵随机密码（推荐）
- 避免周期性强制更改（降低熵，用户往往选弱密码）

### 4.3 服务器端密码存储

**错误做法**：明文存储 `(username, password)` 表

**正确做法：加盐哈希**

```
存储：(username, salt, H(salt || password))
验证：计算 H(salt || pw_input)，与存储值比较
```

- **慢哈希函数（KDF）**：PBKDF2、bcrypt、scrypt——使暴力破解代价高昂
- **加盐（Salt）**：每个账户使用独立随机盐，防止彩虹表（rainbow table）攻击

## 5. 防窃听：挑战-响应协议

### 5.1 基本协议

共享密钥 $k$（客户端与服务器预先共享）：

$$\text{Server} \xrightarrow{c \text{（随机挑战）}} \text{Client}$$
$$\text{Client} \xrightarrow{t = \text{MAC}(k, c)} \text{Server}$$

攻击者即使监听到 $(c, t)$，也无法对新挑战 $c'$ 计算出有效 $t'$。

### 5.2 时间性一次性密码（TOTP）

客户端与服务器共享密钥 $k$，双方根据当前时间自动产生挑战：

$$\text{TOTP code} = \text{MAC}(k,\ \lfloor t / 30 \rfloor) \bmod 10^6$$

- 防止窃听攻击（每个 code 30秒失效）
- **仍然**易受 Phishing（攻击者实时转发 code）

### 5.3 防 Phishing：绑定服务器名称

U2F 简化原理：

$$\text{tag} = \text{Sign}(sk,\ c \| \text{server\_name})$$

计算机（浏览器）精确知道服务器名称，用户不依赖肉眼识别 URL。伪造网站（`amason.com`）得到的 tag 对真实 `amazon.com` 无效。

## 6. 防主动攻击：数字签名

每个用户持有：

- **私钥 $sk$**（本地保密）
- **公钥 $vk$**（服务器存储，无需保密）

认证流程：

$$\text{Server} \xrightarrow{c} \text{Client}$$
$$\text{Client} \xrightarrow{\sigma = \text{Sign}(sk, c)} \text{Server}$$
$$\text{Server 验证：} \text{Ver}(vk, c, \sigma) = 1$$

即使服务器被完全攻破，攻击者也无法获得 $sk$，无法伪造签名。

## 7. 双因素认证（2FA）

将两种认证方法结合，使安全失效相互独立：

- 密码被盗 ≠ 设备被盗
- 密码+TOTP：防弱密码，但 Phishing 仍可能同时获取两者
- 密码+U2F：防 Phishing（server name 绑定）

## 8. 生物特征（Biometrics）

本质是一种 Bearer Token，适用于**本地设备认证**（有可信输入路径）：

- 面部、指纹等难以更改（一旦泄露无法换新）
- 不适合网络认证（没有可信输入路径，对手可重放）
- Apple Face ID 用随机红外点阵确认是真实人脸

## 9. 会话与委托

### 会话（Session）

认证一次后建立 **session token**（高熵随机数），后续请求用 token 而非密码：

- HTTP Cookie 是典型实现
- Token 短期有效，降低被盗损失
- 敏感操作（如修改邮件转发）可要求重新认证

### 单点登录（SSO / Delegation）

用户向 A 认证，A 以密码学方式向 B 证明用户身份（无需 B 单独存储密码）：

- Kerberos、MIT Touchstone
- "Sign in with Google"

## 10. 注册与恢复

### 注册（Registration）

如何建立"身份↔凭证"的初始链接：

- 先到先得（开放系统，如 Gmail）
- 从其他已有机制引导（验证邮箱）
- 管理员创建（公司、学校）

### 恢复（Recovery）

密码或设备丢失后的处理：

- 恢复邮件、安全问题（易被社工攻击）
- 客服热线（策略模糊，高风险）
- 无法恢复（高价值身份须谨慎权衡）

## 关键公式 / 定义

**密码哈希存储**：

$$\text{存储：} (u, s, H(s \| pw)) \quad s \xleftarrow{\$} \{0,1\}^{128}$$

**TOTP**：

$$\text{code}_t = \text{MAC}(k, \lfloor t / 30 \rfloor) \bmod 10^6$$

**U2F（简化）**：

$$\sigma = \text{Sign}(sk,\ \text{nonce} \| \text{server\_name})$$

**挑战-响应（防窃听）**：

$$t = \text{MAC}(k,\ c \| \text{request}) \quad \text{绑定请求防篡改}$$

