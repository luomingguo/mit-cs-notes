---
title: PostgreSQL 中的 MVCC — 2. 分支、文件与页面
type: lecture
tags: []
status: complete
---
# PostgreSQL 中的 MVCC — 2. 分支、文件与页面

> 原文：https://habr.com/en/companies/postgrespro/articles/469087/ （作者 Egor Rogov，PostgresPro，2019-10-10）

本篇是系列的第二篇，暂时先放下 MVCC 本身，转而铺垫理解后续内容所必需的物理存储知识：PostgreSQL 是怎么把表和索引组织成磁盘上的文件的，文件里的"页面"长什么样，超长字段又是怎么处理的（TOAST）。

## "关系"这个统称

PostgreSQL 内部用"关系"（relation）这个词泛指所有具有行结构的数据库对象，不只是狭义的"表"。具体包括：普通表、索引（B-树等索引结构的每个节点本质上也是存有索引值和引用的"行"）、序列（可以看成只有一行的特殊表）、物化视图（存储了查询结果的表）。而普通视图因为不存储数据，不算在内。严格来说用学术上的"关系"来称呼索引并不十分贴切，但 PostgreSQL 历史上就是这么统一叫法的。

## 分支与文件

物理存储的层次关系是：**一个关系 → 若干个"分支"(fork) → 若干个文件 → 若干个页面（默认 8KB）**。

文件大小有一个硬性上限，默认 1GB，这是历史上为了兼容某些文件系统的限制而定的；如果需要可以在编译时通过 `./configure --with-segsize` 修改。当一个分支的数据超过 1GB，PostgreSQL 会新建一个文件，文件名后面加上递增的序号作为区分（这样的文件叫做"段"，segment）。

可以用函数查到某张表对应的物理文件路径：

```sql
SELECT pg_relation_filepath('accounts');
-- 结果类似： base/41493/41496
```

其中 `base/` 表示这是默认表空间 `pg_default`；`41493` 是所在数据库的 OID；`41496` 是这个关系的 filenode（文件节点号）。同一个表空间、同一个数据库下的所有对象文件，都堆放在同一个目录里——如果对象数量特别多，这个目录里文件数太多本身就可能拖累文件系统性能。

## 四种分支类型

### 主分支（Main Fork）

这是存放表和索引实际行数据的地方，除了不存数据的普通视图外，几乎所有关系都有主分支。它的文件名就是一串数字（即 filenode）：

```text
-rw------- 1 postgres postgres 8192  base/41493/41496
```

filenode 可以通过系统目录查出来，和数据库 OID 一起组成上面那个路径：

```sql
SELECT oid FROM pg_database WHERE datname = 'test';
-- oid: 41493

SELECT relfilenode FROM pg_class WHERE relname = 'accounts';
-- relfilenode: 41496
```

### 初始化分支（Init Fork）

这个分支只有 UNLOGGED（未日志表）才有。未日志表的所有写操作不经过 WAL（预写日志），所以速度更快，但代价是一旦数据库崩溃恢复，未日志表里的数据无法保证完整，PostgreSQL 干脆的做法是：崩溃恢复时直接删除该表的主分支等文件，用初始化分支（永远是空的）替换掉主分支，相当于把表清空重来。

初始化分支的文件名规则是在主分支文件名后面加 `_init` 后缀：

```sql
ALTER TABLE accounts SET UNLOGGED;
SELECT pg_relation_filepath('accounts');
-- base/41493/41507
```

```bash
$ ls -l base/41493/41507_init
-rw------- 1 postgres postgres 0  base/41493/41507_init
```

值得一提的是：把表在 LOGGED / UNLOGGED 之间切换，会导致数据被重写到一套新的文件名（新的 filenode）下。

### 空闲空间映射（Free Space Map, FSM）

FSM 用来记录每个页面里还剩多少空闲空间，方便插入新行时快速找到有位置能放的页面，不必逐页扫描。文件名后缀是 `_fsm`，并且不是一开始就有的，通常是在做 vacuum 清理时才会被创建出来：

```sql
VACUUM accounts;
```
```bash
$ ls -l base/41493/41507_fsm
-rw------- 1 postgres postgres 24576  base/41493/41507_fsm
```

### 可见性映射（Visibility Map, VM）

VM 用一个 bit 标记每个页面是否"只含有对所有事务都可见的最新行版本"（即页面上没有需要额外做可见性判断的旧版本）。如果某页面被标记为"全可见"，扫描时就可以跳过逐行的可见性检查，这对索引扫描等场景是重要的性能优化（这一点会在后续 vacuum、autovacuum 相关文章里深入展开）。文件名后缀是 `_vm`：

```bash
$ ls -l base/41493/41507_vm
-rw------- 1 postgres postgres 8192  base/41493/41507_vm
```

## 页面内部结构

页面默认大小是 8KB，理论上编译时可以改成 16KB 或 32KB（`./configure --with-blocksize`），但这是编译期选项，运行时无法更改。数据库运行时会把需要访问的页面从磁盘读进内存的缓冲区（buffer cache），在缓冲区里完成读写，之后再按需写回磁盘。

一个页面的内部布局大致是这样（从低地址到高地址）：

```text
      0  +-----------------------------------+
         | 页头（header）                     |
     24  +-----------------------------------+
         | 指向各行版本的指针数组               |
 lower   +-----------------------------------+
         | 空闲空间                           |
 upper   +-----------------------------------+
         | 行版本本体                          |
special  +-----------------------------------+
         | 特殊空间（仅索引使用）               |
pagesize +-----------------------------------+
```

可以用 `pageinspect` 扩展直接查看某个页面的头信息：

```sql
CREATE EXTENSION pageinspect;
SELECT lower, upper, special, pagesize FROM page_header(get_raw_page('accounts',0));
--  lower | upper | special | pagesize
-- -------+-------+---------+----------
--     40 |  8016 |    8192 |     8192
```

**页头**至少占 24 字节，保存页面的元信息。紧跟其后的是**行指针数组**，每个指针 4 字节，里面编码了该行版本在页内的偏移、长度以及一些状态标志位。之所以要通过指针间接引用行数据，而不是让索引直接记录行在页内的物理偏移，是因为行数据在页内经常需要挪动位置（比如清理碎片时）；如果没有这层间接寻址，每次挪动行都要连带更新所有引用它的索引，代价太大。有了指针数组，挪动行版本时只需要更新指针指向即可，索引里保存的"行标识符"（页号+指针序号）保持不变。

指针数组和行数据之间是**连续的空闲空间**，这块空间的大小会被记录进 FSM，供后续插入使用。**行版本本体**紧贴在页面的高地址一侧向下增长，与指针数组从低地址向上增长相向而行，中间的空隙就是空闲空间。**特殊空间**只有索引类型的页面才用到，用于存放该索引结构特有的元信息（比如 B-树的兄弟页指针），普通表的页面里这块区域是空的。

## 数据格式与平台相关性

PostgreSQL 页面在磁盘上的存储格式和它在内存里的表示是完全一致的——页面从磁盘读进缓冲区后"原样"使用，不需要反序列化转换。这带来一个直接后果：**不同硬件平台之间的数据文件是不兼容的**，不能简单地把数据文件从一台机器拷贝到架构不同的另一台机器上直接使用。原因主要有两个：

**字节序（endianness）**：比如 x86 是小端序，IBM 的 z/Architecture 是大端序，ARM 架构则可以配置成两种模式中的任意一种。同一个整数在不同字节序下的内存表示是不同的。

**数据对齐**：不同架构要求不同数据类型按机器字长边界对齐。比如 32 位 x86 上，4 字节的 integer 按 4 字节边界对齐，但 double 也可能按 4 字节对齐；而在 64 位系统上，double 通常要求按 8 字节边界对齐。这意味着**字段在表里的声明顺序会实际影响行的存储大小**——如果把一个 `char(1)` 紧跟着放在一个 `integer` 前面，为了对齐，中间可能会被迫填充浪费掉 3 个字节。合理安排字段顺序（比如把变长/定长类型分组排列）可以减少这种因对齐产生的空间浪费。

## TOAST：应对超长字段

### 为什么需要 TOAST

页面的行版本有一条硬约束：**每个行版本必须完整放进一个页面里**。但实际业务中经常会有超长的文本、二进制字段，超过页面大小怎么办？PostgreSQL 的解决方案叫 TOAST（The Oversized-Attribute Storage Technique，超大属性存储技术）。

### 四种存储策略

每个字段都有一个"存储策略"（storage strategy），可以通过系统目录查看：

```sql
SELECT attname, atttypid::regtype, CASE attstorage
  WHEN 'p' THEN 'plain'
  WHEN 'e' THEN 'external'
  WHEN 'm' THEN 'main'
  WHEN 'x' THEN 'extended'
END AS storage
FROM pg_attribute
WHERE attrelid = 'accounts'::regclass AND attnum > 0;

--  attname | atttypid | storage
-- ---------+----------+----------
--  id      | integer  | plain
--  number  | text     | extended
--  client  | text     | extended
--  amount  | numeric  | main
```

四种策略含义：
- **plain**：完全不使用 TOAST（通常用于本身就短小、定长的类型，比如 integer）。
- **extended**：允许先压缩，压缩后仍太大的话再挪到 TOAST 表里，这是大多数变长类型（如 text）的默认策略。
- **external**：允许挪到 TOAST 表，但不做压缩（适合本身已经是压缩格式、再压缩没有意义的数据）。
- **main**：优先尝试压缩，只有压缩后依然超限才会挪到 TOAST 表；这类字段被"赶出"主表的优先级最低。

### TOAST 触发与处理顺序

触发条件是：一行数据的总大小超过页面的四分之一（8KB 页面下大约是 2040 字节）。一旦触发，PostgreSQL 按下面的顺序逐步处理，每处理完一步就检查是否已经把行压缩到能放进页面，够了就停止：

1. 先处理策略为 external 和 extended 的字段（从最长的开始）：extended 字段先尝试压缩，如果压缩后仍然超限就挪进 TOAST 表；external 字段同样处理但跳过压缩这一步。
2. 如果第一步还不够，把剩余的 external/extended 字段也都挪进 TOAST 表。
3. 如果还不够，开始压缩 main 策略的字段（但仍留在主表页面里）。
4. 最后，如果还不够，才把 main 字段也挪进 TOAST 表。

可以手动修改某字段的存储策略，比如已知某个字段的数据天然不可压缩（比如已经是压缩格式的二进制），可以跳过压缩尝试直接指定为 external：

```sql
ALTER TABLE accounts ALTER COLUMN number SET STORAGE external;
```

### TOAST 表结构

被挪出去的超长数据，实际存放在一张与主表关联、独立的内部表里，位于 `pg_toast` 模式下（临时表对应的 TOAST 表则在 `pg_toast_temp_N` 模式下）。可以这样查到某表对应的 TOAST 表：

```sql
SELECT relnamespace::regnamespace, relname
FROM pg_class WHERE oid = (
  SELECT reltoastrelid FROM pg_class WHERE relname = 'accounts'
);
--  relnamespace |    relname
-- --------------+----------------
--  pg_toast     | pg_toast_33953
```

TOAST 表结构本身很简单，把大字段值切成若干个数据块（chunk）存储：

```sql
\d+ pg_toast.pg_toast_33953
--    Column   |  Type   | Storage
-- ------------+---------+---------
--  chunk_id   | oid     | plain
--  chunk_seq  | integer | plain
--  chunk_data | bytea   | plain
```

TOAST 表上还带有一个索引，用来根据 `chunk_id` 和 `chunk_seq` 快速拼回原始数据：

```sql
SELECT indexrelid::regclass FROM pg_index
WHERE indrelid = (SELECT oid FROM pg_class WHERE relname = 'pg_toast_33953');
--          indexrelid
-- ------------------------------
--  pg_toast.pg_toast_33953_index
```

### 压缩效果实测

原文用两个对比实验说明压缩的效果。当写入的是高度可压缩的数据（比如连续重复字符）时：

```sql
UPDATE accounts SET client = repeat('A',3000) WHERE id = 1;
SELECT * FROM pg_toast.pg_toast_33953;
-- (0 rows)
```

3000 个重复字符压缩后完全能塞进主表页面，根本不需要动用 TOAST 表。

而当写入的是随机、不可压缩的数据时：

```sql
UPDATE accounts SET client = (
  SELECT string_agg(chr(trunc(65+random()*26)::integer), '')
  FROM generate_series(1,3000)
) WHERE id = 1
RETURNING left(client,10) || '...' || right(client,10);

SELECT chunk_id, chunk_seq, length(chunk_data) FROM pg_toast.pg_toast_33953;
--  chunk_id | chunk_seq | length
-- ----------+-----------+--------
--     34000 |         0 |   2000
--     34000 |         1 |   1000
```

3000 字节的随机数据被拆成两块（2000 字节 + 1000 字节）存进 TOAST 表，读取该行时会自动拼接还原，对用户完全透明。

### TOAST 与多版本

一个值得注意的优化：如果一次更新没有触碰到某个被 TOAST 化的长字段，新的行版本可以直接复用同一份 TOAST 表数据（引用同一个 chunk_id），不需要重新拷贝一份，从而节省空间。

### TOAST 的局限

TOAST 只作用于表，索引不支持 TOAST 机制——这意味着能够建索引的键值大小是有实际上限的（超长值无法直接作为索引键）。原文还建议：如果业务场景涉及海量的、不需要事务性保证的大数据（比如扫描文档的存档），更适合的做法是把这些内容存在文件系统里，数据库里只保存对应的文件名/路径。

## 本讲小结

本篇建立了理解后续 MVCC 机制所需的物理基础：一个关系可能拥有主分支、初始化分支、FSM、VM 四种不同用途的分支，各自对应独立的磁盘文件；文件被切成固定大小的页面，页面内部用"页头 + 指针数组 + 空闲空间 + 行数据 + 特殊空间"的布局组织，指针间接寻址使得页内行数据可以自由挪动而不破坏外部引用；数据在磁盘上与内存中格式完全一致，因此天然是平台相关的；超出页面大小的字段值通过 TOAST 机制被压缩和/或挪动到独立的 TOAST 表中，按策略（plain/extended/external/main）分级处理。这些机制在后面讲行版本、页内清理（HOT 更新）和 VACUUM 时会被反复引用。
