/**
 * 服务商连通性自检。不碰数据库，只验证三件事：
 *   1. 嵌入接口通、返回维度与 EMBED_DIM 一致
 *   2. 重排接口通、能把相关文档排到前面
 *   3. 生成接口通、能流式吐字
 *
 * 换服务商或换模型后先跑这个，比直接跑 ingest 再排查快得多。
 *
 * 用法：npm run smoke          三项全测
 *      npm run smoke -- --no-llm   只测嵌入和重排
 */
import { embed, rerank, assertDimension } from './embedder.js'
import { streamChat } from './llm.js'
import { config } from './config.js'

const skipLlm = process.argv.includes('--no-llm')

async function main() {
  let failed = false

  // ———— 1. 嵌入 ————
  console.log(`\n[1/3] 嵌入  ${config.embed.model} @ ${config.embed.provider}`)
  try {
    const t0 = Date.now()
    const { embeddings, totalTokens } = await embed(
      ['虚拟内存与页表', '数据库的多版本并发控制'],
      'document',
    )
    const dim = embeddings[0]?.length ?? 0
    console.log(`      返回 ${embeddings.length} 条 / ${dim} 维 / ${totalTokens} tokens / ${Date.now() - t0}ms`)
    assertDimension(embeddings[0]!)
    console.log(`      ✓ 维度与 EMBED_DIM=${config.embed.dimension} 一致`)
  } catch (err) {
    failed = true
    console.error(`      ✗ ${err instanceof Error ? err.message : err}`)
  }

  // ———— 2. 重排 ————
  console.log(`\n[2/3] 重排  ${config.embed.rerankModel}`)
  try {
    const docs = [
      '本讲介绍编译器的词法分析与语法树构造。',
      'xv6 通过 RISC-V 的 Sv39 分页硬件实现地址空间隔离，页表把虚拟地址的高 27 位拆成三级索引。',
      '快速排序的平均时间复杂度是 O(n log n)。',
    ]
    const t0 = Date.now()
    const hits = await rerank('页表是怎么把虚拟地址翻译成物理地址的？', docs, 3)
    console.log(`      ${Date.now() - t0}ms`)
    hits.forEach((h) => {
      console.log(`      ${h.score.toFixed(4)}  ${docs[h.index]!.slice(0, 34)}…`)
    })
    // 关于页表的那条必须排第一，否则重排没起作用
    if (hits[0]?.index === 1) {
      console.log('      ✓ 相关文档排在首位')
    } else {
      failed = true
      console.error('      ✗ 重排结果不合预期：关于页表的那条没排到第一')
    }
  } catch (err) {
    failed = true
    console.error(`      ✗ ${err instanceof Error ? err.message : err}`)
  }

  // ———— 3. 生成 ————
  if (skipLlm) {
    console.log('\n[3/3] 生成  已跳过 (--no-llm)')
  } else {
    console.log(`\n[3/3] 生成  ${config.llm.model} @ ${config.llm.provider}`)
    try {
      const t0 = Date.now()
      let first = 0
      let text = ''
      for await (const ev of streamChat(
        '你是一个测试助手，用一句话回答。',
        '用一句话说明什么是页表。',
        512,
      )) {
        if (ev.type === 'text') {
          if (!first) first = Date.now() - t0
          text += ev.text
        } else if (ev.type === 'refusal') {
          throw new Error(`模型拒答（${ev.category ?? 'unknown'}）`)
        }
      }
      console.log(`      首字 ${first}ms / 总计 ${Date.now() - t0}ms`)
      console.log(`      ${text.trim().slice(0, 120)}`)
      console.log('      ✓ 流式生成正常')
    } catch (err) {
      failed = true
      console.error(`      ✗ ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(failed ? '\n有检查未通过\n' : '\n全部通过\n')
  if (failed) process.exitCode = 1
}

main()
