# Lec 4 — 穿墙感知（*Seeing through Walls / Device-Free Localization*）
> MIT 6.1820/MAS.453 · Mobile and Sensor Computing
> 阅读材料：WiTrack [NSDI'15] — MIT CSAIL

## 1. 动机与问题定义

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义 — 无设备定位（<em>Device-Free Localization</em>）</strong><br>
目标人员无需携带任何无线设备，仅凭无线信号在其身上的反射（<em>Reflection</em>）和衍射来推断位置，典型应用场景：老年人跌倒检测、急救搜救、家庭安防。</div>

**技术挑战**：
1. 目标的反射信号功率远小于环境静态多径（*Static Multipath*）
2. 室内多径使得无线传播极为复杂
3. 需要在没有 LoS（*Line of Sight*）的情况下定位

---

## 2. FMCW 雷达原理回顾

WiTrack 使用频率调制连续波（*FMCW, Frequency-Modulated Continuous Wave*）雷达工作在 5.46–7.25 GHz 频段。

### 2.1 距离测量原理

发射信号线性扫频：频率随时间从 $f_0$ 升至 $f_0 + B$（带宽 $B$）。

接收到的回波是发射信号的延迟版本，延迟 $\tau = 2d/c$。

两路信号混频（*Mixing*）后得到差频（*Beat Frequency*）：

$$f_\text{beat} = \frac{B}{\tau_\text{chirp}} \cdot \tau = \frac{B}{\tau_\text{chirp}} \cdot \frac{2d}{c}$$

对差频信号作 FFT，峰值位置即对应目标距离：

$$d = \frac{c \cdot f_\text{beat} \cdot \tau_\text{chirp}}{2B}$$

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论 — 距离分辨率</strong>　距离分辨率 $\Delta d = c/(2B)$，带宽 $B = 1.79$ GHz 对应约 8.4 cm 的分辨率，足以感知人体运动。</div>

---

## 3. 静态多径消除（*Static Multipath Removal*）

**问题**：环境中墙壁、家具的反射远强于人体反射，直接 FFT 会被环境响应淹没。

**解决方案**：差分（*Differential*）

$$S_\text{dynamic}(f) = S_\text{current}(f) - S_\text{background}(f)$$

对每个频率 bin 减去背景均值，消除静态成分，只剩动态变化（运动人体）。

---

## 4. 二维定位方法

WiTrack 使用**两组天线**（发射 TX + 接收 RX）放置于不同位置，从而形成两个不同的「收发对」（*TX-RX Pair*）。

### 4.1 单天线对 → 椭圆

对于收发分置的雷达，测量得到的是收发路径之和：

$$d_{TX} + d_{RX} = \text{const}$$

这是一个以 TX 和 RX 为焦点的**椭圆**（*Ellipse*）方程，目标在该椭圆上。

### 4.2 双天线对 → 椭圆交点

使用两对收发天线（不同位置），各自测量到一条椭圆。两椭圆相交点即为目标位置：

$$\begin{cases} d_{TX_1} + d_{RX_1} = r_1 \\ d_{TX_2} + d_{RX_2} = r_2 \end{cases}$$

求解两个椭圆方程组得到 $(x, y)$。

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题 — 为什么需要两对天线而不是一对？</strong></div>

一对天线仅给出椭圆曲线（一个约束），目标位置有无穷多解。第二对天线提供第二条椭圆，两条椭圆通常相交于有限个点（一般 2 个），结合高度先验（人站立在地面）可唯一确定位置。

Sol：单椭圆 = 1 个约束，2D 定位需 2 个独立约束；双椭圆交点提供唯一解（配合高度先验消歧义）。

---

## 5. 静态人体感知（*Breathing Detection*）

当人体静止不移动时，身体的微小起伏（呼吸）仍会产生相位变化：

$$\Delta\phi = \frac{4\pi \Delta d}{\lambda}$$

胸腔呼吸幅度约 1–2 cm，对应 FMCW 相位变化可被系统检测到（即使穿墙）。

<div style="border-left: 4px solid #5cb85c; background: #eafaf0; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论</strong>　呼吸频率约 0.1–0.5 Hz，心跳约 1–2 Hz，FMCW 的慢时间维（帧间）FFT 可以分离出这两个频率成分，用于生命体征检测（<em>Vital Sign Detection</em>）。</div>

---

## 6. WiTrack 系统评估

| 指标 | 结果 |
|------|------|
| 水平定位中位误差 | ~10 cm（同房间），~21 cm（穿一堵墙）|
| 垂直（高度）误差 | ~18 cm |
| 跌倒检测准确率 | ~96% |
| 设备是否需随身携带 | 否（*Device-Free*）|

---

## 7. 应用延伸：WiVi & WiSee

WiTrack 的技术延伸到了**穿墙手势识别**（*Through-Wall Gesture Recognition*）和**跨墙人体追踪**（*Cross-Wall Tracking*）。

这类技术展示了将无线电信号用作「RF 相机」的可能性。

---

## 本讲总结

WiTrack 通过 FMCW 雷达的差分去除静态多径，再利用双天线对的椭圆交点实现二维定位，既不需要目标佩戴设备，也能穿透墙壁工作，开创了基于 Wi-Fi/雷达的无设备感知（*Device-Free Sensing*）研究方向。
