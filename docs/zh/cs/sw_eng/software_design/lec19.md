---
title: 设计经验总结
type: lecture
lecture: 19
tags: []
status: complete
---
# Lec 19 设计经验总结

官方课件：[Design Lessons](https://61040-fa25.github.io/assets/lecture-notes/lessons-compressed.pdf)。本讲将课程方法迁移到实际架构与团队沟通语境：名称会变化，但“清晰边界、显式组合、可理解状态与动作”的原则仍然适用。

本节的目标：

- **知识定位** 将课程中学到的各种思想放入更大的背景中理解——它们从哪里来，行业里其他人怎么使用
- **思想解耦** 课程教的是一套完整方法，但这些思想可以独立应用——即使你的公司不采用完整的概念设计

##  行业架构术语与概念设计的关联

我们所学的很多思想，在工作中用这些词可能没人听得懂。但这些想法其实在行业中有对应的 流行语（*buzz phrases*），下面

逐一解读。

### 无头架构（*headless architecture*）

![image-20260610105655769](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260610105655769.png)

- 动机：希望将后端服务与多种前端配对——不同设备、平台、工具

- 做法：前后端彻底分离；后端只返回结构化数据（如 JSON），不返回 HTML；各服务独立运行（通常各自有独立认证）
- 代价：前端工作量更大（没有"打包"端点）；后端端点更细粒度、请求更多；用缓存或 BFF（Backend for Frontend）模式补偿
- 历史： 术语来自 CMS 厂商，当时对他们更具革命性；但对普通应用来说，这已是当前标准实践

- 对应概念： 就是课程里的前后端分离——前端（Vue）+ 后端（Deno），API 返回 JSON，通过 Sync 协调

### 模块化单体（***Modular Monolith***）

![image-20260610110026158](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260610110026158.png)

- 动机：希望后端具有模块化，将其拆分为独立服务
- 做法：服务只通过 API 访问；每个服务拥有自己的数据
- 代价：跨服务 Join 查询困难，有多种解法，包括独立读存储（*separate read store*）
- 历史： 微服务（microservices）约 2011 年出现，完全独立的仓库和构建；但负担过重，近 5 年单体架构重新受推崇

有问题的组合方式

![image-20260610110120246](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260610110120246.png)

客户端编排（*Client-side orchestration*）和依赖微服务（*Dependent microservices*）都存在耦合问题。

就是课程里的概念模块化——每个概念拥有自己的状态和动作，通过 Sync 协调

### 事件驱动架构（*event driven architecture*）

![image-20260610110219732](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260610110219732.png)

动机：将服务之间彻底解耦

做法：服务通过 Event Bus 发布/订阅事件（"隐式调用"）；用 event ID 确保幂等性

好处： 扩展性好，可异步；可观测性强（事件作为审计日志）；支持时间旅行——可重放事件、回滚状态

挑战：最终一致性难以超越；分布式调试困难

历史：1980 年代第一批 pub/sub 系统；现在有 Apache Kafka 等成熟框架

**事件驱动中的状态传递问题**

![image-20260610110610527](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260610110610527.png)

事件携带状态（*Event-Carried State*）

- 事件本身携带所需数据
- 消费者无需回调生产者
- 代价：消费者依赖生产者的事件 schema

消费者读取方式：

- 消费者向生产者发 API 请求获取数据
- 消费者访问专用读存储（*read store*）
  - 要么向生产者拿事件上没有的信息（生产者消费者耦合了），或者是访问专用的只读存储（本质上也是维护了生产者的东西，schema 一变， 消费者可能也要跟着改）
- 问题：产生服务间依赖

#### 反腐层（ACL）

反腐层（ACL，*Anti-Corruption Layer*）订阅事件总线上的事件，将其翻译为对应服务的 API 调用，使服务本身无需感知事件系统。示例流程：ACL 订阅 `order-placed` → 接到通知 → 调用 `Fulfillment.fulfill()`，Fulfillment 服务完全不知道事件的存在。ACL 是一个通用模式：服务与外部世界之间的"翻译器"，也是 Sync 机制在行业中的对应物。

## 概念设计的三个可独立使用的思想

### 思想一：视图分离（*View Separation*）

- 核心思想： 将功能目的划分，而非按对象（object）归组
- 帮助： 真正的关注点分离； 更多代码复用的机会；概念不与具体应用绑定
- 做法： 避免 OOP 的对象归组方式； 对同一实体建立多个视图
- 挑战： 跨视图查询需要 join
- 谁在用： RDB 的标准实践； OOP 中少见，但有 Mixin、实体-组件系统等补救方案

示例： User 对象的视图分离

传统 OOP 把所有属性堆在一个 `UserAccount` 对象里，视图分离将其按目的拆分：

- PasswordAuth： 目的是认证用户，状态是 password
- UserNaming： 目的是用户命名，状态是 username
- Notification： 目的是通知用户，状态是 email、phone
- Profile： 目的是分享用户信息， 状态：displayName, image

**Python Mixin 写法**

```python
class NamingMixin:
    username: str
    def set_username(self, u): ...

class AuthMixin:
    _password_hash: str
    def check_password(self, h): ...

class ProfileMixin:
    display_name: str
    bio: str

# 各 Mixin 独立定义，User 通过多重继承组合
class User(NamingMixin, AuthMixin, ProfileMixin):
    user_id: int
```

**实体-组件（ECS）写法**

```python
Entity = int

naming:  Dict[Entity, Naming] = {}
auth:    Dict[Entity, Auth]   = {}
profiles:Dict[Entity, Profile]= {}

# 实体仅是 id，各组件独立存储，系统操作组件集合

def register_user(e, username, pwd_hash):
    naming[e]  = Naming(username)
    auth[e]    = Auth(pwd_hash)

def set_profile(e, display_name, bio):
    profiles[e] = Profile(display_name, bio)
```

### 思想二：无界多态（*Unbounded Polymorphism*）

- 核心思想：概念的类型参数应当是**完全泛型**的——不附加任何接口约束或类型限制。例如 `concept Upvoting [User, Item]`，这里的 `User` 和 `Item` 就是"多态类型参数"（*polymorphic type parameters*），概念内部完全不关心它们具体是什么类型，只把它们当作不透明的标识符或引用来传递。
- 帮助：服务/概念可以被完全独立地定义，专注于自己的目的，不需要为了适配某个具体应用而做定制——`Upvoting` 不需要知道 `Item` 到底是一篇帖子还是一条评论。
- 做法：调用方只需要传入一个不透明的 id 或引用（或者一个原始类型），概念内部不对其做任何结构假设。
- 挑战：因为概念之间不共享类型定义，跨概念的协调需要更多"编排"（*orchestration*）工作——这正是 Sync 存在的意义。
- 谁在用：函数式语言（如 SML、Haskell）里的多态函数是这一思想的理论源头——Philip Wadler 1989 年的经典论文《Theorems for Free!》证明了：一个完全通用的多态函数（如 `reverse: ∀X. X* → X*`），仅凭它的类型签名就能推导出它必须满足的行为定理，而不需要看函数的具体实现。这说明"不对类型做任何假设"这件事本身，恰恰保证了行为的可预测性。领域驱动设计（*Domain-Driven Design*）里的"限界上下文"（*bounded context*）也是同一思想的工程实践：每个上下文（如 Catalog、Order、Billing、Fulfillment）独立开发、不共享假设或 schema，彼此之间只通过翻译层（如反腐层 ACL）通信。

### 思想三：抽象状态与动作（*Abstract State & Actions*）

- 核心思想：把系统行为建模成一个**自动机**（*automaton*）——用抽象的状态（state）和作用在状态上的关系（actions）来描述系统会做什么，而不是直接描述"怎么用代码实现它"。可以把动作看作对状态的原子更新。这正是本课程从 [Lec 3](./lec3.md) 起就在用的建模方式：`concept UserAuthentication [User]`，`state` 是一组带 `username`、`passwordHash` 的 `User`，`actions` 里的 `register(n, p)` 明确写出 `requires`（前置条件：不存在同名用户）与 `effects`（后置条件：创建新用户、设置用户名与密码哈希）。
- 帮助：状态描述与具体的代码实现无关（*representation independent*）——同一份状态与动作规格，可以用完全不同的代码实现，但语义上保持一致；这样的规格比读代码本身更简单、更容易理解。
- 做法：需要一种能声明状态的语言（本课程用的是自己的 SSF 记号），并且为每个动作显式写出前置条件与后置条件。
- 谁在用：这不是本课程的发明，而是形式化方法领域几十年的标准实践——状态型规格语言（VDM、Z、B、Alloy）、软件建模语言（UML）、以及模型检验器（TLA+、Alloy、NuSMV）都建立在同样的思想上。课件用同一个 `UserAuthentication` 的 `register`/`login` 动作，分别展示了它在 Z、TLA+、Alloy 三种形式化语言里的写法：三者语法不同，但都是在用状态转移的方式描述"注册后有哪些不变量成立、登录改变了哪些状态"，与本课程"状态 + 动作 + 前置/后置条件"的写法本质相通。

## 设计模式的起源

从建筑到软件——模式语言的传承

- Christopher Alexander 等人于 1977 年出版《A Pattern Language》，描述建筑设计中反复出现的模式（如门的位置、采光方式等）。
- 1994 年，Gang of Four（四人帮）将这一思想引入软件，出版《Design Patterns》——2025 年仍是亚马逊 OOP 类图书销量第一。
- Daniel 的观点：软件中的"概念"（*Concept*）就是一种模式语言——反复出现、有名字、有结构的设计单元。

## 四种命名概念

课件用"命名"（*naming*）这一件小事，示范"概念即模式语言"这个说法：不同应用里反复出现的"给东西起名字、找东西"需求，其实可以拆成四种彼此独立、可复用的命名概念。作为对照，课件先展示了一个**不是**命名概念的例子——`Foldering`（文件夹）：它的目的是"组织条目并允许嵌套"，本质上是一种层级式的**容器结构**，而不是命名机制本身；很多产品把"命名"和"分类归档"这两个目的混在同一个功能里，正是概念设计里典型的"过载"问题（参见 [Lec 4](./lec4.md) 的 `UserAccount` 反例）。

- **简单命名（Simple Naming）**：目的是为 Item 指定一个助记名称，后续可以通过这个名称（有时配合其他属性）重新识别这个条目。
  - 名称本身没有预设的作用域，只能在具体使用的上下文里被解读
  - 命名本身很简单，但反过来"查找"较难——多个条目可能重名，需要额外信息消歧
  - 例：街道名 + 邮编、患者姓名 + 出生日期、社交媒体上的显示名称。课件还提到一个真实的命名冲突案例：制铝公司 Alcoa 早期靠社会压力（谁先注册、谁的名气更大）来解决重名问题，说明"简单命名"在缺少显式消歧机制时，往往退化成非正式的社会协商。

- **全局标识（Global Id）**：目的是给每个条目分配一个在全局范围内唯一、不会冲突的标识符，不依赖任何人为协商。
  - 典型做法：自增主键、UUID 等——只要标识符本身不重复，就不需要"起名字撞车"这种问题
  - 代价是全局 id 通常没有助记性，人类无法从 id 本身读出任何有意义的信息（对比"简单命名"，两者互补：id 保真定位，名称保可读性）
  - 课件用 Spotify 举例：同名歌曲/专辑在系统里大量存在，光靠"名字"这个属性完全无法区分，必须依赖背后的全局 id 才能准确引用到唯一一条记录

- **命名空间（Namespacing）**：目的是把"简单命名"的作用域限定在一个更小的范围内，从而重新获得唯一性保证——只要求名称在**其命名空间内部**唯一，不同命名空间之间允许重名。
  - 典型例子：Unix 文件系统里，同一目录下文件名必须唯一，但不同目录下可以有同名文件（"命名空间"就是目录路径）；DNS 域名解析（`csail.mit.edu` 与 `csail.stanford.edu` 内部都可以有名为 `www` 的主机，因为它们分属不同的命名空间）
  - 与全局标识相比，命名空间保留了"名称仍然助记、可读"的优点，用层级结构而不是完全放弃可读性来解决冲突问题

课件最后用 **Dropbox** 的文件同步机制做整合案例：一个文件的完整标识其实同时依赖三种命名概念协作——`GlobalId` 保证每个文件对象在系统内部有唯一、稳定的引用（即使文件被改名或移动，这个 id 不变）；`Namespacing` 让文件路径（文件夹层级）提供人类可理解的组织结构；`SimpleNaming` 则是用户在某一层级目录下看到、编辑的那个具体文件名。三者组合，才同时满足了"系统内部精确追踪"和"用户体验上易于理解"这两个经常互相冲突的目标——这正是"概念是可复用模式语言"这一说法的具体体现：同一组命名概念，几乎可以原样搬进任何需要"组织与识别条目"的产品里。
