#!/usr/bin/env node
// 按 NOTESTYLE.md 自动修机械问题。只改能确定性判断的东西 —— 内容补写永远是人的事。
//
//   npm run notes:fix -- --dry            只报告不落盘（先跑这个）
//   npm run notes:fix                     实修
//   npm run notes:fix -- docs/zh/os/lec5.md
//   npm run notes:fix -- --only=blank,fence   只跑指定阶段
//
// 阶段（有依赖顺序，别乱调）：
//   fence  代码块补语言        ← 必须在保护代码块之前，它要读块内容
//   fm     生成/补全 frontmatter
//   h1     H1 归一 + 多余 H1 降级
//   html   <div> → ::: 容器
//   head   标题动词收敛
//   space  CJK/拉丁加空格、半角括号转全角
//   blank  空行归一、首尾清理

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  DOCS_DIR, HEADING_CANON, C,
  splitFrontmatter, stringifyFrontmatter, extractHeadings,
  walkNotes, classify, courseName, guessLang, fenceRanges,
} from './notes-lib.mjs'

const argv = process.argv.slice(2)
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const targets = argv.filter((a) => !a.startsWith('--'))
const DRY = !!flags.dry
const ONLY = flags.only ? new Set(String(flags.only).split(',')) : null
const on = (stage) => !ONLY || ONLY.has(stage)

// ── 代码块 / 数学块保护 ────────────────────────────────────────────
// 文本类改写（加空格、转标点、折空行）绝不能碰代码和公式。
// 先抽成占位符，改完再塞回去。占位符用不可能出现在笔记里的私有区字符。
const PH = ''
function protect(body) {
  const store = []
  const keep = (s) => {
    store.push(s)
    return `${PH}${store.length - 1}${PH}`
  }
  // 代码块用 fenceRanges 逐行圈定，不能用单条正则 —— 列表里的 `- ```sql`
  // 开围栏不在行首，正则会漏掉整块，里面的代码就会被后面的加空格逻辑改写
  const lines = body.split('\n')
  for (const [a, b] of fenceRanges(body).reverse()) {
    lines.splice(a, b - a + 1, keep(lines.slice(a, b + 1).join('\n')))
  }

  const out = lines
    .join('\n')
    .replace(/\$\$[\s\S]*?\$\$/g, keep)
    .replace(/`[^`\n]+`/g, keep)
    .replace(/\$[^$\n]+\$/g, keep)
    .replace(/^\s*(?:\||>?\s*\|).*\|.*$/gm, keep) // 表格行，里面的对齐空格有意义
    .replace(/https?:\/\/\S+/g, keep)
  return { text: out, store }
}
/**
 * 必须循环还原：保护是分层的，表格行里可能已经含有行内代码/公式的占位符，
 * 整行再被保护一次。单遍 replace 只能还原最外层，内层占位符会被原样写进文件
 * —— 那些字符不可见，`| $f$ | $g$ |` 会静默变成 `| 33 | 34 |`。
 */
function restore(text, store) {
  const re = new RegExp(`${PH}(\\d+)${PH}`, 'g')
  let out = text
  for (let i = 0; i < 8 && re.test(out); i++) {
    re.lastIndex = 0
    out = out.replace(re, (_, n) => store[Number(n)] ?? '')
  }
  if (out.includes(PH)) throw new Error('占位符未能完全还原，疑似保护层嵌套过深')
  return out
}

// ── 阶段实现 ──────────────────────────────────────────────────────

/**
 * 代码块补语言标注。要在保护之前跑，因为它得看块里写的是什么。
 *
 * 逐行扫描而不是正则 replace：笔记里有 `- ```sql` 这种嵌在列表项里的围栏，
 * 行首正则匹配不到它的开围栏、却匹配得到缩进的闭围栏，开/闭奇偶性一错位，
 * 闭围栏就会被当成开围栏加上语言标注，代码块结构直接坏掉。
 */
function fixFences(body, log) {
  const lines = body.split('\n')
  // 允许围栏前有列表标记（- / * / + / 1.）和缩进
  const FENCE = /^([ \t]*(?:[-*+]|\d+[.)])?[ \t]*)(`{3,}|~{3,})(.*)$/
  let openAt = -1
  let marker = ''

  for (let i = 0; i < lines.length; i++) {
    const m = FENCE.exec(lines[i])
    if (!m) continue
    const [, prefix, ticks, info] = m

    if (openAt === -1) {
      openAt = i
      marker = ticks[0]
      if (info.trim() === '') {
        // 往后找闭围栏，用块内容推断语言
        let end = lines.length
        for (let j = i + 1; j < lines.length; j++) {
          const c = FENCE.exec(lines[j])
          if (c && c[2][0] === marker && c[2].length >= ticks.length) { end = j; break }
        }
        const lang = guessLang(lines.slice(i + 1, end).join('\n'))
        lines[i] = `${prefix}${ticks}${lang}`
        log('fence', `补语言标注 ${lang}`)
      }
    } else if (ticks[0] === marker && ticks.length >= 3) {
      openAt = -1
      marker = ''
    }
  }
  return lines.join('\n')
}

/** H1 归一：统一成 `# Lec N 中文（English）`，多余 H1 降级为 H2。 */
function fixH1(body, meta, log) {
  const hs = extractHeadings(body)
  const h1s = hs.filter((h) => h.level === 1)
  if (!h1s.length) return body

  let out = body

  // 先降级多余 H1（从后往前改，避免偏移失效）
  if (h1s.length > 1 && !meta.isIndex) {
    for (const h of h1s.slice(1).reverse()) {
      out = out.slice(0, h.index) + '#' + out.slice(h.index)
      log('h1', `多余 H1 降级为 H2：${h.text}`)
    }
  }

  if (meta.isIndex || meta.isCourseRoot) return out

  // 再归一首个 H1
  return out.replace(/^#[ \t]+(.+?)[ \t]*$/m, (line, text) => {
    // Lec 12 / L12 / Lecture 12 + 可选的 : ： · — - 分隔符
    const m = text.match(/^(?:Lec(?:ture)?\.?\s*|L)(\d+)\s*[:：·—–\-]?\s*(.*)$/i)
    if (!m) return line
    const norm = `# Lec ${m[1]} ${m[2].trim()}`
    if (norm === line) return line
    log('h1', `H1 归一：${text} → Lec ${m[1]} ${m[2].trim()}`)
    return norm
  })
}

// ── HTML div → 容器 ───────────────────────────────────────────────
// 颜色族 → 语义。这是查了全库 960 处 div 的实际内容定的：
// 蓝=定义、红=例题、绿=推论/定理。和颜色直觉相反，别按感觉改。
const COLOR_KIND = [
  [/#4a90d9|#3b82f6|#3399ff|#eaf2fb|#eef4ff|#e6f2ff/i, 'definition'],
  [/#e05c5c|#d9534f|#ef4444|#e53935|#fdeeee|#fbeaea|#fef2f2|#ffebee/i, 'example'],
  [/#5cb85c|#3fa34d|#43a047|#16a34a|#eafbea|#eafaf0|#eafbe9|#e8f5e9|#ecfdf3/i, 'theorem'],
]
const CLASS_KIND = { definition: 'definition', corollary: 'theorem', example: 'example' }
/**
 * 标签开头的词覆盖颜色判断。「工程联想」「关键结论」其实是作者自己的判断，
 * 归 insight 比归定理准。
 *
 * 必须锚定在标签开头：`例题（到达定义驱动常量传播）` 里含「定义」二字，
 * 不锚定的话会被判成 definition，而它明明是个例题。
 */
const LABEL_OVERRIDE = [
  [/^(?:工程联想|关键结论|一图流|工程视角|直觉)/, 'insight'],
  [/^(?:常见误区|坑|注意|警告|陷阱)/, 'pitfall'],
  [/^(?:定理|Theorem|推论|Corollary|引理|Lemma)/i, 'theorem'],
  [/^(?:定义|Definition)/i, 'definition'],
  [/^(?:例|Example)/i, 'example'],
]

/**
 * div 内联 HTML → markdown。
 *
 * `<code>` 必须转成反引号，这不是风格问题而是正确性问题：`<div>` 是 HTML 块，
 * markdown-it 原样透传里面的内容；换成 `:::` 容器后内容开始走 markdown 解析，
 * `<code>s = s + a*b</code>` 里的 `*` 会跨标签配对成 <em>，生成的 HTML 标签
 * 交叉不闭合，Vue 编译直接报 "Element is missing end tag"。
 *
 * `<table>` 保持原样 —— 它是块级 HTML，markdown-it 会整块透传，转成 markdown
 * 表格反而容易在含 | 的单元格上出错。只保证前后有空行。
 */
function htmlToMd(s) {
  // 代码块和表格先抽走 —— 后面的空白收敛会毁掉代码缩进和表格结构
  const held = []
  const hold = (t) => `${PH}h${held.push(t) - 1}${PH}`

  let out = s
    // <pre><code> 要先于单独的 <code>，否则内层会被先吃掉
    .replace(/<pre\b[^>]*>\s*(?:<code\b[^>]*>)?([\s\S]*?)(?:<\/code>)?\s*<\/pre>/gi, (_, code) =>
      hold(`\n\n\`\`\`text\n${code.replace(/<[^>]+>/g, '').replace(/^\n+|\s+$/g, '')}\n\`\`\`\n\n`))
    .replace(/<table\b[\s\S]*?<\/table>/gi, (t) => hold(`\n\n${t}\n\n`))
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, c) => {
      const t = c.replace(/<[^>]+>/g, '').trim()
      if (!t) return ''
      // 内容自带反引号时用更长的围栏，避免提前闭合
      const fence = '`'.repeat(Math.max(1, ...[...t.matchAll(/`+/g)].map((m) => m[0].length + 1)))
      return hold(`${fence}${t}${fence}`)
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:p|div)\b[^>]*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    .replace(/<\/?(?:ul|ol)\b[^>]*>/gi, '\n')
    .replace(/<(?:strong|b)>\s*([\s\S]*?)\s*<\/(?:strong|b)>/gi, (_, t) => (t.trim() ? `**${t.trim()}**` : ''))
    .replace(/<(?:i|em)>\s*([\s\S]*?)\s*<\/(?:i|em)>/gi, (_, t) => (t.trim() ? `*${t.trim()}*` : ''))
    .replace(/<\/?(?:span|font|center|u|sub|sup)\b[^>]*>/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const re = new RegExp(`${PH}h(\\d+)${PH}`, 'g')
  for (let i = 0; i < 4 && re.test(out); i++) {
    re.lastIndex = 0
    out = out.replace(re, (_, n) => held[Number(n)] ?? '')
  }
  return out.replace(/\n{3,}/g, '\n\n').trim()
}

function fixHtml(body, log) {
  let out = ''
  let i = 0
  while (true) {
    const m = /<div\b([^>]*)>/i.exec(body.slice(i))
    if (!m) { out += body.slice(i); break }
    const start = i + m.index
    out += body.slice(i, start)

    // 找配对的 </div>，处理嵌套
    let depth = 0, j = start, close = -1
    const tagRe = /<\/?div\b[^>]*>/gi
    tagRe.lastIndex = start
    for (let t; (t = tagRe.exec(body)); ) {
      depth += t[0].startsWith('</') ? -1 : 1
      if (depth === 0) { close = t.index; j = t.index + t[0].length; break }
    }
    if (close === -1) { out += body.slice(start); break } // 未闭合，原样保留

    const attrs = m[1]
    const inner = body.slice(start + m[0].length, close)
    const cls = attrs.match(/class="([^"]*)"/)?.[1]?.trim()

    let kind = cls && CLASS_KIND[cls]
    if (!kind) for (const [re, k] of COLOR_KIND) if (re.test(attrs)) { kind = k; break }

    // 布局类 div（vp-raw / card / container / text-align 之类）不动，交给 lint 报
    if (!kind) { out += body.slice(start, j); i = j; continue }

    // 首个 <strong>/<b> 当容器标题
    const labelM = inner.match(/^\s*<(?:strong|b)>\s*([^<]{1,40}?)\s*<\/(?:strong|b)>/i)
    let label = labelM?.[1]?.trim() ?? ''
    let rest = labelM ? inner.slice(labelM[0].length) : inner

    // 匹配前先剥掉前导 emoji 和空白：真实标签长 `✅ 关键结论：Raft 五大性质`、
    // `📘 定义：提交点` 这样，不剥的话锚定在开头的规则一个都命中不了
    const labelKey = label.replace(/^[^\p{L}\p{N}]+/u, '')
    if (labelKey) for (const [re, k] of LABEL_OVERRIDE) if (re.test(labelKey)) { kind = k; break }
    // Definition1 / Example2 这种编号后缀去掉，纯英文标签也去掉（容器自带标题）
    if (/^(Definition|Example|Corollary|Theorem|Lemma)\d*$/i.test(label)) label = ''

    const content = htmlToMd(rest)
    log('html', `<div> → ::: ${kind}${label ? ' ' + label : ''}`)
    out += `::: ${kind}${label ? ' ' + label : ''}\n${content}\n:::`
    i = j
  }
  return out
}

/** 标题动词收敛：总览/Outline/摘要 → 本讲导览；总结/小结 → 本讲小结。 */
function fixHeadings(body, log) {
  return body.replace(/^(#{2,6})([ \t]+)(.+?)[ \t]*$/gm, (line, hashes, sp, text) => {
    // 保留编号前缀
    const m = text.match(/^((?:\d+[.、．]\s*|[一二三四五六七八九十]+[、.．]\s*)?)(.+)$/)
    const prefix = m[1]
    const bare = m[2].trim()
    const canon = HEADING_CANON[bare.toLowerCase()]
    if (!canon || canon === bare) return line
    log('head', `标题收敛：${bare} → ${canon}`)
    return `${hashes}${sp}${prefix}${canon}`
  })
}

/**
 * CJK/拉丁之间加空格，半角括号术语括注转全角。
 *
 * 两侧都必须严格限定为字母数字。早期版本把 * _ ` ) ] 这类也算作「拉丁」，
 * 结果把 `**不变量原理**` 改成了 `**不变量原理 **`，粗体标记直接失效。
 */
function fixSpacing(text, log) {
  let n = 0
  let out = text
    .replace(/([一-鿿])([A-Za-z0-9])/g, (_, a, b) => { n++; return `${a} ${b}` })
    .replace(/([A-Za-z0-9])([一-鿿])/g, (_, a, b) => { n++; return `${a} ${b}` })
  if (n) log('space', `${n} 处中英文加空格`)

  let p = 0
  out = out.replace(/([一-鿿])\(([^)（）]{1,60}?)\)/g, (_, a, b) => { p++; return `${a}（${b}）` })
  if (p) log('space', `${p} 处半角括号转全角`)
  return out
}

/**
 * 空行归一：连续空行折叠为 1，去首部空行，尾部单换行。
 *
 * 行尾恰好 2 个空格是 markdown 的硬换行，不能清 —— 清掉会让原本分行的
 * 「问题：…／答案：…」挤到同一行。只清空白行和行尾单个空格。
 */
function fixBlank(body, log) {
  const before = body
  let out = body
    .replace(/^[ \t]+$/gm, '')
    .replace(/(?<=\S)[ \t]$/gm, '')
    .replace(/(?<=\S)[ \t]{3,}$/gm, '  ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\s*$/, '\n')
  if (out !== before) log('blank', '空行归一')
  return out
}

/** 生成 / 补全 frontmatter。已有字段一律保留，只补缺的。 */
async function buildFrontmatter(rel, meta, body, existing, docsDir, log) {
  const fm = { ...(existing ?? {}) }
  const h1 = body.match(/^#[ \t]+(.+)$/m)?.[1]?.trim() ?? ''
  const lecM = path.basename(rel).match(/^lec(\d+)\.md$/i)
  const bodyLen = body.replace(/^#.*$/gm, '').trim().length

  if (!fm.title) {
    // 剥掉 Lec N 前缀和行内 markdown —— title 进的是 <title> 标签，
    // 留着 *斜体* 星号会原样显示在浏览器标签页上
    fm.title =
      h1
        .replace(/^(?:Lec(?:ture)?\.?\s*|L)\d+\s*[:：·—–\-]?\s*/i, '')
        .replace(/\*\*([^*]*)\*\*/g, '$1')
        .replace(/\*([^*]*)\*/g, '$1')
        .replace(/`([^`]*)`/g, '$1')
        .trim() || path.basename(rel, '.md')
  }
  if (!fm.course) {
    fm.course = await courseName(docsDir, meta.lang, meta.category, meta.courseSlug, meta.courseSlug)
  }
  if (!fm.course_id) {
    // 课程名开头常是 "6.1810 操作系统工程"，也有 "18-746 存储系统" 这种。
    // 抽不出来就不写这个字段 —— 留空字符串会让 lint 报 frontmatter-field，
    // 反而看不出是「真缺」还是「这门课本来就没课号」。
    const id = fm.course.match(/^(\d+[.\-][\dA-Za-z.]+)/)?.[1]
    if (id) fm.course_id = id
  }
  if (!fm.lecture && lecM) fm.lecture = Number(lecM[1])
  if (!fm.kind) fm.kind = meta.kind ?? 'system'
  if (!fm.tags) fm.tags = []
  if (!fm.status) {
    const placeholder = /尚未补齐|占位页|TODO|待补充/.test(body)
    fm.status = bodyLen < 200 || placeholder ? 'stub' : /TODO|待补充/.test(body) ? 'draft' : 'complete'
  }
  if (!existing) log('fm', `生成 frontmatter（kind=${fm.kind} status=${fm.status}）`)
  return fm
}

// ── 单文件处理 ────────────────────────────────────────────────────
async function fixFile(file, docsDir) {
  const rel = path.relative(docsDir, file).split(path.sep).join('/')
  const meta = classify(rel)
  const raw = await fs.readFile(file, 'utf8')
  if (!raw.trim()) return { rel, changes: [], skipped: '空文件' }

  const changes = []
  const log = (stage, msg) => changes.push({ stage, msg })

  const { fm: existingFm, body: origBody } = splitFrontmatter(raw)
  let body = origBody

  // 站点首页（layout: home）和布局页不动
  if (existingFm?.layout === 'home') return { rel, changes: [], skipped: 'layout: home' }

  if (on('fence')) body = fixFences(body, log)
  if (on('h1')) body = fixH1(body, meta, log)
  if (on('html')) body = fixHtml(body, log)
  if (on('head')) body = fixHeadings(body, log)

  if (on('space')) {
    const { text, store } = protect(body)
    body = restore(fixSpacing(text, log), store)
  }
  if (on('blank')) {
    const { text, store } = protect(body)
    body = restore(fixBlank(text, log), store)
  }

  let fmOut = existingFm
  if (on('fm')) fmOut = await buildFrontmatter(rel, meta, body, existingFm, docsDir, log)

  const out = (fmOut ? stringifyFrontmatter(fmOut) : '') + body
  if (out === raw) return { rel, changes: [] }
  if (!DRY) await fs.writeFile(file, out, 'utf8')
  return { rel, changes }
}

// ── main ───────────────────────────────────────────────────────────
const docsDir = path.resolve(DOCS_DIR)
const files = targets.length ? targets.map((t) => path.resolve(t)) : await walkNotes(docsDir)

const byStage = new Map()
let touched = 0
const details = []

for (const file of files) {
  const r = await fixFile(file, docsDir)
  if (r.skipped || !r.changes.length) continue
  touched++
  details.push(r)
  for (const c of r.changes) byStage.set(c.stage, (byStage.get(c.stage) ?? 0) + 1)
}

if (flags.verbose) {
  for (const r of details) {
    console.log(`\n${C.bold(r.rel)}`)
    for (const c of r.changes) console.log(`  ${C.cyan(c.stage.padEnd(6))} ${c.msg}`)
  }
}

console.log(`\n${C.bold(DRY ? '将要修改' : '已修改')} ${touched} / ${files.length} 个文件`)
for (const [stage, n] of [...byStage].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${C.cyan(stage.padEnd(6))} ${String(n).padStart(6)} 处`)
}
if (DRY) console.log(C.gray('\n--dry：没有落盘。去掉 --dry 实际执行。'))
