---
title: 概念设计 · 软件设计
type: lecture
lecture: 2
tags: [startup, software-design, prd, concept-design]
status: complete
source: 'https://61040-fa25.github.io/assets/lecture-notes/L02-introducing-concepts.pdf'
---
# Lec 2 概念设计

官方课件：[Introduction to Concept Design](https://61040-fa25.github.io/assets/lecture-notes/L02-introducing-concepts.pdf)。

本节 Lec 的目标：

- 掌握概念（*Concepts*）的含义？ 是什么？有什么用？
- 掌握概念的核心四要素：： 目的、运作原理、状态与操作
- 多个概念如何组合在一起：尤其是如何通过 sync
- 认识到细微的概念：设计会如何影响创新 理解“杀手级概念”（*Killer Concepts*）如何驱动产品成功

## TL;DR

- Concept 对用户是一套可理解的行为协议，对软件则是可独立设计、实现与复用的功能单元。
- Concept 由 name、purpose、principle、state 和 actions 描述；设计时应先说明它为何存在、如何兑现价值，再决定数据和接口。
- 不同 Concepts 不直接引用或读写彼此状态，而由 Sync 观察动作、查询信息并触发后续动作，从而保留解耦与复用性。
- Killer Concept 往往不是新技术，而是以更低摩擦的行为模型重新组合熟悉能力，例如 Zoom 的 MeetingLink。

## 设计的语言

> "当你去设计一栋房子时，你先找建筑师，而不是工程师。为什么？因为评判一栋好建筑的标准超出了工程学的范畴。同样，在计算机程序中，各组件的选择必须由使用条件驱动。这件事由谁来做？由软件设计师。"
> — Mitchell Kapor，《软件设计宣言》，1996

**产品铁三角 (The Product Triad)**：软件设计者是由产品经理（PM）、UX 设计师、软件工程师共同构成的角色，共同决定产品的核心逻辑。

![产品经理、UX 设计师与软件工程师组成的产品铁三角](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603114320451.png)

>

设计师需要什么？

|          | 模块化                                     | 模式                                        | 设计原则                                       |
| -------- | ------------------------------------------ | ------------------------------------------- | ---------------------------------------------- |
| 对于工程 | 闭包、抽象类型、类与对象、数据类型、微服务 | 哈希表、工厂模式、发布订阅，map/filter，C/S | 分层、解耦、不可变性、表示独立性、里氏替换原则 |
| 对于设计 | 概念、同步                                 | Upvoting、帖子、评论、书签                  | 完整性、分离性、具体性、通用性                 |

## 概念设计

Hacker News 很受欢迎：每天超过 1000 万次页面浏览量，所以显然，它是一个值得被构建的产品。所以它的 **创新在哪里**？ 看起来并没有什么特别“高科技”的东西：帖子、链接、评论、投票，这些东西早就存在。

![Hacker News 的帖子、评论与投票界面](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260729222525554.png)

教授这里引入了 Margaret Boden 的概念：组合式创造力（*Combinational Creativity*），把人们已经熟悉的元素，以新的方式组合起来。

创新并不一定意味着创造一个世界上从未出现过的东西。

熟悉的概念：**Post + Comment + Vote + User**，即“帖子 + 评论 + 投票 + 用户”，通过不同的定义和组合方式，也可以产生一个创新产品。

![用熟悉概念组合出新产品的概念设计示意](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260807194508249.png)

::: definition 概念
概念（*concept*）是一个连贯、可复用，并且能够被独立理解、设计、实现和解释的行为单元。
:::

一个 Concept 可以用五个部分定义：Concept、Purpose、Principle、State、Actions。其中前三项是 Concept Design 特别关注的设计层内容，后两项则属于传统计算机科学中熟悉的状态与操作。

以 Upvoting 为例：Concept 是用户对内容进行投票；Purpose 是根据受欢迎程度对内容排序；Principle 是通过累积用户的投票数量衡量内容的受欢迎程度；State 保存“哪个用户给哪个内容投过票”；Actions 则包括 upvote 和 unvote。

::: insight
可以简单记成： Concept：这是什么？   Purpose：为什么存在？   Principle：靠什么机制实现目的？   State：系统需要记住什么？   Actions：可以执行什么操作？ Concept Design 的关键在于，不要一开始就考虑数据库和 API，而是先明确“为什么需要这个概念，以及它为什么能工作”。
:::

### 概念命名

**名字非常非常重要**，他会成为设计模式中的简写；比如，”我们对评论进行 upvoting“
Concept 还可以通过**类型参数**实现复用。我们用 `Upvoting [User, Item]` 给概念命名，`User` 和 `Item` 是抽象的类型参数。Upvoting 本身并不关心 User 是普通用户、管理员还是学生，也不关心 Item 是帖子、评论还是商品；它只保存对这些对象的引用，并通过 actions 接收和返回它们。

::: insight
类型参数让 Concept 与具体业务对象解耦： `Upvoting [User, Item]` → 可以用于帖子、评论、回答等任何对象。 因此，一个设计良好的 Concept 应该像积木：自身定义清晰、对外部对象做尽可能少的假设，从而能够在不同场景中复用。
:::

### 目的

Purpose 回答的是“为什么”：为什么要使用这个 Concept？为什么要创造它？这往往是 Concept Design 中最难确定、但也最有价值的部分，因为它迫使设计者说明这个机制真正解决了什么问题。

同一个 Concept 对不同 Stakeholder 可能有不同 Purpose，但通常应该存在一个主要目的。例如 Upvoting：对用户而言，是让好的内容更容易被看到；对平台而言，则可能是利用群体判断进行内容排序和筛选，提高内容质量与参与度。

当一个 Concept 同时承担多个 Purpose 时，需要特别警惕冲突。例如平台为了增加参与度，希望 Upvoting 推荐“最吸引人”的内容；用户却希望它推荐“最有价值”的内容，两者未必一致。

::: insight
Purpose 不是“这个功能能做什么”，而是“为什么值得让这个 Concept 存在”。 多个 Stakeholder 可以有不同目的，但应找到 Primary Purpose；如果一个 Concept 被赋予多个目的，还要检查这些目的之间是否存在冲突。
:::

### 运作原理

运作原理 是指一个典型使用场景：用一个故事说明 Concept 在正常情况下如何运作。它应该描述最典型的情况，而不是边缘案例，并且最重要的是，要能说明 Purpose 是如何被实现的。

例如 Upvoting 的 Purpose 是“根据受欢迎程度对内容排序”，好的 Principle 是：经过一系列用户投票后，获得更多票的内容可以被排在更前面。

反例是： “一个 Item 被 upvote 后，它的票数 +1。”

问题在于这只是描述了 Action 如何改变 State，即“系统怎么执行”，却没有解释这种机制为什么能够实现“按受欢迎程度排序”的 Purpose。

::: insight
好的 Operational Principle 应形成完整因果链： 用户行为 → 状态变化 → 累积产生某种结果 → Purpose 得以实现。 因此 Principle 不是 API 或状态更新规则，而是 Concept 为什么有效的典型故事。
:::

### 动作

动作（*Actions*） 描述用户做出的行为，也可以包括系统主动产生的响应，例如通知用户。它应该与具体 UI 无关，因此写的是 `upvote(item)`，而不是“点击点赞按钮”；UI 中多个细碎步骤通常可以抽象成一个 Action。

Action 也不是“请求”。如果一次 upvote 因为权限或状态不满足而无法成立，那么这个 Action 就没有发生，而不是发生了一个“失败的 upvote”。实现上，Actions 通常对应函数，与 State 一起构成 Concept 对外提供的 API。

以 Upvoting 为例，除了 `upvote` 和 `unvote`，还可能有 `downvote`、`removeDownvote`、`notify` 等，但是否加入取决于这个 Concept 的 Purpose，而不是为了功能丰富而增加。

::: insight
Action 描述“发生了什么”，而不是“用户如何操作界面”。
 `点击 ▲ 按钮` ❌
 `尝试点赞但失败` ❌
 `upvote(user: User, item: Item)` ✓
`pvote(user: User, item: Item)` ✓
Actions 应保持在 Concept 层，而不是 UI 层或具体实现层。
:::

### 状态

**State 是 Concept 为了持续运作而需要记住的信息**。它主要用于判断某个 Action 是否允许发生、生成 Action 的输出，以及让用户看到 Action 带来的结果。例如 Upvoting 需要保存哪些用户给哪些内容投过票，才能判断用户是否可以再次 upvote、是否可以 unvote，以及计算内容获得的票数。

State 是抽象的，不需要为“查看票数”“查看我是否点赞”等每种查询单独定义 Action；通常直接假设 State 是可见。

![what the state looks like: representation independence](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260828164808782.png)

为什么不能只保存每个 Item 的总票数，而要保存 voter 的身份？因为仅有 `count = 10` 无法知道谁投过票，也就无法阻止同一个用户重复投票或支持准确的 `unvote`。

::: insight
State 不是“需要展示什么数据”，而是“为了让 Concept 的行为规则成立，系统必须记住什么”。 Upvoting 保存 voter identity，是因为它的行为不仅取决于“有多少票”，还取决于“谁已经投过票”。
:::

### 设计的载体

这页的核心意思是：Concept 不只是一个功能定义，它还可以承载过去设计者积累下来的整套设计知识。以 Upvoting 为例，当我们说“使用 Upvoting”时，背后其实已经包含了大量经验：

- Typical uses：常用于社交媒体帖子、文章评论、问答回复。
- Design variants：可以加入 downvote、时间衰减、不同投票权重、身份限制、冻结旧内容等不同设计变体。
- Related concepts：与 Rating、Recommending、Reacting 等 Concept 相似，可以比较和替换。
- Often used with：经常与 Karma、Authentication 等其他 Concept 配合。
- Known issues：已有大量已知问题，例如高票旧内容长期占据顶部、早期投票产生滚雪球效应、形成 echo chamber，以及重复投票问题。

::: insight
Concept 可以理解成一种“可复用的设计知识包”。 当设计师选择 Upvoting 时，不应该只想到“加一个点赞按钮”，而是可以继承几十年来其他产品使用 Upvoting 所积累的经验：它适合什么场景、有哪些变体、通常和什么搭配，以及可能产生什么副作用。 因此，使用熟悉的 Concept 的价值不仅是节省开发成本，更重要的是可以复用已有的设计知识，而不必每次从零重新发现这些问题。
:::

## 同步：组合概念

看一下这个例子，系统现在有三个彼此独立的 Concept：

- Upvoting：负责投票，目的是按受欢迎程度排序。
- Posting：负责创建、编辑和删除帖子。
- Karma：负责记录用户声望，并据此给予优秀用户特权。

假设 Hacker News 想实现一个规则：用户自己的帖子获得 upvote 后，作者获得 10 Karma。

一种做法是直接修改 Upvoting，让它知道“Post 有作者”“作者有 Karma”。但这样很糟糕，因为 Upvoting 从一个通用 Concept 变成了 Hacker News 专用的 Concept：以后想拿它给商品、评论或图片投票，都得带着这些无关逻辑。

更好的方式是保持三个 Concept 不变，在外部定义一个 Sync：

> when `Upvoting.upvote(post)`
> where `Posting` 告诉我们 post 的作者是 user
> then `Karma.reward(user, 10)`

即：

```text
Upvoting.upvote` → 找到 `Posting.author` → `Karma.reward
```

::: insight
Sync 的价值是把“应用特有的规则”放在 Concepts 之间，而不是塞进 Concept 内部。 Concept 负责通用行为，Sync 负责产品特有的组合逻辑。 因此 Upvoting 不需要知道 Posting 和 Karma 的存在，三个 Concept 仍然可以独立设计、实现和复用；但组合起来后，却能产生 Hacker News 特有的行为。
:::

![第一个同步](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829030052675.png)

![第二个同步](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829030141533.png)

**Sync 参数绑定：为何奖励作者而非投票者**

第一个同步为什么不用 `vpvote(user, post)`？

sol: 因为第一个 Sync 响应的是已经成功发生的 `Upvoting.upvote` Action，而不是用户发出的请求。

如果写成：

> when `Upvoting.upvote(user, post)`

这里的 `user` 按 Upvoting 的定义表示的是 voter，也就是投票的人。

但这个 Sync 的目的不是奖励 voter，而是奖励帖子作者。因此必须通过 Posting 的 State 找到：

> ```
> post → author
> ```

然后执行：

> ```
> Karma.reward(author, 10)
> ```

**Sync 在行为轨迹中的执行**

把 Sync 放在时间轴上，可以观察多个 Concept 如何协作，同时保持彼此独立。

![synchronization viewed over scenarios (traces)](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829031045186.png)

假设 Alice 创建帖子 `p1`，Bob 创建 `p2`。之后发生：

1. Bob upvote `p1` → Sync 查询 Posting，知道 `p1` 作者是 Alice → Karma 给 Alice +10。
2. Carol 再 upvote `p1` → Alice 再获得 +10 → Alice 现在有 20 Karma。
3. Alice 请求 downvote `p2` → Sync 检查 Karma，发现 Alice ≥ 20 → 才触发真正的 `Upvoting.downvote(Alice, p2)`。

因此完整 Trace 是：

```text
Posting.create(Alice) → p1`
`Bob upvote p1 → Alice +10 Karma`
`Carol upvote p1 → Alice +10 Karma`
`Alice 请求 downvote p2 → 检查 Karma ≥ 20 → downvote 成功
```

图中特别强调虚线不是普通的函数调用。Upvoting 不会直接调用 Karma，Karma 也不知道 Posting；这些联系全部由外部 Sync 定义。因此每个 Concept 内部仍然执行一个对自己而言完全合理的独立场景。

::: insight
Synchronization 可以理解成“跨 Concept 的协调规则”。 每个 Concept 只负责自己的行为和状态，Sync 观察一个 Concept 发生的 Action，再根据其他 Concept 的 State，决定是否触发另一个 Concept 的 Action。 这样既能组合出复杂的产品行为，又不会让 Concepts 相互依赖。
:::

## 有影响力的案例

目的地调度、分布式命名和会议链接展示了细微行为模型如何成为可迁移的设计创新。

### 目的地调度电梯

传统电梯：在每层按"上"或"下"，进电梯后再按目标层。目的地调度颠覆了这一模式。

Leo Port 于 1961 年申请专利，1977 年让其过期；Schindler 1992 年首次商业实现（Miconic 10），2009 年推出 PORT 系统。概念改变了人们使用电梯的行为模式。

![destination dispatch elevator](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829031334611.png)

#### 目的地调度如何解耦其他概念

![目的地调度电梯的概念状态与动作](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829032100936.png)

一个 Concept 应只负责自己的核心 Purpose，不应把所有相关需求都塞进同一个 Concept。以 DestinationDispatch 为例，它的核心目的只是提高电梯调度效率；实际产品 Schindler PORT 还包含身份识别、个性化服务和楼层权限等能力，但这些应该拆成独立 Concepts，再通过 Sync 与 DestinationDispatch 组合。

例如：

- AccessControl：决定用户被允许前往哪些楼层。
- Authentication：通过门禁卡或手机识别用户身份。
- Personalization：记录 VIP、行动不便者等个性化乘梯需求。
- DestinationDispatch：根据目的楼层分组乘客并分配电梯。

::: insight
不要因为几个行为出现在同一个产品或用户流程中，就把它们设计成同一个 Concept。 Concept 应保持单一、通用和独立；应用特有的复杂行为通过多个 Concepts + Syncs 组合实现。这样每个 Concept 都能独立设计、实现和复用。
:::

> Concept：DestinationDispatch（目的楼层调度）
>
> Purpose：提高电梯调度效率。
>
> Principle：你先请求要前往的楼层，系统为你分配一部电梯；你等待指定的电梯并在它到达后进入；随后电梯离开，并最终抵达你请求的楼层。
>
> Actions：
>
> - `request(on, to: Floor): (assigned: Elevator)`：在当前楼层请求前往目标楼层，系统返回分配的电梯。
> - `arrive(e: Elevator, at: Floor)`：系统事件，电梯到达某楼层。
> - `leave(e: Elevator, at: Floor)`：系统事件，电梯离开某楼层。

### Web 的分布式命名概念

以前的痛点：在互联网刚诞生时，如果你想去别人的服务器拿一个文件，极其痛苦。你要先用 FTP 软件建立连接、输入账号密码、一行行敲命令进入文件夹、下载文件、最后关闭连接。这中间只要一步断了，就要全部重来。

蒂姆·伯纳斯-李的杀手概念：URL (统一资源定位符)

- 他把过去那些繁琐的连接、登录、找路径的所有状态全部丢掉，发明了 URL（就是我们现在的网址）
- 它的行为变成了极致的简单：不管文件在哪，只要给你一个网址，你通过一行命令 `get(网址)`，直接就能把文件拿过来。它把多步的操作，变成了单次、全球唯一的原子行为，彻底引爆了互联网

DistributedNaming 是一个为资源提供稳定、全局命名的 Concept。其核心机制是：资源被发布到某个 Domain 下并赋予 Name 后，通过相同的 Domain + Name 就可以再次获取该资源。

- Purpose：为资源提供稳定、全局的命名与访问方式。
- Principle：在某个 Domain 下以特定 Name 发布资源，此后使用相同的 Domain 和 Name 即可获取该资源。
- State：保存 Domains；每个 Domain 包含一组 NamedResources，每个 NamedResource 关联一个 Name 和 Resource。
- Actions：`publish(domain, name, resource)` 发布资源；`unpublish(...)` 取消发布；`get(domain, name)` 获取资源。

例如：

```text
publish(essenceofsoftware.com, post/ai-coding, blog post)
```

这里将一篇博客文章发布到特定域名和路径下，之后便可以通过这组名称稳定定位它。

### Zoom 的 MeetingLink 概念

视频通话技术不是新的（Skype 2003、FaceTime 2010、Picturephone 1964……），Zoom 的真正创新是 **MeetingLink** 概念——消除了"建立通话组"的摩擦。

**以前的痛点**：当年用 Skype 或苹果的 FaceTime 开会，摩擦力极大。发起人必须先搜索对方的账号、互相加为好友、然后拨号呼叫、对方疯狂震铃、点击接听。如果要拉 10 个人，发起人得把这 10 个人全加一遍好友，然后一个一个呼叫，只要有一个人没接听，会议就开不起来。

袁征（Zoom 创始人）的杀手概念：MeetingLink

它的逻辑是：会议是一个独立的“房间”。发起人只要生成一个链接发出去，任何参会者不需要注册账号、不需要加好友、不需要等人呼叫，在任何时间点击这个链接，就能独立且异步地加入进来。这一微小的概念改变，彻底抹平了远程开会的巨大摩擦，让 Zoom 在疫情期间迅速成为全球霸主。

三个开放设计问题：

① invariant 是什么（host 是否一定在活跃用户中）？

② 会议能否重启？

③ User 类型参数绑定到什么？

竞争对手后来纷纷跟进（Skype 2020 年 4 月、Teams 2022 年 6 月才加入会议链接概念），说明这个概念创新的真实价值。

![Zoom MeetingLink 降低参会摩擦的行为模型](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829032901739.png)
