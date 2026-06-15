# 实验



有8个实验，你需要构建互联网关键部分——路由、网络接口和TCP协议。

运行环境

- C++23 compiler (GCC 13.3 or later, clang++ 18 or later)
- ubuntu 24.04

## Lab 0

有三个任务

1. 上手telnet请求http服务器
2. 上手OS字节流socket
3. 实现内存可靠的字节流



### 上手telnet请求http服务器

先决条件，在浏览器上请求 http://cs144.keithw.org/hello， 能够观测到结果。

用telnet作为http的客户端，请求服务器

```shell
telnet cs144.keithw.org http
user@computer:~$ telnet cs144.keithw.org http
Trying 104.196.238.229...
Connected to cs144.keithw.org.
Escape character is '^]'.
# if u need to quit, hold down `ctrl` and press `]`, and the type close
```

此时已经建立握手了，接着我们迅速追加几个

```shell
telnet cs144.keithw.org http <回车>
Trying 104.196.238.229...
Connected to cs144.keithw.org.
Escape character is '^]'.
GET /hello HTTP/1.1<回车>
Host: cs144.keithw.org<回车>
Connection: close<回车>
<回车>
```

实际上了解Http协议的话，**就知道请求头后的空行表示请求发送完毕**

下面是一个完整的请求-响应结果

```shell
cs144@vm:~/network$ telnet cs144.keithw.org http
Trying 104.196.238.229...
Connected to cs144.keithw.org.
Escape character is '^]'.
GET /lab0/sunetid HTTP/1.1
Host: cs144.keithw.org
Connection: close

HTTP/1.1 200 OK
Date: Fri, 22 Aug 2025 20:59:01 GMT
Server: Apache
X-You-Said-Your-SunetID-Was: sunetid
X-Your-Code-Is: 544116
Content-length: 111
Vary: Accept-Encoding
Connection: close
Content-Type: text/plain

Hello! You told us that your SUNet ID was "sunetid". Please see the HTTP headers (above) for your secret code.
Connection closed by foreign host.
```

**上手nc实现简单服务器**

一个简单的服务器建立

```sh
netcat -v -l -p 9090
# 或者用nc代替 netcat
cs144@vm:~/network$ nc -v -l -p 9090
Listening on 0.0.0.0 9090
```

用另外一个终端输入，就能看到他们连接成功了

```
telnet localhost 9090
```

### 上手OS字节流socket

（easy：略）

### 实现内存可靠的字节流

![image-20250823160109471](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250823160109471.png)

内存字节流保存尽量用连续序列结构，比如vector，string

如果是deque（双端队列），非连续存储，缓存命中率上会带来难度，1GB/s都达不到

如果是list（双端链表），连续存储，效果也较差



## Lab 1



### 实现Raw Socket 发送

通过一段发送， 另外一端用wireshark抓包分析

```sh
ping -i 0.2 # 每秒发5次
```

现在用写一个用Raw socket发送IP数据包，

### 实现将子串按序放入缓冲区



## Lab 2

