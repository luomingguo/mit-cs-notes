---
title: 安全系统架构（Architecting a Secure System）
course: 6.1600 计算机安全导论
course_id: '6.1600'
lecture: 12
kind: theory
tags: []
status: complete
---
# Lec 12 安全系统架构（Architecting a Secure System）
> MIT 6.1600 · Introduction to Computer Security

## 1. 两类核心威胁

在构建安全系统时，面临两大类问题：

**错误（Mistakes）**：
- 系统 bug（硬件、软件缺陷）
- 用户错误（钓鱼攻击、配置错误）

**恶意行为（Malicious）**：
- 恶意组件（malware、供应链攻击）
- 恶意用户（管理员账号被盗）
- 攻击者已入侵系统（内部攻击）

**关键观点**：安全设计将"错误"与"恶意"同等对待——一个能应对恶意组件的系统，同样能应对存在 bug 的代码。

## 2. 安全设计的三层目标

1. **防御已知攻击**：对抗已知漏洞和攻击手段
2. **防御未知攻击**：通用防御原则，减少攻击面
3. **限制损失（Damage Limitation）**：出问题时尽量减少影响范围

## 3. 隔离（Isolation）

### 3.1 核心理念

将系统分割为相互隔离的组件：某一组件被攻破，不会自动危及其他组件。

### 3.2 隔离层次

| 隔离机制 | Host（执行者）|
|---------|-------------|
| Docker 容器 | Linux OS |
| 浏览器 Tab | 浏览器 |
| JavaScript/WebAssembly | 语言运行时 |
| 进程（Process） | Linux 内核 |
| 虚拟机（VM） | VM Monitor（Hypervisor）|
| 物理隔离（Air Gap） | 物理定律 |

隔离机制的安全性取决于 **Host 的正确性**：Host 有 bug 可能被利用来"逃逸"隔离域。

### 3.3 非干扰（Non-Interference）

**弱完整性**：对手域 A 无法修改受害者域 V 的状态：

$$(S_A, S_V) \xrightarrow{\text{run } A} (S'_A, S_V) \quad \text{（}S_V \text{ 不变）}$$

**弱机密性（非泄露）**：A 的输出不依赖 V 的状态：

$$\forall S^1_V, S^2_V:\ (S_A, S^1_V) \xrightarrow{\text{run } A} (S'_A, -)\ =\ (S_A, S^2_V) \xrightarrow{\text{run } A} (S'_A, -)$$

**完整非干扰（Strong）**：上述性质在 A 和 V 并发运行时仍成立。

**实践局限**：共享资源（CPU、内存、带宽）几乎总会产生侧信道，严格非干扰难以实现——大多数系统选择"足够好的隔离"。

## 4. 受控共享（Controlled Sharing）

隔离本身不够，组件间还需要通信——但要受控：

**三步骤（3A 原则）**：

| 步骤 | 内容 |
|------|------|
| **Authenticate（认证）** | 确认请求来自哪个 principal |
| **Authorize（授权）** | 该 principal 是否有权限 |
| **Audit（审计）** | 记录所有请求，事后分析 |

**关键**：每个请求都必须经过全部三步——任何一个漏洞都可能完全破坏隔离。

## 5. 授权策略（Authorization Policy）

### 5.1 授权矩阵

权限可抽象为"对象 × 主体"矩阵：

$$M[i][j] = \text{用户 } j \text{ 对资源 } i \text{ 拥有的操作权限}$$

**访问控制列表（ACL）**：按资源存储，每个资源有一个允许访问的（用户, 权限）列表。

### 5.2 权限控制策略

**自主访问控制（DAC, Discretionary）**：资源所有者自行设置权限  
- 优点：灵活
- 缺点：账号被盗则全部资源暴露；普通用户难以正确配置

**强制访问控制（MAC, Mandatory）**：管理员统一设置策略  
- 优点：集中管控（如政府机密数据分级）
- 缺点：粒度较粗，更新不及时

**基于角色的访问控制（RBAC）**：定义角色（学生/教职员/管理员），用户被分配角色：
$$\text{用户} \to \text{角色} \to \text{权限}$$

**常见问题**：权限只增不减（用户从不抱怨权限过多），长期积累"权限膨胀"（Privilege Creep）。

## 6. 审计（Audit）

审计日志需与应用程序**隔离存储**：

```text
应用程序 ---[只追加日志]--> 日志服务器 ----> 日志存储
                                     ↑ 不允许删除
```

若应用程序被攻破，攻击者无法抹除审计记录——便于事后取证和恢复。

## 7. 委托与复合 Principal

### 7.1 链式请求问题

```text
用户 Alice ---[请求]--> Gmail 服务 ---[转发]--> 数据库
```

数据库看到的请求来自 Gmail 服务——但实际操作是 Alice 发起的。

### 7.2 三种策略

**以用户身份转发（Forward as User）**：
- 保护：数据库被攻破不影响其他用户
- 弱点：Gmail 可完全冒充 Alice

**以服务身份转发（Forward as Service）**：
- 保护：不同服务有独立权限
- 弱点：Gmail 被攻破 → 所有用户数据暴露

**复合 Principal（"B for A"）**：
- 原则：请求带有 "Gmail for Alice" 的 principal
- 实现：Alice 签发委托证书给 Gmail（限时、限操作）

$$\sigma = \text{Sign}(sk_A,\ \text{"Alice delegates to Gmail"},\ t_\text{start},\ t_\text{end})$$

### 7.3 能力（Capabilities）

细粒度权限委托：

- Android：App A 委托 App B 访问特定文件（不是整个存储）
- Google Drive：分享链接 = 一个 Capability，任何持有链接的人可访问该文件（无需认证）

## 8. 实际系统架构示例

### 8.1 Web 应用标准架构

```text
Client --TLS--> [前端服务器]
                    |---> [Login 服务] <--> [密码 DB]
                    |---> [Profile 服务] <--> [用户 DB]
                    |---> [Photo 服务] <--> [图片 DB]
```

- 前端服务器终止 TLS，隔离敏感业务
- 各服务仅访问所需数据库，最小权限

### 8.2 日志系统架构

```text
应用 ---[只追加]---> 日志服务器
        （无删除 API）
```

### 8.3 密钥管理架构

```text
应用 ---[sign(msg)]---> 密钥管理器（含 sk）
        （无法提取 sk）
```

## 关键设计原则

**最小权限（Principle of Least Privilege）**：每个组件只拥有完成其任务所需的最小权限集合。

$$\text{攻击面} \propto \text{权限数量} \times \text{代码规模}$$

**纵深防御（Defense in Depth）**：多层安全机制，单层失效不导致系统完全沦陷。

**默认拒绝（Default Deny）**：未明确授权的操作默认禁止。
