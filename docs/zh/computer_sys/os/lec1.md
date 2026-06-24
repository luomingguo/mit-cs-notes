# Lec 1 OS 总览

## 总览

- 操作系统定义
- 操作系统目标
- OS内核一般提供什么服务？
- OS设计及实现的挑战
- 系统调用



本讲定位：建立"操作系统是什么、为什么需要、提供什么"的整体图景，并通过 `fork`/`exec`/`pipe`/重定向四个例子，理解系统调用接口如何成为应用观察 OS 的窗口。



## 0. 本讲脉络

```
什么是 OS ──► OS 的目标 ──► 内核提供的服务 ──► 设计挑战(权衡)
                                                    │
                                                    ▼
                                      系统调用：应用与内核的唯一接口
                                                    │
                          ┌─────────────┬───────────┴────────────┬──────────────┐
                          ▼             ▼                        ▼              ▼
                        fork          exec                     pipe          redirect
                     (复制进程)    (替换内存映像)            (进程间通信)    (重定向 FD)
```

---

## 1. 操作系统是什么

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（操作系统 <i>operating system</i>）</strong>一种位于<strong>用户应用程序</strong>（shell、数据库等）与<strong>硬件</strong>之间的软件。它通过<strong>系统调用 (<i>system call</i>)</strong> 对外提供文件、进程、内存、网络等服务，对内管理硬件资源，并允许应用以受控方式与硬件交互。</div>

可以从两个互补的角度理解 OS：

- **资源管理者 (*resource manager*)**：在多个应用之间复用 (*multiplex*) 有限的 CPU、内存、磁盘、网络等硬件。
- **抽象提供者 (*abstraction provider*)**：把裸硬件包装成方便、统一、可移植的接口（如"文件"而非"磁盘扇区"，"地址空间"而非"MMU 寄存器"）。





## 2. 操作系统的目标

1. **支撑应用运行**——这是存在的根本理由。
2. **抽象硬件**——提供方便、简单、可移植的接口，对应用隐藏硬件复杂性。
3. **复用硬件 (*multiplexing*)**——让多个应用/用户共享同一套硬件，典型手段是<strong>虚拟内存</strong>与<strong>用户态/内核态</strong>分离。
4. **安全性 / 隔离性 (*isolation*)**——保证每个应用独立运行，错误或恶意行为不会扩散到其他应用或内核。
5. **高性能**——抽象不应带来过大的开销。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（贯穿全课的主线）</strong>目标 2–5 之间天然存在张力：<strong>抽象越强 → 越方便但越可能损失性能与灵活性；隔离越严 → 越安全但越限制应用能力</strong>。OS 设计本质上是在这些维度间做权衡，本课后续几乎每一讲都在讨论某个具体的权衡点。</div>



## 3. 内核一般提供哪些服务

| 类别     | 内容                                  |
| -------- | ------------------------------------- |
| 进程管理 | 创建、调度、销毁进程/线程             |
| 内存分配 | 物理内存与虚拟地址空间管理            |
| 文件管理 | 文件、目录、文件描述符                |
| 访问控制 | 权限检查、隔离                        |
| 其他     | 进程间通信 (*IPC*)、网络、时钟/定时器 |





## 4. OS 设计与实现的挑战

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（核心设计权衡）</strong>
<ul>
<li><strong>性能 vs 抽象</strong>：强抽象隐藏细节但可能引入开销。</li>
<li><strong>功能强大 vs API 简化</strong>：接口越简单越易用易验证，但可能不够强。</li>
<li><strong>灵活性 vs 安全性</strong>：给应用越多底层控制权（如直接操作硬件）越灵活，但安全风险越大。</li>
</ul></div>


其他现实挑战：

- **环境严苛**：硬件特殊、调试工具弱（这也是本课大量使用 GDB + QEMU 的原因）。
- **应用面极广**：笔记本、手机、云、虚拟机、嵌入式设备，需求差异巨大。
- **特性间相互影响**：新功能可能冲击老特性；一处行为调整可能波及全局（例如调整 CPU 优先级可能改变内存分配策略，诱发竞争）。
- **硬件持续演化/多样化**：NVRAM、多核 CPU、不断增长的网络带宽都在改变设计假设。



## 5. 系统调用：应用观察 OS 的窗口

![image-20240918154022007](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/66ea8451e5c5c.png)



系统调用看起来像普通函数调用，实际上是一种<strong>特殊指令</strong>，它会跨越用户态/内核态的边界。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（系统调用流程，以 <code>open()</code> 为例）</strong>
<ol>
<li>硬件保存若干用户寄存器；</li>
<li>硬件<strong>提升特权级</strong>（用户态 → 管理态）；</li>
<li>硬件跳转到内核预设的<strong>入口点 (*entry point*)</strong>；</li>
<li>运行内核 C 代码，执行该系统调用的实现；</li>
<li>还原用户寄存器；</li>
<li><strong>降低特权级</strong>；</li>
<li>跳回用户程序的调用处，继续向下执行。</li>
</ol>
（步骤 1–4 进入内核，5–7 返回用户态。其中"硬件如何精确完成进入/返回"是 Lec 6 的主题。）</div>


> **接口即焦点**：应用程序正是通过系统调用接口来"看见"操作系统的。设计良好的接口要同时满足两个看似矛盾的要求——<strong>编程方便</strong>与<strong>强隔离</strong>。



### 5.1 `exec`：替换内存映像

当进程调用 `exec()` 时，它会把当前进程的内存映像（代码段、数据段、bss 等）<strong>整体替换</strong>为指定可执行文件的内容；原程序被新程序取代，从新程序入口重新开始执行。注意：`exec` <strong>不创建新进程</strong>，PID 不变，只是"换了个灵魂"。

典型用法：`fork` 出子进程 → 子进程 `exec` 执行命令 → 父进程 `wait` 等子进程结束。



### 5.2 `fork` 与 `exec` 为什么要分开？

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（为何不直接提供一个 <code>spawn()</code>？）</strong> <br/><br/>
表面看，<code>fork()</code> 复制父进程全部内存、紧接着 <code>exec()</code> 又把它丢弃，似乎浪费。但<strong>分开的价值在于：在 <code>fork</code> 之后、<code>exec</code> 之前，子进程有一个"窗口期"可以调整自己的执行环境（尤其是文件描述符），而完全不影响父进程</strong>。<br>
最经典的用途就是 I/O 重定向（见 §5.4）：子进程在这个窗口里把标准输出改成文件，再 <code>exec</code> 运行目标程序。<br>
<em>（性能上，现代实现用写时复制 COW（Lec 8）消除了 fork 的复制开销，所以"分开"几乎不再浪费。）</em></div>



### 5.3 文件描述符与 `pipe`

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（文件描述符 *file descriptor*, FD）</strong>一个小整数，指向内核维护的某个"可读写对象"。这个对象<strong>不一定是磁盘文件</strong>——它也可以是管道、设备、套接字。FD 的统一抽象让 <code>read</code>/<code>write</code> 能以同一套接口操作不同的底层对象，这是 UNIX 设计的核心威力之一。约定：FD 0 = 标准输入，1 = 标准输出，2 = 标准错误。</div>

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（管道 *pipe*）</strong>UNIX 中进程间通信 (*IPC*) 的一种方式，提供先进先出 (*FIFO*) 的字节流。<code>pipe()</code> 系统调用返回一对 FD：<code>fds[0]</code> 为<strong>读端</strong>，<code>fds[1]</code> 为<strong>写端</strong>。内核为每个管道维护一块缓冲区，写入的数据进缓冲区，读取时从缓冲区取走。</div>

读写的阻塞语义：`write(fds[1], ...)` 把数据加入缓冲区；`read(fds[0], ...)` 若缓冲区为空则<strong>阻塞等待</strong>，直到有数据可读。内核封装了底层的缓冲与同步，进程无需关心细节。

### 5.4 重定向：组合 fork + FD 操作

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（<code>echo hello > out</code> 在 shell 里如何实现？）</strong>
<ol>
<li><code>fork()</code> 出一个子进程；</li>
<li>子进程修改自己的文件描述符：
  <ul>
  <li>打开目标文件 <code>out</code>，得到一个新 FD；</li>
  <li>执行 <code>dup2(fd, 1)</code>，把<strong>标准输出（FD 1）重定向到 <code>out</code></strong>；</li>
  <li><code>close(fd)</code> 关掉多余的 FD；</li>
  </ul></li>
<li>子进程 <code>exec("echo", ...)</code>：<code>echo</code> 照常往 FD 1 写，但 FD 1 现在指向文件 <code>out</code>，于是输出落到了文件里。</li>
</ol>
关键点：<code>echo</code> 自己<strong>毫不知情</strong>——它仍然以为在写标准输出。重定向完全由 shell 在 fork/exec 的窗口期通过操纵 FD 完成，这正是 §5.2 中"fork 与 exec 分开"的意义所在。</div>





## 6. 本讲小结与自测

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>一句话总结： </strong>OS 通过<strong>系统调用</strong>这层窄接口，把"复用硬件 + 抽象硬件 + 隔离 + 性能"的目标统一起来；<code>fork</code>/<code>exec</code>/<code>pipe</code>/FD 这几个简单原语，组合出了 shell 的全部表达力——这是"小接口、强组合"设计哲学的范例。</div>

自测清单：

- [ ] 用"资源管理者"和"抽象提供者"两个角度说明 OS 是什么。
- [ ] OS 的 5 个目标分别是什么？它们之间有哪些张力？
- [ ] 系统调用从用户态进入内核、再返回的 7 个步骤。
- [ ] `exec` 会不会创建新进程？它改变了什么、保留了什么（PID）？
- [ ] 为什么 `fork` 与 `exec` 要分开？举一个具体受益的场景。
- [ ] 文件描述符为什么是强大的抽象？管道的两个 FD 各自做什么？
- [ ] 完整复述 `echo hello > out` 的实现步骤，并解释 `echo` 为何"不知情"。

