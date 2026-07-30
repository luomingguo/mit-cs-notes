/**
 * 把 docs/ 下的笔记切块、嵌入、写进 pgvector。
 *
 * 增量策略分两层：
 *   1. 文件级 —— file_hash 没变的文档整篇跳过，连切块都不做。
 *   2. 块级   —— 文档变了，也只对 content_hash 变过的块调用嵌入 API，
 *                其余块直接复用库里已有的向量。改一个错别字不会重嵌整篇。
 *
 * 用法：
 *   npm run ingest              增量
 *   npm run ingest -- --force   全量重嵌（换嵌入模型后必须跑这个）
 *   npm run ingest -- --limit 5 只处理前 5 篇，用来试跑
 */
import { collectDocuments } from './corpus.js'
import { chunkDocument, embedText } from './chunk.js'
import { embed, assertDimension } from './embedder.js'
import {
  applySchema, closePool, countChunks, deleteMissingDocs,
  existingDocHashes, existingEmbeddings, replaceDocChunks, upsertDocument,
} from './db.js'
import { config } from './config.js'

const args = process.argv.slice(2)
const force = args.includes('--force')
const limitArg = args.indexOf('--limit')
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity

async function main() {
  const started = Date.now()
  console.log(`语料目录: ${config.docsDir}`)
  console.log(`嵌入服务: ${config.embed.provider} @ ${config.embed.baseUrl}`)
  console.log(`嵌入模型: ${config.embed.model} (${config.embed.dimension} 维)`)
  if (force) console.log('模式: 全量重嵌')

  await applySchema()

  const docs = (await collectDocuments(config.docsDir)).slice(0, limit)
  console.log(`发现 ${docs.length} 篇笔记\n`)

  const knownHashes = force ? new Map<string, string>() : await existingDocHashes()

  let skipped = 0
  let processed = 0
  let chunksWritten = 0
  let embeddedChunks = 0
  let reusedChunks = 0
  let totalTokens = 0

  for (const doc of docs) {
    if (knownHashes.get(doc.path) === doc.fileHash) {
      skipped++
      continue
    }

    const chunks = chunkDocument(doc)
    if (chunks.length === 0) {
      console.warn(`  ! ${doc.path} 切不出有效块，跳过`)
      continue
    }

    // 复用未变块的向量
    const cached = force ? new Map<string, string>() : await existingEmbeddings(doc.path)
    const vectors: (number[] | string)[] = new Array(chunks.length)
    const toEmbedIdx: number[] = []
    const toEmbedText: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i]!
      const hit = cached.get(c.contentHash)
      if (hit) {
        vectors[i] = hit
        reusedChunks++
      } else {
        toEmbedIdx.push(i)
        toEmbedText.push(embedText(c))
      }
    }

    if (toEmbedText.length > 0) {
      const { embeddings, totalTokens: tk } = await embed(toEmbedText, 'document')
      // 维度对不上时立刻炸掉：库能建能写能查，只是检索全是噪声且不报错，
      // 这是最难排查的一类故障，必须在写第一批之前拦住。
      if (embeddings[0]) assertDimension(embeddings[0])
      for (let j = 0; j < toEmbedIdx.length; j++) {
        vectors[toEmbedIdx[j]!] = embeddings[j]!
      }
      embeddedChunks += toEmbedText.length
      totalTokens += tk
    }

    await upsertDocument(doc)
    await replaceDocChunks(doc.path, chunks, vectors)

    processed++
    chunksWritten += chunks.length
    const reuseNote = toEmbedText.length < chunks.length
      ? ` (复用 ${chunks.length - toEmbedText.length})`
      : ''
    console.log(
      `  [${processed}] ${doc.url}  ${chunks.length} 块${reuseNote}  — ${doc.title}`,
    )
  }

  // 源码里删掉的文档同步清理，避免检索到已下线的内容
  const removed = await deleteMissingDocs(docs.map((d) => d.path))

  const total = await countChunks()
  const secs = ((Date.now() - started) / 1000).toFixed(1)
  console.log(`
———— 完成 (${secs}s) ————
  处理      ${processed} 篇
  跳过未变  ${skipped} 篇
  清理下线  ${removed} 篇
  新嵌入    ${embeddedChunks} 块
  复用向量  ${reusedChunks} 块
  写入      ${chunksWritten} 块
  库中总计  ${total} 块
  消耗      ${totalTokens.toLocaleString()} tokens`)

}

main()
  .catch((err) => {
    console.error('\ningest 失败:', err)
    process.exitCode = 1
  })
  .finally(closePool)
