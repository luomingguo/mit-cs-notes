---
title: concept
type: assignment
tags: []
status: complete
---
## Assignment: Reading and Writing Concepts

**截止日期**：2025 年 9 月 14 日 23:59。官方作业页：[Problem Set 1](https://61040-fa25.github.io/assignments/problem-set-1)。

这是本课程第一次真正动手"读"和"写"概念规格说明（*concept specification*）的作业，直接练习本节课讲的名字、目的、状态、动作、运行原理这套四要素格式。作业明确要求独立完成（不鼓励小组合作），遇到困难应找助教而非同学讨论。

### 四个练习

1. **练习一：阅读概念**——给定一份 `GiftRegistration` 概念规格，回答 7 个问题，涉及不变量、动作设计、行为推断、状态查询、以及如何在此基础上扩展新功能。这一练习的重点是"读懂"别人写的概念规格，而不是自己从零设计。
2. **练习二：补全概念**——给定一份不完整的 `PasswordAuthentication` 概念，需要自己补上状态定义、为每个动作写清楚 requires/effects，识别其中的不变量，并进一步扩展出"邮箱确认"（email confirmation）这一新功能。
3. **练习三：对比概念**——将 `PasswordAuthentication` 与 GitHub 的 `PersonalAccessToken`（个人访问令牌）概念做对比：写出一份最简版的 `PersonalAccessToken` 规格，说明两者的核心差异，并给出改进 GitHub 官方文档的建议。这一练习训练"同一类问题，不同产品会用不同概念来解决"的判断力。
4. **练习四：设计概念**——从给定列表（URL 短链接、计时收费、会议室预订、电子登机牌、地址验证、TOTP 双因素验证）中任选三个，各自完整写出一份概念规格：目的、运行原理、状态、动作，并对不明显的设计决策做说明。

### 与本节课的呼应

- 练习一、二直接对应本节课讲的"概念四要素"——名字必须精准、目的必须是概念的灵魂、状态与动作必须支撑运行原理这个用户故事。
- 练习三呼应"杀手级概念"部分的思路：同一个问题（认证）在不同产品里可能对应完全不同的概念设计（密码认证 vs. 个人访问令牌），设计选择本身就传递了产品意图。
- 作业提供了独立的"概念设计评分标准"（*concept design rubric*，PDF/Markdown 两种格式）作为自查清单，并注明可以用 LLM 辅助检查，但官方特别提醒：LLM 是否真的掌握概念设计的知识、能否可靠生成正确的概念，仍是存疑的，不能完全依赖。

### 提交方式

在个人 GitHub 作品集仓库中创建 Markdown 文件写答案，链接到主 README；提交前 commit + push 并记下 commit hash；通过[提交表单](https://forms.gle/PrjgUtsoXMac1GqZ6)提交仓库链接和 commit hash；24 小时内完成[课程调查问卷](https://forms.gle/RQiTgCpqcAkp8ESQA)。
