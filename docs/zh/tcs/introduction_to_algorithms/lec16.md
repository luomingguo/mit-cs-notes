# Lec 16 动态规划, Part2: LCS, LIS, Coins



## 总览

- 最长公共子串(LCS，Longest Common Subsequence)
- 最长增长子串(LIS，Longest Increasing Subsequence )
- 交替硬币游戏(Alternating coin game)



## 最长公共子串（LCS）



给定两个系列A & B，找到最大的公共子串（无需要连续）

Ex： Hieroglyphology 和 Michelangelo，其LCS为 hello 或者是 heglo 或 iello 或者ieglo，长度都是5

- **S**ubproblem

  - $L(i, j) = LCS(A[i:], B[j:]) \text{ for }0 <= i <= | A |, 0 <= j <= |B|$

- **R**elate: 

  - 首字母要么匹配，要么不匹配

  - 如果首字母匹配，则某个LCS会使用它们

  - 如果某个 LCS 使用了 A[i] 的第一个字符，而没有使用 B[j] 的第一个字符，匹配 B[j] 也是最优的

  - 如果它们不匹配，它们不能同时出现在最长公共子序列中

    **猜测**A[i]和B[j]其中有一个不在LCS中
    $$
    L(i, j) = 
    \begin{cases}
    L(i+1, j+1) + 1 \text{  if A[i] = B[j]} \\
    \max \set{L(i+1, j), L(i, j+1)}  \text{  其他}
    \end{cases}
    $$

- **T**opo

  - 逐步减小 ``i+j``
  - 可以通过bottom-up方法： 先减小``i``，再减小``j``

- **B**ase

  - $ L(|A|, j) = 0 = L( i, |B| )$ （其中有一个字符串为空）

- **O**riginal

  - 最长公共子序列为L(0, 0)
  - 保存父指针用于重构序列
  - 如果父指针同时增加索引值，则将该字符添加到LCS中

- **T**ime

  - 子问题数目： (|A| + 1) · (|B| + 1)
  - 每个子问题的工作量：O(1)
  - 总共的运行时间 $O(|A|·|B|)$​



**LCS 子问题 DAG**

![](http://14.103.135.111:49153/i/666d5b886cbe8.png)

（边缘的是Base case， 每个节点都是一个子问题，对应于什么是最长公共子序列，比如（3，2）这个点而言， 子问题就是EIR和ABIT的LCS是什么？箭头是父指针）



```python
def lcs(A, B):
  a, b = len(A), len(B)
  x = [[0] * (b+1) for _ in range (a+1)]
  for i in reversed(range(a)):
    for j in reversed(range(b)):
      if A[i] == B[j]:
        x[i][j] = x[i+1][j+1] + 1
      else:
        x[i][j] = max(x[i+1][j], x[i][j+1])
  return x[0][0]
```







## 最长增长子序列（LIS）

问题描述： 给定长度为n的序列A，找到一条最长（可不连续）字母严格递增的子序列，即LIS(A)

Ex: CARBOHYDRATE ==> ABORT

尝试的解决方案：

- 子问题自然是A的前缀或者后缀，以后缀为例A[i:]
- 一个很自然的的问题是A[i]是否在LIS中？（需要进行分支）
- 但是，如何在A[i+1:]上递归并保证是递增子序列呢？
- 修正：给子问题添加**约束**，提供足够的结构来实现递增性



SRTBOT分析：

- **S**ubprobs
  - 令L(i) = 后缀$A[i:]$最大递增子序列的长度，即$LIS(A[i:])$，其中 $0\le i \le |A|$
  - 约束: 以A[i]为开始（也就是说A[i]在最大递增子序列里面）
- **R**elate
  - 已知第一个元素是A[i]，那么第二个元素是哪个呢？
    - 可以是任何$A[j]\text{，其中} j  > i \text{ 且 } A[j] > A[i]$ ，
    - 也可能A[i]是LIS最后一个元素
  - $L(i) = 1 + \max \set{L(j) | i < j < n, A[i] < A[j]} ∪ \set{0} $
  - 错误的思路： 我们思考i是不是在LIS当中，在和不在分别讨论。第一反应是L(i) =  max{L(i+1), 1+L(i+1)}， 因为这是子问题约束的关系
- **T**opo order
  - for  i = |A|, ..., 0
- **B**ase:
  - 无需，因为我们考虑的就是A[i]就是最后一个LIS元素
- **O**riginal: 
  - 那个是LIS的第一个元素呢？ **靠猜**
  - 我们LIS(A)的长度为$ \max \set{L(i) | 0\le i\le|A|}$
  - 需要存储子问题父指针来重构序列
- **T**ime: 
  - 子问题个数： θ(|A|) 
  - 每个子问题的工作量： O(|A|)
  - 总的时间复杂度：$O(|A|^2)$ 

> 练习题：  加速到$O(|A|\log{|A|})$完成，通过将每个子问题的工作量减到$O(\log{|A|})$ ，提示AVL增强树

我们用了两次暴力解法， 一个是求以i为开头的的LIS，第二个是，我们选择了j暴力尝试所有可能。

**LIS子问题的DAG图**

![](http://14.103.135.111:49153/i/666e9fbdbde9f.png)



```python
def lis(A):
  a = len(A)
  l = [1] * a
  for i in reversed(range(a)):
    for j in range(i, a):
      if A[j] > A[i]:
        x[i] = max(x[i], 1+x[j])
  return max(x)
```





## 交替硬币游戏

给定一系列n个硬币，其价值为 $v_0, ... v_{n-1}$​，两个玩家轮流拿硬币，每轮可以从剩下的硬币中取第一个或者最后一个硬币，我的目标最大化我拿到的硬币总价值，我先开始。

### 方案一： 子问题扩展

子问题扩展， subproblem expansion的SRTBOT分析：

- **S**ubprobs:   $X(i, j, p)$ = 我能在 $v_i, .... , v_j$拿到的最高值硬币, p代表是你还是我
- **R**elate:  
  - 玩家p必须选择 第$i$ 个或者 $j$ 个硬币（需要猜！）
  - 如果p=me， 那么我将得到那个值，否则什么都没得到
  - 然后轮到另外一个玩家
  - $X(i, j, me) = \max \set{X(i+1, j, u) + v_i, X(i, j-1, u) + v_j}$
  - $X(i, j , u) = \min \set{X(i+1, j, me), X(i, j-1, me)}$
- **T**opo:  增大  ``j-i``
- **B**ase: 
  - $X(i, i, me) = v_i $
  - $X(i, i, u) = 0$
- Original problems:
  -  $X(0, n-1, me)$
  -  保存父指针来重构策略
- **T**ime analysis: 
  - 子问题个数： $\Theta(n^2)$
  - 每个子问题的工作量: $\Theta(1)$
  - 总共时间复杂度: $\Theta(n^2)$

**子问题DAG**

![](http://14.103.135.111:49153/i/666ea842acaff.png)

以上，叫**子问题扩展**





### 方案二： 零和博弈

零和博弈：我拿走所有你不拿的硬币，没有合作关系

- **S**ubproblems:
  - $x(i, j) = $我能拿到的最大分数，在基于硬币$v_i, ...,v_j$的情况下
  - 其中 $0\le i \le j \lt n$
- **R**elate
  - 我必须选择要么是第 i 个 要么是第 j 个
  - 因此，你能够获得 $x(i+1, j)$或者$x(i, j-1)$，分别对应于我选择硬币i或j
  - 为了计算我能获得的价值，从总硬币值中减去这一部分
  - $x(i, j) = \max \set{v_i + \sum^j_{k=i+1} v_k - x(i+1, j), v_j+\sum_{k=i}^{j-1}v_k-x(x, j-1)}$
- **T**opo order
  - 逐步增大 ``j-i``
- **B**ase
  - $x(i, i) = v_i$
- **O**riginal
  - $x(0, n-1)$
  - 存储父指针
- **T**ime Analysis
  - 子问题数目 $\Theta(n^2)$
  - 每个子问题的工作量 $\Theta(n) $，计算总和
  - 运行时间为 $\Theta(n^3)$​

**子问题DAG**

![](http://14.103.135.111:49153/i/666ea862d10b2.png)

> 练习题： 将复杂度提升到$\Theta(n^2)$，通过以$\Theta(n^2)$时间内预处理所有和\sum^j_{k=i}v_k$


