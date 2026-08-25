// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkFlexibleContainers from 'remark-flexible-containers';
import { rehypeInternalLinks } from './src/lib/rehype-internal-links.ts';
import { remarkLegacyHeadingIds } from './src/lib/heading-ids.ts';

const CONTAINER_LABELS = {
  definition: '定义',
  theorem: '定理',
  example: '例',
  insight: '我的理解',
  pitfall: '常见误区',
  tip: '提示',
  warning: '警告',
  danger: '危险',
  info: '信息',
  details: '详细信息',
};

const base = process.env.DOCS_BASE ?? '/';

export default defineConfig({
  base,
  publicDir: './.public',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkLegacyHeadingIds,
        [
          remarkFlexibleContainers,
          {
            containerTagName: () => 'div',
            containerClassName: /** @param {string} type */ (type) => ['note-block', `note-${type}`],
            titleTagName: () => 'p',
            titleClassName: () => ['note-block-title'],
            title: /** @param {keyof typeof CONTAINER_LABELS} type @param {string | undefined} title */ (type, title) => title ?? CONTAINER_LABELS[type] ?? type,
          },
        ],
        remarkMath,
      ],
      rehypePlugins: [[rehypeKatex, { strict: false }], rehypeInternalLinks],
      remarkRehype: { allowDangerousHtml: true },
      gfm: true,
      smartypants: false,
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'nord' },
      defaultColor: false,
      wrap: false,
      langAlias: {
        assembly: 'asm',
        golang: 'go',
        postgresql: 'sql',
        bluespec: 'txt',
        bsv: 'verilog',
        minispec: 'verilog',
        C: 'c',
        HTML: 'html',
      },
    },
  },
});
