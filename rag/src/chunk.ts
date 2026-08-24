import crypto from 'node:crypto'
import { extractHeadings, type SourceDoc } from './corpus.js'

export interface Chunk {
  id: string
  docPath: string
  url: string
  /** 小节锚点，拼成 /zh/os/lec5#页表项 可直达 */
  anchor: string
  lang: string
  course: string
  docTitle: string
  /** 面包屑：页面管理 > PTE中的标志位含义 */
  heading: string
  ordinal: number
  content: string
  contentHash: string
  /**
   * 这一块里出现的最高优先级语义容器，见 NOTESTYLE.md 第四节。
   * insight（作者本人的判断）优先级最高 —— 「这个人怎么看」类的提问要能命中它。
   */
  blockKind: BlockKind
}

export type BlockKind = 'normal' | 'insight' | 'pitfall' | 'definition' | 'theorem' | 'example'

/**
 * 容器名 → 送进嵌入向量的中文前缀。
 *
 * 必须和 docs/.vitepress/config.mts 的 SEMANTIC_CONTAINERS 保持同名。
 * 以前 cleanForEmbedding 把承载这些语义的 <div> 剥成空格，「这是定义」还是
 * 「这是作者的判断」在向量里完全看不出来；现在把它变成正文的一部分。
 */
const CONTAINER_LABEL: Record<string, string> = {
  definition: '定义',
  theorem: '定理',
  example: '例',
  insight: '我的理解',
  pitfall: '常见误区',
}

/** 越靠前优先级越高：一块里同时有定义和「我的理解」时，按「我的理解」归类。 */
const BLOCK_KIND_RANK: BlockKind[] = ['insight', 'pitfall', 'theorem', 'definition', 'example']

function detectBlockKind(text: string): BlockKind {
  for (const k of BLOCK_KIND_RANK) {
    // 容器带标题时 cleanForEmbedding 产出的是「我的理解（关键结论：…）：」，
    // 不能只找裸的「我的理解：」—— 库里 13 个 insight 块全都带标题，
    // 用 includes 一个都认不出来。
    if (new RegExp(`${CONTAINER_LABEL[k]}(?:（[^\\n]*?）)?：`).test(text)) return k
  }
  return 'normal'
}

/**
 * 无信息量的小节标题。命中时面包屑要补上文档标题，
 * 否则 52 个文件的 `## 小结` 会生成一模一样的上下文头，向量空间里根本分不开。
 */
const VAGUE_HEADING = /^(?:\d+[.、]\s*|[一二三四五六七八九十]+[、.]\s*)?(?:本讲小结|本讲导览|小结|总结|总览|摘要|大纲|引言|介绍|概述|背景|前言|Outline|Summary|Overview|Introduction|FQA|FAQ)\s*$/i

/** 目标块长（中文字符）。太大伤检索精度，太小丢上下文。 */
const TARGET = 700
const MAX = 1300
/** 相邻块重叠，避免答案正好被切在边界上 */
const OVERLAP = 150
/** 小于这个长度的碎片并入上一块，不单独成块 */
const MIN = 120

/**
 * 把 markdown 正文清成适合嵌入的纯文本。
 *
 * 保留代码块内容 —— 这批笔记里有大量 xv6 / PostgreSQL 源码走读，
 * 代码本身就是读者要找的东西，剥掉会丢掉很大一块检索价值。
 */
function cleanForEmbedding(md: string): string {
  return (
    md
      // HTML 注释
      .replace(/<!--[\s\S]*?-->/g, '')
      // 语义容器：`::: insight` → 「我的理解：」，`::: definition 完美安全` →
      // 「定义（完美安全）：」。容器名本身是高价值的检索信号，不能像普通标记
      // 一样剥掉 —— 读者问「作者怎么看」时，靠的就是这个前缀能被召回。
      .replace(/^:::[ \t]*([a-z]+)[ \t]*(.*)$/gim, (line, name: string, title: string) => {
        const label = CONTAINER_LABEL[name.toLowerCase()]
        if (!label) return '' // VitePress 内置的 tip/warning/raw 等，直接去壳
        return title.trim() ? `${label}（${title.trim()}）：` : `${label}：`
      })
      // 容器闭合行
      .replace(/^:::[ \t]*$/gm, '')
      // 图片：整行丢掉（alt 多是 image-2026xxxx 这种自动名，没有语义）
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/<img\b[^>]*>/gi, '')
      // 保留 HTML 标签里的文字。笔记里的 <div style="border-left..."> 提示框
      // 装的是苏格拉底式提问（「页表有多大？」），是高价值内容，只能去壳留瓤。
      .replace(/<\/?(?:div|span|p|br|details|summary|b|strong|i|em|u|sub|sup|font|center)\b[^>]*>/gi, ' ')
      // 链接只留文字
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 参考链接式 [text][ref]
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
      // 表格分隔行没有信息量
      .replace(/^\s*\|[\s|:-]+\|\s*$/gm, '')
      // 强调符号。直接删标记，不做配对匹配 —— 笔记里大量
      // `**RAW（*Read After Write*，真依赖）**` 这种嵌套，配对正则的
      // [^*]* 跨不过内层斜体，结果外层的 ** 原样漏进嵌入文本。
      // 这里是给模型看的纯文本，星号有没有配对无所谓，删干净就行。
      // 行首的 `* ` 是无序列表，要留着。
      .replace(/\*\*/g, '')
      .replace(/(?<!^[ \t]*)\*(?!\s)/gm, '')
      .replace(/(?<=\S)\*/g, '')
      // 收敛空白。先把「只剩空格的行」清空 —— 删图片/标签后会留下这种行，
      // 不清掉的话下面的 \n{3,} 匹配不到，块里会残留大段空白。
      .replace(/[ \t]+/g, ' ')
      .replace(/^[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

/** 按段落切，尽量不从句子中间断开 */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** 段落本身就超长时，按中文句号等标点再切 */
function splitLongParagraph(p: string): string[] {
  if (p.length <= MAX) return [p]
  const sentences = p.split(/(?<=[。！？；\n])/)
  const out: string[] = []
  let buf = ''
  for (const s of sentences) {
    if (buf.length + s.length > MAX && buf) {
      out.push(buf.trim())
      buf = ''
    }
    buf += s
    // 单句就超长（罕见，多是代码或公式），硬切
    while (buf.length > MAX) {
      out.push(buf.slice(0, MAX))
      buf = buf.slice(MAX)
    }
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

/** 把段落打包成接近 TARGET 的块，块间带 OVERLAP 重叠 */
function packParagraphs(paragraphs: string[]): string[] {
  const pieces = paragraphs.flatMap(splitLongParagraph)
  const out: string[] = []
  let buf = ''

  for (const p of pieces) {
    if (buf && buf.length + p.length + 2 > TARGET) {
      out.push(buf.trim())
      // 用上一块尾部做重叠，保住跨块的上下文
      const tail = buf.slice(-OVERLAP)
      buf = tail.includes('\n') ? tail.slice(tail.indexOf('\n') + 1) : tail
      buf += '\n\n'
    }
    buf += p + '\n\n'
  }
  if (buf.trim()) out.push(buf.trim())

  // 末块太短就并回上一块，避免产生无意义的碎片
  if (out.length >= 2) {
    const last = out.at(-1)!
    if (last.length < MIN) {
      out.pop()
      out[out.length - 1] += '\n\n' + last
    }
  }
  return out
}

/**
 * 构造真正送去嵌入 / 重排的文本。
 *
 * 关键：给每块加上「课程 · 文档 · 小节」的上下文头。裸块常常是一段没有主语的
 * 描述（「它把虚拟地址的高 27 位拆成三级索引」），加上头之后模型才知道这是
 * 操作系统课的页表小节，中文检索召回质量差别很明显。
 *
 * ingest 和查询两侧必须用同一个函数，否则向量空间对不上。
 */
export function embedText(c: {
  course: string
  docTitle: string
  heading: string
  content: string
}): string {
  const crumb = [c.course, c.docTitle, c.heading].filter(Boolean).join(' · ')
  return `${crumb}\n\n${c.content}`
}

export function chunkDocument(doc: SourceDoc): Chunk[] {
  const headings = extractHeadings(doc.body)
  const chunks: Chunk[] = []
  let ordinal = 0

  // 按标题把正文切成小节；没有标题的文档整体算一节。
  interface Section {
    heading: string
    anchor: string
    text: string
  }
  const sections: Section[] = []

  if (headings.length === 0) {
    sections.push({ heading: '', anchor: '', text: doc.body })
  } else {
    // 首个标题之前的引言部分
    const preamble = doc.body.slice(0, headings[0]!.index).trim()
    if (preamble.length > MIN) {
      sections.push({ heading: '', anchor: '', text: preamble })
    }

    // 维护标题栈，生成 h2 > h3 这样的面包屑
    const stack: string[] = []
    for (let i = 0; i < headings.length; i++) {
      const h = headings[i]!
      const end = headings[i + 1]?.index ?? doc.body.length
      const text = doc.body.slice(h.index, end)

      stack.length = Math.max(0, h.level - 1)
      stack[h.level - 1] = h.text
      // H1 就是文档标题，面包屑里不重复它
      const crumb = stack.filter(Boolean).slice(1).join(' > ')

      // 「小结」「总览」这类标题没有区分度，面包屑要带上文档标题兜底，
      // 否则 embedText 拼出来的上下文头会在几十个文件之间完全一样。
      const bare = crumb || h.text
      const heading = VAGUE_HEADING.test(h.text) ? `${doc.title} > ${bare}` : bare

      sections.push({
        heading,
        anchor: h.slug,
        // 去掉标题行本身，标题已经进了 heading 字段和上下文头
        text: text.replace(/^#{1,6}\s+.+$/m, '').trim(),
      })
    }
  }

  for (const section of sections) {
    const cleaned = cleanForEmbedding(section.text)
    if (cleaned.length < MIN) continue

    for (const piece of packParagraphs(splitParagraphs(cleaned))) {
      if (piece.length < MIN) continue
      const id = crypto
        .createHash('sha1')
        .update(`${doc.path}#${ordinal}`)
        .digest('hex')
      chunks.push({
        id,
        docPath: doc.path,
        url: doc.url,
        anchor: section.anchor,
        lang: doc.lang,
        course: doc.course,
        docTitle: doc.title,
        heading: section.heading,
        ordinal,
        content: piece,
        contentHash: crypto.createHash('sha1').update(piece).digest('hex'),
        blockKind: detectBlockKind(piece),
      })
      ordinal++
    }
  }

  return chunks
}
