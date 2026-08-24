// 笔记 lint / fix 的共用解析层。零依赖，纯 Node。
//
// 这里的 stripCodeFences 和标题抽取逻辑与 rag/src/corpus.ts 同源 —— 那边是
// TypeScript 且在独立的 package 里，跨包 import 要拖进 tsx，不值当。两边都很短，
// 改动时记得同步。真正必须逐字一致的只有 slugifyHeading（锚点），而 lint 不需要它。

import fs from 'node:fs/promises'
import path from 'node:path'

export const DOCS_DIR = 'docs'

// ── 课程目录 → kind 映射 ──────────────────────────────────────────
// 键是 zh 之后的「分类/课程」两段。新增课程时在这里登记，
// 漏登记会被 lint 报出来，不会静默按错误的骨架检查。
export const KIND_BY_COURSE = {
  'tcs/maths_for_cs': 'theory',
  'tcs/introduction_to_algorithms': 'theory',
  'security/apply_cryptography': 'theory',
  'security/foundation_of_security': 'theory',
  'language/dynamic_language': 'theory',
  'language/computer_language': 'theory',
  'language/sicp': 'theory',
  'language/introdution_to_cpp': 'system',

  'arch/cca': 'system',
  'arch/csa': 'system',
  'arch/computation_structures': 'system',
  'arch/llp': 'system',
  'computer_sys/computer_sys_eng': 'system',
  'computer_sys/database_system': 'system',
  'computer_sys/dc_computing': 'system',
  'computer_sys/distributed_system': 'system',
  'computer_sys/mobile': 'system',
  'computer_sys/network': 'system',
  'computer_sys/os': 'system',
  'computer_sys/storage': 'system',
  'sw_eng/software_performance_engineer': 'system',
  'sw_eng/multicore_programming': 'system',
  'sw_eng/fundamentals_of_programming': 'system',
  'sw_eng/algorithm_engineer': 'system',

  'opensource/postgresql': 'source',

  'sw_eng/designftw': 'design',
  'sw_eng/software_design': 'design',
  'sw_eng/element_of_software_construction': 'design',
}

/** 无信息量的章节标题。命中即报 warning —— 它们在 embedText 的上下文头里不可分。 */
export const VAGUE_HEADINGS = new Set([
  '总览', '小结', '摘要', 'outline', '总结', '本讲总结', '本讲小结', '引言',
  '介绍', '大纲', '课程描述', '背景', '概述', '简介', '前言', '写在前面',
  'summary', 'overview', 'introduction', 'intro', 'fqa', 'faq',
])

/** 标题动词收敛表：旧写法 → 新写法。主题词需人工补。 */
export const HEADING_CANON = {
  '总览': '本讲导览', 'outline': '本讲导览', '大纲': '本讲导览',
  '摘要': '本讲导览', '概述': '本讲导览', 'overview': '本讲导览',
  '总结': '本讲小结', '本讲总结': '本讲小结', '小结': '本讲小结',
  'summary': '本讲小结',
}

// ── 章节长度阈值。必须和 rag/src/chunk.ts 的 TARGET/MAX/MIN 保持一致。 ──
export const SECTION_MIN = 100
export const SECTION_MAX = 1200

// ── frontmatter ──────────────────────────────────────────────────

/** 只有 --- 在第一行才算 frontmatter；正文里的 --- 是分隔线。与 corpus.ts 同规则。 */
export function splitFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return { fm: null, fmRaw: '', body: raw }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) return { fm: null, fmRaw: '', body: raw }
  const after = raw.indexOf('\n', end + 1)
  const fmRaw = raw.slice(4, end)
  return {
    fm: parseFrontmatter(fmRaw),
    fmRaw,
    body: after === -1 ? '' : raw.slice(after + 1),
  }
}

/**
 * 够用的 YAML 子集解析：标量 + 行内数组。
 * 笔记的 frontmatter 不需要嵌套结构，引 js-yaml 只为这点事不划算。
 */
export function parseFrontmatter(fmRaw) {
  const out = {}
  for (const line of fmRaw.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      out[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else {
      out[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  return out
}

/**
 * YAML 标量序列化。需要引号时用单引号，内部单引号按 YAML 规则双写。
 *
 * 不能无脑裸写 —— 「片上网络（一）：拓扑与流量控制」这种标题里的冒号会被
 * 解析成映射键，整个站点构建直接失败。
 */
function yamlScalar(v) {
  if (typeof v === 'number') return String(v)
  const s = String(v)
  const needsQuote =
    s === '' ||
    /[:#\[\]{}&*!|>'"%@`,]/.test(s) ||
    /^[-?]/.test(s) ||
    s !== s.trim() ||
    /^(true|false|null|yes|no|on|off|~)$/i.test(s) ||
    /^[\d.+-]+$/.test(s)
  return needsQuote ? `'${s.replace(/'/g, "''")}'` : s
}

export function stringifyFrontmatter(fm) {
  const order = ['title', 'course', 'course_id', 'lecture', 'kind', 'tags', 'status', 'source']
  const keys = [...order.filter((k) => k in fm), ...Object.keys(fm).filter((k) => !order.includes(k))]
  const lines = keys.map((k) => {
    const v = fm[k]
    if (Array.isArray(v)) return `${k}: [${v.map(yamlScalar).join(', ')}]`
    // 课号 6.5610 / 18-746 一律带引号，否则 YAML 会当成浮点数或日期
    if (k === 'course_id') return `${k}: '${String(v).replace(/'/g, "''")}'`
    return `${k}: ${yamlScalar(v)}`
  })
  return `---\n${lines.join('\n')}\n---\n`
}

// ── 正文结构 ──────────────────────────────────────────────────────

/**
 * 围栏行匹配。允许围栏前带列表标记和缩进 —— 笔记里有 `- ```sql` 这种写法，
 * 只认行首的正则会漏掉它的开围栏却认得缩进的闭围栏，奇偶性一错位，
 * 后面所有「这里是不是代码块」的判断就全反了。
 */
export const FENCE_RE = /^([ \t]*(?:[-*+]|\d+[.)])?[ \t]*)(`{3,}|~{3,})(.*)$/

/** 扫出所有代码块的行号区间 [startLine, endLine]（含两端，0-based）。 */
export function fenceRanges(body) {
  const lines = body.split('\n')
  const out = []
  let open = -1
  let marker = ''
  let len = 0
  for (let i = 0; i < lines.length; i++) {
    const m = FENCE_RE.exec(lines[i])
    if (!m) continue
    if (open === -1) { open = i; marker = m[2][0]; len = m[2].length }
    else if (m[2][0] === marker && m[2].length >= len) { out.push([open, i]); open = -1 }
  }
  if (open !== -1) out.push([open, lines.length - 1]) // 未闭合，当到文件尾
  return out
}

/**
 * 用等长空格替换围栏代码块，保证行号和字符偏移都不变。
 * 必须先做这一步再找标题：笔记里大量 shell/python 块含 `# 注释` 行。
 */
export function stripCodeFences(body) {
  const lines = body.split('\n')
  for (const [a, b] of fenceRanges(body)) {
    for (let i = a; i <= b; i++) lines[i] = ' '.repeat(lines[i].length)
  }
  return lines.join('\n')
}

/** 数学块 $$...$$ 同样要保护，里面的 _ 和 * 不是 markdown 强调。 */
export function stripMathBlocks(body) {
  return body.replace(/\$\$[\s\S]*?\$\$/g, (b) =>
    b.split('\n').map((l) => ' '.repeat(l.length)).join('\n'),
  )
}

/** 返回 { level, text, index, line }，已排除代码块内的伪标题。 */
export function extractHeadings(body) {
  const clean = stripCodeFences(body)
  const out = []
  for (const m of clean.matchAll(/^(#{1,6})[ \t]+(.+?)[ \t]*$/gm)) {
    out.push({
      level: m[1].length,
      text: plainHeading(m[2]),
      raw: m[2],
      index: m.index,
      line: clean.slice(0, m.index).split('\n').length,
    })
  }
  return out
}

export function plainHeading(h) {
  return h
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

/**
 * 切成 section：每个标题到下一个同级或更高级标题之间的正文。
 * `body` 是原文（含代码块），`textLen` 统计的是去掉标题行后的正文字符数。
 */
export function sections(body) {
  const hs = extractHeadings(body)
  const out = []
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i]
    // 找到下一个层级 <= 当前的标题，中间的子节算在本节内
    let end = body.length
    for (let j = i + 1; j < hs.length; j++) {
      if (hs[j].level <= h.level) { end = hs[j].index; break }
      if (j === hs.length - 1) end = body.length
    }
    const nextAny = hs[i + 1]?.index ?? body.length
    const raw = body.slice(h.index, end)
    // 「本节自己的正文」= 到下一个任意标题为止，用来判空章节
    const own = body.slice(h.index, nextAny).replace(/^#{1,6}[ \t]+.+$/m, '').trim()
    out.push({ ...h, raw, own, ownLen: own.length, totalLen: raw.length })
  }
  return out
}

/** 判断是不是无信息量标题：剥掉编号前缀后落在 VAGUE_HEADINGS 里。 */
export function isVagueHeading(text) {
  const bare = text
    .replace(/^[\d.、\s]*/, '')
    .replace(/^[一二三四五六七八九十]+[、.．]\s*/, '')
    .trim()
    .toLowerCase()
  return VAGUE_HEADINGS.has(bare)
}

// ── 文件遍历 ──────────────────────────────────────────────────────

export async function walkNotes(dir) {
  const out = []
  async function rec(d) {
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) {
        if (e.name === 'public' || e.name.startsWith('.') || e.name === 'node_modules') continue
        await rec(full)
      } else if (e.isFile() && e.name.endsWith('.md')) {
        out.push(full)
      }
    }
  }
  await rec(dir)
  return out.sort()
}

/** 从 docs 相对路径拆出 lang / category / courseSlug，规则同 corpus.ts。 */
export function classify(relPath) {
  const segs = relPath.replace(/\.md$/, '').split('/')
  const lang = segs[0] ?? 'zh'
  const category = segs.length >= 3 ? segs[1] : ''
  const courseSlug = segs.length >= 4 ? segs[2] : segs[1] ?? ''
  const courseKey = `${category}/${courseSlug}`
  return {
    lang,
    category,
    courseSlug,
    courseKey,
    kind: KIND_BY_COURSE[courseKey],
    // 课程 index.md、分类 index.md 不是正文页，规则放宽
    isIndex: segs.at(-1) === 'index',
    isCourseRoot: segs.length <= 3,
  }
}

/**
 * 这两个课程的 index.md 首个 H1 是「Introduction」，当课程名没有意义。
 * 与其改动站点页面，不如在这里定名。
 */
const COURSE_NAME_OVERRIDE = {
  'sw_eng/algorithm_engineer': '算法工程师训练',
  'sw_eng/software_design': '软件设计',
}

/** 课程可读名：取课程目录 index.md 的首个 H1，与 corpus.ts 的 readCourseName 一致。 */
const courseNameCache = new Map()
export async function courseName(docsDir, lang, category, courseSlug, fallback) {
  const override = COURSE_NAME_OVERRIDE[`${category}/${courseSlug}`]
  if (override) return override
  const dir = path.join(docsDir, lang, category, courseSlug)
  if (courseNameCache.has(dir)) return courseNameCache.get(dir)
  let name = fallback
  try {
    const raw = await fs.readFile(path.join(dir, 'index.md'), 'utf8')
    const { body } = splitFrontmatter(raw)
    name = body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback
  } catch {
    /* 没有 index.md 就用目录名 */
  }
  courseNameCache.set(dir, name)
  return name
}

// ── 代码块语言推断 ────────────────────────────────────────────────
// 顺序有意义：先匹配特征最强的。判不出来的返回 'text'，不猜。
const LANG_PATTERNS = [
  [/^\s*#include\b|\bprintf\s*\(|\bmalloc\s*\(|\bstruct\s+\w+\s*\{|\buint\d+_t\b/m, 'c'],
  [/^\s*(func|package)\s+\w|\bgo\s+func\b|:=|\bchan\s+/m, 'go'],
  [/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE\s+(TABLE|INDEX)|EXPLAIN|BEGIN;|COMMIT;)\b/im, 'sql'],
  [/^\s*(def|class)\s+\w+.*:\s*$|^\s*import\s+\w+$|\bprint\s*\(|^\s*if __name__/m, 'python'],
  [/^\s*(public|private|protected)\s+(static\s+)?(class|void|int|abstract)\b|\bSystem\.out\./m, 'java'],
  [/^\s*(const|let|var)\s+\w+\s*=|=>\s*\{|\bfunction\s*\(|\bconsole\.log\(/m, 'javascript'],
  [/^\s*(module|endmodule|always\s*@|reg\s+\[|wire\s+\[)/m, 'verilog'],
  [/^\s*(\$|#)\s+\w|^\s*(cd|ls|grep|cat|make|gcc|sudo|apt|docker|git)\s/m, 'bash'],
  [/^\s*(\.globl|\.section|\bli\s+[at]\d|\bsd\s+|\bld\s+|\bjal\b|\becall\b|%rax|%rsp|\bmovq?\b)/m, 'asm'],
  [/^\s*(fn|let\s+mut|impl|pub\s+fn)\b|::\w+</m, 'rust'],
  [/^\s*<\w+[\s>]|<\/\w+>/m, 'html'],
  [/^\s*\{[\s\S]*"[\w-]+"\s*:/m, 'json'],
]

export function guessLang(code) {
  for (const [re, lang] of LANG_PATTERNS) if (re.test(code)) return lang
  return 'text'
}

// ── 输出 ──────────────────────────────────────────────────────────
export const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
}
