<script setup lang="ts">
/**
 * 学习路径。
 *
 * 数据是构建期生成的静态 JSON（docs/public/rag-paths.json），
 * 所以这个组件在 GitHub Pages 上也能正常工作，不依赖 RAG 后端。
 * 生成命令见 rag/README.md 的 `npm run paths`。
 */
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

interface Note {
  title: string
  url: string
}
interface Step {
  title: string
  why: string
  course: string
  checkpoint: string
  notes: Note[]
}
interface LearningPath {
  slug: string
  title: string
  brief: string
  summary: string
  estimatedWeeks: number
  prerequisites: string
  steps: Step[]
}

const paths = ref<LearningPath[]>([])
const activeSlug = ref<string>('')
const loading = ref(true)
const failed = ref(false)
const generatedAt = ref('')
/** 已展开的步骤序号集合，默认第一步展开 */
const expanded = ref<Set<number>>(new Set([0]))

const active = computed(() =>
  paths.value.find((p) => p.slug === activeSlug.value),
)

function selectPath(slug: string) {
  activeSlug.value = slug
  expanded.value = new Set([0])
}

function toggleStep(i: number) {
  const next = new Set(expanded.value)
  next.has(i) ? next.delete(i) : next.add(i)
  expanded.value = next
}

onMounted(async () => {
  try {
    const res = await fetch(withBase('/rag-paths.json'))
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as {
      generatedAt: string
      paths: Record<string, LearningPath>
    }
    paths.value = Object.values(data.paths)
    generatedAt.value = data.generatedAt
    activeSlug.value = paths.value[0]?.slug ?? ''
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="lp">
    <p v-if="loading" class="lp-status">加载中…</p>

    <p v-else-if="failed" class="lp-status">
      学习路径数据还没生成。在 <code>rag/</code> 目录下执行
      <code>npm run paths</code> 后重新构建站点即可。
    </p>

    <template v-else>
      <!-- 目标选择 -->
      <nav class="lp-goals" aria-label="学习目标">
        <button
          v-for="p in paths"
          :key="p.slug"
          class="lp-goal"
          :class="{ 'is-active': p.slug === activeSlug }"
          @click="selectPath(p.slug)"
        >
          {{ p.title }}
        </button>
      </nav>

      <section v-if="active" class="lp-detail">
        <p class="lp-summary">{{ active.summary }}</p>

        <div class="lp-meta">
          <span class="lp-badge">{{ active.steps.length }} 个阶段</span>
          <span class="lp-badge">预计 {{ active.estimatedWeeks }} 周</span>
        </div>

        <p v-if="active.prerequisites" class="lp-prereq">
          <strong>前置：</strong>{{ active.prerequisites }}
        </p>

        <!-- 路线主体 -->
        <ol class="lp-steps">
          <li
            v-for="(step, i) in active.steps"
            :key="i"
            class="lp-step"
            :class="{ 'is-open': expanded.has(i) }"
          >
            <button class="lp-step-head" @click="toggleStep(i)">
              <span class="lp-step-n">{{ i + 1 }}</span>
              <span class="lp-step-titles">
                <span class="lp-step-title">{{ step.title }}</span>
                <span class="lp-step-course">{{ step.course }}</span>
              </span>
              <span class="lp-caret" aria-hidden="true">›</span>
            </button>

            <div v-show="expanded.has(i)" class="lp-step-body">
              <p class="lp-why">
                <strong>为什么是这一步：</strong>{{ step.why }}
              </p>

              <div v-if="step.notes.length" class="lp-notes">
                <div class="lp-notes-title">对应笔记</div>
                <a
                  v-for="n in step.notes"
                  :key="n.url"
                  class="lp-note"
                  :href="withBase(n.url)"
                >
                  {{ n.title }}
                </a>
              </div>

              <p v-if="step.checkpoint" class="lp-check">
                <strong>过关标志：</strong>{{ step.checkpoint }}
              </p>
            </div>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped>
.lp { margin: 24px 0; }

.lp-status {
  padding: 16px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  color: var(--vp-c-text-3);
  font-size: 14px;
}

.lp-goals {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}
.lp-goal {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.18s;
}
.lp-goal:hover { border-color: var(--vp-c-brand-1); }
.lp-goal.is-active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.lp-summary {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

.lp-meta { display: flex; gap: 8px; margin-bottom: 14px; }
.lp-badge {
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.lp-prereq {
  margin: 0 0 20px;
  padding: 10px 14px;
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 6px 6px 0;
  background: var(--vp-c-bg-soft);
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.lp-steps {
  margin: 0;
  padding: 0;
  list-style: none;
}
.lp-step {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.lp-step.is-open { border-color: var(--vp-c-brand-1); }

.lp-step-head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 13px 15px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.lp-step-n {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;
}
.lp-step-titles {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.lp-step-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.lp-step-course {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.lp-caret {
  color: var(--vp-c-text-3);
  font-size: 18px;
  transition: transform 0.2s;
}
.lp-step.is-open .lp-caret { transform: rotate(90deg); }

.lp-step-body {
  padding: 0 15px 15px 53px;
  font-size: 13.5px;
  line-height: 1.7;
}
.lp-why { margin: 0 0 12px; color: var(--vp-c-text-2); }

.lp-notes { margin-bottom: 12px; }
.lp-notes-title {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.lp-note {
  display: inline-block;
  margin: 0 6px 6px 0;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: all 0.18s;
}
.lp-note:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.lp-check {
  margin: 0;
  padding: 9px 12px;
  border-radius: 6px;
  background: var(--vp-c-tip-soft, var(--vp-c-bg-soft));
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .lp-step-body { padding-left: 15px; }
}
</style>
