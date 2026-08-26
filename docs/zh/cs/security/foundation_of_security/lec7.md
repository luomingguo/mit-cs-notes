---
title: 案例研究：公钥基础设施（PKI）
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 7
kind: theory
tags: []
status: complete
---
# Lec 7 案例研究：公钥基础设施（PKI）
> MIT 6.1600 · Introduction to Computer Security

## 1. 公钥认证的核心问题

数字签名本身假设验证者**已知**签名者的公钥 $vk$。

但在互联网中：

> 当我访问 `https://amazon.com`，我如何知道收到的公钥确实属于 Amazon？

攻击者可以发送自己的公钥并冒充 Amazon——**中间人攻击（MITM）**。

需要一个机制将"公钥 $vk$"与"身份（如域名）"绑定——这就是 **PKI（Public Key Infrastructure）**。

## 2. 数字证书（Certificate）

**证书**：由受信第三方（Certificate Authority，CA）签名的声明：

$$\text{Cert} = \{(\text{domain}, vk_\text{server}),\ \sigma_\text{CA}\}$$

具体来说：

$$\sigma_\text{CA} = \text{Sign}(sk_\text{CA},\ \text{domain} \| vk_\text{server} \| \text{validity period} \| \ldots)$$

浏览器内置 CA 的公钥 $vk_\text{CA}$，可验证 $\sigma_\text{CA}$，从而信任 $(\text{domain}, vk_\text{server})$ 的绑定。

### X.509 证书包含的字段

| 字段 | 说明 |
|------|------|
| Subject | 证书持有者（如 `CN=amazon.com`） |
| Public Key | 服务器公钥 |
| Issuer | 签发 CA 名称 |
| Validity | 有效期（Not Before / Not After）|
| Signature | CA 的数字签名 |
| SAN | Subject Alternative Names（多域名）|

## 3. 证书链（Chain of Trust）

实际 PKI 是分层的：

$$\text{Root CA} \xrightarrow{\text{signs}} \text{Intermediate CA} \xrightarrow{\text{signs}} \text{Server Cert}$$

- **Root CA**：浏览器/OS 预装的信任锚（~150 家），Root CA 公钥存于 Trusted Root Store
- **Intermediate CA**：由 Root CA 签名的下级 CA，用于日常签发
- Root CA 的私钥脱网保存（HSM），Intermediate CA 日常在线

**验证路径**：

$$\text{Verify}(vk_\text{Root}, \text{Cert}_\text{Inter}) = 1 \quad \text{且} \quad \text{Verify}(vk_\text{Inter}, \text{Cert}_\text{Server}) = 1$$

## 4. 证书签发流程

1. 网站管理员生成密钥对 $(sk, vk)$
2. 向 CA 提交 **CSR（Certificate Signing Request）**，包含 $vk$ 和域名
3. CA 验证申请者控制该域名（如 DNS challenge、HTTP challenge）
4. CA 签名生成证书并返回
5. 服务器配置证书，在 TLS 握手中发给客户端

**DV（Domain Validation）**：自动验证对域名的控制权（Let's Encrypt 提供免费 DV 证书）  
**OV（Organization Validation）**：额外验证组织信息  
**EV（Extended Validation）**：严格验证，浏览器曾显示绿色地址栏（现已弃用）

## 5. 证书的吊销（Revocation）

若服务器私钥泄露或证书信息有误，需吊销证书。

### 5.1 CRL（Certificate Revocation List）

CA 发布一份已吊销证书序列号列表。  
**问题**：列表可能很大，更新不及时，客户端缓存可能过时。

### 5.2 OCSP（Online Certificate Status Protocol）

实时查询 CA 的 OCSP 服务器：响应为"有效/已吊销/未知"。  
**问题**：OCSP 服务器宕机时浏览器是否拒绝连接？（软失败 vs 硬失败）  
也存在隐私问题：CA 知晓你访问了哪些网站。

### 5.3 OCSP Stapling

服务器定期向 CA 获取 OCSP 响应并缓存，TLS 握手时附带发送。  
避免客户端单独查询 CA，提升性能和隐私。

### 5.4 CRLite / OneCRL

Mozilla 将所有 CRL 聚合为 Bloom Filter，定期推送给浏览器——高效本地查询。

## 6. 证书透明度（Certificate Transparency, CT）

**动机**：CA 可以为任意域名签发证书（甚至被入侵的 CA）。如何发现错误签发？

**CT 机制**：
- 所有公开证书必须记入 **Merkle 树日志（CT Log）**
- 浏览器要求证书附带 **SCT（Signed Certificate Timestamp）**——CT 日志的签名收据
- 网站管理员可监控 CT 日志，发现自己域名的未授权证书

**CT 的保证**：
$$\text{签发的证书必须公开可审计，不存在"秘密证书"}$$

CT 不能阻止错误签发，但使其可被发现。2016 年发现 Symantec 大量错误签发证书，最终导致 Chrome 不再信任 Symantec CA。

## 7. 常见 PKI 攻击

### 7.1 CA 被攻破

攻击者控制 CA 私钥，可为任意域名签发合法证书。  
案例：2011 年 DigiNotar 被黑，黑客为 `*.google.com` 等签发了虚假证书。

**缓解**：CAA（DNS Certification Authority Authorization）——DNS 记录指定哪些 CA 可为该域签发。

### 7.2 域名验证漏洞

早期 CA 验证逻辑存在 bug——攻击者用 `victim.com\0.evil.com` 可绕过验证。

**缓解**：更严格的域名解析规范，Let's Encrypt 的 ACME 协议。

### 7.3 证书有效期过长

历史上证书有效期可达 5 年——私钥泄露后长期有效。  
现在 Apple/Google 要求最长 398 天，Let's Encrypt 默认 90 天。

## 8. HTTPS 证书验证总结

```text
浏览器 访问 https://bank.com
  → 服务器发送证书链 [Cert_server, Cert_inter]
  → 浏览器验证链:
      1. Verify(vk_root, Cert_inter)  # 内置 Root 信任
      2. Verify(vk_inter, Cert_server) # 中间 CA 验证
      3. 检查 Cert_server 的 SAN 包含 bank.com
      4. 检查有效期 Not Before < now < Not After
      5. 检查 CT SCT（若要求）
      6. 检查 OCSP/CRL 吊销状态
  → 全部通过 → 建立 TLS 连接
```

## 关键概念

- **信任锚（Trust Anchor）**：预装 Root CA，是整个链的安全基础
- **CA 的签名不能证明服务器是可信的**，只证明了"CA 确认该公钥属于该域名"
- **CT 日志**是 PKI 透明度的核心工具
