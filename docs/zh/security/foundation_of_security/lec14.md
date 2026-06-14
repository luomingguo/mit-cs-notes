# Lec 14 — 软件信任（Software Trust）
> MIT 6.1600 · Introduction to Computer Security

## 1. 核心问题

> 我们如何知道系统正在运行我们期望的软件？

这一问题在两种场景下都至关重要：
- **本地操作**：在自己的设备上输入密码时
- **远程通信**：向远程服务器发送敏感数据时

## 2. 威胁来源：软件供应链

从软件开发到运行，经历多个环节，每个都可能引入问题：

```
1. 开发者编写代码（使用第三方库）
2. 编译器构建打包
3. 软件商分发二进制包
4. 用户下载软件
5. 用户更新软件
6. 用户在设备上运行应用
7. 运行中的应用与远程服务器交互
```

任一环节被攻破均可导致用户运行恶意软件。

## 3. 库导入（Library Imports）

### 3.1 Python/PyPI 方式

```bash
pip install requests
```

**优点**：中心化服务，易发现和更新软件包  
**缺点**：
- PyPI 被攻破 → 大规模感染
- 用户无从知晓谁实际写了代码
- 命名冲突（dependency confusion）：公共包 vs 私有包同名，`pip` 选哪个？

**Dependency Confusion 攻击**：攻击者在 PyPI 发布与内部私有包同名的恶意包，某些 pip 配置会优先安装公共版本。

### 3.2 Go 方式（更显式的信任）

```go
import "github.com/grpc/grpc-go"
```

**优点**：
- 包名即 URL，无命名歧义
- 去中心化，避免单点攻击

**缺点**：需信任 GitHub 等托管平台的分发诚实性

`go.sum` 锁文件：记录已下载包的哈希值，之后更新时验证一致性（"首次信任，之后锁定"）：

$$\text{go.sum}: \text{包名}@\text{版本} \to H(\text{代码})$$

### 3.3 代码签名（Code Signing）

开发者用私钥 $sk_\text{dev}$ 签名软件包：

$$\sigma = \text{Sign}(sk_\text{dev},\ \text{package})$$

用户安装时验证 $\sigma$，确认来自该开发者——即使分发服务器被攻破，攻击者无法伪造有效签名。

**首次信任（Trust on First Use, TOFU）**：首次安装时接受开发者公钥，之后所有更新必须用同一密钥签名。

## 4. 构建可信二进制（Reproducible Builds）

源代码（人类可审计）→ 二进制（难以审计）的转换过程本身是攻击面：

**XCodeGhost 案例**（2015）：攻击者分发了含木马的 XCode 版本。诚实开发者用被感染的编译器编译出的 App 中自动包含恶意代码，绕过了 App Store 审查。

### 4.1 可重现构建（Reproducible Builds）

若构建过程是**确定性的**（Deterministic）：

$$\text{Build}(\text{source}) \text{ 对任何人、任何时间 = 相同二进制}$$

则任何人可以独立构建并比较结果：

- 若独立构建的哈希值一致 → 构建过程诚实
- 若不一致 → 构建服务器可能被篡改

**实现挑战**：传统编译器引入大量不确定性（时间戳、内存布局等）。Go 1.21+ 支持可重现构建。

### 4.2 版本锁定

用 `go.sum`、`poetry.lock`、`package-lock.json` 等锁文件记录精确版本+哈希，防止依赖被静默替换。

## 5. 软件分发与签名策略

### 5.1 开发者自签名（Android APK）

开发者持有私钥，对每个发布版本签名：
- 无需信任分发渠道
- 但需用户首次获取开发者公钥（TOFU）
- 签名不保证"新鲜度"——旧版本签名永远有效（Rollback 攻击）

**防回滚**：在签名中包含**版本号**，设备记录已安装的最高版本，拒绝降级。

### 5.2 仓库签名（Linux apt/pacman）

仓库签名整个软件目录 + 时间戳清单：

$$\sigma_\text{repo} = \text{Sign}(sk_\text{repo},\ \text{manifest} \| \text{timestamp})$$

用户可从任意镜像获取包（CDN），只需验证仓库的签名。

### 5.3 第三方验证签名（Windows Driver / App Store）

平台审查代码后为其签名；用户只接受带有平台签名的软件。

- 提高进入门槛，减少恶意软件
- **代价**：平台控制分发渠道（商业约束）

### 5.4 二进制透明度（Binary Transparency）

类似证书透明度（CT），所有发布二进制必须记入**公开审计日志**：

$$\text{客户端对比：本地收到的二进制哈希 = 日志中的公开哈希}$$

防止针对性攻击：攻击者无法只给特定目标分发恶意版本，因为这样做必须公开记录。

## 6. 启动链安全（Secure Boot）

### 6.1 安全启动原理

设备包含**只读 Boot ROM**，内含硬编码的签名验证公钥 $vk_\text{ROM}$：

$$\text{Boot ROM} \xrightarrow{\text{验证} vk_\text{ROM}} \text{Bootloader} \xrightarrow{\text{验证} vk_\text{BL}} \text{OS Kernel} \to \cdots$$

每层验证下一层的签名，只有通过验证的软件才被执行。

| 平台 | 使用 Secure Boot |
|------|----------------|
| iPhone / Android | ✓ |
| Chromebook | ✓ |
| 游戏机（PS/Xbox） | ✓（防止运行非授权 OS）|
| UEFI（PC） | ✓（可选）|

**Checkra1n 破解（iDevice）**：Boot ROM 中的 USB 代码存在 bug，通过 USB 触发漏洞绕过签名验证。由于 Boot ROM 不可更新，该漏洞对所有受影响设备永久有效（但需每次重启后重新利用）。

### 6.2 度量启动（Measured Boot）

不验证软件"是否被允许"，而是**度量（哈希）**实际运行的软件：

$$k_\text{disk} = \text{KDF}(\text{hardware\_secret},\ H(\text{bootloader}) \| H(\text{kernel}) \| \ldots)$$

不同软件 → 不同哈希 → 不同密钥 → 无法解密存储数据。

- 恶意软件可以启动，但无法访问加密数据
- 用于远程证明（Remote Attestation）：向对端证明自己运行了特定版本的软件

## 7. 安全注意键（Secure Attention Key）

**问题**：输入 PIN 时，怎么知道是在输入给银行 App 而不是后台恶意 App？

**方案**：特殊组合键（Windows: Ctrl-Alt-Del）或按钮（手机 Home/Power），**直接陷入 OS 内核**，无论当前运行何种应用——保证登录界面来自可信 OS。

## 关键原则

| 原则 | 内容 |
|------|------|
| **代码签名** | 分发阶段验证来源，防止分发渠道被攻破 |
| **可重现构建** | 让构建过程可审计 |
| **Secure Boot** | 确保启动链每一层都是被信任的代码 |
| **度量启动** | 度量实际运行的代码，绑定密钥 |
| **首次信任+锁定** | 初次接受公钥后验证后续更新的一致性 |
