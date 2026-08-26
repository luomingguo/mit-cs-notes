---
title: Lab 实验答疑（Raft Lab 3A + 3B）
type: lecture
lecture: 10
tags: []
status: complete
---
# Lec 10 Lab 实验答疑（Raft Lab 3A + 3B）

> 课件：[Q&A Lab 3A+B (l-raft-QA.txt)](https://pdos.csail.mit.edu/6.5840/notes/l-raft-QA.txt)

本讲是 Raft 实验（3A 选举、3B 日志复制）的实现答疑，把 [[lec7]] 的 Raft 协议落到代码工程上。核心是两件事：**怎么组织并发结构**、**怎么调试**。

## 本讲导览

- 正确性框架：Safety vs Liveness
- 两种实现结构：多线程加锁 vs 单线程状态机
- 加锁原则与死锁
- 上手策略与代码走读顺序
- 调试方法论
- 3A / 3B 各要什么

---

## 一、正确性框架：Safety vs Liveness

::: definition 两类正确性、两类 bug
- **Safety（安全性）**：**永不返回错误结果**。违反 = 选出两个 leader、提交了不该提交的项、不同节点同一 index 提交了不同命令。

- **Liveness（活性）**：**最终能返回结果**。违反 = 一直选不出 leader、请求永远不提交、反复选举。

做实验时要能在自己代码里分别举出这两类 bug 的例子。
:::

## 二、两种实现结构

Raft 实现有两条可行路线，**并无绝对优劣**（实际并行度差不多，主要并行收益来自"并发发 RPC"）：

::: definition ① 多线程 + 锁
- 系统为每个 RPC 起一个 handler goroutine；另起一个专门的 **applier 线程**读 `applyCh`；`Start()` 由客户端线程调用。

- 共享的 Raft 状态用**单把锁**保护；用**条件变量**唤醒 applier。

- 锁把所有操作串行化（原子但并行度有限）。
:::

::: definition ② 单线程状态机（事件循环）
- 一个线程处理所有事件（tick、RPC 请求/回复）：更新状态时**无需加锁**，把要做的输出收集起来。

- 执行输出时：**先持久化、再发 RPC**。

- 另有独立的 applier 线程，用锁保护与它共享的状态（如 log）。
:::

## 三、加锁原则与死锁

::: example 两条铁律
- **绝不要在持有锁时发 RPC**（`peer.Call()`）——RPC 可能阻塞很久，持锁阻塞会死锁。常见模式：持锁读出要发的参数 → 放锁 → 发 RPC → 重新持锁处理回复（并**重新检查 term/state 是否已变**）。

- 用**单把大锁**保护全部 Raft 状态，简单不易错；优化留到能跑通之后。
:::

> 并发要点：发 AppendEntries/RequestVote 要**并发**发给各 peer、**不要串行等**；回复回来时计票/更新 nextIndex，达多数才提交。leader 收到回复后必须先确认"我还是这个 term 的 leader"（可能已被新 term 打回 follower），否则会用过期上下文乱改状态。

## 四、上手策略

1. **先让第一个测试通过**：从填 `RequestVote` 的 Args/Reply 结构与基本 RPC 机制开始。
2. **增量推进**：早期的小进展能帮你看清整体架构。
3. **对照论文 Figure 2 逐条实现**——它是 Raft 的完整状态/规则规约，实验几乎就是把它翻译成代码。

**代码走读顺序**（课件给的实现序）：`Raft struct` → `Ticker`（定时器）→ 选举超时 → 发起选举 → 处理 `RequestVote` → `becomeLeader` → 发 AppendEntries → 处理 AppendEntries 请求/回复 → 提交 → applier → `Start()`。

## 五、调试方法论

::: theorem 系统化调试
- 测试时**开 race detector**（`-race`）。

- **把所有动作/消息按统一格式打日志、便于搜索**：源、目的、opcode、Raft 状态（term/role/log 长度等）。

- 对失败用例**反复重跑**，循环：读懂测试期望 → 猜可能的问题 → 对照日志和论文 Figure 2 分析 → 改代码再试。

分布式 bug 常是**偶发**的，必须靠"统一格式日志 + 多次重跑"复现，而不能指望一次跑出来。
:::

## 六、3A / 3B 各要什么

- **Lab 3A（leader 选举）**：实现 `Ticker` + 选举超时（**随机化**以防分票）、`RequestVote`（含 `votedFor`/term/日志新旧比较）、心跳（空 AppendEntries 维持 leader、压制新选举）。目标：单一 leader、leader 挂了能在合理时间内重新选出。
- **Lab 3B（日志复制）**：实现 `Start()`（把命令塞进日志）、AppendEntries 的一致性检查（`prevLogIndex/prevLogTerm`）、`nextIndex/matchIndex` 维护与**冲突快速回退**、`commitIndex` 推进（达多数）、applier 按序送 `applyCh`。目标：日志在多数派上一致并按序 apply。

> 衔接：3C（持久化）、3D（快照/InstallSnapshot）在后续；本讲只覆盖 3A+3B 的结构与调试。Raft 的协议细节、配置变更、快照、只读租约等见 [[lec7]] 的课件精讲与 FAQ。

## 本讲小结

> Raft 实验把 [[lec7]] 的 Figure 2 翻成代码。两种结构（多线程加锁 / 单线程事件循环）皆可，关键纪律是**不在持锁时发 RPC**、**并发发 RPC 且回复后重检 term/state**。先过第一个测试、对照 Figure 2 增量推进；调试靠 **race detector + 统一格式日志 + 反复重跑**。分清 **safety（不出错）** 与 **liveness（最终出结果）** 两类 bug。
