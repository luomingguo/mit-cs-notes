# Lec 17 — 软件安全（Software Security）
> MIT 6.1600 · Introduction to Computer Security

## 1. 总体背景

软件漏洞是真实世界安全失败的主要根源之一（仅次于钓鱼攻击）。

经验法则：**每 1000 行代码约有 1 个 bug**。更重要的是：

> **"任何 bug 都可能是安全 bug"**

看似无关安全的 bug，往往可以被串联利用（链式利用）成严重漏洞。

## 2. 内存损坏漏洞（Memory Corruption）

内存损坏 bug 出现在 C/C++ 等不提供内存安全保证的语言中。

### 2.1 缓冲区溢出（Buffer Overflow）

```c
void f() {
    char buf[128];
    gets(buf);  // ← 不检查长度，无限读取
}
```

**调用栈布局**（栈向低地址增长）：

```
...
返回地址
buf[127]
...
buf[0]
```

若输入 > 128 字节，`gets` 覆写返回地址。函数返回时 CPU 跳转到攻击者指定地址。

**攻击步骤**：
1. 写入超界数据（覆写返回地址）
2. 控制跳转目标
3. 执行攻击者的代码（可注入在缓冲区内）

**整数溢出的隐患**：

```c
uint32_t n = get_input();
if (n * 16 > 256) return;   // ← 当 n = 2^30 时，n*16 = 0（32位溢出！）
```

$2^{30} \times 16 = 2^{34}$，但 `uint32_t` 最多 $2^{32}$，溢出后结果为 $0$，绕过检查。

### 2.2 Use-After-Free

```c
void f() {
    char *req = malloc(1024);
    int err = read(0, req, 1024);
    if (err) free(req);
    // 此处另一线程可能将 req 的内存重用
    if (err) printf("Error %d: %s\n", err, req);  // ← 读取已释放内存
}
```

**危害**：可能泄露加密密钥等敏感数据；Rust 通过生命周期系统在编译期防止此类 bug。

## 3. 编码/解码漏洞

### 3.1 SQL 注入

```python
# 错误！用户输入直接拼接
query = 'SELECT name FROM users WHERE phone = "' + phone + '"'
```

用户输入 `123"; DROP TABLE users; "` 时，数据库执行了两条 SQL：

```sql
SELECT name FROM users WHERE phone = "123";
DROP TABLE users;
```

**防护**：参数化查询（Parameterized Queries / Prepared Statements）——库自动转义特殊字符：

```python
cursor.execute("SELECT name FROM users WHERE phone = %s", (phone,))
```

### 3.2 跨站脚本（XSS，Cross-Site Scripting）

Web 应用将用户数据未经转义直接渲染为 HTML：

```python
# 错误
for name in friends:
    print("<li>" + name + "</li>")
```

若某好友名为：

```html
<script>send_to_adversary(document.cookie)</script>
```

受害者浏览器执行此脚本，Cookie（认证凭据）被发送给攻击者。

**防护**：HTML 转义——将 `<` → `&lt;`，`>` → `&gt;`，`&` → `&amp;`；现代 Web 框架模板引擎自动处理。

### 3.3 Android APK 签名绕过

Android App 是 ZIP 文件（.apk）。签名检查代码和安装代码使用**不同的 ZIP 解析器**：
- ZIP 格式历史上存在"两个文件列表"（Local 和 Central Directory）
- 攻击者让签名检查器看"合法文件列表"，安装器看"恶意文件列表"

$$\text{签名验证器读 Central Directory} \neq \text{安装器读 Local Headers}$$

**根本原因**：两组件对相同格式的解码存在差异（Differential Decoding）。

## 4. 并发漏洞

### 4.1 Race Condition（竞争条件）

```python
def xfer(src, dst, amt):
    s = bal[src]       # 读取余额
    d = bal[dst]
    if s < amt: raise Error
    bal[dst] = d + amt
    bal[src] = s - amt  # ← 扣款
```

攻击者同时发两笔转账（同一来源），两次读到相同余额 `s`，两次余额检查都通过，但只扣款一次——**凭空创造资金**。

**防护**：数据库事务（BEGIN TRANSACTION ... COMMIT）或互斥锁（Mutex）。

### 4.2 TOCTOU（Time-of-Check-Time-of-Use）

```c
// 检查时是普通文件
if (!S_ISREG(stat(path))) error();
// ← 此时攻击者用符号链接替换文件
int f = open(path, O_RDWR);  // 打开了符号链接指向的任意文件
```

**防护**：使用原子操作（`openat`+`O_NOFOLLOW`），或直接 `open` 后检查文件类型。

## 5. 资源消耗攻击（拒绝服务变种）

**哈希表 DoS（Hash Flooding）**：

普通哈希函数速度快但无密码学强度——攻击者可构造大量碰撞到同一 bucket 的输入：

$$H(x_1) = H(x_2) = \ldots = H(x_n) = \text{同一 bucket}$$

哈希表退化为链表，查找时间从 $O(1)$ 变为 $O(n)$——用少量请求耗尽服务器 CPU。

**防护**：使用带密钥的哈希（PRF / SipHash），密钥对攻击者保密：

$$H_k(x) = \text{SipHash}(k, x) \quad k \xleftarrow{\$}$$

## 6. 防御软件漏洞的通用原则

| 原则 | 具体做法 |
|------|---------|
| **清晰规范** | 精确定义编码/解码格式的所有边界情况 |
| **简单设计** | 代码越少越易审计，bug 越少 |
| **限制影响面** | 特权分离（Lec 18）——单个 bug 不导致全局沦陷 |
| **开发期发现** | Fuzzing、静态分析、代码审查 |
| **运行时缓解** | 栈金丝雀、ASLR、CFI（Lec 19）|
| **快速修补** | 浏览器等高危软件的自动更新机制 |

## 7. 内存安全语言

根本防御：使用**内存安全语言**（Rust、Go、Java、Python），消除整类内存损坏漏洞：

- **Rust**：编译期生命周期检查，零运行时开销，无 GC
- **Go**：GC + bounds checking，消除 UAF 和溢出
- **Java/Python**：运行时边界检查 + GC

NSA、Microsoft、Google 等均建议新项目优先使用内存安全语言。

## 关键公式

**SQL 注入条件**：用户输入包含 SQL 元字符（`"`, `;`, `--`等）+ 未转义拼接

**整数溢出检测**（安全的乘法检查）：

$$n \times 16 > \text{size} \iff n > \text{size} / 16 \quad \text{（先除再比较，避免溢出）}$$
