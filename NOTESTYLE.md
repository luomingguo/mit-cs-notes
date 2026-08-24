# 笔记风格规范

这份规范不是凭空设计的，是从库里**已经写得最好的那批笔记**里提炼出来的。每一条都能指到一篇现存的样板文件。

规范服务两个目标：

1. **逻辑性** —— 一篇笔记读下来是一条推进的线，而不是讲义的平铺搬运。
2. **可检索** —— 笔记同时是 `rag/` 向量库的语料。章节粒度、标题命名、语义区块，都直接决定检索质量。

> 用 `npm run notes:lint` 检查，`npm run notes:fix` 自动修机械问题。

---

## 目录

- [一、Frontmatter](#一frontmatter)
- [二、标题与溯源块](#二标题与溯源块)
- [三、章节规则](#三章节规则)
- [四、语义容器](#四语义容器)
- [五、「我的理解」（必填）](#五我的理解必填)
- [六、术语与排版](#六术语与排版)
- [七、四类正文骨架](#七四类正文骨架)
- [八、为什么这些规则对 RAG 重要](#八为什么这些规则对-rag-重要)

---

## 一、Frontmatter

每一篇正文页都要有。这是唯一能让检索按课程、按类型、按完成度过滤的东西。

```yaml
---
title: 秘密共享
course: 6.5610 应用密码学
course_id: '6.5610'
lecture: 12
kind: theory
tags: [门限方案, 多项式插值, 完美安全]
status: complete
source: https://65610.csail.mit.edu/
---
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | **不含 `Lec N` 前缀**，纯主题。VitePress 用它做 `<title>`，与 H1 并存不冲突 |
| `course` | ✅ | 课程可读名，取自课程目录 `index.md` 的首个 H1 |
| `course_id` | ✅ | MIT 课号，如 `'6.5610'`。加引号，否则 YAML 会当浮点数 |
| `lecture` | | 讲次数字。非讲次页（`index` / `lab` / 专题页）省略 |
| `kind` | ✅ | `theory` \| `system` \| `source` \| `design`，决定用哪套骨架，见[第七节](#七四类正文骨架) |
| `tags` | ✅ | 3–6 个概念词。**写具体概念，不写课程名**——课程信息已经在 `course` 里了 |
| `status` | ✅ | `complete`（可发布）\| `draft`（有 TODO）\| `stub`（占位，不进检索库） |
| `source` | | 原文 / 课程主页 URL |

`status: stub` 的文件会被 `rag/src/corpus.ts` 排除在 ingest 之外。这比现在按篇幅粗暴过滤要准确 —— 一篇 150 字但写完了的笔记不该被丢掉，一篇 300 字的占位页也不该进库。

---

## 二、标题与溯源块

### H1

```markdown
# Lec 12 秘密共享（Secret Sharing）
```

格式锁死为 `# Lec {N} {中文}（{English}）`。

废弃这些变体（都是库里真实存在的）：

| ❌ | 出处 |
|---|---|
| `# Lecture 10: Cryptography` | `tcs/maths_for_cs/lec10.md` |
| `# Lecture 11：图与着色` | `tcs/maths_for_cs/lec11.md` |
| `# L10：高级访存操作（*Advanced Memory Operations*）` | `arch/csa/lec10.md` |
| `# L10 · 全同态加密 II：Bootstrapping` | `security/apply_cryptography/lec10.md` |
| `# Lec 9 — 惯性感知（*Inertial Sensing*）` | `computer_sys/mobile/lec9.md` |

`arch/csa/` 目录内部就同时存在 `# Lec 11 多线程技术` 和 `# L10：高级访存操作` 两种写法。

**一篇正文页只能有一个 H1。** 把 H1 当 H2 用是常见错误 —— `computer_sys/dc_computing/lec14.md` 在 26 行里放了 3 个 H1。

### 溯源块

H1 正下方，引用块，一到两行：

```markdown
> MIT 6.5610 · Lecture 12 · 关键词：门限秘密共享、Shamir 方案、多项式插值、完美安全、线性性
```

源码研读类用原文出处：

```markdown
> 原文：https://habr.com/en/companies/postgrespro/articles/578196/ （作者 Egor Rogov，PostgresPro）
```

**关键词行不是可有可无的装饰**。它是整篇笔记的语义摘要，会被切成第一个 chunk，对"这篇讲什么"类查询的召回帮助很大。样板：`security/apply_cryptography/lec12.md`、`language/dynamic_language/lec12.md`。

---

## 三、章节规则

### 3.1 标题必须带主题词

这是全部规则里对检索影响最大的一条。

```markdown
❌ ## 小结
✅ ## 本讲小结：Shamir 与线性性

❌ ## 背景
✅ ## 背景：为什么单机事务日志不够用

❌ ## 5. Raft 共识算法          ← 两个不同文件里各有一篇万字同名章节
✅ ## 5. Raft 的选举与日志复制
```

`## 小结` 这个字符串目前出现在 **52 个文件**里。`rag/src/chunk.ts` 的 `embedText()` 会把「课程 · 文档 · 章节」拼成上下文头送去嵌入 —— 52 个一模一样的标题在向量空间里几乎不可分。

### 3.2 收敛动词表

`总览` / `Outline` / `大纲` / `摘要` / `总结` / `本讲总结` / `小结` / `本讲小结` 是同一语义的 8 种写法。只保留两个：

- `## 本讲导览`（开头，可选）
- `## 本讲小结：<主题词>`（结尾，必填）

### 3.3 章节长度：300–1200 字符

和 `rag/src/chunk.ts` 的 `TARGET = 700` / `MAX = 1300` 对齐。

- **超过 1200 字符** → 拆 H3。否则会被按句号硬切，语义断在半句话上。
- **不足 100 字符** → 并入相邻章节。否则低于 `MIN = 120`，整节被丢弃，等于白写。

当前分布：median 541，**P90 = 2141**，max 23335。22.6% 的章节超标。

### 3.4 禁止空章节

标题下面直接跟另一个标题 = 这一节不存在。要么补内容，要么删标题。

267 个文件有这个问题。最严重的 `computer_sys/database_system/lec3.md` 有连续 14 个空标题：

```markdown
### 单目计算
#### 选择
#### 投影
#### 重命名
### 叉积与连接
...
```

同理，**文件不能以标题结尾**（33 个文件如此，比如 `sw_eng/element_of_software_construction/lec9.md` 最后一行是孤零零的 `## 总结`）。

### 3.5 层级

- 不跳级（H1 → H3、H2 → H4 都不行，当前 42 处）。
- 正文最深到 **H3**。H4 只在源码走读里用于函数级小节。
- 编号风格全篇统一：要么 `## 1.` 全用阿拉伯数字，要么全不编号。不要像 `arch/csa/lec8.md` 那样 `## 一、控制流惩罚` 紧接着 `## 2. 静态与动态预测`。

---

## 四、语义容器

用 VitePress 自定义容器，**不要写裸 HTML**。

```markdown
::: definition 完美安全
$<t$ 份的联合分布与 $s$ 统计独立，不依赖任何计算假设。
:::

::: theorem Shamir (t,n) 方案
随机选 $t-1$ 个系数构造多项式 $p(x) = s + a_1x + \cdots + a_{t-1}x^{t-1}$，$p(0)=s$。
:::

::: example 三方门限
...
:::

::: insight
我的理解：线性性才是 Shamir 真正值钱的地方。门限只是"谁能解密"，
线性性决定了"能不能在密文上算"——这是 MPC 的全部前提。
:::

::: pitfall
朴素 Shamir 不防恶意分发者。发错份额没人能发现，必须配 VSS。
:::
```

| 容器 | 用途 |
|---|---|
| `::: definition` | 定义 |
| `::: theorem` | 定理 / 推论 |
| `::: example` | 例题 / 具体案例 |
| `::: insight` | **我的理解**（见下一节） |
| `::: pitfall` | 常见误区 / 踩坑 |

VitePress 原生的 `tip` / `warning` / `danger` / `info` 保留，用于阅读提示，不与上面五个混用。

### 为什么不能写裸 HTML

库里现有 **960 处** `<div style="...">` 承载定义和例题，用了 8 种以上互斥的 inline style（`#4a90d9` 配 `padding: 10px 15px` 482 次，配 `padding: 0.6em 1em` 42 次，红色有 `#e05c5c` 和 `#d9534f` 两套，绿色有 `#eafbea` 和 `#eafaf0` 两套）。

另有 63 处 `<div class="definition">` / `"corollary"` / `"example"` —— 而 `docs/.vitepress/config.mts` 的 `config: (md) => {}` 是空的，主题里也没有对应 CSS。**这些 class 在页面上完全没有样式，纯粹白写。**

同时 `rag/src/chunk.ts` 的 `cleanForEmbedding()` 会把 HTML 标签剥成空格。所以现状是：结构信号在页面上看不见，在向量里也留不下。

改成容器之后两头都能用：页面有样式，`cleanForEmbedding()` 把 `::: insight` 转成文本前缀「我的理解：」进入嵌入，检索时能区分"这是作者的判断"还是"这是课程内容"。

---

## 五、「我的理解」（必填）

每篇 `status: complete` 的笔记，**在小结之前**必须有：

```markdown
## 我的理解

::: insight
（作者自己的话）
:::
```

### 这一节写什么

不是复述，是增量。三个方向任选：

1. **为什么这个设计是这样** —— 不是"它是什么"，是"为什么不是别的样子"。
2. **和别的课的联系** —— 这个概念在哪门课里以另一个名字出现过。
3. **踩过的坑 / 一开始理解错的地方** —— 你当初卡在哪，什么话点醒了你。

### 为什么强制

全库检索的结果：

| 标记 | 命中文件 |
|---|---|
| `我的理解` / `个人理解` / `我的思考` | **0** |
| `我认为` / `我觉得` / `打个比方` | **0** |
| `笔者` | 1 |

**目前这批笔记相对讲义没有增量价值。** `rag/src/answer.ts` 的系统提示里写着"读者是冲着「这个人的笔记怎么说」来的"，但语料里没有任何"这个人怎么说"可供引用。

现存唯一合格的范例是 `computer_sys/os/lec5.md` 里那段「为什么要让物理地址比虚拟地址大」—— 那是一段独立的第一性解释，不在任何讲义上。这就是标准。

lint 对缺失此块的文件报 warning，不阻塞构建。490 篇都欠着这一段，慢慢补。

---

## 六、术语与排版

### 6.1 术语

**首现**用 `中文（*English*）`，全角括号加斜体：

```markdown
远程过程调用（*Remote Procedure Call, RPC*）
```

有缩写就一并给出。之后全篇只用中文。

库里四种写法并存，选用率最低的那个反而是最规范的：

| 写法 | 出现数 | 文件数 |
|---|---|---|
| `中文（*English*）` | 940 | 102 | ← 用这个 |
| `中文（English）` | 4591 | 401 |
| `中文(English)` 半角 | 3054 | 76 |
| `中文 (*English*)` | 127 | — |

**同一概念全库只能有一个中文形态。** 统一形态记在 `docs/.vocab.json`，lint 会检查。当前的混乱程度：

- `computer_sys/os/lec5.md` 一个文件里：`页表`×80、`页表项`×7、`PTE`×122、`page table`×1、`Page Table`×1
- `arch/csa/lec12.md`：`缓存`×6 vs `Cache`×15 —— 英文用得比中文还多
- linearizability 全库五种写法：`线性一致` / `线性化` / `可线性化` / `强一致性` / `Linearizability`

### 6.2 排版

| 规则 | 当前违规 |
|---|---|
| CJK 与拉丁字母之间加空格 | 15915 处 / 279 文件 |
| 连续空行 ≤ 1 | 258 文件（最严重 `storage/lec10.md` 连续 25 个空行） |
| 文件尾单个换行 | 111 文件 |
| 文件首无空行 | 10 文件 |
| 代码块必须标语言 | 139 文件 |
| 中文正文用全角标点 | `arch/csa/lec8.md` 通篇半角逗号 |

已经做对的样板：`arch/csa/lec7.md`、`arch/cca/lec12.md`、`opensource/postgresql/mvcc-06-*.md`、`computer_sys/network/Networking-for-Distributed-Systems.md` —— 违规 0 处。惯例是存在的，只是没推广。

### 6.3 图片

```markdown
❌ ![image-20250526182733749](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/...)
✅ ![三级页表把 39 位虚拟地址拆成 9+9+9+12](https://.../pagetable-3level.png)
```

alt 要写**这张图在说明什么**，不是文件名。当前 1475 处图片引用里，1460 处 alt 无信息（时间戳文件名、`![]`、`![img]`）。

`cleanForEmbedding()` 会整行丢掉图片，所以**图里的信息必须在正文里也说一遍**。一节内容如果只有图没有文字，在检索库里等于空白。

> ⚠️ 1466/1475 张图外链同一个腾讯云 CDN，本地图片 0 张。CDN 一挂全库图失效。这是已知风险，本轮不处理。

### 6.4 代码

- 必须标语言。
- **代码占比不超过章节的 60%。** 每个代码块前要有一句散文说明"这段在做什么"。
- 当前 325 个章节代码占比 > 60%，极端的如 `tcs/introduction_to_algorithms/lec6.md` 的 `## 代码实现`，200 行纯 Python，一句解释没有。这种 chunk 嵌入后语义信号被代码 token 淹没，中文提问基本召回不到。
- 注解写在代码块**外面**，不要塞进 ```c 里（`computer_sys/storage/lec5.md` 就这么干的，既破坏高亮也破坏检索）。

---

## 七、四类正文骨架

共用元数据和排版规则全站统一，正文结构按 `kind` 分四套。

### 7.1 `theory` —— 理论型

密码学、算法、离散数学、TCS。

```markdown
## 0. 问题          ← 先把要解决的问题讲清楚，含形式化定义
## 1. 构造 / 方案    ← 怎么做的
## 2. 关键性质      ← 为什么它对，安全性/复杂度
## 3. 工程视角      ← 真实系统里怎么用，有什么坑
## 我的理解
## 本讲小结：<主题词>
```

**样板：`docs/zh/security/apply_cryptography/lec12.md`**

「工程视角」这一节目前只有 8 个文件在用，但它是这套骨架里最值钱的一节 —— 把理论和实践显式分开，读者和检索都受益。

### 7.2 `system` —— 系统型

OS、数据库、分布式、存储、体系结构。

```markdown
## 本讲定位        ← 承上启下，给出真实动机
## 1. 机制         ← 这个东西是什么、解决什么
## 2. 实现走读     ← 源码/伪码，配散文引导
## 3. 权衡与代价   ← 为什么不用另一种方案
## 我的理解
## 本讲小结：<主题词>
```

**样板：`docs/zh/computer_sys/os/lec5.md`**

开篇的「本讲定位」是这篇的精华：

> shell 有 bug 会写随机地址 👉 如何防止破坏内核？

一句话把整讲的动机立住了。这比"本讲介绍虚拟内存"强一个数量级。

这篇也是超长章节的反面教材 —— `## 3. vm.c：页表的建立、查询、增删` 有 9423 字符，必须拆 H3。

### 7.3 `source` —— 源码 / 文章研读型

PostgreSQL 系列及后续的开源项目研读。

```markdown
> 原文：<URL>（作者 X）

## 引言           ← 显式承接上一篇 + 预告本篇
## <主体，递进小节>
## 代价 / 关键因素
## 我的理解
## 小结：<主题词>
```

**样板：`docs/zh/opensource/postgresql/queries-04-index-scan.md`**

`opensource/postgresql` 是全库最一致的一组（34 篇里 33 篇同模板），零图片、零裸代码块、零空行堆积。它做对的最关键一件事是**显式的跨篇回指**：

> 延续第 2 篇讲到的统计量：`correlation` 描述列的逻辑值顺序和物理存储顺序的吻合程度……

这种回指对 RAG 的跨文档串联价值极高 —— 检索到这一段时，模型能自己顺藤摸瓜。`language/dynamic_language/lec12.md` 的「回顾 L8/L10 的语义」是同样的做法。**所有 kind 都应该学这一点。**

### 7.4 `design` —— 设计型

designftw、软件设计。

```markdown
## 场景          ← 什么情况下会遇到这个问题
## 原则          ← 抽象出的设计原则
## 案例          ← 正面例子
## 反例与坑      ← 负面例子，这一节往往比正面更有价值
## 我的理解
## 本讲小结：<主题词>
```

`sw_eng/designftw/` 目前没有合格样本（25 篇里 19 篇含图、23 篇有连续空行、只有 1 篇有小结），需要新建一篇标杆。

---

## 八、为什么这些规则对 RAG 重要

规范里每一条硬性规则，都对应 `rag/` 管线里一个具体的失效点。这一节是给未来的自己看的 —— 免得哪天觉得"这条太啰嗦"就删了。

| 规范条款 | 对应管线代码 | 不遵守的后果 |
|---|---|---|
| 章节 300–1200 字符 | `chunk.ts` 的 `TARGET=700` / `MAX=1300` / `MIN=120` | 超长节被 `splitLongParagraph` 按句号硬切；过短节被整个丢弃 |
| 标题必须带主题词 | `chunk.ts` 的 `embedText()` 拼「课程·文档·章节」上下文头 | 52 个 `## 小结` 的 chunk 在向量空间不可分，检索出来的引用链接指向随机一篇 |
| 禁止空章节 | `chunkDocument()` 按标题切 section | 产生纯标题的空 chunk（当前 103 个），污染召回结果 |
| frontmatter `status` | `corpus.ts` 现在用 `body.trim().length < 200` 过滤 | 占位页进库、短而完整的笔记被误伤 |
| frontmatter `kind` / `tags` | `db.ts` 的 `searchChunks()` 目前只能按 `lang` 过滤 | 无法做课程级/类型级过滤，也无法给学习路径生成器提供结构 |
| 用容器不用裸 HTML | `cleanForEmbedding()` 把标签剥成空格 | 定义/定理/例题的类型信息在嵌入前就没了 |
| `::: insight` 必填 | `retrieve.ts` 可对 insight 块加权，`answer.ts` 可标注"这是作者观点" | 没有个人判断可引用，问答退化成讲义摘要机 |
| 图里的信息正文也要说 | `cleanForEmbedding()` 整行丢弃图片 | 只有图的章节在检索库里是空白 |
| 代码占比 ≤ 60% | 代码 token 主导嵌入向量 | 中文提问召回不到（`introduction_to_algorithms/lec6.md` 就是这样） |
| 术语单一形态 | 向量相似度 | 同一概念的 chunk 向量分散，召回率下降 |
| 跨篇显式回指 | `answer.ts` 提示要求"主动指出跨课程联系" | 模型没有线索可循，串联不起来 |

---

## 附：工具

```bash
# 新建一篇笔记（按 kind 自动套骨架，frontmatter 从课程目录推导）
npm run notes:new -- --course os --lecture 21 --title "网络栈" --en "Network Stack"
npm run notes:new -- --course postgresql --slug queries-05-nested-loop --title "嵌套循环连接"

# 检查
npm run notes:lint                                    # 全库
npm run notes:lint -- docs/zh/computer_sys/os/lec21.md  # 单篇
npm run notes:lint -- --summary                       # 只看规则命中统计
npm run notes:lint -- --level=error                   # 只看 error

# 自动修机械问题（空行、代码块语言、中英空格、HTML 容器、frontmatter…）
npm run notes:fix -- --dry --verbose                  # 先看要改什么
npm run notes:fix                                     # 实修
npm run notes:fix -- --only=blank,fence               # 只跑指定阶段
```

`notes:fix` 只改能确定性判断的东西，内容补写永远是人的事。它明确**不碰**的：空章节、超长章节、图片 alt、代码占比、`我的理解`——这些只由 lint 报出来。

CI（`.github/workflows/deploy.yml`）在构建前跑 `notes:lint --max-errors=<基线>`。基线是当前的存量 error 数，只能降不能升：保证新写的笔记不再引入同类问题，存量慢慢还。**修完一批记得把 workflow 里的数字调低**，否则门槛会随着修复而失效。

术语表在 `docs/.vocab.json`。往里加词请按「这个词在库里真的被混用过」，不要凭空堆词表。
