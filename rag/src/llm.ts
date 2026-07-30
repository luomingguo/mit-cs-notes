/**
 * 生成模型的统一入口。
 *
 * 两种后端：
 *   - openai-compatible（默认）：/chat/completions，几乎所有服务商都支持这个形状
 *     —— 硅基流动、DeepSeek、智谱、通义、Kimi、Gemini 的 OpenAI 兼容端点、
 *        Groq、OpenRouter、本地 Ollama。换服务商只改三个环境变量。
 *   - anthropic：官方 SDK，带 effort 与服务端 fallback。
 *
 * 上层（answer.ts / paths.ts）只认这里的接口，不关心底下是谁。
 */
import Anthropic from '@anthropic-ai/sdk'
import { config } from './config.js'

export type LlmEvent =
  | { type: 'text'; text: string }
  /** 模型正在输出思考链。不带内容，只是让 UI 能显示「思考中」而不是死等。 */
  | { type: 'reasoning' }
  | { type: 'done'; usage: { input: number; output: number } }
  | { type: 'refusal'; category: string | null }

let anthropicClient: Anthropic | undefined
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: config.llm.apiKey,
      // 允许指到 Anthropic 格式的第三方端点，例如 DeepSeek 的
      // https://api.deepseek.com/anthropic —— 这样连 SDK 都不用换。
      ...(process.env.LLM_BASE_URL ? { baseURL: process.env.LLM_BASE_URL } : {}),
    })
  }
  return anthropicClient
}

// ———————————————— OpenAI 兼容 ————————————————

interface OpenAIStreamChunk {
  choices?: {
    delta?: {
      content?: string | null
      /** 思考模型（智谱 GLM、通义 Qwen 等）把推理过程放这里，绝不能当正文 */
      reasoning_content?: string | null
    }
    finish_reason?: string | null
  }[]
  usage?: { prompt_tokens?: number; completion_tokens?: number } | null
}

/** 表示该错误值得让调用方给用户一个「稍后再试」而不是「服务坏了」 */
export class RateLimitedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitedError'
  }
}

async function* streamOpenAICompatible(
  system: string,
  user: string,
  maxTokens: number,
): AsyncGenerator<LlmEvent> {
  const body = JSON.stringify({
    model: config.llm.model,
    max_tokens: maxTokens,
    stream: true,
    // 有的服务商要显式要 usage 才会在最后一个 chunk 里带上
    stream_options: { include_usage: true },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    // 各家私有参数（如关闭思考链）最后合并，允许覆盖上面的默认值
    ...config.llm.extraBody,
  })

  /**
   * 只在「流还没开始吐字」时重试。
   *
   * 免费档的并发限制很容易撞 429（智谱返回 code 1305「该模型当前访问量过大」），
   * 实测连着问三个问题就会中一次。这里必须重试 —— 否则读者看到的是「服务出了点问题」。
   *
   * 一旦开始流式输出就不能重试了：前面的字已经推给读者，重来会串成两段。
   */
  let res: Response | undefined
  const maxAttempts = 4
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.llm.apiKey}`,
        },
        body,
      })
    } catch (e) {
      if (attempt === maxAttempts) throw e
      await new Promise((r) => setTimeout(r, 800 * 2 ** (attempt - 1)))
      continue
    }

    if (res.ok && res.body) break

    const text = await res.text().catch(() => '')
    const retryable = res.status === 429 || res.status >= 500
    if (retryable && attempt < maxAttempts) {
      const wait = 800 * 2 ** (attempt - 1) + Math.random() * 400
      console.warn(
        `  生成接口 ${res.status}，${Math.round(wait)}ms 后重试 (${attempt}/${maxAttempts})`,
      )
      await new Promise((r) => setTimeout(r, wait))
      continue
    }
    if (res.status === 429) {
      throw new RateLimitedError(`生成接口限流: ${text.slice(0, 200)}`)
    }
    throw new Error(`生成接口失败 ${res.status}: ${text.slice(0, 300)}`)
  }

  if (!res?.body) throw new Error('生成接口没有返回响应体')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let usage = { input: 0, output: 0 }
  let sawReasoning = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const data = trimmed.slice(5).trim()
      if (data === '[DONE]') continue

      let chunk: OpenAIStreamChunk
      try {
        chunk = JSON.parse(data)
      } catch {
        continue // 半截 JSON，等下一轮拼完整
      }

      const delta = chunk.choices?.[0]?.delta
      if (delta?.content) {
        yield { type: 'text', text: delta.content }
      } else if (delta?.reasoning_content) {
        // 思考链不进答案，但要给前端一个信号，否则读者只看到长时间空白
        if (!sawReasoning) {
          sawReasoning = true
          yield { type: 'reasoning' }
        }
      }

      if (chunk.usage) {
        usage = {
          input: chunk.usage.prompt_tokens ?? 0,
          output: chunk.usage.completion_tokens ?? 0,
        }
      }
    }
  }

  yield { type: 'done', usage }
}

// ———————————————— Anthropic ————————————————

async function* streamAnthropic(
  system: string,
  user: string,
  maxTokens: number,
): AsyncGenerator<LlmEvent> {
  const stream = getAnthropic().beta.messages.stream({
    model: config.llm.model,
    max_tokens: maxTokens,
    system,
    output_config: {
      effort: config.llm.effort as Anthropic.Beta.BetaOutputConfig['effort'],
    },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: user }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield { type: 'text', text: event.delta.text }
    }
  }

  const final = await stream.finalMessage()
  // 必须先看 stop_reason 再碰 content —— 拒答时 content 可能是空数组
  if (final.stop_reason === 'refusal') {
    yield { type: 'refusal', category: final.stop_details?.category ?? null }
    return
  }
  yield {
    type: 'done',
    usage: {
      input: final.usage.input_tokens,
      output: final.usage.output_tokens,
    },
  }
}

/** 流式生成。上层用它推 SSE。 */
export function streamChat(
  system: string,
  user: string,
  maxTokens = config.llm.maxTokens,
): AsyncGenerator<LlmEvent> {
  return config.llm.provider === 'anthropic'
    ? streamAnthropic(system, user, maxTokens)
    : streamOpenAICompatible(system, user, maxTokens)
}

/** 非流式，把整段文本收齐再返回。给离线批处理用。 */
export async function complete(
  system: string,
  user: string,
  maxTokens = 32000,
): Promise<string> {
  let out = ''
  for await (const ev of streamChat(system, user, maxTokens)) {
    if (ev.type === 'text') out += ev.text
    else if (ev.type === 'refusal') {
      throw new Error(`模型拒答（${ev.category ?? 'unknown'}）`)
    }
  }
  return out
}

/**
 * 要求模型返回 JSON。
 *
 * Anthropic 用 structured outputs 硬约束 schema；OpenAI 兼容那边各家对
 * json_schema 的支持参差不齐，所以只用通用的 json_object 模式 + 提示词约束，
 * 再做一次容错解析（有的模型会用 ```json 包起来）。
 */
export async function completeJson<T>(
  system: string,
  user: string,
  schema: unknown,
  maxTokens = 32000,
): Promise<T> {
  if (config.llm.provider === 'anthropic') {
    const stream = getAnthropic().beta.messages.stream({
      model: config.llm.model,
      max_tokens: maxTokens,
      system,
      output_config: {
        effort: 'high',
        format: { type: 'json_schema', schema: schema as Record<string, unknown> },
      },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: user }],
    })
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') {
      throw new Error(`模型拒答（${final.stop_details?.category ?? 'unknown'}）`)
    }
    const text = final.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
    return JSON.parse(text) as T
  }

  const res = await fetch(`${config.llm.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.llm.apiKey}`,
    },
    body: JSON.stringify({
      model: config.llm.model,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
      ...config.llm.extraBody,
      messages: [
        {
          role: 'system',
          content: `${system}\n\n只输出一个 JSON 对象，不要任何解释文字或代码块包裹。必须严格符合这个结构：\n${JSON.stringify(schema)}`,
        },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`生成接口失败 ${res.status}: ${text.slice(0, 300)}`)
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const raw = body.choices?.[0]?.message?.content ?? ''
  return parseLooseJson<T>(raw)
}

/** 容错解析：剥掉 ```json 包裹，或从文本里抠出第一个完整的 JSON 对象 */
export function parseLooseJson<T>(raw: string): T {
  const text = raw.trim()
  try {
    return JSON.parse(text) as T
  } catch {
    // 继续尝试
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim()) as T
    } catch {
      // 继续尝试
    }
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1)) as T
  }

  throw new Error(`模型没有返回可解析的 JSON：${text.slice(0, 200)}`)
}
