---
title: 递归
type: lecture
lecture: 7
tags: []
status: complete
---
# Lec 7 递归

## 1. 递推关系

> **Definition.** 递推关系（*recurrence*）是一个数列的隐式表示：前几项显式给出，后续项定义为前项的函数。

**目标：** 与求和一样，我们希望找到第 $n$ 项的**闭合公式**（*closed form*），而无需逐项计算。

**常见例子：**

| 递推关系                                      | 闭合公式                                                     |
| --------------------------------------------- | ------------------------------------------------------------ |
| $a_0 = 1,; a_n = a_{n-1} + 1$                 | $a_n = n + 1$                                                |
| $F_0 = 0,; F_1 = 1,; F_n = F_{n-1} + F_{n-2}$ | $F_n = \dfrac{1}{\sqrt{5}}\left[\left(\dfrac{1+\sqrt{5}}{2}\right)^n - \left(\dfrac{1-\sqrt{5}}{2}\right)^n\right]$ |

------

## 2. 汉诺塔 (*Towers of Hanoi*)

### 2.1 问题描述

$n$ 个大小各异的圆盘堆在柱 L 上（从下到上由大到小），目标是将所有圆盘移到柱 R，规则：

1. 每次只能移动一个圆盘；
2. 大圆盘不能放在小圆盘上。

### 2.2 递归算法

归纳构造：已知可以移动 $n-1$ 个圆盘，则移动 $n$ 个圆盘的策略为：

```text
H(n, A, B):   // 将盘 1..n 从柱 A 移到柱 B，C 为第三根柱
  if n == 1: 直接移动盘 1 从 A 到 B
  else:
    H(n-1, A, C)   // 将上面 n-1 个盘移到中间柱
    移动盘 n 从 A 到 B
    H(n-1, C, B)   // 将 n-1 个盘从中间柱移到目标柱
```

### 2.3 递推与闭合公式

设 $T(n)$ 为移动 $n$ 个圆盘所需步数：

$$T(1) = 1, \quad T(n) = 2T(n-1) + 1 \quad (n \geq 2)$$

**Guess and Check：** 猜测 $T(n) = 2^n - 1$，用归纳法验证：

- **Base case：** $T(1) = 2^1 - 1 = 1$。✓
- **Inductive step：** $T(n) = 2T(n-1) + 1 = 2(2^{n-1}-1) + 1 = 2^n - 1$。✓

**实际意义：** 64 个圆盘需 $2^{64} - 1$ 步，按每秒一步，约需 **5800 亿年**。

------

## 3. 选择排序 (*Selection Sort*)

**算法：** 每轮扫描找最大元素（$n-1$ 次比较），移至末尾，对剩余 $n-1$ 元素递归。

递推关系：

$$T(1) = 0, \quad T(n) = (n-1) + T(n-1)$$

展开得：

$$T(n) = (n-1) + (n-2) + \cdots + 1 = \frac{n(n-1)}{2} = \Theta(n^2)$$

------

## 4. 归并排序 (*Merge Sort*)

**核心思路：** 已排好的两个有序列表，可以用至多 $n-1$ 次比较合并（*merge*）为一个有序列表。

**算法（$n = 2^k$ 时）：**

```text
MergeSort(X):
  if |X| == 1: return X
  L, R = 前半段, 后半段
  L' = MergeSort(L)
  R' = MergeSort(R)
  return Merge(L', R')
```

**正确性：** 就是归纳法——$MS(1)$ 成立；$MS(2^k)$ 由 $MS(2^{k-1})$ 和正确的合并步骤保证。

**比较次数递推：**

$$T(n) = 2T(n/2) + (n-1)$$

### 4.1 展开法 (*Plug and Chug*)

反复将递推代入自身，寻找规律（$n = 2^k$）：

$$T(n) = (n-1) + 2T(n/2)$$ $$= (n-1) + (n-2) + 4T(n/4)$$ $$= (n-1) + (n-2) + (n-4) + 8T(n/8)$$ $$= \cdots$$ $$= \sum_{j=0}^{k-1}(n - 2^j) + 2^k T(1)$$ $$= kn - (1 + 2 + \cdots + 2^{k-1}) + 0$$ $$= n\log_2 n - (n-1) = \Theta(n \log n)$$

**对比：**

| $n$  | Merge Sort | Selection Sort |
| ---- | ---------- | -------------- |
| 8    | 17         | 28             |
| 16   | 49         | 120            |
| 32   | 129        | 496            |

------

## 5. 主定理 (*Master Theorem*)

### 5.1 适用形式

分治算法的递推通常形如：

$$T(n) = a \cdot T!\left(\left\lfloor \frac{n}{b} \right\rfloor\right) + f(n)$$

其中 $a \geq 1$（子问题数），$b > 1$（规模缩减比），$f(n)$（合并代价）。

> **Theorem (Master Theorem).** 令 $a \geq 1$，$b > 1$ 为常数，$T(n) = a\cdot T(\lfloor n/b \rfloor) + f(n)$，则：
>
> **Case 1：** 若 $f(n) = O(n^{\log_b a - \varepsilon})$（某 $\varepsilon > 0$），则 $T(n) = \Theta(n^{\log_b a})$。
>
> **Case 2：** 若 $f(n) = \Theta(n^{\log_b a})$，则 $T(n) = \Theta(n^{\log_b a} \log n)$。
>
> **Case 3：** 若 $f(n) = \Omega(n^{\log_b a + \varepsilon})$（某 $\varepsilon > 0$），且 $a,f(\lfloor n/b \rfloor) \leq c,f(n)$（某 $c < 1$），则 $T(n) = \Theta(f(n))$。
>
> （将 $\lfloor n/b \rfloor$ 换成 $\lceil n/b \rceil$ 结论同样成立。）

### 5.2 直觉：递归调用树

递归树共 $\log_b n$ 层，节点总数 $\Theta(n^{\log_b a})$。每层工作量为：

$$f(n),; a,f(n/b),; a^2 f(n/b^2),;\ldots$$

- **Case 1（$f$ 增长慢）：** 叶节点数量主导，运行时间 $= \Theta(\text{叶子数}) = \Theta(n^{\log_b a})$。
- **Case 3（$f$ 增长快）：** 根节点代价主导，运行时间 $= \Theta(f(n))$。
- **Case 2（二者平衡）：** 每层贡献相同，运行时间 $= \Theta(f(n) \cdot \text{深度}) = \Theta(n^{\log_b a}\log n)$。

### 5.3 应用示例

| 算法          | 递推                  | $a$  | $b$  | $n^{\log_b a}$ | Case       | 结论                   |
| ------------- | --------------------- | ---- | ---- | -------------- | ---------- | ---------------------- |
| Merge Sort    | $2T(n/2) + n$         | 2    | 2    | $n$            | 2          | $\Theta(n\log n)$      |
| Binary Search | $T(n/2) + 1$          | 1    | 2    | $n^0 = 1$      | 2          | $\Theta(\log n)$       |
| Karatsuba     | $3T(n/2) + \Theta(n)$ | 3    | 2    | $n^{\log_2 3}$ | 1          | $\Theta(n^{\log_2 3})$ |
| Hanoi         | $2T(n-1) + 1$         | —    | —    | —              | **不适用** | $\Theta(2^n)$          |

> **注意：** 主定理有**盲区**。例如 $T(n) = 2T(n/2) + n\log n$：$f(n) = n\log n$ 比 $n^{\log_2 2} = n$ 大，但仅大一个 $\log$ 因子（不是多项式因子），既不属于 Case 2 也不属于 Case 3，需要回归递归树分析或归纳法。

------

## 6. 关键术语速查

| 英文                 | 中文                   |
| -------------------- | ---------------------- |
| *Recurrence*         | 递推关系               |
| *Closed form*        | 闭合公式               |
| *Guess and Check*    | 猜测验证法             |
| *Plug and Chug*      | 展开代入法             |
| *Towers of Hanoi*    | 汉诺塔                 |
| *Selection Sort*     | 选择排序               |
| *Merge Sort*         | 归并排序               |
| *Merge*              | 合并                   |
| *Master Theorem*     | 主定理                 |
| *Divide and conquer* | 分治法                 |
| *Recursion tree*     | 递归调用树             |
| *Karatsuba*          | Karatsuba 整数乘法算法 |
