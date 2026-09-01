---
title: 模块化设计 I · 软件设计
type: lecture
lecture: 4
tags: [software-design, prd, concept-design, data-model]
status: complete
source: 'https://61040-fa25.github.io/assets/lecture-notes/L04-modularity-1.pdf'
---
# Lec 4 模块化设计 I

官方课件：[Modularity in Design, Part 1](https://61040-fa25.github.io/assets/lecture-notes/L04-modularity-1.pdf)。

本节目标：

- **理解模块化的的价值** ： 用户会感到困惑，功能受限甚至失效，无法重用…
- **掌握关注点分离**  围绕关注点而非对象组织功能
- **识别糟糕的模块化** 通过 `UserAccount` 反例，学会判断一个概念是否"不增量、不可复用、不专注"
- **学习优秀的模块化案例**：了解对象的各个方面如何被拆分到不同的概念中。牢记专用性原则——一个目标对应一个概念

## TL;DR

- 好的模块化以 purpose 划分 Concept，而不是把与同一现实对象有关的字段和功能全部塞进一个模块。
- 分离、完整与独立共同约束拆分：既要避免一个 Concept 承担多个目的，也不能把一个完整行为碎片化到多处。
- 熟悉性要求名称与行为符合用户心理模型；可预测性要求用户理解 Concept 后能推断系统下一步会发生什么。
- 跨 Concept 的联动应通过显式 Sync 表达，使变化局部化，并让用户拥有更清晰的组合与配置边界。

## 好的设计就是先拆开再拼接

![decomposing into parts with purposes](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260807072052842.png)

这种"按目的拆分"正是软件模块化设计的核心思路：把系统拆成一个个"只干一件事"的概念。

## 模块化带来好处

- **增量性**（*incrementality*） 分工协作、稳步推进——不同的人可以同时开发不同模块

- **复用**（*reuse*）在同一产品内部、以及跨产品之间积累可复用的经验和代码
- 可用性（usability）：用户能识别出熟悉的部件，学习成本更低
- 专注（focus）：一次只关注一个部分，把改动局限在小范围内

### 增量性

### 复用性

一个完整的应用可能是独特的，但组成它的 Concepts 往往并不独特。例如：`HackerNews = Post + Comment + Upvote + Karma + ...`

没有其他应用与 Hacker News 完全相同，但 `Post`、`Comment`、`Upvote`、`Karma` 等 Concept 在很多其他产品中都存在。因此，设计 Concept 时应尽量利用已有的设计经验，使 Concept 能够在同一产品内部以及不同产品之间复用。

### 关注点分离

Dijkstra 提出的核心思想是：**一次只专注于问题的一个方面。** 分离关注点并不是忽略其他方面，而是在分析当前关注点时，暂时把其他无关部分隔离开。

应用到 Concept Design：将复杂应用拆成多个独立、单一职责的 Concepts，每次只设计一个 Concept，使修改能够被局部化。

例如设计 Hacker News 的 `Upvoting` 时，只考虑投票行为本身，而不同时考虑发帖、评论、Karma 等逻辑；它们之间的协作之后再通过 Sync 连接。

## 案例：`UserAccount`

设想一个典型的"用户账户"数据模型：

```text
concept UserAccount
purpose ????
state
a set of User with
  a username String
  a password String
  an email String
  a phone String
  a displayName String
  a profile Image
```

这是不是好的模块化设计？表面上看很"完整"——把用户相关的一切字段都塞进了一个概念里。但仔细审视会发现三个问题：

- 不增量（not incremental）：这类模块在实际项目中往往膨胀到超过一万行代码（>10kloc），在它彻底写完之前根本没法单独测试
- 不可复用（not reusable）：它变成了一个"什么都往里塞"的垃圾桶——所有跟用户沾边的功能都被塞进这里，随着项目推进，它会变得越来越与具体应用绑死，难以移植到别的项目
- 不专注（not focused）：`purpose` 那一栏是空的——因为它同时承担了认证、命名、通知、展示资料等好几种完全不同的目的。当用户想要"给消息用一个不同的邮箱"这种需求出现时，你会发现根本不知道该在哪里、以什么方式做这个改动

**按目的拆分 `UserAccount`**

把 `UserAccount` 按照它承担的不同目的拆开，就得到四个真正专注的概念：

```text
concept UserNaming
purpose  为用户指定助记名称
state    a set of User with a username String

concept PasswordAuth [User]
purpose  用密码认证用户
state    a set of User with a password String

concept Notification [User]
purpose  通知用户
state    a set of User with an email String, a phone String

concept Profile [User]
purpose  分享用户信息
state    a set of User with a displayName String, a profile Image
```

![UserAccount 按命名、认证、通知与资料拆分的概念图](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260830005451460.png)

```text
User
├── username: string
├── password: string
├── displayName: string
└── profileImage: Image
```

理想设计：一个 purpose 对应一个 concept，一个 concept 也只服务一个 purpose

```text
P1 ─ C1
P2 ─ C2
```

需要避免两种情况：

- **Redundancy（冗余）**：一个 purpose → 多个 concepts
- **Overloading（过载）**：多个 purposes → 一个 concept

::: insight
模块化不是把字段机械拆细，而是让每个 Concept 都能用一个明确 purpose 解释其存在，并让用户可以独立理解和组合这些能力。
:::

## 案例：Facebook 标签——耦合破坏隐私

Facebook 的照片标签功能：在照片里标记出某人是谁。表面上这只是一个简单的"标注"动作，但它背后牵扯到一个隐藏的模块化问题——标签这个动作，到底做了什么？

答案出人意料：当你被标记进一张照片，这张照片除了对原发布者选择的可见范围公开之外，还会自动对被标记者选择"添加"进来的好友可见——即使这些好友根本不在原始发布者设定的可见范围内！更麻烦的是，这条"是否要把我的好友也加进可见范围"的设置默认是"好友"，也就是说默认情况下，标签会把照片的可见范围"泄漏"给一群原发布者完全不认识、也无法控制的人。

这本质上是两个概念被隐式耦合在了一起：Tagging（标记）和某种访问控制/好友关系（Friending）。

### 修复：拆分为两个概念 + 显式 Sync

```text
concept Tagging [Image, User]
purpose   分享图片中出现了谁
principle 用户在图片中标记另一个用户后，
          浏览者可以看到该标签并识别出这个用户
actions   tag (by: User, i: Image, who: User): Tag

concept Friending [User, Item]
purpose   让用户限制自己物品的访问权限
principle 用户把另一个用户加为好友后，
          再发布一个物品，这个好友就能访问它
actions   addFriend(u, friend), publish(u, i),
          access(u, i) requires i 是 u 的好友发布的
```

一个"合理的 Sync"：`when Tagging.tag(by, image, who) then Friending.publish(by, tag)`——标记发生后，把这个标签当作一个"物品"发布给被标记者，让被标记者能看到；这不会替被标记者做任何决定。

而 Facebook 的实际设计更接近一个"不合理的 Sync"：`when Tagging.tag(by, image, who) then Friending.publish(who, image)`——即**代替被标记者本人**去发布这张图片，把决定权从被标记者手上抢走，这正是隐私争议的根源。

## 五、案例：富士 X100 相机——图像质量与画幅比例的耦合

富士 X100 系列相机的菜单里，"图像质量"（image quality：RAW/JPEG/精细/普通等等）和"画幅比例"（aspect ratio：1:1、3:2、16:9）被塞进了同一个菜单项 `IMAGE SIZE`。这带来两个具体问题：

- **问题一**：如果你想用非标准画幅比例（比如 1:1 方形构图）拍 RAW 格式，系统要求你必须**同时**保存一份 JPEG——RAW 本身其实完全可以做"非破坏性裁剪"（照片信息全都保留，只是显示框选了裁剪范围），不需要这个限制
- **问题二**：可选的画幅比例选项少得可怜（只有 3:2、16:9、1:1），用户在 Change.org 上专门发起请愿，要求富士加入 4:3、5:4、6:7 等更多比例

### 修复：拆成两个独立概念

```text
concept ImageQuality
purpose  设置图片的质量与格式
state    resolution(SMALL/MED/LARGE), compression(SUPER/FINE/NORMAL), format(RAW/JPEG/BOTH)

concept AspectRatio
purpose  设置图片的画幅比例
principle 设置画幅比例后，拍摄的照片会按该比例呈现
          （JPEG 通过裁剪，RAW 通过非破坏性取景框）
state    a set of Ratio(longSide, shortSide); 当前 RatioSetting
actions  addRatio(long, short), setRatio(ratio)
```

拆开之后，"要不要额外存 JPEG" 和 "用什么画幅比例" 变成两个完全独立的选择，用户可以自由组合而不受人为限制，也可以随意增加新的比例选项（`addRatio`）而不牵动图像质量的逻辑。

拆分的判断依据不是两组设置恰好出现在同一个菜单，而是它们服务不同目的、拥有不同变化原因：增加一种文件格式不应迫使画幅比例模块改变，增加一种比例也不应改写图像质量规则。

从用户视角看，这还恢复了两个可独立预测的选择：格式决定保留哪些图像数据，比例决定如何呈现画面；任一选择都不再暗中改变另一项。

## 六、案例：邮件账户配置——发信服务器与邮箱地址的耦合

在 Mac 邮件客户端里，一个账户的"发件邮箱地址"和"发信 SMTP 服务器"理论上是两件独立的事，但实际界面把它们放在同一个账户设置里、用同一个下拉菜单选择发件地址。真实的踩坑场景：

用户先用 `outgoing.csail.mit.edu` 服务器发送 `dnj@csail.mit.edu` 的邮件（正常）；随后切换到 `dnj@mit.edu` 邮箱地址，用 `smtp.mit.edu` 服务器发送（正常）；再收到别人回信、点"回复"时，系统自动带出了 `dnj@csail.mit.edu` 这个地址，但发信服务器却仍然停留在刚才选的 `smtp.mit.edu`——这个"服务器 + 邮箱地址"的错误组合，导致邮件因未通过 SPF/DMARC 验证（SPF 记录里没有登记 `smtp.mit.edu` 这个 IP 有权代表 `csail.mit.edu` 发信）而被对方直接标记为垃圾邮件。

### 修复：让邮箱地址与服务器选择关联在一起

原设计里 `EmailAccount [Server]` 把 `emailAddress` 和 `incoming/outgoing Server` 放在同一个 `Account` 上，二者互相独立、可以任意搭配（这正是 bug 的来源）。更好的设计是把 `emailAddress` 挪到跟"发信"（`EmailSending`）绑定的位置，让地址的选择直接决定服务器的选择，天然杜绝错误搭配；服务器的认证细节（用户名、密码、域名）还可以进一步拆成独立的 `ServerAuthentication` 概念。

## 七、案例：日历邀请——删除与取消的混淆

一个经典的意外事故：某个研讨会通知本应通过邮件群发给邮件列表（listserv），却因为操作失误被发到了错误的收件人身上；紧接着日历软件里"删除一个日历事件"这个动作，被隐式绑定成了"取消这场会议并通知所有被邀请人"——用户只是想把这条错误的日历条目从**自己的**日历上清除掉，却不小心把取消通知发给了所有原本受邀的人。这是 iCal（macOS 日历应用）长期存在的老问题：**如何删除一条"垃圾"日历事件，而不误伤所有参会者？**

苹果后来给出的修复方式，是在删除确认对话框里把"删除"这个笼统的动作，拆分成两个显式选项：**"删除并通知"（Delete and Notify）** 与 **"删除但不通知"（Delete and Don't Notify）**——本质上是让"同步是否触发"变成用户可控的选项，而不是硬编码的默认行为。

### 修复：把"删除"与"取消"解耦为两个概念

```text
concept CalendarEvent [User]
actions  newEvent, deleteEvent(e: Event) ...

concept Inviting [User, Event]
actions  invite(host, u, e), accept(u, e), decline(u, e), cancel(e: Event)
```

拆开之后，`deleteEvent`（把事件从我的日历里移除）和 `cancel`（正式取消会议、通知所有人）成为两个各自独立、互不牵连的动作——用户可以只删除自己日历上的条目，而不触发面向所有参会者的取消通知。
