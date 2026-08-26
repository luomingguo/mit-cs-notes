/**
 * 学习路径生成器。
 *
 * 目录树只能告诉读者「有哪些课」，回答不了「我想搞数据库内核，该按什么顺序读」。
 * 这个脚本把全站 468 篇笔记的索引喂给生成模型，为每个目标产出一条跨课程路线，
 * 结果落成静态 JSON 由前端渲染 —— 读者侧零延迟、零成本，也能被搜索引擎收录。
 *
 * 两个关键设计：
 *   1. 用 JSON 结构化输出约束返回格式，不靠解析 markdown。
 *   2. 生成后逐条校验 URL 是否真实存在，模型编出来的链接直接剔除。
 *      没有这一步，路径页会布满 404，比没有还糟。
 *
 * 用法：npm run paths           生成全部目标
 *      npm run paths -- --goal db   只生成某个目标
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { completeJson } from './llm.js'
import { config } from './config.js'
import { listDocumentIndex, closePool, type DocIndexRow } from './db.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT_FILE = path.join(here, '../data/paths.json')
/**
 * 同时写一份到仓库根 public/，让路径页变成纯静态资源。
 * 这样学习路径在 GitHub Pages 上也能用 —— 只有问答才依赖后端。
 */
const PUBLIC_FILE = path.join(here, '../../public/rag-paths.json')

interface Goal {
  slug: string
  title: string
  /** 给模型的补充说明，界定这条路线的范围和终点 */
  brief: string
}

const GOALS: Goal[] = [
  {
    slug: 'db-kernel',
    title: '我想搞懂数据库内核',
    brief: '目标是能读懂 PostgreSQL 源码，理解 MVCC、索引结构、锁、WAL 的实现原理。需要先补齐哪些系统层面的前置知识。',
  },
  {
    slug: 'os',
    title: '我想吃透操作系统',
    brief: '目标是能读懂并修改 xv6，理解虚拟内存、进程调度、文件系统、崩溃恢复。',
  },
  {
    slug: 'performance',
    title: '我想做系统性能优化',
    brief: '目标是能定位并优化真实系统的性能瓶颈，涵盖缓存、并行、编译器优化、测量方法。',
  },
  {
    slug: 'architecture',
    title: '我想从晶体管理解到 CPU',
    brief: '目标是理解计算机体系结构的完整链路：数字逻辑、指令集、流水线、缓存一致性。',
  },
  {
    slug: 'distributed',
    title: '我想做分布式系统',
    brief: '目标是理解一致性、容错、共识算法，以及大规模系统的网络与存储基础。',
  },
  {
    slug: 'security',
    title: '我想入门安全与密码学',
    brief: '目标是理解密码学原语与系统安全攻防，具备安全设计的基本判断力。',
  },
  {
    slug: 'theory',
    title: '我想补齐理论基础',
    brief: '目标是补上算法、离散数学、可计算性与复杂度这些底层理论，让工程实践有理论支撑。',
  },
]

// structured outputs 的约束：所有对象都要 additionalProperties:false，
// 且 properties 必须全部出现在 required 里。
const PATH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    estimatedWeeks: { type: 'integer' },
    prerequisites: { type: 'string' },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          why: { type: 'string' },
          course: { type: 'string' },
          checkpoint: { type: 'string' },
          notes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
              },
              required: ['title', 'url'],
              additionalProperties: false,
            },
          },
        },
        required: ['title', 'why', 'course', 'checkpoint', 'notes'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'estimatedWeeks', 'prerequisites', 'steps'],
  additionalProperties: false,
} as const

interface GeneratedPath {
  summary: string
  estimatedWeeks: number
  prerequisites: string
  steps: {
    title: string
    why: string
    course: string
    checkpoint: string
    notes: { title: string; url: string }[]
  }[]
}

/** 把文档索引压成模型能一眼扫完的目录 */
function buildCatalog(docs: DocIndexRow[]): string {
  const byCourse = new Map<string, DocIndexRow[]>()
  for (const d of docs) {
    const key = `${d.discipline}/${d.category}/${d.course_slug}|${d.course}`
    const arr = byCourse.get(key) ?? []
    arr.push(d)
    byCourse.set(key, arr)
  }

  const parts: string[] = []
  for (const [key, rows] of byCourse) {
    const course = key.split('|')[1]!
    parts.push(`\n## ${course}`)
    for (const r of rows) {
      // outline 截断：模型需要知道每篇讲什么，但不需要全文目录
      const outline = r.outline ? ` — ${r.outline.slice(0, 110)}` : ''
      parts.push(`- ${r.title} [${r.url}]${outline}`)
    }
  }
  return parts.join('\n')
}

const SYSTEM_PREFIX = `你在为「MIT Notes by Ron」这个中文笔记站设计学习路径。

这个站点的独特之处：作者通读并整理了 MIT 计算机专业二十多门课的笔记，加上 PostgreSQL 等开源项目的源码研读。单门课的笔记网上到处都是，但把二十多门课串成一条通往具体目标的路线，只有掌握全景的人做得到 —— 这正是你要产出的东西。

下面是全站笔记的完整目录，每条格式为「标题 [URL] — 小节概览」：
`

const SYSTEM_SUFFIX = `

设计路径时的要求：

1. 步骤要有清晰的依赖顺序，每一步都建立在前一步之上。宁可少而精，6~10 步为宜。
2. 每一步的 why 必须说清「为什么这一步非要放在这个位置」，而不是复述这门课讲什么。读者最想知道的是依赖关系。
3. notes 只能填目录里真实存在的 URL，一字不差地照抄。绝对不要构造或猜测 URL。
4. 每步挑 2~5 篇最关键的笔记，不要把整门课的所有 lec 都列上 —— 路径的价值在于筛选。
5. checkpoint 写一个可自测的具体标志，让读者知道自己是否真的过了这一步（例如「能手画出 Sv39 三级页表的地址翻译过程」），不要写「理解了 XX」这种无法验证的话。
6. course 填这一步主要对应的课程名。
7. 跨课程的联系要主动点出来 —— 比如操作系统的日志和数据库的 WAL 是同一个思想，这类连接是这份笔记集最有价值的地方。
8. 全部用中文。`

async function generatePath(
  goal: Goal,
  catalog: string,
): Promise<GeneratedPath> {
  return completeJson<GeneratedPath>(
    SYSTEM_PREFIX + catalog + SYSTEM_SUFFIX,
    `请为这个目标设计学习路径：\n\n目标：${goal.title}\n说明：${goal.brief}`,
    PATH_SCHEMA,
  )
}

/** 剔除模型编造的 URL —— 这是整个脚本最重要的一道闸 */
function validateUrls(
  p: GeneratedPath,
  validUrls: Map<string, string>,
): { path: GeneratedPath; dropped: string[] } {
  const dropped: string[] = []
  const steps = p.steps.map((s) => ({
    ...s,
    notes: s.notes.filter((n) => {
      // 容忍尾部斜杠差异
      const hit = validUrls.has(n.url) || validUrls.has(n.url.replace(/\/$/, ''))
      if (!hit) dropped.push(`${n.title} -> ${n.url}`)
      return hit
    }),
  }))
  return { path: { ...p, steps }, dropped }
}

async function main() {
  const goalArg = process.argv.indexOf('--goal')
  const only = goalArg >= 0 ? process.argv[goalArg + 1] : undefined
  const goals = only ? GOALS.filter((g) => g.slug === only) : GOALS
  if (goals.length === 0) {
    throw new Error(`没有找到目标 ${only}，可选：${GOALS.map((g) => g.slug).join(', ')}`)
  }

  const docs = await listDocumentIndex('zh')
  if (docs.length === 0) {
    throw new Error('documents 表是空的，先跑 npm run ingest')
  }
  console.log(`目录里有 ${docs.length} 篇笔记`)

  const validUrls = new Map(docs.map((d) => [d.url.replace(/\/$/, ''), d.title]))
  // 同时接受带尾斜杠的形式
  for (const d of docs) validUrls.set(d.url, d.title)

  const catalog = buildCatalog(docs)
  console.log(`目录约 ${Math.round(catalog.length / 1000)}K 字符\n`)

  console.log(`生成服务: ${config.llm.provider} @ ${config.llm.baseUrl}`)
  console.log(`生成模型: ${config.llm.model}\n`)
  const results: Record<string, unknown> = {}

  for (const goal of goals) {
    console.log(`生成中: ${goal.title}`)
    try {
      const raw = await generatePath(goal, catalog)
      const { path: cleaned, dropped } = validateUrls(raw, validUrls)

      if (dropped.length) {
        console.warn(`    ⚠ 剔除 ${dropped.length} 个无效链接:`)
        dropped.slice(0, 5).forEach((d) => console.warn(`      ${d}`))
      }
      const noteCount = cleaned.steps.reduce((n, s) => n + s.notes.length, 0)
      console.log(`    ${cleaned.steps.length} 步 / ${noteCount} 篇笔记\n`)

      results[goal.slug] = {
        slug: goal.slug,
        title: goal.title,
        brief: goal.brief,
        ...cleaned,
      }
    } catch (err) {
      console.error(`    ✗ 失败: ${err instanceof Error ? err.message : err}\n`)
    }
  }

  // 只更新本次生成的目标，保留其余已有结果
  let existing: Record<string, unknown> = {}
  try {
    const prev = JSON.parse(await fs.readFile(OUT_FILE, 'utf8')) as {
      paths?: Record<string, unknown>
    }
    existing = prev.paths ?? {}
  } catch {
    // 首次生成
  }

  const merged = { ...existing, ...results }
  const payload = JSON.stringify(
    { generatedAt: new Date().toISOString(), paths: merged },
    null,
    2,
  )

  for (const target of [OUT_FILE, PUBLIC_FILE]) {
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, payload, 'utf8')
    console.log(`已写入 ${target}`)
  }
  console.log(`共 ${Object.keys(merged).length} 条路径`)
}

main()
  .catch((err) => {
    console.error('\npaths 生成失败:', err)
    process.exitCode = 1
  })
  .finally(closePool)
