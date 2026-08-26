---
title: Web 标准
type: lecture
lecture: 23
tags: []
status: complete
---
# Lec 23 Web 标准

本节关于几个问题的回答？

- 今天的 Web 生态如何形成的？
- Web 技术是如何被制定出来的？
- 你又能够如何参与并做出贡献？

## 今天的 Web 生态如何形成的

1989 年，欧洲核子研究中心（CERN）的顾问 Tim Berners-Lee 基于 SGML 编写的标记语言 IBM Starter Set 进行改造，加入`<a>`标签后将其命名为 HTML 1。同年，他向主管 Mike Sendall 提交了构建万维网的初步方案（下面图是他提案的截图）。

1990 年，他开发了首个浏览器"WorldWideWeb"。该浏览器运行在 NeXT 计算机上——这是款搭载早期 GUI 的高端计算机。

![image-20251017153045715](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017153045715.png)

1991 年， WorldWideWeb 浏览器具有超前特性：它集编辑功能与样式表于一体，却未能成功普及。蒂姆将其核心代码以 C 语言库（libwww）形式开源，这一举措直接催生了后续浏览器的百花齐放。第一个网站(http://info.cern.ch/hy;tertext/www)

![image-20251017153442432](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017153442432.png)

1993 年，CERN 做出了一项可能是有史以来对互联网发展最具影响力的决定：将万维网技术置于公共领域，彻底放弃专利。这一关键决策清除了其商业化的所有障碍，为万维网在全球范围内的自由发展与空前繁荣奠定了基石。

同年，TIM 创立了万维网联盟（W3C），这个国际组织通过快速制定统一技术标准，有力确保了万维网始终朝着开放、普惠的方向发展。与此同时， 美国国家超级计算应用中心（NCSA）发布了 Mosaic 浏览器。该浏览器首创的`<img>`标签彻底改变了网络生态，使其突破学术圈壁垒并迅速占据主导地位，行动代号是 Mozilla。

1994 年， 研究生 Andreessen 重写了 Mosaic 并成立了一家公司，Netscape Navigator 诞生了， 在开发期间，**行动代码： Mozilla**

1994~1996 年期间，这家公司主导了很多创新，同时吸引了非常多人到 Web 领域。这家公司的创新包含但不仅限于：

- JavaScript
- 渐进式渲染
- 框架页（窗口 Tab？）
- Cookie 机制

1995 年，Microsoft 坐不住了， 获取了 NSCA Mosaic 的授权，并将其发布为 **Internet Explorer 1（IE）**， IE 的创新包含但不限于：

- DOM，允许 JS 动态操作网页内容
- `<iframe>`，内联框架
- Ajax（通过 JS 发送 HTTP 请求，而无需刷新页面）
- Web 自定义字体
- 在 IE3 实现了首个功能完善的 CSS 实现

同年， 浏览器大战正式爆发。各大浏览器厂商争相推出“创新”功能，这些连夜赶制的特性既未经过审慎考量，也未提交万维网联盟进行标准化，导致网络技术生态陷入严重的兼容性割裂。

![image-20251017154457430](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017154457430.png)

最终结局：

- CSS 最终成为 W3C 联盟的官方标准，由 IE 实现。
- JSSSS（JavaScript Style Sheets）只在 Netscape Navigator 4 中被实现过，并在 4.8 版本移除
- Netscape 4 为了急于应对，通过一个 CSS 到 JSSS 的转换器来仓促实现 CSS 支持，这导致其 CSS 实现以 Bug 多、速度慢而臭名昭著，这一劣势也加速了 Netscape 浏览器的衰落。

1998 年，**Web 标准计划**（Web Standards Project，WaSP）由一些知名 Web 开发者资助成立，旨在推动浏览器支持 Web 标准，并实现互操作性（interoperability）。

同年， 因无法抗衡 IE 与 Windows 系统的捆绑策略，Netscape 市场急剧萎缩被收购，收购前夕做出关键决断，将浏览器代码全面开源，这批代码资产历经重构后，最终以 Mozilla Firefox 之名重获新生。此次开源催生了 Mozilla 社区。

2001 年，失去竞争压力的 IE 浏览器陷入技术停滞，直至 2007 年才发布新版本。曾于 2001 年堪称顶尖的 IE6，最终沦为全网开发者深恶痛绝的存在，原因之一是：它对 Web 标准和互操作性的支持很差，导致开发者不得不为不同浏览器写大量兼容代码。

随着 Mozilla Firefox 与后续 Google Chrome 的崛起，这两款兼具开源特性与更完善 Web 标准支持的浏览器，成功赢得了开发者社群自发性为其背书推广的拥护浪潮。

![image-20251017155058510](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017155058510.png)

2018 年，IE 浏览器市场份额断崖式下跌。尽管微软持续推出新版本、开展技术布道甚至将其重塑为 Microsoft Edge，仍无法扭转其颓势。微软最终放弃自研引擎，宣布 Edge 浏览器将转向 Chromium 内核。

## Web 技术是如何被制定出来的

标准（standard）或规范（specification，简称 “spec”）是一种文档，它使用精确的语言描述某项技术应该如何工作。

一个好的规范会包含足够详细的内容，使得多个不同的开发方都能够依据该规范实现同一种技术，并最终得到能够互相兼容、可互操作的结果。

![image-20251017155248052](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017155248052.png)

列举互联网技术的标准组织：

- Internet Engineering Task Force（IETF）：负责互联网基础设施的标准制定 负责。 比如 TCP/IP、gzip、IPv6、HTTP
- World Wide Web Consortium（W3C）： CSS、SVG、HTML（过去）、DOM（过去）、很多 JS  API、 WCAG（网页无障碍指南）
- WHATWG（WHATWG）： 成立于 2004 年，成立背景是：对 W3C 过于强调“理论纯粹性的回应
- Ecma International（Ecma）：负责 JavaScript 的核心标准——ECMAScript。因为当初 W3C 拒绝接收 JavaScript 标准化工作

> 实际上，是谁负责写这些文档呢？

工作组（Working Groups）。技术规范通常由利益相关方组成的工作组协作制定，其成员构成包括：

- 互联网巨头企业的代表
- 受邀独立专家
- 负责协调流程的标准组织工作人员

![image-20260509143342473](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260509143342473.png)

> 工作组的如何协作？

工作组中设有若干规范编辑，其职责是将集体达成的共识转化为规范文本。

- 日常来说： 通过 GitHub Issues 或邮件列表进行讨论，这些讨论通常是公开的。

- 周例会（单周或双周）： 召开电话会议

- 每季度： 举行线下面对面会议

![image-20251017155600600](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20251017155600600.png)

> 规范是如何诞生的？

Sol， 标准就像是香肠，最好别看他们是怎么做出来的。

1. 提案

​	一切都始于一个想法（idea）——也就是“提案”（proposal）。

​	三个例子，
​	[一个 Web API 是怎么从想法一路变成标准的](https://github.com/whatwg/html/issues/617)，
​	[应该如何把瀑布流加入 CSS 标准](https://github.com/w3c/csswg-drafts/issues/4650)，
​	[一个换设计的例子——CSS 要不要支持一种新的颜色函数](https://github.com/w3c/csswg-drafts/issues/266)

2. 草案

一旦 WG 接受了某项工作，编辑就会对草案（draft）进行迭代和修改。

- 提案是一个想法，可以比较模糊，也可以根据提出者的经验被描述得比较具体；
- 规范草案则会用正式的规范语言，精确地描述语法和语义

![image-20260509163714691](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260509163714691.png)

> 具体流程是怎么样？

Sol

对于 W3C 工作组来说，一个提案被最终实现经历了：

1. 编辑草案（Editor’s Draft）： 粗略的想法阶段
2. 工作草案：
   - 整个工作组已经同意要推进这个规范，并大致认同 ED 中定义的范围。
   - 通过多轮迭代，从首次公开工作草“发展到最终工作草案
3. 候选推荐标准（Candidate Recommendation，CR）
   - 规范已经准备好进行测试
   - 至少需要 2 个可互操作的实现才能推进
4. 提议推荐标准（Proposed Recommendation，PR）
   - 正在等待咨询委员会批准
5. 正式推荐标准（Recommendation，REC）
   - 已完成状态，进入维护阶段
   - 此后只进行错误修正，不再做实质性修改

测试（Testing）是规范（spec）流程中至关重要的一部分，它用来确保规范是可实现的。实现 与 规范的关系，就像实践与理论的关系一样。

理想流程是， 规范在整个工作组的共同参与下被起草，当它成熟之后，才开始进行实现， 但在实际中，这种流程往往并不会真正按理想方式运行！

有时候，实现会先出现，然后再去写规范，目的是让这项技术变得可互操作。这种做法通常是不被鼓励的，因为它往往会导致 API 的可用性较差，或者存在其他设计问题（为什么会这样？）。

## 我如何参与并做出贡献？

大多数 Web 标准化过程是透明，有开放的流程，有标准文档可以免费阅读，也欢迎欢迎外部贡献。

对于撰写提案）

- 重点关注“问题本身”，而不是你提出的解决方案
- 尽可能多地收集使用场景（use cases）
- 只有在“使用场景足够充分”的情况下才会新增特性，而不是为了抽象上的“理论完整性”而增加功能
- 研究已有的提案

（虽然不是必须的，但可以提高提案被接受的概率）

- 尤其要说明“它应该如何工作”，如果可能的话，用可视化方式展示
- 可以用 JavaScript 实现一个“模拟版本”（polyfill），来证明这个功能是可行的
