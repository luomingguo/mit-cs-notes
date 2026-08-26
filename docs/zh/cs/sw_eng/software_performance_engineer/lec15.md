---
title: 缓存参数无关算法
course: 软件性能工程
lecture: 15
kind: system
tags: []
status: complete
---
# Lec 15 缓存参数无关算法

缓存参数无关算法（Cache Oblivious Algo.），可忽略的是缓存大小 ，是一种能够自动调整到运行机器上缓存大小的算法，以达到良好的缓存效率，并且代码不需要对缓存等机器有任何的了解。与之相对应的是缓存感知算法（Cache-aware Algo），代码会将放入到缓存当中。

- Demaine, Erik. “[Cache-Oblivious Algorithms and Data Structures](https://erikdemaine.org/papers/BRICS2002/)” in *Lecture Notes from the EEF Summer School on Massive Data Sets*, BRICS (2002).
- Frigo, Matteo, Charles Leiserson, et al. “[Cache-Oblivious Algorithms](https://dl.acm.org/citation.cfm?id=2071383).” *ACM Transactions on Algorithms (TALG)* 8, no. 1 (2012): article no. 4.

## 本讲导览

- 热扩散模拟
- 缓存无关的模板计算
- 缓存和并行性
- 缓存无关的排序

## 热扩展模拟

![image-20241001193302354](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fbddf175968.png)

著名的热扩展函数

从 1 维的热方程开始

![image-20241001193708588](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fbdee7a6f80.png)

> 如何实际编写代码来模拟这种差异？

有限差分近似法

![image-20241001212453026](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66fbf8284dd87.png)

3 维模版计算

## 缓存参数无关的模板计算
