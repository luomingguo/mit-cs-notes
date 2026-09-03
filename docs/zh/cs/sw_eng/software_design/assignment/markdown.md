---
title: Assignment：Markdown
type: assignment
tags: []
status: complete
---
# Assignment：Markdown

### Markdown 基础

**什么是 Markdown？** 一种简单的标记语言（*markup language*），让你不需要写 HTML 就能用纯文本格式化标题、粗体、斜体、列表、图片、链接等。如果 Markdown 原生不支持的样式，仍然可以嵌入 HTML 来实现（这也是本课程笔记本身常用 `<div style="...">` 高亮框的原因）。

常用语法速查：

| 元素         | Markdown 语法                      |
| :----------- | :--------------------------------- |
| 标题         | `# H1` / `## H2` / `### H3`        |
| 粗体         | `**bold text**`                    |
| 斜体         | `*italicized text*`                |
| 引用块       | `> blockquote`                     |
| 有序列表     | `1. First item`                    |
| 无序列表     | `- First item`                     |
| 代码（行内） | `` `code` ``                       |
| 分隔线       | `---`                              |
| 链接         | `[title](https://www.example.com)` |
| 图片         | `![alt text](image.jpg)`           |

### 为什么要用 Markdown

- **可移植、平台无关**：不像 Microsoft Word 那种专有格式，Markdown 文件可以在几乎任何编辑器里打开和查看
- **无处不在**：Reddit、GitHub 等平台原生支持，用途广泛——写网站、做笔记都可以

### Markdown 的局限

- **表达力有限**：只能用 Markdown 原生支持的方式排版，没有类似 CSS 的自定义样式机制，也不能接入 JavaScript 实现高级功能
- **没有"官方"规范**：这既带来了针对不同场景的"方言"（*flavors*）灵活性，也导致不同实现之间渲染和格式不一致

### Markdown 的常见应用场景

- **静态网站**：配合静态网站生成器（*static site generator*），例如 `blot.im`（把 Dropbox 里的 Markdown 文件夹直接转成网站）和 Jekyll（与 GitHub Pages 集成，用于发布 Markdown 站点）
- **笔记应用**：Notion、Obsidian 等笔记软件都采用 Markdown 作为轻量级的结构化笔记格式

### 用 Markdown 写 README

**什么是 README？** 仓库的"自我介绍"，是告诉潜在用户或贡献者关于这份代码的核心资源。一份好的 README 通常包含：项目的概览描述、安装说明、贡献指南——善用 Markdown 让 README 一眼就能看清关键信息。

### 编辑 Markdown 的工具

- **笔记应用**：Notion、Obsidian（原生使用 Markdown）
- **文本编辑器**：支持 `.md` 文件的通用编辑器
- **在线编辑器**：如 `dillinger.io`，不需要下载任何软件
- **GitHub 网页编辑**：适合小改动，但会在提交历史里留下大量零碎 commit，弄乱分支记录

### 需要记住的几个 Markdown 细节

- **相对路径链接**：例如在模板仓库中，要链接到 `assignments/` 文件夹下的 `assignment1.md`，写法是：

  ```text
  [Assignment 1](assignments/assignment1.md)
  ```

- **代码格式化**：行内代码用单个反引号包裹（`` `your code here` ``）；代码块用三个反引号包裹：

  ````text
  ```
  Your code block here
  ```text
  ````

- **图片**：`![alt text](/path/to/image.jpg)`

### 课堂练习：动手改造你的作品集

在拿到模板仓库后，Recitation 建议逐步尝试：

- 更换个人照片
- 添加一个外部链接
- 添加一段自我介绍和本学期目标
- 新增一个作业文档页面并从主页链接过去

整个过程中要不断在 GitHub 上预览效果并做小幅修改，确认渲染符合预期——这也是为后面每次作业提交打基础的关键一步。
