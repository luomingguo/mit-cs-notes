---
title: 惯性感知（Inertial Sensing）
course: 6.1820 移动和传感器计算
course_id: '6.1820'
lecture: 9
kind: system
tags: []
status: complete
---
# Lec 9 惯性感知（*Inertial Sensing*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> IMU、航位推算与传感器融合

## 1. 惯性测量单元（*IMU, Inertial Measurement Unit*）

### 1.1 组成

::: definition 定义 — IMU 组成
标准 IMU 包含三类传感器：

• **加速度计（*Accelerometer*）**：测量线加速度（含重力分量），3 轴

• **陀螺仪（*Gyroscope*）**：测量角速度，3 轴

• **磁力计（*Magnetometer*）**：测量地磁方向，3 轴

合计 9 自由度（*9-DOF*）传感。
:::

---

## 2. MEMS 加速度计原理

::: definition
**定义 — MEMS 加速度计（*MEMS Accelerometer*）**

微机电系统（*MEMS, Micro-Electro-Mechanical Systems*）加速度计通过弹簧-质量块结构感知加速度，再通过电容变化转换为电信号。
:::

### 2.1 力学原理

设质量块质量为 $m$，弹簧常数为 $k$，质量块在加速度 $a$ 下产生位移 $x$：

$$F = ma = kx \implies x = \frac{m \cdot a}{k}$$

位移 $x$ 改变了差分电容（*Differential Capacitor*）：

$$\Delta C = C_0 \cdot \frac{x}{d_0}$$

其中 $d_0$ 为平衡位置电容极板间距，$C_0$ 为平衡电容。

::: theorem 推论
MEMS 加速度计同时感知外部加速度和重力加速度（$g = 9.8$ m/s²）。静止时，三轴读数的合矢量为 $g$，可用于确定设备绝对倾斜角（*Tilt*）。
:::

---

## 3. MEMS 陀螺仪原理

::: definition
**定义 — 科里奥利力（*Coriolis Effect*）**

在旋转参考系中，沿某方向运动的质点会受到垂直于运动方向的科里奥利力：$\vec{F}_c = -2m(\vec{\Omega} \times \vec{v})$，其中 $\vec{\Omega}$ 为旋转角速度，$\vec{v}$ 为质点速度。
:::

MEMS 陀螺仪内部维持一个已知方向振动的质量块，旋转时产生的科里奥利力导致垂直方向位移，通过电容测量得到角速度 $\Omega$。

---

## 4. 自由度（*Degrees of Freedom*）

6 自由度（*6-DOF*）运动包含：

| 类型 | 轴 | 测量传感器 |
|------|-----|----------|
| 平移（*Translation*）| X, Y, Z | 加速度计 |
| 旋转（*Rotation*）| 偏航（*Yaw*）, 俯仰（*Pitch*）, 滚转（*Roll*）| 陀螺仪 |

$$\text{姿态} = [\text{Yaw}(\psi),\; \text{Pitch}(\theta),\; \text{Roll}(\phi)]$$

---

## 5. 航位推算（*Dead Reckoning*）

::: definition
**定义 — 航位推算（*Dead Reckoning*）**

从已知初始位置出发，通过持续积分速度（或加速度）来推算当前位置，无需外部参考信号。
:::

### 5.1 积分过程

**步骤 1：积分角速度 → 姿态**

$$\theta(t) = \theta(0) + \int_0^t \Omega(\tau)\, d\tau$$

**步骤 2：用姿态将加速度坐标转换到世界坐标系（*Body to World Frame*）**

$$\mathbf{a}_\text{world} = R(\theta) \cdot \mathbf{a}_\text{body}$$

其中 $R(\theta)$ 为旋转矩阵。

**步骤 3：减去重力**

$$\mathbf{a}_\text{linear} = \mathbf{a}_\text{world} - \mathbf{g}$$

**步骤 4：积分线加速度 → 速度 → 位置**

$$\mathbf{v}(t) = \mathbf{v}(0) + \int_0^t \mathbf{a}_\text{linear}\, dt,\quad \mathbf{p}(t) = \mathbf{p}(0) + \int_0^t \mathbf{v}\, dt$$

### 5.2 漂移问题（*Drift*）

::: example 例题 — 积分漂移估算

:::

设加速度计偏置（*Bias*）为 $b = 0.01\text{ m/s}^2$，积分 60 秒后位置误差：

$$\Delta p = \frac{1}{2} b t^2 = \frac{1}{2} \times 0.01 \times 60^2 = 18\text{ m}$$

Sol：仅 1 分钟后位置误差就达到 18 m，说明纯 IMU 无法长期独立工作，需要外部修正（GPS、磁力计等）。

::: theorem 推论 — 偏置积分误差增长规律
速度误差 $\propto bt$，位置误差 $\propto bt^2$。这意味着 IMU 的位置误差随时间**平方增长**，是纯惯性导航无法长期使用的根本原因。
:::

---

## 6. 传感器融合（*Sensor Fusion*）

单一传感器各有缺点：

| 传感器 | 优点 | 缺点 |
|--------|------|------|
| IMU | 高频、无延迟 | 长期漂移 |
| GPS | 绝对位置精度 | 10–30 m 误差，室内失效，低频（1 Hz）|
| 磁力计 | 提供绝对方向 | 受金属、电磁干扰 |

**卡尔曼滤波（*Kalman Filter*）**是融合多传感器的经典方法：

$$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k(z_k - H\hat{x}_{k|k-1})$$

其中 $K_k$ 为卡尔曼增益，$z_k$ 为观测值（GPS 位置），$\hat{x}_{k|k-1}$ 为 IMU 预测状态。

**互补滤波（*Complementary Filter*）**的直觉：

$$\hat{\theta} = \alpha \cdot (\hat{\theta} + \Omega \cdot dt) + (1-\alpha) \cdot \theta_\text{accel}$$

- 陀螺仪短期精度高 → 权重 $\alpha$ 高
- 加速度计长期无漂移 → 低频修正偏置

---

## 7. 捷联惯导系统（*Strapdown Navigation*）

在飞机、导弹等高精度应用中，IMU 固定在载体上（*Strapped Down*），每秒更新数百次，配合高精度陀螺仪（光纤陀螺，*FOG*）可在 GPS 失效时保持数分钟厘米级精度。

---

## 本讲小结

IMU 通过 MEMS 弹簧-电容结构测量加速度、通过科里奥利效应测量角速度；航位推算通过二次积分推算位置，但偏置引起的误差随时间平方增长；实用系统必须将 IMU 与 GPS 或其他绝对参考通过卡尔曼滤波融合，才能同时保证短期响应速度和长期定位精度。
