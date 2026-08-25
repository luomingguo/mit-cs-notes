import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// 只读接入仓库真实 Markdown。视觉 QA 样本仍从完整中文语料中自动选择，
// 避免手工指定“看起来复杂”的 fixture。
const notes = defineCollection({
  loader: glob({
    pattern: ['**/*.md'],
    base: new URL('../../docs/zh', import.meta.url),
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
});

export const collections = { notes };
