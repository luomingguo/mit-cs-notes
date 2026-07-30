import { fileURLToPath } from 'node:url'
import path from 'node:path'

/**
 * 配置项一律用 getter 惰性求值：ingest 不需要生成模型的 key，
 * verify 什么 key 都不需要。若在模块加载时就校验，任何一个入口都会被
 * 无关的缺失变量卡住。
 */
function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`缺少环境变量 ${name}`)
  return v
}

function opt(name: string, fallback: string): string {
  return process.env[name] || fallback
}

const here = path.dirname(fileURLToPath(import.meta.url))
const defaultDocs = path.join(here, '../../docs')

/** 嵌入/重排的服务商 */
export type EmbedProvider = 'openai-compatible' | 'voyage'
/** 生成的服务商 */
export type LlmProvider = 'openai-compatible' | 'anthropic'

export const config = {
  /** docs/ 目录，ingest 从这里读源码 md */
  get docsDir(): string {
    return path.resolve(opt('DOCS_DIR', defaultDocs))
  },

  get databaseUrl(): string {
    return required('DATABASE_URL')
  },

  /**
   * 嵌入与重排。
   *
   * 默认走硅基流动：一个账号同时提供 embeddings 和 rerank 两个接口，
   * bge-m3 / bge-reranker-v2-m3 在免费档，注册不需要境外支付方式。
   * 想换 Voyage 把 EMBED_PROVIDER 设成 voyage 即可。
   */
  embed: {
    get provider(): EmbedProvider {
      return opt('EMBED_PROVIDER', 'openai-compatible') as EmbedProvider
    },
    get apiKey(): string {
      return required('EMBED_API_KEY')
    },
    get baseUrl(): string {
      return opt('EMBED_BASE_URL', 'https://api.siliconflow.cn/v1')
    },
    get model(): string {
      return opt('EMBED_MODEL', 'BAAI/bge-m3')
    },
    get rerankModel(): string {
      return opt('RERANK_MODEL', 'BAAI/bge-reranker-v2-m3')
    },
    /**
     * 向量维度。必须与库里 chunks.embedding 的 vector(N) 一致 ——
     * db.ts 会用这个值生成建表语句，ingest 也会在首批嵌入后校验实际返回的长度，
     * 对不上会立刻报错，而不是悄悄写进一个维度错乱的索引。
     *
     * bge-m3 = 1024，Qwen3-Embedding 可配（支持 1024），
     * gemini-embedding-001 默认 3072。换模型记得同步改这个值并重建库。
     */
    get dimension(): number {
      return Number(opt('EMBED_DIM', '1024'))
    },
    /**
     * 额外塞进嵌入请求体的字段（JSON 字符串）。
     *
     * 主要用途是指定输出维度：智谱 embedding-3 默认 2048 维，
     * 而 pgvector 的 HNSW 索引最多 2000 维（实测报错
     * "column cannot have more than 2000 dimensions for hnsw index"），
     * 必须用 {"dimensions":1024} 压下来。
     *
     * 做成显式开关而不是自动下发，是因为不是所有模型都认这个字段 ——
     * bge-m3 就不认，硬塞可能被拒。
     */
    get extraBody(): Record<string, unknown> {
      const raw = opt('EMBED_EXTRA_BODY', '')
      if (!raw) return {}
      try {
        return JSON.parse(raw) as Record<string, unknown>
      } catch {
        throw new Error(`EMBED_EXTRA_BODY 不是合法 JSON: ${raw}`)
      }
    },
  },

  /**
   * 生成模型。
   *
   * openai-compatible 能对接几乎所有国产与海外服务：硅基流动、DeepSeek、
   * 智谱、通义、Kimi、Gemini 的 OpenAI 兼容端点、Groq、OpenRouter、本地 Ollama。
   * 换服务商只改 LLM_BASE_URL + LLM_MODEL + LLM_API_KEY 三个变量，不动代码。
   */
  llm: {
    get provider(): LlmProvider {
      return opt('LLM_PROVIDER', 'openai-compatible') as LlmProvider
    },
    get apiKey(): string {
      return required('LLM_API_KEY')
    },
    get baseUrl(): string {
      return opt('LLM_BASE_URL', 'https://api.siliconflow.cn/v1')
    },
    get model(): string {
      return opt('LLM_MODEL', 'Qwen/Qwen3-8B')
    },
    /** 只对 anthropic provider 生效 */
    get effort(): string {
      return opt('LLM_EFFORT', 'medium')
    },
    get maxTokens(): number {
      return Number(opt('LLM_MAX_TOKENS', '8000'))
    },
    /**
     * 额外塞进请求体的字段（JSON 字符串），用来喂各家的私有参数。
     *
     * 最典型的用途是关掉思考链：智谱是 {"thinking":{"type":"disabled"}}，
     * 通义是 {"enable_thinking":false}。对「照着给定片段作答」这种任务，
     * 思考链只会白白拉长首字延迟 —— 实测智谱开着思考会先刷 500+ 个
     * reasoning 片段，读者干等几十秒才看到第一个字。
     */
    get extraBody(): Record<string, unknown> {
      const raw = opt('LLM_EXTRA_BODY', '')
      if (!raw) return {}
      try {
        return JSON.parse(raw) as Record<string, unknown>
      } catch {
        throw new Error(`LLM_EXTRA_BODY 不是合法 JSON: ${raw}`)
      }
    },
  },

  retrieval: {
    /** 先向量粗召回这么多条 */
    get candidateK(): number {
      return Number(opt('RETRIEVAL_CANDIDATE_K', '30'))
    },
    /** 再由 rerank 精排出这么多条喂给模型 */
    get topK(): number {
      return Number(opt('RETRIEVAL_TOP_K', '8'))
    },
    /**
     * 「站内有没有写过这个话题」的判定阈值，用的是向量余弦距离（越小越相关）。
     *
     * 为什么不用 rerank 分数：各家重排模型的分数标定差异极大。实测同一组文档，
     * Voyage rerank-2.5 给出 0.63 / 0.26 / 0.25（区分清晰），
     * 智谱 rerank 给出 1.0 / 0.9994 / 0.9990 —— 完全无关的文档也有 0.999，
     * 拿它做绝对阈值，「没覆盖」这个分支永远不会触发，模型就会拿着不相关的
     * 片段硬编答案。向量距离是模型自身的度量，跨服务商稳定得多。
     */
    get maxDistance(): number {
      return Number(opt('RETRIEVAL_MAX_DISTANCE', '0.6'))
    },
  },

  server: {
    get port(): number {
      return Number(opt('PORT', '3100'))
    },
    /** 每 IP 每小时提问上限 */
    get rateLimitPerHour(): number {
      return Number(opt('RATE_LIMIT_PER_HOUR', '20'))
    },
    /** 给 IP 加盐哈希，日志里不留原始 IP */
    get ipSalt(): string {
      return opt('IP_SALT', 'mit-cs-notes')
    },
    get corsOrigin(): string {
      return opt('CORS_ORIGIN', '*')
    },
  },
}
