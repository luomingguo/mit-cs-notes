#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2)
const json = args.includes('--json')
const maxArg = args.find((arg) => arg.startsWith('--max='))
const maxIssues = Math.max(1, Number(maxArg?.slice('--max='.length) ?? 40) || 40)
const positional = args.filter((arg) => !arg.startsWith('--'))

if (positional.length !== 1) {
  console.error('用法: audit-course.mjs <course-directory> [--json] [--max=40]')
  process.exit(2)
}

const courseDir = path.resolve(positional[0])

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function findRepoRoot(start) {
  let current = start
  while (true) {
    if (
      await exists(path.join(current, 'NOTESTYLE.md')) &&
      await exists(path.join(current, 'tools', 'notes-lib.mjs'))
    ) return current
    const parent = path.dirname(current)
    if (parent === current) return null
    current = parent
  }
}

async function walkMarkdown(dir, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkMarkdown(full, out)
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full)
  }
  return out.sort()
}

function issue(severity, rule, file, message) {
  return { severity, rule, file, message }
}

function expectedType(localPath) {
  const parts = localPath.split('/')
  if (parts.length === 1 && parts[0] === 'index.md') return 'course'
  if (parts.length === 1) {
    const basename = parts[0].replace(/\.md$/i, '')
    if (/^lab\d*$/i.test(basename)) return 'assignment'
    if (/paper$/i.test(basename)) return 'paper'
    return 'lecture'
  }
  if (['paper', 'concept', 'assignment', 'project'].includes(parts[0])) return parts[0]
  return null
}

let directoryStat
try {
  directoryStat = await fs.stat(courseDir)
} catch {
  console.error(`课程目录不存在：${courseDir}`)
  process.exit(2)
}
if (!directoryStat.isDirectory()) {
  console.error(`输入不是目录：${courseDir}`)
  process.exit(2)
}

const repoRoot = await findRepoRoot(courseDir)
if (!repoRoot) {
  console.error(`无法从课程目录定位包含 NOTESTYLE.md 的仓库：${courseDir}`)
  process.exit(2)
}

const docsDir = path.join(repoRoot, 'docs')
const courseRel = path.relative(docsDir, courseDir).split(path.sep).join('/')
const courseSegments = courseRel.split('/')
const issues = []

if (
  courseRel.startsWith('../') ||
  courseSegments.length !== 4 ||
  courseSegments[0] !== 'zh'
) {
  issues.push(issue(
    'error',
    'course-path',
    '.',
    '课程目录必须是 docs/zh/<discipline>/<category>/<course> 四段结构',
  ))
}

const notesLibUrl = pathToFileURL(path.join(repoRoot, 'tools', 'notes-lib.mjs')).href
const {
  TAG_RE,
  NOTE_TYPES,
  extractHeadings,
  sections,
  splitFrontmatter,
} = await import(notesLibUrl)

const files = await walkMarkdown(courseDir)
if (files.length === 0) issues.push(issue('error', 'no-markdown', '.', '课程目录中没有 Markdown 文件'))
if (!await exists(path.join(courseDir, 'index.md'))) {
  issues.push(issue('error', 'no-course-index', '.', '课程根目录缺 index.md'))
}

const inventory = {
  course: 0,
  lecture: 0,
  paper: 0,
  concept: 0,
  assignment: 0,
  project: 0,
  unknown: 0,
  stub: 0,
}
const coverage = {
  pages: files.length,
  nonStub: 0,
  explicitType: 0,
  validTags: 0,
  tldr: 0,
  childPages: 0,
  inheritedCourseMetadata: 0,
}

for (const file of files) {
  const local = path.relative(courseDir, file).split(path.sep).join('/')
  const expected = expectedType(local)
  if (expected) inventory[expected]++
  else {
    inventory.unknown++
    issues.push(issue('error', 'unexpected-location', local, '文件不在课程根目录或规定的类型子目录中'))
  }

  const localParts = local.split('/')
  if (localParts.length > 2) {
    issues.push(issue('error', 'nested-content', local, '类型目录下不应继续增加知识分类层级'))
  }

  const raw = await fs.readFile(file, 'utf8')
  const { fm, body } = splitFrontmatter(raw)
  if (!fm) {
    issues.push(issue('error', 'no-frontmatter', local, '缺 frontmatter'))
    continue
  }

  const isStub = fm.status === 'stub'
  if (isStub) inventory.stub++
  else coverage.nonStub++

  if (!fm.title) issues.push(issue('required', 'missing-title', local, '缺 title'))
  if (!['complete', 'draft', 'stub'].includes(fm.status)) {
    issues.push(issue('error', 'bad-status', local, `status=${fm.status ?? ''} 非法`))
  }

  if (fm.type && NOTE_TYPES.has(fm.type) && fm.type === expected) coverage.explicitType++
  else if (!fm.type) issues.push(issue('required', 'no-type', local, `缺 type；路径职责应为 ${expected ?? '未知'}`))
  else if (!NOTE_TYPES.has(fm.type)) issues.push(issue('error', 'bad-type', local, `type=${fm.type} 非法`))
  else issues.push(issue('error', 'type-path-mismatch', local, `type=${fm.type}，路径职责为 ${expected}`))

  const tags = Array.isArray(fm.tags) ? fm.tags : []
  const tagsValid = tags.length >= 2 && tags.length <= 7 && new Set(tags).size === tags.length && tags.every((tag) => TAG_RE.test(tag))
  if (tagsValid) coverage.validTags++
  else if (!Array.isArray(fm.tags) || tags.length === 0) {
    issues.push(issue('required', 'no-tags', local, '缺 2–5 个小写 kebab-case 概念 tags'))
  } else if (tags.length > 7) {
    issues.push(issue('error', 'too-many-tags', local, `${tags.length} 个 tags，超过上限 7`))
  } else {
    issues.push(issue('required', 'bad-tags', local, 'tags 数量、格式或唯一性不满足规范'))
  }

  if (expected === 'course') {
    if (!fm.course) issues.push(issue('required', 'course-metadata', local, '课程 index.md 缺 course'))
  } else if (expected) {
    coverage.childPages++
    if (!fm.course && !fm.course_id) coverage.inheritedCourseMetadata++
    else issues.push(issue('required', 'repeated-course-metadata', local, '子页应从课程 index.md 继承 course/course_id'))
  }

  if (!isStub) {
    const h2s = extractHeadings(body).filter((heading) => heading.level === 2)
    const exact = h2s.filter((heading) => heading.text === 'TL;DR')
    if (exact.length === 1 && h2s[0] === exact[0]) {
      const tldr = sections(body).find((section) => section.level === 2 && section.text === 'TL;DR')
      const bullets = tldr ? (tldr.own.match(/^\s*[-*+]\s+\S/gm) ?? []).length : 0
      if (bullets >= 3 && bullets <= 5 && (tldr?.ownLen ?? 0) <= 700) coverage.tldr++
      else issues.push(issue('required', 'bad-tldr-content', local, `TL;DR 应有 3–5 条要点且不超过 700 字符，当前 ${bullets} 条`))
    } else if (exact.length > 1) {
      issues.push(issue('error', 'multi-tldr', local, `出现 ${exact.length} 个 ## TL;DR`))
    } else {
      const alias = h2s.find((heading) => heading.text.toLowerCase() === 'tl;dr')
      issues.push(issue('required', alias ? 'bad-tldr-heading' : 'no-tldr', local, alias ? '标题必须精确写成 ## TL;DR' : '缺 ## TL;DR'))
    }
  }

  if (fm.status === 'complete' && expected !== 'course' && !/^##\s*我的理解\s*$/m.test(body) && !/:::\s*insight\b/.test(body)) {
    issues.push(issue('recommendation', 'no-insight', local, 'complete 页面缺作者自己的理解或判断'))
  }
}

const countsBySeverity = { error: 0, required: 0, recommendation: 0 }
const countsByRule = {}
for (const item of issues) {
  countsBySeverity[item.severity]++
  countsByRule[item.rule] = (countsByRule[item.rule] ?? 0) + 1
}

const result = countsBySeverity.error > 0
  ? '不合格'
  : countsBySeverity.required > 0
    ? '待迁移'
    : '合格'

const report = {
  result,
  courseDir,
  repoRoot,
  inventory,
  coverage,
  countsBySeverity,
  countsByRule,
  issues: issues.slice(0, maxIssues),
  omittedIssues: Math.max(0, issues.length - maxIssues),
}

if (json) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(`${courseDir}：${result}`)
  console.log(`页面 ${coverage.pages}；非 stub ${coverage.nonStub}；stub ${inventory.stub}`)
  console.log(`类型 ${coverage.explicitType}/${coverage.pages}；tags ${coverage.validTags}/${coverage.pages}；TL;DR ${coverage.tldr}/${coverage.nonStub}；继承 ${coverage.inheritedCourseMetadata}/${coverage.childPages}`)
  console.log(`error ${countsBySeverity.error}；required ${countsBySeverity.required}；recommendation ${countsBySeverity.recommendation}`)
  for (const item of report.issues) console.log(`- [${item.severity}] ${item.rule} ${item.file}: ${item.message}`)
  if (report.omittedIssues) console.log(`- 另有 ${report.omittedIssues} 条未显示；使用 --max=<N> 调整。`)
}

process.exit(result === '合格' ? 0 : result === '待迁移' ? 1 : 2)
