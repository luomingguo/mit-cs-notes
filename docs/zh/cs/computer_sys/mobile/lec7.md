---
title: '无电池传感与智慧城市（Batteryless Sensing & Smart Cities）'
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 7
kind: system
tags: []
status: complete
---
# Lec 7 无电池传感与智慧城市（*Batteryless Sensing & Smart Cities*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：Hacking RFIDs，Caraoke [MobiSys'13]

## 1. RFID 基础（*Radio-Frequency Identification*）

### 1.1 RFID 分类

::: definition 定义 — RFID 标签类型
按频率：LF（125 kHz，门禁卡）、HF（13.56 MHz，NFC/地铁卡）、UHF（860–960 MHz，超市条码），UHF 读取距离最远（可达 10 m）。

按供电：**主动标签（*Active Tag*）**内置电池，可主动发射；**被动标签（*Passive Tag*）**无电池，从读取器（*Reader*）发射的射频中收集能量后回应。
:::

### 1.2 能量收集与反向散射（*Energy Harvesting & Backscatter*）

被动 RFID 工作原理：

1. 读取器发射连续波（*CW*）
2. 标签的整流电路（*Rectifier*）将射频信号转为直流电
3. 标签控制天线的匹配/失配状态，改变反射系数，调制出数据

$$V_\text{harvested} = \eta \cdot \sqrt{\frac{P_{rx} \cdot Z_A}{2}}$$

其中 $\eta$ 为整流效率，$Z_A$ 为天线阻抗，$P_{rx}$ 为接收功率。

::: theorem 推论 — 反向散射的能效优势
反向散射只需切换天线阻抗，消耗微瓦级功率，而主动发射需毫瓦级功率，差距约 1000 倍，这使被动 RFID 无需电池即可长期工作。
:::

### 1.3 OOK 调制（*On-Off Keying*）

标签通过在两个天线负载状态之间切换实现二进制调制：

$$s(t) = \begin{cases} A \cdot \cos(2\pi f t) & \text{bit = 1（ON）} \\ 0 & \text{bit = 0（OFF）}\end{cases}$$

---

## 2. EPC Gen2 协议与 Slotted Aloha MAC

当多个标签同时存在时，必须解决**读取碰撞**（*Tag Collision*）问题。

::: definition
**定义 — 分时隙 Aloha（*Slotted Aloha*）**

读取器宣布共有 $Q = 2^K$ 个时隙（*Slot*），每个标签随机选择一个时隙回应。若某时隙只有一个标签回应，则读取成功；若多个标签碰撞，本轮不成功，下轮重试。
:::

### 2.1 最优参数

设共有 $N$ 个标签，时隙数 $Q$ 的最优取值：

::: example 例题 — 最优时隙数与效率

:::

当 $Q = N$ 时，Slotted Aloha 的吞吐量（*Throughput*）最高：

$$\text{Throughput} = N \cdot P_\text{success} = N \cdot \frac{1}{Q}\left(1 - \frac{1}{Q}\right)^{N-1}$$

当 $Q = N \to \infty$ 时：

$$\text{Throughput}_\text{max} = N \cdot \frac{1}{N}\left(1 - \frac{1}{N}\right)^{N-1} \to \frac{1}{e} \approx 37\%$$

Sol：即使在最优参数下，Slotted Aloha 的信道利用率上限约为 $1/e \approx 37\%$。

### 2.2 EPC Gen2 动态调整

EPC Gen2 通过 Q 参数动态调整时隙数：若碰撞率高则增大 Q，若空槽率高则减小 Q，趋近最优效率。

---

## 3. Hacking RFIDs：安全视角

**核心问题**：大多数被动 RFID 标签**不具备认证机制**，任何合法读取器均可读出标签 EPC（*Electronic Product Code*）编号。

攻击场景：
- **窃听（*Eavesdropping*）**：读取器到标签的通信功率大，远距离可被截获
- **克隆（*Cloning*）**：读取合法护照/门禁卡的 ID，伪造相同 ID 的标签
- **重放攻击（*Replay Attack*）**：重放已截获的认证序列（若无随机挑战）

**防御方向**：加密、挑战-响应（*Challenge-Response*）协议、法拉第笼屏蔽。

---

## 4. Caraoke：基于 ETC 基础设施的智慧城市

**背景**：E-ZPass（美国电子不停车收费，*Electronic Toll Collection*）的 RFID 读取器已沿高速公路大量部署。

**Caraoke 核心思想**：复用现有 ETC 基础设施，提供新型智慧城市服务，**无需额外部署基础设施**。

### 4.1 可实现的应用

| 应用 | 原理 |
|------|------|
| 交通流量统计 | 计数通过读取器的车辆 |
| 行驶时间估算 | 两个读取器之间的时间差 |
| 道路拥堵检测 | 通过时间差推算车速 |
| 停车场管理 | 读取器部署于停车场入口 |

### 4.2 隐私问题

ETC 读取器会记录车辆 ID 与时间戳，可重建行驶轨迹（*Location Trajectory*），引发严重隐私顾虑。研究者提出使用**假名（*Pseudonyms*）或定期更换 ID** 以降低可追踪性。

::: theorem 推论 — 机会性基础设施复用
Caraoke 的设计哲学是"不重造轮子"——已经铺设好的感知基础设施（ETC 路侧单元）是一种宝贵资源，适当复用可以极低成本提供大量城市感知服务。
:::

---

## 5. 无电池传感技术对比

| 技术 | 能量来源 | 通信距离 | 数据率 |
|------|----------|---------|--------|
| 被动 RFID | RF（读取器）| < 10 m | kbps |
| NFC | RF（读取器）| < 20 cm | kbps |
| 反向散射 Wi-Fi | Wi-Fi AP | < 50 m | Mbps |
| 反向散射 LoRa | 环境 LoRa 信号 | < 1 km | kbps |
| 能量采集 + 超级电容 | 太阳能/振动 | 任意（主动发射）| 任意 |

---

## 本讲小结

被动 RFID 通过反向散射实现无电池通信，EPC Gen2 Slotted Aloha 协议提供多标签并发读取能力（效率上限 37%）；Caraoke 展示了复用已有 ETC 基础设施提供低成本智慧城市服务的思路，同时引出了位置隐私保护这一关键设计挑战。
