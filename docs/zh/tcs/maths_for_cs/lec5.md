# Lec 5 求和

求和在许多领域都非常重要，例如：

- 求解递推关系（*recurrences*）
- 计数（*counting*）
- 概率（*probability*）
- 算法运行时间分析（*runtime analysis*）
- 大规模系统性能分析（*performance of large systems*）
- 机器学习（*machine learning*）

以及更多数学与计算机科学中的应用。



## 一、 等比级数与年金问题

### 1.1 年金

贷款可以理解为：今天获得一笔一次性资金（lump sum），以后分期偿还，并且需要支付利息。 这种支付方式称为：年金 (*Annuity*)。

下面我们做一个简化假设：固定利率为 $p$ 时，今天的 \$1 等价于 1 年后的 \$(1+p)；反之，1 年后的 \$1 折算为今天的 $\dfrac{1}{1+p}$。



【定义】： 一个**年金**计划，即在每年的年初支付m美元，持续n年。假设：固定利率为**p**。基于复利计算的假设条件：

- 今天的1美元在1年后会变成**$(1 + p)$**。
- 今天的1美元在2年后会变成**$(1 + p)^2$**。
- 反之，1年后的1美元今天的等值是**$1 / (1 + p)$**，也就是说，如果现在有**$1 / (1 + p)$**，在1年后将会等值于1美元。十年后的 1 美元，相当于今天的**$(\frac{1}{1 + p})^{10}$**美元，这称为 **贴现（*discounting*）**



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Example </strong> 假设现在有一个：共持续 n 年，每年支付 m 美元，利率为 p 的年金。例如，美国联邦储备（Federal Reserve）的利率约为 p=0.0533， 按照贴现原则，这些未来的钱折算到今天，其总价值为多少 ？ </div>

支付时间如下：
- 现在支付m
- 一年后支付m， 支付的现值为$m/(1+p)$
- 2年后支付m，支付的现值为$m/(1+p)^2$
- n-1后年支付m，支付的现值为$m/(1+p)^{n-1}$

- 年金的现值公式为

$$
\sum^n_{n=1} m/(1+p)^i
    = m\sum^n_{n=1} x^i, \text{其中x = 1/(1+p)}
$$



$n$ 年、每年 $m$ 元的年金，折算为今日现值：

$$V = m \sum_{k=0}^{n-1} x^k, 其中，\quad x = \frac{1}{1+p}$$



我们希望得到一个闭式（closed form）。

所谓闭式，就是：

> 一个没有求和符号、没有递归、没有省略号，可以直接放进计算器计算的公式



### 分裂法

考虑等比数列：
$S = 1 + x + x^2 + ... + x^{n-1}$

通过乘以**x**并移动项：
$xS = x + x^2 + ... + x^{n-1} + x^n
$

然后相减，求S得
$S = \frac{1 - x^n}{1 - x}$

将$x = \frac{1}{1 + p}$代入得到年金现值的闭式解：
$$V = m \left(\frac{1 - x^n}{1 - x}\right) = m \left(\frac{1 + p - (1/(1 + p))^n}{p}\right)$$



但是： 如果我们一开始不知道这个闭式公式，又该如何推导出来呢？



### 1.2 扰动法

（著名数学家高斯曾利用这种思想求出了求和公式） 

设 $S = \displaystyle\sum_{k=0}^{n-1} x^k = 1 + x + x^2 + \cdots + x^{n-1}$，则

$$xS = x + x^2 + \cdots + x^n$$

两式相减：

$$S - xS = 1 - x^n \implies (1-x)S = 1 - x^n \implies \boxed{S = \frac{1-x^n}{1-x}} \quad (x \neq 1)$$​

**无穷等比级数**（$|x| < 1$）：

$$\sum_{k=0}^{\infty} x^k = \lim_{n\to\infty} \frac{1-x^n}{1-x} = \frac{1}{1-x}$$

**应用：** $p = 0.0533$，$m = 50000$，$n = 20$ 时，$V \approx \$638340$​。  



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Example </strong> 如果改成：每年支付 1 美元，并且永远支付下去，会怎样？ </div>

 结果算出来， 其今天的价值仅约为 19.76 美元。

乍一看可能令人惊讶：永远都有收入，为什么总价值却有限？原因正是：未来的钱会不断贴现，因此越遥远的钱今天越不值钱。

现实中，这种永久支付的债券（Perpetual Bond）虽然罕见，但确实存在。现存最早的一张永久债券由荷兰一家水务公司于 1624 年发行。目前已知世界上仍保存着五张。其中一张被耶鲁大学（Yale）以约 2.4 万美元购得，如今每年仍能获得约 11.35 欧元的收益。

永续年金（*perpetuity*）：$V = \dfrac{m}{p}$



## 二、多项式求和：Ansatz 方法

**问题：** 求 $S = \displaystyle\sum_{k=1}^{n} k^2$。

**Ansatz（待定系数）法：** 猜测答案为 $n$ 的 $d$ 次多项式，代入小值解出系数。

猜 $S = an^3 + bn^2 + cn + d$，代入 $n = 0,1,2,3$：

$$d = 0,\quad a+b+c = 1,\quad 8a+4b+2c = 5,\quad 27a+9b+3c = 14$$

解得 $a = \dfrac{1}{3},\; b = \dfrac{1}{2},\; c = \dfrac{1}{6}$，即

$$\sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}$$

用归纳法验证对所有 $n$ 成立即完成证明。Ansatz Method，也可以理解为试探法

> **注意：** 空求和（*empty summation*）$\displaystyle\sum_{k=1}^{0} f(k) = 0$。



## 三、双重求和

**方法：** 先化简内层和，再化简外层和。

**Example 1.**

$$\sum_{i=1}^{n} \sum_{j=1}^{i} j = \sum_{i=1}^{n} \frac{i(i+1)}{2} = \frac{1}{2}\sum_{i=1}^{n}(i^2 + i) = \frac{n(n+1)(n+2)}{6}$$

**交换求和顺序（*Exchange order of summation*）：**

对 $\displaystyle\sum_{i=1}^{n}\sum_{j=i}^{n} j$，求和域是 $1 \leq i \leq j \leq n$，等价地写成 $1 \leq j \leq n,\; 1 \leq i \leq j$：

$$\sum_{i=1}^{n}\sum_{j=i}^{n} j = \sum_{j=1}^{n}\sum_{i=1}^{j} j = \sum_{j=1}^{n} j^2 = \frac{n(n+1)(2n+1)}{6}$$

**引入双重求和技巧：** 对 $\displaystyle\sum_{j=1}^{n} j\cdot 2^j$，利用 $j = \displaystyle\sum_{i=1}^{j} 1$ 引入双重求和再交换：

$$\sum_{j=1}^{n} j\cdot 2^j = \sum_{j=1}^{n}\sum_{i=1}^{j} 2^j = \sum_{i=1}^{n}\sum_{j=i}^{n} 2^j = \sum_{i=1}^{n}(2^{n+1} - 2^i) = n\cdot 2^{n+1} - (2^{n+1}-2) = (n-1)\cdot 2^{n+1} + 2$$



## 四、积分估计法

对于没有闭合公式的求和（如 $\displaystyle\sum_{k=1}^{n}\sqrt{k}$），用积分给出上下界。

### 4.1 单调递增函数的积分界

> **Theorem (Integral Bound — Increasing).** 若 $f:[1,n]\to\mathbb{R}$ 弱递增，则
>
> $$f(1) + \int_1^n f(x)\,dx \;\leq\; \sum_{k=1}^n f(k) \;\leq\; f(n) + \int_1^n f(x)\,dx$$

**应用：** $f(x) = \sqrt{x}$，$\displaystyle\int_1^n \sqrt{x}\,dx = \dfrac{2}{3}n\sqrt{n} - \dfrac{2}{3}$，故

$$1 + \frac{2}{3}n\sqrt{n} - \frac{2}{3} \;\leq\; \sum_{k=1}^n \sqrt{k} \;\leq\; \sqrt{n} + \frac{2}{3}n\sqrt{n} - \frac{2}{3}$$

### 4.2 单调递减函数的积分界

> **Theorem (Integral Bound — Decreasing).** 若 $f:[1,n]\to\mathbb{R}$ 弱递减，则
>
> $$f(n) + \int_1^n f(x)\,dx \;\leq\; \sum_{k=1}^n f(k) \;\leq\; f(1) + \int_1^n f(x)\,dx$$

### 4.3 广义积分界

> **Theorem (Integral Bound — Improper).** 若 $f:[1,\infty)\to\mathbb{R}$ 弱递减，则
>
> $\displaystyle\sum_{k=1}^{\infty} f(k)$ 收敛 $\iff$ $\displaystyle\int_1^{\infty} f(x)\,dx$ 收敛。若均收敛，则
>
> $$\int_1^{\infty} f(x)\,dx \;\leq\; \sum_{k=1}^{\infty} f(k) \;\leq\; f(1) + \int_1^{\infty} f(x)\,dx$$

**精度改进技巧：** 将 $\displaystyle\sum_{k=1}^{\infty}$ 分解为 $\displaystyle\sum_{k=1}^{m-1}$（直接计算）$+\displaystyle\sum_{k=m}^{\infty}$（积分估计），$m$ 越大界越精。

**Example.** $\displaystyle S = \sum_{k=1}^{\infty} k^{-2}$，$f(x) = x^{-2}$，$I = \displaystyle\int_1^{\infty} x^{-2}\,dx = 1$，得 $S \in [1, 2]$。

拆出前三项再估计尾部可得 $S \in \left[\dfrac{232}{144}, \dfrac{241}{144}\right]$。（实际值 $S = \dfrac{\pi^2}{6}$）





## 五、关键术语速查

| 英文                             | 中文             |
| -------------------------------- | ---------------- |
| *Closed form*                    | 闭合公式         |
| *Geometric series*               | 等比级数         |
| *Perturbation method*            | 扰动法           |
| *Annuity / Perpetuity*           | 年金 / 永续年金  |
| *Ansatz method*                  | 待定系数法       |
| *Empty summation*                | 空求和（值为 0） |
| *Double summation*               | 双重求和         |
| *Exchange order of summation*    | 交换求和顺序     |
| *Integral bound*                 | 积分界           |
| *Weakly increasing / decreasing* | 弱递增 / 递减    |

