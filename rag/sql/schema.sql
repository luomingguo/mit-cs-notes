-- RAG 向量库 schema。跑在 hk 本地的 pgvector 容器里。
-- 幂等：可以反复执行，不会破坏已有数据。

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- documents：一篇笔记一行。给学习路径生成器当「全站目录」用，
-- 也用来判断哪些文件自上次 ingest 后变过。
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  path         TEXT PRIMARY KEY,        -- 相对 docs/ 的源码路径，如 zh/cs/computer_sys/os/lec5.md
  url          TEXT NOT NULL,           -- 站点真实 URL，如 /zh/os/lec5（已应用 rewrites）
  lang         TEXT NOT NULL,           -- zh | en
  discipline   TEXT NOT NULL DEFAULT '',-- cs | psy | mgnt；无学科层的全局页为空
  course_slug  TEXT NOT NULL,           -- os
  course       TEXT NOT NULL,           -- 6.1810 操作系统工程
  course_id    TEXT NOT NULL DEFAULT '',-- 6.1810；子页继承课程 index.md
  category     TEXT NOT NULL,           -- computer_sys（源目录中的分类段）
  title        TEXT NOT NULL,           -- Lec 5 虚拟内存 & 页表
  doc_type     TEXT NOT NULL DEFAULT '',-- course | lecture | paper | concept | assignment | project
  tldr         TEXT NOT NULL DEFAULT '',-- 页面 ## TL;DR 的原始摘要内容
  outline      TEXT NOT NULL DEFAULT '',-- 二级标题拼接，给路径生成器看结构用
  chars        INTEGER NOT NULL DEFAULT 0,
  file_hash    TEXT NOT NULL,           -- 整篇内容哈希，用于增量判断
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_course_idx ON documents (course_slug);

-- ============================================================
-- chunks：检索单元。
-- 向量维度是占位符，由 db.ts 按 EMBED_DIM 注入 —— 换嵌入模型时只改环境变量，
-- 不用手改这个文件。但维度变了必须重建表，因为 pgvector 的 vector(N) 是固定长度。
-- ============================================================
CREATE TABLE IF NOT EXISTS chunks (
  id           TEXT PRIMARY KEY,        -- sha1(path#ordinal)，稳定可复算
  doc_path     TEXT NOT NULL REFERENCES documents(path) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  anchor       TEXT NOT NULL DEFAULT '',-- 小节锚点，拼成 /zh/os/lec5#页表项 直达
  lang         TEXT NOT NULL,
  course       TEXT NOT NULL,
  doc_title    TEXT NOT NULL,
  heading      TEXT NOT NULL DEFAULT '',-- 面包屑：页面管理 > 页表项
  ordinal      INTEGER NOT NULL,
  content      TEXT NOT NULL,
  content_hash TEXT NOT NULL,           -- 只有它变了才重新调用嵌入 API
  embedding    vector(__EMBED_DIM__),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  block_kind   TEXT NOT NULL DEFAULT 'normal',
  doc_type     TEXT NOT NULL DEFAULT '',
  tags         TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS chunks_doc_idx ON chunks (doc_path);

-- HNSW 余弦索引。5000 量级的行数建索引是秒级的。
-- m/ef_construction 用默认值即可；召回不满意再调 ef_search（见 retrieve.ts）。
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks USING hnsw (embedding vector_cosine_ops);

-- ============================================================
-- ask_log：问答日志。这是「读者到底想知道什么」的一手数据，
-- 比 PV 有价值得多 —— 哪门课被问爆了就往哪门课加料。
-- ============================================================
CREATE TABLE IF NOT EXISTS ask_log (
  id           BIGSERIAL PRIMARY KEY,
  question     TEXT NOT NULL,
  lang         TEXT NOT NULL DEFAULT 'zh',
  cited_urls   TEXT[] NOT NULL DEFAULT '{}',
  top_score    REAL,                    -- rerank 最高分，用来发现「问了但没料」的空白区
  answered     BOOLEAN NOT NULL DEFAULT TRUE,
  latency_ms   INTEGER,
  ip_hash      TEXT,                    -- 只存哈希，不留原始 IP
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ask_log_created_idx ON ask_log (created_at DESC);

-- 内容空白区：被问到但检索分很低的问题，是选题清单。
CREATE OR REPLACE VIEW content_gaps AS
  SELECT question, top_score, created_at
  FROM ask_log
  WHERE top_score IS NOT NULL AND top_score < 0.35
  ORDER BY created_at DESC;

-- ============================================================
-- NOTESTYLE.md 引入的结构字段。
--
-- 用 ADD COLUMN IF NOT EXISTS 而不是改上面的建表语句 —— 已经在 hk 上跑着的
-- 库不用重建，重建 chunks 表意味着重新调一遍嵌入 API，那是要花钱的。
-- ============================================================

ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags   TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'complete';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS discipline TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS course_id TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type TEXT NOT NULL DEFAULT '';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tldr TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS documents_tags_idx ON documents USING gin (tags);
CREATE INDEX IF NOT EXISTS documents_discipline_idx ON documents (discipline);
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents (doc_type);

-- 历史 kind 分类已由目录归属和 doc_type 替代。
DROP INDEX IF EXISTS documents_kind_idx;
ALTER TABLE documents DROP COLUMN IF EXISTS kind;

-- block_kind：这一块落在哪种语义容器里。
-- insight = 作者本人的判断，是这批笔记相对讲义的增量价值，检索时要能加权。
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS block_kind TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS doc_type TEXT NOT NULL DEFAULT '';
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS chunks_block_kind_idx ON chunks (block_kind)
  WHERE block_kind <> 'normal';
CREATE INDEX IF NOT EXISTS chunks_type_idx ON chunks (doc_type);
CREATE INDEX IF NOT EXISTS chunks_tags_idx ON chunks USING gin (tags);

-- 每门课有多少「我的理解」—— 补写进度看这个视图。
CREATE OR REPLACE VIEW insight_coverage AS
  SELECT d.course,
         count(DISTINCT d.path)                                        AS docs,
         count(DISTINCT d.path) FILTER (WHERE c.block_kind = 'insight') AS docs_with_insight
  FROM documents d
  LEFT JOIN chunks c ON c.doc_path = d.path
  WHERE d.status = 'complete'
  GROUP BY d.course
  ORDER BY docs_with_insight::float / NULLIF(count(DISTINCT d.path), 0);
