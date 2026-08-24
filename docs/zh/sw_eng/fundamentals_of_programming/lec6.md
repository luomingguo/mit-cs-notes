---
title: 递归和迭代器
course: 6.1010 程序设计基础（Python版）
course_id: '6.1010'
lecture: 6
kind: system
tags: []
status: complete
---
# Lec 6 递归和迭代器

[toc]

## 递归模式

**递归（recurrency）**通过在更小或更简单的子问题上递归调用同一个函数重复计算。**迭代器（Interator）**这是通过 for 和 while 循环来重复运算。

那如果我想出一个可迭代的版本，那我还需要用递归吗？ 不需要。 **任何能够写成递归的函数，都能写成迭代器版本。**

我们可以用循环迭代编写的任何函数，也可以用递归方式编写。**重要的是，能够以两种方式思考**，并选择对最自然和最合适的方式进行思考。

我们从这个例子出发
$$
n! = \begin{cases} 1 & \text{if } n=0 \\ n \times (n-1)! & \text{otherwise} \end{cases}\
$$
或者
$$
n! = \prod_{i=1}^{n} i
$$
第一个定义是递归的，但是第 2 个是迭代的。根据定义直接翻译成代码就是

```python
def factorial(n):
  if n == 0:
    return 1
  else:
    return n * factorial(n-1)
```

```python
def factorial(n):
  out = 1
  for i in range(1, n+1):
    out *= i
  return out
```

以下是两个的比较

- 迭代版本可能更加高效因为他不需要为递归调用创建新的帧
- 递归版本感觉更简单，更加符合数学定义
- 这两个版本对于不合法的输入可能表现有所不同，比如 n < 0

在 python 中，默认的调用**栈深度是 1000**，超过了会报 RecursionError。

### **列表型递归**

剩下部分看一下几个重复计算的常用类型，取决于数据类型，比如列表类型，树类型和图类型。

下面看一下 sum_list 的迭代和递归实现方式

```python
def sum_list(x):
  """
  迭代式
  """
  sum_so_far = 0
  for num in x:
    sum_so_far += num
  return sum_so_far
```

```python
def sum_list(x):
  """
  递归式
  """
  if not x:
    return 0
  else:
    return x[0] + sum_list(x[1:])
```

**使用辅助函数积累结果**

- 迭代版: start with `0`, then add `x[0]`, then `x[1]`, then `x[2]`, ..., finally add `x[n-1]`
- 递归版: start with `0`, then add `x[n-1]`, then `x[n-2]`, then `x[n-3]`, ..., finally add `x[0]`

递归版将添加项保存起来，以便在重新组合步骤时将递归子问题的结果结合。但是，我们不必这样写。我们可以写一个递归版本，通过定义一个递归辅助函数，将到目前为止计算的部分和传递给它，这样就可以进行加法。

```python
def sum_list(x):
	def sum_helper(sum_so_far, lst):
    if not lst:
      return sum_so_far
    else:
      sum = lst[0]
      rest = lst[1:]
      return sum_helper(sum_so_far + num, reset)
  return sum_helper(0, x)
```

sum_helper 函数是一个递归辅助函数。它需要与原始 sum_list 不同的函数，因为它有一个新参数 sum_so_far，用于跟踪到目前为止计算的部分总和。递归调用稳定地添加到 sum_so_far，直到最终达到列表的末尾（基本情况），此时完成的总和作为唯一结果返回。sum_list 的主体通过以 0 为 sum_so_far 的初始值调。

#### 优化

在 Python 中列表型递归会有几个性能问题

- 每次递归调用创建新帧，递归深度游限制。但是对于二分法，这就不是个问题了
- 在第一个/剩余分解中，每个递归调用都需要复制列表的其余部分，使用像 lst[1:]这样的片段。在整个计算过程中，所有这些复制相加的时间都与列表长度的平方成正比。（为什么？如果原始列表的长度为 n，则第一个调用将复制长度为 n-1 的片段，下一个递归调用将复制长度为 n-2 的片段，依此类推直到达到列表的末尾。由于（n-1）+(n-2)+...+1 ={n(n-1)/2，这意味着花费了 O(n^2)的时间来复制。）

这些可以通过几个优化解决

- 递归深度限制可以通过尾递归优化来解决。如果递归被写成这样，即递归调用是函数主体中执行的最后一件事 -- 就像上面的 sum_list 递归版本中的返回 sum_helper(...) 一样 -- 那么这个递归调用被称为尾调用，因为它恰好在函数必须完成的工作的最后做出。 尾递归优化意味着，当运行时系统遇到尾调用时，它推断出它将不再需要当前调用的帧，并且可以简单地为新的递归调用重用它，而不是创建一个新的帧。通过尾递归优化，对 sum_helper 的每个递归调用都只是重用相同的帧，递归深度永远不会超过 1，递归版本的性能基本上就像一个循环。 尾递归优化不能应用于不在函数的最末端的递归调用。如果 sum_list 被编写成我们最初的样子，即返回 x[0] + sum_list(x[1:])，那么这不是尾调用，因为函数仍然需要在递归调用返回后做一些工作（添加 x[0]）。如果需要保留创建的函数对象的帧，则也会阻止尾递归优化。不幸的是，Python 没有实现尾递归优化，但其他语言却有。

- 列表复制问题可以通过实现一个链接表解决，一个列表剩下的内容可以通过常数时间获得，但是 python 并没有这种结构，因此另外的一个方法避免复制列表，就是使用索引代表剩下的列表比如

  ```python
  def sum_list(x, i=0, sum_so_far=0):
    if i >= len(x):
      return sum_so_far
    else:
      return sum_list(x, i+1, sum_so_far + x[i])
  ```

### 树形模式

树形模式数据，可能会反问任意深度的数据。 例子如下

```python
def sum_nested(x):
  """
  >>> sum_nested([[1, 2], [3, [4, 5]], [[[[[6]]]]]])
  21
  """
  if not x:
    return 0
  elif isinstance(x[0], list):
    return sum_nested(x[0]) + sum_nested(x[1:])
  else:
    return x[0] + sum_nested(x[1:])

```

为什么我们认为 sum_nested 的输入呈树状？因为 x 中的每个子列表就像是树的内部节点，具有可能进一步是子列表的子节点，直到我们到达简单数字，它们就是叶子。树状数据具有直观的递归分解，反映了树结构：我们对所有子节点进行递归调用，直到到达叶子。但请注意，这里编写的 sum_nested 不仅递归地分解了树结构，还递归地分解了子节点列表。

### 图模式
