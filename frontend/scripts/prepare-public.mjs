import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = path.resolve(frontendRoot, '..');
const sharedPublic = path.join(repoRoot, 'public');
const docsZh = path.join(repoRoot, 'docs', 'zh');
const frontendStatic = path.join(frontendRoot, 'static');
const targetRoot = path.join(frontendRoot, '.public');

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

const staged = new Map();

async function stageAsset(source, targetRelative, owner) {
  if (path.basename(source) === '.DS_Store') return;
  const publicPath = targetRelative.split(path.sep).join('/');
  const previousOwner = staged.get(publicPath);
  if (previousOwner) {
    throw new Error(`公共资源路径冲突：/${publicPath}\n- ${previousOwner}\n- ${owner}`);
  }
  staged.set(publicPath, owner);
  const target = path.join(targetRoot, targetRelative);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { force: true });
}

async function stageTree(sourceRoot, targetPrefix, ownerPrefix) {
  for (const item of await readdir(sourceRoot, { withFileTypes: true })) {
    const absolute = path.join(sourceRoot, item.name);
    const relative = path.relative(sourceRoot, absolute);
    if (item.isDirectory()) {
      await stageTree(absolute, path.join(targetPrefix, item.name), `${ownerPrefix}/${item.name}`);
      continue;
    }
    if (!item.isFile()) throw new Error(`不支持的公共资源类型：${absolute}`);
    await stageAsset(absolute, path.join(targetPrefix, relative), `${ownerPrefix}/${relative}`);
  }
}

await stageTree(sharedPublic, '', 'public');
await stageTree(frontendStatic, '', 'frontend/static');

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
    const [discipline, _category, ...rest] = parts;
    let publicParts = parts;
    if (parts.length === 3) {
      publicParts = discipline === 'cs' ? [parts[1], ...rest] : [discipline, parts[1], ...rest];
    } else if (parts.length > 3) {
      publicParts = discipline === 'cs' ? rest : [discipline, ...rest];
    }
    await stageAsset(absolute, path.join('zh', ...publicParts), `docs/zh/${relative}`);
  }
}

await copyContentAssets(docsZh);
console.info(`[public] staged ${staged.size} assets from public, frontend/static and docs/zh`);
