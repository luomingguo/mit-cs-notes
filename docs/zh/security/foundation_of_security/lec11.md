# Lec 11 — 加密的实际应用（Encryption in Practice）
> MIT 6.1600 · Introduction to Computer Security

## 1. 文件加密

### 1.1 基本场景

最直接的加密应用是保护静态文件，使云服务器或存储提供商无法读取用户数据。

**WhatsApp 加密备份**：
- 设备生成 128-bit AES 密钥 $k$
- 所有备份数据用 AES-GCM 加密后上传
- 密钥导出为 64 个十进制数字，用户自行保管
- 恢复时输入数字重建密钥

### 1.2 案例：PDF v1.5 加密的失败

PDF v1.5 提供"部分加密"功能（如标题页明文，正文加密），并支持：
- PDF 内嵌表单
- 表单引用文档其他部分
- 事件触发自动提交表单

**组合漏洞（Composition Attack）**：

攻击者截获 PDF 后，将明文标题页替换为恶意页面：
1. 恶意标题页监听"解密成功"事件
2. 解密完成后将解密内容注入表单
3. 自动通过 HTTP 提交至攻击者服务器

**根本原因**：明文内容未被认证——攻击者可任意修改未加密部分。

**正确做法**：使用 AEAD——同时加密正文并认证所有关联数据（包含明文页面）：

$$c = \text{AEnc}(k,\ \text{正文},\ \underbrace{\text{标题页}}_{\text{关联数据}})$$

若标题页被篡改，解密时 $\text{ADec}$ 返回 $\bot$。

## 2. 流加密：TLS

### 2.1 降级攻击（Downgrade Attack）

早期 TLS 版本（SSLv3 等）存在严重漏洞。握手协商阶段消息**未经认证**：

攻击者伪造"不支持"响应，迫使双方协商到最弱的支持版本（SSLv3）：

$$\text{Client} \xrightarrow{\text{TLS 1.3}} \text{(攻击者改成 REJECT)} \xrightarrow{\text{SSLv3 fallback}} \text{Server}$$

**防护**：彻底禁用弱版本；TLS 1.3 在 Finished 消息中包含整个握手的 MAC，任何降级都会被检测。

### 2.2 TLS 握手的完整安全目标

| 目标 | 说明 |
|------|------|
| **正确性** | 双方协商到相同会话密钥 |
| **安全性** | 攻击者无法得知会话密钥 |
| **对端认证** | 确认通信方身份 |
| **降级保护** | 防止协议版本/算法降级 |
| **前向安全** | 长期密钥泄露不影响历史会话 |
| **端点身份保护** | 连接的 SNI 不泄露给攻击者（ECH）|

### 2.3 TLS 握手（简化）

```
Client                          Server
  |                               |
  |-- ClientHello(nonce, g^a) --->|
  |                               |
  |<-- ServerHello(nonce, g^b) --|
  |    [Cert_server]              |
  |    [Sign(sk_server, 握手记录)]|
  |    [Finished: MAC(k_hs, ...)] |
  |                               |
  k = KDF(g^ab)                   |
  |-- Finished ----------------->|
  |                               |
  |<===== AEAD(k_app, 数据) ====>|
```

密钥派生：

$$g^{ab} \xrightarrow{\text{HKDF}} k_\text{hs} \xrightarrow{\text{HKDF}} k_\text{app}$$

**前向安全**：$a, b$ 为临时密钥，用完即销毁；$sk_\text{server}$ 只用于签名，不涉及加密。

## 3. TLS 不提供的保护

### 3.1 认证的 End-of-File

TLS 不提供"干净关闭"的认证：

**案例**：`curl https://sh.rustup.rs | sh` 安装脚本  
若脚本内容是：
```sh
mkdir /tmp/install
cp files...
rm -r /tmp/install
```

攻击者在 `rm -r /` 后截断连接——shell 执行了 `rm -r /`，删除整个文件系统。

**防护**：设计脚本使截断时无害，如将逻辑封装在函数中最后调用。

### 3.2 明文长度泄露

即使使用 AEAD，**密文长度 = 明文长度（+固定 overhead）**：

- **CRIME 攻击**：压缩后加密导致长度差异——攻击者可通过测量长度推断内容
- **防护**：TLS 1.3 禁用压缩；使用 Padding 使长度不规则

### 3.3 流量分析

即使内容完全加密，**访问模式**（哪个服务器、何时、多少次）也可能泄露信息：

- 解法：使用 VPN、Tor 混淆流量元数据

## 4. 错误使用加密的典型案例

### 4.1 忘记认证关联数据

如 PDF 案例：有关联的明文数据必须纳入 AEAD 认证。

### 4.2 重用 Nonce

AES-GCM 中 nonce 重用导致认证密钥泄露（参见 Lec 9）。

### 4.3 错误的 MAC 顺序

先解密后验证 MAC（Decrypt-then-MAC）导致 Padding Oracle 攻击（Lucky 13 等）。

### 4.4 依赖弱协议版本

保留对 TLS 1.0/1.1 的支持使降级攻击成为可能。

## 5. 密钥管理

### 5.1 密钥存储

加密密钥绝不能明文存储：
- **硬件安全模块（HSM）**：物理隔离的密钥保存设备
- **TPM（Trusted Platform Module）**：PC 中内置的密钥封存芯片
- **iOS Secure Enclave**：见 Lec 16

### 5.2 密钥轮换

- 定期更换加密密钥，降低单密钥泄露的影响范围
- 旧数据重加密（Re-encryption）

### 5.3 密钥派生

避免直接使用用户密码作为密钥：

$$k = \text{HKDF}(\text{master\_secret},\ \text{"file encryption"},\ \text{salt})$$

## 关键原则总结

1. **Encrypt-then-MAC**：先加密再 MAC，防止 padding oracle
2. **AEAD 关联数据**：一切关联的明文都必须被认证
3. **禁用弱版本**：彻底移除对不安全协议的支持
4. **临时密钥**：密钥交换使用 Ephemeral 密钥提供前向安全
5. **Nonce 唯一**：AES-GCM 等 nonce-based 方案绝不重用 nonce
