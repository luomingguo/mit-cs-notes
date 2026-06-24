# Lec 10 用户级虚拟内存

阅读论文 [Virtual Memory Primitives for User Programs, 1991](https://www.cs.princeton.edu/~appel/papers/vmpup.pdf)

思考一下如何将xv6支持`TRAP`、`PORT1` 和 `UNPORT`？

用户应用程序的虚拟内存，按照阅读论文的论点，用户应用程序应该受益于或应该具有相同的能力，用户应用程序也可以使用虚拟内存。 真正的意思是，它们希望有与内核相同的机制，在用户模式访问用户应用程序，应用程序能够接受页面错误，然后可以响应这些页面错误，可以修改保护位，或修改页表中的特权级别。

## 总览

本讲承接 Lec 8（页错误）：内核早已用「页表 + 页错误」做各种花活（COW、按需分页…），这篇 1991 年的论文（Appel & Li）主张**把同样的能力暴露给用户程序**。脉络：

- **用户态 VM 原语**：trap / prot1 / protN / unprot / dirty / map2 六个「能力」
- **现代 Unix 如何提供**：`mmap` / `mprotect` / `munmap` / `sigaction` 的对应关系
- **应用场景**：记忆化大表（sqrt demo）、并发复制式 GC（Baker 算法 + VM 技巧）
- **系统设计问题**：TLB 一致性与批量 shootdown、最优页大小、map2 让 collector 访问受保护页、流水线与「半同步」异常的可行性
- **论文重点图：表 2**（各算法对原语的需求矩阵）
- 思考题（如何让 xv6 支持这些原语）+ FAQ

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>思考题：如何让 xv6 支持 TRAP / PROT1(PROTN) / UNPROT？</strong></div>

xv6 内核内部其实已经具备全部机制（页表、页错误处理、`mappages`/`walk`、`sfence.vma`），只是没把它们以系统调用的形式暴露给用户态。要支持这三个原语，大致这样做：

- **TRAP（把页错误转发到用户态处理）**——复用 alarm 实验那套「上调用（up-call）」机制：
  1. 加一个系统调用（类似 `sigaction(SIGSEGV, handler)`）让进程注册一个用户态 handler 地址；
  2. 在 `usertrap()` 里，当 `scause==13/15`（load/store page fault）且进程装了 handler 时，**不再 `setkilled`**，而是：把当前 `trapframe` 另存一份、把出错地址 `r_stval()` 放进 `a0`、把 `trapframe->epc` 改成 handler 地址，然后照常返回用户态——于是 handler 在用户态、用进程自己的页表运行；
  3. handler 处理完调用一个 `sigreturn` 式系统调用，**恢复之前另存的 trapframe**，回到出错指令重跑。
- **PROT1 / PROTN（降权）和 UNPROT（升权）**——加一个 `mprotect(addr, n, perm)` 系统调用：
  1. 对 `[addr, addr+n*PGSIZE)` 每页 `walk(pagetable, va, 0)` 找到 PTE；
  2. 按需修改权限位（清/置 `PTE_W`、`PTE_R`，或用 `PTE_V`/`PTE_U` 表示「不可访问」）；
  3. **改完后 `sfence.vma` 刷 TLB**。PROTN 相对 PROT1 的价值正在于：N 页只需**一次** TLB 刷新（摊销），而 N 次 PROT1 要刷 N 次。

> 安全性：handler 跑在**进程自己的页表/上下文**里，只能影响自己的地址空间，碰不到别的进程或内核——和 alarm 一样不破坏隔离（详见 FAQ「用户态 handler 的安全性」）。



## 引言

OS内核一直在灵活地使用虚拟内存（VM），用户态程序起始也可以利用虚拟内存机制做很多高级的事情。比如：

- 并发垃圾回收（Concurrent GC）
- 分代垃圾回收（Generational GC）
- 并发 checkpoint（快照）
- 分布式共享内存（Distributed Shared Memory）
- 基于压缩的分页（Data-compression paging）
- 持久化存储（Persistent stores）

这些具体应用很多并没有广泛流行，但产生了深远的影响。今天大多数OS都支持`mmap()`和用户态处理page fault。



## 用户态VM原语

什么是“用户态 VM 原语”？ 是一组"能力"，

1. trap 陷入： 在用户态处理page fault
2. prot1 / Prot N 降权限： 降低某个页面（或多个）的访问权限
3. Unprot 恢复权限： 提升页面的权限
4. dirty 脏页检测： 返回自上一次调用以来哪些页被修改过
5. map2 双映射： 同一个物理页映射到两个虚拟地址，但权限可以不同。



xv6都不支持，但是现代Unix基本都支持，但是形式不同。



Unix的`mmap()`，👉 映射一段虚拟内存。

文件映射：

```c
mmap(NULL, len, PROT_READ|PROT_WRITE, MAP_PRIVATE, fd, offset)
```

匿名内存：

```c
mmap(NULL, len, PROT_READ|PROT_WRITE,
     MAP_PRIVATE|MAP_ANONYMOUS, -1, 0)
```

现在基本替代`sbrk`



`mprotect()` 👉 修改页面权限

```c
mprotect(addr, len, PROT_READ)
mprotect(addr, len, PROT_NONE)
```

如果设置为`PROT_NONE`，已访问就触发page fault



`munnmap()` 👉 解除映射

```c
munmap(addr, len)
```



`sigaction()` 👉 注册信号处理函数

```c
sigaction(SIGSEGV, ...) // 用来捕获缺页异常
```



其他 Linux VM API

- `madvise()`（访问模式提示）
- `mincore()`（页是否在内存）
- `mremap()`（重映射）
- `msync()`（同步到磁盘）
- `mlock()`（锁页）
- `shmat()`（共享内存）



> Unix 能实现 用户态 VM 原语吗？

Sol: 

| 原语        | Unix支持                    |
| ----------- | --------------------------- |
| Trap        | ✅ `SIGSEGV`                 |
| Prot1/ProtN | ✅ `mprotect()`              |
| Unprot      | ✅ `mprotect()`              |
| Dirty       | ❌（但可以绕）               |
| Map2        | ⚠️ 间接（`shm_open + mmap`） |



## 现代VM

现代的OS内核变化非常多，尤其是虚拟内存这块，其VM API和实现都有大量的演进，而且学术界一直在持续研究，比如OSDI 2020上还有相关工作，出现了更多“控制型”原语。

除了最基本的 `mmap` / `mprotect`，还增加了：

- `mlock` / `munlock`
   👉 锁住内存，防止被换出
- `madvise`
   👉 告诉内核你的访问模式（顺序/随机等）
- `mremap`
   👉 动态调整映射大小
- `mincore`
   👉 查询哪些页已经在内存中

**地址空间切换几乎“免费”了** 过去切换进程（切换地址空间）成本很高，因为需要清空TLB。现在， 使用 **Tagged TLB（带标签的 TLB）**，每个进程的地址空间有 tag，切换时不需要清空TLB，结果就是上下文切换更快了。

**地址空间大小不再是问题** 过去，虚拟地址空间是稀缺资源，现在大约支持$2^{52}$ byte  = 4PB，这几乎“无限”的虚拟地址空间。程序不再需要精打细算地址空间，可以随便 reserve 超大空间，稀疏使用（sparse allocation），按需分配





## 应用场景

> 论文用 6~7 类**截然不同**的应用（并发 GC、共享虚拟内存 SVM、数据压缩分页、并发 checkpoint、持久存储、扩展地址空间…）论证一个观点：它们底层都依赖**同一小撮 VM 原语**。下面挑两个最有代表性的例子细讲。

### 例 1：记忆化大表（memoization）

把一个昂贵函数 `f` 的结果预先算好、存进一张巨大的表，之后查 `f(i)` 就退化成 `table[i]` 一次查表。问题：这张表可能比物理内存还大。用 VM 原语解决：

1. **reserve 一大段虚拟地址**，但不映射任何物理内存；
2. 访问 `table[i]` → 该页未映射 → **触发 page fault**；
3. 在 handler 里：`kalloc` 一页、算出**这一页覆盖的所有条目**、建立映射、重跑指令；
4. 内存紧张时，用 **prot1/protN** 把不活跃的页降权回收。

> 好处：重复查只是查表；连续条目「顺带」一起算好（一次缺页填满整页）。下面的 sqrt demo 用 `mmap`/`munmap`/`sigaction` 实现，甚至极端到**全程只保留一个物理页**来表示整张巨表——纯粹为了展示原语的威力（实践中会保留一组工作页）。

### 例 2：并发复制式垃圾回收（Baker 算法）

**复制式 GC**：堆分成 from-space 和 to-space。回收时从 root（寄存器/全局变量/栈上的顶层指针）出发遍历可达对象，把它们**复制到 to-space**，并在 from-space 留下**转发指针（forwarding pointer）**；from-space 里没人指向的对象就是垃圾，整块丢弃复用。

**Baker 增量算法**：不 stop-the-world，而是**每次 `new` 分配时顺手多扫/转发几个对象**，把「复制整个活堆」的开销摊到很多次分配里。代价是它要维持不变量「mutator 在寄存器里只看到 to-space 指针」，于是：

- mutator 每次**解引用指针都要做 read barrier**：检查目标是否还在 from-space，是则当场转发。
- 两个缺点：① 每次指针解引用多出一串（判断 + 可能调用转发）指令，拖慢应用；② **难以并发**——collector 和 mutator 可能同时复制同一对象到不同位置，产生竞态。

### VM 技巧：用页保护代替指针检查

把 to-space 划成「已扫描」和「未扫描」两段，**未扫描段映射为 `PROT_NONE`（不可访问）**：

1. mutator 访问未扫描对象 → **page fault**；
2. handler 扫描该页上的对象、把它们引用的 from-space 对象转发到未扫描区、然后 **unprot 该页**、重跑；
3. 于是 mutator 眼中该页「仿佛一开始就只含 to-space 指针」。

三大好处：

- **不再需要软件 read barrier**——检查交给硬件页保护完成；
- **几乎免费的并发**：collector 只碰未扫描页、mutator 只碰已扫描页，而未扫描页对 mutator 不可访问，二者天然互斥，无需显式锁；
- **编译器无需改动**。

### map2：让 collector 能访问「对 mutator 不可访问」的页

矛盾来了：未扫描页对 mutator 是 `PROT_NONE`，但 **collector 自己要读写它**来扫描/转发。解法正是 **map2**——把同一块物理内存在**同一地址空间映射两份**：mutator 视角是 `PROT_NONE`，collector 视角是可读写。Linux 用 `shm_open + ftruncate + 两次 mmap` 来模拟 map2。

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>handler 里顺序至关重要：必须「先扫描、后 unprot」。</strong>若先放开权限再扫描，多线程的 mutator 可能在扫描完成前就看到未扫描区的对象（里面还有 from-space 指针），破坏不变量。</div>

### VMA 与 trap 的实现概述

- **VMA（Virtual Memory Area）**：现代 Unix 在硬件页表之外，用一组 OS 数据结构记录「一段**连续**虚拟地址范围」的信息——权限、背后的对象（如 mmap 的文件 fd + offset）。一次不重叠的 `mmap` 大致对应一个 VMA（mmap 实验里你会实现一个简化版）。
- **用户态 trap**：和 alarm 实验同构——page fault → 内核 → 查 VMA/页表判断如何处理 → 若进程装了 handler 就 up-call 到用户态运行（handler 可能调 `mprotect` 改权限）→ 返回内核 → 恢复被打断的指令（修好了就正常跑，没修好会立即再次缺页）。

### 安全性

用户态 handler 跑在**进程自己的页表/上下文**里，只能影响自身地址空间，**碰不到其他进程或内核**——和 sigalarm 一样不破坏隔离。最坏情况只是进程把自己搞坏，内核可以直接杀掉它。

### 实践权衡 & 自 1991 年以来的演进

- **该不该用 VM 技巧？** 多数 GC 其实**不用** VM，而靠编译器生成软件 barrier 也够快；如果你是编译器/运行时，软件方案不算糟。但 **checkpoint、SVM** 这类「不涉及编译器」的应用，就确实离不开这些原语。
- **演进**：如今 Unix 普遍支持这些原语；出现**五级页表**应对超大地址空间；**ASID** 降低 TLB flush 成本；因 Meltdown 引入了 **KPTI**（内核页表隔离，见 Lec 23）。VM 系统从不静止，几乎每隔几个月就有大改动。

### 例 1 的实现：sqrt 记忆化表（mmap + SIGSEGV）

下面这段用户程序用现有 Unix 原语实现了「记忆化大表」：`setup_sqrt_region` 先 `mmap` 一大段再立即 `munmap`（只为占一个安全地址），并注册 `SIGSEGV` 处理器；访问触发缺页时 `handle_sigsegv` 映射当前页、算出该页所有平方根、并 `munmap` 上一页——于是任意时刻只有一个物理页在用。

```c
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <string.h>
#include <signal.h>
#include <stdint.h>
#include <sys/mman.h>
#include <sys/resource.h>
#include <sys/time.h>
#include <math.h>

static size_t page_size;

// align_down - rounds a value down to an alignment
// @x: the value
// @a: the alignment (must be power of 2)
//
// Returns an aligned value.
#define align_down(x, a) ((x) & ~((typeof(x))(a) - 1))

#define AS_LIMIT	(1 << 23) // Maximum limit on virtual memory bytes
#define MAX_SQRTS	(1 << 27) // Maximum limit on sqrt table entries
static double *sqrts;

static int nfault;

// Use this helper function as an oracle for square root values.
static void
calculate_sqrts(double *sqrt_pos, int start, int nr)
{
  int i;

  for (i = 0; i < nr; i++)
    sqrt_pos[i] = sqrt((double)(start + i));
}

static void
handle_sigsegv(int sig, siginfo_t *si, void *ctx)
{
  uintptr_t fault_addr = (uintptr_t)si->si_addr;
  double *page_base = (double *)align_down(fault_addr, page_size);
  static double *last_page_base = NULL;

  if (last_page_base && munmap(last_page_base, page_size) == -1) {
    fprintf(stderr, "Couldn't munmap(); %s\n", strerror(errno));
    exit(EXIT_FAILURE);
  }

  if (mmap(page_base, page_size, PROT_READ | PROT_WRITE,
           MAP_PRIVATE | MAP_ANONYMOUS | MAP_FIXED, -1, 0) == MAP_FAILED) {
    fprintf(stderr, "Couldn't mmap(); %s\n", strerror(errno));
    exit(EXIT_FAILURE);
  }

  nfault++;
  
  calculate_sqrts(page_base, page_base - sqrts, page_size / sizeof(double));
  last_page_base = page_base;
}

static void
setup_sqrt_region(void)
{
  struct rlimit lim = {AS_LIMIT, AS_LIMIT};
  struct sigaction act;

  // Only mapping to find a safe location for the table.
  sqrts = mmap(NULL, MAX_SQRTS * sizeof(double) + AS_LIMIT, PROT_NONE,
	       MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
  if (sqrts == MAP_FAILED) {
    fprintf(stderr, "Couldn't mmap() region for sqrt table; %s\n",
	    strerror(errno));
    exit(EXIT_FAILURE);
  }

  // Now release the virtual memory to remain under the rlimit.
  if (munmap(sqrts, MAX_SQRTS * sizeof(double) + AS_LIMIT) == -1) {
    fprintf(stderr, "Couldn't munmap() region for sqrt table; %s\n",
            strerror(errno));
    exit(EXIT_FAILURE);
  }

  // Set a soft rlimit on virtual address-space bytes.
  if (setrlimit(RLIMIT_AS, &lim) == -1) {
    fprintf(stderr, "Couldn't set rlimit on RLIMIT_AS; %s\n", strerror(errno));
    exit(EXIT_FAILURE);
  }

  // Register a signal handler to capture SIGSEGV.
  act.sa_sigaction = handle_sigsegv;
  act.sa_flags = SA_SIGINFO;
  sigemptyset(&act.sa_mask);
  if (sigaction(SIGSEGV, &act, NULL) == -1) {
    fprintf(stderr, "Couldn't set up SIGSEGV handler;, %s\n", strerror(errno));
    exit(EXIT_FAILURE);
  }
}

static void
test_sqrt_region(void)
{
  int i, pos = rand() % (MAX_SQRTS - 1);
  double correct_sqrt;
   struct timeval start, end;
    long secs_used,micros_used;

  printf("Validating square root table contents...\n");
  srand(0xDEADBEEF);
  
  gettimeofday(&start, NULL);

  for (i = 0; i < 1000; i++) {
    pos = rand() % (MAX_SQRTS - 1);
    calculate_sqrts(&correct_sqrt, pos, 1);
    if (sqrts[pos] != correct_sqrt) {
      fprintf(stderr, "Square root is incorrect. Expected %f, got %f.\n",
              correct_sqrt, sqrts[pos]);
      exit(EXIT_FAILURE);
    }
  }
  gettimeofday(&end, NULL);
  
  printf("start: %d secs, %d usecs\n",start.tv_sec,start.tv_usec);
  printf("end: %d secs, %d usecs\n",end.tv_sec,end.tv_usec);

  secs_used=(end.tv_sec - start.tv_sec); //avoid overflow by subtracting first
  micros_used= ((secs_used*1000000) + end.tv_usec) - (start.tv_usec);

  printf("micros_used: %d for nfault %d\n",micros_used, nfault);
}

int
main(int argc, char *argv[])
{
  page_size = sysconf(_SC_PAGESIZE);
  printf("page_size is %ld\n", page_size);
  setup_sqrt_region();
  test_sqrt_region();
  return 0;
}
```



# 论文阅读： 用于用户程序的虚拟内存原语

## 摘要

内存管理单元（MMUs）传统上被操作系统用于实现**基于磁盘分页（disk-paged）的虚拟内存**。一些操作系统允许用户程序指定页面的保护级别（不可访问、只读、读写），并允许用户程序处理保护违规，也就是处理访问异常（如page fault）。 但这些机制并不总是健壮、高效和与应用程序的需求相匹配。

我们调研了若干利用 页保护技术（page-protection techniques）的用户态算法，并分析了它们的共同特征，试图回答以下问题：

- **操作系统应该向用户进程提供哪些虚拟内存原语（virtual-memory primitives）**？
- 今天的操作系统在多大程度上提供了这些机制？

## 引言

虚拟内存的传统用途是扩大用户程序可见的地址空间，通过只让经常访问的那部分地址空间驻留在物理内存中，其余放在磁盘上。但是， 虚拟内存已经被用于许多其它用途，例如，

- 操作系统可以在进程之间共享页面
- 让指令空间（instruction space）只读，因此保证可重入
- 按需零填充
- 写时复制等等

事实上，借助页保护硬件，操作系统可以实现一大类这样的“技巧”。

现代操作系统也允许用户程序实现这类技巧，其方式是允许用户程序为保护违规（protection violations）提供 handler。例如，Unix 允许用户进程指定，当发生 segmentation fault 信号时执行某个特定子程序。当程序访问超出合法虚拟地址范围的内存时，用户提供的信号处理程序可以输出更友好的错误信息，而不是显示令人不安的“segmentation fault: core dumped”。

## 虚拟内存原语

我们描述的每一种算法，都需要OS提供如下虚拟内存服务：

- trap： 在用户态处理页错误的陷入
- prot1： 降低一个页面的可访问性
- protN: 降低N个页面的可访问性
- unprot：提高一个页面的可访问性
- dirty：返回自上一个调用以来
- map2： 将同一个物理页面映射到同一地址空间中的两个不同虚拟地址，并赋予不同的保护级别。

此外，有些算法如果使用比传统磁盘分页更小的页大小（page size），可能会更高效。

## 3. 虚拟内存应用

在本节中，我们展示了一些应用示例，这些应用使用虚拟内存原语来替代软件检测、专用硬件或微码。页面保护硬件可以高效地对地址执行简单的判定，而如果用软件实现，则可能需要在每次取数（fetch）或存储（store）时额外执行一到两条指令；由于取数和存储操作极其频繁，这种节省是非常可观的。我们考察了若干算法，以便总结用户程序对操作系统和硬件的通用需求。

### 并发GC

一种并发的、实时的复制型垃圾回收算法可以利用页错误（page fault）机制，在回收器（collector）线程与程序执行线程（mutator）之间实现中等粒度的同步。分页机制提供了一种既足够粗粒度以保证高效，又足够细粒度以降低延迟的同步方式。该算法基于 Baker 提出的顺序实时复制垃圾回收算法。

Baker 算法将堆划分为两个区域：from-space 和 to-space。在一次回收开始时，所有对象都位于 from-space，而 to-space 是空的。回收器从寄存器和其他全局根对象出发，遍历可达对象图，并将每个可达对象复制到 to-space。原来指向 from-space 对象的指针会被“转发”（forward），指向该对象在 to-space 中的新副本。

当然，有些 from-space 中的对象永远不会被复制到 to-space，因为没有任何指针指向它们；这些对象就是垃圾。

当寄存器中的指针完成转发后，mutator 线程就可以恢复执行。随后，在 mutator 分配新对象的同时，回收器会逐步将对象从 from-space 复制到 to-space。每当 mutator 分配一个新对象时，就会触发回收器再复制一小部分对象。

Baker 算法维持以下不变量：

- mutator 在寄存器中只能看到指向 to-space 的指针；
- 新分配区域中的对象只包含 to-space 指针（因为它们由寄存器初始化）；
- 已扫描区域中的对象只包含 to-space 指针；
- 未扫描区域中的对象同时包含 from-space 和 to-space 指针。

为了保证 mutator 在寄存器中只看到 to-space 指针，每次从对象中取出指针时，都必须检查该指针是否指向 from-space。如果是，则需要将该对象复制到 to-space，并更新指针；之后才能返回给 mutator。若用软件实现，这意味着每次取指针都要额外执行几条指令，因此需要硬件支持才能高效实现。此外，mutator 与回收器必须交替执行，无法真正并发，因为它们可能同时尝试复制同一个对象到不同位置。

### 基于虚拟内存的改进方法

并发垃圾回收算法通过使用虚拟内存页面保护机制，避免对每个指针进行检查，同时实现 mutator 与 collector 的同步。

具体做法是：将“未扫描区域”的页面设置为“不可访问”（no access）。当 mutator 尝试访问未扫描对象时，会触发页访问异常（page fault）。此时由回收器处理该异常：扫描该页面上的对象，将 from-space 中的对象复制到 to-space，并更新指针。完成后，回收器解除该页面的保护（unprotect），然后从触发异常的指令处恢复 mutator 的执行。

对于 mutator 来说，该页面仿佛一开始就只包含 to-space 指针，因此它始终只会读取到 to-space 指针。

回收器也可以与 mutator 并发执行：它可以主动扫描未扫描区域中的页面，并在扫描完成后解除保护。扫描的页面越多，mutator 遭遇的页异常就越少。

由于 mutator 不需要额外做任何同步操作，因此编译器无需修改。这种方法也几乎不需要额外工作就可以支持多处理器和多个 mutator 线程。

## 4. 虚拟内存原语性能

## 5. 系统设计问题

通过对虚拟内存应用的研究，我们可以总结出一些关于硬件和操作系统设计的重要经验。大多数应用以类似的方式使用虚拟内存；这使得我们能够清楚地知道需要哪些虚拟内存支持——同样重要的是，也能知道哪些是不必要的。

### TLB 一致性

本文介绍的许多算法会以“大批量”的方式降低内存的可访问性，而以“逐页”的方式提高内存的可访问性。这一点在并发垃圾回收、分代垃圾回收、并发检查点、持久存储以及扩展地址空间等场景中都成立。

这种方式是有利的，尤其是在多处理器系统中，因为涉及到 TLB（一致性）问题。当一个页面变得“更可访问”时，TLB 中的过时信息是无害的，最多只会导致一次多余但容易修复的 TLB 未命中或 TLB 异常。

但当一个页面变得“更不可访问”时，TLB 中的过时信息可能导致对该页面的非法访问。为了防止这种情况，必须将该页面从所有可能缓存它的 TLB 中清除。这种操作称为“shootdown”（失效广播），可以通过软件方式实现（中断其他处理器并请求其清除对应 TLB 项），也可以通过硬件方式（例如基于总线的机制）实现。

如果需要中断的处理器数量很多，软件方式的 shootdown 会非常昂贵。我们的解决方案是将 shootdown 批处理（batching）：一次处理多个页面的 shootdown，其成本不会比处理单个页面高多少；当中断处理器的开销被分摊到多个页面时，每个页面的成本就变得可以忽略不计。本文中那些以批量方式保护页面的算法，实际上“无意中”利用了这种批处理的优势。

这种批处理思想不仅适用于这些算法，也可以用于“传统”的磁盘分页。分页时，为了腾出物理页供其他虚拟页使用，页面会被设置为“不可访问”（即换出到磁盘）。如果操作系统能维护一个较大的空闲物理页池，就可以以批量方式进行换出（用于补充这个池），从而将 shootdown 的成本分摊到整个批次。因此，尽管有人认为软件方案尚可但最终需要硬件支持，采用批处理后，很可能无需额外的硬件辅助。

### 最优页面大小

在本文描述的许多算法中，缺页异常完全由 CPU 处理，其处理时间（不包括额外开销）与页面大小成正比。

在传统的磁盘分页中，发生缺页时需要等待磁盘旋转和磁头移动，这通常会带来几十毫秒的延迟。在这种情况下，即使缺页处理程序增加几毫秒的计算开销，也几乎不会被察觉（尤其是在没有其他可运行进程时）。出于这个原因——以及其他原因（例如动态 RAM 的寻址特性）——传统系统中的页面通常较大，且缺页处理开销较高。

然而，对于完全由用户态算法在 CPU 中处理的缺页情况，并不存在这种固有的 I/O 延迟。如果希望将每次缺页处理时间减半（不包括陷入内核的时间），只需将页面大小减半即可。本文中的不同算法，可能在不同的页面大小下达到最佳性能。

通过使用较小页面大小的硬件，可以灵活实现不同的效果。例如，在 VMP 系统中，地址转换缓冲和缓存是统一的，其缓存行大小为 128 字节；这种架构可能非常适合本文中的许多算法。在执行页面保护（prot）或解除保护（unprot）操作时，可以使用小页面；而在进行磁盘分页时，可以使用连续的多页块（类似于 VAX 系统中的做法）。

当使用小页面时，能够快速地触发并修改页面保护尤为重要，因为这部分开销与页面大小无关，而实际计算通常与页面大小成正比。

### 访问受保护

许多算法在多处理器上运行时，需要一种机制，使用户态的服务例程能够访问某个页面，而客户端线程却无法访问。这类算法包括：并发垃圾回收、扩展地址空间、共享虚拟内存以及数据压缩分页。

实现“用户态访问受保护页面”有多种方法（以下以并发垃圾回收为例说明）：

- 在同一地址空间中，将同一物理页映射到多个虚拟地址，并赋予不同的访问权限。垃圾回收器可以通过一个“非标准”的地址访问 to-space 中的页面，而程序（mutator）看到的 to-space 则是受保护的。
- 提供系统调用，用于在受保护区域之间复制数据。垃圾回收器每个页面需要调用三次：
   1）从 from-space 复制到 to-space；
   2）扫描 to-space 页面之前；
   3）扫描完成、恢复页面可访问之前。
   这种方法效率较低，因为涉及大量数据复制。
- 在支持进程间共享页面的操作系统中，让垃圾回收器运行在与 mutator 不同的重量级进程中，并使用不同的页表。缺点是每次垃圾回收触发的缺页异常都需要两次昂贵的上下文切换。不过在多处理器系统中，可以通过 RPC 调用另一个已经处于正确上下文的处理器，从而降低成本。
- 将垃圾回收器直接运行在操作系统内核中。这通常是最高效的，但未必是合适的设计，因为这可能降低内核的可靠性，而且不同编程语言的运行时数据格式不同，垃圾回收器必须理解这些差异。

我们主张：对于采用物理地址缓存的体系结构，在同一地址空间中进行“多重虚拟地址映射”是一种简洁且高效的解决方案。它不需要昂贵的上下文切换、不需要数据复制，也不需要把逻辑放进内核。其缺点是每个物理页需要在页表中有两份映射项，从而使内存开销增加（最多约 1%，取决于页表项大小与页大小的比例）。

如果使用的是虚拟地址缓存，多重映射可能导致缓存不一致问题：一个映射更新后仍留在缓存中，而另一个映射的数据已过期。在并发垃圾回收的场景中，这个问题可以很容易解决：
 当垃圾回收器扫描页面时，mutator 无法访问该页面，因此其对应地址不会填充缓存行；扫描完成后，回收器刷新该页面对应的缓存行（例如通过 cache flush 系统调用）。之后回收器也不会再访问该页面，因此不会再产生不一致。



### 是否要求过高

某些机器上的 Unix 实现曾提供一种非常“干净且同步”的信号处理机制：当一条指令触发缺页异常时，会调用信号处理函数，而不会改变处理器状态；后续指令不会执行。信号处理函数可以完全同步地访问寄存器、修改内存映射或寄存器，然后重新执行出错指令。

但在高度流水线化的处理器上，可能同时存在多个未完成的缺页异常，而且在异常被检测到之前，后续多条指令可能已经写入寄存器；这些指令可以继续执行，但无法简单“重启”。因此，当用户程序依赖这种同步语义时，很难在流水线机器上正确运行：

> 现代 UNIX 系统允许用户程序主动参与内存管理（例如显式操作内存映射），这就像“递送了一张通往地狱的邀请函”。

如果这些算法确实与高速流水线处理器不兼容，那将是一个严重问题。幸运的是，除一个例外之外，本文中的算法都具有足够的“异步性”：
 它们的行为是——修复发生缺页的页面，然后继续执行，而不需要检查缺页时的 CPU 状态。其他已经执行或正在执行的指令，与该页面内容无关。从机器角度看，这与传统磁盘分页非常相似：发生缺页 → 提供物理页 → 更新页表使其可访问 → 恢复执行。

唯一的例外是“堆溢出检测”：缺页会触发垃圾回收，并修改寄存器（例如将其更新为指向新位置），然后恢复执行。例如，指向下一可分配空间的寄存器会被调整到新的分配区域开头，之前触发异常的指令会被重新执行，但这次不会再触发异常。

这种行为在高度流水线处理器上是不可接受的（除非像某些机器那样，提供硬件支持来“撤销”已完成的后续指令）。事实上，即使在某些较老的处理器上（如 Motorola 68020），用缺页来检测堆溢出也并不可靠。

因此，除了堆溢出检测外，本文提出的所有算法对硬件的要求与传统磁盘分页并无本质区别，那张“地狱邀请函”可以退回；不过操作系统必须确保为硬件能力提供足够支持，例如半同步的异常处理机制能够正确恢复执行。

| 方法                                     | trap | prot1 | protN | unprot | map2 | dirty | pagesize |
| ---------------------------------------- | ---- | ----- | ----- | ------ | ---- | ----- | -------- |
| Concurrent GC（并发GC）                  | ✔    |       | ✔     | ✔      | ✔    |       | ✔        |
| SVM（共享虚拟内存）                      | ✔    | ✔     |       | ✔      | ✔    |       | ✔        |
| Concurrent checkpoint（并发检查点）      | ✔    | ✔     | ✔     | ✔      | ✖    | ✔(z)  | ○        |
| Generational GC（分代GC）                | ✔    | ✔     | ✔     | ✔      | ✖    | ✔(z)  | ○        |
| Persistent store（持久存储）             | ✔    | ✔     | ✔     | ✔      | ✖    | ✔     | ✔        |
| Extending addressability（扩展地址空间） | ✔    | ✔*    | ✖*    | ✔      | ✔    | ✖     | ✔        |
| Data-compression paging（压缩分页）      | ✔    | ✔*    | ✖*    | ✔      | ✔    | ✔     | ✔        |
| Heap overflow（堆溢出检测）              | ✔    | ✔     | ✖     | ✔      | ✖    | ✖     | ✖(y)     |

### 其他原语

操作系统还可以提供其他虚拟内存原语。例如，在支持事务的持久存储系统中，可以将页面“固定”（pin）在内存中，使其在事务完成之前不会被写回后备存储。

Mach 的外部分页器接口提供了一项本文未涉及但很有用的功能：操作系统可以告知客户端哪些页面是“最近最少使用”（LRU）并即将被换出。客户端可以选择直接丢弃这些页面，而不是写回磁盘。这对于数据压缩分页和扩展地址空间尤其有用。在带垃圾回收的系统中，客户端甚至可以知道某些区域只包含垃圾数据，从而安全地释放这些页面。

总体而言，外部分页器接口避免了这样的问题：操作系统分页器（负责将不常用页面写回磁盘）与用户态缺页处理程序之间可能重复做同样的工作。

## 6. 结论

虚拟内存最初只是用于实现大地址空间以及保护不同用户进程之间的隔离，但如今它已经演变为硬件与操作系统接口中的一个用户级组件。我们已经讨论了若干依赖虚拟内存原语的算法；这些原语在过去并未受到足够重视。在设计和分析新型计算机与操作系统性能时，页保护和缺页处理的效率必须作为设计空间中的一个重要参数加以考虑；页大小也是另一个重要参数。相对而言，对于许多算法来说，TLB 硬件的配置（例如在多处理器系统中）可能并不是特别关键。

表 2 展示了这些算法的用途和需求。有些算法一次只保护一页（prot1），而另一些则一次保护大量页面（protN），后者更容易高效实现。有些算法在并发执行时需要访问被保护的页面（map2）。还有一些算法使用内存保护仅仅是为了跟踪被修改过的页面（脏页，dirty），这一功能或许可以通过更高效的原语来提供。某些算法在较小的页面大小下可能运行得更高效。

许多利用虚拟内存的算法具有以下共同特征：

1. 内存通常以大批量方式被设置为“较难访问”，而以逐页方式恢复为“可访问”；这对 TLB 一致性算法有重要影响。
2. 缺页处理几乎完全由 CPU 完成，其耗时与页面大小成正比（比例常数相对较小）；这对页面大小的选择有影响。
3. 每一次缺页都会使发生缺页的页面变得更加可访问。
4. 缺页频率与程序的局部性（locality of reference）成反比；这一点保证了这些算法在长期运行中的竞争力。
5. 用户态的服务例程需要访问那些对用户态客户端例程来说是受保护的页面。
6. 用户态服务例程不需要检查客户端的 CPU 状态。

本文中描述的所有算法（除了堆溢出检测）都具备上述五个或更多特征。

大多数程序在一段中等时间范围内只会访问其地址空间的一小部分。这正是传统磁盘分页机制高效的原因；以不同方式，这也使本文中描述的算法变得高效。例如，并发垃圾回收算法必须扫描和复制相同数量的数据，而不受程序访问模式的影响，但程序的局部性可以降低缺页处理的开销。“写屏障”（write barrier）在分代垃圾回收、并发检查点以及持久存储算法中，如果只有一小部分对象承担了大多数更新操作，也能利用局部性优势。共享虚拟内存算法则利用了一种特殊的“分区局部性”，即每个处理器都有不同的本地访问模式。

我们认为，由于这些算法高度依赖局部性原理，它们具有良好的可扩展性。随着内存容量的增加和计算机速度的提升，程序实际活跃使用的地址空间比例将会进一步降低，从而使这些算法的开销持续下降。因此，硬件和操作系统设计者应当确保这些算法所依赖的虚拟内存机制既健壮又高效。



# FAQ（课件答疑整理）

> 来自 `uservm-faq.txt`，按问题逐条整理。

- **垃圾回收器和 OS 是什么关系？** GC 是**语言运行时**的一部分（Python、Go 等），不是内核；它作为用户程序的组件自动管理内存分配/回收，避免手动管理导致的 double-free、use-after-free。
- **Python 用什么 GC 算法？** CPython 用了多种 GC 实现，其中之一是**分代 GC**。
- **页错误在流水线处理器上能正确工作吗？** 能。现代 CPU 实现**精确异常（precise interrupt）**，保证保存的进程状态对应「按序完成到某条指令」的一致状态——但在深流水线上实现这点需要复杂硬件（也正是论文 §5「是否要求过高」讨论的点）。
- **谁来记录页是否为脏（dirty）？** 硬件在 PTE 里维护 **D 位**（如 RISC-V）。但多数 OS **不把这一位暴露给用户程序**，论文认为这是个缺憾。
- **VM 数据压缩分页在实践中用吗？** 用。例如 Android 用 Linux 的 **zram**（`zram` 用 zstd 压缩）缓解移动设备内存压力。
- **并发 GC 和分代 GC 能结合吗？** 能，已有混合策略的研究/实现。
- **xv6 为什么不支持用户态 VM 原语？怎么加？** 因为 **xv6 的目标是最小化的教学 OS**；不过学生会在 **mmap 实验**里亲手实现用户级 VM 原语（参见上面的思考题）。
- **磁盘局部性在闪存时代还重要吗？** 闪存访问比磁盘快得多，但**仍比 RAM 慢几个数量级**，所以局部性对性能仍然重要。
- **跨平台兼容性会不会和用户级算法冲突？** 现代 OS 都实现了**相似的一组原语**（`mmap`/`munmap`/`sigaction`），提供了跨平台的一致性。
- **checkpoint 多久做一次？是每次内存写都做吗？** 频率由应用决定；频繁 checkpoint 不现实，通常每隔几分钟周期性做一次，用于崩溃后无需从头重算地恢复。
- **压缩分页里数据怎么压/解压？** 用标准压缩算法，如 zram 用 **zstd**。
- **扩展地址空间为什么要在 32/64 位地址间转换指针？** 这个例子「今天看有点古老」，因为现在多数 CPU 指针就是 64 位，实际意义不大。
- **mutator 和 collector 到底是什么？** **mutator** 是创建/修改对象的应用程序（如 Python 程序），**collector** 是执行垃圾回收的运行时组件。
- **用户态能指定 fault handler，OS 怎么保证安全？** 内核**只把页错误转发给经历该错误的进程本身**；进程只看得到自己的错误、只能改自己的地址空间，故障被隔离在单个进程内（与 alarm 实验同理）。
- **持久存储（persistent store）什么时候用？** 文件系统就是一例；论文把持久性扩展到「运行中程序的对象」而无需显式文件调用，但这种做法至今不常见。
- **VM 技巧对数据库实现影响大吗？** 数据库常用 `mmap` 把数据库文件映射进内存，借 OS 页缓存代替自建 buffer cache——不过对 mmap 效率也有批评。
- **没保存的持久存储崩溃后怎么恢复？** 通常用**事务 + 日志**原子地更新对象组；崩溃安全被视为与本文的 VM 视角正交的问题。

# 参考材料

- [lec](https://pdos.csail.mit.edu/6.1810/2025/lec/l-uservm.txt)
- [faq](https://pdos.csail.mit.edu/6.1810/2025/lec/uservm-faq.txt)
- [mmap.c](https://pdos.csail.mit.edu/6.1810/2025/lec/mmap.c)
- xv6源码
  - `kernel/riscv.h`
  - `kernel/trampoline.S`
  - `kernel/trap.c`
