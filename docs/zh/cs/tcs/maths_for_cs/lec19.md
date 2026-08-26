---
title: 条件概率
type: lecture
lecture: 19
tags: []
status: complete
---
# Lec 19 条件概率

> 来源：MIT 6.1200J / 18.062J Mathematics for Computer Science，Spring 2024

------

## 1. 概率运算规则

以下规则均从概率的定义 $\Pr[A] := \sum_{\omega \in A} \Pr[\omega]$ 直接推出。

**命题（求和规则）：** 若 $A$ 与 $B$ 互斥，则

$$\Pr[A \cup B] = \Pr[A] + \Pr[B]$$

由此可推出以下推论：

**推论（补集规则）：** $$\Pr[\bar{A}] = 1 - \Pr[A]$$

**推论（差集规则）：** $$\Pr[A \setminus B] = \Pr[A] - \Pr[A \cap B]$$

**推论（容斥原理）：** $$\Pr[A \cup B] = \Pr[A] + \Pr[B] - \Pr[A \cap B]$$

**推论（联合界）：** $$\Pr[A \cup B] \leq \Pr[A] + \Pr[B]$$

**推论（单调性）：** 若 $A \subseteq B$，则 $\Pr[A] \leq \Pr[B]$

以上规则均可推广至有限或可数多个事件（参见 PIE 广义形式）。

------

## 2. 条件概率（*Conditional Probability*）

> **定义：** 对于两个事件 $A$、$B$，$A$ 在给定 $B$ 条件下的**条件概率**（*conditional probability*）为： $$\Pr[A \mid B] = \frac{\Pr[A \cap B]}{\Pr[B]}$$

由此可得**乘积规则**（*Product Rule*）：

$$\Pr[A \cap B] = \Pr[A \mid B] \cdot \Pr[B]$$

推广至三个事件：

$$\Pr[A \cap B \cap C] = \Pr[A \mid B \cap C] \cdot \Pr[B \mid C] \cdot \Pr[C]$$

**树图法的理论依据：** 树图各边上的数值（除最顶层外）即为条件概率，路径上各边概率之积即为该结果的联合概率。

------

## 3. 示例一：锦标赛系列赛

**问题：** Ash 与 Gary 进行系列赛，先赢两局者获胜。规则：

- 第一局各 $1/2$ 概率获胜
- 若某方赢得上一局，则下一局赢的概率为 $2/3$

设 $A$ = "Ash 赢得系列赛"，$B$ = "Ash 赢得第一局"，求 $\Pr[A \mid B]$：

$$\Pr[A \mid B] = \frac{\Pr[A \cap B]}{\Pr[B]} = \frac{1/3 + 1/18}{1/2} = \frac{7}{9}$$

------

## 4. 贝叶斯定理（*Bayes' Rule*）

**核心思想：** 已知"前向"条件概率 $\Pr[A \mid B]$，推断"后向"概率 $\Pr[B \mid A]$。

$$\Pr[B \mid A] = \frac{\Pr[A \mid B] \cdot \Pr[B]}{\Pr[A]}$$

**术语：**

- $\Pr[B]$：**先验概率**（*prior probability*）
- $\Pr[A \mid B]$：**似然度**（*likelihood*）
- $\Pr[B \mid A]$：**后验概率**（*posterior probability*）

**比值形式（常用）：**

$$\frac{\Pr[B \mid A]}{\Pr[C \mid A]} = \frac{\Pr[A \mid B] \cdot \Pr[B]}{\Pr[A \mid C] \cdot \Pr[C]}$$

------

## 5. 示例二：有偏硬币与公平硬币

从有偏硬币（正面概率为 1）和公平硬币（正面概率 $1/2$）中等概率取一枚，抛出正面，求该硬币是公平硬币的概率：

$$\frac{\Pr[F \mid H]}{\Pr[B \mid H]} = \frac{\Pr[H \mid F] \cdot \Pr[F]}{\Pr[H \mid B] \cdot \Pr[B]} = \frac{(1/2)(1/2)}{1 \cdot (1/2)} = \frac{1}{2}$$

因此 $\Pr[F \mid H] = 1/3$，$\Pr[B \mid H] = 2/3$。

**要点：** 先验概率 $\Pr[F]$ 越小（即偏向认为是有偏币），观测到正面后认为是公平币的后验概率越低。

------

## 6. 示例三：COVID 检测与基率忽视

**场景：** MIT 社区中 10% 的人患有 COVID，检测假阳性率 $0.3$，假阴性率 $0.1$。检测阳性时，实际患病的概率？

设事件：$H$（健康），$S$（患病），$+$（阳性），$-$（阴性）。

已知：$\Pr[H]=0.9$，$\Pr[S]=0.1$，$\Pr[+ \mid S]=0.9$，$\Pr[+ \mid H]=0.3$。

$$\frac{\Pr[S \mid +]}{\Pr[H \mid +]} = \frac{\Pr[+ \mid S] \cdot \Pr[S]}{\Pr[+ \mid H] \cdot \Pr[H]} = \frac{0.9 \times 0.1}{0.3 \times 0.9} = \frac{1}{3}$$

因此 $\Pr[S \mid +] = 1/4$，$\Pr[H \mid +] = 3/4$。

**结论：** 即使检测阳性，仍有 75% 概率是健康的！**基率（先验概率）是决定性因素。**

------

## 7. 示例四：辛普森悖论（*Simpson's Paradox*）

**现象：** 1973 年 UC Berkeley 录取数据——全校总录取率男性高于女性，但每个院系单独看录取率女性均不低于男性。

**数学解释：**

$$\Pr[A \mid F] = \Pr[A \mid F \cap CS] \cdot \Pr[CS \mid F] + \Pr[A \mid F \cap EE] \cdot \Pr[EE \mid F]$$

由于女性更多申请竞争激烈的 CS 系，而 CS 整体录取率低，因此女性总录取率被压低，并非各院系直接歧视女性。

**教训：** 在混合子群体时，各子群体的**基率差异**（*base rate*）可能导致与直觉完全相反的聚合结果。

------

## 8. 示例五：O. J. 辛普森案

**争议：** 虐待妻子的历史是否可作为谋杀证据？

- **检方论据：** 施暴者谋杀概率是普通人的 10 倍，故施暴历史应纳入证据。
- **辩方论据：** $\Pr[\text{谋杀} \mid \text{施暴}] \approx 1/2500$，概率极低，与案无关。

**正确分析：** 双方均忽视了"Nicole 已被谋杀"这一已知事实，正确的概率是 $\Pr[G \mid A \cap M]$（即：在妻子已死且丈夫曾施暴的条件下，丈夫是凶手的概率），实际约为 **80%**。

**教训：** 遇到条件概率问题，务必精确化所有事件，回归基本定义。
