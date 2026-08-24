---
title: 无线神经辐射场（Wireless NeRFs）
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 14
kind: system
tags: []
status: complete
---
# Lec 14 无线神经辐射场（*Wireless NeRFs*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：EchoNeRF [arxiv 2505.22441]

## 1. 动机：从视觉 NeRF 到无线 NeRF

**场景重建**（*Scene Reconstruction*）是 IoT 感知的终极目标之一：不只测距或定位，而是恢复环境的完整三维结构。

本讲的核心问题：**能否仅凭用户携带手机行走时测量的 Wi-Fi RSSI 信号，反推室内平面图？**

::: definition
**定义 — 神经辐射场（*NeRF, Neural Radiance Field*）**

NeRF 是一个将三维坐标和视角映射到颜色与密度的神经网络（MLP），通过对输入图像集合过拟合（*Overfitting*），学习场景的隐式三维表示，可从任意新视角渲染图像。
:::

---

## 2. 视觉 NeRF 原理

### 2.1 核心思想

视觉 NeRF 训练一个 MLP $F_\theta$：

$$F_\theta : (x, y, z, \theta_\text{view}, \phi_\text{view}) \rightarrow (r, g, b, \sigma)$$

其中 $(r, g, b)$ 是颜色，$\sigma$ 是密度（透明度），$(x,y,z)$ 是三维坐标，$(\theta, \phi)$ 是视角方向。

### 2.2 体积渲染（*Volume Rendering*）

从相机出发，沿每个像素发射射线 $\mathbf{r}(t) = \mathbf{o} + t\mathbf{d}$，对射线上的点积分：

$$\hat{C}(\mathbf{r}) = \int_{t_n}^{t_f} T(t) \cdot \sigma(\mathbf{r}(t)) \cdot \mathbf{c}(\mathbf{r}(t), \mathbf{d})\, dt$$

其中透射率 $T(t) = \exp\left(-\int_{t_n}^t \sigma(\mathbf{r}(s))\, ds\right)$。

### 2.3 训练与推断

- **训练**：对已知相机位姿的图像集合，最小化预测像素颜色与真实像素颜色的 L2 损失
- **推断**：给定新视角的相机参数，通过体积渲染生成新视角图像

::: theorem 推论 — NeRF 的跨模态迁移潜力
NeRF 框架的本质是"用神经网络拟合场景的物理响应函数"，这一框架不限于光学——任何具有明确物理传播模型的信号（声波、无线电信号）都可以套用 NeRF 范式。
:::

---

## 3. EchoNeRF：RSSI 到室内平面图

### 3.1 问题定义

**输入**：
- 用户手机在室内行走，采集的 $(x_i, y_i, \text{RSSI}_i)$ 序列（手机位置 + Wi-Fi 信号强度）
- Wi-Fi 路由器（TX）位置已知

**输出**：室内平面图（哪里是墙，哪里是空气）

### 3.2 NeRF 到 EchoNeRF 的映射

| NeRF（视觉）| EchoNeRF（无线）|
|------------|----------------|
| 输入：3D 坐标 + 视角 | 输入：3D 坐标 + TX/RX 位置 |
| 输出：颜色 + 密度 | 输出：不透明度 $\delta$ + 法向角 $\omega$ |
| 积分方式：体积渲染 | 积分方式：无线信号传播模型 |
| 损失：像素颜色误差 | 损失：RSSI 预测误差 |

::: definition 定义 — EchoNeRF 网格单元
场景被离散化为二维网格，每个单元包含两个可学习参数：

• $\delta \in [0, 1]$：不透明度（接近 1 = 墙，接近 0 = 空气）

• $\omega \in [-\pi, \pi]$：法线方向（确定反射角度）
:::

### 3.3 无线信号传播模型

EchoNeRF 使用以下简化物理规则对 RSSI 建模：

**直射路径（*LoS*）**：

$$P_\text{LoS} \propto \frac{1}{d^2}$$（路径无遮挡时成立）

**规则列表**：
1. 直射功率正比于 $1/d^2$
2. 墙壁完全阻断直射路径
3. 墙壁对信号产生镜面反射（*Specular Reflection*）
4. 多径信号功率叠加（因缺乏相位信息，只叠加功率）

**建模 RSSI**：

$$\hat{P}_\text{RX} = P_\text{LoS} + \sum_k P_\text{reflection,k}$$

### 3.4 损失函数与两阶段训练

**直接最小化 RSSI 误差的问题**：直射路径主导 RSSI，神经网络梯度被 LoS 项支配，反射项被忽略，导致墙壁学不出来。

**解决方案：两阶段训练**

::: example 例题 — 为什么两阶段训练有效？

:::

**第一阶段**：仅用直射路径训练，网络学会基本的"空气/墙"布局

**第二阶段**：冻结第一阶段的 LoS 估计，仅对残差（真实 RSSI - LoS RSSI）训练反射项

Sol：第一阶段确定大体布局，第二阶段精细化墙壁方向和位置。两阶段分治避免了梯度主导问题，使网络能同时学习直射和反射的贡献。

$$\mathcal{L} = \|\hat{P}_\text{RX} - P_\text{RX}^\text{measured}\|^2$$

---

## 4. 评估

### 4.1 实验设置

- **楼层平面图数据集**：Zillow 室内数据集
- **信号仿真**：NVIDIA Sionna 射线追踪（*Ray Tracing*）
- 每个场景约 1 个路由器/房间，采集 1000 或 2000 个 RSSI 样本

### 4.2 指标：墙体 IoU（*Wall Intersection over Union*）

$$\text{Wall IoU} = \frac{|\text{预测墙} \cap \text{真实墙}|}{|\text{预测墙} \cup \text{真实墙}|}$$

| 方法 | 1000 样本 | 2000 样本 |
|------|---------|---------|
| 热力图分割 | 0.09 | 0.12 |
| NeRF2（基线）| 0.12 | 0.14 |
| EchoNeRF（仅 LoS）| 0.25 | 0.27 |
| **EchoNeRF（完整）**| **0.32** | **0.38** |

### 4.3 鲁棒性测试

| 手机定位噪声 $\sigma$ | Wall IoU |
|---------------------|---------|
| 0 m（理想）| 0.38 |
| 0.5 m | 0.35 |
| 1 m | 0.33 |
| 2 m | 0.29 |

结论：在合理的手机定位误差（1 m）下，性能下降不超过 15%，系统鲁棒性良好。

---

## 5. 拓展：Wi-Fi 室内场景三维重建

**EchoNeRF 的延伸**：能否不用移动设备，仅凭单个静态雷达重建完整三维场景？

**核心挑战**：静态雷达只能接收满足镜面反射条件的点，场景大部分区域无法直接感知（*Specularity Problem*）。

**解决方案：人体作为"照明"源（*Human as Illuminator*）**

$$\text{人在场景中移动} \Rightarrow \text{人体反射照亮不同区域} \Rightarrow \text{雷达接收人体反射信号}$$

将人体运动轨迹与扩散模型（*Diffusion Model*）结合：
- **阶段一**：扩散模型检测家具位置
- **阶段二**：扩散模型重建房间布局

初步结果展示了完整三维重建的潜力，可支持智能家居、室内导航、场景感知音频等下游应用。

::: theorem 推论 — 隐私隐患
Wi-Fi RSSI 的读取权限比摄像头、麦克风容易获得，若 EchoNeRF 技术成熟，恶意 App 可能在用户不知情的情况下绘制其家庭平面图。如何在 AP/手机固件层面限制 RSSI 精度或频率，是重要的隐私保护议题。
:::

---

## 6. 本课程技术总结

| 感知维度 | 代表技术 | 代表讲次 |
|----------|---------|---------|
| 室内定位 | RADAR 指纹，Cricket ToF | Lec 2–3 |
| 穿墙感知 | WiTrack FMCW | Lec 4 |
| 连接设计 | BLE，LoRaWAN，ETX Mesh | Lec 5–6 |
| 无电池传感 | RFID 反向散射，PAB | Lec 7，12 |
| 车辆/自动驾驶 | mmWave + Hawkeye cGAN | Lec 8 |
| 惯性感知 | IMU，航位推算 | Lec 9–10 |
| 声学安全 | BackDoor 非线性攻击 | Lec 11 |
| 农业/海洋 | FarmBeats，AgriTera | Lec 12–13 |
| 场景重建 | EchoNeRF，Wi-Fi 扩散模型 | Lec 14 |

---

## 本讲小结

EchoNeRF 将视觉 NeRF 框架迁移到无线信号域，以 Wi-Fi RSSI 为"像素"、无线传播物理模型为"体积渲染"、不透明度和法线方向为"场景表示"，通过两阶段训练实现室内平面图重建，Wall IoU 达到 0.38；Wi-Fi 三维场景重建的延伸工作利用人体作为场景照明，进一步拓展了无线感知的边界，也引出了亟需解决的隐私安全问题，为 IoT 感知研究画下了令人期待的终章。
