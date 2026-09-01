---
title: 模块化设计 II · 软件设计
type: lecture
lecture: 5
tags: [software-design, prd, concept-design, data-model]
status: complete
source: 'https://61040-fa25.github.io/assets/lecture-notes/modularity-case-studies.pdf'
---
# Lec 5 模块化设计 II：案例与组合

- 通过 Zoom 和 Spotify 的案例，**加深对模块化重要性的理解**
- **理解 概念模块化 对代码的影响**，理解 concept 的功能如何“横切”（cross-cut）传统的代码组织结构
- **识别概念设计中的协同效应** 当两个 concept 组合时，可以产生大于各自价值简单相加的效果

## TL;DR

- 分析异常行为时，应沿“观察不一致 → 推断隐藏 Concept → 明确 purpose/state/actions → 拆分职责 → 用 Sync 重组”的路径定位问题。
- Zoom 说明 Counting、Expiration、Cancellation 等关注点可以横切传统对象分类，不能因为共享同一组按钮就塞进一个 Reaction 概念。
- Spotify 的 Folder、Library/Playlist 与 Queue 案例分别揭示抽象不匹配、职责混合和心理模型失效；熟悉名称必须对应可预测行为。
- 清晰的 purpose、独立的 Concepts 与显式 Synchronization 能同时提升通用性、熟悉性、模块化和可预测性。

## 回顾模块化的标准

| 标准 | 好的表现 | 失败信号 |
| --- | --- | --- |
| 分离 separation | 一个概念只服务一个关注点 | 不相关功能被绑成一个动作或设置 |
| 完整 completeness | 同一关注点的状态、动作与规则在同一概念内 | 完成一个简单任务必须到多处“拼”操作 |
| 独立 independence | 概念可理解、测试、演进而不要求另一个概念存在 | 模块 A 无法在不调用/窥探 B 的情况下工作 |

三者会互相拉扯：不要为了“拆得细”而把一个完整行为切碎；也不要为了“方便调用”把独立概念硬塞在一起。

![模块化设计的分离、完整与独立三项标准](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260830025503607.png)

## 案例：Zoom 的即时表达

![Zoom 会议中的举手、表情与主持人控制](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260830025540289.png)

“举手”、表情反应、会议主持人的队列管理看似都是按钮，却至少包含两种关注点：**参与者表达一个短暂信号**，以及 **主持人管理需要回应的人**。如果把它们混成即时表达（*Reaction*），就容易产生异常行为：互动的寿命、是否可撤回、主持人是否需要处理、后来加入者是否看得到，都没有清晰归属。

| 反应类型                   | 自动消失 | 计数  | 主持人可取消 |
| -------------------------- | -------- | ----- | ------------ |
| Emoji 表情                 | ✓        | （✓） | —            |
| Yes / No 是/否             | —        | ✓     | ✓            |
| Slow / Speed 慢一点/快一点 | —        | ✓     | ✓            |
| Away 暂时离开              | —        | （✓） | （✓）        |
| Hand 举手                  | —        | （✓） | ✓            |

其中：

- **✓** = 是
- **（✓）** = 是，但设计上**可能不应该如此**
- **—** = 否

**Reaction Types 的互斥关系**

| Reaction 类型      | Emoji 表情 | Yes / No 是/否 | Slow / Speed 慢/快 | Away 离开 | Hand 举手 |
| ------------------ | ---------- | -------------- | ------------------ | --------- | --------- |
| Emoji 表情         | ✓          | —              | —                  | —         | —         |
| Yes / No 是/否     | —          | ✓              | （✓）              | （✓）     | （✓）     |
| Slow / Speed 慢/快 | —          | （✓）          | ✓                  | （✓）     | （✓）     |
| Away 离开          | —          | （✓）          | （✓）              | ✓         | （✓）     |
| Hand 举手          | —          | （✓）          | （✓）              | （✓）     | ✓         |

其中：

- **✓** = 可以同时存在
- **（✓）** = Zoom 目前允许同时存在，**但作者认为可能不应该允许**
- **—** = 不适用 / 不同时存在

![splitting into coherent concepts](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260830030810305.png)

![splitting into coherent concepts menue](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260830030846843.png)

::: insight
Zoom 案例说明 concept modularity 可以横切传统的对象/类型划分：Counting、Expiration、Cancellation、Disjointness 等功能跨越多个 Reaction Types，因此应被视为独立 concerns，而不是重复嵌入各个 Reaction Type。
:::

## 案例：Spotify

Spotify 的 Folder、Library、Playlist 与 Queue 说明，界面中熟悉的名称如果对应了混杂职责，用户仍然无法形成稳定的心理模型。

### Spotify 暴露出的核心问题

![playing with spotify folders](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260831001904400.png)

Spotify 中一些功能之所以让人感到困惑，并不只是 UI 或命名问题，而是因为：

> **UI 呈现的熟悉 Concept，与系统真正实现的 Concept 不一致。**

典型表现：

- Folder 看起来像通用文件夹，实际更接近 `PlaylistFolder / PlaylistTree`
- Queue 看起来像传统 FIFO 队列，实际混合了手动队列、当前播放上下文和推荐流
- Library、Playlist 之间的关系不清楚时，一个操作可能产生用户没有预期的副作用

最终形成：

> **概念边界模糊 → 职责混合 → 隐藏副作用 → 行为不一致 → 用户无法形成稳定心理模型 → 非预期行为**

------

### Folder：UI 概念 ≠ 实际概念

Spotify Folder 的行为：

| 放入 Folder 的内容             | 结果                        |
| ------------------------------ | --------------------------- |
| Playlist                       | ✓ 直接放入                  |
| Album / Song                   | ⚠️ 自动创建 Playlist，再放入 |
| Podcast / Artist / Liked Songs | ✗ 不支持                    |

这带来一个问题：Folder 到底是通用内容容器，还是 Playlist 专用容器？

如果它是普通 `Folder<Item>`，Album、Song、Podcast 等理论上都应该可以直接加入。

如果它实际上是 `PlaylistFolder`，那么用户把 Album / Song 拖进去时，系统偷偷创建 Playlist，又引入了用户没有表达过的意图。

#### 概念设计问题

UI 使用了用户熟悉的：**Folder**

用户自然套用文件系统心智模型：

> Folder = 可以容纳各种 Item 的容器。

但实际功能更接近：

**PlaylistTree**

> Folder = 组织 Playlist 的层级结构。

因此，这不仅是命名问题，而是**用户理解的 Concept 与实际 Concept 不匹配**。

#### 泛化

一种更通用的抽象是：

```text
Folder[Item]
```

这样同一个 concept 可以支持：

`Folder<Song>`、`Folder<Album>`、`Folder<Playlist>`、`Folder<Podcast>`。

相比 `PlaylistFolder`，它具有更好的：

**flexibility · reuse · independence · predictability**

但 Genericity 并不是越高越好。

如果真正的 Purpose 是：

> organize playlists for playback

那么 `PlaylistFolder` 完全可能是合理设计。

**关键不是“越通用越好”，而是 Concept 的抽象层级必须与 Purpose 一致。**

### Playlist 与 Library：相似数据，不同 Purpose

二者都引用 Song，但一个用于组织播放顺序，另一个用于保存内容；相似数据结构不能代替 purpose 的区分。

#### Playlist

```text
concept Playlist [User, Song]
Purpose：organize songs into listening lists
state
  User → set<Playlist>
  Playlist → seq<Song>

actions
  add(p, song)
  remove(p, song)
```

Playlist 的核心是：**组织歌曲形成播放列表。**

![Playlist 与 Library 的状态和动作对比](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260831002100283.png)

#### Library

```text
concept Library [User, Song, Album]
Purpose: save songs & albums for easy access
state
  User → set<Song>
  User → set<Album>
  Album → set<Song>

actions
  save(user, song/album)
  discard(user, song/album)
```

Library 的核心是：**保存内容，方便以后访问。**

虽然两者都涉及 Song，但 Purpose 完全不同，因此应该是两个独立 Concepts。

#### 为什么分开很重要？

假设 `Song X` 同时存在于：

```text
Library + Playlist A + Playlist B
```

执行：

```text
Library.discard(Song X)
```

是否应该同时导致：

`Playlist.remove(Song X)`？

**不应该由 Library 或 Playlist 内部偷偷决定。**

如果产品确实需要这种联动，应通过 **Synchronization** 明确规定。

因此：

> **Concept 管自己的 State / Actions；跨 Concept 行为由 Synchronization 连接。**

这样可以避免一个 Concept 暗中修改另一个 Concept 的状态。

------

### Queue：熟悉名称掩盖了多个 Concepts

传统 Queue 的心理模型很简单：

> **FIFO — First In, First Out**

例如：

```text
enqueue A → enqueue B → enqueue C
```

用户自然预期：

```text
A → B → C
```

但 Spotify 的 Queue 页面实际上同时出现：

- Now Playing
- Next in Queue
- Next From: Album / Playlist / Context

也就是说，Spotify 所谓的“Queue”实际上混合了至少三种不同职责。

#### 更清晰的 Concept 分解

把手动排队、上下文供给和当前播放状态拆开后，每个 Concept 都能拥有单一 purpose 与可预测动作。

##### Queue

![Spotify Queue 手动歌曲顺序的状态模型](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260831002134337.png)

负责用户明确要求“接下来播放什么”。

```text
state
  User → seq<Song>
Purpose: let users manually select song order
actions
  enqueue(user, song)
  dequeue(user)
  clear(user)
```

##### Feed

负责从当前上下文持续提供歌曲，例如：

Album、Playlist、Autoplay、Radio、Recommendation。

```text
state
  User → seq<Song>
Purpose: provide a continuing stream of songs
actions
  populate(...)
  dequeue(user)
```

##### PlayingSong

```text
state
  User → optional Song
Purpose： play songs
actions
  set(user, song)
  start(user)
  ends(user)
```

### 三个概念通过同步协作

当当前歌曲结束：

**① Queue 不为空**

```text
PlayingSong.ends → 取 Queue 第一首 → PlayingSong.set → Queue.dequeue
```

即：

> **用户手动选择的 Queue 优先。**

**② Queue 为空**

```text
PlayingSong.ends → 取 Feed 第一首 → PlayingSong.set → Feed.dequeue
```

即：

> 没有手动排队内容时，再从当前播放上下文继续提供歌曲。

因此可以理解成：

```text
Manual Queue ──┐
               ├─→ PlayingSong
Context Feed ──┘
```

优先级：

**Manual Queue → Contextual Feed → Autoplay / Recommendation**

这比把所有机制都塞进一个 `Queue` Concept 更清晰。

------

### Spotify Queue 为何显得无法预测？

问题来自**用户心理模型与系统模型不一致**。

用户看到：

> Queue

自然理解成：

> FIFO

但实际系统同时包含：

> Manual Queue + Context Feed + Autoplay / Recommendation

于是产生各种疑问：

- Add to Queue 的歌什么时候播放？
- 点击另一首歌后 Queue 会发生什么？
- 换一个 Album 后原来的下一首去哪了？
- Autoplay 什么时候接管？
- 为什么同时存在 `Next in Queue` 和 `Next from ...`？

因此：**不是某个按钮设计得不好，而是一个 familiar concept「Queue」承担了多个不同 mechanisms。**

### Spotify 案例体现的 Modularity

Spotify 中可以识别出多个相对独立的 Concepts：

| Concept         | Purpose                |
| --------------- | ---------------------- |
| **Library**     | 保存内容方便访问       |
| **Playlist**    | 组织歌曲               |
| **Folder**      | 组织内容/Playlist      |
| **Queue**       | 用户指定接下来播放什么 |
| **Feed**        | 持续提供上下文歌曲     |
| **PlayingSong** | 控制当前歌曲播放       |

好的 Concept 应该：

> **Purpose 明确 → State 自洽 → Actions 围绕 Purpose**

Concept 之间需要合作时：

> **通过 Synchronization 显式连接。**

而不是：

```text
Folder → secretly creates Playlist`
`Library → secretly modifies Playlist`
`Queue → secretly handles autoplay
```

否则 Concept 就开始相互侵入，模块化逐渐消失。

------

### Synergy：为什么拆开反而更强？

这里还有一个很重要的点：**模块化不是单纯把东西拆碎。**

独立 Concept 组合之后，可以产生单个 Concept 没有的能力：

```text
Queue + Feed + PlayingSong
```

组合后形成：

> **既尊重用户手动选择，又能持续自动播放的完整体验。**

这就是 **Synergy（协同价值）**：

> 两个或多个 Concept 组合后的价值，大于各自价值的简单相加。

因此优秀的 Concept Design 不是追求：

> 每个 Concept 孤立存在。

而是：

> **Concept 内部独立，Concept 之间通过清晰的 Synchronization 产生组合能力。**

### 最终设计原则

Spotify 案例最终可以归纳成四个目标：

- **Genericity**：Concept 尽可能建立在真正需要的抽象之上，而不是绑定不必要的具体类型。

- **Familiarity**：Concept 应尽量符合用户已有的心理模型；如果叫 `Queue`，行为最好符合用户对 Queue 的理解。

- **Modularity**：不同 Purpose 应属于不同 Concept，避免职责互相侵入。

- **Predictability**：用户理解 Concept 后，应能够推断系统下一步会发生什么。

四者最终共同服务于：  **让用户通过理解 Concept，而不是记忆大量特殊规则，来预测产品行为。**

## 配套工作

- **Recitation 3 — Modularity Examples**：用案例练习上述三条标准；官方课件：[Rec 3](https://61040-fa25.github.io/assets/recitation_notes/61040-Rec3-Slides.pdf)。
- **Pset 2 — Modular Design**（9 月 21 日截止）：将概念设计按模块化标准改进；[作业页](https://61040-fa25.github.io/assignments/problem-set-2)。
