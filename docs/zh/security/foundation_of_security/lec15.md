# Lec 15 — CPU 时序攻击（CPU Timing Attacks）
> MIT 6.1600 · Introduction to Computer Security

## 1. 侧信道攻击总览

**侧信道（Side Channel）**：攻击者不直接攻击密码算法，而是观察实现过程中泄露的**物理信息**——时间、功耗、电磁辐射、缓存行为——来推断秘密。

**关键洞察**：密码学安全性证明只考虑算法的输入/输出行为，不考虑实现细节。实现中的任何与秘密相关的物理行为都是潜在泄露。

## 2. CPU 缓存基础

### 2.1 存储层次（Memory Hierarchy）

| 层次 | 延迟 | 大小 |
|------|------|------|
| L1 缓存（Cache） | ~4 周期 | ~32 KB |
| L2 缓存 | ~12 周期 | ~256 KB |
| L3 缓存 | ~40 周期 | ~8 MB |
| DRAM（主存） | ~200 周期 | GB 级 |

当 CPU 访问内存时：
- **缓存命中（Cache Hit）**：数据在缓存 → 快速返回
- **缓存缺失（Cache Miss）**：数据不在缓存 → 从主存读取 → 慢

### 2.2 缓存的安全隐患

多个进程（甚至不同 VM）共享 L3 缓存。一个进程的访问**影响缓存状态**，另一个进程通过**测量自己的访问时间**可以推断。

## 3. 经典缓存侧信道攻击

### 3.1 Flush+Reload

**前提**：攻击者与受害者共享某一内存页（如共享库）。

**攻击步骤**：

1. **Flush**：攻击者用 `clflush` 指令驱逐目标缓存行
2. **Wait**：等待受害者运行
3. **Reload**：攻击者重新访问同一地址，测量时间
   - 时间短（命中）→ 受害者访问过该地址
   - 时间长（缺失）→ 受害者未访问过该地址

通过反复测量不同内存地址，可推断受害者的**访问模式** → 推断受害者的**秘密数据**。

### 3.2 Prime+Probe

不需要共享内存：

1. **Prime**：攻击者填满某 Cache Set（使其全部属于攻击者数据）
2. **Wait**：受害者运行
3. **Probe**：攻击者重新访问这些地址，测量时间
   - 时间长 → 受害者访问了该 Cache Set（驱逐了攻击者的数据）

可跨进程、跨 VM 使用（只需测量访问时间，无需共享内存）。

### 3.3 AES Table Lookup 攻击

经典 AES 实现使用查表（S-Box、MixColumns 等），表的下标取决于明文和密钥的 XOR：

$$\text{index} = \text{plaintext}[i] \oplus \text{key}[i]$$

若 `index` 相关的缓存行未命中，可通过 Flush+Reload 推断 index，进而推断密钥字节。

**防护**：使用不依赖秘密值的 AES 实现（硬件 AES-NI 指令；bitsliced 实现）。

## 4. Spectre 与 Meltdown

### 4.1 推测执行（Speculative Execution）

现代 CPU 为提高性能，在分支结果未知时会**提前推测执行**：

```c
if (x < array_size)          // ← 条件判断可能慢（访问内存）
    y = array2[array1[x]];   // ← CPU 可能先执行这行（推测）
```

若推测错误，CPU **回退**（Rollback）寄存器状态，但**缓存状态不回退**。

### 4.2 Meltdown（CVE-2017-5754）

**目标**：读取内核内存（本应禁止用户访问）

**原理**：

```c
uint8_t secret = kernel_address[0];  // 推测执行，尽管权限会失败
uint8_t probe = probe_array[secret * 4096];  // 将 secret 编码进缓存状态
```

权限检查后 CPU 回退，但 `probe_array[secret * 4096]` 已进入缓存。  
攻击者用 Flush+Reload 扫描 `probe_array`，找出哪个偏移命中 → 得到 `secret`。

**缓解：KPTI（Kernel Page Table Isolation）**  
用户态运行时，内核地址**不出现在页表**中，推测执行无法访问内核内存。

性能损失：~5–30%（依赖内核调用频率）。

### 4.3 Spectre（CVE-2017-5753/5715）

**目标**：让同进程的沙箱（如浏览器的 JavaScript 沙箱）读取其他内存

**原理**：训练**分支预测器（Branch Predictor）**预测"允许访问"：

```c
// 受害者代码（如 OS/JVM）
if (x < array_size):
    y = array2[array1[x] * 4096]

// 攻击者反复用合法 x 训练分支预测器
// 然后用超界 x（指向秘密内存）触发推测执行
```

**Variant 2**：通过毒化**间接跳转预测（BTB）**，让 CPU 推测执行攻击者选择的代码段（ROP Gadgets）。

**缓解**：
- **Retpoline**：用返回指令替换间接跳转，防止 BTB 毒化
- **IBRS/IBPB**：Intel 微码更新，隔离不同权限级别的分支预测器
- 浏览器：降低定时器精度（`performance.now` 精度降至 1ms），阻止精确时序测量

## 5. 时序攻击：算法级别

### 5.1 RSA 时序攻击（Kocher 1996）

教科书 RSA 模幂算法（Square-and-Multiply）的运行时间取决于**密钥的汉明权重**：

$$x^d = \text{若 bit}(d, i) = 1: x \leftarrow x^2 \cdot x \quad \text{否则: } x \leftarrow x^2$$

攻击者测量多次解密的时间，可推断 $d$ 的比特位。

**防护**：
- **盲化（Blinding）**：计算 $(m \cdot r^e)^d / r$，引入随机数使时间不依赖 $m$
- **常数时间模幂**：无论密钥位为 0 或 1，都执行相同数量的操作

### 5.2 字符串比较攻击

早期 HMAC 实现：

```python
def verify(expected, actual):
    return expected == actual  # ← 短路比较：一旦不匹配立即返回
```

攻击者可通过测量响应时间推断猜测的 MAC 值与真实值匹配了多少字节。

**防护：常数时间比较（Constant-Time Compare）**

```python
def ct_compare(a, b):
    result = 0
    for x, y in zip(a, b):
        result |= x ^ y       # ← 全部比较完，不短路
    return result == 0
```

## 6. 防护原则：常数时间编程

**原则**：密码学代码中，**执行路径**和**内存访问模式**不得依赖秘密数据。

```c
// 错误：秘密决定执行路径
if (secret_bit) return a; else return b;

// 正确：用 bit masking 无分支选择
uint8_t mask = -(uint8_t)secret_bit;  // 0x00 或 0xFF
return (mask & a) | (~mask & b);
```

**测量工具**：
- `ct-verif`：验证 C 代码是否满足常数时间性质
- `ctgrind`：基于 Valgrind 的常数时间检测

## 关键公式

**缓存命中与缺失的时间差（时序分辨率）**：

$$\Delta t = t_\text{miss} - t_\text{hit} \approx 200 - 4 = 196 \text{ 周期}$$

**Meltdown 信息编码**：

$$\text{probe\_array}[\text{secret} \times 4096] \quad \text{（利用 page size 避免 prefetcher 影响）}$$
