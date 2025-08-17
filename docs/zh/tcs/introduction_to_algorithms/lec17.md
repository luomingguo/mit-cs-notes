
# Lec 17 动态规划, Part 3: ASPS, Parens, Piano

## 总览

- Bellman-Ford SSSP
- Flayd-Wallshall APSP
- 算术括号问题
- 钢琴指法问题



## 单源最短路径：Bellman-Ford 算法

SRTBOT分析：

- Subproblems
  - 扩展子问题，使其无环
  - $\delta_k(s, v) = $ 从 s 到 v 的最短路径权重， 最多使用 k 条边
  - for $v ∊V $ & $ 0 <= k <= |V| $

- Relate

  - $𝛿\_k(s, v) = \min \set{𝛿\_{k-1}(s, u) + w(u, v) | u ∊ Adj(v) } ∪ {𝛿_{k-1}(s, u)}$

  - guessing "lost edge(u, v) on shortest s->v path"

观察到，𝛿\_k(s, v) = 𝛿\_{k-1}(s, u) + w(u, v)，这个递归不存在循环。如果随着k增长，都是满足上述等式，

- Topological order: increasing k

Topo order of G 

- Base case: 𝛿_{0}(s, s) = 0 , 𝛿\_{0}(s, v) = ∞ for v ≠ s

- Original: 𝛿\_{|v| -1}(s, v) for v ∊ V: 𝛿\_{|v|}(s,v) for neg-weight cycle detection 

- Time: 
  - 子问题数目：$|V| \times (|V| + 1)$
  - 每个子问题的工作量$\delta_k(s, v): O(deg_{in}(v))$
  - 总的时间：$\sum^{|V|}_{k=0}\sum_{v \in V}O(|deg_{in}(v)|) = \sum^{|V|}_{k=0}O(|E|) = O(|V|·|E|)$

 

## 全源最短路径: Floyd-Warshall 算法 

弗洛伊德演算法。

顶点标上序号1, 2, ... |V|

- subprobs: d(u, v, k) = u->v最短路径的权重，其中仅用到在集合{u, v} ∪ {1, 2, ...,k}的顶点 for  u, v ∊ V & 0 <= k <= |V|,  θ(|V|^3)

- Relate: d(u, v, k) = $\min \set{d(u, v, k-1), d(u, k, k-1) + d(k, v, k-1)}$

  - u --(1,...,k-1)---> v (第一种情况，不需要使用k).即 k ∉SP
  - u --(k-1)--->k, k ---(k-1)--->v, 即 k ∊SP

- topo: increasing k, for k = 0, 1, ... |v|  for u ∉ V for v ∊V

- Base: S(u, v, 0) = 

  1. 0 if u = v ; 
  2. w(u,v) if (u, v) ∊ E
  3. ∞ otherwise

  并且假设没有负权重环

- Orignialfeas 



## 钢琴指法问题

问题描述：

给定序列$t_0, t_1, ...t_{n-1}$ 单音符，用右手弹奏，右手手指分别是1,2，...，f，给定过渡从音符t及其手指f，到音符t'及其手指f'的难度度量$d(t, f, t', f')$

- 如果$ 1 \lt f \lt f' $ 且 $t > t'$，则是不舒适的
- 连续（平滑）演奏要求 $t = t'$ （否则罚分是无限大）
- 弱指规则，尽量避免使用 $f' \in \set{4, 5}$
- $\set{f, f'} = \set{3, 4}$ 是令人烦恼的

目标： 为音符分配手指，以最小化总难度

**第一次尝试SRTBOT分析：**

- Subproblem
  - x(i) = 最小化的演奏难度分，弹奏音符为$t_i, t_{i+1}, ..., t_{n-1}$

- Relate
  - 猜测第一个手指， 给$t_i$ 分配 f 手指
  - $x(i) = \min \set {x(i+1) + d(t_i, f, t_{i+1}, ?) | 1 \le f \le F}$
  - 没有足够的信息来填写 ？ 
  - 问题
    - 需要知道在开始$x(i+1)$时使用哪个手指
    - 不同的起始手指可能会影响 $x(i + 1)$ 和 $d(t_i, f, t_{i+1}, ?)$​ 的结果
  - 解决方案
    - 需要一个表来映射起始手指到$x(i+1)$的最优解
    - 也就是说，需要通过起始条件来扩展子问题

**最终解决方案SRTBOT分析**：

- Subproblem
  - $x(i, f)$ 最小化的演奏难度分，弹奏音符为$t_i, t_{i+1}, ..., t_{n-1}$，并且手指f在字符$t_i$
  - For $ 0 \le i \lt n $ 且 $1 \le f \le F$
- Relate
  - 猜测下个手指： 将 f' 分配给 $t_{i+1}$
  - $x(i, f) = \min \set{x(i+1, f') + d(t_i, f, t_{i+1}, f') | 1 \le f' \le F}$
- 拓扑顺序
  - 逐步减小 i （任何 f 顺序）

- Base
  - $x(n-1, f) = 0 $ 没有转换
- Original
  - $\min \set{x(0, f) | 1\le f \le F}$
- Time
  - Θ(n · F) subproblems 
  - Θ(F) work per subproblem 
  - $Θ(n · F^2)$

