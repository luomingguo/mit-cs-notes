---
title: 安全和隐私
type: lecture
lecture: 14
tags: []
status: complete
---
# Lec 14 安全和隐私

[CryptDB: Protecting Confidentiality with Encrypted Query Processing](https://people.csail.mit.edu/nickolai/papers/popa-cryptdb.pdf)

[Hey, You, Get Off of My Cloud: Exploring Information Leakage in Third-Party Compute Clouds](https://cseweb.ucsd.edu/~hovav/dist/cloudsec.pdf)

## 论文阅读：CryptDB：通过加密查询处理保护数据机密性

## 本讲导览

在线应用程序容易遭受敏感信息被窃取的风险，因为攻击者可能利用软件漏洞获取私密数据，而好奇或恶意的系统管理员也可能截获并泄露数据。**CryptDB** 是一个系统，旨在为使用 SQL 数据库的应用程序在面对此类攻击时，提供**实用且可证明的机密性保护**。

CryptDB 的工作原理是：通过一组高效且能识别 SQL 查询语义的加密方案，在加密数据上直接执行 SQL 查询。CryptDB 还可以将加密密钥与用户密码“链式绑定”，从而使得某个数据项只能通过拥有访问权限的用户的密码进行解密。因此，数据库管理员永远无法接触到解密后的数据；即使所有服务器都被攻陷，攻击者也无法解密未登录用户的数据。

对一个真实的 MySQL 服务器的 1.26 亿条 SQL 查询的分析表明：在 128,840 个数据库字段中，CryptDB 能在加密数据上支持其中 99.5% 的操作。

## 论文阅读： 探索第三方云计算的信息泄露

## 本讲导览

第三方云计算体现了将外包（outsourcing）理念应用于计算资源的承诺。像微软的 Azure 和亚马逊的 EC2 这样的服务，允许用户按需启动虚拟机，从而能够在需要时精确购买所需的计算能力。反过来，虚拟化的使用也使第三方云服务提供商能够通过在共享的物理基础设施上复用多个客户的虚拟机，最大化其前期资本投入的利用率。

然而，本文表明这种方式也可能带来新的安全漏洞。以 Amazon EC2 服务为案例，我们展示了如何映射出其内部云基础设施、识别出某个目标虚拟机可能所在的位置，并持续启动新的虚拟机，直到有一台与目标虚拟机“共驻”（co-resident）在同一物理机上为止。

我们进一步探讨了，在成功共驻之后，如何利用这一位置关系发起跨虚拟机的**侧信道攻击（side-channel attacks）**，以从目标虚拟机中提取信息。
