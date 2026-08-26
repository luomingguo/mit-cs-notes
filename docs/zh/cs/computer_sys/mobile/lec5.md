---
title: 网络连接（Network Connectivity）：BLE 与低功耗广域网
type: lecture
lecture: 5
tags: []
status: complete
---
# Lec 5 网络连接（*Network Connectivity*）：BLE 与低功耗广域网

> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：AirTags 与 BLE 安全性分析

## 1. 连接设计空间概览

IoT 设备的连接选择受制于三个关键约束：

| 约束                | 说明             |
| ------------------- | ---------------- |
| 带宽（*Bandwidth*） | 每秒可传多少数据 |
| 覆盖范围（*Range*） | 有效通信距离     |
| 功耗（*Power*）     | 电池寿命         |

::: definition 定义 — 三角困境
带宽、覆盖范围、功耗三者相互制约，无法同时最优。Wi-Fi 带宽大但耗电；LoRaWAN 覆盖远且省电但带宽极小；BLE 介于中间。
:::

---

## 2. 蓝牙低功耗（*BLE, Bluetooth Low Energy*）

### 2.1 两种操作模式

| 模式                           | 用途                          | 连接 |
| ------------------------------ | ----------------------------- | ---- |
| 广播模式（*Advertising Mode*） | 广播自身存在（AirTags、信标） | 单向 |
| 连接模式（*Connected Mode*）   | 双向数据传输（耳机、手环）    | 双向 |

### 2.2 广播机制

BLE 在 3 个广播信道（37、38、39 频道，避开 Wi-Fi 中心频段）上循环广播：

$$T_\text{adv interval} \in [20\text{ ms},\; 10.24\text{ s}]$$

较长的广播间隔 → 更省电，但设备被发现的延迟更大。

### 2.3 连接模式参数

建立连接后，双方以**连接间隔**（*Connection Interval*）$T_{CI}$ 交替通信：

$$T_{CI} \in [7.5\text{ ms},\; 4\text{ s}]$$

**占空比（*Duty Cycle*）**：

$$\text{Duty Cycle} = \frac{T_\text{active}}{T_{CI}}$$

当 $T_{CI} = 1\text{ s}$，活动时间约 1 ms 时，占空比 = 0.1%，极度省电。

### 2.4 电池寿命计算

::: example 例题 — AirTag 电池寿命估算

:::

已知：

- 电池容量：$Q = 1000\text{ mAh}$
- 发射时电流：$I_{tx} = 15\text{ mA}$
- 睡眠时电流：$I_{sleep} = 1\;\mu\text{A} = 0.001\text{ mA}$
- 连接间隔：$T_{CI} = 1\text{ s}$，活动时间：$T_{active} = 1\text{ ms}$

平均电流：

$$I_{avg} = I_{tx} \cdot \frac{T_{active}}{T_{CI}} + I_{sleep} \cdot \left(1 - \frac{T_{active}}{T_{CI}}\right)$$

$$= 15 \times 0.001 + 0.001 \times 0.999 \approx 0.015 + 0.001 = 0.016\text{ mA}$$

电池寿命：

$$t = \frac{Q}{I_{avg}} = \frac{1000\text{ mAh}}{0.016\text{ mA}} \approx 62500\text{ h} \approx 7.1\text{ 年}$$

Sol：约 7 年，实际 AirTag 官方标称约 1 年（因为还有 UWB 定位、通知响应等额外功耗）。

::: theorem 推论 — 占空比是低功耗的核心武器
将占空比从 100% 降至 0.1% 可使平均功耗降低约 1000 倍，这是 BLE 能以纽扣电池运行数年的根本原因。
:::

---

## 3. LoRaWAN — 长距离低功耗广域网

::: definition
**定义 — LoRa（*Long Range*）**

使用扩频调制（*Chirp Spread Spectrum, CSS*），以极低功耗实现 2–15 km 传输距离，代价是极低的数据速率（数百 bps）和有限的每日数据量。
:::

### 3.1 核心参数

| 参数         | 数值                        |
| ------------ | --------------------------- |
| 覆盖范围     | 2–15 km（城市/农村）        |
| 数据速率     | 0.3–50 kbps                 |
| 每日传输限制 | 约 30–100 字节/天（受监管） |
| 典型应用     | 农业传感器、智慧城市抄表    |

### 3.2 扩频增益

扩频因子（*Spreading Factor, SF*）控制信噪比与速率的权衡：

$$\text{数据速率} \propto \frac{1}{2^{SF}}$$

SF = 7 → 高速率，覆盖近；SF = 12 → 低速率，覆盖极远（处理增益 $\approx 30\text{ dB}$）。

---

## 4. 设计空间对比

| 技术    | 范围   | 数据率    | 功耗 | 典型应用       |
| ------- | ------ | --------- | ---- | -------------- |
| Wi-Fi   | ~100 m | ~100 Mbps | 高   | 流媒体、云同步 |
| BLE     | ~10 m  | ~1 Mbps   | 低   | 可穿戴、AirTag |
| Zigbee  | ~100 m | ~250 kbps | 极低 | 智能家居       |
| LoRaWAN | ~15 km | ~50 kbps  | 极低 | 农业、资产追踪 |
| NB-IoT  | ~10 km | ~200 kbps | 低   | 智能城市       |
| 5G      | ~1 km  | ~1 Gbps   | 高   | 自动驾驶、AR   |

---

## 5. AirTags 阅读材料：BLE 隐私分析

AirTag 使用 BLE 广播（*Broadcasting*）+ UWB（*Ultra-Wideband*）精确测距。

**隐私机制**：AirTag 每隔约 10 分钟**轮换 MAC 地址和加密密钥**（*Rotating Key*），防止被第三方长期追踪。

**Find My 网络**：任何 iPhone 看到 AirTag 广播，可将其位置加密上传至苹果服务器，AirTag 主人可解密，但苹果服务器无法得知位置（端到端加密）。

**反跟踪机制**：若非主人的 AirTag 长时间跟随某 iPhone，该 iPhone 会收到警告通知。

::: theorem 推论 — 安全与隐私的双面性
AirTag 的设计在方便用户追踪自己物品的同时，也引发了被恶意用于跟踪他人的安全顾虑，是 IoT 设计中隐私与功能权衡的典型案例。
:::

---

## 本讲小结

BLE 通过广播/连接双模式和极低占空比实现数年级别的电池寿命；LoRaWAN 以扩频技术换取超长距离低功耗覆盖，适合每日只传少量数据的场景。不同无线技术在带宽、覆盖、功耗三维空间中各占不同位置，IoT 系统设计者需根据应用需求做出权衡。

## Lec 5 物联网连接技术

阅读资料： [I Used Apple AirTags, Tiles and a GPS Tracker to Watch My Husband’s Every Move](https://6mobile.github.io/materials/AirtagsReading.pdf)

物联网连接技术包括蓝牙低功耗、低功耗广域网、WiFi、蜂窝网络、5G 等。

学习物联网（IoT）连接技术的基础、应用以及其影响

1. 什么是整体的物联网系统架构？
2. 物联网中有哪些不同类型的连接技术？在具体应用中，应该如何选择“合适”的通信技术？
3. 无线网络与物联网系统中有哪些不同的路由架构？
4. 能源如何影响物联网设备的设计？无电池（batteryless）物联网系统是如何工作的？

## 网络是物联网的粘合剂

物联网的发展源于多种技术的融合（技术推动）：

- 嵌入式计算（Embedded Computing）
- 微型化传感技术（MEMS）
- 无线网络连接能力（Wireless Network Connectivity）

阅读资料 IoT Connectivity [pdf](https://6s062.github.io/6MOB/2018/materials/connectivity.pdf)

![image-20260501205425781](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260501205425781.png)

存在许多不同的方法，也提出了大量不同的标准，因此带来了相当程度的混乱。不存在“一刀切”的方案， 最合适的网络取决于具体应用场景。

那么，关键的组织原则和核心思想是什么？

## 架构： 直连、网关和边缘计算

![image-20260501215306555](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260501215306555.png)

实际上，我们有丰富的设计空间。比如，网关和设备之间如何通信？ 答案非常多，很多种方法。

> 我们不能直接用无线互联网吗？蜂窝网络（Cellular）和 Wi-Fi

Sol： 当然可以，但有时候也不行。  蜂窝和 Wi-fi 的优点是覆盖范围广，带宽高。但是也有两个主要缺点， 功耗高，成本问题（尤其蜂窝网络） 。

**不同技术的典型应用场景**

Wifi / Blutooth： 适用于室内、固定设备。例如音响、洗衣机、冰箱以及家庭 IoT 设备

蜂窝网络： 适用于高价值或移动设备，比如，车联网，通过手机作为网关的设备

> 为什么 IoT 需要“专门网络”？

Sol： 所以 IoT 才会出现 BLE（低功耗蓝牙）、LoRa / LPWAN、 Zigbee、RFID / backscatter，这些都是为了绕开 Wifi / 蜂窝网络的缺点。

### IoT 网络的设计空间

![image-20260501220102104](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260501220102104.png)

三个维度： 带宽、设备到网关覆盖范围以及功耗。注意：这些维度并不是彼此独立的，技术发展速度很快，并且当技术被集成进流行设备后，会加速普及，同时改变经济结构。例如，以前 Wi-Fi 需要外接网卡 → 后来直接内置在笔记本里；低功耗蓝牙（BLE） → iPhone，然后 Android 智能手机 → “人体/房间级”网络

> 为什么会有这么多 IoT 网络？

Sol： 因为工程师喜欢发明新技术。因为我们可以从这个“设计空间”中进行选择。

BLE 最初由诺基亚在 2006 年以 “Wibree” 的形式提出。如今 BLE 是主导性技术之一，原因是：👉 智能手机的普及。 智能手机的作用——网关，成为 IoT 的“中心节点”，连接可穿戴设备、车辆、可穿戴设备。 这个故事告诉我们 IoT 网络不是技术列表，而是演化生态。不是我们设计了很多协议，然后从中选择，而是技术 + 设备 + 市场的一起演化的结果。 例如，BLE 的成功，不是因为它最强，而是因为被智能手机”带飞“了，手机自带 BLE，无需额外基础设施，直接连接生态系统。

技术不是独立选择的，而是绑定在平台上的。比如，Wi-Fi → laptop 生态； Bluetooth → phone 生态； BLE → smartphone + 可穿戴生态

> BLE 如何工作的？

Sol：
