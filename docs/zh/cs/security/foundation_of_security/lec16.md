---
title: '案例研究：iOS 安全（Case Study: iOS Security）'
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 16
kind: theory
tags: []
status: complete
---
# Lec 16 案例研究：iOS 安全（Case Study: iOS Security）
> MIT 6.1600 · Introduction to Computer Security

## 1. iOS 的安全威胁模型

智能手机面临的安全威胁：
- **恶意 App**：窃取联系人、窃听通话、盗取信用卡信息
- **设备被盗**：物理获取设备后提取敏感数据
- **非授权 OS（越狱）**：绕过 Apple 对 App 安装的限制
- **供应链攻击**：出厂或维修时植入恶意芯片
- **仿冒设备**：假冒正版 iPhone 销售

iOS 是课程前几章平台安全知识（隔离、受控共享、委托、软件信任）的集成应用。

## 2. App 安全（应用沙箱）

### 2.1 开放性与安全性的权衡

| 平台 | 开放性 | 敏感数据访问 |
|------|--------|-------------|
| 传统 PC | 任何人可开发/安装 | 完全访问文件系统 |
| Web 浏览器 | 任何网站可运行 JS | 语言级沙箱限制访问 |
| **iOS** | 仅审核通过的开发者 | 沙箱 + API 审批 |

iOS 通过**关闭**开发者准入（只有通过审核的 App Store 应用可安装）来提升安全性，同时用沙箱限制已安装 App 的权限。

### 2.2 沙箱机制

iOS App 运行在沙箱中：
- **无共享文件系统**：每个 App 只能访问自己的目录
- **App 间通信**：只能通过 OS 提供的有限 API
- **敏感数据访问**（VPN 配置、健康数据等）：须向 Apple 申请特殊 API 权限，审核通过才能使用

### 2.3 漏洞案例：XCodeGhost

2015 年，中国开发者使用通过镜像分发的被污染 XCode 编译器，导致 App 中被自动注入恶意代码。这些 App 通过了 App Store 审查。

即便如此，沙箱仍提供了关键保护——恶意 App 虽然绕过了审查，但仍受沙箱限制，无法访问短信、浏览器历史等。

**被允许的操作**（沙箱内）：
- 获取国家/语言设置
- 读取/修改剪贴板内容（可能含密码或信用卡号！）
- 打开指向钓鱼页面的 URL

## 3. iOS 安全启动（Secure Boot）

### 3.1 信任链

每个 iPhone 出厂时内置一个**不可更改的 Boot ROM**，内含 Apple 签名验证公钥 $vk_\text{ROM}$：

$$\text{Boot ROM} \xrightarrow{\ \text{verify}(vk_\text{ROM},\cdot)\ } \text{Bootloader} \xrightarrow{\ \text{verify}(vk_\text{BL},\cdot)\ } \text{OS Kernel}$$

只有 Apple 签名的 Bootloader 和 OS 才能在 iPhone 上运行。

**目的**：
- 防止分发含后门的 OS
- 防止恶意软件持久化（重启后恢复）
- 业务原因：防止用户安装非 App Store 系统（越狱后安装未审核 App，绕过 Apple 分成）

### 3.2 Checkra1n 越狱

Boot ROM 中包含 USB 调试代码（DFU 模式），该代码存在 bug。  
攻击者利用 USB 漏洞在 Boot ROM 阶段执行任意代码，绕过签名检查。

**关键问题**：Boot ROM 永不可更新 → 苹果无法修复 → 该漏洞对受影响设备**永久有效**。

但该漏洞**不能绕过签名验证**，只能在推迟验证的时间窗口内攻击——因此越狱在每次重启后失效，需重新触发。

## 4. 静止数据保护（Data at Rest）

### 4.1 基本加密

设备数据用 128-bit AES 全盘加密。

**问题**：密钥存在哪里？
- 存普通闪存 → 攻击者直接读取
- 直接用 6 位 PIN → 仅 $10^6$ 种可能，暴力破解 ≤ 1 秒

### 4.2 Secure Enclave（安全飞地）

iPhone 内含一颗独立的 **Secure Enclave** 芯片，运行独立 OS，自带独立 Secure Boot。

**首次启动时**：Secure Enclave 生成唯一设备密钥（UID），写入内部熔丝（不可读取，不可修改）。

**关键流程**：

```text
用户输入 PIN
    ↓
iOS 将 PIN 发给 Secure Enclave
    ↓
Secure Enclave 施加猜测限制（每次延迟、达上限擦除密钥）
    ↓
Secure Enclave 计算 H(PIN, UID)，发给 Secure NVRAM 验证
    ↓（通信本身也加密）
NVRAM 对比存储哈希：
  正确 → 返回 AES 根密钥，清零猜测计数器
  错误 → 递增计数器，达上限擦除密钥
    ↓
Secure Enclave 将 AES 密钥送 AES 引擎（主处理器从不接触密钥）
```

### 4.3 关键安全性质

- **AES 密钥不离开 Secure Enclave**：主 CPU 无法提取
- **暴力破解受限**：无法并行猜 PIN（必须通过 Secure Enclave，有延迟和次数限制）
- **UID 绑定**：即使取出闪存芯片放入另一台设备，仍无法解密（UID 不同）
- **度量启动**：Secure Enclave OS 被替换 → UID 派生的密钥改变 → 无法解密数据

### 4.4 Effaceable Storage（可擦除存储）

传统存储"删除"实际是标记删除，数据仍在。  
Secure Enclave 使用**真正可擦除存储（Effaceable Storage）**：擦除后数据无法恢复。

当 PIN 猜测次数超限时，擦除密钥 → 所有数据永久加密不可访问（"Erase Device"效果）。

## 5. 生物识别解锁（Face ID / Touch ID）

首次解锁后，可用 Face ID/Touch ID 代替 PIN，提高便利性：

**Face ID 硬件**：专用红外结构光传感器，生成 3D 面部哈希，由 Secure Enclave 直接接收。

**安全性威胁**：若攻击者替换 Face ID 模块（植入总报告正确哈希的恶意芯片），可绕过验证。

**防护**：Secure Enclave 与 Face ID 硬件之间存在**共享配对密钥**。更换 Face ID 模块后，密钥不匹配 → 设备拒绝生物识别解锁。

## 6. 综合分析：设计原则的体现

| 安全机制 | 对应课程原则 |
|---------|------------|
| App 沙箱 | 隔离（Isolation）|
| API 权限审批 | 受控共享（Controlled Sharing）|
| Secure Boot | 软件信任（Software Trust）|
| Secure Enclave | 特权分离（Privilege Separation）|
| PIN + 生物识别 | 认证（Authentication）|
| UID 绑定密钥 | 最小权限（UID 不离芯片）|

## 关键概念

**Secure Enclave** = 独立处理器 + 独立 OS + 独立 Secure Boot + 不可提取 UID  
其安全性不依赖主 OS 的安全性，即使主 OS 被完全攻破，PIN 保护仍有效。

**防御层次**：

$$\text{PIN} \xrightarrow{\text{Secure Enclave}} \text{AES Key} \xrightarrow{\text{AES Engine}} \text{解密数据}$$

攻击者必须同时攻破 Secure Enclave 的物理保护和暴力破解限制，方可访问数据。
