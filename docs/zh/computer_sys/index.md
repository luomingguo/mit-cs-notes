---
layout: home
title: 计算机系统
titleTemplate: MIT / CMU 系统课程笔记

hero:
  name: 计算机系统
  text: 从硬件到分布式云服务
  tagline: 操作系统 · 计算机网络 · 数据库 · 分布式系统 · 存储 · 数据中心 —— MIT / CMU 系统类课程笔记合集
  image:
    src: /img/computer_sys_hero.svg
    alt: 计算机系统分层架构插图
  actions:
    - theme: brand
      text: 从计算机系统工程开始
      link: /zh/computer_sys_eng/
    - theme: alt
      text: 操作系统工程
      link: /zh/os/
    - theme: alt
      text: 返回笔记主页
      link: /zh/notes/index

features:
  - icon: 🧩
    title: 6.1800 计算机系统工程
    details: 覆盖操作系统、网络、分布式系统与安全四大主题，理解抽象、模块化等通用设计模式如何驾驭系统复杂度，是整个计算机系统板块的总览课程。
    link: /zh/computer_sys_eng/
  - icon: 🐧
    title: 6.1810 操作系统工程
    details: 基于 RISC-V 上的 xv6（类 Unix 教学操作系统），讲解虚拟内存、文件系统、线程、中断与系统调用等操作系统设计与实现的核心机制。
    link: /zh/os/
  - icon: 🌐
    title: 6.5820 计算机网络
    details: 聚焦网络协议与架构的工程与分析：互联网路由、传输层拥塞控制、无线网络、SDN 与网络安全，阅读材料以经典论文为主。
    link: /zh/network/
  - icon: 📡
    title: 6.1820 移动和传感器计算
    details: 围绕物联网系统的感知、计算与通信：定位技术、无电池传感、惯性与声学感知、自动驾驶与智慧城市等移动计算系统的设计与实现。
    link: /zh/mobile/
  - icon: 🗄️
    title: 6.5830 数据库系统
    details: 介绍关系模型与 SQL、查询优化与处理、并发控制与故障恢复，理解现代数据库系统的内部架构与实现原理。
    link: /zh/database_system/
  - icon: 🔗
    title: 6.5840 分布式系统
    details: 学习构建分布式系统的抽象与实现技术：容错、复制与一致性，通过 MapReduce、Raft、GFS、Spanner 等经典论文案例深入理解。
    link: /zh/distributed_system/
  - icon: 💾
    title: 18-746 存储系统
    details: 从单个存储设备（HDD/SSD）到分布式文件系统：磁盘阵列、缓存、LSM 树与可靠性增强技术，覆盖存储系统的设计、实现与使用。
    link: /zh/storage/
  - icon: 🏢
    title: 6.S984 数据中心计算
    details: 研究仓库规模数据中心的硬件、系统软件与分布式技术，关注总拥有成本、服务水平目标、可用性与可靠性等跨领域问题。
    link: /zh/dc_computing/
---

## 推荐学习路线

计算机系统这一板块的课程之间存在递进关系：先建立系统设计的整体框架，再分别深入操作系统、网络、数据与分布式、大规模基础设施等子领域。

| 阶段 | 课程 | 核心内容 |
| --- | --- | --- |
| 1️⃣ 系统总览 | [计算机系统工程](/zh/computer_sys_eng/) | 抽象、模块化、虚拟化，操作系统/网络/分布式/安全的全景图 |
| 2️⃣ 单机系统 | [操作系统工程](/zh/os/) | 虚拟内存、文件系统、线程、中断、系统调用（xv6） |
| 3️⃣ 网络互联 | [计算机网络](/zh/network/) → [移动和传感器计算](/zh/mobile/) | 路由、拥塞控制、无线网络、SDN，再到物联网感知与定位 |
| 4️⃣ 数据与一致性 | [数据库系统](/zh/database_system/) → [分布式系统](/zh/distributed_system/) → [存储系统](/zh/storage/) | 查询处理与事务 → 容错、复制与一致性 → 存储设备与分布式文件系统 |
| 5️⃣ 大规模基础设施 | [数据中心计算](/zh/dc_computing/) | 仓库规模数据中心的硬件、性能、可靠性与运维 |

::: tip 阅读建议
每门课程主页都附有先修课程、参考书与实验列表；可以按上表顺序逐步学习，也可以根据自己的薄弱环节直接跳转到对应课程。
:::
