# 6.1820 移动和传感器计算

## 课程介绍

### 先修课程

6.1800 Computer Systems Engineering

### 课程描述

聚焦“物联网”（IoT）系统与技术，涵盖传感、计算与通信领域。深入探讨移动及传感器计算系统工程中的核心设计与实现问题，课程主题包括：无电池传感器、穿墙感知、机器人传感、生命体征传感（呼吸、心跳、情绪）、汽车与自动驾驶传感、海底物联网、传感器安全、定位技术（含GPS与室内WiFi）、惯性传感（加速度计、陀螺仪、惯性测量单元、航位推算）、嵌入式与分布式系统架构、无线电信号传感、麦克风与摄像头传感、无线传感器网络、传感器移动库与API接口，以及应用案例分析。课程内容结合科研文献阅读、实验作业与重点学期项目。

https://6mobile.github.io/ , 2026



主题包括

- 定位技术：GPS、WIFI，cellular localization

- 无线网络： BLE、WIFI、ZIGBEE、多热点和存储转发
- 资源限制： 功耗、带宽、存储
- 惯性传感：包括加速度计、陀螺仪、IMU、航位推算
- 其他传感： 麦克风，摄像头
- 应用学习+嵌入式硬件和软件架构
- 嵌入式系统安全
- iOS API 访问各种传感和无线网络技术

### 实验

基于switch 

# Lec 1 课程介绍与核心思想

**LEC 1:** Introduction and Key Ideas ([Slides](https://6mobile.github.io/lectures/lec1-slides-2026.pdf))

[lec1.md](./lec1.md)

# Lec 2 物联网定位基础

**LEC 2:** Fundamentals of IoT Localization ([Slides](https://6mobile.github.io/lectures/Lec2-slides-localization-2026.pdf))

**Preparation:** Read [Location-based Services](http://onlinelibrary.wiley.com.libproxy.mit.edu/doi/10.1002/0470092335.ch6/pdf), [Wikipedia: GPS](https://en.wikipedia.org/wiki/Global_Positioning_System) ([Questions](https://6mobile.github.io/questions.html?q=q-lec2))



[lec2.md](./lec2.md)

# Lec 3 GPS

**LEC 3:** Practical Device-based Localization ([Slides](https://6mobile.github.io/lectures/Lec3-slides-localization-2026.pdf))
**Preparation:** Read [Cricket](https://dl.acm.org/doi/pdf/10.1145/345910.345917), [RADAR](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/infocom2000.pdf)

[lec3.md](./lec3.md)

# Lec 4 穿墙感知与无设备定位

**LEC 4:** Seeing through Walls & Device-Free Localization ([Slides](https://6mobile.github.io/lectures/Lec4-slides-DfP-2026.pdf))
**Preparation:** Read [WiTrack](http://witrack.csail.mit.edu/witrack-paper.pdf)



[lec4.md](./lec4.md)

# Lec 5 网络连接技术

Network Connectivity (BLE, low-power WAN, Wi-Fi, cellular, 5G) ([Slides](https://6mobile.github.io/lectures/lec5-slides-connectivity-2026.pdf))
**Preparation:** Read [gps surveillance](https://6mobile.github.io/materials/AirtagsReading.pdf)



[lec5.md](./lec5.md)

# Lec 6 网状网络与多跳无线网络

**LEC 6:** Mesh and Multi-Hop Wireless Networks ([Slides](https://6mobile.github.io/lectures/lec6-ETXMesh-2026.pdf))
**Preparation:** Read [ETX](https://pdos.csail.mit.edu/papers/grid:mobicom03/paper.pdf)

[lec6.md](./lec6.md)

# Lec 7 无电池通信与智慧城市

 Batteryless Connectivity & Smart Cities ([Slides](https://6mobile.github.io/lectures/backscatter-2026.pdf))
**Preparation:** Read [Hacking RFIDs](https://web.cs.ucla.edu/~omid/Papers/Mobicom18a.pdf) and [Caraoke](https://conferences.sigcomm.org/sigcomm/2015/pdf/papers/p297.pdf)
([Questions](https://6mobile.github.io/questions.html?q=q-lec7))



[lec7.md](./lec7.md)

# Lec 8 自动驾驶系统



Self-Driving Cars ([Slides](https://6mobile.github.io/lectures/lecture_10_self_driving_cars_2026_3.pdf))
**Preparation:** Read [Hawkeye: Through Fog High Resolution Imaging Using Millimeter Wave Radar](https://openaccess.thecvf.com/content_CVPR_2020/papers/Guan_Through_Fog_High-Resolution_Imaging_Using_Millimeter_Wave_Radar_CVPR_2020_paper.pdf)
([Questions](https://6mobile.github.io/questions.html?q=q-lec8))

[lec8.md](./lec8.md)

# Lec 9 惯性传感入门与行为识别

 **9:** Intro to Inertial Sensing; Activity Recognition ([Slides](https://6mobile.github.io/lectures/Lec9-slides-inertial-2026.pdf))
**Preparation:** Read [Developments of Inertial Sensing](https://app.knovel.com/kn/resources/kt003T2W98/kpSINTE002/pdf?b-toc-cid=kpSINTE002&b-toc-title=Strapdown Inertial Navigation Technology (2nd Edition)&b-toc-url-slug=fundamental-principles) and [Principles of Inertial Sensing (Section 3.1 and 3.2 only)](https://app.knovel.com/kn/resources/kt003T2WF2/kpSINTE002/pdf?b-toc-cid=kpSINTE002&b-toc-title=Strapdown Inertial Navigation Technology (2nd Edition)&b-toc-url-slug=basic-principles-strapdown)



[lec9.md](./lec9.md)

# Lec 10 路面坑洞检测

- **LEC 10:** Pothole detection([Slides](https://6mobile.github.io/lectures/Lec10-slides-Pothole-2026.pdf))
  **Preparation:** Read [Pothole Patrol](https://dl.acm.org/doi/pdf/10.1145/1378600.1378605)
  ([Questions](https://6mobile.github.io/questions.html?q=q-lec10))



[lec10.md](./lec10.md)

# Lec 11 声学感知攻击

- Attacks on Acoustic Sensing ([Slides](https://6mobile.github.io/lectures/Lec11-slides-backdoor-2026.pdf))
  **Preparation:** Read [BackDoor](https://synrg.csl.illinois.edu/papers/backdoor_mobisys17.pdf)
  ([Questions](https://6mobile.github.io/questions.html?q=q-lec11))



[lec11.md](./lec11.md)

# Lec 12 海洋物联网

- **12:** Ocean IoT
  ([Slides](https://6mobile.github.io/lectures/Lecture-12_Ocean-IoT.pdf))
  **Preparation:** Read [Underwater Backscatter Networking](http://www.mit.edu/~fadel/papers/PAB-paper.pdf) ([Questions](https://6mobile.github.io/questions.html?q=q-lec12))

[lec12.md](./lec12.md)

# Lec 13 农业物联网

- **13:** Agriculture IoT ([Slides](https://6mobile.github.io/lectures/lec13-slides-Farmbeats-2026.pdf))
  **Preparation:** Read [FarmBeats](https://www.usenix.org/system/files/conference/nsdi17/nsdi17-vasisht.pdf)
  ([Questions](https://6mobile.github.io/questions.html?q=q-lec13))

[lec13.md](./lec13.md)

# Lec 14 无线 NeRF（无线信号重建三维场景）

**14:** Wireless NeRFs ([Slides](https://6mobile.github.io/lectures/Lec14_WirelessNerfs.pdf))
**Preparation:** Read [Can NeRFs See without Cameras?](https://arxiv.org/pdf/2505.22441)
([Questions](https://6mobile.github.io/questions.html?q=q-lec14))

[lec14.md](./lec14.md)



# 实验

[Lab 0](https://6mobile.github.io/labs/lab0.html)



[Lab 3](https://6mobile.github.io/labs/lab3.html)
