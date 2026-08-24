#!/usr/bin/env node
// 按 NOTESTYLE.md 的骨架生成一篇新笔记。
//
//   npm run notes:new -- --course os --lecture 21
//   npm run notes:new -- --course os --lecture 21 --title "网络栈" --en "Network Stack"
//   npm run notes:new -- --course postgresql --slug queries-05-nested-loop --title "嵌套循环连接"
//
// kind 从课程目录推导（notes-lib.mjs 的 KIND_BY_COURSE），也可以 --kind 覆盖。

import fs from 'node:fs/promises'
import path from 'node:path'
import { DOCS_DIR, KIND_BY_COURSE, C, stringifyFrontmatter, courseName } from './notes-lib.mjs'

const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

// --course os --lecture 21 这种写法里值会跟在后面，一并收进来
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--') && !argv[i].includes('=') && argv[i + 1] && !argv[i + 1].startsWith('--')) {
    flags[argv[i].replace(/^--/, '')] = argv[i + 1]
  }
}

if (!flags.course) {
  console.error('用法: npm run notes:new -- --course <课程目录名> --lecture <N> [--title 标题] [--en English]')
  console.error('\n可用课程：')
  for (const k of Object.keys(KIND_BY_COURSE)) console.error(`  ${k.split('/')[1].padEnd(34)} ${KIND_BY_COURSE[k]}`)
  process.exit(1)
}

const courseKey = Object.keys(KIND_BY_COURSE).find((k) => k.endsWith(`/${flags.course}`))
if (!courseKey) {
  console.error(C.red(`未知课程 "${flags.course}"，先在 tools/notes-lib.mjs 的 KIND_BY_COURSE 里登记`))
  process.exit(1)
}

const [category, slug] = courseKey.split('/')
const kind = flags.kind ?? KIND_BY_COURSE[courseKey]
const docsDir = path.resolve(DOCS_DIR)
const course = await courseName(docsDir, 'zh', category, slug, slug)
const courseId = course.match(/^(\d+[.\-][\dA-Za-z.]+)/)?.[1]

const title = flags.title ?? '待填标题'
const en = flags.en ? `（*${flags.en}*）` : ''
const lecture = flags.lecture ? Number(flags.lecture) : undefined
const basename = flags.slug ?? (lecture ? `lec${lecture}` : null)

if (!basename) {
  console.error(C.red('需要 --lecture <N> 或 --slug <文件名>'))
  process.exit(1)
}

const file = path.join(docsDir, 'zh', category, slug, `${basename}.md`)
try {
  await fs.access(file)
  console.error(C.red(`${path.relative(process.cwd(), file)} 已存在，不覆盖`))
  process.exit(1)
} catch { /* 不存在，正常 */ }

const fm = { title, course, ...(courseId ? { course_id: courseId } : {}), ...(lecture ? { lecture } : {}), kind, tags: [], status: 'draft' }

const h1 = lecture ? `# Lec ${lecture} ${title}${en}` : `# ${title}${en}`
const crumb = `> ${course}${lecture ? ` · Lecture ${lecture}` : ''} · 关键词：（填 4–6 个概念词）`

// NOTESTYLE.md 第七节的四类骨架
const BODY = {
  theory: `## 0. 问题

（要解决的是什么？给出形式化定义。）

## 1. 构造

（方案本身。）

## 2. 关键性质

::: definition
（安全性 / 复杂度 / 正确性。）
:::

## 3. 工程视角

（真实系统里怎么用，有什么坑。）
`,
  system: `## 本讲定位

（承上启下。用一句具体的问题立住动机，别写"本讲介绍 X"。）

## 1. 机制

（这个东西是什么、解决什么。）

## 2. 实现走读

（源码或伪码。每段代码前要有一句散文说明它在做什么。）

## 3. 权衡与代价

（为什么不用另一种方案。）
`,
  source: `## 引言

（显式承接上一篇 + 预告本篇。）

## （主体，按递进拆小节）

## 代价与关键因素
`,
  design: `## 场景

（什么情况下会遇到这个问题。）

## 原则

（抽象出的设计原则。）

## 案例

## 反例与坑

（这一节往往比正面案例更有价值。）
`,
}

const content = `${stringifyFrontmatter(fm)}${h1}

${crumb}

${BODY[kind] ?? BODY.system}
## 我的理解

::: insight
（用自己的话写。三选一：为什么这个设计是这样 / 和哪门课的哪个概念是一回事 / 一开始理解错在哪。
这一节是这篇笔记相对讲义的唯一增量，不写就等于没写。）
:::

## 本讲小结：（补主题词）

-
`

await fs.writeFile(file, content, 'utf8')
console.log(`${C.green('已创建')} ${path.relative(process.cwd(), file)}  ${C.gray(`kind=${kind}`)}`)
console.log(C.gray(`写完跑：npm run notes:lint -- ${path.relative(process.cwd(), file)}`))
