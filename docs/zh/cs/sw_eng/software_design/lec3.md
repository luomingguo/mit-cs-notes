---
title: 设计行为 · 软件设计
type: lecture
lecture: 3
tags: [software-design, prd, concept-design, data-model]
status: complete
source: 'https://61040-fa25.github.io/assets/lecture-notes/L03-designing-behavior.pdf'
---
# Lec 3 设计行为

官方课件：[Designing Behavior](https://61040-fa25.github.io/assets/lecture-notes/L03-designing-behavior.pdf)。设计行为，而不是代码、算法或页面跳转；概念设计要描述用户可观察到的状态变化。

## TL;DR

- Concept 的 State 可以统一表示为集合与二元关系，并用 ER 图精确表达。
- Action 应围绕用户可观察的行为定义，通过前置条件与效果描述状态变化，而不是暴露 UI 步骤或内部实现。
- Trace 把行为看作动作历史，不变量则定义所有可达状态必须保持的性质，两者共同帮助检查设计完整性。
- Concept 不应向外暴露内部复合对象；这种表示独立性使设计更容易转换为代码或数据库结构。

## 学习目标

- **知道如何对行为建模** （或者说数据模型）以及动作。 ——这是 CS 的关键技能！
- 理解 trace 视角，将行为视为动作的历史。
- 懂得在系统设计中如何使用不变性（*invariant*），通过完整性约束来定义什么是“好（正确）的状态”。

## Concept 应描述到什么粒度？

Concept Design 的价值往往就在行为细节中，但并不是所有技术细节都应该写进 Concept。

应该包含的是**用户可观察到的行为**：用户采取的步骤、系统对用户的响应，以及用户提供或获得的数据。例如在线书店中，“购买一本书 → 系统配送 → 用户提供地址并获得预计送达时间”，这些都会影响用户如何理解和使用系统，因此属于 Concept 的设计。

不应该的是内部实现细节，例如订单 ID 如何校验、数据放在哪台服务器、如何复制数据、系统内部如何向仓库发送请求等。这些属于工程实现，不改变 Concept 对用户表现出的行为。

同时 Concept 也应该 UI-independent：不描述页面长什么样、按钮在哪里、页面如何跳转，以及“点击按钮 → 打开页面 → 选择选项”这样的微操作，而是抽象成有意义的行为，例如“购买一本书”。

::: insight
判断一个细节是否属于 Concept，可以问： “如果改变这个细节，用户理解和使用系统的方式会不会改变？” 会 → 行为细节，应考虑。其他则排除。 因此 Concept 的抽象层级位于 UI 与底层实现之间：关注用户可感知的行为语义，而不是界面微操作或工程实现。
:::

## 如何设计概念？

我们以预定座位作为如何设计一个概念的例子，可以按照如下逻辑：

1. **命名**：**名称要针对功能**，但足够通用。

2. **描述目的**：从利益相关者的价值出发，为什么要设计和使用这个概念？

3. **描述用户故事**：一个简单的场景来说明如何使用它。

4. **列出**用户或系统能执行的**动作**，只描述有意义的行为步骤，不描述点击按钮等 UI 微操作

5. **指定状态**：需要记住什么才能支撑这些动作。

### 概念命名

- [ ] Restaurant
- [x] RestaurantReservation
- [ ] OpenTableReservation
- [ ] Reservation

### 描述目的

- [x] 减少顾客等位时间
- [ ] 最大化现有餐桌的利用率
- [ ] 为预订服务平台创造收入
- [ ] 追踪餐桌占用情况与客流规律

### 描述用户故事

餐厅在不同时间提供可预订的时段；顾客预订某个特定时间后，就可以确保在该时间到店时有座位。

### 列举动作

下面只是 UI 层面的微操作，不属于 Concept 的 Actions。

不应该写成：

- `select date`
- `select time`
- `click Reserve`

同样，`login`、`search restaurant`、`review restaurant` 也不属于 `RestaurantReservation`，因为它们分别属于身份认证、搜索、评价等其他 Concepts。

::: insight
判断某个动作是否属于当前 Concept，可以问： “如果把这个动作拿掉，RestaurantReservation 这个行为模式本身还能完整成立吗？” `reserve`、`seat` 属于核心流程；`login`、`search` 虽然真实产品可能需要，但不是预订 Concept 本身的一部分。
:::

#### 定义动作参数

![defining action arguments](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260807061225818.png)

### 制定状态

状态只记录支撑动作与不变量所需的事实；用集合和关系表示，可以避免把某一种嵌套对象结构提前固化为外部契约。

```text
一组带Time的Slots
一组预定，每个预定有
	1 个 User
	1 个 Slot
	1 个 被预定的标志
```

定义动作

```text
createSlot(t: Time)
effect:
  创建一个新的 Slot，并将其与时间 t 关联

reserve(u: User, t: Time): Reservation
requires:
  时间 t 存在尚未被预订的 Slot
effect:
  创建并返回一个新的 Reservation
  将其与用户 u 和对应 Slot 关联

seat(r: Reservation)
requires:
  r 是当前时间附近的有效预订
effect:
  将 r 标记为 seated
```

这组状态足以回答每个 Action 的前置条件：`reserve` 能查到可用 Slot，`seat` 能验证 Reservation，并且所有效果都能写成对集合或关系的局部更新。若加入支付或登录，它们应由其他 Concepts 承担，而不是继续扩张 Reservation 的 State。

![reservation with slots](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829065028679.png)

### 整合概念规格

**概念名称** RestaurantReservation
**目的** 减少顾客等位时间。
**运作原理**  餐厅在不同时间提供可预订的时段；顾客预订某个特定时间后，就可以确保在该时间到店时有座位。
**状态**
一组 `Slot`，每个 Slot 对应一个 `Time`
一组 `Reservation`，每个 Reservation 包含：`User`、`Slot`、`seated`：是否已经入座
**动作**

```text
createSlot(t: Time)
effect:
  创建新的 Slot，并关联时间 t

reserve(u: User, t: Time): Reservation
requires:
  时间 t 存在尚未被预订的 Slot
effect:
  创建并返回新的 Reservation，
  将其关联到用户 u 和对应 Slot

seat(r: Reservation)
requires:
  r 是当前时间附近的 Reservation
effect:
  将 r 标记为 seated
```

## 动作的历史：Trace

行为是 action history。把整个应用的 trace 投影到某个 concept，就得到这个概念关心的历史；这使我们能讨论“动作先后顺序是否允许”“取消后再删除会怎样”，而不仅仅看某张瞬时数据表。概念之间的 sync 也应在 trace 中阅读，因为其含义正是一个动作引发的后续历史。

![a trace of the reservation system](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260228170431767.png)

## 状态不变量

状态不变量（*state invariants*），也叫做集成限制（*integrity constraint*）。

状态不变量在每个可达状态都必须成立。例如“一本实体书同一时刻至多被一人借走”、“每个订单都属于恰好一位顾客”。它不同于动作的前置条件：前置条件限制能否执行某个动作；不变量限制任何动作执行后都不能破坏的事实。

不用逐个检查系统可能出现的所有状态，而是用数学归纳法证明系统永远不会进入坏状态：

1. 初始状态满足不变量；
2. 每个会修改相关状态的动作，都保持不变量。

系统运行后可能产生数量巨大甚至无限多的行为序列：`预定 - 取消 - 预定 - 取消`，

以预订为例，餐厅预订系统希望避免的坏状态是：**同一个 slot 同时存在两个或更多预订**。

最后再检查两类完整性：动作是否足够（能否取消、删除、变更？），状态是否足够（能否表达动作发生的必要信息？）。

## 状态 & 数据模型精确化

之前的表示

```text
Slots:
slot | time
s0   | July 4, 2025 7pm

Reservations:
res | user | slot
r0  | u1   | s0
```

看起来像两张数据库表。但 Concept Design 想进一步抽象：其实这里存在三类独立的“东西”：

```text
Slot        = {s0, ...}
Reservation = {r0, ...}
User        = {u1, ...}
```

它们都是 集合。然后再单独描述这些东西之间的关系。

```text
time = {
  (s0, July 4 7pm)
}

user = {
  (r0, u1)
}

slot = {
  (r0, s0)
}

```

它们被称为二元关系（*Binary Relations*），因为

```text
r0 ──user──→ u1
r0 ──slot──→ s0
s0 ──time──→ July 4, 7pm
```

**Concept 的 Action 不应该把内部的复合对象直接暴露给外部**

![concept does not expose composite objects!](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260829072649231.png)

## 配套工作

- **Recitation 2 — States and Actions**：把需求改写为状态和动作，并检查行为轨迹；[Rec 2 课件](https://61040-fa25.github.io/assets/recitation_notes/61040-Rec2-Slides.pdf)。
- **Pset 1 — Concept Design**（9 月 14 日截止）：完整写出概念、状态、动作与原则；[作业页](https://61040-fa25.github.io/assignments/problem-set-1)。
