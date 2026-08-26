#!/usr/bin/env node
// 按 NOTESTYLE.md 检查笔记。
//
//   npm run notes:lint                    全库
//   npm run notes:lint -- docs/zh/cs/computer_sys/os/...  指定文件
//   npm run notes:lint -- --summary       只出规则命中统计（改造前后对比用）
//   npm run notes:lint -- --level=error   只看 error
//   npm run notes:lint -- --max-errors=N  超过 N 个 error 退出码 1（CI 用）

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  DOCS_DIR, NOTE_TYPES, TAG_RE, SECTION_MIN, SECTION_MAX, C,
  splitFrontmatter, stripCodeFences, stripMathBlocks, extractHeadings,
  sections, isVagueHeading, walkNotes, classify, fenceRanges, FENCE_RE,
} from './notes-lib.mjs'

const argv = process.argv.slice(2)
const flags = Object.fromEntries(
  argv.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const targets = argv.filter((a) => !a.startsWith('--'))

// 课程名与课号由最近的课程 index.md 继承；子页不重复维护。
const REQUIRED_FM = ['title', 'status']

/** 术语表。文件不在就跳过术语检查，不让 lint 因此挂掉。 */
const VOCAB = await (async () => {
  try {
    const raw = await fs.readFile(path.join(DOCS_DIR, '.vocab.json'), 'utf8')
    return JSON.parse(raw).terms ?? []
  } catch {
    return []
  }
})()
const VALID_STATUS = new Set(['complete', 'draft', 'stub'])

/** 一条 finding。level: error | warning | info */
function f(level, rule, msg, line) {
  return { level, rule, msg, line }
}

async function lintFile(file, docsDir) {
  const rel = path.relative(docsDir, file).split(path.sep).join('/')
  const meta = classify(rel)
  const raw = await fs.readFile(file, 'utf8')
  const out = []

  // ── 空文件 / stub ────────────────────────────────────────────
  if (raw.trim().length === 0) {
    return { rel, meta, findings: [f('error', 'empty-file', '0 字节空文件')] }
  }

  const { fm, body } = splitFrontmatter(raw)
  const lineCount = raw.split('\n').length
  const isStub = fm?.status === 'stub'

  // ── frontmatter ──────────────────────────────────────────────
  if (!fm) {
    out.push(f('error', 'no-frontmatter', '缺 frontmatter'))
  } else {
    for (const k of REQUIRED_FM) {
      const v = fm[k]
      const empty = !(k in fm) || v === '' || (Array.isArray(v) && v.length === 0)
      if (!empty) continue
      out.push(f('error', 'frontmatter-field', `frontmatter 缺 ${k}`))
    }
    if (meta.isContentPage && !fm.type) {
      out.push(f('error', 'no-type', `缺 type；按路径推断为 ${meta.inferredType}`))
    }
    if (fm.type && !NOTE_TYPES.has(fm.type)) {
      out.push(f('error', 'bad-type', `type=${fm.type} 不在 course|lecture|paper|concept|assignment|project 中`))
    }
    if (fm.type && meta.inferredType && fm.type !== meta.inferredType) {
      out.push(f('error', 'type-path-mismatch', `type=${fm.type} 与目录职责 ${meta.inferredType} 不符`))
    }
    if (meta.isCourseIndex && !fm.course) {
      out.push(f('warning', 'course-metadata', '课程 index.md 缺 course；迁移前暂以 H1 或目录名回退'))
    }
    if (meta.inferredType && meta.inferredType !== 'course' && (fm.course || fm.course_id)) {
      out.push(f('info', 'repeated-course-metadata', '子页的 course/course_id 可删除；解析时以课程 index.md 为准'))
    }

    if (meta.isContentPage) {
      if ('tags' in fm && !Array.isArray(fm.tags)) {
        out.push(f('error', 'bad-tags-shape', 'tags 必须使用行内数组，例如 [cache, locality]'))
      }
      const tags = Array.isArray(fm.tags) ? fm.tags : []
      if (tags.length === 0) {
        out.push(f('warning', 'no-tags', 'tags 为空，需人工补 2–5 个跨文档概念键'))
      } else {
        if (tags.length < 2) out.push(f('warning', 'few-tags', `只有 ${tags.length} 个 tag；通常应为 2–5 个`))
        if (tags.length > 7) out.push(f('error', 'too-many-tags', `${tags.length} 个 tags，超过上限 7`))
        const duplicates = tags.filter((tag, i) => tags.indexOf(tag) !== i)
        if (duplicates.length) out.push(f('error', 'duplicate-tags', `tags 重复：${[...new Set(duplicates)].join(', ')}`))
        const invalid = tags.filter((tag) => !TAG_RE.test(tag))
        if (invalid.length) out.push(f('error', 'bad-tag-format', `tags 应为小写 kebab-case：${invalid.join(', ')}`))
      }
    }
    if (fm.status && !VALID_STATUS.has(fm.status)) {
      out.push(f('error', 'bad-status', `status=${fm.status} 不是 complete|draft|stub`))
    }
    if (/^Lec\s*\d|^L\d|^Lecture\s*\d/i.test(fm.title ?? '')) {
      out.push(f('warning', 'title-has-prefix', 'frontmatter title 不该带 Lec N 前缀'))
    }
  }
  // stub 页只查到这里，后面的内容规则对占位页没意义
  if (isStub) return { rel, meta, findings: out }

  // ── 标题 ─────────────────────────────────────────────────────
  const hs = extractHeadings(body)
  const h1s = hs.filter((h) => h.level === 1)
  const h2s = hs.filter((h) => h.level === 2)
  const tldrs = h2s.filter((h) => h.text.trim().toLowerCase() === 'tl;dr')

  if (h1s.length === 0) {
    out.push(f('error', 'no-h1', '没有 H1'))
  } else if (h1s.length > 1 && !meta.isIndex) {
    out.push(f('error', 'multi-h1', `${h1s.length} 个 H1，正文页只能有 1 个（多余的应降级为 H2）`, h1s[1].line))
  }

  // 只对 lecN.md 要求「Lec N」前缀。PostgreSQL 系列、专题页（GFW.md、
  // Blockchain-Networks.md）本来就不是讲次，硬套这个格式是误报。
  if (h1s.length && /^lec\d+\.md$/i.test(path.basename(rel))) {
    const t = h1s[0].text
    if (!/^Lec\s+\d+\s+\S/.test(t)) {
      out.push(f('warning', 'h1-format', `H1 应为「Lec N 中文（English）」，当前：${t}`, h1s[0].line))
    }
  }

  // TL;DR 是页面摘要和 RAG 独立摘要块的共同来源。旧文档渐进迁移，缺失先告警。
  if (meta.isContentPage) {
    if (tldrs.length === 0) {
      out.push(f('warning', 'no-tldr', '缺唯一的「## TL;DR」摘要'))
    } else {
      if (tldrs.length > 1) out.push(f('error', 'multi-tldr', `出现 ${tldrs.length} 个「## TL;DR」`, tldrs[1].line))
      if (h2s[0] !== tldrs[0]) out.push(f('error', 'tldr-position', '「## TL;DR」必须是正文第一个 H2', tldrs[0].line))
      const tldr = sections(body).find((s) => s.level === 2 && s.text.trim().toLowerCase() === 'tl;dr')
      if (tldr) {
        const bullets = (tldr.own.match(/^\s*[-*+]\s+\S/gm) ?? []).length
        if (bullets < 3 || bullets > 5) {
          out.push(f('warning', 'tldr-bullets', `TL;DR 建议 3–5 条要点，当前 ${bullets} 条`, tldr.line))
        }
        if (tldr.ownLen > 700) out.push(f('warning', 'tldr-long', `TL;DR 共 ${tldr.ownLen} 字符，应保持可独立快速阅读`, tldr.line))
      }
    }
  }

  // 层级跳跃
  for (let i = 1; i < hs.length; i++) {
    if (hs[i].level > hs[i - 1].level + 1) {
      out.push(f('warning', 'heading-skip',
        `H${hs[i - 1].level} 直接跳到 H${hs[i].level}：${hs[i].text}`, hs[i].line))
    }
  }
  for (const h of hs) {
    if (h.level >= 4) out.push(f('info', 'deep-heading', `H${h.level} 嵌套过深：${h.text}`, h.line))
  }

  // ── 章节 ─────────────────────────────────────────────────────
  const secs = sections(body).filter((s) => s.level >= 2)
  for (const s of secs) {
    const isTldr = s.level === 2 && s.text.trim().toLowerCase() === 'tl;dr'
    if (s.ownLen === 0) {
      out.push(f('error', 'empty-section', `空章节（下面直接是另一个标题）：${s.text}`, s.line))
    } else if (!isTldr && s.ownLen < SECTION_MIN && s.totalLen < SECTION_MIN) {
      out.push(f('info', 'short-section', `章节仅 ${s.ownLen} 字符，低于 chunk.ts 的 MIN：${s.text}`, s.line))
    }
    if (!isTldr && s.level === 2 && s.totalLen > SECTION_MAX) {
      out.push(f('error', 'long-section',
        `H2 章节 ${s.totalLen} 字符 > ${SECTION_MAX}，会被 chunk.ts 硬切，需拆 H3：${s.text}`, s.line))
    }
    if (!isTldr && s.level >= 2 && isVagueHeading(s.text)) {
      out.push(f('warning', 'vague-heading', `标题无主题词：${s.text}`, s.line))
    }
    // 代码占比
    const code = [...s.raw.matchAll(/^([ \t]*)(`{3,})[^\n]*\n([\s\S]*?)^\1?\2[^\n]*$/gm)]
      .reduce((n, m) => n + m[0].length, 0)
    if (s.totalLen > 400 && code / s.totalLen > 0.6) {
      out.push(f('warning', 'code-heavy',
        `代码占 ${Math.round((code / s.totalLen) * 100)}%，需补散文引导：${s.text}`, s.line))
    }
  }

  // 文件以标题结尾
  const lastNonEmpty = body.split('\n').filter((l) => l.trim()).at(-1) ?? ''
  if (/^#{1,6}\s/.test(lastNonEmpty)) {
    out.push(f('error', 'ends-with-heading', `文件最后一行是标题，内容断在这里：${lastNonEmpty.trim()}`))
  }

  // ── 必填区块 ─────────────────────────────────────────────────
  if (fm?.status === 'complete') {
    if (meta.inferredType !== 'course' && !/^##\s*我的理解\s*$/m.test(body) && !/:::\s*insight/.test(body)) {
      out.push(f('warning', 'no-insight', '缺「## 我的理解」区块'))
    }
    if (meta.isContentPage && h2s.length === 0) {
      out.push(f('error', 'no-h2', '没有任何 H2，无法按章节分块'))
    }
  }

  // ── 极短 ─────────────────────────────────────────────────────
  if (lineCount < 30 && !meta.isIndex) {
    out.push(f('error', 'too-short', `仅 ${lineCount} 行，应标 status: stub 或补写`))
  }

  // ── 排版（在剥掉代码块和数学块的副本上查）────────────────────
  const prose = stripMathBlocks(stripCodeFences(body))

  const blanks = [...prose.matchAll(/\n{4,}/g)]
  if (blanks.length) {
    out.push(f('error', 'blank-lines', `${blanks.length} 处连续 3 行以上空行`))
  }
  if (!/\n$/.test(raw) || /\n\s*\n\s*$/.test(raw)) {
    out.push(f('warning', 'file-tail', '文件尾应为单个换行'))
  }
  if (/^\s*\n/.test(raw) && !raw.startsWith('---')) {
    out.push(f('warning', 'file-head', '文件不应以空行开头'))
  }

  // 裸代码块。用 fenceRanges 定位开围栏，别自己数奇偶 —— 列表里的
  // `- ```sql` 会让朴素的奇偶计数整个反过来。
  const bodyLines = body.split('\n')
  const bareOpen = fenceRanges(body).filter(([a]) => (FENCE_RE.exec(bodyLines[a])?.[3] ?? '').trim() === '').length
  if (bareOpen) out.push(f('warning', 'code-no-lang', `${bareOpen} 个代码块没标语言`))

  // CJK / 拉丁紧贴
  const tight = [...prose.matchAll(/[一-龥][A-Za-z0-9]|[A-Za-z0-9][一-龥]/g)]
  if (tight.length > 5) {
    out.push(f('info', 'cjk-spacing', `${tight.length} 处中英文之间缺空格`))
  }

  // 裸 HTML。区分两类：
  //  - 带已知语义配色/class 的 → error，notes-fix 能转成容器，不该还留着
  //  - 布局或教学示例 HTML（designftw 在讲 Web 设计，正文里就有 <div id="container">）
  //    → info，这些是内容本身，不能动
  const SEMANTIC_DIV = /#4a90d9|#3b82f6|#3399ff|#e05c5c|#d9534f|#ef4444|#e53935|#5cb85c|#3fa34d|#43a047|#16a34a|class="(?:definition|corollary|example)"/i
  const divs = [...body.matchAll(/<div\b[^>]*>/gi)]
  const semantic = divs.filter((m) => SEMANTIC_DIV.test(m[0]))
  if (semantic.length) {
    out.push(f('error', 'raw-html-div', `${semantic.length} 处语义 <div>，应改用 ::: 容器`))
  }
  if (divs.length - semantic.length) {
    out.push(f('info', 'layout-html', `${divs.length - semantic.length} 处布局/示例 <div>（不自动转换）`))
  }

  // 图片 alt
  for (const m of body.matchAll(/!\[([^\]]*)\]\(/g)) {
    const alt = m[1].trim()
    if (!alt || /^(img|image|截屏|image-\d+|IMG_\d+)/i.test(alt) || /^\S+$/.test(alt) && alt.length < 4) {
      out.push(f('warning', 'image-alt', `图片 alt 无信息：![${alt}]`))
    }
  }

  // 半角括号术语
  const halfParen = [...prose.matchAll(/[一-龥]\([A-Za-z][^)]*\)/g)]
  if (halfParen.length) {
    out.push(f('info', 'half-paren', `${halfParen.length} 处术语括注用了半角括号`))
  }

  // TODO
  for (const m of prose.matchAll(/TODO|待补充|尚未补齐/g)) {
    out.push(f('info', 'todo', `含 ${m[0]}，status 应为 draft`))
  }

  // 术语一致性。首现括注「缓存（Cache）」和代码里的标识符都是正常的，
  // 所以先把括注和行内代码摘掉，再看剩下的正文里是否两种形态都在当术语用。
  const termProse = prose
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/`[^`\n]*`/g, '')
  for (const t of VOCAB) {
    const zhHits = (termProse.match(new RegExp(t.canonical, 'g')) ?? []).length
    const enHits = (termProse.match(new RegExp(`\\b(?:${t.en})\\b`, 'g')) ?? []).length
    if (zhHits >= 2 && enHits >= 2) {
      out.push(f('info', 'term-mixed',
        `「${t.canonical}」中文 ${zhHits} 次 / 英文 ${enHits} 次混用，首现括注后应统一用中文`))
    }
    for (const a of t.aliases) {
      if (termProse.includes(a) && zhHits > 0) {
        out.push(f('info', 'term-alias', `「${a}」应统一写作「${t.canonical}」`))
      }
    }
  }

  return { rel, meta, findings: out }
}

// ── main ───────────────────────────────────────────────────────────

const docsDir = path.resolve(DOCS_DIR)
const files = targets.length
  ? [...new Set((await Promise.all(targets.map(async (target) => {
      const resolved = path.resolve(target)
      const stat = await fs.stat(resolved)
      return stat.isDirectory() ? walkNotes(resolved) : [resolved]
    }))).flat())].sort()
  : await walkNotes(docsDir)

const results = []
for (const file of files) results.push(await lintFile(file, docsDir))

const levelFilter = flags.level ? new Set(String(flags.level).split(',')) : null
const counts = { error: 0, warning: 0, info: 0 }
const byRule = new Map()
const filesByRule = new Map()

for (const r of results) {
  for (const fd of r.findings) {
    counts[fd.level]++
    byRule.set(fd.rule, (byRule.get(fd.rule) ?? 0) + 1)
    if (!filesByRule.has(fd.rule)) filesByRule.set(fd.rule, new Set())
    filesByRule.get(fd.rule).add(r.rel)
  }
}

if (!flags.summary) {
  const RANK = { error: 0, warning: 1, info: 2 }
  const shown = results
    .map((r) => ({ ...r, findings: r.findings.filter((fd) => !levelFilter || levelFilter.has(fd.level)) }))
    .filter((r) => r.findings.length)
    // error 最多的排前面 —— 先修伤害最大的
    .sort((a, b) =>
      b.findings.filter((x) => x.level === 'error').length -
      a.findings.filter((x) => x.level === 'error').length)

  for (const r of shown) {
    console.log(`\n${C.bold(r.rel)} ${C.gray(r.meta.inferredType ?? '-')}`)
    for (const fd of r.findings.sort((a, b) => RANK[a.level] - RANK[b.level])) {
      const tag = fd.level === 'error' ? C.red('error') : fd.level === 'warning' ? C.yellow(' warn') : C.gray(' info')
      const loc = fd.line ? C.gray(`:${fd.line}`) : ''
      console.log(`  ${tag} ${C.cyan(fd.rule)}${loc} ${fd.msg}`)
    }
  }
}

console.log(`\n${C.bold('规则命中统计')}（文件数 / 次数）`)
const RULE_LEVEL = new Map()
for (const r of results) for (const fd of r.findings) RULE_LEVEL.set(fd.rule, fd.level)
const rows = [...byRule.entries()].sort((a, b) => filesByRule.get(b[0]).size - filesByRule.get(a[0]).size)
for (const [rule, n] of rows) {
  const lv = RULE_LEVEL.get(rule)
  const tag = lv === 'error' ? C.red('E') : lv === 'warning' ? C.yellow('W') : C.gray('I')
  console.log(`  ${tag} ${rule.padEnd(20)} ${String(filesByRule.get(rule).size).padStart(4)} 文件  ${String(n).padStart(6)} 次`)
}

console.log(
  `\n${files.length} 个文件： ` +
  `${C.red(counts.error + ' error')}  ${C.yellow(counts.warning + ' warning')}  ${C.gray(counts.info + ' info')}`,
)

if (flags['max-errors'] !== undefined && counts.error > Number(flags['max-errors'])) {
  console.error(C.red(`\nerror 数 ${counts.error} 超过基线 ${flags['max-errors']}`))
  process.exit(1)
}
