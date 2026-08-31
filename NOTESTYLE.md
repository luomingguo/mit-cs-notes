# MIT CS Notes 内容规范

本规范定义 Markdown 笔记的长期内容契约。目标不是让所有文章长得一样，而是让内容同时满足三件事：人能顺畅阅读、工具能稳定解析、RAG 能保留足够上下文。

适用范围是课程目录中的 `course`、`lecture`、`paper`、`concept`、`assignment`、`project` 页面。站点首页、领域首页和学习路径页可使用自己的页面元数据，不强行套用课程笔记骨架。

## 一、目录是归属层，不是知识层

目录只表达“这篇内容属于哪个学科、分类和课程”。页面内部结构、链接和 tags 承担知识表达与跨课程连接。

```text
docs/zh/
├── cs/
│   ├── arch/
│   │   └── cca/
│   │       ├── index.md
│   │       ├── lec1.md
│   │       ├── paper/
│   │       │   └── pipeline-paper.md
│   │       └── concept/
│   │           └── locality.md
│   └── computer_sys/
│       └── os/
│           ├── index.md
│           ├── lec1.md
│           ├── assignment/
│           └── project/
└── psy/
    └── core/
        └── intro/
            ├── index.md
            └── lec1.md
```

目录规则：

- 路径固定为 `docs/zh/<discipline>/<category>/<course>/...`。
- 课程根目录的 `index.md` 是课程元数据的唯一规范来源。
- 讲义直接放课程根目录；论文、概念、作业和项目分别放同名子目录。
- `paper/` 与 `concept/` 是平级职责。不要把概念页放进 `paper/`，也不要仅因概念跨课程出现就把它移出课程上下文。
- 跨课程复用由 tags 和显式内部链接完成，不靠不断增加目录层级。

## 二、Frontmatter

### 课程页

```yaml
---
title: 6.1920 建构式计算机架构，CCA
type: course
course: 6.1920 建构式计算机架构，CCA
course_id: '6.1920'
tags: [computer-architecture, processor-design, cache-coherence]
status: complete
---
```

课程 `index.md` 负责维护：

| 字段 | 要求 | 含义 |
|---|---|---|
| `title` | 必填 | 页面标题 |
| `type` | 必须为 `course` | 页面主要职责 |
| `course` | 必填 | 课程可读名，也是子页继承的课程名 |
| `course_id` | 有则填写 | 稳定课号；必须用引号避免 YAML 误解析 |
| `tags` | 必填 | 课程涉及的 2–5 个稳定主题，最多 7 个 |
| `status` | 必填 | `complete`、`draft` 或 `stub` |
| `source` | 可选 | 官方课程页或主要来源 |

### 子页

```yaml
---
title: 高速缓存与存储缓冲区
type: lecture
lecture: 7
tags: [cache, memory-hierarchy, locality]
status: complete
---
```

子页只维护自身事实：

| 字段 | 要求 | 含义 |
|---|---|---|
| `title` | 必填 | 不带 `Lec N` 前缀的页面标题 |
| `type` | 必填 | 本页的主要职责 |
| `lecture` | 讲义按需填写 | 讲次，用数字 |
| `tags` | 必填 | 本页最有区分度的 2–5 个概念键，最多 7 个 |
| `status` | 必填 | `complete`、`draft` 或 `stub` |
| `source` | 可选 | 论文、讲义、仓库或项目来源 |

子页不要重复 `course`、`course_id`、`discipline`、`category` 或 `course_slug`。解析器会从路径定位最近的课程 `index.md` 并继承课程元数据。这样改课程名或课号时只有一个修改点。

## 三、`type` 表达页面职责

`type` 只能取以下值：

| `type` | 典型路径 | 页面回答的问题 |
|---|---|---|
| `course` | `<course>/index.md` | 这门课是什么，如何学习，包含哪些内容？ |
| `lecture` | `<course>/lecN.md` | 这一讲建立了哪些知识与推理链？ |
| `paper` | `<course>/paper/<slug>.md` | 论文提出什么主张，证据是否支持它？ |
| `concept` | `<course>/concept/<slug>.md` | 这个概念是什么，边界、机制和关系是什么？ |
| `assignment` | `<course>/assignment/<slug>.md` | 任务、约束、解法和验证是什么？ |
| `project` | `<course>/project/<slug>.md` | 项目目标、架构、决策和结果是什么？ |

`type` 是单值，因为它描述页面的主要阅读任务。若一篇论文解释了许多概念，它仍是 `paper`；相关概念用 tags 和链接表达，不要把 `type` 当多标签使用。

## 四、Tags 是全局概念键

一个 tag 值得保留的判断标准是：未来是否可能在另一门课程、论文、作业或项目里再次出现。

```yaml
tags: [cache, memory-hierarchy, locality]
```

规则：

- 通常 2–5 个，最多 7 个。
- 统一使用小写英文 kebab-case，例如 `memory-hierarchy`、`cognitive-bias`、`consumer-behavior`。
- 同义词只保留一个规范写法；不要同时使用 `cache-coherence` 和 `coherence-cache`。
- 优先写概念，不写课程名、学科名、`lecture`、`paper`、`important` 等归属或评价词。
- 不要把摘要中的每个名词都变成 tag。只保留能改善跨文档发现和检索过滤的主题。
- tags 是检索增强信号，可以用于过滤、聚合和轻量加权；它不是阅读前置条件，也不能替代正文中的定义和链接。

## 五、每篇内容必须有唯一的 `## TL;DR`

`## TL;DR` 是正文第一个 H2，位于 H1 和来源信息之后。大小写与标点固定，不使用 `摘要`、`Summary` 或其他别名。

```markdown
# Lec 7 高速缓存与存储缓冲区

> MIT 6.1920 · Constructive Computer Architecture

## TL;DR

- 缓存利用时间和空间局部性隐藏 DRAM 延迟。
- 阻塞缓存通过缺失状态机完成写回与填充。
- 组相联以更多比较逻辑换取更低的冲突缺失率。
```

内容要求：

- 3–5 条要点，通常总计 80–350 个中文字符，硬上限 700 字符。
- 能脱离正文独立理解，明确对象、核心机制或主张，以及重要边界。
- 使用正文中的规范术语；必要时在首次出现处给出英文。
- 不写“本讲介绍了……”之类目录式句子，不堆未经解释的关键词。
- `status: complete` 时不能保留模板占位文字。

不同页面的 TL;DR 侧重点不同：

- `course`：课程范围、学习路径、前置与最终能力。
- `lecture`：问题、机制、结论或关键权衡。
- `paper`：研究问题、核心主张、关键证据与局限。
- `concept`：定义、机制、边界及与相邻概念的关系。
- `assignment`：任务、核心解法、验证结果与易错点。
- `project`：目标、架构决策、结果与限制。

TL;DR 同时是页面摘要和 RAG 摘要块。RAG 必须把它作为一块独立内容保留：不受普通 chunk 最短长度限制，不与下一节合并。

## 六、标题与正文结构

- 每篇正文只有一个主 H1。讲义可写 `# Lec N 中文标题（English）`；其他类型直接写标题。
- 标题层级表达编辑者判断的知识关系。由编辑者决定 H2–H6 的层级、深度与拆分方式；工具必须保留并解析现有层级，不得因层级跳跃、嵌套深度或父标题没有独立正文而要求调整。
- 标题应包含主题词，例如 `## 直接映射缓存的地址划分`。除固定的 `## TL;DR` 外，避免孤立的 `概述`、`背景`、`小结`、`总结`。
- 普通章节和整篇笔记不设字符数或行数门槛。RAG 可以在不改动 Markdown 的前提下按标题、段落和内部块长继续切分，但不得把检索实现的长度参数反向变成内容规范。
- 代码块必须标语言。代码之前说明目的，之后解释关键行为或结果。
- 公式、表格和图片都要有正文解释。图片不能承担唯一的信息来源；RAG 默认不从图片像素恢复知识。
- 结尾小结是可选的。已经有 TL;DR 时，不为满足模板而重复同一组句子。
- 对 `status: complete` 的非课程页，应加入作者自己的判断，可使用 `::: insight`；这部分应提供讲义原文之外的增量，而不是换句话复述。

## 七、语义容器

统一使用 Markdown 语义容器，不用颜色或裸 HTML 表达知识类别：

```markdown
::: definition 存储器层次
存储器层次用不同容量与延迟的介质共同逼近理想存储器。
:::

::: theorem 局部性的作用
当访问具有足够局部性时，小容量缓存可以覆盖大部分请求。
:::

::: example
（可复算的例子。）
:::

::: insight
（作者自己的解释、连接或判断。）
:::

::: pitfall
（常见误解、失败模式或适用边界。）
:::
```

允许的知识语义为：

- `definition`：定义与边界。
- `theorem`：定理、性质、推论及成立条件。
- `example`：例题、案例或可复算演示。
- `insight`：作者自己的理解与跨知识连接。
- `pitfall`：误区、风险、反例或失败模式。

容器名称会同时进入前端渲染和 RAG 清洗。修改名称或语义时，必须同步检查 `frontend/astro.config.mjs`、`tools/notes-lint.mjs`、`tools/notes-fix.mjs` 与 `rag/src/chunk.ts`。

## 八、不同类型的写作重点

以下是内容检查清单，不是必须逐字照搬的标题模板。

### `course`

- 课程定位、范围和不覆盖的内容。
- 前置知识与推荐顺序。
- 自动或显式生成的内容目录。
- 教材、讲义、实验和官方来源。

### `lecture`

- 本讲要解决的问题及其前后依赖。
- 核心机制和因果链。
- 公式、代码、例子或实验如何验证机制。
- 设计权衡、适用边界和作者理解。

### `paper`

- 研究问题、假设和主要贡献。
- 方法、数据、实验设置与关键证据。
- 结论成立需要哪些条件。
- 局限、批判和与其他工作的关系。

### `concept`

- 可独立引用的定义与非例。
- 直觉、机制和必要条件。
- 例子、反例和常见误解。
- 前置、相邻、派生概念及应用链接。

### `assignment`

- 任务、输入输出、约束和完成标准。
- 解题推导或实现策略。
- 测试、边界情况和结果。
- 错误尝试与可迁移经验。

### `project`

- 问题、用户、范围和成功标准。
- 架构、数据流、关键接口与决策记录。
- 实现中的取舍与替代方案。
- 验证、结果、限制和后续工作。

## 九、链接、来源与状态

- 用相对 Markdown 链接连接同课程内容，例如 `[局部性](./concept/locality.md)`。
- 跨课程链接也应指向仓库内真实 Markdown，不只在正文中写课程名。
- 论文、数据、课程页和代码仓库应提供可追溯来源；引用结论时尽量链接到具体页面或章节。
- `complete` 表示正文结构与关键内容已完成，不代表永远不会再修改。
- `draft` 表示内容可读但仍有明确缺口。
- `stub` 是占位页，不进入 RAG 语料。
- 不展示或写入无法从来源确认的假数据。

## 十、RAG 内容契约

| Markdown 信号 | RAG 行为 |
|---|---|
| 课程目录路径 | 得到 `discipline`、`category`、`course_slug` 和默认页面类型 |
| 课程 `index.md` | 向所有子页提供 `course`、`course_id` 和兼容性元数据 |
| `type` | 写入文档和 chunk 元数据，用于按页面职责筛选或聚合 |
| `tags` | 写入文档和 chunk 元数据，用于概念过滤、聚合和轻量加权 |
| `## TL;DR` | 生成唯一的 `summary` chunk，即使短于普通最小块长也保留 |
| H2–H6 标题 | 分别形成内容分节、层级面包屑和站内锚点；至少完整保留 H2 与 H3 的关系 |
| 语义容器 | 转为定义、定理、例子、作者理解或误区信号 |
| `status: stub` | 不进入检索库 |

普通 chunk 仍按知识章节切分。标题必须表达主题，是因为检索上下文会组合“课程 · 文档 · 章节”；TL;DR 是允许使用固定标题的特殊块，其文档标题和课程元数据提供区分上下文。

## 十一、工具与渐进迁移

```bash
# 新建讲义；课程目录会被自动发现
npm run notes:new -- --course os --lecture 21 --title "网络栈"

# 新建概念、论文、作业或项目页
npm run notes:new -- --course cca --type concept --slug cache-locality --title "缓存局部性"

# 检查单篇或全库
npm run notes:lint -- docs/zh/cs/arch/cca/lec7.md
npm run notes:lint -- --summary

# 只预览机械修复；fix 不会代写 tags 或 TL;DR
npm run notes:fix -- --dry docs/zh/cs/arch/cca/lec7.md

# 验证前端类型与 RAG 类型
npm run site:check
npm --prefix rag run typecheck
```

迁移策略：

- 新文档必须直接满足本规范。
- 旧文档缺 `type` 或 `TL;DR` 时，lint 先报 warning，避免一次性伪造数百篇摘要。
- 显式写错 `type`、类型与路径冲突、非法或重复 tags、重复 TL;DR、TL;DR 位置错误属于 error。
- 迁移旧文档时优先按课程逐篇处理：先完善课程 `index.md`，再处理高价值子页。
- 自动修复只处理可确定的格式与元数据，不自动生成需要理解正文的 tags、TL;DR 或作者判断。
