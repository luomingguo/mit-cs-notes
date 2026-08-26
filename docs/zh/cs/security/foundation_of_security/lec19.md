---
title: 运行时防御（Runtime Defenses）
type: lecture
lecture: 19
tags: []
status: complete
---
# Lec 19 运行时防御（Runtime Defenses）
> MIT 6.1600 · Introduction to Computer Security

## 1. 背景

特权分离（Lec 18）从架构上减小 bug 的影响范围；Bug 发现技术（Fuzzing 等）在开发期消除 bug。

**运行时防御**：在生产环境中，当 bug 被触发时，**实时检测**并终止程序，防止漏洞被利用。

设计运行时防御的挑战：
- 必须明确目标：防御哪类 bug？
- 确定监控范围：哪些组件？
- 避免假阳性：不误杀合法程序
- 最小化开销：防御代价需可接受

## 2. 缓冲区溢出防御

### 2.1 缓冲区溢出回顾

```text
| 返回地址 |
|---------|
| buf[127]|
| ...     |
| buf[0]  |
```

`gets()` 超界写入后覆盖返回地址 → 控制执行流。

三个步骤：① 越界写入 → ② 控制跳转地址 → ③ 执行恶意代码

### 2.2 不可执行栈（NX / DEP）

**思想**：阻止 CPU 执行栈上的代码。

OS 对内存区域设置 $R/W/X$ 权限：

$$\text{栈} = R + W \quad \text{（不含 X）}$$

攻击者即使将 Shellcode 写入栈，CPU 也拒绝执行 → 攻击第 3 步失败。

**局限**：**返回导向编程（Return-Oriented Programming, ROP）**  
攻击者不再注入新代码，而是复用程序已有代码片段（Gadgets）拼接出攻击序列：

$$\sigma = [g_1 \to g_2 \to g_3 \to \ldots] \quad g_i \text{ 为合法代码中的片段}$$

不需要执行栈上代码，NX 防御失效。

### 2.3 栈金丝雀（Stack Canary）

**思想**：在返回地址前插入一个随机值，函数返回前检查其是否被修改。

```text
| 返回地址 |
|---------|
| canary  |  ← 随机秘密值
|---------|
| buf[127]|
| ...     |
| buf[0]  |
```

程序启动时生成随机 canary 值，存储在安全位置。每次函数返回前：

$$\text{检查 canary} \stackrel{?}{=} \text{原始值}$$

若溢出覆写了返回地址，必然先覆写 canary → 触发检测 → 程序终止。

**攻击绕过方式**：
- 攻击者猜到 canary 值（写入相同值）
- **信息泄露 bug** 暴露 canary 值，再传统溢出
- **非连续写入**：直接覆写函数指针而不经过 canary
- **Fork 服务器**：子进程继承父进程 canary → 可盲打猜测（每次 Fork 保留 canary）

**实现**：编译器自动插入（GCC `-fstack-protector`）。

### 2.4 地址空间布局随机化（ASLR）

**思想**：随机化代码、栈、堆在内存中的位置，使攻击者无法预知跳转地址。

$$\text{每次进程启动：base\_code, base\_heap, base\_stack} \xleftarrow{\$}$$

攻击者需先通过 **信息泄露漏洞** 获得某区域的实际地址，才能构造有效 ROP 链。

**局限**：
- 只移动整个区域（区域内部布局不变）
- 若攻击者泄露一个函数地址，可推算整个代码段布局
- 32 位系统熵极低（~$2^{16}$），可暴力猜测

**实现**：OS + 编译器合作（位置无关代码 PIE + OS 随机化 base）。

### 2.5 胖指针（Fat Pointers / Bounds Checking）

**思想**：将 C 指针扩展为三元组（地址, base, limit），每次解引用检查边界：

$$\text{ptr} = (\text{addr},\ \text{base},\ \text{limit})$$

$$\text{解引用前检查：base} \leq \text{addr} < \text{limit}$$

```text
       limit →|---------|
              | buf[127]|
              | ...     |
   ptr3 addr→ | buf[3]  |
              | buf[2]  |
base/ptr addr→| buf[0]  |
              |---------|
```

**局限**：
- Fat 指针 > 64 bits → 破坏 C 代码中对指针大小的假设
- 只检查分配区域的越界，不检查结构体内部成员间的越界
- 实际上极少部署

### 2.6 控制流完整性（CFI，Control-Flow Integrity）

**思想**：限制间接跳转的合法目标集合，防止 ROP 将返回地址替换为任意地址。

编译器预先构建合法跳转目标集合 $S$，在每个间接跳转前插入检查：

$$\text{jump target} \in S \quad \text{否则终止}$$

- **直接调用**（`call func`）：无需检查，编译期已知
- **函数指针调用 / 函数返回**：插入运行时检查

**实现**：LLVM CFI、Microsoft Control Flow Guard（CFG）

**局限**：$S$ 通常较大（类型匹配的所有函数），精细 ROP 可找到集合内的 Gadgets。

## 3. 输入净化 Bug 防御：Taint Tracking

### 3.1 问题

SQL 注入、XSS 等漏洞来自**系统性地**未能净化用户输入——不是单一 bug，而是整个数据流的问题。

### 3.2 库级 Taint Tracking

库框架对来自用户输入的数据标记为 **Tainted（污染）**：

```python
name = read_from_user()       # name 被标记为 tainted
query = "SELECT ... WHERE name = '" + name + "'"  # query 也 tainted
query_database(query)          # ← EXCEPTION：tainted 数据进入 sink！

qesc = escape(query)           # 转义 → 去除 taint
query_database(qesc)           # OK
```

**Sink（敏感函数）**：数据库查询、HTML 渲染等关键操作检测 taint 标记，发现 tainted 输入时报错。

### 3.3 浏览器 Trusted Types（防 XSS）

对 JavaScript 中更新 DOM 的操作（如 `innerHTML = foo`）：

- 浏览器要求 `foo` 类型为 `TrustedHTML`
- 开发者必须显式将字符串转换为 `TrustedHTML`（调用转义函数）
- 确保程序员**意识到风险**并显式处理

不保证转义正确，但强制程序员做出显式决策。

### 3.4 OS 级 Taint Tracking

macOS：对从互联网下载的可执行文件设置 **隔离属性（quarantine xattr）**：

- 下载的文件被标记 tainted
- 复制/移动保留 taint 标记
- 执行 tainted 文件时弹出 Gatekeeper 警告

## 4. 各防御措施汇总

| 防御机制 | 针对的攻击步骤 | 成熟度 |
|---------|-------------|-------|
| NX（不可执行栈）| 阻止执行栈上代码 | 广泛部署 |
| Stack Canary | 检测栈溢出 | 广泛部署 |
| ASLR | 增加猜测地址难度 | 广泛部署 |
| CFI | 限制间接跳转目标 | 中等部署 |
| Fat Pointers | 运行时边界检查 | 极少部署 |
| Taint Tracking | 防注入 bug | 框架支持 |

**多层叠加**：
$$\text{ASLR} + \text{Canary} + \text{NX} + \text{CFI} \Rightarrow \text{攻击需组合多个漏洞才能成功}$$

## 5. 仍未解决的问题

**Use-After-Free（UAF）**：上述所有针对缓冲区溢出的防御均对 UAF 帮助有限。

**根本解决方案**：
- 使用 Rust（编译期生命周期检查）
- 或 GC（Java/Python/Go）
- 或 Sanitizer（AddressSanitizer）用于调试，开销过高不适合生产

## 关键公式

**Stack Canary 的有效性条件**：

$$P[\text{攻击成功}] = P[\text{猜中 canary}] \leq \frac{1}{2^\lambda}$$

**ASLR 抵抗暴力猜测**：

$$\text{成功率} = \frac{1}{2^b} \quad b = \text{随机化 bits 数}$$

$b = 40$（64 位系统）→ $2^{40} \approx 10^{12}$ 次猜测。
