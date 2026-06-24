# Lec 17 文件系统

**LEC 17 (rtm):** [课件](https://pdos.csail.mit.edu/6.1810/2025/lec/l-fs.txt)

阅读 xv6 第 10 章

阅读源码：`buf.h`、`fs.h`、`bio.c`、`fs.c`、`sysfile.c`、`file.c`

本节学习文件系统：先理解为什么需要文件系统，再学习它在物理上、逻辑上是如何组织的，最后顺着 xv6 的七层结构和源码把「一次 open/write/rm 到底落了哪些盘」串起来。

## 总览

- **为什么要文件系统**：持久化、命名/组织、共享、设备无关
- **POSIX API 的含义**：文件是字节数组、硬链接、fd 独立于文件名
- **磁盘硬件模型**：HDD/SSD 的随机 vs 顺序、按扇区读写
- **磁盘上的布局**：boot / super / log / inode / bitmap / data
- **inode**：dinode 结构、直接块 + 一级间接块、最大文件、目录即文件
- **xv6 文件系统的七层结构**
- **源码精读**：buffer cache（bio.c）、bmap/readi/writei、路径查找 namex、分配器并发（balloc/ialloc）
- **落盘追踪**：`echo > x` / `echo a > x` / `rm x` 各写了哪些块
- 崩溃恢复（下一讲）

---

## 一、为什么需要文件系统

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>文件系统提供什么？</strong>
<ul>
<li><strong>持久化（durability）</strong>：断电后数据仍在；</li>
<li><strong>命名与组织</strong>：人类可读的层级路径；</li>
<li><strong>共享</strong>：在程序与用户之间共享数据；</li>
<li><strong>设备无关</strong>：在硬盘、闪存、网络存储之上提供统一抽象。</li>
</ul></div>

它之所以有趣，是因为要同时解决**崩溃恢复**、**性能**、**安全**，而且这套 API 还被推广到管道、设备、`/proc`、网络文件系统、Plan 9 等。

## 二、POSIX API 的设计含义

高层决策：对象是**文件**（不是裸磁盘块或数据库记录）；内容是**字节数组**（不是行列/B 树）；大小可动态追加、无需预分配；用**人类可读路径**命名；按**目录层级**组织；**不提供同步/版本**（要锁自己加）。

```c
fd = open("x/y", ...);
write(fd, "abc", 3);
link("x/y", "x/z");   // 同一文件有了两个名字（硬链接）
unlink("x/y");        // 删掉一个名字，但 fd 仍然有效
write(fd, "def", 3);
close(fd);
// 文件内容仍是 abcdef
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>这个例子说明：fd 指向的是「持久对象」本身，与文件名的增删无关。</strong>所以文件的元数据必须独立于目录项存在 → 这就是 <strong>inode</strong>（磁盘上保存文件信息，用 i-number 标识）。inode 要记 <strong>nlink（硬链接数）</strong>和<strong>打开的 fd 数</strong>：只有当两者都归零，才能真正回收。</div>

## 三、磁盘硬件模型

| 维度 | HDD（机械盘） | SSD（闪存） |
| --- | --- | --- |
| 随机访问延迟 | 5–10 ms（寻道+旋转） | ~100 µs |
| 顺序吞吐 | ~100 MB/s | ~500 MB/s |
| 读写单位 | 整扇区（典型 512B） | 整页/块 |

共同约束：**只能按块读写**；**顺序远快于随机**；**大 I/O 快于小 I/O**。这两点深刻影响文件系统设计（要尽量顺序、批量）。xv6 用 **1024 字节的块（= 2 个扇区）**。

## 四、磁盘上的布局

```
[ boot block | super block | log | inode blocks | free bitmap | data blocks ]
   block 0       block 1     2..    ...            ...           ...
```

- **block 0**：引导块，文件系统不用；
- **super block**：记录整个布局（各区起始块号、大小、inode 数）——由 `mkfs` 在建空文件系统时算好写入，内核启动时读取；
- **log**：崩溃恢复的事务日志（下一讲）；
- **inode blocks**：inode 数组，每个 dinode 64 字节、每块 16 个；
- **free bitmap**：每个数据块一个 bit，0=空闲 1=占用；
- **data blocks**：文件/目录的内容。

> 「元数据」= 除文件内容外的一切（super block、inode、bitmap、目录项）。

## 五、inode 与目录

### dinode（磁盘上的 inode）

```c
struct dinode {
  short type;              // 0=空闲 / 文件 / 目录 / 设备
  short major, minor;      // 设备号（T_DEVICE 才用）
  short nlink;             // 硬链接数
  uint  size;              // 文件字节数
  uint  addrs[NDIRECT+1];  // 12 个直接块 + 1 个间接块
};
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>直接块 + 一级间接块 → 最大文件多大？</strong>前 <strong>12 个 addrs 是直接块</strong>（直接指向文件前 12 个块）；第 13 个是<strong>间接块</strong>，指向一个装着 256 个块号的块（1024B / 4B = 256）。所以最大文件 = <code>(12 + 256) × 1024B = 268 KB</code>。给定 i-number，inode 在盘上的位置由 <code>IBLOCK(i, sb)</code> 直接算出，定位很快。</div>

### 目录就是「内容为 dirent 数组」的文件

```c
struct dirent {
  ushort inum;        // inode 号（0 表示空闲项）
  char   name[DIRSIZ];// 文件名（最多 14 字节，可不以 NUL 结尾）
};
```

目录的 inode `type = T_DIR`，与普通文件**共用同一套读写实现**，只是内容被解释成一串 dirent。根目录的 i-number 固定为 **1**（`ROOTINO`），由 `mkfs` 创建，内核启动就知道去哪找。

## 六、xv6 文件系统的七层结构

从下到上，每层只依赖下层：

| 层 | 文件 | 职责 |
| --- | --- | --- |
| 7. 文件描述符 / 路径名 | file.c, sysfile.c | 面向用户的 API（open/read/write…）|
| 6. 目录 | fs.c | 用 dirent 实现命名（dirlookup/dirlink）|
| 5. inode | fs.c | 文件元数据 + 逻辑块↔物理块（bmap/readi/writei）|
| 4. inode 缓存 / logging | fs.c, log.c | 内存中的 inode 副本 + 事务（崩溃安全）|
| 3. buffer cache | bio.c | 在 RAM 里缓存磁盘块、串行化并发访问 |
| 2. 磁盘驱动 | virtio_disk.c | 按扇区读写 |
| 1. 磁盘 | —— | 物理存储 |

---

# 源码精读

> 代码取自 xv6-riscv（rev5）。下面挑文件系统最核心的几条链路：块缓存 → 逻辑/物理块翻译 → 读写 → 路径查找 → 分配器并发。

## 1. `bio.c`：buffer cache（块缓存）

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>块缓存的双重目的</strong>① <strong>同步</strong>：保证同一个磁盘块在内核里只有一份内存副本，多个进程对它的访问被串行化；② <strong>缓存</strong>：把常用块留在内存，摊销磁盘延迟。</div>

```c
struct buf {
  int valid;          // 是否已从磁盘读入
  int disk;           // 磁盘是否“拥有”这个 buf（DMA 进行中）
  uint dev, blockno;
  struct sleeplock lock; // 保护 buf 内容
  uint refcnt;        // 引用计数
  struct buf *prev, *next; // LRU 双向链表
  uchar data[BSIZE];
};
```

**`bget`**：在缓存里找块；找到就增引用、上锁返回；找不到就回收最久未用的空闲 buf：

```c
static struct buf* bget(uint dev, uint blockno) {
  acquire(&bcache.lock);
  // ① 已缓存？从表头（最近用）往后找
  for (b = bcache.head.next; b != &bcache.head; b = b->next)
    if (b->dev == dev && b->blockno == blockno) {
      b->refcnt++;
      release(&bcache.lock);
      acquiresleep(&b->lock);   // 返回“已上锁”的 buf
      return b;
    }
  // ② 未缓存：从表尾（最久未用）往前找 refcnt==0 的回收
  for (b = bcache.head.prev; b != &bcache.head; b = b->prev)
    if (b->refcnt == 0) {
      b->dev = dev; b->blockno = blockno; b->valid = 0; b->refcnt = 1;
      release(&bcache.lock);
      acquiresleep(&b->lock);
      return b;
    }
  panic("bget: no buffers");
}
```

**`bread` / `bwrite` / `brelse`**：

```c
struct buf* bread(uint dev, uint blockno) {
  struct buf *b = bget(dev, blockno);
  if (!b->valid) { virtio_disk_rw(b, 0); b->valid = 1; } // 缓存没有才真读盘
  return b;
}
void bwrite(struct buf *b) {            // 必须持有 b->lock
  virtio_disk_rw(b, 1);
}
void brelse(struct buf *b) {
  releasesleep(&b->lock);
  acquire(&bcache.lock);
  b->refcnt--;
  if (b->refcnt == 0) { /* 移到表头：标记为最近使用 */ }
  release(&bcache.lock);
}
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>两把锁，各司其职</strong><code>bcache.lock</code>（spinlock）保护「缓存元数据」——哪些块在缓存里、各自的 refcnt 与链表；<code>b->lock</code>（sleeplock）保护「单个块的内容」，允许持有它时进行磁盘 I/O（会睡眠）。<code>bget</code> 返回<strong>已上锁</strong>的 buf，防止使用期间被回收；调用者用完必须 <code>brelse</code>。LRU：<code>bget</code> 从表尾回收，<code>brelse</code> 把块挪回表头。</div>

## 2. `fs.c:bmap()`：逻辑块号 → 物理块号

文件第 `bn` 个块在磁盘的哪？前 12 个查直接块，再往后查间接块；没分配就 `balloc` 现分配：

```c
static uint bmap(struct inode *ip, uint bn) {
  if (bn < NDIRECT) {                       // 直接块
    if ((addr = ip->addrs[bn]) == 0)
      ip->addrs[bn] = addr = balloc(ip->dev);
    return addr;
  }
  bn -= NDIRECT;
  if (bn < NINDIRECT) {                      // 间接块
    if ((addr = ip->addrs[NDIRECT]) == 0)    // 间接块本身没分配？先分配
      ip->addrs[NDIRECT] = addr = balloc(ip->dev);
    bp = bread(ip->dev, addr);               // 读出那 256 个块号
    a = (uint*)bp->data;
    if ((addr = a[bn]) == 0) {
      addr = balloc(ip->dev);
      if (addr) { a[bn] = addr; log_write(bp); } // 改动经 log 写（崩溃安全）
    }
    brelse(bp);
    return addr;
  }
  panic("bmap: out of range");
}
```

> `itrunc` 是它的逆操作：遍历直接块和间接块逐个 `bfree`，最后把 `size` 清零。

## 3. `fs.c:readi()` / `writei()`：按字节读写

二者都靠 `bmap` 把「偏移」翻成块，再逐块 `bread` 拷贝，处理跨块拼接：

```c
int readi(struct inode *ip, int user_dst, uint64 dst, uint off, uint n) {
  if (off > ip->size || off + n < off) return 0;
  if (off + n > ip->size) n = ip->size - off;   // 截断到文件末尾
  for (tot = 0; tot < n; tot += m, off += m, dst += m) {
    uint addr = bmap(ip, off / BSIZE);           // 第几个块
    bp = bread(ip->dev, addr);
    m = min(n - tot, BSIZE - off % BSIZE);       // 本块内还能读多少
    either_copyout(user_dst, dst, bp->data + (off % BSIZE), m);
    brelse(bp);
  }
  return tot;
}
```

`writei` 结构对称，但写满会用 `bmap` 现分配新块、可能增大 `ip->size` 并 `iupdate` 落盘。

## 4. `fs.c:namex()`：路径名查找

逐段解析路径（`a/b/c`），每段在当前目录里 `dirlookup`，下钻到下一个 inode：

```c
static struct inode* namex(char *path, int nameiparent, char *name) {
  if (*path == '/') ip = iget(ROOTDEV, ROOTINO); // 绝对路径从根开始
  else              ip = idup(myproc()->cwd);    // 相对路径从 cwd 开始

  while ((path = skipelem(path, name)) != 0) {   // 取出一段到 name
    ilock(ip);
    if (ip->type != T_DIR) { iunlockput(ip); return 0; }
    if (nameiparent && *path == '\0') {          // namei父：到倒数第二段就停
      iunlock(ip); return ip;
    }
    if ((next = dirlookup(ip, name, 0)) == 0) { iunlockput(ip); return 0; }
    iunlockput(ip);    // ★ 先解锁旧目录，再继续——允许并发查找
    ip = next;
  }
  ...
  return ip;
}
```

<div style="border-left: 4px solid #5cb85c; background: #eafbea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>为什么查完一段就立刻 <code>iunlockput</code> 解锁？</strong>为了<strong>并发</strong>：一个进程在某次查找中等磁盘，不该卡住其他进程的查找。代价是「解锁旧目录」和「锁住下一个 inode」之间，别的进程可能 <code>unlink</code> 掉下一个 inode——但没关系：只要还有引用（refcnt&gt;0），inode 就不会被真正删除（这正是引用计数的价值）。<code>ilock</code>（锁）与 <code>iget/idup</code>（拿引用）被刻意分开，正是为此。</div>

## 5. 分配器的并发：`balloc` / `ialloc`

`balloc`（分配数据块）和 `ialloc`（分配 inode）都遵循同一套并发模式——**靠 bitmap/inode 所在块的 buffer 锁**串行化：

```c
// bread() 返回时已持有该块的 sleeplock → 天然互斥
bp = bread(dev, BBLOCK(b, sb));   // 锁住 bitmap 块，读入
// ... 扫描/修改某一位 ...
log_write(bp);                    // 改动经 log
brelse(bp);                       // 解锁
```

<div style="border-left: 4px solid #4a90d9; background: #eaf2fb; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>两个 <code>ialloc</code> 并发会不会分到同一个 inode？</strong>不会。它们都要先 <code>bread</code> 同一个 inode 块（或 bitmap 块），而 <code>bread→bget</code> 返回的 buf 是<strong>上了 sleeplock 的</strong>，所以同一时刻只有一个能扫描/修改，另一个睡眠等待。<code>balloc</code> 分配数据块后还会 <code>bzero</code> 清零——防止把上一个文件的残留数据泄露给新文件。</div>

---

# 落盘追踪：一条命令到底写了哪些块

> 课件用 gdb 在 `bwrite` 上打断点，展示每个操作的写盘序列。块号含义：33=目录 inode 所在块、34=新文件 inode 所在块、46=bitmap、47=目录内容、914=文件数据块。

**`echo > x`（创建空文件 x）**：

```
sys_open → create:
  bwrite 34   ialloc()    // 分配新 inode
  bwrite 34   iupdate()   // 写新 inode 的 nlink 等
  bwrite 47   dirlink()   // 在父目录内容里加一条 dirent "x"
  bwrite 33   iupdate()   // 更新父目录 inode
  bwrite 34   itrunc()    // 把新 inode 截断为 0（保险）
```

**`echo a > x`（写入 "a\n"）**：

```
sys_open  → itrunc → iupdate           // 因 > 先截断
sys_write → filewrite → writei:
  bwrite 46   balloc()    // 从 bitmap 分一个数据块(914)
  bwrite 914  bzero()     // 清零新块
  bwrite 914  writei()    // 写入 'a'
  bwrite 34   iupdate()   // 更新 inode 的 size 和块指针
  bwrite 914  writei()    // 写入 '\n'
  bwrite 34   iupdate()   // 再次更新 size
```

**`rm x`（删除）**：

```
sys_unlink:
  bwrite 47   writei()    // 把目录里 "x" 那条 dirent 清掉(inum=0)
  bwrite 33   iupdate()   // 更新目录 inode
  bwrite 34   iupdate()   // 文件 nlink--（变 0）
  iput → itrunc:
    bwrite 46 bfree()     // 在 bitmap 里把数据块标记为空闲
    bwrite 34 iupdate()   // size 清零
    bwrite 34 iupdate()   // 把 inode 标记为空闲(type=0)
```

> 可以看到：**一个用户操作往往对应多次分散的写盘**（inode、bitmap、目录、数据各在不同块）。

---

## 崩溃恢复（下一讲）

<div style="border-left: 4px solid #d9534f; background: #fbeaea; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"><strong>遗留问题：如果在上面某次操作「中途」断电怎么办？</strong>比如 <code>create</code> 已经写了 dirent 但还没更新 inode——文件系统就会处于不一致状态。解决办法是<strong>日志（logging）+ 事务</strong>，把「一组写」打包成原子单元，崩溃后能重放或丢弃。这正是 Lec 18 的主题。</div>

## 现代系统与性能

- xv6 当前布局对 HDD **不友好**：inode 与文件内容、相邻文件块之间要长距离寻道。更好的布局会把一个文件的块**聚簇**在一起、把 inode **分散到内容附近**。
- 两级缓存的意义：**块缓存**摊销磁盘延迟、**inode 缓存**把常用 inode 留在内存。
- 顺序 I/O（100–500 MB/s）远快于随机（HDD 5–10ms / SSD 100µs），所以文件系统设计要尽量顺序、批量。
