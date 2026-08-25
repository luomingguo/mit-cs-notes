import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = path.resolve(frontendRoot, '..');
const docsPublic = path.join(repoRoot, 'docs', 'public');
const docsZh = path.join(repoRoot, 'docs', 'zh');
const frontendStatic = path.join(frontendRoot, 'static');
const targetRoot = path.join(frontendRoot, '.public');

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });
await cp(docsPublic, targetRoot, { recursive: true, force: true });
await cp(frontendStatic, targetRoot, { recursive: true, force: true });

async function copyContentAssets(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, item.name);
    if (item.isDirectory()) {
      await copyContentAssets(absolute);
      continue;
    }
    if (item.name.endsWith('.md')) continue;
    const relative = path.relative(docsZh, absolute);
    const parts = relative.split(path.sep);
    const publicParts = parts.length >= 3 ? parts.slice(1) : parts;
    const target = path.join(targetRoot, 'zh', ...publicParts);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(absolute, target, { force: true });
  }
}

await copyContentAssets(docsZh);
