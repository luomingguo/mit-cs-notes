# Lec 22：底层攻击 (*Low-level Exploits*)

> 主题：砸栈、熔断、信任信任 —— smashing stacks, melting down, trusting trust
> 课程：MIT 6.1800 Computer Systems Engineering
> 结构依据 `s22.pdf`，技术细节补充自 Aleph One《Smashing the Stack for Fun and Profit》、Pincus & Baker《Beyond Stack Smashing》、Ken Thompson《Reflections on Trusting Trust》。

---

## 0. 本讲的威胁模型 (*threat model*) 与定位

上一讲的对手是**有权访问机器上敏感数据**的人（典型如系统管理员，他本就被允许接触口令表）。本讲转换视角：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（本讲威胁模型）</strong>对手 (*adversary*) 拥有<strong>在我们机器上运行代码的能力</strong>，但<strong>不必然拥有任何特权</strong>（例如没有 root）。攻击目标：拿到本不应被其访问的数据，或劫持程序的控制流 (*control flow*)。</div>

三条主线分别对应三种"信任被打破"的层次：

| 层次 | 攻击 | 打破的信任 |
|---|---|---|
| 软件层（程序边界） | 砸栈 (*stack smashing*) | 程序不会越界写自己的内存 |
| 硬件层（微架构） | 熔断 (*Meltdown*) | CPU 的隔离边界（用户态 / 内核态） |
| 工具链层（编译器） | 信任信任 (*trusting trust*) | 我们能通过读源码判断程序是否被植入后门 |

> 课堂"in the news"举例：Apple 修复了一个被执法部门用来从 iPhone 提取已删除聊天记录的漏洞（2026-04）；以及 2024 年 Linux `xz`/`liblzma` 供应链后门事件 —— 后者正是 Thompson 论点的现实回响。

---

## 1. 砸栈 (*Stack Smashing*)

### 1.1 程序栈如何工作

栈 (*stack*) 是后进先出 (*LIFO*) 结构，由 `PUSH`/`POP` 操作维护。函数调用以**栈帧 (*stack frame*)** 为单位组织。需要三个寄存器：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（三个关键寄存器）</strong>
<ul>
<li><strong>IP</strong>（*instruction pointer*，指令指针）：指向下一条要执行的指令。</li>
<li><strong>SP</strong>（*stack pointer*，栈指针）：指向栈顶（最低地址，因为本讲的栈<strong>向下增长</strong>）。</li>
<li><strong>BP / FP</strong>（*base pointer* / *frame pointer*，基址指针 / 帧指针，x86 上即 <code>EBP</code>）：指向当前栈帧的固定位置，使局部变量和参数的偏移量不随 PUSH/POP 变化。</li>
</ul></div>

栈需要保证两件事：

1. 每个函数能访问自己的局部变量与参数；
2. 函数返回后，**调用者的下一行**继续执行。

以课件代码为例：`main()` 在第 8 行调用 `function(7)`，`function` 返回后应回到第 9 行 `x = 5`。

**函数调用时压栈的内容**（地址从高到低，即压入顺序）：

```
高地址  ┌─────────────────────┐
        │ 调用者(main)的局部变量 │
        │ 传给 function 的参数   │   ← 参数反序压入
        │ saved IP (返回地址 RET)│   ← call 指令自动压入
        │ saved BP (SFP)        │   ← 函数序言压入
        │ function 的局部变量    │   ← buffer 等在这里
低地址  └─────────────────────┘  ← SP（栈顶）
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>函数序言 / 尾声 (*prolog / epilog*)</strong>
进入函数时的<strong>序言</strong>：<code>push %ebp</code>（保存旧 BP，即 SFP）→ <code>mov %esp,%ebp</code>（用当前 SP 建立新 BP）→ <code>sub $N,%esp</code>（为局部变量预留空间）。<br>
返回时的<strong>尾声</strong>：通过 BP 定位当前栈帧起点，从固定偏移处恢复 saved BP 与 saved IP，于是 IP 指回 <code>main()</code> 的下一条指令、BP 指回 <code>main()</code> 的栈帧起点，继续执行。x86 用 <code>ENTER</code>/<code>LEAVE</code> 高效完成序言尾声。</div>

注意**字对齐**：内存按字长（这里 4 字节 / 32 位）寻址。所以 5 字节缓冲区实际占 8 字节，10 字节缓冲区实际占 12 字节 —— 这一点在算 payload 长度时很关键。

### 1.2 砸栈的核心机制

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（缓冲区溢出 / 砸栈）</strong>向栈上声明的数组写入超过其容量的数据，覆盖掉相邻的栈内容（局部变量、saved BP、saved IP……），从而改变程序行为乃至控制流。这类越界写源于 C 缺少<strong>边界检查 (*bounds checking*)</strong>，典型罪魁是 <code>gets()</code>、<code>strcpy()</code> 这类不限长度的函数。</div>

经典直觉（Aleph One）：若用 `'A'`（0x41）填满 256 字节去覆盖一个 16 字节缓冲区，返回地址会被写成 `0x41414141`，函数返回时跳到非法地址 → 段错误 (*segmentation violation*)。**段错误说明我们已经控制了返回地址**——下一步只是把它改成"有意义"的地址。

### 1.3 三个递进的攻击 demo

课件用三段结构几乎相同的程序，目标层层递进。共同前提是用 `gets(buffer)` 读入对手可控的字符串，`buffer` 为 64 字节。

#### Demo 1：覆盖普通变量 `modified`

```
栈布局（高→低）: [args] [saved IP/BP] [modified (4B)] [buffer (64B)]
```

对手目标：输入一个字符串，溢出 `buffer` 把相邻的 `modified` 从 0 改成非 0。

#### Demo 2：覆盖函数指针 `fp`，跳进 `win()`

```
栈布局（高→低）: [args] [saved IP/BP] [fp (4B)] [buffer (64B)]
```

对手目标：溢出后把 `fp` 覆盖为 `win()` 的地址，使 `if(fp) fp();` 跳进本不该被调用的 `win`。

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（课堂 clicker 三连问）</strong>
针对 Demo 2 构造 payload：<br>
<strong>① 多长？</strong> 至少要填满 <code>buffer</code>（64B）再加上 buffer 与 <code>fp</code> 之间可能的填充，直到正好覆盖到 <code>fp</code> 所在的 4 字节。<br>
<strong>② 内容是否任意？</strong> 不是任意的。覆盖 <code>buffer</code> 与填充区的部分可以是任意字节（如全 <code>'a'</code>），但<strong>落在 <code>fp</code> 位置的 4 字节必须精确等于 <code>win()</code> 的地址</strong>。<br>
<strong>③ 关键内容是什么？</strong> <code>win()</code> 的入口地址，按目标架构的字节序（x86 小端）写入。</div>

#### Demo 3：直接覆盖返回地址 saved IP

```
栈布局（高→低）: [args] [saved IP/BP] [buffer (64B)]
```

最纯粹的形式：没有 `modified` 也没有 `fp`，对手直接溢出 `buffer` 覆盖 **saved IP**，让函数返回时跳到 `win()`。

> 课件提示：demo 里 `buffer` 与 saved IP 之间还有一点额外空间（编译器对齐 / 其他保存的寄存器），所以实战中偏移量要靠 `gdb` 实测，而非纸面推算。（本讲不要求你会用 gdb。）

### 1.4 注入任意代码：Shellcode 与 NOP 滑板

如果程序里压根没有 `win()` 这种现成代码呢？Aleph One 的答案：**把要执行的机器码放进溢出的缓冲区里，再把返回地址改成指向缓冲区**。

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（shellcode）</strong>放进缓冲区、用来被劫持后执行的一小段机器码，最常见的目的是 <code>execve("/bin/sh", ...)</code> 启动一个 shell，从而获得交互式命令执行能力。</div>

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>NOP 滑板 (*NOP sled*)</strong>由于难以精确预测缓冲区在栈上的确切地址，攻击者在 shellcode 前填充一长串 <code>NOP</code>（空操作 <code>0x90</code>）。只要返回地址落在这片"滑板"中任意一点，CPU 就会一路滑行 (*slide*) 到 shellcode 入口。这把"命中一个精确地址"放宽成"命中一个地址区间"，大幅提高成功率。</div>

### 1.5 基本砸栈攻击依赖的关键假设

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（攻击成立的前提）</strong>本讲所有基本砸栈攻击都隐含假设：<br>
1. <strong>栈是可执行的</strong>——注入到栈上的字节能被当作指令运行；<br>
2. <strong>地址是可预测的</strong>——攻击者能（通过实验）算出缓冲区/返回地址的位置；<br>
3. <strong>无边界检查</strong>——语言/运行时不会在越界写时报错。<br>
打破其中任何一条，基本攻击就会失效——这正是现代防御的切入点。</div>

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（为什么 Python 无法做砸栈攻击？）</strong>
因为 Python 是<strong>内存安全 (*memory-safe*)</strong> 语言：数组/列表访问带<strong>运行时边界检查</strong>，越界会抛出异常而非默默改写相邻内存；程序员也无法直接操纵原始指针或栈帧。砸栈的前提（可越界写裸内存）根本不存在。代价是性能与内存开销——见 §1.7 的权衡。</div>

### 1.6 现代防御与对应的反制攻击

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（主要防御机制）</strong>
<ul>
<li><strong>不可执行栈 (*non-executable stack* / NX / DEP / W^X)</strong>：把栈页标记为不可执行，注入的 shellcode 无法运行。</li>
<li><strong>地址空间布局随机化 (*ASLR*，address space layout randomization)</strong>：随机化栈、堆、库的基址，使攻击者无法预测跳转目标。</li>
<li><strong>栈金丝雀 (*stack canary*)</strong>：在返回地址前放一个随机哨兵值，返回前校验；溢出若改写返回地址必先破坏 canary，从而被检测。（课件未点名，但属同族防御。）</li>
<li><strong>边界检查 (*bounds checking*)</strong>：根治越界写，但破坏 C 写紧凑代码的能力（见 §1.7）。</li>
</ul></div>

防御并非终点。Pincus & Baker《Beyond Stack Smashing》总结了绕过上述防御的**反制攻击 (*counter-attacks*)**：

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（三类反制攻击）</strong>
<ul>
<li><strong>弧注入 / 返回到 libc (*arc-injection* / *return-to-libc*)</strong>：不注入新代码，而是把返回地址指向<strong>程序里已有的合法代码</strong>（如 libc 的 <code>system()</code>），并在栈上摆好参数。因为不在栈上执行新指令，<strong>直接绕过不可执行栈</strong>。这是后来 ROP（*return-oriented programming*）的雏形。</li>
<li><strong>堆溢出 (*heap smashing*)</strong>：攻击发生在堆而非栈上，常通过破坏堆块的元数据（如空闲链表指针）在 <code>malloc</code>/<code>free</code> 时实现任意地址写。</li>
<li><strong>指针篡改 (*pointer subterfuge*)</strong>：覆盖的不是返回地址，而是程序中的<strong>数据指针或函数指针</strong>（Demo 2 即其雏形），间接劫持控制流或读写。</li>
</ul></div>

### 1.7 安全 vs. 性能的权衡

边界检查能根治砸栈，但代价是**牺牲 C 写紧凑代码的能力**。课件用一段网络 I/O 代码举例：

```c
struct record { int age; int sal; char name[1]; };
struct record *r;
char buf[100];
read(socket, buf, 100);
r = (struct record *)buf;          // 直接把字节流强转为结构体
printf("%d,%d,%s\n", r->age, r->sal, r->name);
```

这段在 C 里编译成极紧凑的汇编（直接指针转换、零拷贝），但在 Java 里要几百行（需逐字段安全解析）。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（核心权衡）</strong>底层安全往往以<strong>性能 / 紧凑性</strong>为代价。这是贯穿本讲的主旋律——几乎每个防御都有成本，每个防御也都有对应的反制。<br>
<em>（工程联想：这正是 Go / Rust 等现代系统语言的取舍立场——Go 用 GC + 边界检查换安全，Rust 用所有权在编译期消除越界而不付运行时代价。）</em></div>

---

## 2. 熔断 (*Meltdown*)：从用户态读取内核内存

### 2.1 攻击目标与原理

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（Meltdown 的目标）</strong>一个<strong>无特权的用户态进程</strong>读取它本无权访问的<strong>内核内存</strong>（进而几乎可读任意物理内存）。它利用的不是软件漏洞，而是 CPU 的<strong>微架构 (*microarchitecture*)</strong> 行为。</div>

两个关键硬件机制：

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（乱序执行 & 缓存侧信道）</strong>
<ul>
<li><strong>乱序 / 瞬态执行 (*out-of-order / transient execution*)</strong>：CPU 为提速会<strong>提前推测执行</strong>后续指令。即便某条指令最终会触发异常（如非法访问内核地址），其后的指令可能已被瞬态执行；异常发生时这些瞬态结果会被<strong>架构层回滚</strong>，<strong>但对缓存的副作用不会被回滚</strong>。</li>
<li><strong>Flush+Reload 缓存侧信道 (*cache side channel*)</strong>：被访问过的内存会进缓存。攻击者先清空 (*flush*) 缓存，触发瞬态访问后再逐项<strong>计时重载 (*reload*)</strong>：命中缓存的那一项明显更快，从而泄露"哪个地址被瞬态访问过"。</li>
</ul></div>

### 2.2 核心技巧：`probe_array[data * 4096]`

攻击流程（对应论文 Listing 1）：

```
1. 瞬态地把一个内核字节读进寄存器，记为 data（0–255）
2. 用 data 索引一个探测数组：访问 probe_array[data * 4096]
   → 这次访问把"第 data 个页"载入缓存（即便该行代码"永不被真正执行到"）
3. 异常被处理后，对 probe_array 的 256 个页逐一 Flush+Reload 计时
   → 访问最快的那个页 = data 的值 → 泄露出这个内核字节
逐字节重复，即可读出整段内核内存。
```

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（为什么要乘 4096？若只用 <code>probe_array[data]</code> 会怎样？）</strong>
<code>4096</code> = 一个内存<strong>页 (*page*)</strong> 的大小。乘以页大小让 0–255 的每个可能值都落到<strong>不同的页</strong>，原因有二：<br>
① <strong>缓存行粒度</strong>：缓存以 64 字节的缓存行 (*cache line*) 为单位。若用 <code>probe_array[data]</code>，相邻的 data 值落在<strong>同一缓存行</strong>，无法区分。<br>
② <strong>硬件预取器 (*prefetcher*)</strong>：CPU 会预取相邻缓存行。整页步长（4096 ≫ 64）能让目标页与相邻页拉开足够距离，<strong>避免预取污染</strong>测量结果。<br>
所以不乘任何数的话，缓存行混叠 + 预取会让侧信道完全失效。</div>

### 2.3 看懂汇编（论文 Listing 2）

无需背汇编，但给定定义应能逐行读懂。核心片段语义：

```asm
; rcx = 目标内核地址, rbx = probe_array 基址
    xor   rax, rax            ; rax 清零
retry:
    mov   al, byte [rcx]      ; 把内核地址处的 1 字节读入 al（会触发异常，但瞬态先执行）
    shl   rax, 0xc            ; rax <<= 12，即 rax = data * 4096  ← 乘法在这里发生
    jz    retry               ; 若 data==0 则重试，提升信噪比
    mov   rbx, qword [rbx + rax]  ; 触碰 probe_array[data*4096] 对应的页 → 进缓存
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>关键术语</strong>
<ul>
<li><code>rax</code>：64 位通用累加寄存器；<code>al</code> 是它的最低 1 字节。</li>
<li><code>shl rax, 0xc</code>：逻辑左移 12 位 = ×$2^{12}$ = ×4096。<strong>"乘 4096"正是这一行</strong>（clicker 题答案）。</li>
<li><code>qword</code>：quad word，8 字节（64 位）操作数。</li>
<li><code>byte [rcx]</code>：从地址 <code>rcx</code> 取 1 字节。</li>
</ul></div>

### 2.4 为什么虚拟化挡不住，KAISER 能挡住

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（虚拟化无效 / KAISER 有效）</strong>
<strong>虚拟化 (*virtualization*) 为何挡不住</strong>：Meltdown 的泄露发生在<strong>单个地址空间内部</strong>——只要内核内存被映射进进程的地址空间，瞬态执行就能去读它。虚拟化隔离的是 VM 之间，而 guest 内核内存照样映射进 guest 用户态，微架构层的泄露依旧存在。<br><br>
<strong>KAISER / KPTI 为何有效</strong>：KAISER（即后来的 *Kernel Page-Table Isolation*）在用户态运行时<strong>把内核内存从用户态页表中解除映射</strong>。地址空间里压根没有内核地址的映射，瞬态加载也就无从读起——<strong>没有可泄露的东西</strong>。这是釜底抽薪，而非堵侧信道。</div>

### 2.5 更广的教训

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（Meltdown 的普遍启示）</strong>
<ul>
<li><strong>抽象会泄漏</strong>：为性能而生的微架构优化（乱序执行、缓存）破坏了用户态/内核态这一逻辑隔离边界——<strong>性能优化可以成为安全漏洞</strong>。</li>
<li><strong>侧信道是一等公民</strong>：即便架构层语义"正确回滚"，时序等物理副作用仍能泄露信息。安全分析必须考虑实现层而非仅规范层。</li>
<li><strong>硬件 bug 难修</strong>：只能靠软件缓解（KPTI）兜底，且往往带来性能损失——又一次安全 vs. 性能的权衡。</li>
</ul></div>

---

## 3. 编译器：我们能信任它们吗？(*Reflections on Trusting Trust*)

### 3.1 编译器做什么

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（编译器）</strong>编译器 (*compiler*) 以<strong>源代码</strong>为输入，输出<strong>机器码</strong>。注意一个自指事实：C 编译器本身也是一个程序，它也有自己的源代码，并且要由<strong>另一个 C 编译器</strong>来编译（自举 *bootstrapping*）。</div>

### 3.2 Thompson 攻击的两个阶段

#### 阶段一：直接植入后门（可被读源码发现）

设想一个被改过的 UNIX 源码，在 `login` 里藏了后门。

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>关键点</strong>这种后门<strong>读源码就能发现</strong>——对熟悉 UNIX 源码的人，那段插后门的代码很扎眼。<br>
进一步：把后门逻辑从 UNIX 源码移进<strong>被改过的 C 编译器</strong>里——编译器一旦发现自己在编译 UNIX，就<strong>自动注入后门</strong>。此时 UNIX 源码是<strong>干净</strong>的（后门不在其中），但后门仍存在于编译器源码里——<strong>还是能靠读编译器源码发现</strong>。</div>

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（如何检测阶段一的后门？）</strong>
用一份<strong>干净的编译器源码</strong>重新编译出一个干净编译器，用它去编译 UNIX，再把产物与"被改编译器"产出的 UNIX 二进制<strong>逐字节比对</strong>。<br>
阶段一的被改编译器<strong>只会给 UNIX 插后门、不会感染新编译器</strong>，所以用干净源码编出的新编译器是干净的 → 它编出的 UNIX 没有后门 → <strong>两份二进制不同 → 后门被检测到</strong>。</div>

#### 阶段二：自我复制的 hack（读源码无法发现）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>定义（hacked v2.0 编译器）</strong>这个被改编译器含<strong>两段</strong>恶意逻辑：<br>
① 编译 UNIX 时 → 注入登录后门；<br>
② 编译"C 编译器自身"时 → 把上述①②两段恶意逻辑<strong>重新注入</strong>新编译器二进制。<br>
完成自举后，<strong>把恶意源码从编译器源码中删除</strong>。此后编译器源码完全干净，但恶意行为靠<strong>二进制代代相传</strong>（类似一个 *quine* 自我复制）。</div>

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>例题（为什么阶段一的检测法对 v2.0 失效？）</strong>
还是"用干净编译器源码重编 → 编 UNIX → 比对"。但你只能用<strong>手头已被感染的编译器二进制</strong>去编译那份干净源码。v2.0 的逻辑②会<strong>在编译编译器时重新注入后门</strong> → 编出的"新编译器"<strong>又是被感染的</strong> → 它编出的 UNIX 照样带后门 → <strong>两份二进制完全相同 → 检测失败</strong>。<br>
源码里看不到任何恶意代码，比对也看不出差异——后门彻底隐形。</div>

### 3.3 更广的教训

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（信任信任）</strong>
<ul>
<li><strong>核心论点</strong>：你无法完全信任<strong>不是自己从零写的代码</strong>——这层不信任会沿工具链一路下推：编译器、汇编器、加载器、微码、乃至硬件。读源码不足以建立信任。</li>
<li><strong>历史</strong>：该思想早于 Thompson 1984 图灵奖演讲——Karger & Schell 在 1974 年的 Multics 安全评估报告中已预见（课件引用 ESD-TR-74-193）。</li>
<li><strong>解法倾向</strong>：Thompson 暗示这类信任问题更应靠<strong>政策 / 制度 (*policy-based*)</strong> 而非纯技术手段解决——靠对人和流程的信任与问责，而非寄望某个完美技术。<br><em>（现代回响：可复现构建 *reproducible builds*、Diverse Double-Compiling 是对此 hack 的技术性回击；而 2024 年 xz 后门则证明"供应链信任"至今仍是软肋。）</em></li>
</ul></div>

---

## 4. 全讲总结

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>推论（贯穿三条主线的主旋律）</strong>
<ol>
<li><strong>攻防是螺旋升级的</strong>：每实现一个防御（NX、ASLR、KPTI）就会出现反制（return-to-libc、堆溢出、其它瞬态执行攻击）。底层攻击尤其阴险 (*insidious*)。</li>
<li><strong>安全常以性能为代价</strong>：边界检查、KPTI、内存安全语言都付出运行时或表达力成本。这是工程决策而非纯技术问题。</li>
<li><strong>无法做到完美安全 ≠ 不能进步</strong>：更复杂的攻击对对手而言成本更高、有时不值得发动。提高攻击门槛本身就是有效防御。</li>
<li><strong>有些信任问题超出技术范畴</strong>：Thompson 的 hack 说明纯技术无法根除信任问题，需辅以政策与流程。</li>
</ol></div>

---

## 附：考试自测清单（据 `l22.pdf` 大纲）

- [ ] 砸栈的威胁模型是什么？
- [ ] 函数调用时栈如何变化？开头压入了哪些东西？
- [ ] 栈如何支持函数返回后回到调用者下一行？（BP/saved IP/saved BP 的作用）
- [ ] 基本砸栈攻击依赖什么假设？
- [ ] 给定一个 demo，能否说清：栈布局、对手意图（覆盖哪个变量、想达成什么）、payload 长度与内容/位置？
- [ ] Meltdown 的目标？乱序执行与缓存如何配合？
- [ ] Listing 1 中为何乘 4096？只用 `probe_array[data]` 会怎样？
- [ ] 能逐行读懂 Listing 2 的汇编吗？（`rax`/`al`/`shl`/`qword`）
- [ ] 为何虚拟化挡不住 Meltdown？为何 KAISER 能挡住？
- [ ] 编译器做什么？如何检测阶段一的 Thompson hack？为何该法对 v2.0 失效？
