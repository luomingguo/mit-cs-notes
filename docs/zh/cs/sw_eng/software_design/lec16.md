---
title: 后端设计
type: lecture
lecture: 16
tags: []
status: complete
---
# Lec 16 后端设计

本节目标：

- **巩固** 理解异步请求对 Web 应用的核心意义，以及为什么客户端侧的同步还不够
- **记忆** 掌握列表函数式（filter / map / reduce）这一重要编程范式
- **联系** 理解关系型数据库（SQL）与集合型数据库（MongoDB）的操作异同
- **理解** 明白同步中 `where` 子句的工作原理：对 frames 列表的函数管道处理

## 异步请求重要性

在 Web 的早期时代（1991–1993）， 使用 CGI（1993）通过 HTTP 请求触发服务端脚本，但客户端在整个过程中处于阻塞状态。

![image-20260602175356859](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602175356859.png)

传统的多页面应用的请求流程：

1. 浏览器发起 Get 表单单页
2. 服务器渲染并返回表单 HTML
3. 浏览器用户填写表单并提交
4. 浏览器阻塞： 等待服务器处理，用户无法操作页面
5. 服务器写库+查询+填充模板  → 返回新页面
6. 浏览器渲染新页面，交互恢复

![image-20260602175932110](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602175932110.png)

----

1998 年，微软引入 AJAX（*asynchronous Javascript and XML*）， 后被所有浏览器标准化。 允许在页面脚本内部向服务器发出请求，无需重载页面。

客户端代码

```js
var xhr = new XMLHTTPRequest();
xhr.open("GET", "example.txt", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    console.log(xhr.responsetext);
  }
}
xhr.send();
```

服务端代码

```js
var xhr = new XMLHTTPRequest();
xhr.open("POST", "/submit", true);
xhr.setRequestHeader("Content-Type", "/submit", true);
xhr.send("name=Daniel&message=Hello")
```

如果放在今天，这个代码就是

![image-20260602180603636](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602180603636.png)

单页应用（SPA）的流程

1. 浏览器请求 HTML+JS 骨架
2. 渲染页面，用户可立即交互
3. 后台异步拉取数据
4. 收到响应后更新 DOM（不阻塞）

![image-20260602180415717](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602180415717.png)

##  什么放在客户端，什么放在服务端

浏览器中的代码和数据对用户完全可见、可修改（通过开发者工具或控制台）。用户可伪造任意 HTTP 请求。 下面哪些是好的策略呢？

❌ 在 URL/请求中传递用户名 → 任何人都能伪造他人数据，**不安全**

❌ 使用自增 Session ID 存入 Cookie → 可被枚举猜测，**不安全**

❌ 必须先经过登录页才能访问敏感页面 → 本质上是一种客户端导航约束。 **不安全**

✅ 生成随机 Session ID 存入 Cookie → 无法被猜测，**推荐做法**

### 性能考量

| 指标         | 更多数据在客户端 | 更多数据在服务端 |
| :----------- | :--------------- | :--------------- |
| 查询速度     | 快（本地）       | 慢（网络往返）   |
| 本地存储占用 | 高               | 低               |
| 初始启动时间 | 慢               | 快               |
| 离线可用性   | 支持             | 不支持           |
| 多客户端扩展 | 难               | 易               |
| 隐私风险     | 高               | 低               |

下图是 AWS 数据中心之间的往返时间

![image-20260602182739186](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260602182739186.png)

## 列表函数式

给定 `users` 数组（含姓名、是否活跃、消费记录），要求输出所有**活跃用户**及其**消费总额**。

```js
// filter — 过滤，保留满足条件的元素
filter(arr, predicate: T => boolean): T[]
// 例：filter(a, e => e % 2 === 1)  // [1, 3]

// map — 映射，对每个元素做变换
map(arr, f: T => U): U[]
// 例：map(a, x => x * 2)           // [2, 4, 6]

// reduce — 归约，将数组折叠为单一值
reduce(arr, f: (acc, e) => T, init: T): T
// 例：reduce(a, (acc, e) => acc + e, 0)  // 6
```

传统命令式写法 vs 函数式写法

```js
// 传统写法（for 循环）
const result = [];
for (const user of users) {
  if (!user.active || ...) continue;
  let total = 0;
  for (const p of user.purchases)
    total += p;
  result.push({ name, total });
}

// 函数式写法（更清晰）
const result = map(
  filter(users, u => u.active),
  u => ({
    name: u.name,
    total: reduce(
      u.purchases,
      (acc, p) => acc + p, 0)
  })
);
```

函数式写法将"做什么"（过滤 → 映射 → 归约）与"怎么做"（循环细节）分离，结构更清晰，意图更明确。

## SQL 关系型查询

关系型数据库将数据表示为标量表，通过 JOIN、WHERE、GROUP BY 等操作进行查询。

```sql
SELECT u.name, SUM(p.amount) AS total
FROM users u
JOIN purchases p ON p.name = u.name
WHERE u.active = TRUE
GROUP BY u.name
ORDER BY u.name;
```

各步骤对应：`WHERE` ≈ filter，`SUM/GROUP BY` ≈ reduce，`JOIN` ≈ map 展开关联表，`ORDER BY` 排序。

### SQL 与列表函数式的对应关系

| 列表函数式 | SQL 等价                      |
| :--------- | :---------------------------- |
| `filter`   | `WHERE` 子句                  |
| `reduce`   | 聚合函数（`SUM`、`COUNT` 等） |
| `map`      | 计算 JOIN（展开关联行）       |

## MongoDB 集合查询

MongoDB 使用聚合管道（*Aggregation Pipeline*）对集合进行链式操作，与函数式管道理念一致。

### 规范化集合（*Normalized*）

```js
// Note：users + purchases两个独立集合
interface UserEmbeddedDoc {
  _id: string;
  name: string;
  active: boolean;
}

interface  purchases: {
  _id: string;
  name: string;
  amount: number;
};

db.users.aggregate([
  { $match: { active: true } },          // filter
  { $lookup: {                            // JOIN
      from: "purchases",
      localField: "name",
      foreignField: "name",
      as: "purchases"
  }},
  { $unwind: "$purchases" },             // 展开数组
  { $group: { _id: "$name",
      total: { $sum: "$purchases.amount" } } }, // reduce
  { $project: { _id: 0, name: "$_id", total: 1 } },
  { $sort: { name: 1 } }
]);
```

### 嵌套集合（Embedded）

```js
// Note：·purchases 内嵌在 users 文档中
interface UserEmbeddedDoc {
  _id: string;
  name: string;
  active: boolean;
  purchases: { amount: number }[];
}

db.users.aggregate([
  { $match: { active: true } },
  { $unwind: "$purchases" },
  { $group: { _id: "$name",
      total: { $sum: "$purchases.amount" } } },
  { $project: { _id: 0, name: "$_id", total: 1 } },
  { $sort: { name: 1 } }
]);
```

嵌套写法更简洁，但为什么生产环境更推荐规范化？

- 关注点分离（*Separation of Concerns*）
- 减少写入冲突与锁竞争

## 在同步中使用查询

`where` 子句的核心理解：它是一个**对 frames 列表的函数管道**。每次 `frames.query()` 将 frames 列表展开或关联，传递到下一步。

## 配套 Recitation：应用部署

## 1. 架构回顾：前端与后端是两个独立程序

![image-20260603091248430](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260603091248430.png)

## 2. 后端 API 机制

### 2.1 概念文件结构

后端入口位于 `backend/src/concept_server.ts`， 自动扫描`src/concepts/` 目录：

```text
src/concepts/
├── ToDoList/
│   └── ToDoListConcept.ts
├── GiftRegistry/
│   └── GiftRegistryConcept.ts
```

每个子目录对应一个概念，目录内必须有一个 `Concept.ts` 文件。框架会自动扫描所有方法名，并为其创建对应的 API 路由，无需手动注册。

### 2.2 API Endpoint 格式

所有概念动作均以 **POST 请求**的形式暴露为 API 端点。 格式为

```bash
/api/<conceptName>/<actionName>

# conceptName = src/concepts/ 下的子目录名
# actionName  = 该概念类中定义的方法名
```

| HTTP 方法 | 端点路径                    | 实际调用                        |
| :-------- | :-------------------------- | :------------------------------ |
| `POST`    | `/api/ToDoList/addItem`     | `ToDoListConcept.addItem()`     |
| `POST`    | `/api/ToDoList/removeItem`  | `ToDoListConcept.removeItem()`  |
| `POST`    | `/api/GiftRegistry/addGift` | `GiftRegistryConcept.addGift()` |

### 2.3 API Base 配置：开发环境 vs 生产环境

开发环境： `vite.config.js` 将所有 `/api` 请求代理到 `http://localhost:8000/api`，需先手动启动 Deno 后端

生产环境：部署后，前端将所有 API 请求指向 `https://snoopy-backend.onrender.com/api/<concept>/<action>`，后端永远在线，无需手动启动

<div style="background:#e6f4ec;border:1px solid #f2a0a0;border-radius:16px;padding:20px 28px;font-size:20px;line-height:1.8;margin:16px 0;"> ✓ 部署后的核心优势：后端持续运行，用户打开应用即可使用，无需开发者额外操作。 </div>

## 3. 新版后端架构：加入 Syncs

### 3.1 新入口文件

旧入口： `concept_server.ts` — 仅处理概念直连，无 Syncs

新入口：`your-backend/src/main.ts` — 包含日志（Logging）、Requesting 概念、Syncs 三项能力

### 3.2 日志

后端默认打印每个动作的完整调用链（*trace*），便于在控制台查看哪些 Sync 被触发。提交作业时需附上 demo 视频对应的 trace 日志。

### 3.3 Requesting 概念：路由判断核心

位于 `src/concepts/Requesting/RequestingConcept.ts`，作为 API 请求服务器的封装层。路由分为两类：

- **直通路由**（*passthrough*）
  - 定义在`passthrough.ts` 的 inclusions 列表
  - 服务器直接执行概念动作。
  - `Concept.action({ inputs })`
  - 返回值直接序列化为 JSON 发回前端
- **Sync 路由**（*excluded*）
  - 定义在 `passthrough.ts` 的 exclusions 列表
  - 触发 `Requesting.request({ path, inputs })`
  - 依次执行：Request Sync → Respond Sync
  - 最终 JSON 响应返回前端
  - 适合：需要多概念协调的复杂操作

## 配套作业：Assignment 4c — Project Complete

官方作业页：[Assignment 4c](https://61040-fa25.github.io/assignments/assignment-4c)。

这是 Assignment 4 系列（4a 后端概念 → 4b 前端界面 → 4c 完整项目）的最后一步，要求把前面独立完成的后端概念和前端界面，通过 Sync 引擎正式接到一起，并部署为一个公网可访问的完整应用——直接对应本讲"Rec 应用部署"里讲的前后端分离部署流程（前端指向 `https://<backend>.onrender.com/api/...`，后端持续在线）。验收标准包括：应用可通过公开 URL 完整跑通核心用户旅程，后端日志能打印出每次请求触发的 Sync 调用链（*trace*），且交付时需附带演示视频与对应的 trace 日志，证明 Sync 确实按预期被触发。
