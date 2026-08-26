# Astro 生产前端

这是项目的 Astro 生产前端。内容集合直接只读加载 `../docs/zh/**/*.md`；本目录不复制或改写正文。

`../public/` 作为 Astro 前端和 RAG 共用的公共资源源目录。开发与构建前，`prepare:public` 会清空生成目录 `.public/`，再确定性导入公共资源、前端自有资源及正文附件；同一路径出现两个来源时会直接失败，不会静默覆盖。`verify:dist` 会逐文件比较根目录 `public/` 与最终产物，并检查学习路径中的全部笔记链接。不要直接编辑或提交 `.public/`。

- `npm run verify:content`：按确定性规则自动选择复杂真实笔记并验证覆盖项。
- `npm run dev`：本地开发。
- `npm run check`：Astro/TypeScript 静态检查。
- `npm run build`：生成静态产物到 `dist/`。
- `npm run verify:dist`：验证全部 Markdown 路由、站内链接、静态资源和 base 前缀。
- `npm run preview`：预览静态产物。

主页、中文知识库、领域页、课程页和全部讲义页均由真实目录、frontmatter、正文与 Git 历史生成。根路径和 GitHub Pages 子路径分别通过根目录的 `site:*` 命令构建和校验。旧前端实现已移除，不参与生产构建、页面布局或样式。

RAG 入口使用同源 `POST /rag/ask` 的 SSE 契约。纯静态预览可以验收入口、对话框与错误状态；真实回答仍由自建部署中的现有 RAG 服务提供。
