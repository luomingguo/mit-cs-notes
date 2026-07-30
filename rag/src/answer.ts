import { streamChat, type LlmEvent } from './llm.js'
import { passageLink, type Passage } from './retrieve.js'

const SYSTEM = `你是「MIT Notes by Ron」这个笔记站的问答助手。这个站点收录了作者整理的 MIT 计算机课程中文笔记，以及 PostgreSQL 等开源项目的源码研读。

回答规则：

1. 只依据下面给出的「笔记片段」作答。这些片段来自本站笔记，是唯一可信来源。
2. 每处引用都要标注来源编号，格式为 [1]、[2]，可以在一句话末尾连续标多个如 [1][3]。编号对应片段序号。
3. 如果片段不足以回答问题，直接说明本站笔记还没有覆盖这个话题，并指出最接近的相关内容。不要用你自己的知识补足后当成笔记内容输出 —— 读者是冲着「这个人的笔记怎么说」来的，编造会毁掉这份信任。
4. 如果片段之间有互补关系（比如同一个概念在操作系统课和数据库课都出现过），主动指出这种跨课程的联系，这正是通读全站笔记才能给出的价值。
5. 用中文回答。直接给结论，再展开细节。不要复述问题，不要写「根据笔记片段」这类开场白。
6. 涉及代码、公式、术语时保留原文写法（含 LaTeX），不要改写。
7. 篇幅克制：简单问题两三句话讲清；复杂问题可以分点，但每点都要有实质内容，不要凑数。`

export type AnswerEvent = LlmEvent

function buildUserMessage(question: string, passages: Passage[]): string {
  const blocks = passages
    .map((p, i) => {
      const crumb = [p.course, p.docTitle, p.heading].filter(Boolean).join(' · ')
      return `[${i + 1}] ${crumb}\n链接: ${passageLink(p)}\n\n${p.content}`
    })
    .join('\n\n---\n\n')

  return `笔记片段：\n\n${blocks}\n\n---\n\n读者的问题：${question}`
}

/** 流式生成答案。具体用哪家模型由 llm.ts 按配置决定。 */
export function streamAnswer(
  question: string,
  passages: Passage[],
): AsyncGenerator<AnswerEvent> {
  return streamChat(SYSTEM, buildUserMessage(question, passages))
}
