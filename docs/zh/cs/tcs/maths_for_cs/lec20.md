---
title: 独立性
course: 6.1200 计算机数学
course_id: '6.1200'
lecture: 20
kind: theory
tags: []
status: complete
---
# Lec 20 独立性

> 来源：MIT 6.1200J / 18.062J Mathematics for Computer Science，Spring 2024

------

## 1. 基本定义

**赌徒谬误（\*Gambler's Fallacy\*）：** 误以为连续出现反面后，下一次正面的概率更大。事实上，公平硬币的每次抛掷相互独立。

> **定义（独立事件）：** 若满足下列任一等价条件，则称事件 $A$、$B$ **独立**（*independent*）： $$\Pr[A \mid B] = \Pr[A] \quad (\text{或} \Pr[B] = 0)$$ 等价地： $$\Pr[A \cap B] = \Pr[A] \cdot \Pr[B]$$

**典型示例：**

1. **互斥 $\Rightarrow$ 不独立（概率非零时）：** 若 $A \cap B = \emptyset$ 且 $\Pr[A], \Pr[B] > 0$，则 $\Pr[A \cap B] = 0 \neq \Pr[A]\Pr[B]$。
2. 抛两枚公平硬币，$A$ = "第一枚正面"，$B$ = "第二枚正面"：**独立**。
3. $A$ = "第一枚正面"，$B$ = "两枚均正面"：**不独立**（$\Pr[A \cap B] = 1/4 = \Pr[A]\Pr[B]$ 恰好成立，但 $B \subseteq A$，知道 $B$ 发生则 $A$ 必然发生）。
4. $A$ = "第一枚正面"，$B$ = "两枚结果相同"（公平硬币）：**独立**，$\Pr[A]=\Pr[B]=1/2$，$\Pr[A \cap B]=1/4$。
5. 若硬币有偏（正面概率为 $p$），同上的 $A$、$B$：**不独立**，$\Pr[B \mid A] = p \neq \Pr[B] = p^2 + (1-p)^2$。

------

## 2. 多事件的独立性：互独立与两两独立

> **定义（互独立）：** 称事件 $A$、$B$、$C$ **互独立**（*mutually independent*），若同时满足： $$\Pr[A \cap B] = \Pr[A]\Pr[B]$$ $$\Pr[A \cap C] = \Pr[A]\Pr[C]$$ $$\Pr[B \cap C] = \Pr[B]\Pr[C]$$ $$\Pr[A \cap B \cap C] = \Pr[A]\Pr[B]\Pr[C]$$

**第四个条件不可由前三个推出！** 反例：抛三枚独立公平硬币，令：

- $A$：硬币 1 与 2 结果相同
- $B$：硬币 2 与 3 结果相同
- $C$：硬币 3 与 1 结果相同

则 $\Pr[A]=\Pr[B]=\Pr[C]=1/2$，$\Pr[A \cap B]=\Pr[A \cap C]=\Pr[B \cap C]=1/4$（两两独立），但：

$$\Pr[A \cap B \cap C] = \Pr[\text{三枚结果相同}] = \frac{1}{4} \neq \frac{1}{8} = \Pr[A]\Pr[B]\Pr[C]$$

> **定义（两两独立）：** 满足前三个条件但不满足第四个条件的事件组，称为**两两独立**（*pairwise independent*）。两两独立在计算机科学中常作为互独立的替代（更易实现，往往足够用）。

------

## 3. 现实中的独立性

**2016 年美国大选案例：** 若假设宾夕法尼亚州（PA）、密歇根州（MI）、威斯康星州（WI）独立，

$$\Pr[PA \cap MI \cap WI] \approx 0.21 \times 0.23 \times 0.165 \approx 0.008$$

但这三个事件**并不独立**——民调系统误差、选举日因素等均可导致它们正相关。

在无任何相关性假设下，最优上界仅为最小单独概率：

$$\Pr[PA \cap MI \cap WI] \leq \Pr[WI] = 0.165$$

（因为 $PA \cap MI \cap WI \subseteq WI$）

------

## 4. 条件独立性（*Conditional Independence*）

> **定义：** 若满足 $$\Pr[A \mid C] \cdot \Pr[B \mid C] = \Pr[A \cap B \mid C]$$ 则称 $A$ 与 $B$ 在给定 $C$ 的条件下**条件独立**（*conditionally independent given C*）。

**重要观察：** 独立性与因果性无关！条件化第三个事件可在两个因果无关的事件之间引入依赖。

**约会模型示例：** 设 $A$ = "有吸引力"，$N$ = "好相处"，$R$ = "有吸引力或好相处"（浪漫有趣）。$A$ 与 $N$ 原本独立（各以 $1/2$ 概率成立），但在给定 $R$ 的条件下：

$$\Pr[A \mid R] = \frac{2}{3}, \quad \Pr[N \mid R] = \frac{2}{3}, \quad \Pr[A \cap N \mid R] = \frac{1}{3} \neq \frac{4}{9}$$

且 $\Pr[A \mid R \cap N] = 1/2 < \Pr[A \mid R] = 2/3$：有吸引力与好相处在 $R$ 的条件下**负相关**，但两者之间并无因果关系！

------

## 5. 补充：生日原理（*Birthday Principle*）

$d$ 个人各自生日均匀独立地取自 $n$ 天，无两人同天生日的概率为：

$$\Pr[\text{无碰撞}] = \frac{n-1}{n} \cdot \frac{n-2}{n} \cdots \frac{n-(d-1)}{n}$$

利用 $1 - x \leq e^{-x}$：

$$\Pr[\text{无碰撞}] \leq e^{-1/n} \cdot e^{-2/n} \cdots e^{-(d-1)/n} = e^{-\frac{d(d-1)}{2n}}$$

当 $d(d-1) \approx n$ 时此上界接近于 $1/e$，即 $d \approx \sqrt{n}$。对于 $n=365$，需 $d=23$ 人才使碰撞概率超过 $1/2$。

**"平方根"效应**在哈希、密码学、随机数据测试中有重要应用。

------

## 6. 补充：重新审视赌徒谬误

若真正抛出 50 次正面，理性应当怀疑硬币有偏，下一次预测正面才合理——这恰好与赌徒谬误相反！

用贝叶斯方法形式化：

$$\Pr[H \mid H^{50}] = 1 \cdot \Pr[\text{有偏} \mid H^{50}] + \frac{1}{2} \cdot \Pr[\text{公平} \mid H^{50}]$$

随着观测到的正面次数增多，$\Pr[\text{有偏} \mid H^{50}]$ 不断增大，$\Pr[H \mid H^{50}]$ 趋向于 1。
