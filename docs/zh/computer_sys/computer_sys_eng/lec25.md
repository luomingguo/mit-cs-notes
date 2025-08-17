

# Lec 26 网络攻击

前面攻击者试图通过观察或者篡改数据包；这次有新的目标：使服务宕机。采用的策略是让服务拥塞，让服务花时间处理对手的请求，以至于无法处理合法的请求，这就做DoS（拒绝服务）攻击。从多个机器上发起攻击，那我们称之为DDos（分布式Dos）攻击。

## 思考题

1. 如何让一台机器成为僵尸网络的一部分（高层次解释）
2. 比较/对比两种不同类型的网络入侵检测系统（NIDS）
3. 解释挂载DDos攻击的方式（比如，SYN 洪水攻击、DNS 放大攻击）
4. 识别每次攻击消耗的资源（比如，网络、存储等）



## 僵尸网络

当今攻击者使用的基本方法。僵尸网络就是一个庞大的被攻击者攻陷的机器构成的集合。对于个人而言，你可以去租用它。僵尸网络的机器联系命令与控制（C&C）服务器，接收命令。

![image-20250305153450556](http://14.103.135.111:49153/i/67ff0923cc732.png)

![image-20250305153528305](http://14.103.135.111:49153/i/67ff0a0439682.png)



## 网络入侵检测系统

Network intrusion detection system(NIDS)，检测方法分为两种：

1. 基于签名的入侵检测系统。基于签名的 IDS 通过寻找特定的模式来检测攻击，例如网络流量中的字节序列或恶意软件使用的已知恶意指令序列。但它难以检测新型攻击，因为没有现成的模式可供识别。
2. 基于异常的入侵检测系统。基于异常的入侵检测系统主要是为了检测未知攻击而引入的，部分原因是恶意软件发展迅速。基本方法是使用机器学习创建可信活动的模型，然后将新的行为与该模型进行比较。由于这些模型可以根据应用程序和硬件配置进行训练，基于机器学习的方法相比传统的基于签名的 IDS 具有更好的泛化能力。

我们来看一条基于签名的IDS的规则：

```css
alert	tcp	$EXTERNAL_NET	any	->	$HOME_NET	7597	
(msg:"MALWARE-BACKDOOR	QAZ	Worm	Client	Login	access";	
flow:to_server,established;	content:"qazwsx.hsq";	
metadata:ruleset	community;	reference:mcafee,98775;	
classtype:misc-activity;	sid:108;	rev:11;)
```

- alert： 规则的动作，表示满足条件出发警报
- $EXTERNAL_NET： 这是变量，通常是在网络配置中定义的
- any: 源端口
- ->: 流量方向
- $HOME_NET: 变量，受保护的内部网络
- msg: 这是触发警报时显示的消息

- flow:to_server,established: 这表示规则只会在已建立的 TCP 连接且流量是发送到服务器的情况下生效。
- content:"qazwsx.hsq": 这是规则要匹配的内容。在数据包中搜索特定的字符串"qazwsx.hsq"
- reference:mcafee,98775 : 规则与 McAfee 公司的某个病毒定义或威胁报告（ID 98775）相关联
- classtype: 规则分类类型，表示一个杂项活动
- sid:108: 这是规则的唯一标识符，用于区分不同的规则
- rev:11: 这是规则的版本号，指示该规则已经被更新了 11 次



为了展示NIDS而言的复杂性（高层次上）

```python
for each packet:
  search packet for "root"
```

问题：字符串可能跨数据包

```python
stream = []
for each packet:
  add packet data to stream
  search stream for "root"
```

问题：数据包到达可能是乱序

```
stream = []
for each packet:
	get sequence number
  add to stream in the correct order
  search stream for "root"
```

问题： 实际上还需要维持大量的状态； 它甚至不能工作

![image-20250305162551543](http://14.103.135.111:49153/i/67ff0ec18ad47.png)

额外的挑战： 一些DDos攻击模仿合法的流量

![image-20250305162646531](http://14.103.135.111:49153/i/67ff0ed4b076f.png)