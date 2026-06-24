# Lec 16 防火长城（GFW：审查与规避）

阅读资料

- Fan et al., **Wallbleed: A Memory Disclosure Vulnerability in the Great Firewall of China**, NDSS 2025
- Wu et al., **How the Great Firewall of China Detects and Blocks Fully Encrypted Traffic**, USENIX Security 2023
- Liu et al., **A Formal Framework for End-to-End DNS Resolution**, SIGCOMM 2023
- [Surveillance and Circumvention（讲义）](https://web.mit.edu/6.829/www/currentsemester/materials/lecture11.pdf)

> 本讲把网络当作**审查与对抗审查**的战场：审查者（GFW）是部署在国家级链路上的巨型**中间盒**（[[MiddleBox]]），在路过的流量上做检测与干预；用户用加密/混淆来规避。三篇论文分别从**检测机制**、**实现漏洞**、**DNS 形式化**三个角度切入。

## 总览

- GFW 的基本机制：on-path 注入式审查
- 检测全加密流量（USENIX Sec 2023）：用"看起来太随机"当指纹
- Wallbleed（NDSS 2025）：GFW 自己的内存泄露漏洞
- DNS 的形式化框架（SIGCOMM 2023）
- 规避与军备竞赛

---

## 一、GFW 的基本机制：on-path 注入

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · on-path（旁路）注入式审查</strong><br>
GFW 多为 <strong>on-path</strong>（旁观+注入）而非 <strong>in-path</strong>（串接阻断）：它<strong>复制/镜像</strong>路过的流量做检测，命中规则后<strong>注入伪造分组</strong>来干预——比如向双方注入 <strong>TCP RST</strong> 切断连接，或抢在真实 DNS 应答前<strong>注入伪造 DNS 响应</strong>（DNS 污染）。还会用<strong>主动探测 (active probing)</strong>：发现疑似代理服务器后主动连它、验证它是不是翻墙工具，再封禁。
</div>

旁路注入的特点：审查者不必拦下原包（速度快、易扩展），靠"抢答/插入"取胜；这也意味着真实应答可能也会到达，形成竞速。

## 二、检测全加密流量（USENIX Security 2023）

为躲开 DPI（深度包检测），Shadowsocks/VMess 等代理把整条连接做成**全加密**——字节流看起来像**均匀随机**，没有任何明文协议特征。GFW 反过来利用了这一点。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · "看起来太随机"本身就是指纹</strong><br>
正常协议（HTTP、TLS 握手等）在头部有大量可识别结构/可打印字符；而全加密代理的首包近似随机比特。GFW 用一组<strong>基于熵/字节分布的启发式</strong>判断一条连接"是不是随机得不像任何已知协议"，是则<strong>实时阻断</strong>。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 论文逆向出的判定规则与启示</strong><br>
作者通过大量主动测量<strong>逆向出 GFW 的具体判定逻辑</strong>：它对连接<strong>首部字节</strong>算可打印 ASCII 占比、随机性等指标，并设若干<strong>豁免规则 (exemptions)</strong>（比如可打印字符够多、或含常见协议特征就放行）以减少误伤正常流量。<strong>核心启示</strong>：把流量伪装成"纯随机"反而成了独特指纹——更稳健的规避是<strong>模仿一个真实存在的常见协议</strong>（如真 TLS），而不是追求"无特征"。这是审查与规避之间"特征 vs 拟态"的根本张力。
</div>

## 三、Wallbleed（NDSS 2025）：GFW 自己的内存泄露漏洞

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 类 Heartbleed 的越界读</strong><br>
GFW 的 <strong>DNS 注入子系统</strong>在解析触发审查的 DNS 查询时存在<strong>越界内存读 (out-of-bounds read)</strong>：构造特制的畸形 DNS 查询，能让 GFW 在它<strong>注入的伪造 DNS 响应</strong>里<strong>附带泄露自己进程内存的片段</strong>——就像 Heartbleed 之于 OpenSSL，只不过受害者是一台<strong>国家级审查中间盒</strong>。
</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 为什么重要</strong><br>
它让外部研究者得以<strong>窥见 GFW 的内部运行状态</strong>（内存内容），既是难得的"把审查者本身当研究对象"的窗口，也再次印证：<strong>审查基础设施本身就是大型软件，同样有内存安全 bug</strong>（呼应 [[../6.1810 Operating System Engineering/lec2|内存安全]] 的越界读一类问题）。把巨型中间盒部署在关键链路上，其自身漏洞的影响面也是国家级的。
</div>

## 四、DNS 的形式化框架（SIGCOMM 2023）

DNS 解析（递归解析、委派、缓存）的实际行为极其复杂、易因配置/实现差异产生分歧，而审查（DNS 污染）正发生在这个层面。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 0.6em 1em; margin: 1em 0;">
<strong>定义 · 端到端 DNS 解析的形式化模型</strong><br>
论文给 DNS 的<strong>端到端解析过程</strong>建立一个<strong>形式化模型</strong>：精确刻画递归解析器如何沿委派链查询、如何处理记录与缓存，从而可以<strong>严格推理/验证</strong> DNS 在各种配置下的行为是否正确、不同实现是否一致。
</div>

> 与 [[Network-Verification]] 的 Minesweeper 一脉相承——都是"给网络行为建数学模型、用形式化方法推理正确性"，只是对象从路由配置换成了 DNS 解析。在审查语境下，这种形式化也有助于理解 DNS 注入/污染如何与正常解析交互。

## 五、规避与军备竞赛

- **加密/混淆**：把流量加密（但要避免"太随机"这个指纹，见 §2）；
- **拟态 (mimicry)**：把代理流量伪装成真实常见协议（真 TLS、QUIC 等）；
- **域前置 (domain fronting)**：把被禁域名藏在一个大厂可信域名的 TLS SNI/Host 之后（已被多数 CDN 封堵）；
- **主动探测对抗**：让代理服务器对未授权探测"装哑/装成正常服务"，躲过 active probing。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 0.6em 1em; margin: 1em 0;">
<strong>推论 · 这是一场持续的军备竞赛</strong><br>
审查方升级检测（熵指纹、主动探测、SNI 过滤），规避方升级拟态（模仿真协议、随机化握手、可插拔传输）。没有一劳永逸的解，双方围绕"可识别特征"反复博弈——理解 GFW 的<strong>检测机制与实现细节</strong>（如 §2 逆向、§3 漏洞）正是设计有效规避的前提。
</div>

## 本讲小结

> GFW 是国家级 on-path 中间盒，靠**注入**（RST、伪造 DNS）+ 主动探测实施审查。**全加密流量检测**（USENIX'23）揭示"看起来太随机"反成指纹，启示规避应**拟态真协议**而非追求无特征；**Wallbleed**（NDSS'25）发现 GFW DNS 注入子系统的 Heartbleed 式越界读，让外界得以窥探其内存；**DNS 形式化框架**（SIGCOMM'23）给端到端解析建模以严格推理其行为。整体是一场围绕"可识别特征"的检测↔规避军备竞赛。
