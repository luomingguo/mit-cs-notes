# Lecture 24：大偏差界——切比雪夫与切尔诺夫界

> 来源：MIT 6.1200J / 18.062J Mathematics for Computer Science，Spring 2024

------

## 1. 方差回顾

> **定义（方差）：** 随机变量 $R$ 的**方差**（*variance*）为： $$\text{Var}[R] = \mathbb{E}\left[(R - \mathbb{E}[R])^2\right]$$ **标准差**（*standard deviation*）$\sigma(R) = \sqrt{\text{Var}[R]}$。

**等价计算公式：**

$$\text{Var}[R] = \mathbb{E}[R^2] - \mathbb{E}[R]^2$$

**证明：**

$$\text{Var}[R] = \mathbb{E}[(R - \mathbb{E}[R])^2] = \mathbb{E}[R^2 - 2\mathbb{E}[R] \cdot R + \mathbb{E}[R]^2] = \mathbb{E}[R^2] - \mathbb{E}[R]^2$$

> **定理：** 若 $R_1, \ldots, R_n$ **两两独立**，则： $$\text{Var}[R_1 + \cdots + R_n] = \text{Var}[R_1] + \cdots + \text{Var}[R_n]$$

**警告：** $\sigma(R_1 + R_2) \neq \sigma(R_1) + \sigma(R_2)$（即使独立），但 $\sigma(R_1+R_2)^2 = \sigma(R_1)^2 + \sigma(R_2)^2$（独立时成立）。

------

## 2. 马尔可夫不等式（*Markov's Inequality*）

> **定理（马尔可夫不等式）：** 设 $R$ 为**非负**随机变量，则对任意 $x > 0$： $$\Pr[R \geq x] \leq \frac{\mathbb{E}[R]}{x}$$ 等价形式：$\Pr[R \geq c \cdot \mathbb{E}[R]] \leq \frac{1}{c}$。

**证明：**

$$\mathbb{E}[R] = \mathbb{E}[R \mid R \geq x] \Pr[R \geq x] + \mathbb{E}[R \mid R < x] \Pr[R < x] \geq x \cdot \Pr[R \geq x] + 0$$

整理即得。

**非负性的必要性：** 若 $R$ 可取负值，则 $\mathbb{E}[R \mid R < x]$ 不再非负，不等式失效。

### 实用技巧：调整界

若 $R$ 的取值范围为 $[\ell, u]$，可灵活变换：

- 应用于 $R - \ell$（非负）得到更紧的上侧界
- 应用于 $u - R$（非负）得到下侧界

**示例：** 成绩 $R \in [30, 100]$，$\mathbb{E}[R]=75$，估计 $\Pr[R \geq 90]$：

- 直接用马尔可夫：$75/90 \approx 0.833$
- 对 $R-30$ 用马尔可夫：$\mathbb{E}[R-30]/60 = 45/60 = 0.75$（更紧）

### 马尔可夫界的松紧性

- 懒苏珊转盘版手机问题：$\Pr[R \geq n] \leq 1/n$（马尔可夫），真实值也是 $1/n$——**紧！**
- 袋中取手机版：$\Pr[R \geq n] \leq 1/n$（马尔可夫），真实值是 $1/n!$——**非常松！**

------

## 3. 切比雪夫不等式（*Chebyshev's Inequality*）

> **定理（切比雪夫不等式）：** 对任意随机变量 $R$（无需非负）和 $x > 0$： $$\Pr[|R - \mathbb{E}[R]| \geq x] \leq \frac{\text{Var}[R]}{x^2} = \left(\frac{\sigma(R)}{x}\right)^2$$ 等价形式：$\Pr[|R - \mathbb{E}[R]| \geq c \cdot \sigma(R)] \leq \frac{1}{c^2}$。

**证明（对马尔可夫的应用）：**

对非负随机变量 $(R - \mathbb{E}[R])^2$ 应用马尔可夫：

$$\Pr[|R - \mathbb{E}[R]| \geq x] = \Pr\left[(R - \mathbb{E}[R])^2 \geq x^2\right] \leq \frac{\mathbb{E}[(R-\mathbb{E}[R])^2]}{x^2} = \frac{\text{Var}[R]}{x^2}$$

**示例一（成绩）：** $\mathbb{E}[\text{score}]=75$，$\text{Var}[\text{score}]=25$，$\sigma=5$，估计 $\Pr[\text{score} \leq 65]$：

$$\Pr[\text{score} \leq 65] \leq \Pr[|\text{score} - 75| \geq 10] \leq \frac{25}{100} = 0.25$$

（距均值 2 个标准差，概率 $\leq 1/4$）

**示例二（$n$ 次抛硬币）：** $R$ = 正面数，$\mathbb{E}[R]=n/2$，$\text{Var}[R]=n/4$：

$$\Pr\left[R \geq \frac{3n}{4}\right] \leq \Pr\left[|R - \frac{n}{2}| \geq \frac{n}{4}\right] \leq \frac{n/4}{(n/4)^2} = \frac{4}{n}$$

远优于马尔可夫给出的 $2/3$。

------

## 4. 切尔诺夫界（*Chernoff Bound*）

> **定理（切尔诺夫界）：** 设 $T_1, \ldots, T_n$ 为**互独立**随机变量，且 $0 \leq T_i \leq 1$，令 $T = \sum T_i$。则对所有 $c \geq 1$： $$\Pr[T \geq c \cdot \mathbb{E}[T]] \leq e^{-(c \ln c - c + 1) \cdot \mathbb{E}[T]}$$

**证明思路：** 对随机变量 $c^T$ 应用马尔可夫，利用独立性展开。

**应用（$n$ 次抛硬币，$c = 3/2$）：**

$$\Pr\left[R \geq \frac{3n}{4}\right] = \Pr\left[R \geq \frac{3}{2} \cdot \frac{n}{2}\right] \leq e^{-0.1 \cdot n/2} = e^{-n/20}$$

这是**指数级**改进，远优于切比雪夫的 $4/n$！

**集中性示例（令 $c = 1 + 4/\sqrt{n}$）：** 对足够大的 $n$：

$$\Pr\left[R \geq \frac{n}{2} + 2\sqrt{n}\right] \leq 0.02$$

正面次数以极高概率集中在均值 $n/2$ 附近 $\sqrt{n}$ 量级的范围内，分布随 $n$ 增大越来越集中。

------

## 5. 三种界的对比

| 方法     | 所需条件     | 界的形式            | $n$ 次抛硬币 $\Pr[R \geq 3n/4]$ |
| -------- | ------------ | ------------------- | ------------------------------- |
| 马尔可夫 | $R \geq 0$   | $\mathbb{E}[R]/x$   | $2/3$（非常松）                 |
| 切比雪夫 | 无（需方差） | $\text{Var}[R]/x^2$ | $4/n$                           |
| 切尔诺夫 | 互独立，有界 | 指数级              | $e^{-n/20}$（指数紧）           |

**依赖关系：** 切比雪夫只需两两独立，切尔诺夫需要**互独立**，换来更强的指数级界。