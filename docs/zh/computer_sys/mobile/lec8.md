---
title: 自动驾驶汽车（Self-Driving Cars）
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 8
kind: system
tags: []
status: complete
---
# Lec 8 自动驾驶汽车（*Self-Driving Cars*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：Hawkeye [MobiCom'22] — MIT CSAIL

## 1. 自动驾驶感知技术全景

自动驾驶汽车的核心挑战是**全天候、全场景**的环境感知。

::: definition 定义 — 感知模态对比
主流自动驾驶感知传感器包含三类：摄像头（*Camera*）、激光雷达（*LiDAR*）、毫米波雷达（*mmWave Radar*）。
:::

| 传感器 | 分辨率 | 天气鲁棒性 | 深度信息 | 成本 |
|--------|--------|-----------|---------|------|
| 摄像头 | 极高 | 弱（雨/雾/黑暗）| 需立体/深度学习 | 低 |
| LiDAR | 高 | 弱（雨/雾）| 直接点云 | 高 |
| mmWave 雷达 | 低 | 极强 | 直接距离+速度 | 低 |

**问题**：毫米波雷达（*mmWave Radar*）能穿透雨雾、成本低，但分辨率远低于摄像头，无法直接用于物体识别。

---

## 2. mmWave 雷达工作原理

工作频段：77 GHz（波长 $\lambda \approx 3.9$ mm）。

### 2.1 FMCW 测距

与 WiTrack（Lec 4）相同，通过差频 FFT 测量目标距离：

$$d = \frac{c \cdot f_\text{beat} \cdot T_\text{chirp}}{2B}$$

### 2.2 多普勒速度测量

连续发射多个 chirp，帧间相位差给出目标径向速度：

$$v = \frac{\lambda \cdot \Delta\phi}{4\pi T_\text{PRI}}$$

其中 $T_\text{PRI}$ 为脉冲重复间隔（*Pulse Repetition Interval*）。

### 2.3 角度测量（*AoA*）

利用多天线阵列（*MIMO*），通过相位差估计目标角度：

$$\theta = \arcsin\left(\frac{\Delta\phi \cdot \lambda}{2\pi d_\text{ant}}\right)$$

::: theorem 推论 — 分辨率极限
mmWave 雷达的角度分辨率 $\Delta\theta \approx \lambda / (N \cdot d_{ant})$，典型值为 $15°$，相比摄像头的像素级分辨率差距悬殊，这是直接用雷达做目标检测困难的根本原因。
:::

---

## 3. Hawkeye：从雷达点云重建深度图

**核心思想**：用深度学习将低分辨率雷达点云（*Radar Point Cloud*）转换为高质量深度图（*Depth Map*），从而获得相机级别的感知能力，同时保持雷达的天气鲁棒性。

### 3.1 网络架构：条件生成对抗网络（*cGAN*）

::: definition
**定义 — 条件生成对抗网络（*cGAN, Conditional Generative Adversarial Network*）**

在标准 GAN 的基础上，生成器（*Generator*）以条件输入（这里是雷达点云）为约束生成深度图，判别器（*Discriminator*）区分生成的深度图与真实深度图（来自 LiDAR）。
:::

**Hawkeye 生成器架构**：

$$\text{雷达点云（3D）} \xrightarrow{\text{3D 卷积编码器}} \text{特征向量} \xrightarrow{\text{2D 卷积解码器}} \text{深度图（2D）}$$

- **编码器**（*3D Encoder*）：提取雷达数据的距离-角度-多普勒三维特征
- **解码器**（*2D Decoder*）：将三维特征投影为二维深度图

### 3.2 训练数据问题

**挑战**：真实道路场景中难以同时获取大量雷达点云与对应的精准深度真值（*Ground Truth Depth*）。

**解决方案：射线追踪仿真（*Ray Tracing Simulation*）**
- 在虚拟城市场景中对交通、行人、建筑进行物理建模
- 仿真毫米波雷达信号传播（包括多径、反射）
- 生成大量配对的"雷达点云 + 真值深度图"训练数据
- 实测结果：仿真训练 + 少量真实数据微调（*Fine-Tuning*）效果与纯真实数据相当

::: theorem 推论 — 仿真数据的价值
当真实世界数据采集代价高昂（驾驶数百小时、标注成本）时，物理仿真可以低成本生成大规模训练数据，是 IoT/自动驾驶 AI 的重要数据来源策略。
:::

---

## 4. 评估结果

| 指标 | Hawkeye（雷达）| 相机深度估计 | LiDAR 直接测量 |
|------|--------------|------------|--------------|
| 雨天 MAE（m）| 0.32 | 1.8+ | N/A（失效）|
| 晴天 MAE（m）| 0.38 | 0.41 | 0.05 |

**关键结论**：在恶劣天气下，Hawkeye 精度比相机深度估计提升约 5 倍，接近晴天 LiDAR 精度。

---

## 5. 拓展：绕角成像（*Around-Corner Imaging*）

mmWave 雷达的另一个惊人应用：利用建筑角落的**漫反射**（*Diffuse Reflection*），感知视线之外的目标。

原理：目标的反射到达雷达的多径（*Multipath*）中包含"绕角"成分，通过对多径进行逆向分析可重建目标位置。

---

## 本讲小结

mmWave 雷达具有摄像头和 LiDAR 无法替代的天气鲁棒性，但分辨率低是其主要局限；Hawkeye 通过 cGAN 将雷达点云转换为高质量深度图，利用射线追踪仿真数据解决训练数据稀缺问题，为全天候自动驾驶感知提供了新路径。
