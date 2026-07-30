import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { retrieve, passageLink } from './retrieve.js'
import { streamAnswer } from './answer.js'
import { RateLimitedError } from './llm.js'
import { logAsk, countChunks, closePool } from './db.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const PATHS_FILE = path.join(here, '../data/paths.json')

const MAX_QUESTION_LEN = 500

// ———— 限流 ————
// 用进程内 Map 而不是 Redis：这个服务是单实例，进程内计数就够了，
// 少一个外部依赖就少一处故障点。将来要多副本再换 Redis。
const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const rec = hits.get(key)
  if (!rec || now > rec.resetAt) {
    hits.set(key, { count: 1, resetAt: now + 3600_000 })
    return { ok: true, retryAfter: 0 }
  }
  rec.count++
  if (rec.count > config.server.rateLimitPerHour) {
    return { ok: false, retryAfter: Math.ceil((rec.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

// 定期清理过期计数，避免 Map 无限增长
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k)
}, 600_000).unref()

function clientIp(req: http.IncomingMessage): string {
  // 服务跑在 Caddy 后面，真实 IP 在 X-Forwarded-For 的第一段
  const xff = req.headers['x-forwarded-for']
  const raw = Array.isArray(xff) ? xff[0] : xff
  return raw?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
}

function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(config.server.ipSalt + ip)
    .digest('hex')
    .slice(0, 16)
}

function cors(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', config.server.corsOrigin)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function json(res: http.ServerResponse, status: number, body: unknown) {
  cors(res)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > 64 * 1024) throw new Error('请求体过大')
    chunks.push(c as Buffer)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

/** SSE 单条事件 */
function sse(res: http.ServerResponse, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// ———— /api/ask ————
async function handleAsk(req: http.IncomingMessage, res: http.ServerResponse) {
  const ip = clientIp(req)
  const ipHash = hashIp(ip)

  const limit = rateLimit(ipHash)
  if (!limit.ok) {
    return json(res, 429, {
      error: `提问太频繁了，${Math.ceil(limit.retryAfter / 60)} 分钟后再来吧`,
      retryAfter: limit.retryAfter,
    })
  }

  let body: { question?: unknown; lang?: unknown }
  try {
    body = (await readBody(req)) as typeof body
  } catch {
    return json(res, 400, { error: '请求格式不对' })
  }

  const question = typeof body.question === 'string' ? body.question.trim() : ''
  const lang = body.lang === 'en' ? 'en' : 'zh'

  if (!question) return json(res, 400, { error: '问题不能为空' })
  if (question.length > MAX_QUESTION_LEN) {
    return json(res, 400, { error: `问题请控制在 ${MAX_QUESTION_LEN} 字以内` })
  }

  const started = Date.now()
  cors(res)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Caddy 默认不会缓冲 SSE，这个头是给别的反代兜底
    'X-Accel-Buffering': 'no',
  })

  // 心跳，防止中间层掐掉长连接
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000)
  let citedUrls: string[] = []
  let topScore: number | null = null
  let answered = false

  try {
    const { passages, topScore: ts, bestDistance, hasCoverage } = await retrieve(question, lang)
    topScore = ts

    if (!hasCoverage) {
      // 记下距离，方便按真实数据回调 RETRIEVAL_MAX_DISTANCE
      console.log(
        `未覆盖: "${question.slice(0, 40)}" 最优距离=${bestDistance?.toFixed(3)}`,
      )
      sse(res, 'sources', [])
      sse(res, 'delta', {
        text:
          '本站笔记里还没有覆盖这个话题。' +
          (passages.length
            ? `最接近的内容可能是《${passages[0]!.docTitle}》，但相关度不高。`
            : ''),
      })
      sse(res, 'done', { covered: false })
      return
    }

    // 先把来源推给前端，读者在等答案时就能看到引了哪几篇
    citedUrls = passages.map(passageLink)
    sse(
      res,
      'sources',
      passages.map((p, i) => ({
        n: i + 1,
        url: passageLink(p),
        course: p.course,
        docTitle: p.docTitle,
        heading: p.heading,
        score: Number(p.score.toFixed(3)),
      })),
    )

    for await (const ev of streamAnswer(question, passages)) {
      if (ev.type === 'text') {
        sse(res, 'delta', { text: ev.text })
        answered = true
      } else if (ev.type === 'reasoning') {
        // 思考模型可能刷几十秒推理才出第一个字，给前端一个信号别让读者干等
        sse(res, 'thinking', {})
      } else if (ev.type === 'refusal') {
        sse(res, 'error', {
          message: '这个问题触发了模型的安全策略，换个问法试试。',
          category: ev.category,
        })
      } else {
        sse(res, 'done', { covered: true, usage: ev.usage })
      }
    }
  } catch (err) {
    console.error('回答失败:', err)
    // 限流和真故障要分开说：前者是「等一下就好」，后者才是「坏了」
    sse(res, 'error', {
      message:
        err instanceof RateLimitedError
          ? '当前提问的人有点多，稍等十几秒再试一次。'
          : '服务出了点问题，稍后再试。',
    })
  } finally {
    clearInterval(heartbeat)
    res.end()
    void logAsk({
      question,
      lang,
      citedUrls,
      topScore,
      answered,
      latencyMs: Date.now() - started,
      ipHash,
    })
  }
}

// ———— /api/paths ————
async function handlePaths(res: http.ServerResponse) {
  try {
    const raw = await fs.readFile(PATHS_FILE, 'utf8')
    cors(res)
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    })
    res.end(raw)
  } catch {
    json(res, 503, { error: '学习路径还没生成，先跑 npm run paths' })
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')

  if (req.method === 'OPTIONS') {
    cors(res)
    res.writeHead(204)
    return res.end()
  }

  // Caddy 把 /rag/* 重写成 /api/*，所以 /rag/health 到这里是 /api/health。
  // 两个都收，容器内自检和公网探活用同一个路径。
  if (url.pathname === '/health' || url.pathname === '/api/health') {
    return countChunks().then(
      (n) => json(res, 200, { ok: true, chunks: n }),
      (e) => json(res, 500, { ok: false, error: String(e) }),
    )
  }

  if (url.pathname === '/api/ask' && req.method === 'POST') {
    return void handleAsk(req, res)
  }

  if (url.pathname === '/api/paths' && req.method === 'GET') {
    return void handlePaths(res)
  }

  json(res, 404, { error: 'not found' })
})

server.listen(config.server.port, () => {
  console.log(`RAG 服务已启动: http://0.0.0.0:${config.server.port}`)
  console.log(`  嵌入     ${config.embed.model} @ ${config.embed.provider}`)
  console.log(`  重排     ${config.embed.rerankModel}`)
  console.log(`  回答     ${config.llm.model} @ ${config.llm.provider}`)
  console.log(`  限流     ${config.server.rateLimitPerHour} 次/小时/IP`)
})

for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    console.log(`\n收到 ${sig}，关闭中…`)
    server.close(() => {
      void closePool().then(() => process.exit(0))
    })
  })
}
