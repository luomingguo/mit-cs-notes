/**
 * 用 Astro 的真实构建产物验证 mapUrl 与 slugifyHeading。
 *
 * 为什么值得常驻：这两个函数一旦算错，问答给出的引用链接就会指向不存在的页面，
 * 而且是静默失败 —— 读者点进去只会看到 404，你不会收到任何报错。
 * 每次修改公开路由或标题锚点规则后，跑一次 `npm run verify`。
 *
 * 用法：npm run verify         （需要先从仓库根目录运行 npm run site:build）
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectDocuments, extractHeadings, mapUrl } from './corpus.js'
import { chunkDocument } from './chunk.js'
import { config } from './config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const DOCS = process.env.DOCS_DIR
  ? path.resolve(process.env.DOCS_DIR)
  : config.docsDir
const DIST = process.env.DIST_DIR
  ? path.resolve(process.env.DIST_DIR)
  : path.join(here, '../../frontend/dist')

async function distFileFor(url: string): Promise<string> {
  const clean = url.replace(/^\/+|\/+$/g, '')
  const candidates = [
    path.join(DIST, clean, 'index.html'),
    path.join(DIST, `${clean}.html`),
  ]
  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {}
  }
  return candidates[0]!
}

async function main() {
  try {
    await fs.access(DIST)
  } catch {
    console.error(`找不到 ${DIST}\n先从仓库根目录运行 npm run site:build 再来验证。`)
    process.exit(2)
  }

  const routeContracts = new Map([
    ['zh/cs/computer_sys/os/lec5.md', '/zh/os/lec5'],
    ['zh/cs/tcs/index.md', '/zh/tcs/'],
    ['zh/psy/core/intro/lec1.md', '/zh/psy/intro/lec1'],
    ['zh/mgnt/org/leadership/index.md', '/zh/mgnt/leadership/'],
  ])
  for (const [sourcePath, expected] of routeContracts) {
    const actual = mapUrl(sourcePath)
    if (actual !== expected) {
      throw new Error(`路由契约错误：${sourcePath} -> ${actual}，预期 ${expected}`)
    }
  }
  console.log(`路由契约:      ${routeContracts.size}/${routeContracts.size}\n`)

  const docs = await collectDocuments(DOCS)
  console.log(`收录 ${docs.length} 篇\n`)

  let urlOk = 0
  const urlMiss: string[] = []
  let anchorChecked = 0
  const anchorBad: string[] = []

  for (const doc of docs) {
    let html: string
    try {
      html = await fs.readFile(await distFileFor(doc.url), 'utf8')
      urlOk++
    } catch {
      urlMiss.push(`${doc.path}  ->  ${doc.url}`)
      continue
    }

    const realIds = new Set(
      [...html.matchAll(/<h[1-6][^>]*\bid="([^"]+)"/g)].map((m) => m[1]!),
    )
    for (const h of extractHeadings(doc.body)) {
      anchorChecked++
      if (!realIds.has(h.slug)) {
        anchorBad.push(`${doc.url}  «${h.text}»  算出=${h.slug}`)
      }
    }
  }

  console.log(`URL 命中 dist:  ${urlOk}/${docs.length}`)
  if (urlMiss.length) {
    console.log(`\n未命中的 ${urlMiss.length} 条:`)
    urlMiss.slice(0, 20).forEach((s) => console.log('  ' + s))
  }

  const good = anchorChecked - anchorBad.length
  const rate = anchorChecked ? (good / anchorChecked) * 100 : 0
  console.log(`\n锚点命中:      ${good}/${anchorChecked} (${rate.toFixed(1)}%)`)
  if (anchorBad.length) {
    console.log(`\n对不上的前 25 条:`)
    anchorBad.slice(0, 25).forEach((s) => console.log('  ' + s))
  }

  // ———— 切块体检 ————
  const all = docs.flatMap(chunkDocument)
  const lens = all.map((c) => c.content.length).sort((a, b) => a - b)
  const pct = (p: number) => lens[Math.floor(lens.length * p)] ?? 0
  const withAnchor = all.filter((c) => c.anchor).length
  const withHeading = all.filter((c) => c.heading).length
  const docsWithTldr = docs.filter((doc) => doc.tldr)
  const summaryChunks = all.filter((chunk) => chunk.blockKind === 'summary')
  const badSummaryDocs = docsWithTldr.filter((doc) =>
    summaryChunks.filter((chunk) => chunk.docPath === doc.path).length !== 1,
  )

  console.log(`
———— 切块 ————
  总块数    ${all.length}
  平均每篇  ${(all.length / docs.length).toFixed(1)} 块
  长度 p50  ${pct(0.5)}   p90 ${pct(0.9)}   最长 ${lens.at(-1)}   最短 ${lens[0]}
  带锚点    ${((withAnchor / all.length) * 100).toFixed(1)}%
  带面包屑  ${((withHeading / all.length) * 100).toFixed(1)}%
  TL;DR 块  ${summaryChunks.length}/${docsWithTldr.length}（每篇应恰好 1 块）`)

  if (badSummaryDocs.length) {
    console.log('\nTL;DR 切块异常：')
    badSummaryDocs.slice(0, 20).forEach((doc) => console.log(`  ${doc.path}`))
  }

  // 抽一块看看清洗结果，人眼确认没把正文洗坏
  const sample = all.find((c) => c.content.length > 400 && c.heading)
  if (sample) {
    console.log(`
———— 样例块 ————
  ${sample.url}#${sample.anchor}
  面包屑: ${sample.course} · ${sample.docTitle} · ${sample.heading}
  ---
${sample.content.slice(0, 420).replace(/^/gm, '  ')}…`)
  }

  // URL 和锚点都是外部契约。迁移后将偏差作为构建失败处理，避免引用
  // 静默退化为页面顶部，掩盖标题 slug 规则的回归。
  if (urlMiss.length > 0 || anchorBad.length > 0 || badSummaryDocs.length > 0) process.exit(1)
}

main()
