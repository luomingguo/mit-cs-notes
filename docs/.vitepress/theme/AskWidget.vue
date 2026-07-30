<script setup lang="ts">
/**
 * 「问我的笔记」问答面板。
 *
 * 请求走同源的 /rag/ask —— 不用独立域名有两个原因：一是免掉 CORS 预检，
 * 二是同源路径不会被广告拦截器的过滤规则命中。
 */
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

interface Source {
  n: number
  url: string
  course: string
  docTitle: string
  heading: string
  score: number
}

const open = ref(false)
const question = ref('')
const answer = ref('')
const sources = ref<Source[]>([])
const loading = ref(false)
const errorMsg = ref('')
/** 检索完、模型正在跑思考链时的提示。思考模型可能几十秒才出第一个字。 */
const thinking = ref(false)
const inputEl = ref<HTMLTextAreaElement>()
const bodyEl = ref<HTMLElement>()

const SUGGESTIONS = [
  'xv6 的页表和数据库的缓冲池，在缓存思路上有什么共同点？',
  'MVCC 的快照隔离到底怎么实现的？',
  '为什么说日志（WAL）是崩溃恢复的核心？',
  '缓存无关算法（cache-oblivious）的核心思想是什么？',
]

function toggle() {
  open.value = !open.value
  if (open.value) nextTick(() => inputEl.value?.focus())
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

/** HTML 转义后再做 markdown 变换，避免把模型输出直接当 HTML 注入 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 极简 markdown 渲染：够用即可，不引第三方依赖拖慢首屏 */
function renderAnswer(text: string): string {
  const codeBlocks: string[] = []
  // 先把围栏代码抽出来占位，避免后续行内规则误伤代码内容
  let out = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const i = codeBlocks.length
    codeBlocks.push(
      `<pre class="ask-code"><code data-lang="${escapeHtml(lang)}">${escapeHtml(code)}</code></pre>`,
    )
    return `\u0000CODE${i}\u0000`
  })

  out = escapeHtml(out)
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    // [1] 引用角标，点击跳到对应来源
    .replace(
      /\[(\d+)\]/g,
      '<a href="#ask-src-$1" class="ask-cite" data-n="$1">$1</a>',
    )

  // 段落与列表
  out = out
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split('\n')
      if (lines.every((l) => /^\s*[-*]\s+/.test(l) || !l.trim())) {
        const items = lines
          .filter((l) => l.trim())
          .map((l) => `<li>${l.replace(/^\s*[-*]\s+/, '')}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      if (lines.every((l) => /^\s*\d+[.、)]\s+/.test(l) || !l.trim())) {
        const items = lines
          .filter((l) => l.trim())
          .map((l) => `<li>${l.replace(/^\s*\d+[.、)]\s+/, '')}</li>`)
          .join('')
        return `<ol>${items}</ol>`
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`
    })
    .join('')

  // <pre> 不能嵌在 <p> 里，先把只包着占位符的整段拆掉，再还原其余占位符。
  // 占位符用不可见的 NUL 转义：它不可能出现在模型输出里，也不会被 escapeHtml 改写。
  return out
    .replace(/<p>\u0000CODE(\d+)\u0000<\/p>/g, (_m, i) => codeBlocks[Number(i)] ?? '')
    .replace(/\u0000CODE(\d+)\u0000/g, (_m, i) => codeBlocks[Number(i)] ?? '')
}

async function ask() {
  const q = question.value.trim()
  if (!q || loading.value) return

  loading.value = true
  thinking.value = false
  answer.value = ''
  sources.value = []
  errorMsg.value = ''

  try {
    const res = await fetch('/rag/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q, lang: 'zh' }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}) as { error?: string })
      errorMsg.value = body.error || `请求失败 (${res.status})`
      return
    }
    if (!res.body) {
      errorMsg.value = '浏览器不支持流式响应'
      return
    }

    // 手写 SSE 解析：EventSource 不支持 POST，只能自己读流
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        if (!frame.trim() || frame.startsWith(':')) continue // 心跳
        let event = 'message'
        const dataLines: string[] = []
        for (const line of frame.split('\n')) {
          if (line.startsWith('event: ')) event = line.slice(7).trim()
          else if (line.startsWith('data: ')) dataLines.push(line.slice(6))
        }
        if (dataLines.length === 0) continue

        let payload: any
        try {
          payload = JSON.parse(dataLines.join('\n'))
        } catch {
          continue
        }

        if (event === 'sources') sources.value = payload
        else if (event === 'thinking') thinking.value = true
        else if (event === 'delta') {
          thinking.value = false
          answer.value += payload.text
          await nextTick()
          if (bodyEl.value) bodyEl.value.scrollTop = bodyEl.value.scrollHeight
        } else if (event === 'error') errorMsg.value = payload.message
      }
    }
  } catch (e) {
    errorMsg.value = '网络出错了，稍后再试。'
  } finally {
    loading.value = false
    thinking.value = false
  }
}

function onEnter(e: KeyboardEvent) {
  // Enter 提问，Shift+Enter 换行
  if (!e.shiftKey && !e.isComposing) {
    e.preventDefault()
    ask()
  }
}

function useSuggestion(s: string) {
  question.value = s
  ask()
}
</script>

<template>
  <div class="ask-root">
    <button
      class="ask-fab"
      :class="{ 'is-open': open }"
      :aria-expanded="open"
      aria-label="问我的笔记"
      @click="toggle"
    >
      <span v-if="!open">问我的笔记</span>
      <span v-else>关闭</span>
    </button>

    <Transition name="ask-slide">
      <section v-if="open" class="ask-panel" role="dialog" aria-label="笔记问答">
        <header class="ask-head">
          <div>
            <div class="ask-title">问我的笔记</div>
            <div class="ask-sub">基于全站 468 篇笔记检索作答，每句都给出处</div>
          </div>
        </header>

        <div ref="bodyEl" class="ask-body">
          <div v-if="!answer && !loading && !errorMsg" class="ask-empty">
            <p class="ask-empty-hint">试试这些跨课程的问题：</p>
            <button
              v-for="s in SUGGESTIONS"
              :key="s"
              class="ask-suggest"
              @click="useSuggestion(s)"
            >
              {{ s }}
            </button>
          </div>

          <div v-if="loading && !answer" class="ask-loading">
            <span class="ask-dot" />
            <span class="ask-dot" />
            <span class="ask-dot" />
            <span class="ask-loading-text">{{ thinking ? '模型正在思考…' : '正在检索笔记…' }}</span>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -->
          <article v-if="answer" class="ask-answer" v-html="renderAnswer(answer)" />

          <p v-if="errorMsg" class="ask-error">{{ errorMsg }}</p>

          <div v-if="sources.length" class="ask-sources">
            <div class="ask-sources-title">引用来源</div>
            <a
              v-for="s in sources"
              :id="`ask-src-${s.n}`"
              :key="s.n"
              class="ask-source"
              :href="s.url"
            >
              <span class="ask-source-n">{{ s.n }}</span>
              <span class="ask-source-main">
                <span class="ask-source-doc">{{ s.docTitle }}</span>
                <span class="ask-source-meta">
                  {{ s.course }}<template v-if="s.heading"> · {{ s.heading }}</template>
                </span>
              </span>
            </a>
          </div>
        </div>

        <footer class="ask-foot">
          <textarea
            ref="inputEl"
            v-model="question"
            class="ask-input"
            rows="2"
            placeholder="问点什么，比如：页表和缓冲池有什么共同点？"
            :disabled="loading"
            @keydown.enter="onEnter"
          />
          <button class="ask-send" :disabled="loading || !question.trim()" @click="ask">
            {{ loading ? '思考中' : '提问' }}
          </button>
        </footer>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.ask-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 60;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s, background-color 0.2s;
}
.ask-fab:hover {
  transform: translateY(-2px);
}
.ask-fab.is-open {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.ask-panel {
  position: fixed;
  right: 24px;
  bottom: 78px;
  z-index: 60;
  display: flex;
  flex-direction: column;
  width: min(460px, calc(100vw - 32px));
  height: min(620px, calc(100vh - 140px));
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.ask-head {
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ask-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ask-sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.ask-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ask-empty-hint {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
.ask-suggest {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.ask-suggest:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.ask-loading {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}
.ask-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  animation: ask-bounce 1.2s infinite ease-in-out;
}
.ask-dot:nth-child(2) { animation-delay: 0.15s; }
.ask-dot:nth-child(3) { animation-delay: 0.3s; }
.ask-loading-text { margin-left: 6px; }
@keyframes ask-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.ask-answer {
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-1);
}
.ask-answer :deep(p) { margin: 0 0 10px; }
.ask-answer :deep(ul),
.ask-answer :deep(ol) { margin: 0 0 10px; padding-left: 20px; }
.ask-answer :deep(li) { margin-bottom: 4px; }
.ask-answer :deep(code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  font-size: 0.88em;
}
.ask-answer :deep(.ask-code) {
  margin: 10px 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  overflow-x: auto;
  font-size: 12.5px;
  line-height: 1.6;
}
.ask-answer :deep(.ask-code code) { background: none; padding: 0; }
.ask-answer :deep(.ask-cite) {
  display: inline-block;
  min-width: 15px;
  margin: 0 1px;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  vertical-align: super;
  text-decoration: none;
}

.ask-error {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-size: 13px;
}

.ask-sources {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--vp-c-divider);
}
.ask-sources-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.ask-source {
  display: flex;
  gap: 9px;
  padding: 8px 10px;
  margin-bottom: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s;
}
.ask-source:hover { border-color: var(--vp-c-brand-1); }
.ask-source-n {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}
.ask-source-main { display: flex; flex-direction: column; min-width: 0; }
.ask-source-doc {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ask-source-meta {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}

.ask-foot {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ask-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  resize: none;
}
.ask-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.ask-send {
  align-self: flex-end;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.ask-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ask-slide-enter-active,
.ask-slide-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.ask-slide-enter-from,
.ask-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 640px) {
  .ask-panel {
    right: 8px;
    left: 8px;
    bottom: 72px;
    width: auto;
    height: min(70vh, 560px);
  }
  .ask-fab { right: 16px; bottom: 16px; }
}
</style>
