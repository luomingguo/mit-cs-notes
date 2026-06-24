# Lec 7 系统调用拦截

在本节课中，我们将讨论“系统调用拦截（system call interposition）”，作为一种通用技术，用于限制有缺陷或恶意应用程序对系统其他部分造成的破坏。

本讲定位：以 Janus 为主线，理解“在系统调用边界上拦截不可信进程”的动机、设计、实现机制；再以《Traps and Pitfalls》总结这类系统在工程实践中踩过的坑。

## 参考资料

1. [lec7（课件 l-janus.txt）](https://pdos.csail.mit.edu/6.1810/2025/lec/l-janus.txt)
2. [A Secure Environment for Untrusted Helper Applications（Janus），CH1~3](https://pdos.csail.mit.edu/6.1810/2025/readings/janus-usenix96.pdf)
   - 用于理解系统调用拦截的动机和目标
3. [Traps and Pitfalls: Practical Problems in System Call Interposition Based Security Tools](https://pdos.csail.mit.edu/6.1810/2025/readings/garfinkel-ndss-2003.pdf)
   - 该论文总结了作者在构建此类系统时遇到的实际问题和挑战

> 两篇论文风格对照：Janus 是“发现一个重要问题 + 提出一种解法”；《Traps and Pitfalls》则是“事后反思——这条路为什么这么难走、踩过哪些坑”。和 L4 那篇关注性能数据不同，本讲后半部分更关注那些**出人意料的工程问题**。

## 总览

- 动机与威胁模型：不可信的“辅助应用”
- 核心思路：在系统调用边界上拦截
- 为什么选系统调用边界？几种替代方案的取舍
- 现有的沙箱机制
- Janus 的架构：内核 stub + 用户态策略进程
- 根本性难题：系统调用本身信息不足
- Traps and Pitfalls：工程实践中的坑
- 缓解策略
- 与 xv6 的关系 & 实际应用

---

## 一、动机与威胁模型

**问题：应用代码不能被完全信任**（可能有 bug，也可能是恶意的）。

典型场景：

- Web 浏览器调用 `ghostscript` 来查看 PostScript 文件
  - PS 文件可以**读写任意文件、派生进程**
  - PDF 阅读器执行内嵌 JavaScript 也有类似风险
- 攻击者可以诱导用户去打开一个精心构造的恶意文件

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>安全目标</strong>在保持功能可用的前提下，<strong>最小化</strong>一个“可能是敌对的进程”所能造成的破坏（sandboxing，沙箱化）。</div>

## 二、核心思路：系统调用拦截

策略：

- 限制不可信进程能发起哪些系统调用
- 只允许它访问被**指定的资源**（特定文件）
- 阻止它杀死或破坏其他进程

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>为什么选“系统调用”作为安全边界？</strong>因为它是一个<strong>方便、现成的安全边界</strong>：进程要影响外部世界（其它进程、文件、网络通信）几乎都必须经过系统调用。在这里设卡，<strong>无需检查进程内部状态，也无需修改/重写应用程序</strong>。</div>

## 三、替代方案与取舍

**为什么（当年 Janus 作者）不直接做内核内置沙箱？**

- 部署困难：需要管理员安装
- 内核改动有引入 bug 的风险
- 策略难以更新

> **现代现实**：如今很多 OS（Linux、Windows、macOS）已在内核内置了沙箱机制——这种采纳恰恰是从早期用户态实现中吸取教训后推动的。

**为什么不在库（library）层做沙箱？**

- 根本缺陷：库调用和应用代码之间**没有隔离**
- 应用可以破坏栈、全局变量、malloc 的内部结构，绕过库的检查
- 而系统调用边界本来就是为隔离而设计的

## 四、现有的沙箱机制

| 平台 | 机制 | 特点 |
| --- | --- | --- |
| Unix（基线） | `ptrace` | 通用，但有很多局限 |
| Linux | `seccomp`/BPF | 性能更好 |
| Linux | AppArmor | 与内核状态集成 |
| Linux | Firejail | 用户可配置策略 |
| macOS | Seatbelt | —— |

## 五、Janus 的架构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>常见设计模式</strong>「内核内的 stub」+「用户态的 helper/策略进程」：内核模块负责拦截系统调用，用户态策略引擎负责做 allow / deny 决策。</div>

**职责划分：**

- **内核部分**：能直接访问那些用户态拿不到的内核状态
- **用户态策略进程**：开发更容易、出 bug 影响更小、便于用户配置
- 二者之间需要一个**专门的系统调用接口**来通信

**优化策略：**

- 把不敏感的系统调用（如 `read`/`write`）标记为快速放行，保证性能
- 只把敏感的系统调用送到策略引擎去裁决

实现机制（Unix 上）：早期用 `ptrace`——内核在进程发起系统调用时把它“停下来”，通知 tracer（策略进程），由后者决定 allow 还是 deny。

## 六、根本性难题：系统调用本身信息不足

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>核心困境</strong>仅凭一次系统调用，<strong>往往不足以做出正确的安全决策</strong>——很多关键信息在系统调用参数里看不到。</div>

- 内存指针缺乏上下文：`0x1234` 是否合法，取决于调用者的地址空间
- 文件路径依赖**当前工作目录（cwd）**
- 文件描述符的含义依赖进程的 **FD 表**内容
- 符号链接造成依赖链：路径真正指向哪里，取决于一连串 symlink 解析

**Unix 系统调用的“优势”（相比 L4 那种极简 IPC 内核）：**

- 携带的信息更丰富
- 把“路径名操作”与“文件描述符操作”分开了
  - 可以只在 `open` 上拦截，之后放行对该 FD 的读写
  - 可以禁止创建 socket，但允许对已有 FD 的操作

## 七、Traps and Pitfalls：工程实践中的坑

### 1. 复制内核状态（state replication）的难题

策略进程为了判断，需要**自己维护一份内核状态的副本**：FD 表、当前工作目录、路径遍历逻辑等。

> 核心风险：**细微的边角情况会导致“副本”与真实内核状态发生分歧（divergence）**，从而判断失误。

### 2. 接口太宽，交互出人意料

- **崩溃处理**：进程崩溃时，内核会把 core dump 写到 `core` 文件——**并不经过 `open` 系统调用**，于是绕过检查
- **传递文件描述符**：通过 FD 传递（如 Unix domain socket）拿到的 FD，绕过了 `open` 检查
- **沙箱外的 helper 进程**：可能被用来绕过策略

### 3. TOCTTOU 竞态（Time-Of-Check-To-Time-Of-Use）

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>TOCTTOU</strong>在“策略做出决定”与“系统调用真正执行”之间，状态被改变了——检查时是安全的，使用时已经不是了。</div>

具体的脆弱点：

- 路径遍历过程中 **symlink 解析被改变**
- 遍历途中**目录被重命名**
- **当前工作目录被修改**
- **内存中的参数被修改**（检查的是旧值，执行用的是新值）
- **FD 表被改变**

### 4. 符号链接（symlink）的复杂性

需要分层的策略：

- 禁止**创建** symlink
- 禁止**重命名** symlink
- 禁止**通过** symlink 访问（需要 `O_NOFOLLOW`）

> 难点：symlink 出现在路径**最终分量之前**的中间部分时尤其棘手。
> 现代解法：`openat2()` 配合 `RESOLVE_NO_SYMLINKS` 标志。

### 5. 阻断系统调用带来的“副作用”

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>阻断也会改变程序行为</strong>拒绝某个系统调用可能让一个“行为良好”的程序无法正常工作，甚至产生错误行为。</div>

- 例如阻止了**降权（dropping privilege）**、阻止了**关闭文件描述符**
- 策略执行本身可能导致程序行为不正确

## 八、缓解策略

- **在内核里拦截**：比用户态 `ptrace` 更可靠，能更紧密地贴合 OS 语义
- **参数处理**：在使用系统调用参数前，先把用户内存**拷贝进来**（避免被 TOCTTOU 改动）
- **集成进内核代码路径**：与其在“操作前”单独检查，不如把检查嵌入内核真正执行该操作的路径里
- **改造被沙箱的应用**，使其强制保持良好行为
- **把路径遍历展开成可逐步检查的步骤**
- 不同系统调用要区别对待，针对性应用上述手段

## 九、与 xv6 的关系 & 实际应用

> 思考：上述这些坑，哪些适用于 xv6 这种简化内核的设计？（xv6 接口更小、语义更简单，许多坑天然不存在。）

**实际应用场景：**

- 隔离与限制（isolation / containment）
- 审计与监控（auditing / monitoring）
- 入侵检测（intrusion detection）
- 无需修改应用即可施加约束

**关键优势：**

- **不需要修改应用程序**
- 无论应用是否恶意都能监控
- 无需应用配合即可部署

---

## 自测清单

- [ ] 为什么选“系统调用”作为安全边界？库层为什么不行？
- [ ] Janus 为什么采用“内核 stub + 用户态策略进程”的划分？各自的好处是什么？
- [ ] 为什么说“仅凭系统调用参数不足以做安全决策”？举三个例子。
- [ ] 什么是 TOCTTOU？在系统调用拦截里有哪些具体表现？
- [ ] symlink 为什么棘手？现代有什么解法？
- [ ] 为什么“复制内核状态”容易出错？“接口太宽”会带来哪些绕过？
