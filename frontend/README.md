# Astro 讲义页纵向切片

这是与旧 VitePress 完全隔离的新前端。内容集合直接只读加载 `../docs/zh/**/*.md`；本目录不复制或改写正文。

- `npm run verify:content`：按确定性规则自动选择复杂真实笔记并验证覆盖项。
- `npm run dev`：本地开发。
- `npm run check`：Astro/TypeScript 静态检查。
- `npm run build`：生成静态产物到 `dist/`。
- `npm run preview`：预览静态产物。

本纵向切片只为自动样本所在课程生成路由；旧站入口、生产部署和整站切换不在本轮范围。视觉与数据规则见 `BASELINE.md`。

RAG 入口沿用旧站同源 `POST /rag/ask` 的 SSE 契约。纯静态预览可以验收入口、对话框与错误状态；真实回答仍由自建部署中的现有 RAG 服务提供。
