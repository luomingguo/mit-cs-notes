# 6.5610 应用密码学与安全（Spring 2026）

Applied Cryptography

https://65610.csail.mit.edu/2026/





本课定位为**研究生应用密码学**：先快速回顾基础原语，随后进入实践中正在使用、或有潜力被使用的高级密码原语。先修建议为入门密码学（如 6.1600）。



## 课程地图（全部 21 讲 · 5 个主题模块）

### 模块 I · 对称密码学基础（Symmetric-key foundations）

| #    | 日期 | 主题                                                         | 状态 |
| ---- | ---- | ------------------------------------------------------------ | ---- |
| L1   | 2/2  | 加密哈希函数 / 单向哈希（*Cryptographic Hashing*）           | ✅    |
| L2   | 2/4  | 对称加密：从 PRF 构造（*Symmetric Encryption from PRF*）     | ✅    |
| L3   | 2/9  | 对称原语 I（*Symmetric-key primitives I* · PRF / 计数器模式 / ChaCha20） | ✅    |
| L4   | 2/11 | 对称原语 II（*Symmetric-key primitives II* · PRP / Feistel / AES） | ✅    |

### 模块 II · 公钥与格密码（Public-key & Lattices）

| #    | 日期 | 主题                                                         | 状态 |
| ---- | ---- | ------------------------------------------------------------ | ---- |
| L5   | 2/17 | Diffie–Hellman 密钥交换与公钥加密（*DH & PKE*）              | ✅    |
| L6   | 2/18 | Rabin、RSA、为何需要后量子（*Rabin / RSA / why post-quantum*） | ✅    |
| L7   | 2/25 | 公钥加密：从 LWE 构造（*PKE from LWE · Regev*）              | ✅    |

### 模块 III · 隐私计算原语（PIR & Homomorphic Encryption）

| #    | 日期 | 主题                                                 | 状态 |
| ---- | ---- | ---------------------------------------------------- | ---- |
| L8   | 3/2  | 私有信息检索（*Private Information Retrieval, PIR*） | ✅    |
| L9   | 3/4  | 全同态加密 I（*Fully Homomorphic Encryption, FHE*）  | ✅    |
| L10  | 3/9  | 全同态加密 II                                        | ✅    |

### 模块 IV · 证明系统与多方计算（Proofs & MPC）

| #    | 日期 | 主题                                                        | 状态 |
| ---- | ---- | ----------------------------------------------------------- | ---- |
| L11  | 3/11 | 交互式证明与零知识（*Interactive Proofs & Zero-Knowledge*） | ✅    |
| L12  | 3/16 | 秘密共享（*Secret Sharing*）                                | ✅    |
| L13  | 3/18 | 安全多方计算（*Secure Multiparty Computation, MPC*）        | ✅    |
| L14  | 3/30 | MPC：应用（*MPC Applications*）                             | ✅    |

### 模块 V · 简洁证明与 oblivious 技术（Succinct Proofs & ORAM）

| #    | 日期 | 主题                                 | 状态       |
| ---- | ---- | ------------------------------------ | ---------- |
| L15  | 4/1  | Sumcheck 协议（*Sumcheck Protocol*） | ✅          |
| L16  | 4/6  | 客座讲座 · Jim Bidzos（无讲义）      | —          |
| L17  | 4/8  | 客座讲座 · Ron Rivest                | ⚠️ 背景说明 |
| L18  | 4/13 | GKR 协议（*GKR Protocol*）           | ✅          |
| L19  | 4/22 | zk-SNARKs                            | ✅          |
| L20  | 4/27 | Oblivious RAM（*ORAM*）              | ✅          |
| L21  | 4/29 | TA 研究展示（无讲义）                | —          |

> 状态：✅ 已完成 · ⏳ 待补（按本批模板逐讲滚动补完）

---

## 与 SaaS / 系统设计的关联（工程视角索引）

> 作为后端 / 分布式 SaaS 方向，可重点关注以下"可落地"原语：

- **哈希 / MAC（L1–L3）**：口令存储、文件完整性、API 签名、JWT 完整性校验。
- **对称加密 / AEAD（L2–L4）**：传输层与静态数据加密；ChaCha20-Poly1305 在 TLS 中的角色。
- **PKE / KEM（L5–L7）**：密钥协商、混合加密；后量子迁移（PQC）对长期密钥的影响。
- **PIR / FHE（L8–L10）**：隐私检索、密文计算——隐私优先产品（如"不泄露查询内容"的检索服务）。
- **ZK / SNARK（L11, L19）**：隐私凭证、可验证计算、审计而不泄露数据。
- **MPC / 秘密共享（L12–L14）**：分布式密钥管理（如门限签名）、跨机构联合计算。
- **ORAM（L20）**：隐藏访问模式，防止通过元数据侧信道泄露。

---

## 参考资料

- 课程未指定教材；[《A Graduate Course in Applied Cryptography》](<https://toc.cryptobook.us/book.pdf)：
- 6.1600 入门讲义（背景补强）：<https://github.com/mit-pdos/6.1600-notes>
- Ron Rivest 整理的密码学/安全阅读清单：<https://courses.csail.mit.edu/6.857/2022/references>

- [spring 2026](https://65610.csail.mit.edu/2026/)

# Lec 1 单向哈希函数



[lec1.md](./lec1.md)



# Lec 2 对称加密——从PRF构造



[lec2.md](./lec2.md)



# Lec 3 对称原语I-PRF计数器模式

[lec3.md](./lec3.md)



# L04-对称原语II-PRP-Feistel-AES

[lec4.md](./lec4.md)

# L05-DiffieHellman与公钥加密

[lec5.md](./lec5.md)

# L06-Rabin-RSA-后量子

[lec6.md](./lec6.md)



# L07-LWE-Regev公钥加密

[lec7.md](./lec7.md)

# L08-私有信息检索PIR

[lec8.md](./lec8.md)

# L09-全同态加密FHE-I

[lec9.md](./lec9.md)

# L10-全同态加密FHE-II-Bootstrapping

[lec10.md](./lec10.md)

# L11-交互式证明与零知识

[lec11.md](./lec11.md)

# L12-秘密共享

[lec12.md](./lec12.md)

# L13-安全多方计算MPC

[lec13.md](./lec13.md)

# L14-MPC应用

[lec14.md](./lec14.md)

# L15-Sumcheck协议

[lec15.md](./lec15.md)

# L16-GKR协议

[lec16.md](./lec16.md)

# L17-zk-SNARKs

[lec17.md](./lec17.md)

# L18-ObliviousRAM

[lec18.md](./lec18.md)
