# Lec 3 — GPS 与室内定位实战（*GPS & Practical Indoor Localization*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：RADAR [INFOCOM'00]，Cricket [MobiCom'00]

## 1. GPS 工作原理深入

### 1.1 基本测距原理

GPS 卫星持续发射带有时间戳的伪随机码（*PRN, Pseudo-Random Noise Code*），接收机测量传播延迟：

$$d = \Delta t \times c$$

其中 $c \approx 3 \times 10^8 \text{ m/s}$，$\Delta t$ 为信号飞行时间（*Time of Flight*）。

### 1.2 如何测量传播延迟？

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 互相关（<em>Cross-Correlation</em>）</strong><br>
将接收到的延迟版本信号与本地参考码作相关运算，相关峰值出现的位置即对应传播延迟 $\Delta t$。
</div>

$$R(\tau) = \int s(t) \cdot s(t - \tau)\, dt$$

相关尖峰（*Correlation Spike*）的位置直接给出 $\Delta t$。每颗卫星有唯一的 PRN 码，互相关可区分不同卫星。

### 1.3 GPS 数据包与辅助 GPS（*A-GPS*）

- **星历数据（*Ephemeris*）**：卫星轨道参数、时钟信息
- 数据速率：**50 bits/s**，完整下载需约 **12.5 分钟**
- **A-GPS（Assisted GPS）**：通过蜂窝/Wi-Fi 网络快速获取星历，大幅缩短首次定位时间（*TTFF*）

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论</strong>　GPS 需要 4 颗卫星求解 $(x, y, z, \Delta t_\text{clock})$ 四个未知量（前三维位置 + 接收机时钟误差），才能消除时钟偏差对距离的影响。</div>

---

## 2. 论文一：RADAR [INFOCOM'00]

**贡献**：首篇将无线局域网（*WLAN*）用于室内定位的论文，核心思想是**信号指纹匹配**（*Fingerprinting*）。

### 2.1 方法

**离线阶段（*Offline / Calibration*）**：
- 在每个采样点，记录各基站收到的 RSSI 信号强度（多朝向）
- 构建信号强度数据库（*Radio Map*）

**在线阶段（*Online / Localization*）**：
- 测量当前位置的信号强度向量 $\mathbf{ss}' = [s_1', s_2', \ldots, s_k']$
- 与数据库中所有条目计算欧氏距离（*Euclidean Distance*）：

$$d_\text{ss}(\mathbf{ss}', \mathbf{ss}_j) = \sqrt{\sum_{i=1}^{k}(ss_i' - ss_{i,j})^2}$$

- 取距离最小的条目对应的位置作为定位结果（$k$-最近邻，*k-NN*）

### 2.2 评估与局限

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 评估合理性分析</strong></div>

实验以 70 个已知点中的 1 个为测试、其余 69 个为训练——这实际上是一种「留一法交叉验证」（*Leave-One-Out*），精度偏于乐观。实际部署中新位置的指纹差异往往更大。

**多近邻平均（*Averaging k Neighbors*）**：使用 $k > 1$ 个最近邻的平均位置可减少噪声影响，但 $k$ 过大时引入远距离点，反而降低精度（图形呈倒 U 形）。

---

## 3. 论文二：Cricket [MobiCom'00]

**目标**：设计一个通用室内定位系统，支持移动设备与传感器计算应用。

### 3.1 设计目标

- 室内良好工作
- 支持大规模设备接入
- **不侵犯用户隐私**（位置支持而非位置追踪）
- 易于部署和管理
- 低功耗

### 3.2 架构

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 被动监听器 + 主动信标（<em>Passive Listener + Active Beacon</em>）</strong><br>
信标（<em>Beacon</em>）主动广播；监听器（<em>Listener</em>）被动接收并自行计算位置。该架构保护隐私（服务器不知道用户在哪），并支持大量设备同时定位（无需网络反馈）。</div>

### 3.3 测距原理：RF + 超声波（*Ultrasound*）

信标**同时**发射：
- RF 信号（载有位置信息）
- 超声波脉冲

监听器测量两者到达的时间差：

$$d = \Delta t_\text{RF-US} \times v_\text{sound}$$

其中 $v_\text{sound} \approx 345 \text{ m/s}$，远小于光速 → 时延可测。

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 为何用超声而不用纯 RF 测距？</strong><br>
声速约 $345$ m/s，10 cm 对应 $0.29$ ms 时延，普通微控制器即可测量。<br>
光速 $3 \times 10^8$ m/s，10 cm 对应 $0.3$ ns 时延，需 3 GSps 采样率，硬件代价极高。
</div>

### 3.4 多信标干扰问题与解决方案

当多个信标同时发射时，超声波可能互相干扰或被错误配对到 RF 包：

$$\text{问题：信标 A 的 RF + 信标 B 的超声 → 错误距离}$$

**解决方案**：
1. **信标干扰回避（*Beacon Interference Avoidance*）**：信标使用随机退避发送
2. **监听器干扰检测（*Listener Interference Detection*）**：检测异常长的 RF-US 时延以排除虚假配对

### 3.5 比特率选择

为保证 RF 数据包在最长超声飞行时间内完全到达：

$$\text{比特率} < \frac{S}{\tau},\quad \tau = 2 \times d_{\max} / v_\text{sound}$$

"长无线包"策略：包传输时间 > 最大超声 ToF，确保 RF 先于超声到达。

### 3.6 定位策略

| 策略 | 方法 |
|------|------|
| *Majority* | 选出现频率最高的信标 |
| *MinMean* | 选平均距离最小的信标 |
| *MinMode* | 选众数距离最小的信标 |

---

## 4. 对比：RADAR vs. Cricket

| 维度 | RADAR | Cricket |
|------|-------|---------|
| 核心技术 | RSSI 指纹匹配 | RF + 超声 ToF |
| 精度 | ~2–3 m | ~数厘米 |
| 隐私 | 网络侧计算（可追踪）| 设备侧计算（保护隐私）|
| 部署复杂度 | 低（复用 Wi-Fi）| 中（需部署信标）|
| 适用场景 | 一般室内导航 | 精确定位 |

---

## 本讲总结

GPS 通过伪随机码互相关测量卫星距离，需 4 颗卫星解出三维位置；室内场景 GPS 失效，RADAR（指纹匹配）和 Cricket（RF+超声 ToF）是两种典型替代方案，精度与隐私保护各有侧重。
