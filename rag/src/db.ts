import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { config } from './config.js'
import type { Chunk } from './chunk.js'
import type { SourceDoc } from './corpus.js'

const here = path.dirname(fileURLToPath(import.meta.url))

let pool: pg.Pool | undefined

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      max: 8,
      idleTimeoutMillis: 30_000,
    })
  }
  return pool
}

export async function closePool(): Promise<void> {
  await pool?.end()
  pool = undefined
}

/** pgvector 的字面量格式：[0.1,0.2,...] */
function toVectorLiteral(v: number[]): string {
  return `[${v.join(',')}]`
}

export async function applySchema(): Promise<void> {
  const raw = await fs.readFile(path.join(here, '../sql/schema.sql'), 'utf8')
  // pgvector 的 vector(N) 是固定长度，必须在建表时就定死，
  // 所以维度从配置注入而不是写死在 SQL 里。
  const dim = config.embed.dimension
  if (!Number.isInteger(dim) || dim <= 0 || dim > 16000) {
    throw new Error(`EMBED_DIM 不合法: ${dim}`)
  }
  await getPool().query(raw.replaceAll('__EMBED_DIM__', String(dim)))
}

export async function upsertDocument(doc: SourceDoc): Promise<void> {
  await getPool().query(
    `INSERT INTO documents (path, url, lang, course_slug, course, category, title, outline, chars, file_hash, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
     ON CONFLICT (path) DO UPDATE SET
       url=EXCLUDED.url, lang=EXCLUDED.lang, course_slug=EXCLUDED.course_slug,
       course=EXCLUDED.course, category=EXCLUDED.category, title=EXCLUDED.title,
       outline=EXCLUDED.outline, chars=EXCLUDED.chars, file_hash=EXCLUDED.file_hash,
       updated_at=now()`,
    [
      doc.path, doc.url, doc.lang, doc.courseSlug, doc.course,
      doc.category, doc.title, doc.outline, doc.chars, doc.fileHash,
    ],
  )
}

/** 已入库文档的 path -> file_hash，用来跳过没变过的文件 */
export async function existingDocHashes(): Promise<Map<string, string>> {
  const { rows } = await getPool().query<{ path: string; file_hash: string }>(
    'SELECT path, file_hash FROM documents',
  )
  return new Map(rows.map((r) => [r.path, r.file_hash]))
}

/**
 * 取某篇文档已有的 content_hash -> embedding。
 *
 * 用途：改动一段文字时，其余块的向量可以原样复用，只对真正变了的块调用
 * 嵌入 API。embedding 保持 pgvector 返回的字符串原样，省一次解析再序列化。
 */
export async function existingEmbeddings(
  docPath: string,
): Promise<Map<string, string>> {
  const { rows } = await getPool().query<{ content_hash: string; embedding: string | null }>(
    'SELECT content_hash, embedding::text AS embedding FROM chunks WHERE doc_path = $1',
    [docPath],
  )
  const map = new Map<string, string>()
  for (const r of rows) if (r.embedding) map.set(r.content_hash, r.embedding)
  return map
}

/** 整篇替换：先删后插，放在同一个事务里，避免中途失败留下半篇。 */
export async function replaceDocChunks(
  docPath: string,
  chunks: Chunk[],
  embeddings: (number[] | string)[],
): Promise<void> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM chunks WHERE doc_path = $1', [docPath])

    // 一次多行 INSERT，而不是一块一条。
    // 从本地经 SSH/IAP 隧道灌库时，每条 INSERT 都是一次网络往返 ——
    // 6700 块就是 6700 次往返，光延迟就要十几分钟。合并后降到每篇一次。
    // 每行 13 个参数，Postgres 的参数上限是 65535，所以按 500 行一批切。
    const COLS = 13
    const PER_BATCH = 500

    for (let start = 0; start < chunks.length; start += PER_BATCH) {
      const slice = chunks.slice(start, start + PER_BATCH)
      const values: unknown[] = []
      const rows: string[] = []

      slice.forEach((c, j) => {
        const e = embeddings[start + j]!
        const base = j * COLS
        const ph = Array.from({ length: COLS }, (_, k) => `$${base + k + 1}`)
        // 倒数第二个占位符是向量，要显式转型
        rows.push(`(${ph.slice(0, 11).join(',')},${ph[11]}::vector,${ph[12]})`)
        values.push(
          c.id, c.docPath, c.url, c.anchor, c.lang, c.course, c.docTitle,
          c.heading, c.ordinal, c.content, c.contentHash,
          typeof e === 'string' ? e : toVectorLiteral(e),
          new Date(),
        )
      })

      await client.query(
        `INSERT INTO chunks
           (id, doc_path, url, anchor, lang, course, doc_title, heading, ordinal, content, content_hash, embedding, updated_at)
         VALUES ${rows.join(',')}`,
        values,
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/** 删除源码里已经不存在的文档（连带 chunks 走 ON DELETE CASCADE） */
export async function deleteMissingDocs(keepPaths: string[]): Promise<number> {
  const { rowCount } = await getPool().query(
    'DELETE FROM documents WHERE NOT (path = ANY($1::text[]))',
    [keepPaths],
  )
  return rowCount ?? 0
}

export interface SearchRow {
  id: string
  url: string
  anchor: string
  course: string
  doc_title: string
  heading: string
  content: string
  distance: number
}

/**
 * 向量粗召回。
 *
 * ef_search 调到 100（默认 40）：语料只有几千块，多搜一点几乎不要钱，
 * 但召回率提升对最终答案质量影响很直接。
 */
export async function searchChunks(
  queryEmbedding: number[],
  limit: number,
  lang?: string,
): Promise<SearchRow[]> {
  const client = await getPool().connect()
  try {
    await client.query('SET LOCAL hnsw.ef_search = 100')
    const params: unknown[] = [toVectorLiteral(queryEmbedding), limit]
    let langFilter = ''
    if (lang) {
      params.push(lang)
      langFilter = 'WHERE lang = $3'
    }
    const { rows } = await client.query<SearchRow>(
      `SELECT id, url, anchor, course, doc_title, heading, content,
              embedding <=> $1::vector AS distance
         FROM chunks
         ${langFilter}
        ORDER BY embedding <=> $1::vector
        LIMIT $2`,
      params,
    )
    return rows
  } finally {
    client.release()
  }
}

export async function logAsk(entry: {
  question: string
  lang: string
  citedUrls: string[]
  topScore: number | null
  answered: boolean
  latencyMs: number
  ipHash: string
}): Promise<void> {
  try {
    await getPool().query(
      `INSERT INTO ask_log (question, lang, cited_urls, top_score, answered, latency_ms, ip_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        entry.question, entry.lang, entry.citedUrls, entry.topScore,
        entry.answered, entry.latencyMs, entry.ipHash,
      ],
    )
  } catch (err) {
    // 日志写失败不能影响回答本身
    console.error('写 ask_log 失败:', err)
  }
}

export interface DocIndexRow {
  url: string
  course: string
  course_slug: string
  category: string
  title: string
  outline: string
  chars: number
}

/** 全站文档索引，喂给学习路径生成器 */
export async function listDocumentIndex(lang = 'zh'): Promise<DocIndexRow[]> {
  const { rows } = await getPool().query<DocIndexRow>(
    `SELECT url, course, course_slug, category, title, outline, chars
       FROM documents WHERE lang = $1
      ORDER BY category, course_slug, path`,
    [lang],
  )
  return rows
}

export async function countChunks(): Promise<number> {
  const { rows } = await getPool().query<{ n: string }>('SELECT count(*)::text AS n FROM chunks')
  return Number(rows[0]?.n ?? 0)
}
