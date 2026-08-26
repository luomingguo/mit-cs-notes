---
title: 洪水填充和迷宫路径查找
type: lecture
lecture: 3
tags: []
status: complete
---
# Lec 3 洪水填充和迷宫路径查找

[toc]

## 1 一些有用的特性

### 1.1 内置函数``zip``

``zip``是一个非常方便的 Python 内置函数，它使我们能够轻松地在多个可迭代对象中找到对应的元素。（“可迭代”意味着我们可以使用 for 循环来遍历它们的所有元素。）例如，考虑以下代码，它用于执行两个列表的元素级减法操作

```python
def substract_lists(l1, l2):
  assert len(l1) == len(l2)
  out = []
  for ix in range(len(l1)):
    out.append(l1[ix] - l2[ix])
  return out
```

我们可以使用 Python 内置函数 zip 以稍微不同的方式来解决这个问题。zip 函数接受多个可迭代对象作为输入，并返回一个可以迭代的结构。在使用 zip 重写上面的 subtract_lists 之前，让我们先看一个小例子，以便熟悉 zip 函数

```python
x = [100, 200, 300, 400]
y = [9, 8, 7, 6]
print(zip(x, y)) # prints <zip object at SOME_MEMORY_LOCATION>

```

这看起来本身并不是很有用，但 zip 对象的存在是为了被迭代。

```python
for element in zip(x, y)
	print(element)
### output
(100, 9)
(200, 8)
(300, 7)
(400, 6)

```

### 1.2  元组解包

`zip` 函数通常与另一个方便的 Python 特性结合使用：通过多重赋值为元组的每个元素命名

```python
# example
i, j = (100, 9)
# 列表也是可以的
x, y, width, height = [0, 0, 100, 200]
```

如果右侧的元组或列表中的元素数量与左侧变量的数量不完全相同，则代码会引发错误。

由于 `zip` 函数创建元组，元组解包是为正在组合的列表的元素命名的方便方法。例如

```python
for x_value, y_value in zip(x, y):
    print(x_value, y_value)
```

我们重写上面列表减法的例子

```python
"""
def substract_lists(l1, l2):
  assert len(l1) == len(l2)
  out = []
  for ix in range(len(l1)):
    out.append(l1[ix] - l2[ix])
  return out
"""

# 重写后
def substract_lists(l1, l2):
  assert len(l1) == len(l2)
  out = []
  for i, j in zip(l1, l2):
    out.append(i - j)
  return out
```

### 1.3）``*``解包

我们还可以在调用函数时将元组或列表解包成其单独的元素。

``get_pixel(image, row, col)``返回（row, col）位置的颜色。函数期望行和列作为单独的参数传递，但是我们的代码将处理由两个元素组成的 (row, col) 对，例如 location = (23, 11)。我们可以使用解包运算符 * 来提取对中的各个部分并将它们作为单独的参数传递

```python
get_pixel(image, *location)
# 与下面的例子相同
get_pixel(image, localtion[0], location[1])
```

与元组解包类似，我们不仅可以在元组上使用这个运算符，还可以在列表上使用，而且元组或列表的长度可以是任意的。但是，如果长度不对，导致我们试图向函数传递错误数量的参数，那么 Python 就会引发错误。

### 1.4) 列表推导

我们想要根据其他列表的内容构建数据。比如 L=[9, 8, 7]，我们想要建立一个新的列表，以 L 的奇数位数字加倍形成。

```python
out = []
for num in L:
  if num % 2 == 1: # if num is odd
    out.append(num * 2)
```

可以写成

```python
out = [number * 2 for number in L if number % 2 == 1]
```

而且支持将多个 for 循环放到列表推导式里面

```python
out = []
for x in <sequence of x>:
  if <condition on x>:
    for y in <sequence of y>:
      if <condition on y>
      	out.append(<some expression using x, y>)
```

可以改写成

```python
[
  <some expression using x, y>
  for x in <sequence of x>
  if <condition on x>
  for y in <sequence of y>
  <condition on y>
]
```

在列表推导中，if 后面可以跟 else 或 elif 吗，就像普通的 if 语句一样？事实证明答案是**否定的，因为这个 if 的目的是过滤结果列表——如果条件为真则产生一个元素，但如果条件为假则完全省略它。在需要 else 行为的情况下，您需要将它放在前导表达式中，使用 Python 的“一行 if”语法（也称为条件表达式或三元运算符）：

```python
[  <some expression> if <some_condition> else <other expression>
  for x in <sequence of x> ]
```

## 2 洪水填充

## 3 Debugging

## 4 迷宫路径查找
