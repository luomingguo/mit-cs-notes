---
title: GPU 架构
course: 软件性能工程
lecture: 23
kind: system
tags: []
status: complete
---
# Lec 23 GPU 架构

图形处理单元（ Graphics Processing Units， GPU），目标是实现复杂的实时 3D 场景。

## 本讲导览

- 3 个伟大思想
- 探索真实的 GPU 设计
- GPU 的存储层次：将数据移到处理器上

## GPU 的三大伟大思想

现代 GPU 是如何以“高吞吐量”的方式执行程序的。与传统 CPU 着重低延迟不同，GPU 更关注每秒能处理多少个线程（吞吐量），这对大规模并行任务特别有效。

理解现代 GPU 执行代码的三个核心概念，掌握这些概念后能帮助你：

- 理解 GPU 核心空间设计（以及一些专为吞吐量设计的 CPU）
- 理解 GPU 核心与 CPU 核心之间的异同
- 优化你的着色器 / 计算核函数（compute kernels）
- 建立直觉：哪些工作负载适合这种架构？

首先我们看，GPU 里面有什么？

![image-20250611033616536](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/684889349cdac.png)

如上图所示，GPU 的组成

- 有多个着色处理器核
- 多个纹理单元
- Input assembly： 将顶点数组（Vertex Buffers）组装成图元（点、线、三角形）
- Rasterizer： 把图元转换成屏幕像素（片元），进行插值计算
- Output Blend

我们看到 GPU 是一种异构芯片多处理器。GPU 最初是为图形渲染而优化，后来扩展到了通用计算（GPGPU）。
