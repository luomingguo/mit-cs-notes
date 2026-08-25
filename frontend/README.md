# Astro 生产前端

这是与旧 VitePress 完全隔离的新前端。内容集合直接只读加载 `../docs/zh/**/*.md`；本目录不复制或改写正文。

- `npm run verify:content`：按确定性规则自动选择复杂真实笔记并验证覆盖项。
- `npm run dev`：本地开发。
- `npm run check`：Astro/TypeScript 静态检查。
- `npm run build`：生成静态产物到 `dist/`。
- `npm run verify:dist`：验证全部 Markdown 路由、站内链接、静态资源和 base 前缀。
- `npm run preview`：预览静态产物。

当前前端为完整迁移产物：主页、中文知识库、领域页、课程页和全部讲义页均由真实目录、frontmatter、正文与 Git 历史生成。根路径和 GitHub Pages 子路径分别通过根目录的 `site:*` 命令构建和校验。旧 VitePress 仍保留为迁移期回滚基线，不参与 Astro 页面布局或样式。

RAG 入口沿用旧站同源 `POST /rag/ask` 的 SSE 契约。纯静态预览可以验收入口、对话框与错误状态；真实回答仍由自建部署中的现有 RAG 服务提供。
