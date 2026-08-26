---
title: PostgreSQL 内核原理系列（中文讲解笔记）
type: course
course: PostgreSQL 内核原理系列（中文讲解笔记）
tags: []
status: complete
---
# PostgreSQL 内核原理系列（中文讲解笔记）

## 索引 (Indexes)

- [1. 索引概述](./indexes-01-intro.md)
- [2. 索引接口与方法](./indexes-02-interface.md)
- [3. Hash 索引](./indexes-03-hash.md)
- [4. B-tree 索引](./indexes-04-btree.md)
- [5. GiST 索引](./indexes-05-gist.md)
- [6. SP-GiST 索引](./indexes-06-spgist.md)
- [7. GIN 索引](./indexes-07-gin.md)
- [8. RUM 索引](./indexes-08-rum.md)
- [9. BRIN 索引](./indexes-09-brin.md)
- [10. Bloom 索引](./indexes-10-bloom.md)

## WAL（预写日志）

- [1. 缓冲区缓存 (Buffer Cache)](./wal-01-buffer-cache.md)
- [2. 预写日志 (Write-Ahead Log)](./wal-02-write-ahead-log.md)
- [3. 检查点 (Checkpoint)](./wal-03-checkpoint.md)
- [4. 配置与调优](./wal-04-setup-tuning.md)

## MVCC（多版本并发控制）

- [1. 隔离级别 (Isolation)](./mvcc-01-isolation.md)
- [2. 分支文件与页面 (Forks, Files, Pages)](./mvcc-02-forks-files-pages.md)
- [3. 行版本 (Row Versions)](./mvcc-03-row-versions.md)
- [4. 快照 (Snapshots)](./mvcc-04-snapshots.md)
- [5. 页内清理与 HOT 更新](./mvcc-05-hot-updates.md)
- [6. Vacuum](./mvcc-06-vacuum.md)
- [7. Autovacuum](./mvcc-07-autovacuum.md)
- [8. 冻结 (Freezing)](./mvcc-08-freezing.md)

## 锁 (Locks)

- [1. 关系级锁](./locks-01-relation-level.md)
- [2. 行级锁](./locks-02-row-level.md)
- [3. 其他锁](./locks-03-other-locks.md)
- [4. 内存中的锁](./locks-04-locks-in-memory.md)

## 查询 (Queries)

- [1. 执行阶段](./queries-01-execution-stages.md)
- [2. 统计信息](./queries-02-statistics.md)
- [3. 顺序扫描](./queries-03-sequential-scan.md)
- [4. 索引扫描](./queries-04-index-scan.md)
- [5. 嵌套循环连接](./queries-05-nested-loop.md)
- [6. 哈希](./queries-06-hashing.md)
- [7. 排序与归并](./queries-07-sorting-merging.md)
