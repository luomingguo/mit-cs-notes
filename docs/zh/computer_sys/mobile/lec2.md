---
title: 物联网定位基础（Fundamentals of IoT Localization）
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 2
kind: system
tags: []
status: complete
---
# Lec 2 物联网定位基础（*Fundamentals of IoT Localization*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing

## 1. 课程目标

本讲及后续两讲共同构成「无线定位与感知」系列，目标：
1. 无线定位的统一原理是什么？
2. GPS、Wi-Fi、蓝牙、声学测距等系统如何工作？
3. 什么是无线感知（*Wireless Sensing*）？
4. 行业机遇与社会影响？

---

## 2. 为什么需要定位？

::: definition
**定义 — 无线定位（*Wireless Positioning / Localization*）**

利用无线信号获取人或物体位置的过程。
:::

**应用场景**：
- 室内外导航（博物馆、商场导览）
- 基于位置的服务（广告、提醒）
- 虚拟现实与动作捕捉（*Motion Capture*）
- 行为分析（健康、活动识别）
- 资产追踪（钥匙、货物）
- 安全访问控制
- 接触追踪（*Contact Tracing*，蓝牙）

**GPS 的局限**：
- 室内信号衰减 → 信噪比（*SNR*）下降
- 城市峡谷多径（*Multipath*）→ 定位错误
- GPS 在室内无法使用，需要替代方案

---

## 3. 定位模式分类

::: definition
**定义 — 基于设备定位（*Device-based Localization*）**
设备本身利用来自锚点（*Anchor*）的信号，自行计算位置。例：GPS 接收机。
:::

::: definition
**定义 — 基于网络定位（*Network-based Localization*）**
锚点/接入点利用设备发出的信号，在网络侧计算设备位置。例：雷达、蜂窝基站定位。
:::

---

## 4. 六种核心定位技术（由简到繁）

### 方法 1：基于身份（*Identity-based Localization*）

**思路**：已知各锚点位置，信号来自哪个锚点，设备就在哪个位置附近。

::: example 例题
战时驾车记录（*War-driving*）
:::

扫描周边 Wi-Fi 接入点 ID，对应已知位置数据库，即可粗略定位。A-GPS 也利用此原理加速首次定位。

**优点**：实现简单；**缺点**：精度受锚点密度限制。

---

### 方法 2：接收信号强度（*RSSI, Received Signal Strength Indicator*）

**思路**：信号功率随距离衰减，测量功率 → 推算距离 → 三边测量（*Trilateration*）。

$$P_r \propto \frac{1}{d^2}$$

由功率到距离：

$$d = \sqrt{\frac{P_t \cdot G_t \cdot G_r \cdot \lambda^2}{(4\pi)^2 \cdot P_r}}$$

::: theorem 推论
RSSI 三边测量精度局限：远距离时功率对距离的变化极小，微小功率测量误差造成巨大距离偏差。
:::

**核心问题：多径（*Multipath*）**  
无线信号经墙壁、家具反射，产生相长/相消干涉（*Constructive/Destructive Interference*），导致 RSSI 波动。

**解决方案：指纹匹配（*Fingerprinting*）**  
预先记录每个位置的信号强度「指纹」，定位时与数据库比对最近邻（*Nearest Neighbor*）。

---

### 方法 3：信号相位（*Phase*）

**思路**：信号传播距离 $d$ 对应相位旋转：

$$\phi = \frac{2\pi d}{\lambda}$$

**优点**：相位分辨率高（毫米级）；**缺点**：相位有周期性模糊（*Phase Ambiguity*），需配合其他技术解模糊。

---

### 方法 4：到达角（*AoA, Angle of Arrival*）

**思路**：多天线阵列测量信号到达角度，利用三角测量（*Triangulation*）定位。

$$\theta = \arcsin\!\left(\frac{\Delta\phi \cdot \lambda}{2\pi \cdot d_{ant}}\right)$$

其中 $d_{ant}$ 为天线间距，$\Delta\phi$ 为相邻天线的相位差。

---

### 方法 5：飞行时间（*ToF, Time of Flight*）

**思路**：测量信号从发射到接收的传播时延，乘以光速得到距离：

$$d = \Delta t \times c$$

多锚点则用三边测量确定位置。

**难点**：发射方与接收方需高精度时钟同步。

---

### 方法 6：到达时间差（*TDoA, Time Difference of Arrival*）

**思路**：不需要绝对时钟，只需测量到达不同锚点的时间**差**，每对锚点对应一条双曲线，多条双曲线的交点即位置。

$$d_1 - d_2 = \Delta t_{12} \times c \quad \Rightarrow \quad \text{双曲线}$$

---

## 5. 技术对比

| 技术 | 精度 | 优点 | 缺点 |
|------|------|------|------|
| 身份匹配 | 房间级 | 简单 | 粗糙 |
| RSSI | 1–5 m | 无需改动硬件 | 多径干扰 |
| 相位 | cm 级 | 高精度 | 模糊问题 |
| AoA | 角度精度高 | 不需时钟同步 | 需多天线 |
| ToF | dm 级 | 直接测距 | 需时钟同步 |
| TDoA | dm 级 | 不需同步发射 | 需同步接收 |

---

## 6. 前沿技术方向

最先进的定位系统往往是多技术融合：
- AoA + ToF 联合估计
- 环形天线 + 惯性传感（*Inertial Sensing*）融合
- 合成孔径雷达（*Synthetic Aperture Radar*）+ 动态时间规整（*DTW*）
- 多频率综合（*Multi-frequency Synthesis*）

---

## 本讲小结

$$\text{定位精度：身份匹配} < \text{RSSI} < \text{ToF/TDoA} < \text{相位/AoA（融合）}$$

六种技术在精度、复杂度、基础设施需求上各有权衡；现实系统往往根据场景选择最合适的组合。
