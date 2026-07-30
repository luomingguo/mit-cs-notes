/**
 * 嵌入与重排的统一入口。
 *
 * 屏蔽服务商差异，上层（ingest / retrieve）只认这里的接口。
 * 目前支持两家：
 *   - openai-compatible：硅基流动等，/embeddings + /rerank，默认
 *   - voyage：Voyage AI
 *
 * 两家的 rerank 请求字段不同（top_n vs top_k），响应也略有差异，
 * 差异全部收敛在这个文件里。
 */
import { config } from './config.js'

const BATCH_SIZE = 32
const BATCH_CHARS = 60_000

export interface EmbedResult {
  embeddings: number[][]
  totalTokens: number
}

export interface RerankHit {
  index: number
  score: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function backoff(attempt: number): number {
  return Math.min(30_000, 1000 * 2 ** (attempt - 1)) + Math.random() * 500
}

async function postJson<T>(
  url: string,
  apiKey: string,
  body: unknown,
  label: string,
): Promise<T> {
  const maxAttempts = 5
  let lastErr: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
    } catch (e) {
      lastErr = e
      if (attempt < maxAttempts) {
        await sleep(backoff(attempt))
        continue
      }
      break
    }

    if (res.ok) return (await res.json()) as T

    const text = await res.text().catch(() => '')
    // 429 / 5xx 才重试；4xx 是请求本身有问题，重试没意义
    if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
      const retryAfter = Number(res.headers.get('retry-after'))
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : backoff(attempt)
      console.warn(
        `  ${label} ${res.status}，${Math.round(waitMs / 1000)}s 后重试 (${attempt}/${maxAttempts})`,
      )
      await sleep(waitMs)
      continue
    }
    throw new Error(`${label} 失败 ${res.status}: ${text.slice(0, 300)}`)
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
}

/** 按条数和字符数双重上限切批 */
function batches(texts: string[]): string[][] {
  const out: string[][] = []
  let cur: string[] = []
  let chars = 0
  for (const t of texts) {
    if (
      cur.length > 0 &&
      (cur.length >= BATCH_SIZE || chars + t.length > BATCH_CHARS)
    ) {
      out.push(cur)
      cur = []
      chars = 0
    }
    cur.push(t)
    chars += t.length
  }
  if (cur.length) out.push(cur)
  return out
}

interface OpenAIEmbeddingResponse {
  data: { embedding: number[]; index: number }[]
  usage?: { total_tokens?: number; prompt_tokens?: number }
}

interface VoyageEmbeddingResponse {
  data: { embedding: number[]; index: number }[]
  // 实测：token 数在 usage 里，不是顶层的 total_tokens（文档写反了）
  usage?: { total_tokens?: number }
  total_tokens?: number
}

/**
 * 批量嵌入。
 *
 * inputType 只对 Voyage 有意义（它靠 input_type 给 query / document 加不同前缀）。
 * bge-m3 这类对称模型两侧用同一套编码，不需要区分。
 */
export async function embed(
  texts: string[],
  inputType: 'document' | 'query',
): Promise<EmbedResult> {
  if (texts.length === 0) return { embeddings: [], totalTokens: 0 }

  const { provider, apiKey, baseUrl, model, extraBody } = config.embed
  const all: number[][] = []
  let totalTokens = 0

  for (const batch of batches(texts)) {
    if (provider === 'voyage') {
      const res = await postJson<VoyageEmbeddingResponse>(
        `${baseUrl}/embeddings`,
        apiKey,
        { input: batch, model, input_type: inputType, truncation: true, ...extraBody },
        'Voyage embeddings',
      )
      pushOrdered(all, res.data, batch.length)
      totalTokens += res.usage?.total_tokens ?? res.total_tokens ?? 0
    } else {
      const res = await postJson<OpenAIEmbeddingResponse>(
        `${baseUrl}/embeddings`,
        apiKey,
        { input: batch, model, encoding_format: 'float', ...extraBody },
        '嵌入接口',
      )
      pushOrdered(all, res.data, batch.length)
      totalTokens += res.usage?.total_tokens ?? res.usage?.prompt_tokens ?? 0
    }
  }

  return { embeddings: all, totalTokens }
}

/** 返回顺序不保证与输入一致，必须按 index 归位 */
function pushOrdered(
  out: number[][],
  data: { embedding: number[]; index: number }[],
  expected: number,
): void {
  const ordered = new Array<number[]>(expected)
  for (const d of data) ordered[d.index] = d.embedding
  for (let i = 0; i < expected; i++) {
    const e = ordered[i]
    if (!e) throw new Error(`嵌入接口少返回了第 ${i} 条向量`)
    out.push(e)
  }
}

export async function embedOne(
  text: string,
  inputType: 'document' | 'query',
): Promise<number[]> {
  const { embeddings } = await embed([text], inputType)
  const first = embeddings[0]
  if (!first) throw new Error('嵌入接口没有返回向量')
  return first
}

/**
 * 重排响应。
 * 实测 Voyage 返回的数组键是 data；硅基流动文档写的是 results。
 * 两个都收，谁在用哪个都不会炸。
 */
interface RerankResponse {
  data?: { index: number; relevance_score: number }[]
  results?: { index: number; relevance_score: number }[]
}

/** 用重排模型对粗召回结果精排 */
export async function rerank(
  query: string,
  documents: string[],
  topK: number,
): Promise<RerankHit[]> {
  if (documents.length === 0) return []
  const { provider, apiKey, baseUrl, rerankModel } = config.embed
  const n = Math.min(topK, documents.length)

  // 字段名两家不同：Voyage 用 top_k，OpenAI 兼容那套（硅基流动）用 top_n
  const body =
    provider === 'voyage'
      ? { query, documents, model: rerankModel, top_k: n, truncation: true }
      : { query, documents, model: rerankModel, top_n: n }

  const res = await postJson<RerankResponse>(
    `${baseUrl}/rerank`,
    apiKey,
    body,
    '重排接口',
  )
  const hits = res.data ?? res.results
  if (!hits) {
    throw new Error(`重排响应里既没有 data 也没有 results：${JSON.stringify(res).slice(0, 200)}`)
  }
  return hits.map((r) => ({ index: r.index, score: r.relevance_score }))
}

/**
 * 校验实际向量维度与配置是否一致。
 *
 * 维度对不上是最阴险的一类错误：库能建、能写、能查，只是检索结果全是噪声，
 * 而且不会有任何报错。所以 ingest 在写第一批之前必须过这道闸。
 */
export function assertDimension(vector: number[]): void {
  const expected = config.embed.dimension
  if (vector.length !== expected) {
    throw new Error(
      `向量维度不符：模型 ${config.embed.model} 实际返回 ${vector.length} 维，` +
        `但 EMBED_DIM 配的是 ${expected}。\n` +
        `改法：把 EMBED_DIM 设成 ${vector.length}，然后重建库（库里的 vector(N) 是按它建的）：\n` +
        `  docker compose exec notes-db psql -U notes -d notes -c 'DROP TABLE IF EXISTS chunks, documents CASCADE'\n` +
        `  npm run ingest -- --force`,
    )
  }
}
