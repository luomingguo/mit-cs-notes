import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// 只读接入仓库真实 Markdown。纵向切片只为自动选中样本所在课程生成页面，
// 但候选选择和领域/课程计数基于完整中文语料，避免手工指定“看起来复杂”的 fixture。
const notes = defineCollection({
  loader: glob({
    pattern: ['**/*.md'],
    base: new URL('../../docs/zh', import.meta.url),
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
});

export const collections = { notes };
