---
title: 软件工程全景
type: lecture
lecture: 15
tags: []
status: complete
---
# Lec 15 软件工程全景

官方课件：[Everything about SE*](https://61040-fa25.github.io/assets/lecture-notes/everything.pdf)。这一讲不是罗列工具，而是把浏览器、服务器、数据库、状态、认证与安全放在同一张架构图中理解。

## Web 应用演化与状态的位置

早期 Web 主要是服务器存取/生成 HTML；后来数据库服务器、HTTP/REST 和 AJAX 逐渐形成今天的三层形态。REST 的核心思想是用 HTTP method 表达对资源的操作，而不是把每个动作都藏在一个特制 URL 中。

SPA 将初始 HTML/JavaScript 骨架发送到浏览器，随后浏览器异步向后端取数据；页面不用因每个操作整页阻塞刷新。代价是状态分布在多处：**客户端状态**负责当前 UI、暂存输入和交互体验，**服务器状态**负责可信的身份、权限和持久数据，数据库负责长期保存。静态网站则只是文件集合，通常无需应用服务器和数据库。

## 登录：session token 与 cookie

密码只在登录时交给服务器验证。验证成功后，服务器创建一个不可预测的 session id，保存“这个 session 属于 Alice、仍有效”等服务器状态；浏览器保存该 token，之后每次请求随 cookie 发回，服务器据此识别用户。cookie 的重要性质是按 domain 隔离，但第三方资源可造成跨站追踪，因此涉及同意与隐私问题。

**不要**使用递增计数器作为 session id；攻击者可以猜测。应使用足够随机、不可预测的值，并在服务器端检查其有效性、过期和权限。

## JWT 的取舍

JWT 把身份/权限声明放进带签名的 token，服务器不必为每个 token 保存 session 状态；签名能防篡改，却不能让服务器轻易撤销一个已发出的、尚未过期的 token。课件给出的常见折中是：短时 access token 用于日常请求，较少使用的 refresh token 用来换发新的 access token；refresh token 过期后要求重新登录。

## 安全边界

浏览器中的代码和数据对用户可见、可修改；用户还能跳过你的界面，直接用开发者工具、curl 或 Postman 伪造任何请求。因此：

- 客户端传来的用户名、角色、价格或“我已登录”都不是可信证明；服务端必须从 token 推导身份并再次授权。
- “先跳到登录页”“前端隐藏按钮”不是访问控制；每个敏感 API 都要做权限检查。
- 客户端缓存提高查询速度、离线能力和扩展性，却增加启动成本、隐私暴露和调试复杂度；数据放置是性能与信任边界的取舍。

## 配套工作

本讲对应的 Recitation 9（Deploy App）已经在 [lec16.md](./lec16.md) 的"Rec 应用部署"一节详细讲解；Assignment 4c（Project Complete）也整理在 lec16.md 文末，因为部署正是把项目做完整（*Project Complete*）的最后一步。
