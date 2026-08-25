import fs from 'node:fs';
import path from 'node:path';

const docsRoot = path.resolve('..', 'docs', 'zh');
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.endsWith('.md') && entry.name !== 'index.md') files.push(filePath);
  }
}

function titleOf(source, filePath) {
  let value = source.split('\n').find((line) => line.startsWith('title:'))?.replace(/^title:\s*/, '') ?? '';
  if (value.charCodeAt(0) === 34 || value.charCodeAt(0) === 39) value = value.slice(1, -1);
  return value || path.basename(filePath, '.md');
}

function features(source, title) {
  const risks = {
    math: /\$\$[\s\S]+?\$\$|\$[^\n$]+\$/.test(source),
    code: /```[\w+-]*\n/.test(source),
    table: /^\|.*\|\s*$/m.test(source) && /^\|?\s*:?-{3,}/m.test(source),
    image: /!\[[^\]]*\]\([^)]+\)/.test(source),
    container: /^:::\s*(definition|theorem|example|insight|pitfall)\b/m.test(source),
  };
  return {
    ...risks,
    coverage: Object.values(risks).filter(Boolean).length,
    titleLength: Array.from(title).length,
    longHeadingCount: (source.match(/^#{1,4}\s+.{18,}$/gm) ?? []).length,
    headingCount: (source.match(/^#{1,4}\s+/gm) ?? []).length,
    bytes: Buffer.byteLength(source, 'utf8'),
  };
}

walk(docsRoot);
const ranked = files
  .map((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    const title = titleOf(source, filePath);
    return { filePath, title, features: features(source, title) };
  })
  .filter((item) => item.features.coverage === 5)
  .sort((a, b) =>
    b.features.titleLength - a.features.titleLength ||
    b.features.longHeadingCount - a.features.longHeadingCount ||
    b.features.headingCount - a.features.headingCount ||
    b.features.bytes - a.features.bytes ||
    a.filePath.localeCompare(b.filePath),
  );

if (!ranked[0]) throw new Error('未找到覆盖全部复杂内容特征的真实讲义。');
const selected = ranked[0];
for (const [name, present] of Object.entries(selected.features).filter(([name]) => ['math', 'code', 'table', 'image', 'container'].includes(name))) {
  if (!present) throw new Error(`自动样本缺少 ${name}`);
}

console.log(JSON.stringify({
  selected: path.relative(path.resolve('..'), selected.filePath),
  title: selected.title,
  features: selected.features,
  eligibleCandidates: ranked.length,
}, null, 2));
