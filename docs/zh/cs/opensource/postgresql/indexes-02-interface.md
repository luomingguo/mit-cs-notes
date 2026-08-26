---
title: PostgreSQL 索引 — 2（访问方法接口）
type: lecture
tags: []
status: complete
---
# PostgreSQL 索引 — 2（访问方法接口）

> 原文：https://habr.com/en/companies/postgrespro/articles/442546/ （作者 Egor Rogov，PostgresPro）

## 写在前面

上一篇文章从使用者的角度介绍了索引能做什么。这一篇转向 PostgreSQL 内部，讲清楚"访问方法接口"（access method interface）——也就是新增一种索引类型时，PostgreSQL 到底要求实现方按照什么规范去接入系统。理解了这套接口，后面每一篇讲具体索引类型（Hash、B-tree、GiST……）时，才能顺着同一套框架去对比它们的差异。

## 六种内置访问方法

PostgreSQL 通过系统表 `pg_am` 记录所有已注册的索引访问方法。查询它可以看到：

```sql
postgres=# select amname from pg_am;
 amname
--------
 btree
 hash
 gist
 gin
 spgist
 brin
(6 rows)
```

值得一提的是，顺序扫描（Seq Scan）由于历史原因没有被登记为一种"访问方法"，尽管概念上它也是一种数据获取路径。

## 三层属性体系

原文强调，索引相关的"能力声明"被拆成三个层次去查询，分别对应不同的粒度：

1. **访问方法层面**——用 `pg_indexam_has_property(am_oid, property_name)` 查询，描述的是某种索引类型（比如 btree）整体上支持不支持某个特性；
2. **索引层面**——用 `pg_index_has_property(index_oid, property_name)` 查询，描述某个具体已建好的索引实例的特性；
3. **列层面**——用 `pg_index_column_has_property(index_oid, column_no, property_name)` 查询，描述索引里某一具体列的特性（比如是否支持升序/降序、是否支持仅索引扫描等）。

这种分层设计是面向未来的扩展性考虑——目前同一种访问方法下所有索引实例的属性基本一致，但理论上以后可能出现同一访问方法下不同索引表现不同属性的情况，这套三层接口提前把口子留好了。

### 访问方法级的四个属性

以 btree 为例：

```sql
postgres=# select a.amname, p.name, pg_indexam_has_property(a.oid,p.name)
from pg_am a,
     unnest(array['can_order','can_unique','can_multi_col','can_exclude']) p(name)
where a.amname = 'btree'
order by a.amname;

 amname |     name      | pg_indexam_has_property
--------+---------------+-------------------------
 btree  | can_order     | t
 btree  | can_unique    | t
 btree  | can_multi_col | t
 btree  | can_exclude   | t
(4 rows)
```

四个属性含义：
- `can_order`：建索引时是否能指定值的排序方式（比如 ASC/DESC/NULLS FIRST）；
- `can_unique`：是否能用来实现唯一约束/主键（目前只有 btree 支持）；
- `can_multi_col`：是否支持多列联合索引；
- `can_exclude`：是否支持排除约束（EXCLUDE CONSTRAINT）。

### 索引级的四个属性

```sql
postgres=# select p.name, pg_index_has_property('t_a_idx'::regclass,p.name)
from unnest(array[
       'clusterable','index_scan','bitmap_scan','backward_scan'
     ]) p(name);

     name      | pg_index_has_property
---------------+-----------------------
 clusterable   | t
 index_scan    | t
 bitmap_scan   | t
 backward_scan | t
(4 rows)
```

- `clusterable`：是否可以用 `CLUSTER` 命令按这个索引重新整理表的物理行顺序；
- `index_scan`：是否支持按顺序逐一返回 TID 的普通索引扫描；
- `bitmap_scan`：是否支持先构建位图再批量取行的位图扫描；
- `backward_scan`：是否支持反向遍历（倒序返回结果）。

### 列级的九个属性

```sql
postgres=# select p.name,
     pg_index_column_has_property('t_a_idx'::regclass,1,p.name)
from unnest(array[
       'asc','desc','nulls_first','nulls_last','orderable','distance_orderable',
       'returnable','search_array','search_nulls'
     ]) p(name);

        name        | pg_index_column_has_property
--------------------+------------------------------
 asc                | t
 desc               | f
 nulls_first        | f
 nulls_last         | t
 orderable          | t
 distance_orderable | f
 returnable         | t
 search_array       | t
 search_nulls       | t
(9 rows)
```

其中比较重要的几个：
- `orderable` / `asc` / `desc` / `nulls_first` / `nulls_last`：描述该列是否支持按顺序返回结果，以及具体的排序方向和 NULL 摆放位置；
- `distance_orderable`：该列是否支持"按距离排序"（也就是最近邻查询 `ORDER BY col <-> const` 这种写法），这是 GiST 和 RUM 这类索引特有的能力；
- `returnable`：该列的值是否能直接从索引里原样取出，这是仅索引扫描（index-only scan）能否生效的关键；
- `search_array`：是否支持 `IN (...)` / `= ANY(...)` 这种数组形式的搜索条件；
- `search_nulls`：是否支持 `IS NULL` / `IS NOT NULL` 条件。

## 操作符类与操作符族

索引访问方法本身是"通用骨架"，真正让一个索引能处理 `integer`、`text`、`point` 等具体数据类型的，是**操作符类（operator class）**。原文把操作符类定义为"某种数据类型在某个索引方法下，能够被索引使用的一组最小操作符（以及可能需要的辅助函数）"的集合。换句话说，操作符类就是把"抽象的比较/匹配逻辑"和"具体类型的实现"绑定起来的桥梁。

比操作符类更高一层的概念是**操作符族（operator family）**：把语义上彼此关联、可以互相比较/转换的多个操作符类归并到一起。一个经典例子是 `integer_ops` 族，把 smallint、integer、bigint 各自对应的操作符类（`int2_ops`、`int4_ops`、`int8_ops`）统一收纳：

```sql
postgres=# select opfname, opcname, opcintype::regtype
from pg_opclass opc, pg_opfamily opf
where opf.opfname = 'integer_ops'
and opc.opcfamily = opf.oid
and opf.opfmethod = (
      select oid from pg_am where amname = 'btree'
    );

   opfname   | opcname  | opcintype
-------------+----------+-----------
 integer_ops | int2_ops | smallint
 integer_ops | int4_ops | integer
 integer_ops | int8_ops | bigint
(3 rows)
```

类似地，时间日期相关类型也归入同一个族：

```sql
postgres=# select opfname, opcname, opcintype::regtype
from pg_opclass opc, pg_opfamily opf
where opf.opfname = 'datetime_ops'
and opc.opcfamily = opf.oid
and opf.opfmethod = (
      select oid from pg_am where amname = 'btree'
    );

   opfname    |     opcname     |          opcintype          
--------------+-----------------+-----------------------------
 datetime_ops | date_ops        | date
 datetime_ops | timestamptz_ops | timestamp with time zone
 datetime_ops | timestamp_ops   | timestamp without time zone
(3 rows)
```

把兼容类型归入同一操作符族的实际意义是：优化器可以在**跨类型比较**的场景下依然使用索引（比如用 integer 索引去响应和 bigint 常量的比较），而不需要为每一种类型组合都单独造轮子。

## 操作符类的现实意义：以 LIKE 匹配为例

原文用一个很实际的例子说明为什么有时需要手动指定操作符类。在非 C 排序规则（比如 `en_US.UTF-8`）下，普通的文本 B-tree 索引默认无法加速 `LIKE 'A%'` 这种前缀匹配查询：

```sql
postgres=# show lc_collate;
 lc_collate 
-------------
 en_US.UTF-8
(1 row)

postgres=# explain (costs off) select * from t where b like 'A%';
         QUERY PLAN          
-----------------------------
 Seq Scan on t
   Filter: (b ~~ 'A%'::text)
(2 rows)
```

原因是默认的排序规则下字符串比较不是简单的字节序比较，导致 `LIKE` 前缀条件无法安全转换成 B-tree 能利用的范围条件。解决办法是显式指定 `text_pattern_ops` 操作符类建索引，它按字节顺序比较，能把 `LIKE` 前缀匹配转成一个可用的范围扫描：

```sql
postgres=# create index on t(b text_pattern_ops);

postgres=# explain (costs off) select * from t where b like 'A%';
                           QUERY PLAN                          
----------------------------------------------------------------
 Bitmap Heap Scan on t
   Filter: (b ~~ 'A%'::text)
   ->  Bitmap Index Scan on t_b_idx1
         Index Cond: ((b ~>=~ 'A'::text) AND (b ~<~ 'B'::text))
(4 rows)
```

可以看到查询计划里出现了 `~>=~` 和 `~<~` 这类专属操作符——它们正是 `text_pattern_ops` 操作符类定义出来、专门用字节顺序做比较的操作符版本。

## btree 支持的数据类型一览

可以直接查系统表看 btree 目前登记了哪些操作符类（也就是支持哪些数据类型）：

```sql
postgres=# select opcname, opcintype::regtype
from pg_opclass
where opcmethod = (select oid from pg_am where amname = 'btree')
order by opcintype::regtype::text;

       opcname       |          opcintype          
---------------------+-----------------------------
 abstime_ops         | abstime
 array_ops           | anyarray
 enum_ops            | anyenum
...
```

## 某个操作符类具体包含哪些操作符

以数组类型的 `array_ops` 为例，可以查出它在 btree 下注册了哪五个比较操作符：

```sql
postgres=# select amop.amopopr::regoperator
from pg_opclass opc, pg_opfamily opf, pg_am am, pg_amop amop
where opc.opcname = 'array_ops'
and opf.oid = opc.opcfamily
and am.oid = opf.opfmethod
and amop.amopfamily = opc.opcfamily
and am.amname = 'btree'
and amop.amoplefttype = opc.opcintype;

        amopopr        
-----------------------
 <(anyarray,anyarray)
 <=(anyarray,anyarray)
 =(anyarray,anyarray)
 >=(anyarray,anyarray)
 >(anyarray,anyarray)
(5 rows)
```

这五个操作符（小于、小于等于、等于、大于等于、大于）正对应 btree 要求的五种"策略编号"（strategy），后面讲 B-tree 内部结构的文章会再展开说明这套策略编号机制。

## 系统目录关系

原文用一张系统表关系图说明了这套接口背后的存储结构，核心表包括：

- `pg_am`：登记所有访问方法（btree、hash、gist 等）；
- `pg_opclass`：登记操作符类，每个类关联一个访问方法和一个具体数据类型；
- `pg_opfamily`：登记操作符族，把语义相关的操作符类分组；
- `pg_amop`：登记每个操作符族里具体有哪些操作符，以及它们在该访问方法下对应的"策略编号"；
- `pg_amproc`：登记每个操作符族需要用到的辅助支持函数（比如 B-tree 的比较函数、Hash 的哈希函数）。

原文强调，这些系统表都是可以直接查询的，用户不需要死记文档，遇到不确定的地方随时可以用类似上面的 SQL 去系统表里验证。

## 本讲小结

这一篇把索引这件事从"用户可见的行为"下沉到了"系统内部的元数据结构"：三层属性接口（访问方法级/索引级/列级）描述了一个索引能做什么，操作符类和操作符族则描述了一个索引方法如何对接具体的数据类型和比较逻辑，而 `pg_am`、`pg_opclass`、`pg_opfamily`、`pg_amop`、`pg_amproc` 这几张系统表则是这套体系的物理落地。掌握了这套框架，后续每篇讲一种具体索引类型时，都可以用同样的三层属性查询和系统表查询去验证和探索该类型的能力边界。
