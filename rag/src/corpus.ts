import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export interface SourceDoc {
  /** 相对 docs/ 的源码路径，如 zh/computer_sys/os/lec5.md */
  path: string
  /** 站点真实 URL，如 /zh/os/lec5（已应用 config.mts 的 rewrites） */
  url: string
  lang: string
  /** config.mts 里的分类段，如 computer_sys */
  category: string
  /** 课程目录名，如 os */
  courseSlug: string
  /** 课程可读名，取自课程 index.md 的首个 H1，如 6.1810 操作系统工程 */
  course: string
  title: string
  /** NOTESTYLE.md 的四类骨架：theory | system | source | design */
  kind: string
  /** frontmatter 里的概念词，人工填 */
  tags: string[]
  /** complete | draft | stub。stub 不进检索库 */
  status: string
  /** 二级标题拼接，给学习路径生成器看文章结构 */
  outline: string
  body: string
  chars: number
  fileHash: string
}

/**
 * 复刻 VitePress（@mdit-vue/shared）的标题 slugify，用来生成 #锚点。
 *
 * 规则是拿 dist/ 里已构建的 HTML 反推并逐条验证过的：
 *   `## 页面管理`              -> 页面管理
 *   `### 与 L1，L2缓存的关系`   -> 与-l1-l2缓存的关系   （NFKD 把全角，变成半角,）
 *   `# Lec 5 虚拟内存 & 页表`   -> lec-5-虚拟内存-页表
 *   `### 0. riscv.h 地址与 PTE` -> _0-riscv-h-地址与-pte （数字开头补下划线）
 */
export function slugifyHeading(str: string): string {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // 组合附加符号
    .replace(/[\u0000-\u001f]/g, '') // 控制字符
    .replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()
}

/**
 * 去掉围栏代码块。
 *
 * 必须先做这一步再找标题：笔记里大量 shell/python 代码块含有 `# 注释` 行，
 * 不剥离的话会被当成 Markdown 标题，既污染锚点也会切出垃圾 chunk。
 * 用等长空行替换，保证行号不偏移。
 */
export function stripCodeFences(body: string): string {
  const lines = body.split('\n')
  for (const [a, b] of fenceRanges(body)) {
    // 用等长空格而不是空串，保证字符偏移不变 —— extractHeadings 返回的
    // index 要拿回原文去切 section
    for (let i = a; i <= b; i++) lines[i] = ' '.repeat(lines[i]!.length)
  }
  return lines.join('\n')
}

/**
 * 围栏行。允许前面带列表标记和缩进：笔记里有 `- ```sql` 这种写法，
 * 只认行首的正则会漏掉它的开围栏、却认得缩进的闭围栏，一旦奇偶性错位，
 * 整个代码块就不会被剥掉，块里的 `# 注释` 会被当成标题切出垃圾 chunk。
 */
const FENCE_RE = /^([ \t]*(?:[-*+]|\d+[.)])?[ \t]*)(`{3,}|~{3,})(.*)$/

/** 代码块的行号区间 [起, 止]（含两端，0-based） */
function fenceRanges(body: string): Array<[number, number]> {
  const lines = body.split('\n')
  const out: Array<[number, number]> = []
  let open = -1
  let marker = ''
  let len = 0
  for (let i = 0; i < lines.length; i++) {
    const m = FENCE_RE.exec(lines[i]!)
    if (!m) continue
    if (open === -1) {
      open = i
      marker = m[2]![0]!
      len = m[2]!.length
    } else if (m[2]![0] === marker && m[2]!.length >= len) {
      out.push([open, i])
      open = -1
    }
  }
  if (open !== -1) out.push([open, lines.length - 1]) // 未闭合，算到文件尾
  return out
}

export interface Heading {
  level: number
  text: string
  /** 已按 VitePress 规则去重的锚点 */
  slug: string
  /** 在 body 中的字符偏移 */
  index: number
}

/** 标题里的行内 markdown 修饰不进 id，渲染后 id 基于纯文本。 */
export function plainHeading(h: string): string {
  return h
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

/**
 * 抽取标题并生成锚点。
 *
 * VitePress（markdown-it-anchor）遇到同名标题会追加 -1、-2 保证 id 唯一，
 * 这里必须复刻，否则同名小节的锚点会全部指向第一个。
 */
export function extractHeadings(body: string): Heading[] {
  const clean = stripCodeFences(body)
  const seen = new Map<string, number>()
  const out: Heading[] = []

  for (const m of clean.matchAll(/^(#{1,6})\s+(.+)$/gm)) {
    const text = plainHeading(m[2]!)
    const base = slugifyHeading(text)
    if (!base) continue

    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    out.push({
      level: m[1]!.length,
      text,
      slug: n === 0 ? base : `${base}-${n}`,
      index: m.index!,
    })
  }
  return out
}

/**
 * 把源码路径映射成站点 URL。
 *
 * config.mts 里的 rewrites 规则是：
 *   "zh/:pkg/:subject/(.*)" -> "zh/:subject/(.*)"
 * 也就是 zh 之后第一段（分类）会被吃掉，且只在层级 >= 4 段时生效。
 * en/ 没有 rewrite 规则，原样映射。
 *
 * 已用 docs/.vitepress/dist 的实际产物验证：
 *   zh/computer_sys/os/lec5.md   -> /zh/os/lec5
 *   zh/opensource/postgresql/index.md -> /zh/postgresql/
 *   zh/tcs/index.md              -> /zh/tcs/   （只有 3 段，不触发 rewrite）
 */
export function mapUrl(relPath: string): string {
  const noExt = relPath.replace(/\.md$/, '')
  let segments = noExt.split('/')

  // 只有 zh 命名空间、且深度足够（zh/分类/课程/文件）时才吃掉分类段。
  if (segments[0] === 'zh' && segments.length >= 4) {
    segments = [segments[0], ...segments.slice(2)]
  }

  // index 收敛成目录 URL，跟 VitePress 的产出一致。
  if (segments.at(-1) === 'index') {
    segments = segments.slice(0, -1)
    return `/${segments.join('/')}/`
  }
  return `/${segments.join('/')}`
}

/** 只有当 --- 出现在第一行时才算 frontmatter；文中的 --- 是分隔线，不能误吃。 */
function stripFrontmatter(raw: string): { body: string; frontmatter: string } {
  if (!raw.startsWith('---\n')) return { body: raw, frontmatter: '' }
  const end = raw.indexOf('\n---', 4)
  if (end === -1) return { body: raw, frontmatter: '' }
  const after = raw.indexOf('\n', end + 1)
  return {
    frontmatter: raw.slice(4, end),
    body: after === -1 ? '' : raw.slice(after + 1),
  }
}

function frontmatterField(fm: string, key: string): string | undefined {
  const m = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
  return m?.[1]?.trim().replace(/^["']|["']$/g, '')
}

/**
 * 行内数组字段，如 `tags: [页表, 三级页表, TLB]`。
 * 朴素的 frontmatterField 会把整个 "[页表, 三级页表, TLB]" 当成一个裸字符串。
 */
function frontmatterList(fm: string, key: string): string[] {
  const raw = frontmatterField(fm, key)
  if (!raw) return []
  const inner = raw.startsWith('[') && raw.endsWith(']') ? raw.slice(1, -1) : raw
  return inner
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean)
}

/** 取第一个 H1 当标题 —— 笔记里会出现多个 H1（如中途的「# 参考资料」），不能取最后一个。 */
function firstH1(body: string): string | undefined {
  const m = body.match(/^#\s+(.+)$/m)
  return m?.[1]?.trim()
}

async function readCourseName(dir: string, fallback: string): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(dir, 'index.md'), 'utf8')
    const { body, frontmatter } = stripFrontmatter(raw)
    return firstH1(body) ?? frontmatterField(frontmatter, 'title') ?? fallback
  } catch {
    return fallback
  }
}

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'public' || e.name.startsWith('.')) continue
      await walk(full, out)
    } else if (e.isFile() && e.name.endsWith('.md')) {
      out.push(full)
    }
  }
  return out
}

export async function collectDocuments(docsDir: string): Promise<SourceDoc[]> {
  const roots = ['zh', 'en']
  const courseNameCache = new Map<string, string>()
  const docs: SourceDoc[] = []

  for (const root of roots) {
    const rootDir = path.join(docsDir, root)
    let files: string[]
    try {
      files = await walk(rootDir)
    } catch {
      continue // en/ 可能还没内容
    }

    for (const file of files) {
      const relPath = path.relative(docsDir, file).split(path.sep).join('/')
      const raw = await fs.readFile(file, 'utf8')
      const { body, frontmatter } = stripFrontmatter(raw)

      // 首页是 layout: home 的营销页，没有检索价值。
      if (frontmatterField(frontmatter, 'layout') === 'home') continue

      // 占位页不进检索库。以前是按 body 长度粗判（< 200 字符），会两头误伤：
      // 短而写完的笔记被丢掉，300 字的占位页反而进库。现在按 NOTESTYLE.md
      // 的 status 字段显式判断，没有 frontmatter 的才退回长度启发式。
      const status = frontmatterField(frontmatter, 'status') ?? ''
      if (status === 'stub') continue
      if (!status && body.trim().length < 200) continue

      const segments = relPath.replace(/\.md$/, '').split('/')
      const lang = segments[0] ?? 'zh'
      // zh/分类/课程/文件 -> category=分类, courseSlug=课程
      // zh/分类/index     -> category=分类, courseSlug=分类
      const category = segments.length >= 3 ? (segments[1] ?? '') : ''
      const courseSlug =
        segments.length >= 4 ? (segments[2] ?? '') : (segments[1] ?? '')

      const courseDir = path.join(docsDir, lang, category, courseSlug)
      let course = courseNameCache.get(courseDir)
      if (course === undefined) {
        course = await readCourseName(courseDir, courseSlug)
        courseNameCache.set(courseDir, course)
      }

      const title =
        firstH1(body) ??
        frontmatterField(frontmatter, 'title') ??
        (segments.at(-1) as string)

      const outline = [...body.matchAll(/^##\s+(.+)$/gm)]
        .map((m) => m[1]!.trim())
        .slice(0, 30)
        .join(' / ')

      docs.push({
        path: relPath,
        url: mapUrl(relPath),
        lang,
        category,
        courseSlug,
        course,
        title,
        kind: frontmatterField(frontmatter, 'kind') ?? '',
        tags: frontmatterList(frontmatter, 'tags'),
        status: status || 'complete',
        outline,
        body,
        chars: body.length,
        fileHash: crypto.createHash('sha1').update(raw).digest('hex'),
      })
    }
  }

  return docs.sort((a, b) => a.path.localeCompare(b.path))
}
