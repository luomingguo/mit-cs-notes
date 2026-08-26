#!/usr/bin/env node
// 按 NOTESTYLE.md 的页面职责生成一篇新笔记。
//
//   npm run notes:new -- --course os --lecture 21 --title "网络栈"
//   npm run notes:new -- --course cca --type concept --slug cache-locality --title "缓存局部性"
//   npm run notes:new -- --discipline psy --course intro --lecture 2 --title "研究方法"

import fs from 'node:fs/promises'
import path from 'node:path'
import { DOCS_DIR, NOTE_TYPES, C, stringifyFrontmatter, courseName } from './notes-lib.mjs'

const argv = process.argv.slice(2)
const flags = {}
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i]
  if (!arg.startsWith('--')) continue
  const [rawKey, inline] = arg.replace(/^--/, '').split('=', 2)
  if (inline !== undefined) flags[rawKey] = inline
  else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[rawKey] = argv[++i]
  else flags[rawKey] = true
}

async function findCourses(docsDir, discipline, wantedSlug) {
  const disciplineDir = path.join(docsDir, 'zh', discipline)
  const found = []
  let categories = []
  try {
    categories = await fs.readdir(disciplineDir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const category of categories) {
    if (!category.isDirectory() || category.name.startsWith('.')) continue
    if (flags.category && category.name !== flags.category) continue
    const candidate = path.join(disciplineDir, category.name, wantedSlug)
    try {
      if ((await fs.stat(candidate)).isDirectory()) found.push({ category: category.name, dir: candidate })
    } catch { /* 不是这门课 */ }
  }
  return found
}

if (!flags.course) {
  console.error('用法: npm run notes:new -- --course <课程目录名> (--lecture <N> | --type <类型> --slug <文件名>) [--discipline cs] [--category arch] [--title 标题]')
  process.exit(1)
}

const docsDir = path.resolve(DOCS_DIR)
const discipline = String(flags.discipline ?? 'cs')
const matches = await findCourses(docsDir, discipline, String(flags.course))
if (matches.length === 0) {
  console.error(C.red(`找不到课程目录 docs/zh/${discipline}/*/${flags.course}`))
  process.exit(1)
}
if (matches.length > 1) {
  console.error(C.red(`课程目录名不唯一，请加 --category：${matches.map((m) => m.category).join(', ')}`))
  process.exit(1)
}

const { category, dir: courseDir } = matches[0]
const lecture = flags.lecture === undefined ? undefined : Number(flags.lecture)
if (lecture !== undefined && (!Number.isInteger(lecture) || lecture <= 0)) {
  console.error(C.red('--lecture 必须是正整数'))
  process.exit(1)
}

const noteType = String(flags.type ?? (lecture ? 'lecture' : ''))
if (!noteType || !NOTE_TYPES.has(noteType) || noteType === 'course') {
  console.error(C.red('--type 必须是 lecture|paper|concept|assignment|project；课程页请直接维护 index.md'))
  process.exit(1)
}
if (lecture && noteType !== 'lecture') {
  console.error(C.red('--lecture 只能和 type=lecture 一起使用'))
  process.exit(1)
}

const basename = String(flags.slug ?? (lecture ? `lec${lecture}` : ''))
if (!basename || !/^[a-z0-9][a-z0-9-]*$/i.test(basename)) {
  console.error(C.red('需要 --slug <kebab-case 文件名>，或为 lecture 提供 --lecture <N>'))
  process.exit(1)
}

const targetDir = noteType === 'lecture' ? courseDir : path.join(courseDir, noteType)
const file = path.join(targetDir, `${basename}.md`)
try {
  await fs.access(file)
  console.error(C.red(`${path.relative(process.cwd(), file)} 已存在，不覆盖`))
  process.exit(1)
} catch { /* 不存在，正常 */ }

const course = await courseName(docsDir, 'zh', discipline, category, String(flags.course), String(flags.course))
const title = String(flags.title ?? '待填标题')
const en = flags.en ? `（*${flags.en}*）` : ''
const fm = {
  title,
  type: noteType,
  ...(lecture ? { lecture } : {}),
  tags: [],
  status: 'draft',
  ...(flags.source ? { source: String(flags.source) } : {}),
}

const bodies = {
  lecture: `## 本讲要解决的问题

（说明动机，以及它承接或解锁的知识。）

## 核心机制

（解释概念、过程与因果关系。）

## 例子与实现

（用例子、公式、代码或图验证机制。）

## 权衡与边界

（什么时候有效，代价是什么，容易在哪里误用。）`,
  paper: `## 研究问题与主张

（论文试图解决什么，核心主张是什么。）

## 方法与证据

（方法、实验设置和最关键证据。）

## 局限与批判

（证据没有覆盖什么，哪些结论不能外推。）

## 与现有知识的连接

（链接到相关 lecture、concept、paper 或 project。）`,
  concept: `## 定义与边界

（给出可独立理解的定义，并说明不属于它的情况。）

## 直觉与机制

（解释为什么成立、如何运作。）

## 例子与反例

（至少各给一个。）

## 关系

（前置概念、相邻概念和应用场景。）`,
  assignment: `## 任务与约束

（问题、输入输出、限制条件和完成标准。）

## 解法

（推导与关键实现。）

## 验证

（测试、边界情况和结果。）

## 复盘

（错误尝试、取舍与可迁移经验。）`,
  project: `## 问题与目标

（用户问题、范围和成功标准。）

## 架构与关键决策

（组件关系、数据流和取舍。）

## 实现

（关键模块与接口。）

## 验证与结果

（测试、指标、限制和后续工作。）`,
}

const h1 = lecture ? `# Lec ${lecture} ${title}${en}` : `# ${title}${en}`
const crumb = `> ${course}${lecture ? ` · Lecture ${lecture}` : ''}`
const content = `${stringifyFrontmatter(fm)}${h1}

${crumb}

## TL;DR

- （这篇笔记解决的核心问题。）
- （最重要的机制、主张或结果。）
- （适用边界，以及它连接到什么知识。）

${bodies[noteType]}

## 我的理解

::: insight
（写自己的判断：为什么这样设计、它与什么概念相通，或原先的理解哪里错了。）
:::
`

await fs.mkdir(targetDir, { recursive: true })
await fs.writeFile(file, content, 'utf8')
console.log(`${C.green('已创建')} ${path.relative(process.cwd(), file)}  ${C.gray(`type=${noteType}`)}`)
console.log(C.gray('课程名与课号将从最近的课程 index.md 继承。'))
console.log(C.gray(`写完跑：npm run notes:lint -- ${path.relative(process.cwd(), file)}`))
