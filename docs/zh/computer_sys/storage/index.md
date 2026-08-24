---
title: 18-746 存储系统
course: 18-746 存储系统
course_id: '18-746'
kind: system
tags: []
status: complete
---
# 18-746 存储系统

[18-746 Storage Systems (Fall 2022): Syllabus (cmu.edu)](https://course.ece.cmu.edu/~ece746/old/fall22/schedule.html)

[18-746 Storage Systems (Fall 2025): Syllabus (cmu.edu)](https://course.ece.cmu.edu/~ece746/readinglist.html)

## 课程描述

存储系统是计算机系统中最迷人且最重要的部分之一。它们往往主导着系统的性能，而其他组件的故障通常通过从存储的数据中重新启动来解决。实际上，存储系统保存着大多数组织的“皇冠上的宝石”：它们的信息（从源代码到微软的软件，再到每个电子商务网站的销售数据库，以及推动大数据和机器学习革命的日志和索引）。在这一关键的计算机系统领域中，对优秀人才和更好解决方案的需求持续增长。

本课程涵盖了存储系统的设计、实现和使用，从单个存储设备的特性和操作到将它们与服务器和大规模分布式系统结合并使其发挥作用的操作系统、数据库和网络方法。在此过程中，我们将研究多个真实系统的案例研究、重要应用对存储系统的需求，以及趋势和新兴技术对未来存储系统的影响。

## 课程内容

1. 概述 & Flash SSD 操作
2. 磁盘驱动操作
3. 文件系统存储布局
4. 缓存与文件系统完整性
5. 磁盘阵列组织
6. 数据中心 NAND 闪存 SSD 的当前和未来角色
7. 分布式文件系统和 NAS 接口
8. 软硬件协同设计扩展全闪存存储
9. 极度可扩展的存储
10. 可靠性增强技术
11. 可扩展表存储
12. 谷歌文件系统的演变
13. 备份和数据保护
14. LSM 树及其应用
15. Azure HPC Cache and vFXT

## 实验

https://github.com/Guo-lab/CloudFS_Design

https://github.com/Ishant89/CloudFS

# Lec 1 概述 & Flash SSD 操作 I

- Amvrosiadis, George and Ganger, Greg
  [*18-746/15-746 Course Syllabus*](https://course.ece.cmu.edu/~ece746/papers//Syllabus.pdf)
- Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau
  [*Operating Systems: Three Easy Pieces*](http://pages.cs.wisc.edu/~remzi/OSTEP/file-ssd.pdf)
- Agrawal, Nitin and Prabhakaran, Vijayan and Wobber, Ted and Davis, John D. and Manasse, Mark and Panigrahy, Rina
  [*Design Tradeoffs for SSD Performance*](http://www.usenix.org/legacy/events/usenix08/tech/full_papers/agrawal/agrawal.pdf)
  In *USENIX 2008 Annual Technical Conference*, 2008, pages 57--70
- Hennessy, John L. and Patterson, David A.
  [*Computer Architecture: A Quantitative Approach*](https://course.ece.cmu.edu/~ece746/papers//textbook_chapters/Hennessy_Patterson-A_Quantitative_Approach_Sections_77_78_79.pdf)
- Mor Harchol-Balter
  [*Probability Refresher*](https://course.ece.cmu.edu/~ece746/papers//other/Balter-Probability_Refresher.pdf)

[lec1.md](./lec1.md)

# Lec 2 Flash SSD 操作 II

- He, Jun and Kannan, Sudarsun and Arpaci-Dusseau, Andrea C. and Arpaci-Dusseau, Remzi H.
  [*The Unwritten Contract of Solid State Drives*](http://dl.acm.org/citation.cfm?id=3064187)
  In *Proceedings of the Twelfth European Conference on Computer Systems*, 2017, pages 127--144
- Mogul, Jeffrey C. and Argollo, Eduardo and Shah, Mehul and Faraboschi, Paolo
  [*Operating System Support for NVM+DRAM Hybrid Main Memory*](http://www.usenix.org/event/hotos09/tech/full_papers/mogul/mogul.pdf)
  In *Proceedings of the 12th Conference on Hot Topics in Operating Systems*, 2009, pages 14--14
- Sara McAllister and Yucong Sherry Wang and Benjamin Berg and Daniel S. Berger and George Amvrosiadis and Nathan Beckmann and Gregory R. Ganger
  [*FairyWREN: A Sustainable Cache for Emerging Write-Read-Erase Flash Interfaces*](https://www.usenix.org/system/files/osdi24-mcallister.pdf)

[lec2.md](./lec2.md)

# Lec 3 磁盘驱动操作

[lec3.md](./lec3.md)

# Lec 4: 文件系统存储布局

- [*The Design and Implementation of the 4.4BSD Operating System*](https://course.ece.cmu.edu/~ece746/papers//textbook_chapters/McKusick-The_Design_and_Implementation_of_the_4.4BSD_Operating_System_Chapter_8.pdf)
- [*Operating Systems: Three Easy Pieces*](http://pages.cs.wisc.edu/~remzi/OSTEP/file-implementation.pdf)
- [*BTRFS: The Linux B-Tree Filesystem, 13*](http://vtucs.com/wp-content/uploads/2015/02/btree-report.pdf)
  -
- [*F2FS: A New File System for Flash Storage,15*](https://www.usenix.org/conference/fast15/technical-sessions/presentation/lee)
  - 专门为闪存设计的文件系统
- [*TABLEFS: Enhancing Metadata Efficiency in the Local File System, 13*](https://www.pdl.cmu.edu/PDL-FTP/FS/CMU-PDL-13-102.pdf)
  - 把“文件系统的元数据”存进一个 KV 存储（类似数据库）里

[lec4.md](./lec4.md)

# Lec 5: 文件系统的组织

- Vahalia, Uresh
  [*UNIX Internals: The New Frontiers*](https://course.ece.cmu.edu/~ece746/papers//textbook_chapters/Vahalia-UNIX_Internals_The_New_Frontiers_Chapter_8.pdf)
- Giampaolo, Dominic
  [*Practical File System Design with the Be File System*](https://course.ece.cmu.edu/~ece746/papers//textbook_chapters/Giampaolo-Practical_File_System_Design_with_the_Be_File_System_Chapter_2.pdf)
- Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau
  [*Operating Systems: Three Easy Pieces*](http://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf)

[lec5.md](./lec5.md)

# Lec 6 文件系统组织：缓存和文件系统集成

- Ganger, Gregory R. and McKusick, Marshall Kirk and Soules, Craig A. N. and Patt, Yale N.
  [*Soft Updates: A Solution to the Metadata Update Problem in File Systems*](https://course.ece.cmu.edu/~ece746/papers//papers/Ganger_2000-Gregory_R._Ganger_and_Marshall_Kirk_McKusick_and_Craig_A._N._Soules_and_Yale_N._Patt-Soft_Updates:_A_Solution_to_the_Metadata_Update_Problem_in_File_Systems.pdf)
  In *ACM Trans. Comput. Syst.*, May 2000, pages 127--153
-  Giampaolo, Dominic
  [*Practical File System Design with the Be File System*](https://course.ece.cmu.edu/~ece746/papers//textbook_chapters/Giampaolo-Practical_File_System_Design_with_the_Be_File_System_Chapter_7.pdf)
- Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau
  [*Operating Systems: Three Easy Pieces*](http://pages.cs.wisc.edu/~remzi/OSTEP/file-journaling.pdf)
- Fryer, Daniel and Sun, Kuei and Mahmood, Rahat and Cheng, TingHao and Benjamin, Shaun and Goel, Ashvin and Brown, Angela Demke
  [*Recon: Verifying File System Consistency at Runtime*](https://course.ece.cmu.edu/~ece746/papers//papers/Fryer.pdf)
  In *Proceedings of the 10th USENIX Conference on File and Storage Technologies*, 2012, pages 7--7

[lec6.md](./lec6.md)

# Lec 7 缓存和文件系统集成

[lec7.md](./lec7.md)

# Lec 8 磁盘阵列组织

- [*Operating Systems: Three Easy Pieces, CH38-RAIDs*](http://pages.cs.wisc.edu/~remzi/OSTEP/file-raid.pdf)

- [*RAID: High-performance, Reliable Secondary Storage, 1994*](lec9-RAID-High-performance, Reliable Secondary Storage.pdf)
- [*Disk Failures in the Real World: What Does an MTTF of 1,000,000 Hours Mean to You?*](./lec8-Disk Failures in the Real World- What Does an MTTF of 1,000,000 Hours Mean to You?.pdf)
- [*Flash Reliability in Production: The Expected and the Unexpected, fast16*](./lec8-Flash Reliability in Production- The Expected and the Unexpected.pdf)

[lec8.md](./lec8.md)

# Lec 9 磁盘阵列系统

- [*RAID: High-performance, Reliable Secondary Storage, 1994*](lec9-RAID-High-performance, Reliable Secondary Storage.pdf)
- [*System Impacts of Storage Trends: Hard Errors and Testability, 2011*](./lec9-System Impacts of Storage Trends- Hard Errors and Testability.pdf)
- [*Mean Time to Meaningless: MTTDL, Markov Models, and Storage System Reliability, 2010*](./lec9-Mean Time to Meaningless- MTTDL, Markov Models, and Storage System Reliability.pdf)
- [*Parity Lost and Parity Regained*](https://www.usenix.org/legacy/events/fast08/tech/full_papers/krioukov/krioukov.pdf)

[lec9.md](./lec9.md)

# Lec 10 分布式 FS & NAS 接口

- The Design and Implementation of the 4.4BSD Operating System, CHAPTER 9
- [*Scale and Performance in a Distributed File System, 1988*](https://scispace.com/pdf/scale-and-performance-in-a-distributed-file-system-41h9xbvkhz.pdf)
- [*Operating Systems: Three Easy Pieces, CH48——Distributed System*](http://pages.cs.wisc.edu/~remzi/OSTEP/dist-intro.pdf)
- [*Operating Systems: Three Easy Pieces, CH49——NFS*](http://pages.cs.wisc.edu/~remzi/OSTEP/dist-nfs.pdf)
- [*Operating Systems: Three Easy Pieces, CH50——AFS*](http://pages.cs.wisc.edu/~remzi/OSTEP/dist-afs.pdf)
- [*RFC 1813 —— NFS Version 3 Protocol Specification*](http://www.faqs.org/rfcs/rfc1813.html)

[lec10.md](./lec10.md)

# Lec 11 多服务器分布式文件系统

[GFS]()

[PACEMAKER: Avoiding HeART attacks in storage clusters with disk-adaptive redundancy, 2020](https://www.pdl.cmu.edu/PDL-FTP/Storage/kadekodi-osdi20-final310_abs.shtml)

[lec11.md](./lec11.md)

# Lec 12 Extremely scalable storage

[GFS]()

[lec12.md](./lec12.md)

'\

'

# Lec 13 加强可靠性技术

- [*Architectures and Algorithms for On-line Failure Recovery in Redundant Disk Arrays'94*](http://www.pdl.cmu.edu/PDL-FTP/Declustering/DAPD.abstract.shtml)
- [*Scalable Performance of the Panasas Parallel File System'08*](https://www.cs.cmu.edu/~garth/papers/welch-fast08.pdf)
- [Tiger: Disk-Adaptive Redundancy  Without Placement Restrictions'22](https://www.usenix.org/system/files/osdi22-kadekodi.pdf)

[lec13.md](./lec13.md)

# Lec 14 可扩展的表存储

- [*Bigtable: A Distributed Storage System for Structured Data, osdi'06*](https://course.ece.cmu.edu/~ece746/papers//papers/chang06.pdf)
- [*Spanner: Google's Globally-Distributed Database, osdi'12*](https://course.ece.cmu.edu/~ece746/papers//papers/spanner.pdf)
- [*MapReduce: Simplified Data Processing on Large Clusters, osdi'04*](https://research.google/pubs/pub62/)
- [The Chubby lock service for loosely-coupled distributed systems'06](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)

[lec14.md](./lec14.md)

# Lec 15 备份和数据保护

- [*Designing for Disasters*](https://www.usenix.org/legacy/publications/library/proceedings/fast04/tech/full_papers/keeton/keeton.pdf)
- [*Getting Back Up: Understanding How Enterprise Data Backups Fail, 16*](https://www.usenix.org/system/files/conference/atc16/atc16_paper-amvrosiadis.pdf)

[lec15.md](./lec15.md)

# Lec 16 LSM 树及其应用

- [LSM-Tree](https://www.cs.umb.edu/~poneil/lsmtree.pdf)
- [Ren13](https://course.ece.cmu.edu/~ece746/papers//papers/tablefs.pdf),
- [Zheng20](https://course.ece.cmu.edu/~ece746/papers//papers/deltafs-imds.pdf)

[lec16.md](./lec16.md)

# Lec 17 Google 文件系统革新

- [*The Tail at Scale, 2013*](https://www.barroso.org/publications/TheTailAtScale.pdf)
- [Using the CAS Standards in Assessment Projects, 2013](./lec17-Using the CAS Standards in Assessment Projects.pdf)

[lec17.md](./lec17.md)
