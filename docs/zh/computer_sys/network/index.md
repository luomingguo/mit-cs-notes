# 6.5820/6.S04 计算机网络



[官方 currentsemester](https://web.mit.edu/6.829/www/currentsemester/) 不公开

[fall 2020](https://web.mit.edu/6.829/www/2020)

学生笔记：

https://github.com/rcya1/lilypad/tree/9d886a3596521e7950a1c1351c17c9cd5f097c74/src/mit/6.5820

## 先修课程

 6.033 计算机系统工程



## 课程描述www

主题包括网络协议和架构工程与分析，包括设计异构网络的架构原则；传输协议；互联网路由；路由器设计；拥塞控制和网络资源管理；无线网络；网络安全；命名；覆盖网络和P2P网络。阅读资料来自于原始的研究论文。

*H. Balakrishnan*







### 参考书

- 拉里·彼得森 (Larry Peterson) 和布鲁斯·戴维 (Bruce Davie) 撰写的《计算机网络：系统方法》第6版

- 《计算机网络：自顶向下方法》目前已经第8版，是计算机网络领域的“圣经”

- 《计算机网络》Andrew S. Tanenbaum

如果想将计算机网络作为职业方向

- TCP/IP详解：协议
- Unix Network Programming: Networking APIs: Sockets and XTI (Volume 1) by W. Richard Stevens.
- Advanced Programming in the Unix Environment by W. Richard Stevens, Addison-Wesley, 1993.

## 相关课程

[MIT 6.888 Advanced Networking, Spring 2016（停更版） ](https://people.csail.mit.edu/alizadeh/courses/6.888/schedule.html)

[CS 144: Introduction to Computer Networking](https://cs144.github.io/)

[CS 244: Advanced Topics in Networking, Spring 2025 (stanford.edu)](https://web.stanford.edu/class/cs244/)

[UC berkeley, sp23](https://cs268.io/#today)

普林斯顿：

- [COS461, fa21](https://www.cs.princeton.edu/courses/archive/fall21/cos461/)

- [COS 561, SP23](https://cos561.princeton.systems/schedule.html)



## 实验

https://github.com/Great-The-Nate/6.5820-Final-Project

https://github.com/hileamlakB/floodclone/tree/main

https://github.com/markatou/6.829/tree/2e49aedabe10d6c0d4d588c0ff080b36f9210354/6.829_lab1

[Intro to Mininet](https://github.com/mininet/mininet/wiki/Introduction-to-Mininet)

[PSet 1](https://web.mit.edu/6.829/www/2020/psets/pset1/ps1.html)

[PSet 1 Sxolutions](https://web.mit.edu/6.829/www/2020/psets/pset1_solns/ps1_sols_2018.pdf)

[PSet 2](https://web.mit.edu/6.829/www/2020/psets/pset2/ps2.html)

[PSet 3](https://web.mit.edu/6.829/www/2020/psets/pset3/ps3.pdf)

https://github.com/aravic/6.829-pset-3

**斯坦福的实验**

# 组织结构

由于缺乏资料参考，我把课程分成三个模块

## 模块一：互联网架构 & 协议

回答：

- Internet 为什么能够扩展到今天？

- 网络如何高效、公平、稳定地传输数据？

这一部分偏向于 互联网原理 。



## 模块二：Underlay Networks

回答：

- 互联网下面真正运行着什么？

这一部分研究 云的基础设施。



## 模块三：Overlay Networks

回答：

- 互联网之上还能构建哪些系统？

Lec 16 ~ Lec 17

# Lec 1 Internet 架构的演进

阅读资料

- 互联网简史 [A brief history of the internet, 2009](https://web.stanford.edu/class/cs244/papers/L2-brief-history.pdf)，这篇论文被发布了两次，因为其有历史的重要性
- DARPA互联网协议的设计哲学 [The Design Philosophy of the DARPA Internet Protocols, 1988](https://web.stanford.edu/class/cs244/papers/DesignPhilosophyDARPA.pdf)
- 端到端原则 [End-to-End Arguments in System Design](https://web.stanford.edu/class/cs244/papers/End2EndSystemDesign.pdf)



回顾了我们为什么互联网是当下这个样子。

## 总览

- 互联网简史
- DARPA互联网协议的设计哲学
- 端到端原则



[lec1.md](./Internet-Design-Philosophy.md)











# Lec 2 端到端拥塞控制

- V. Jacobson and M. Karels, [Congestion Avoidance and Control](https://web.mit.edu/6.829/www/2020/papers/vanjacobson-congavoid.pdf), expanded version of ACM SIGCOMM 1988 paper.

[lec3.md](./End-to-End-Congestion-Control.md)



# Lec 3 网络辅助拥塞控制



- D. Katabi, M. Handley, and C. Rohrs, [Congestion control for high bandwidth-delay product networks](https://web.mit.edu/6.829/www/2020/papers/xcp.pdf), SIGCOMM 2002. (Read Sections 1-3)
- [PIE Internet RFC](https://tools.ietf.org/html/draft-ietf-aqm-pie-06) (Read Sections 1-4; skim the rest).



[lec4.md](./Network-assisted-Congestion-Control.md)



- 





# Lec 4 现代拥塞控制

阅读资料

- G. Kumar et al., [Swift: Delay is Simple and Effective for Congestion Control in the Datacenter](https://dl.acm.org/doi/pdf/10.1145/3387514.3406591), SIGCOMM 2020.
- **(Optional)** P. Goyal et al., [ABC: A Simple Explicit Congestion Controller for Wireless Networks](http://web.cs.ucla.edu/~ravi/publications/abc_nsdi20.pdf), NSDI 2020. *(Read sections 1-3 and skim the rest.)*

[lec4.md](./Modern-Congestion-Control.md)





# Lec 5 Internet 路由协议 & 架构

阅读资料

- [RFC 1958 - Architectural Principles of the Internet](https://datatracker.ietf.org/doc/html/rfc1958)
- [Autonomous systems and BGP notes](https://web.mit.edu/6.829/www/2020/papers/AS-bgp-notes.pdf)
- Sharon Goldberg, [Why Is It Taking So Long to Secure Internet Routing?](https://queue.acm.org/detail.cfm?id=2668966)

## 总览

- 动态路由协议分类
- AS 自治系统
  - 层次路由

- 域间路由
  - BGP 协议
  - IP任播

- 域内路由
  - RIP
  - OSPF

[lec52.md](./Internet-Routing.md)



# Lec 6 网络测量

Topics

- RTT Measurement
- Delay Estimation
- Clock Synchronization
- Active Measurement
- Passive Measurement

Y. Geng et al., [Exploiting a Natural Network Effect for Scalable, Fine-grained Clock Synchronization](https://www.usenix.org/system/files/conference/nsdi18/nsdi18-geng.pdf), NSDI, 2018.





# Part II Underlay Networks

# Lec 7 数据中心网络

https://web.stanford.edu/class/cs244/papers/al-fares-sigcomm08.pdf

- A Scalable, Commodity Data Center Network Architecture – Al-Fares et al., SIGCOMM 2008
  - Fat-Tree 数据中心网络架构

- A. Greenberg et al., [VL2: A Scalable and Flexible Data Center Network](https://web.mit.edu/6.829/www/2020/papers/vl2.pdf), SIGCOMM 2009.
- **(Optional)** A. Singh et al., [Jupiter Rising: A Decade of Clos Topologies and Centralized Control in Google’s Datacenter Network](https://web.mit.edu/6.829/www/2020/papers/jupiter.pdf), SIGCOMM 2015.



Topics

- Clos
- FatTree
- Spine-Leaf
- ECMP

[lec7.md](./Datacenter-Networks.md)





# Lec 8 广域网

- Chi-Yao Hong et al., [Achieving High Utilization with Software-Driven WAN](https://web.mit.edu/6.829/www/2020/papers/software_defined_wan.pdf), SIGCOMM 2013.
- **(Optional)** S. Jain et al., [B4: Experience with a Globally-Deployed Software Defined WAN](https://web.mit.edu/6.829/www/2020/papers/b4.pdf), SIGCOMM 2013.

Topics

- WAN
- Traffic Engineering
- Centralized Control

[lec6.md](./Wide-Area-Networks.md)



# Lec 9 分布式系统网络

opics

- Distributed ML
- Parameter Server
- AllReduce
- Horovod

 [Networking-for-Distributed-Systems.md](Networking-for-Distributed-Systems.md) 

# Lec 10 SDN

- N. McKeown, T. Anderson, H. Balakrishnan, G. Parulkar, L. Peterson, J. Rexford, S. Shenker, J. Turner [OpenFlow: Enabling Innovation in Campus Networks](https://web.mit.edu/6.829/www/2020/papers/openflow.pdf), SIGCOMM CCR, 2008.
- M. Casado, M-J Freedman, J. Pettit, J. Luo, N. Mckeown, and S. Shenker [Ethane: Taking Control of the Enterprise](https://web.mit.edu/6.829/www/2020/papers/ethane.pdf), SIGCOMM, 2007.

[lec11.md](./Software-Defined-Networking.md)





# Lec 11 可编程数据面

Topics

- Match-Action
- Switch ASIC
- P4



- P. Bosshart et al., [Forwarding Metamorphosis: Fast Programmable Match-Action Processing in Hardware for SDN](https://web.mit.edu/6.829/www/2020/papers/rmt.pdf), SIGCOMM 2013. *(Read the first 4 sections and skim the rest.)*
- P. Bosshart et al., [P4: Programming Protocol-Independent Packet Processors](https://web.mit.edu/6.829/www/2020/papers/p4.pdf), SIGCOMM CCR 2014.

- **(Optional)** A. Sivaraman et al., [Packet Transactions: A Programming Model for Data-Plane Algorithms at Hardware Speed](https://web.mit.edu/6.829/www/2020/papers/domino.pdf), SIGCOMM 2016.

Programmable-Data-Plane



# Lec 12 网络验证

Topics

- Reachability
- Verification
- Network Correctness

- R. Beckett et al., [A General Approach to Network Configuration Verification](https://ratul.org/papers/sigcomm2017-minesweeper.pdf), SIGCOMM 2017
- **(Optional)** [Blog posts](https://netverify.fun/)

 [Network-Verification.md](Network-Verification.md) 



# Lec 13 无线 & 移动网络

Topics

- WiFi
- LTE
- 5G
- Mobility

Topics

- WiFi
- LTE
- 5G
- Mobility

 [Wireless-and-Mobile-Networks.md](Wireless-and-Mobile-Networks.md) 



# Lec 14 优化 & 云网络

Topics

- Optical Network
- Cloud Networking
- Multi-Tenant Network
- Virtual Network

这里以后可以继续扩充。

 [Optical-and-Cloud-Networks.md](Optical-and-Cloud-Networks.md) 







# Part III Overlay Networks

# Lec 15 CDN

- H. Zhang et al., [Live Video Analytics at Scale with Approximation and Delay-Tolerance](https://www.microsoft.com/en-us/research/wp-content/uploads/2017/02/videostorm_nsdi17.pdf)
- **(Optional)** H. Yeo et al., [Neural Adaptive Content-aware Internet Video Delivery](https://www.usenix.org/system/files/osdi18-yeo.pdf)
- [Algorithmic Nuggets in Content Delivery](https://web.mit.edu/6.829/www/currentsemester/papers/cdnalg.pdf)



[lec15.md](./Content-Distribution.md)



# Lec 16 GFW

- Wallbleed: A Memory Disclosure Vulnerability in the Great Firewall of China – Fan et al., NDSS 2025

- How the Great Firewall of China Detects and Blocks Fully Encrypted Traffic – Wu et al., USENIX Security 2023

- A Formal Framework for End-to-End DNS Resolution – Liu et al., SIGCOMM 2023

- [Surveillance and Circumvention](https://web.mit.edu/6.829/www/currentsemester/materials/lecture11.pdf)

 [lec16.md](./GFW.md) 



# Lec 17 流媒体网络

- T-.Y. Huang, R. Johari, N. McKeown, M. Trunnell, and M. Watson [A Buffer-Based Approach to Rate Adaptation: Evidence from a Large Video Streaming Service](https://web.mit.edu/6.829/www/2020/papers/buffer_rate_adap.pdf), SIGCOMM 2014. (Sections 1-3)
- H. Mao, R. Netravali, M. Alizadeh, [Neural Adaptive Video Streaming with Pensieve](https://web.mit.edu/6.829/www/2020/papers/pensieve.pdf), SIGCOMM 2017.

[lec17.md](./Video-Streaming.md)



# Lec 18 P2P网络



- [Chord: A Scalable Peer-to-Peer Lookup Service for Internet Applications](https://web.mit.edu/6.829/www/2020/papers/chord.pdf), SIGCOMM 2001.
- https://web.mit.edu/6.829/www/currentsemester/materials/chord.pdf



[lec18.md](Peer-to-Peer-Networks.md)

# Lec 19 区块链网络

- Satoshi Nakamoto [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf).
- **(Sections 3 and 4)** L. Yang, V. Bagaria, G. Wang, M. Alizadeh, D. Tse, G. Fanti P. Viswanath Prism: Scaling Bitcoin by 10,000x https://arxiv.org/pdf/1909.11261.pdf.
- **(Optional)** Vibhaalakshmi Sivaraman, Shaileshh Bojja Venkatakrishnan, Mohammad Alizadeh, Giulia Fanti, Pramod Viswanath, [Routing Cryptocurrency with the Spider Network](https://web.mit.edu/6.829/www/2020/papers/spider.pdf), HotNets 2018.

 [lec19.md](./Blockchain-Networks.md) 





待分类

Encore: Lightweight Measurement of Web Censorship with Cross-Origin Requests – Burnett and Feamster, SIGCOMM 2015


Why We Don't Know How To Simulate The Internet – Floyd and Paxson, Winter Simulation Conference 1997

ZMap: Fast Internet-wide Scanning and Its Security Applications – Durumeric et al., USENIX Security 2013

Ten Years of ZMap – Durumeric et al., IMC 2024

On the self-similar nature of Ethernet traffic – Leland et al., SIGCOMM 1993



- BBQ: a fast and scalable integer priority queue for hardware packet scheduling – Atre et al., NSDI 2024
- Achieving 100% throughput in an input-queued switch
- High-Speed Switch Scheduling for Local-Area Networks – Anderson et al., ACM Transactions on Computer Systems 1993
- Analysis and simulation of a fair queueing algorithm
