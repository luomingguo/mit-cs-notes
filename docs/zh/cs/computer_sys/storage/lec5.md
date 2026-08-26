---
title: 文件系统的组织
type: lecture
lecture: 5
tags: []
status: complete
---
# Lec 5 文件系统的组织

- [UNIX Internals: The New Frontiers, CH8]()
  - 国内 FAi《深入理解 UNIX 系统内核》

- [Practical File System Design with the Be File System, CH2](https://scispace.com/pdf/practical-file-system-design-with-the-be-file-system-4wxjpr341a.pdf)
- [Operating Systems: Three Easy Pieces, CH39](http://pages.cs.wisc.edu/~remzi/OSTEP/file-intro.pdf)

进程和地址空间分别是 CPU 和内存的虚拟化，两个抽象结合在一起，使得程序运行时仿佛处在一个私有、隔离的世界中，仿佛它拥有自己的处理器、内存。这种幻觉极大简化了系统编程。本节介绍另外一个关键的虚拟化技术：持久化存储。

关键问题：

- OS 应该如何管理持久化设备？
- 应该提供怎么样的 API？
- 实现中有哪些关键方面需要考虑？

## 文件与目录

文件本质上只是一个字节的线性数组（linear array of bytes），你可以从其中的字节进行读取或写入。每个文件都有某种底层名称，通常是一个数字；用户并不知道。由于历史原因，文件的这种底层名称通常称为 inode 号（inode number）。第二个抽象是目录，和文件一样，也有一个低层名称（即 inode 号），但它的内容具有非常特定的结构：它包含一系列\<用户可读名称，低层名称\>的映射对。目录中的每一个条目都指向一个文件或者另一个目录。通过在目录中嵌套目录，用户可以构建任意的目录树（directory tree）或目录层次结构（directory hierarchy），所有的文件和目录都存储在这棵树中。

## 文件系统接口

### 创建文件

我们从最基本的操作开始：创建一个文件。这可以通过 open 系统调用完成；调用 open() 并传入 O_CREAT 标志，程序就可以创建一个新文件。

下面是一个示例代码，在当前工作目录中创建一个名为 “foo” 的文件：

```c
int fd = open("foo", O_CREAT | O_WRONLY | O_TRUNC,
              S_IRUSR | S_IWUSR);

注解：
O_CREAT
如果文件不存在，就创建该文件

O_WRONLY
确保文件只能以写模式打开

O_TRUNC
如果文件已经存在，就把文件截断为 0 字节，也就是清空原有内容
  
S_IRUSR
文件所有者可读

S_IWUSR
文件所有者可写
```

较早期创建文件的方法是调用 creat()，如下：

```c
int fd = creat("foo");
```

你可以把 creat() 理解为带有以下标志的 open()：

```c
O_CREAT | O_WRONLY | O_TRUNC
```

由于 open() 已经可以创建文件，因此 creat() 的使用现在已经不太常见（事实上，它完全可以被实现为一个对 open() 的库封装）。不过，它在 UNIX 历史中仍然占有一个特殊的位置。

> 曾经有人问 UNIX 的设计者 Ken Thompson，如果重新设计 UNIX，他会做什么不同的事情？他回答说： “我会把 creat 拼成 create（多加一个 e）。”

open() 的一个重要特性是它的返回值：文件描述符。文件描述符本质上是一个整数，并且在每个进程内部是私有的。从这个角度看，文件描述符其实是一种 capability（能力）。也就是说，它是一个不透明的句柄（opaque handle），持有它就意味着你拥有执行某些操作的权限。另一种理解方式是：文件描述符就像是指向一个 file 类型对象的指针。一旦你获得了这个对象，就可以调用其他“方法”来操作文件

下面是 xv6 内核中的相关代码片段：

```c
struct proc {
    ...
    struct file *ofile[NOFILE]; // 打开的文件
    ...
};
```

### 读取与写入

> [!IMPORTANT]
>
> 提示：使用 strace（以及类似工具）
>
> strace 是一个非常强大的工具，可以用来观察程序到底在做什么。通过运行 strace，你可以跟踪一个程序执行了哪些系统调用，查看调用参数和返回值，从而很好地理解程序内部发生了什么。这个工具还提供了一些非常有用的参数。例如：
>
> - -f  跟踪所有 fork 出来的子进程
>
> - -t 在每次系统调用时显示当前时间
>
> - -e trace=open,close,read,write 只跟踪这些系统调用，而忽略其他调用
>
>
>
>

下面是使用 strace 查看 cat 做了什么的示例（为了可读性省略了一些调用）：

```shell
prompt> strace cat foo
...
open("foo", O_RDONLY|O_LARGEFILE) = 3
read(3, "hello\n", 4096) = 6
write(1, "hello\n", 6) = 6
hello
read(3, "", 4096) = 0
close(3) = 0
...
prompt>
```

接下来，在 strace 输出中我们看到一个有趣的操作：调用了 write() 系统调用，并且写入的目标是文件描述符 1。文件描述符 1 表示标准输出，因此这一步把字符串 “hello” 输出到了屏幕上，这正是 cat 程序的功能。

那么 cat 是直接调用 write() 吗？有可能（如果程序经过高度优化）。但更常见的情况是，它会调用库函数 printf()。printf() 在内部处理格式化细节，最终还是通过 write() 系统调用把数据写入标准输出，从而显示到屏幕。之后，cat 程序再次尝试从文件读取数据。但由于文件已经没有剩余内容，read() 返回 0。程序通过这个返回值知道已经读到了文件末尾。于是程序调用 close()，并传入对应的文件描述符，表示不再使用文件 foo。这样文件就被关闭了，读取操作也就完成了。

写入文件的过程与此类似：

1. 打开文件（以写模式）
2. 调用 write() 写入数据（对于大文件可能多次调用）
3. 调用 close() 关闭文件

你可以使用 strace 来观察文件写入过程，例如跟踪你自己写的程序，或者跟踪 dd 工具，例如：

```sh
dd if=foo of=bar
```

补充：数据结构 —— **打开文件表（Open File Table）**，每个进程都会维护一个文件描述符数组。数组中的每一个元素都指向系统范围的“打开文件表”（open file table）中的一个条目。这个表中的每个条目记录：

- 文件描述符所对应的底层文件
- 当前读写偏移量（offset）
- 其他相关信息，例如文件是否可读或可写

换句话说，系统内部大致结构是：

进程
 → 文件描述符表（per-process）

文件描述符
 → 指向系统级 open file table 条目

open file table
 → 指向真正的文件（inode）

这也是 UNIX 文件系统设计中非常经典的一层抽象。

**非顺序访问**

有时我们需要在文件的某个特定位置进行读写，为了实现这一点，可以使用 lseek() 系统调用。其函数原型如下：

```c
off_t lseek(int fildes, off_t offset, int whence);

第一个参数是文件描述符（file descriptor）。
第二个参数是偏移量（offset），用来把文件偏移位置移动到文件中的某个特定位置。
第三个参数叫做 whence（历史原因留下的名字），用于指定偏移是如何计算的。
  
根据 man 手册：

如果 whence 是 SEEK_SET，则偏移量被设置为 offset 字节。
如果 whence 是 SEEK_CUR，则偏移量被设置为当前偏移量加上 offset。
如果 whence 是 SEEK_END，则偏移量被设置为文件大小加上 offset。
```

| 系统调用                       | 返回值 (Return Code) | 当前偏移量 (Current Offset) |
| ------------------------------ | -------------------- | --------------------------- |
| `fd = open("file", O_RDONLY);` | 3                    | 0                           |
| `read(fd, buffer, 100);`       | 100                  | 100                         |
| `read(fd, buffer, 100);`       | 100                  | 200                         |
| `read(fd, buffer, 100);`       | 100                  | 300                         |
| `read(fd, buffer, 100);`       | 0                    | 300                         |
| `close(fd);`                   | 0                    | –                           |

### 共享文件表项：fork() 和 dup()

在许多情况下，文件描述符 到 打开文件表（Open File Table）项的映射是 1 对 1 的。例如一个进程可能会：

1. 打开一个文件
2. 读取一个文件
3. 关闭一个文件

这种情况下，该文件会在打开文件表中有一个独立表项，即使另外一个进程读取同一个文件，也有各自独立的表项。因此，每次对文件的逻辑读/写入都是相互独立的。每个进程访问文件时都有自己的 current offset（当前偏移量）。但是，一些特殊情况下，多个文件描述符会共享同一个打开文件表项，其中一种是`fork()`，当多个进程共享一个 file table entry 时， ref 会增加，只有当两个进程都关闭文件或退出时，这个表项次会被删除。

![image-20260310150134558](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260310150134558.png)

有时候共享打开文件表项是有用的，例如多个进程协同完成任务，可以同时写入同一个输出文件——共享 offset，不需要额外同步。另一种共享 open file table entry 的方式是：`dup()`、`dup2()`、`dup3()`

创建一个新的 file descriptor， 但指向同一个打开文件表项，因此这两个文件描述符共享同一个 offset、flags

```c
int main(int argc, char *argv[]) {
    int fd = open("README", O_RDONLY);
    assert(fd >= 0);

    int fd2 = dup(fd);

    // fd 和 fd2 可以互换使用

    return 0;
}
```

`dup2()` 在实现 UNIX shell 的输出重定向 时非常重要，例如`ls > file.txt`， shell 实现原理，首先`open(file.txt)`、然后`dup2(fd, STDOUT)`，最后`exec(ls)`

### fsync()立即写入磁盘

通常情况下，当程序调用：

```text
write()
```

实际上只是告诉文件系统：请在未来某个时间把这些数据写入磁盘。为了提高性能，文件系统通常会：先把数据写入 **内存缓冲区**，延迟写入磁盘。

有些应用不能接受数据丢失风险，`fsync(int fd)`， 强制把文件的 所有 脏数据 写入磁盘，只有所有写入完成，才会返回

```c
int fd = open("foo", O_CREAT|O_WRONLY|O_TRUNC,
              S_IRUSR|S_IWUSR);
assert(fd > -1);

int rc = write(fd, buffer, size);
assert(rc == size);

rc = fsync(fd);
assert(rc == 0);
```

上面的代码 仍然不完全安全。有时还需要：

```text
fsync(directory)
```

即：对包含该文件的目录也执行 fsync()，原因是：如果文件是新创建的：不仅要保证文件数据写入磁盘，还要保证目录项也写入磁盘。否则，系统崩溃后可能出现：文件数据存在，但目录里没有这个文件。这类问题在很多应用程序中被忽略，导致了大量真实系统 bug。

### 原子文件更新

当我们已经创建了一个文件，有时希望给它换一个名字。在命令行中可以使用如下脚本，把文件 **foo** 改名为 **bar**。

```sh
mv foo bar
```

如果使用 `strace` 观察 `mv` 命令，可以看到它调用的系统调用是：

```c
rename(char *old, char *new)
```

 rename() 的一个重要保证——原子性。一个实际例子，文本编辑器如何保存文件，想象你用 emacs 编辑文件，在中间插入了一行。编辑器通常不会直接修改原文件，而是这样操作：

```c
int fd = open("foo.txt.tmp",
              O_WRONLY|O_CREAT|O_TRUNC,
              S_IRUSR|S_IWUSR);

write(fd, buffer, size);   // 写入新的文件内容
fsync(fd);                 // 强制写入磁盘
close(fd);

rename("foo.txt.tmp", "foo.txt");
```

这就是实现 原子文件更新 的经典方法。

### 获取文件信息

可以使用两个系统调用获取这些信息：

```sh
stat(path)
fstat(fd)
```

它们会把信息写入一个结构体`stat`

```c
struct stat {
    dev_t st_dev;       // 文件所在设备
    ino_t st_ino;       // inode 编号
    mode_t st_mode;     // 文件权限
    nlink_t st_nlink;   // 硬链接数量
    uid_t st_uid;       // 所有者用户ID
    gid_t st_gid;       // 所有者组ID
    dev_t st_rdev;      // 特殊设备ID
    off_t st_size;      // 文件大小（字节）
    blksize_t st_blksize; // 文件系统 I/O 块大小
    blkcnt_t st_blocks; // 占用块数量
    time_t st_atime;    // 最后访问时间
    time_t st_mtime;    // 最后修改时间
    time_t st_ctime;    // 元数据改变时间
};
```

大多数文件系统会把这些信息保存在 `inode`结构里，它是文件系统中的持久化数据结构，里面保存：

- 文件大小
- 权限
- 时间
- 数据块的位置等信息

重要的是，inode 在磁盘上，为了提高性能，活跃的 inode 会缓存到内存

### 删除文件

用的是`unlink`而不是 delete、remove，原因是在 UNIX 文件系统中，文件不等于文件名，文件名 只是目录的一个链接。`unlink()` 做的事情其实是删除 inode 的链接。

### 创建目录

你 不能直接写入目录。目录的格式被视为 文件系统元数据（metadata），文件系统负责保证目录数据的完整性。你只能通过 间接操作 更新目录，例如在目录中创建文件、目录或其他对象。

使用系统调用：

```c
mkdir(const char *pathname, mode_t mode);
```

命令行工具：

```sh
mkdir foo
```

strace 观察：

```sh
strace mkdir foo
mkdir("foo", 0777) = 0
```

### 读取目录

程序 `ls` 就是这样做的。可以使用三类系统调用：

```c
opendir()   // 打开目录
readdir()   // 读取目录条目
closedir()  // 关闭目录
```

示例程序：

```c
DIR *dp = opendir(".");
assert(dp != NULL);

struct dirent *d;
while ((d = readdir(dp)) != NULL) {
    printf("%lu %s\n", (unsigned long) d->d_ino, d->d_name);
}

closedir(dp);
```

```c
struct dirent {
    char d_name[256];      // 文件名
    ino_t d_ino;           // inode 编号
    off_t d_off;           // 下一个目录条目偏移
    unsigned short d_reclen; // 记录长度
    unsigned char d_type;    // 文件类型
};
```

提示：目录条目本身信息很少，只是 **名字 ↔ inode 映射**，若需要更多信息（如文件大小），可以对每个文件调用 `stat()`。

### 删除目录

删除目录使用系统调用：

```c
rmdir(const char *pathname);
```

与文件不同，删除目录更危险，因为可能一次性删除大量数据，**要求目录为空**（仅包含 `.` 和 `..`） 否则 `rmdir()` 调用失败

### 硬链接

现在来解释为什么删除文件要用 `unlink()`。

link() 系统调用

```c
link(const char *oldpath, const char *newpath);
```

作用：给已有文件创建 新的目录条目，新条目指向相同的 inode， 文件内容 **不会被复制**

示例

```sh
echo hello > file
cat file
# 输出: hello

ln file file2
cat file2
# 输出: hello
```

`file` 与 `file2` 都指向 **同一个 inode**

查看 inode：

```sh
ls -i file file2
67158084 file
67158084 file2
```

硬链接原理

1. 创建文件 → 生成 inode
2. 创建人类可读的文件名 → 写入目录条目
3. 硬链接 → 给同一个 inode 增加一个目录条目

### 符号链接

还有一种非常有用的链接类型，称为 **符号链接（symbolic link）**，有时也叫 **软链接（soft link）**。硬链接有一些限制：

- 不能对目录创建硬链接（怕目录树形成循环）
- 不能跨文件系统硬链接（inode 号只在单个文件系统内唯一）

因此，系统引入了 符号链接。

**符号链接本身是一个文件**，类型不同于普通文件或目录， 用 `stat` 可以看到区别：

```sh
stat file
# regular file

stat file2
# symbolic link
```

用 `ls -al` 可以看出类型和链接指向：

```sh
drwxr-x--- 2 remzi remzi 29 May 3 19:10 ./
drwxr-x--- 27 remzi remzi 4096 May 3 15:14 ../
-rw-r----- 1 remzi remzi 6 May 3 19:10 file
lrwxrwxrwx 1 remzi remzi 4 May 3 19:10 file2 -> file
```

符号链接可能出现 **悬挂引用**，删除原文件会导致符号链接指向不存在的路径

### 权限位与访问控制列表

CPU 和内存虚拟化给进程一种 私有资源的错觉， 文件系统也提供了类似虚拟化的视图，将磁盘块映射为 用户友好的文件和目录。

使用 `ls -l` 查看文件权限：

```sh
ls -l foo.txt
-rw-r--r-- 1 remzi wheel 0 Aug 24 16:29 foo.txt
```

- 第一个字符表示文件类型：
   `-` 普通文件，`d` 目录，`l` 符号链接
- 后面 9 个字符表示权限位（owner/group/others）：

```sh
rw-r--r--
```

- 前 3 位：文件所有者权限（读 r、写 w、执行 x）
- 中间 3 位：所属组权限
- 后 3 位：其他用户权限

示例解释：

- 文件所有者可以读写 (`rw-`)
- 所属组可以读 (`r--`)
- 其他用户也可以读 (`r--`)

改变权限，使用 `chmod`：

```sh
chmod 600 foo.txt # 结果: rw------- （只有文件所有者可以读写）
```

## 文件系统的相关对象

在现代操作系统中，为了支持多种不同的文件系统（如 ext4、XFS、NTFS、BFS 等），内核设计了 **VFS（Virtual File System）抽象层**。VFS 将文件系统无关的操作与具体文件系统实现分离，使得内核可以通过统一接口访问各种文件系统，而无需关心底层实现细节。****

`vnode` 是 VFS 的核心抽象对象，用于表示一个文件系统中的文件或目录。vnode 不能独立存在，通常通过文件实例化生成。`vnode` 的 `v_op` 和 `v_data` 字段将通用接口与文件系统实现联系起来。

![image-20260310162052619](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260310162052619.png)

`v_data`：指向文件系统私有数据结构（opaque pointer），例如：inode（如 ext4）、rnode（如 NFS）或者 BFS 特有结构等等，由于它是不透明的，文件系统无关代码不能直接访问，但文件系统内部可以通过类型转换访问它。

`v_op`：指向一个 `vnodeops` 结构，定义了文件的操作接口（如 open、read、write、lookup 等）。

### vnodeops 结构

```c
struct vnodeops {
    int (*vop_open)(struct vnode *vp, int mode, struct ucred *cred);
    int (*vop_close)(struct vnode *vp, int fflag, struct ucred *cred);
    int (*vop_read)(struct vnode *vp, struct uio *uio, int ioflag, struct ucred *cred);
    int (*vop_write)(struct vnode *vp, struct uio *uio, int ioflag, struct ucred *cred);
    int (*vop_lookup)(struct vnode *dvp, char *name, struct vnode **vpp, struct componentname *cn);
    int (*vop_create)(struct vnode *dvp, char *name, struct vattr *vap, struct vnode **vpp);
    int (*vop_remove)(struct vnode *dvp, struct vnode *vp, char *name);
    ...
};
```

当上层调用 `open()`, `read()`, `write()` 等系统调用时，VFS 会找到对应文件的 vnode。VFS 通过 `v_op` 调用文件系统的具体实现函数，从而完成操作。这样，内核可以统一处理文件操作，而无需了解底层文件系统细节。

### vfs 层结构

像 vnode 一样，vfs 对象有只想起私有数据和操作向量的指针。`vfs_data` 指向每个文件系统吃藕的不透明的数据结构。不像 vnode，vfs 对象和私有数据结构通常被分开分配。 `vfs_op`字段指向一个`vfsops`结构，其具体形式如下

```c
struct vfsops {
  int (*vfs_mount)();
  int (*vfs_unmount)();
  int (*vfs_root)();
  int (*vfs_statvfs)();
  int (*vfs_sync)();
}
```

![image-20260310163121826](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260310163121826.png)
