import { embedOne, rerank } from './embedder.js'
import { searchChunks } from './db.js'
import { embedText } from './chunk.js'
import { config } from './config.js'

export interface Passage {
  url: string
  anchor: string
  course: string
  docTitle: string
  heading: string
  content: string
  /** rerank 相关性分，0~1 */
  score: number
}

/** 引用链接：有锚点就直达小节 */
export function passageLink(p: Passage): string {
  return p.anchor ? `${p.url}#${p.anchor}` : p.url
}

export interface RetrieveResult {
  passages: Passage[]
  /** 重排最高分。只用于展示和日志，不参与覆盖度判定（各家标定不一致）。 */
  topScore: number | null
  /** 最优向量余弦距离，越小越相关。覆盖度判定用的就是它。 */
  bestDistance: number | null
  /** 站内是否有足够相关的内容 */
  hasCoverage: boolean
}

/**
 * 两段式检索：向量粗召回 → rerank 精排。
 *
 * 只做向量检索的话，中文近义表述容易召回一堆「看着像但答非所问」的块；
 * rerank 是交叉编码器，能真正判断这段有没有回答这个问题，
 * 加这一跳对最终答案质量的提升比换更大的嵌入模型明显得多。
 */
export async function retrieve(
  question: string,
  lang?: string,
): Promise<RetrieveResult> {
  const queryVec = await embedOne(question, 'query')
  const rows = await searchChunks(queryVec, config.retrieval.candidateK, lang)

  if (rows.length === 0) {
    return { passages: [], topScore: null, bestDistance: null, hasCoverage: false }
  }

  // 向量距离在粗召回时就是排好序的，第一条即最优
  const bestDistance = rows[0]!.distance

  // rerank 的输入要和入库时同构（带面包屑上下文头），否则打分依据不一致
  const docsForRerank = rows.map((r) =>
    embedText({
      course: r.course,
      docTitle: r.doc_title,
      heading: r.heading,
      content: r.content,
    }),
  )

  const hits = await rerank(question, docsForRerank, config.retrieval.topK)

  const passages: Passage[] = hits.map((h) => {
    const r = rows[h.index]!
    return {
      url: r.url,
      anchor: r.anchor,
      course: r.course,
      docTitle: r.doc_title,
      heading: r.heading,
      content: r.content,
      score: h.score,
    }
  })

  return {
    passages,
    topScore: passages[0]?.score ?? null,
    bestDistance,
    hasCoverage: bestDistance <= config.retrieval.maxDistance,
  }
}
