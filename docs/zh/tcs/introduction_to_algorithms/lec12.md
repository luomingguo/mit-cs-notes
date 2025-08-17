# Lec 12 Bellman-Ford

这节课介绍一个基于图复制和DAG松弛Bellman-Ford版本算法，这个算法能够以$O(|V||E|)$的时间复杂度和空间复杂度下解决SSSP问题的，并且能够返回从 s 到 v 的路径上可达的负权环，对于任何满足$\delta(s, v) = -\infty$都适用

- 简单最短路径
- 负权重环见证者
- Bellman-Ford算法

## 复习

![截屏2024-08-01 03.13.26](http://14.103.135.111:49153/i/66aa8cdd1c9f8.png)

> 给定无向图G， 返回G是否包含负权重环？

Solution: 如果G中存在一条负权重边，则返回Yes，时间复杂读O(|E|)

因此本讲中，讨论限制为有向图。

> 给定运行时间为O(|V|(|V| + |E|))的SSSP算法A，展示如何在它O(|V||E|)时间内解决SSSP问题。

Solution： 

- 运行BFS或者DFS找到从s可达的顶点，时间复杂度为O(|E|)

- 将每个s不可达的顶点标记为$\theta(s, v) = \infty$​，时间复杂度为O(|V|)
- 构建图G’=(V', E')，其中仅包含从s可达的顶点，时间复杂度为O(|V|+|E|)
- 在G‘上从s运行A
- G'是连通的，所以|V'| = O(|E'|) = (|E|)，因此A的运行时间是O(|V||E|)



## 简单最短路径

- 如果图中包含环和负权重，可能会有负权重环
- 如果图中不包含负权重环，则最短路径是简单的
- 断言1：如果$\delta(s, v)$是有限的，则存在一条道v的简单路径。
- 证明： 通过反证法
  -  假设没有简单的最短路径，设$\pi$为具有最少顶点的简单路径
  -  $\pi$不是简单路径，所以$\pi$中存在环C； C具有非负权重（否则$\delta(s, v) = -\infty$)
  -  去掉$\pi$中的C形成路径$\pi'$，其顶点更少且权重w($\pi'$) $\le$ w($\pi$​)
- 由于简单路径不能重复顶点，有限的最短路径最多包含|V| - 1条边。

## 负权重环见证者

- k-edge 距离$\delta_k(s, v)$: 从s到v使用不超过k条边的任意路径的最小权重
- 思路： 计算所有的$v\in V$的$\delta_{|V|-1}(s, v) 和 \delta_{|V|}(s, v)$​
  - 如果$\delta(s,v) \neq -\infty$则$\delta(s,v) = \delta_{|V|-1}(s, v)$， 因为最短路径是简单的（或者不存在）
  - 如果$\delta_{|V|}(s, v) \lt \delta_{|V|-1}(s, v)$
    - 存在一条更短的非简单路径v，所以$\delta_{|V|}(s, v) = -\infty$
    - 成v为（负环）见证者
    - 但是可能存在最短路径权重为$-\infty$但不是见证者的顶点
- 断言2： 如果$\delta(s,v) = -\infty$，则v可从一个见证者到达
- 证明： 只需证明： 从s可到达的每个负权重环都包含一个见证者
  - 考虑一个从s可到达的负权重环C
  - 对于C中的每个顶点v，令v'为v在C中的前驱，其中$\sum_{v∈C}w(v′,v)<0$
  - 则$\delta_{|V|}(s, v) \leq \delta_{|V|-1}(s, v') + w(v', v)$（右边为某条不超过|V|个顶点的路径的权重
  - 所以$\delta_{|V|}(s, v) \leq \delta_{|V|-1}(s, v') + w(v', v) \lt \delta_{|V|-1}(s, v)$​
  - 如果C中不包含见证者，则对所有$v\in C$，满足$\delta_{|V|}(s, v) \ge \delta_{|V|-1}(s, v)$​，这就产生了矛盾

## Bellman-Ford算法

原始的Bellman-Ford算法较为简单，但是功能稍弱。它仅使用O(|V|)的空间，以相同的时间复杂度解决SSSP问题，但是只能检测负权环是否存在。它基于松弛框架。算法很直接，首先初始化距离估计，然后再图中进行$|V| - 1$轮松弛操作。这个算法的主张是，如果图中不存在负权环，在算法结束时，对于所有的顶点$v\in V$， 有$d(s, v) = \delta(s,v)$​，否则，如何仍有任何边可松弛，则图中包含一个负权环

```python
def bellman_ford(Adj, w, s):
  # 初始化
	infinity = float('inf')
  d = [infinity for _ in Adj]
  parent = [None for _ in Adj]
  d[s], parent[s] = 0, s
  V = len(Adj)
  for k in range(V-1):
    for u in range(V):
      for u in Adj(u):
        try_to_relax(Adj, w, d, parent, u, v)
  for u in range(V):
    for v in Adj[u]:
      if d[v] > d[u] + w(u, v):
        raise Exception('Ack! There is a negative weight cycle!')
  return d, parent
```

该算法的总体结构与通用的松弛范式相同，但吸纳值了可以处理边的顺序。具体来说，算法在$|V| - 1 $​轮次中，松弛了图中的每条边，以下引理证明了该算法的正确性。

【引理】在 Bellman-Ford 算法的第 i 轮松弛结束时，对于任意顶点v，如果从s到v的最短路径经过至多 i 条边，那么$d(s, v) = \delta(s, v)$

证明： 对 i 轮的归纳证明。 在算法开始时，唯一从s出发且经过至多0条边的顶点是s，基本情况成立，假设在第$i-1$轮结束时命题成立。令 v 是从s到v的最短路径经过至多 i 条边的顶点。如果 v 有一条经过至多 i - 1 条边的最短路径，那么在第 i 轮之前  $d(s, v) = \delta(s,v)$，并且在第 i 轮结束时仍然成立，这依据是上界性质

