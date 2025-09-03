# Lec 18 数据中心管理

> 阅读资料：
>
> - The Datacenter as a Computer, chapter 2
> - Large-Scale Cluster Management At Google With Borg
> - Tail at Scale

## 背景

数据中心软件栈

![image-20250603012901500](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/683ddf614f9e3.png)

集群管理涉及多个关键方面，包括：

- 集群配置与包管理

  - 决定在集群的哪些节点上安装哪些软件包
  - 常用工具：
    - puppet、chef（通过声明式配置管理服务器）
    - Ansible、Salt（提供简单快速的配置自动化）
    - Docker（通过容器化实现轻量级、隔离的软甲部署）

- 服务发现与命名

  - 解决服务如何在动态环境中相互查找
  - 常用工具：
    - 传统上，采用静态IP/主机名
    - Eureka、Serf、SkyDNS：支持动态服务注册与发现，适应云原生环境

- 应用部署

  - 应用运行的节点在哪？
  - 如何启动/停止和监控

  - 常用工具：
    - PBS、Torque、SGE：传统作业调度系统，适合高性能计算。
    - Capistrano：自动化脚本部署工具。
    - Mesos、Kubernetes：现代容器编排平台，支持动态调度和扩展。
    - OpenStack + Cloud Foundry、Borg：企业级云平台和内部调度框架。

而我们本节Lec的**关注点**放在应用部署上，应用需要多少/什么资源。

## 资源分配

我们知道虚拟机提供了灵活性（迁移、封装上），但是还保留监控和任务分配的挑战，如下图所示。

![image-20250603015537870](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/683de59cda134.png)

我们如何分配资源给不同的App，主要有两大选择，一个是私有，一个是共享。对于前者，每个App接收到私有、且静态的资源，如下图所示。

![image-20250603015709456](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/683de5f83455f.png)

私有资源的好处：

- 简单
- 性能隔离
- 安全隔离
- 允许硬件专用化

![image-20250603020052213](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/683de6d74c6a3.png)

但也带来一些挑战：

- 失败 & 维护
- 低利用率

![image-20250603020134846](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/683de7014bb06.png)

总得来说，私有资源管理在面向用户、可扩展工作负载中至关重要，因为它通过降低尾延迟和优化负载均衡，确保快速响应和高效扩展。专用资源避免了竞争干扰。

尾延迟发生的原因各种各样，包括排队、本地和全局资源共享、后台任务、电源管理和垃圾回收等。即便稀有事件也会显著放大尾延迟。

减少尾延迟的方法：

- 

**集群管理论文**

- 集群调度
  - 提高扩展性，决策延迟
- ML调度： 自动da