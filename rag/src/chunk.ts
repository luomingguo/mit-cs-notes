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
}

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
      // 强调符号
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/g, '$1')
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

      sections.push({
        heading: crumb || h.text,
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
      })
      ordinal++
    }
  }

  return chunks
}
