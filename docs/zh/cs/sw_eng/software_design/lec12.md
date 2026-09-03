---
title: 现代AI coding工具 · 软件设计
type: lecture
lecture: 12
tags: [vibe-coding]
status: complete
source: 'https://61040-fa25.github.io/assets/lecture-notes/understanding-synchronizations.pdf'
---
# Lec 12 现代 AI coding 工具

### TL;DR

AI Coding 正从 Vibe Coding 走向 Vibe Engineering 和 Multi-Agent：AI 不再只是生成代码，而是参与规划、实现、测试、Review 和重构等完整工程流程。随着多个 Agent 可以并行工作，真正的瓶颈从“写代码”转向人的 Design、Specification、任务分配和 Review 能力。

## Agent 编程的工作原理与使用原则

### Agent 的核心其实是一个循环

以 Claude Code 为例，底层最核心的模式非常简单：

```text
while (model requests tool)
    → execute tool
    → return result to model
    → model decides next step
    → repeat
```

只要模型继续发起 Tool Call，Agent 就继续工作；当模型不再调用工具、只输出普通文本时，这一轮任务结束。

例如修 Bug：

```text
用户：修复 Bug
   ↓
Search：搜索相关代码
   ↓
Inspect：读取文件、理解上下文
   ↓
Edit：修改代码
   ↓
Test / Diff：运行测试、检查结果
   ↓
失败 ─────────→ 回到 Inspect / Edit
   ↓ 成功
回答用户 + 展示修改
```

所以 **Agent ≠ 单次 LLM 回答**：

> **Agent = LLM + Tools + Context + Iterative Loop。**

Agent 的行为很大程度由 Instructions 塑造。

Agent 并不是“模型自己天然知道应该怎么工作”，系统会提供大量 Instructions，规定它应该如何与用户沟通、修改代码和执行任务。

### 用户交互

例如 Claude Code 的 Instructions 会规定：

- 输出会显示在 CLI，因此回答应简短；
- 用 Markdown 与用户沟通；
- Tool 是用来完成任务的，不是拿来和用户说话的；
- 不要随意使用 emoji；
- 可以主动完成必要的后续操作，但不要未经要求做让用户意外的事情。

核心原则：

> **Proactive but not surprising：主动完成任务，但不要擅自扩大用户意图。**

### 代码编辑指令

Agent 修改代码前，不应该直接“凭感觉生成”，而是先理解现有代码库：

```text
Inspect existing code
      ↓
Understand conventions
      ↓
Reuse existing libraries / patterns
      ↓
Make minimal change
      ↓
Test
```

具体包括：

- 修改文件前先理解现有 code conventions；
- 不要假设某个 library 已安装，先检查 `package.json` 等；
- 创建新 Component 前先查看已有 Component 怎么写；
- 修改代码前检查周围 Context，尤其是 imports；
- 遵守项目已有 naming、typing、framework 和 style；
- 不泄露或提交 secrets / keys；
- 避免无必要的修改。

也就是说，优秀 Agent 的目标不是：

> “生成一段正确代码。”

而是：

> **“生成一段适合这个具体 codebase 的正确代码。”**

这再次回到了 **Context**。

### Agent 还需要 Task Planning

复杂任务不能只靠一次生成完成，因此 Agent 会维护 Plan / Todo，把任务拆成小步骤：

```text
Build project
↓
发现 10 个 Type Errors
↓
拆成多个 Todo
↓
Fix #1 → 标记完成
↓
Fix #2 → 标记完成
↓
...
↓
重新 Build / Test
```

Plan 的价值在于让 Agent：

- 不容易在复杂任务中忘记目标；
- 知道当前进行到哪里；
- 将大问题拆成可验证的小问题；
- 完成一步后及时更新状态；
- 给用户一定的进度可见性。

因此一个成熟 Coding Agent 实际上在不断执行：

```text
Plan → Act → Observe → Update Plan → Act → ...
```

------

### Agentic Coding 的风险：Cognitive Debt

最后几张图是在提醒：**Agent 越强，人越容易停止理解。**

Vibe Coding 很容易变成：

```text
提出需求
→ AI 改代码
→ Accept All
→ 能运行
→ 继续让 AI 改
→ ...
```

短期生产力很高，但可能产生 **认知债务（*Cognitive Debt*）**：

这与 Technical Debt 不完全一样：

```text
Technical Debt
= 代码本身越来越难维护

Cognitive Debt
= 人越来越不理解自己正在构建的东西
```

课件最后用 NYT 关于 AI 是否让人“变笨”的评论，以及 MIT 关于使用 AI 辅助写作与认知活动的研究来引出这个担忧：把认知工作外包给 AI，可能降低人主动思考和理解任务的程度。

这一节其实形成了一个很完整的逻辑：

```text
Agent 越来越强
      ↓
实现代码越来越容易
      ↓
人可能逐渐脱离代码细节
      ↓
产生 Cognitive Debt
      ↓
更需要保存高层设计理解
      ↓
Context Engineering
      +
Concept Design
```

所以课程并不是反对 Agentic Coding。相反，它希望你把低层工程工作交给 Agent，同时不要把软件设计与理解也一起交出去。

**核心：Agentic Coding 用 Tool Loop 自动完成搜索、修改、测试和迭代；Instructions 与 Context 决定 Agent 如何行动。AI 可以替你做越来越多 implementation，但人仍需要保持对 Purpose、Concept、Architecture 和 Design Intent 的理解，否则节省了工程劳动，却积累了 Cognitive Debt。**

## 当前前沿：多 Agents 并行工作

AI 生成的代码仍然需要人类 Review，因此问题是：为什么还要同时运行多个 Agent？

一个合理模式是把工作按照重要性拆开：

```text
你 / 主 Agent
→ Critical Path：核心设计、关键功能、重要决策

其他 Agents
→ Minor Issues：小 Bug、测试、文档、局部重构等
```

这样 Agent 可以在后台并行处理次要任务，而你把注意力集中在 关键路径 上。

但并行 Agent 并不是越多越好，因为：

> **AI 生成代码的成本很低，但 Review 代码仍然很贵。**

突然丢给你一大堆陌生代码，理解和 Review 的成本非常高；如果这些代码来自你自己明确写出的 Specification，Review 就容易很多，因为你已经知道它应该做什么。

因此：**Multi-Agent 的瓶颈正在从“生成速度”转向“人的 Specification、协调与 Review 能力”。**

## 从 Vibe Coding 到 Vibe Engineering

**Vibe Coding** 更接近：

```text
告诉 AI 我要什么
→ AI 写一大块代码
→ 跑起来
→ 有问题继续让 AI 改
```

而 Vibe Engineering 强调：不要只把 Agent 当“代码生成器”，而是让它参与完整的软件工程流程。包括：

- **Plan & Research**：实现前先规划、研究；
- **Documentation**：生成完整文档；
- **Automated Tests**：设计高质量自动化测试；
- **Version Control**：保持良好的版本管理；
- **Code Review**：让 Agent Review 自己或其他 Agent 的代码；
- **Refactoring**：主动寻找可重构部分；
- **Bug Finding**：检查潜在 Bug。

形成：

```text
Research
   ↓
Plan / Specification
   ↓
Implementation
   ↓
Automated Tests
   ↓
Review
   ↓
Refactor / Fix
   ↓
Version Control
```

> **Vibe Coding = 用 AI 帮你写代码；
> Vibe Engineering = 用 AI 帮你执行软件工程流程。**

而且课件强调：前期 Plan、Research、Specification 做得越好，Agent 最终生成的代码本身也会更好。

人的角色正在从 Coder 转向 Manager / Designer，有效使用 Coding Agents 本身是一项需要练习的技能。你需要逐渐形成两种能力：

- **Mental Model of AI**：知道模型擅长什么、不擅长什么，什么时候容易犯错，应该给多少 Context。

- **Management Skills**：能够拆任务、写 Specification、分配工作、判断 Critical Path、Review 输出、协调多个 Agent。

因此，多 Agent 开发越来越像：

```text
过去
Developer → Code

现在
Developer
   ↓
Design / Specification
   ↓
Plan & Delegate
   ↓
Agent A ─ Implementation
Agent B ─ Tests
Agent C ─ Research
Agent D ─ Review
   ↓
Developer Review / Decision
```

## 对初级开发者的影响：不一定只是“被 AI 替代”

最后一页是在讨论一个有意思的行业现象。一方面，媒体报道 CS 毕业生求职困难；另一方面，一些公司的招聘者开始重新增加 Junior / Intern 招聘，因为：

> **会使用 AI 工具的 Junior，可能比过去的 Junior 更快地产生价值。**

也就是说 AI 可能同时产生两种力量：

```text
AI 自动化基础 Coding
→ 一部分初级工作减少

但

Junior + AI
→ 生产力提高
→ 更早承担过去需要 Senior 才能完成的工作
```

所以真正变化的可能不是简单的“Junior 消失”，而是：

> **Junior Developer 的能力基线正在改变：除了会 Coding，还要会使用、指导、验证和管理 AI Agents。**

## 配套工作

- **Recitation 7 — HTML and CSS**：用页面结构与样式实现前端；[Rec 7 课件](https://61040-fa25.github.io/assets/recitation_notes/Recitation_7_HTML_and_CSS.pdf)。
- **Prep 4 — HTML & CSS**（10 月 16 日 10:00）：[Prep 4](https://61040-fa25.github.io/preps/prep-4)。

Assignment 4b（Front End Checkin / Complete）整理在 [lec13.md](./lec13.md) 文末，因为它更直接对应前端框架这一讲。
