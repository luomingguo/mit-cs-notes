import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../', import.meta.url));
const distRoot = path.join(frontendRoot, 'dist');
const docsRoot = path.resolve(frontendRoot, '../docs/zh');
const base = normalizeBase(process.env.DOCS_BASE ?? '/');

function normalizeBase(value) {
  const leading = value.startsWith('/') ? value : `/${value}`;
  return leading === '/' ? '/' : `${leading.replace(/\/+$/, '')}/`;
}

async function filesBelow(directory, suffix) {
  const found = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, item.name);
    if (item.isDirectory()) found.push(...await filesBelow(absolute, suffix));
    else if (!suffix || item.name.endsWith(suffix)) found.push(absolute);
  }
  return found;
}

function idToPublicPath(id) {
  const parts = id.split('/');
  if (id === 'index') return '';
  if (parts.length === 2 && parts[1] === 'index') return parts[0];
  const publicParts = parts.length >= 3 ? parts.slice(1) : parts;
  return publicParts.join('/').replace(/\/index$/, '').replace(/^index$/, '');
}

function routeFile(publicPath) {
  return publicPath ? path.join(distRoot, 'zh', publicPath, 'index.html') : path.join(distRoot, 'zh', 'index.html');
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

const sourceFiles = await filesBelow(docsRoot, '.md');
const missingRoutes = [];
for (const source of sourceFiles) {
  const id = path.relative(docsRoot, source).split(path.sep).join('/').replace(/\.md$/, '');
  const expected = routeFile(idToPublicPath(id));
  if (!await exists(expected)) missingRoutes.push(path.relative(distRoot, expected));
}

const htmlFiles = await filesBelow(distRoot, '.html');
const missingTargets = new Set();
const wrongBase = new Set();
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let href = match[1];
    if (!href || /^(https?:|mailto:|tel:|data:|#)/.test(href)) continue;
    if (!href.startsWith('/')) continue;
    if (base !== '/' && !href.startsWith(base)) {
      wrongBase.add(`${path.relative(distRoot, htmlFile)} -> ${href}`);
      continue;
    }
    if (base !== '/') href = `/${href.slice(base.length)}`;
    href = href.split(/[?#]/)[0];
    if (!href || href === '/' || href.startsWith('/rag/')) continue;
    const relative = href.replace(/^\/+/, '');
    const extension = path.extname(relative);
    const target = extension ? path.join(distRoot, relative) : path.join(distRoot, relative, 'index.html');
    if (!await exists(target)) missingTargets.add(`${path.relative(distRoot, htmlFile)} -> ${href}`);
  }
}

const result = {
  base,
  sourceMarkdown: sourceFiles.length,
  generatedHtml: htmlFiles.length,
  missingRoutes: missingRoutes.length,
  missingInternalTargets: missingTargets.size,
  wrongBaseLinks: wrongBase.size,
};
console.log(JSON.stringify(result, null, 2));

if (missingRoutes.length || missingTargets.size || wrongBase.size) {
  if (missingRoutes.length) console.error('Missing routes:\n' + missingRoutes.slice(0, 30).join('\n'));
  if (missingTargets.size) console.error('Missing targets:\n' + [...missingTargets].slice(0, 60).join('\n'));
  if (wrongBase.size) console.error('Wrong base links:\n' + [...wrongBase].slice(0, 60).join('\n'));
  process.exitCode = 1;
}
