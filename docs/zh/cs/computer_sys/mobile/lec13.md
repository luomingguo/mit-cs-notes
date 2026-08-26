---
title: 农业物联网（Agriculture IoT）
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 13
kind: system
tags: []
status: complete
---
# Lec 13 农业物联网（*Agriculture IoT*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：FarmBeats [NSDI'17]，AgriTera [MobiCom'23]

## 1. 背景：为什么是农业？

::: definition
**定义 — 精准农业（*Precision Agriculture / Data-Driven Agriculture*）**

利用大量传感器数据（土壤湿度、温度、pH、气象等）驱动决策，减少资源浪费，提高产量与可持续性。联合国预测：全球农业产量到 2050 年需翻倍才能满足人口需求，而可耕地和水资源正在减少，精准农业是解决方案的关键组成。
:::

**挑战**：人工数据采集成本极高（USDA 调研），阻止大多数农民使用数据驱动方法。FarmBeats 的目标是提供**端到端 IoT 系统**，实现低成本自动化数据采集。

---

## 2. 空中连接：Loon 与 Aquila

农业区域（农场）通常远离城市，缺乏网络覆盖。

| 项目 | 主体 | 方案 |
|------|------|------|
| Project Loon | Google X | 平流层气球网络，覆盖偏远地区 |
| Project Aquila | Facebook | 太阳能无人机，驻留低空提供 Wi-Fi |
| Starlink | SpaceX | 低轨卫星星座，低延迟宽带 |

> 注：Aquila 于 2018 年停止，Loon 于 2021 年停止；Starlink 取得商业成功，Iridium 等传统卫星系统带宽有限、延迟高。

---

## 3. FarmBeats 系统设计

### 3.1 三大核心挑战

**挑战一：网络连接（*Internet Connectivity*）**

传感器节点距离农民家/办公室数英里，且被作物、树冠遮挡，Wi-Fi 覆盖不到。

**解决方案：电视白频谱（*TV White Spaces, TVWS*）**

$$\text{传感器节点} \xrightarrow{\text{TVWS（无线）}} \text{基站} \xrightarrow{\text{TVWS}} \text{农民家网关} \xrightarrow{\text{互联网}} \text{云}$$

TVWS 使用电视广播空闲频段（*Whitespace*，54–806 MHz），波长长、绕射能力强，可穿透树冠，覆盖数公里。

**挑战二：传感器稀疏部署（*Limited Sensor Placement*）**

农场面积大（100+ 英亩），密集部署传感器成本太高。

**解决方案：空间插值（*Spatial Interpolation*）**

::: theorem 推论 — 稀疏部署 + 插值
无人机（*Drone*）定期航测采集高密度数据，结合稀疏地面传感器数据，通过克里金插值（*Kriging*）等方法生成全场精准地图（土壤湿度、pH、温度）。实验证明 FarmBeats 可将有效覆盖范围扩大数量级。
:::

**挑战三：功耗波动（*Variable Power Availability*）**

太阳能供电传感器在阴天/雨天停止工作，导致关键时刻（如洪水监测）数据缺失，阴天月份停机率高达 30%。

**解决方案：天气感知占空比（*Weather-Aware Duty Cycling*）**

$$P_\text{solar}(t) \propto 1 - \text{cloud\_cover}(t)$$

系统从云端获取天气预报，**提前预测**未来供电水平，在晴天（电量充足时）提高采样频率储存数据，在预测阴天到来前降低非关键传感频率，保留电量给关键传感任务：

$$\text{停机率} : 30\% \xrightarrow{\text{天气感知占空比}} 0\%$$

### 3.2 实验部署

| 参数 | 数值 |
|------|------|
| 部署地点 | 纽约 Essex 农场（100 英亩），华盛顿 Carnation 农场（5 英亩）|
| 持续时间 | 6 个月以上 |
| 传感器数量 | > 100 个（10 种类型）|
| 相机数量 | ~10 台（3 种类型）|
| 数据量 | > 1000 万条传感器记录，> 50 万张图像，100 次无人机勘测 |

---

## 4. AgriTera：亚太赫兹水果成熟度传感

**问题**：全球每年约 50% 的水果蔬菜因不能准确判断成熟度而被浪费。

::: definition 定义 — 成熟度指标
• **Brix**：可溶性固形物含量（主要是糖分），表征甜度

• **干物质（*Dry Matter*）**：去除水分后的固体比例，表征成熟程度

两个指标随果实成熟而持续变化，传统测量需要破坏果皮（切开测量）。
:::

### 4.1 技术原理：亚太赫兹频段（*Sub-THz*）

工作频段：**亚太赫兹波（0.1–1 THz）**

**为什么选亚太赫兹？**

| 频段 | 穿透性 | 对水/糖敏感度 |
|------|--------|-------------|
| Wi-Fi（2.4/5 GHz）| 穿透过强，分辨率差 | 低 |
| mmWave（77 GHz）| 表面反射为主 | 低 |
| **亚太赫兹** | 穿透果皮，敏感于成分变化 | **高** |
| 近红外（*NIR*）| 穿透浅 | 中 |

亚太赫兹波透射时，水分、糖分、淀粉含量的变化会改变介质的**折射率**（*Refractive Index*），从而在传输频谱上留下可检测的"指纹"。

### 4.2 化学计量分析（*Chemometric Analysis*）

将亚太赫兹传输频谱 $S(f)$ 映射到成熟度指标 $[\text{Brix}, \text{Dry Matter}]$：

$$[\hat{\text{Brix}}, \hat{\text{DM}}] = f_\text{ML}\left(S(f_1), S(f_2), \ldots, S(f_N)\right)$$

通过训练机器学习模型（偏最小二乘回归，*PLS-R*），建立频谱特征与成熟度指标的映射关系。

::: example 例题 — AgriTera 评估结果

:::

测试品种：柿子（Brix）、牛油果（Dry Matter）、青苹果（Brix + Dry Matter）

平均归一化均方根误差（*NRMSE*）：**0.55%**

Sol：AgriTera 在不破坏果实、无需接触的情况下，以 < 1% 的误差估计多种水果的成熟度指标，覆盖不同果皮厚度和果肉结构的品种，展示了通用性。

---

## 5. 农业 IoT 设计原则

::: theorem 推论 — 农业 IoT 的五大设计考量
① 长覆盖距离（TVWS、LoRa），② 异构传感器（地面 + 无人机），③ 能量自适应（太阳能 + 天气感知占空比），④ 数据融合（稀疏传感 + 空间插值），⑤ 非侵入感知（亚太赫兹、多光谱成像）。
:::

---

## 本讲小结

FarmBeats 通过 TVWS 连接、无人机辅助稀疏传感、天气感知占空比三项技术组合，构建了面向农业的端到端 IoT 系统，将停机率从 30% 降至 0%；AgriTera 利用亚太赫兹频段的成分敏感性，实现了无损非接触式水果成熟度精准检测，两者共同展示了 IoT 技术在减少农业浪费、提高可持续性方面的巨大潜力。
