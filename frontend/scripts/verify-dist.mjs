import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../', import.meta.url));
const distRoot = path.join(frontendRoot, 'dist');
const docsRoot = path.resolve(frontendRoot, '../docs/zh');
const publicRoot = path.resolve(frontendRoot, '../public');
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
  if (parts.length < 2) return parts.join('/').replace(/\/index$/, '').replace(/^index$/, '');
  const [discipline, category, ...rest] = parts;
  let publicParts;
  if (discipline === 'cs') {
    publicParts = rest.length === 1 && rest[0] === 'index' ? [category === 'opensource' ? 'opensrc' : category] : rest;
  } else {
    publicParts = rest.length === 1 && rest[0] === 'index'
      ? [discipline, category]
      : [discipline, ...rest];
  }
  return publicParts.join('/').replace(/\/index$/, '').replace(/^index$/, '');
}

const routeContracts = new Map([
  ['cs/computer_sys/os/lec5', 'os/lec5'],
  ['cs/tcs/index', 'tcs'],
  ['psy/core/intro/lec1', 'psy/intro/lec1'],
  ['mgnt/org/leadership/index', 'mgnt/leadership'],
]);
for (const [sourceId, expected] of routeContracts) {
  const actual = idToPublicPath(sourceId);
  if (actual !== expected) throw new Error(`路由契约错误：${sourceId} -> ${actual}，预期 ${expected}`);
}

function routeFile(publicPath) {
  return publicPath ? path.join(distRoot, 'zh', publicPath, 'index.html') : path.join(distRoot, 'zh', 'index.html');
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

const sourceFiles = await filesBelow(docsRoot, '.md');
const sourcePublicFiles = (await filesBelow(publicRoot)).filter((file) => path.basename(file) !== '.DS_Store');
const missingRoutes = [];
for (const source of sourceFiles) {
  const id = path.relative(docsRoot, source).split(path.sep).join('/').replace(/\.md$/, '');
  const expected = routeFile(idToPublicPath(id));
  if (!await exists(expected)) missingRoutes.push(path.relative(distRoot, expected));
}

const missingPublicAssets = [];
const changedPublicAssets = [];
for (const source of sourcePublicFiles) {
  const relative = path.relative(publicRoot, source);
  const target = path.join(distRoot, relative);
  if (!await exists(target)) {
    missingPublicAssets.push(relative);
    continue;
  }
  const [sourceContent, targetContent] = await Promise.all([readFile(source), readFile(target)]);
  if (!sourceContent.equals(targetContent)) changedPublicAssets.push(relative);
}

const learningPathSource = JSON.parse(await readFile(path.join(publicRoot, 'rag-paths.json'), 'utf8'));
const missingLearningPathTargets = new Set();
for (const route of Object.values(learningPathSource.paths ?? {})) {
  for (const step of route.steps ?? []) {
    for (const note of step.notes ?? []) {
      if (typeof note.url !== 'string' || !note.url.startsWith('/')) continue;
      const relative = note.url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
      const extension = path.extname(relative);
      const target = extension ? path.join(distRoot, relative) : path.join(distRoot, relative, 'index.html');
      if (!await exists(target)) missingLearningPathTargets.add(note.url);
    }
  }
}

const learningPathPage = path.join(distRoot, 'zh', 'paths', 'index.html');
const learningPathHtml = await exists(learningPathPage) ? await readFile(learningPathPage, 'utf8') : '';
const unmigratedLearningPath = !learningPathHtml.includes('class="learning-path"') || /<learningpath(?:\s|>)/i.test(learningPathHtml);

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
  routeContracts: routeContracts.size,
  sourceMarkdown: sourceFiles.length,
  sourcePublicAssets: sourcePublicFiles.length,
  generatedHtml: htmlFiles.length,
  missingRoutes: missingRoutes.length,
  missingPublicAssets: missingPublicAssets.length,
  changedPublicAssets: changedPublicAssets.length,
  missingLearningPathTargets: missingLearningPathTargets.size,
  unmigratedLearningPath: Number(unmigratedLearningPath),
  missingInternalTargets: missingTargets.size,
  wrongBaseLinks: wrongBase.size,
};
console.log(JSON.stringify(result, null, 2));

if (missingRoutes.length || missingPublicAssets.length || changedPublicAssets.length || missingLearningPathTargets.size || unmigratedLearningPath || missingTargets.size || wrongBase.size) {
  if (missingRoutes.length) console.error('Missing routes:\n' + missingRoutes.slice(0, 30).join('\n'));
  if (missingPublicAssets.length) console.error('Missing public assets:\n' + missingPublicAssets.slice(0, 30).join('\n'));
  if (changedPublicAssets.length) console.error('Changed public assets:\n' + changedPublicAssets.slice(0, 30).join('\n'));
  if (missingLearningPathTargets.size) console.error('Missing learning-path targets:\n' + [...missingLearningPathTargets].slice(0, 30).join('\n'));
  if (unmigratedLearningPath) console.error('LearningPath placeholder was not replaced by the Astro/React implementation.');
  if (missingTargets.size) console.error('Missing targets:\n' + [...missingTargets].slice(0, 60).join('\n'));
  if (wrongBase.size) console.error('Wrong base links:\n' + [...wrongBase].slice(0, 60).join('\n'));
  process.exitCode = 1;
}
