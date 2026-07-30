// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import LearningPath from './LearningPath.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 注册成全局组件，md 里直接写 <LearningPath /> 即可
    app.component('LearningPath', LearningPath)
  },
} satisfies Theme
