---
title: 课程介绍与核心思想
type: lecture
lecture: 1
tags: []
status: complete
---
# Lec 1 课程介绍与核心思想
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing (IoT Systems)

## 1. 课程定位

本课程全称为 *Mobile and Sensor Computing*，俗称 *IoT Systems*，聚焦三大主题：
- **基础原理（Fundamentals）**：无线感知、定位、连接、能源等核心技术
- **应用（Applications）**：精准农业、海洋物联网、自动驾驶、医疗健康
- **未来方向**：*Spatial AI* 与 *Physical AI*

---

## 2. 什么是物联网？

::: definition
**定义 — 物联网（*Internet of Things, IoT*）**
微型传感、计算与通信技术的融合，使系统能够：

- 从环境中**采集（Sense）**数据

- 在设备本地**预处理（Edge Computing）**

- 将数据上传至**云端（Cloud）**

- 从数据中提取洞见并对环境**施加控制（Actuate）**
:::

---

## 3. IoT 系统的四个设计维度

IoT 系统围绕以下四个维度展开设计：

```text
                ┌──────────────────────────────┐
                │    Sensing Tasks & Modalities │  ← WHAT to sense, HOW
                │    Computation               │  ← HOW to process
                │    Connectivity              │  ← HOW to transmit
                │    Power/Energy              │  ← HOW to power
                └──────────────────────────────┘
```

### 3.1 感知任务与模态（*Sensing Tasks & Modalities*）

| 感知模态 | 例子 |
|---------|------|
| 无线电（*Radio*）| GPS、WiFi、毫米波雷达 |
| 声学/超声（*Acoustic/Ultrasonic*）| Cricket 定位系统 |
| 惯性（*Inertial*）| 加速度计、陀螺仪 |
| 视觉（*Visual*）| 摄像头、LiDAR |

感知任务涵盖：位置（*Location*）、健康（*Health*）、活动（*Activity*）、环境（*Environment*）、车辆（*Vehicles*）。

### 3.2 计算（*Computation*）

- **编程模型**：嵌入式、移动端、边缘/云端
- **数据管理**：存储、查询
- **信号处理与机器学习**：数字化、推理
- **安全与隐私**：数字与模拟安全

### 3.3 连接（*Connectivity*）

以三维设计空间描述：

$$\text{设计空间} = f(\text{通信距离},\ \text{数据速率},\ \text{电池寿命})$$

| 技术 | 距离 | 数据率 | 电池寿命 |
|------|------|--------|---------|
| Wi-Fi | 楼内 | GB/天 | 需供电 |
| LTE/5G | 数英里 | GB/天 | 需供电 |
| BLE | 房间级 | MB/天 | 月~年 |
| LoRaWAN | 数英里 | 字节/天 | 年级 |

### 3.4 能源（*Power/Energy*）

::: definition
**定义 — 能量收集（*Energy Harvesting*）**
从环境中获取能量（太阳能、振动、人体活动、RF 辐射等），实现无需更换电池的长期部署。
:::

供电方式：① 电网供电  ② 可充电/一次性电池  ③ 能量收集（太阳能、无线能量传输等）

---

## 4. 课程涵盖的系统实例

| 系统 | 功能 |
|------|------|
| Cricket（2001/2003）| 室内精确定位 |
| WiTrack（2014）| 无设备穿墙定位 |
| RF-Capture（2015）| 穿墙人体轮廓捕获 |
| Vital-Radio（2015）| 无线呼吸心跳监测 |
| BackDoor | 不可听语音命令攻击 |
| Hawkeye（CVPR'22）| AI 雷达透雾成像 |
| 精准农业系统 | 端到端 IoT 农业应用 |
| 水下 IoT | 海洋物联网 |

::: example
**例题 — 自动驾驶（*Self-Driving Cars*）在雾天的挑战**
:::

摄像头在雾天失效；毫米波雷达（*Millimeter-Wave Radar*）不受天气影响，但传统雷达分辨率低。Hawkeye 系统利用 AI 将雷达点云转化为高分辨率图像，实现恶劣天气下的感知。

---

## 5. 为什么海洋值得关注？

- 海洋储存地球 **>90%** 的热量
- 海洋吸收地球 **>93%** 的 CO₂
- **>95%** 的海洋从未被直接观测过

→ 海洋 IoT（水下网络、水下反向散射）是本课程的重要新兴方向。

---

## 6. 关键问题（课程贯穿思考）

1. IoT 设备通常具备哪些能力？（感知、计算、通信）
2. 如何在能耗、距离、数据率之间权衡？
3. 如何利用无线信号感知物理世界？
4. 如何在没有基础设施的环境中部署 IoT？

---

## 本讲小结

> **IoT = 传感 + 计算 + 连接 + 能源**，四个维度的协同设计决定系统的可行性与效果。感知是物理世界与数字世界之间的桥梁。
