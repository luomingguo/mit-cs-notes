---
title: Lab 7 Valgrind
course: 6.1800 计算机系统工程
course_id: '6.1800'
kind: system
tags: []
status: complete
---
# Lab 7 Valgrind

## 本讲导览

Valgrind 是一套运行在 Linux 上基于模拟的调试和分析工具。系统包含一个核（core），Valgrind 的核心（这个“合成 CPU”）会读取您程序原本的机器指令（x86, amd64 等），将原始指令翻译成等价但加入额外检测代码的指令。 架构是模块化的，因此新的 可以轻松创建工具，而不会干扰现有的结构。 提供了一个一个工具，每个工具负责一种调试， 总得来说有：

1. Memcheck :检测内存管理问题 在您的程序中。检查内存的所有读写，并且 对 malloc/new/free/delete 的调用被拦截。结果， Memcheck 可以检测以下问题
   - 使用未初始化的内存
   - 读取/写入已被释放的内存
   - 读取/写入超出 `malloc` 分配块末尾的位置
   - 读取/写入栈上的不当区域
   - 内存泄漏 —— 指向 `malloc` 分配的内存块的指针永久丢失
   - `malloc`/`new`/`new []` 与 `free`/`delete`/`delete []` 的不匹配使用
   - `memcpy()` 及相关函数中源指针和目标指针重叠的问题
2. Cachegrind： 是一个缓存剖析器。它详细模拟您 CPU 中的 I1、D1 和 L2 缓存，因此能够精确定位代码中缓存未命中的根源。如果您需要，它可以显示每行源代码引起的缓存未命中次数、内存引用次数和指令计数，并提供按函数、按模块和整个程序的摘要。
3. Helgrind：数据竞争检测器。 用于查找多线程程序中的数据竞争。Helgrind 会查找被多个（POSIX p-）线程访问、但找不到一致使用的（`pthread_mutex_`）锁的内存位置。这类位置表明线程间缺少同步，可能导致难以发现的、与时序相关的问题。
4. Callgrind： 重量级的 Profiler。

## helgrind

检测数据竞争，执行命令

```shell
$ valgrind --tool=helgrind ./ph 2
==8945== Helgrind, a thread error detector
==8945== Copyright (C) 2007-2009, and GNU GPL'd, by OpenWorks LLP et al.
==8945== Using Valgrind-3.6.0.SVN-Debian and LibVEX; rerun with -h for copyright info
==8945== Command: ./ph 2
==8945== 
==8945== Thread #2 was created
==8945==    at 0x513612E: clone (clone.S:77)
==8945==    by 0x4E37172: pthread_create@@GLIBC_2.2.5 (createthread.c:75)
==8945==    by 0x4C2C42C: pthread_create_WRK (hg_intercepts.c:230)
==8945==    by 0x4C2C4CF: pthread_create@* (hg_intercepts.c:257)
==8945==    by 0x4010B8: main (ph.c:148)
==8945== 
==8945== Thread #1 is the program's root thread
==8945== 
==8945== Possible data race during write of size 8 at 0x7ff000440 by thread #2
==8945==    at 0x4C2C54C: mythread_wrapper (hg_intercepts.c:200)
==8945==  This conflicts with a previous read of size 8 by thread #1
==8945==    at 0x4C2C440: pthread_create_WRK (hg_intercepts.c:235)
==8945==    by 0x4C2C4CF: pthread_create@* (hg_intercepts.c:257)
==8945==    by 0x4010B8: main (ph.c:148)
==8945== 
==8945== Thread #3 was created
==8945==    at 0x513612E: clone (clone.S:77)
==8945==    by 0x4E37172: pthread_create@@GLIBC_2.2.5 (createthread.c:75)
==8945==    by 0x4C2C42C: pthread_create_WRK (hg_intercepts.c:230)
==8945==    by 0x4C2C4CF: pthread_create@* (hg_intercepts.c:257)
==8945==    by 0x4010B8: main (ph.c:148)
==8945== 
==8945== Possible data race during read of size 4 at 0x1d47168 by thread #3
==8945==    at 0x400C24: put (ph.c:61)
==8945==    by 0x400EA1: put_thread (ph.c:98)
==8945==    by 0x4C2C558: mythread_wrapper (hg_intercepts.c:202)
==8945==    by 0x4E369C9: start_thread (pthread_create.c:300)
==8945==    by 0x67D46FF: ???
==8945==  This conflicts with a previous write of size 4 by thread #2
==8945==    at 0x400CC6: put (ph.c:64)
==8945==    by 0x400EA1: put_thread (ph.c:98)
==8945==    by 0x4C2C558: mythread_wrapper (hg_intercepts.c:202)
==8945==    by 0x4E369C9: start_thread (pthread_create.c:300)
==8945==    by 0x5FD36FF: ???
==8945== 
==8945== 
==8945== More than 10000000 total errors detected.  I'm not reporting any more.
==8945== Final error counts will be inaccurate.  Go fix your program!
==8945== Rerun with --error-limit=no to disable this cutoff.  Note
==8945== that errors may occur in your program without prior warning from
==8945== Valgrind, because errors are no longer being displayed.
==8945== 

```

```c
// ph.c
// 
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>
#include <assert.h>
#include <pthread.h>
#include <assert.h>

#define NBUCKET 5          // Number of buckets in hash table
#define NENTRY 1000000     // Number of possible entries per bucket
#define NKEYS 100000       // Number of keys to insert and look up

// An entry in the hash table:
struct entry {
  int key;            // the key
  int value;          // the value
  int inuse;          // is entry in use?
};
// Statically allocate the hash table to avoid using pointers:
struct entry table[NBUCKET][NENTRY];

// An array of keys that we insert and lookup
int keys[NKEYS];

int nthread = 1;
volatile int done;

// The lock that serializes get()'s.
pthread_mutex_t lock;

double
now()
{
 struct timeval tv;
 gettimeofday(&tv, 0);
 return tv.tv_sec + tv.tv_usec / 1000000.0;
}

// Print content of entries in hash table that are in use.
static void
print(void)
{
  int b, i;
  for (b = 0; b < NBUCKET; b++) {
    printf("%d: ", b);
    for (i = 0; i < NBUCKET; i++) {
      if (table[b][i].inuse)
	printf("(%d, %d)", table[b][i].key, table[b][i].value);
    }
    printf("\n");
  }
}

// Insert (key, value) pair into hash table.  
static 
void put(int key, int value)
{
  int b = key % NBUCKET;
  int i;
  // Loop up through the entries in the bucket to find an unused one:
  for (i = 0; i < NENTRY; i++) {
    if (!table[b][i].inuse) {
      table[b][i].key = key;
      table[b][i].value = value;
      table[b][i].inuse = 1;
      return;
    }
  }
  assert(0);
}

// Lookup key in hash table.  The lock serializes the lookups.
static int
get(int key)
{
  assert(pthread_mutex_lock(&lock) == 0);
  int b = key % NBUCKET;
  int i;
  int v = -1;
  for (i = 0; i < NENTRY; i++) {
    if (table[b][i].key == key && table[b][i].inuse)  {
      v = table[b][i].value;
      break;
    }
  }

  assert(pthread_mutex_unlock(&lock) == 0);
  return v;
}

static void *
put_thread(void *xa)
{
  long n = (long) xa;
  int i;
  int b = NKEYS/nthread;

  for (i = 0; i < b; i++) {
    put(keys[b*n + i], n);
  }
}

static void *
get_thread(void *xa)
{
  long n = (long) xa;
  int i;
  int k = 0;
  int b = NKEYS/nthread;

  for (i = 0; i < b; i++) {
    int v = get(keys[b*n + i]);
    if (v == -1) k++;
  }
  printf("%ld: %d keys missing\n", n, k);
}

int
main(int argc, char *argv[])
{
  pthread_t *tha;
  void *value;
  long i;
  double t1, t0;

  if (argc < 2) {
    fprintf(stderr, "%s: %s nthread\n", argv[0], argv[0]);
    exit(-1);
  }
  nthread = atoi(argv[1]);

  // Initialize lock
  assert(pthread_mutex_init(&lock, NULL) == 0);

  // Allocate nthread handles for pthread_join() below.
  tha = malloc(sizeof(pthread_t) * nthread);

  // Generate some keys to insert and then lookup again
  srandom(0);
  assert(NKEYS % nthread == 0);
  for (i = 0; i < NKEYS; i++) {
    keys[i] = random();
    assert(keys[i] > 0);
  }

  t0 = now();
  // Create nthread put threads
  for(i = 0; i < nthread; i++) {
    assert(pthread_create(&tha[i], NULL, put_thread, (void *) i) == 0);
  }
  // Wait until they are all done.
  for(i = 0; i < nthread; i++) {
    assert(pthread_join(tha[i], &value) == 0);
  }
  t1 = now();

  printf("completion time for put phase = %f\n", t1-t0);

  t0 = now();

  // Create nthread get threads
  for(i = 0; i < nthread; i++) {
    assert(pthread_create(&tha[i], NULL, get_thread, (void *) i) == 0);
  }
  // Wait until they are all done.
  for(i = 0; i < nthread; i++) {
    assert(pthread_join(tha[i], &value) == 0);
  }
  t1 = now();

  printf("completion time for get phase = %f\n", t1-t0);
}
```

### 实现加速且无竞态

不再使用一个全局锁保护整个哈希表，而是为**每个桶配备一个独立的锁**（即一个锁数组 `pthread_mutex_t locks[NBUCKET];`），在 `put` 和 `get` 中，计算完桶索引 `i` 后，只需获取和释放对应的桶锁 `locks[i]`。

```c
// In global variables
pthread_mutex_t locks[NBUCKET];

// In main()
for (int i = 0; i < NBUCKET; i++)
    pthread_mutex_init(&locks[i], NULL);

// In put() and get()
static void
put(int key, int value)
{
  int i = key % NBUCKET;
  pthread_mutex_lock(&locks[i]); // Acquire lock for this bucket
  insert(key, value, &table[i], table[i]);
  pthread_mutex_unlock(&locks[i]); // Release lock for this bucket
}

// Similarly for get()
```
