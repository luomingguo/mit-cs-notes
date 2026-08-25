import type { CollectionEntry } from 'astro:content';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export type NoteEntry = CollectionEntry<'notes'>;

export interface NoteData {
  title?: string;
  course?: string;
  course_id?: string | number;
  lecture?: number;
  kind?: string;
  tags?: string[];
  status?: string;
  description?: string;
  hero?: {
    tagline?: string;
    text?: string;
    image?: { src?: string; alt?: string };
  };
}

export interface ComplexityFeatures {
  math: boolean;
  code: boolean;
  table: boolean;
  image: boolean;
  container: boolean;
  longHeadingCount: number;
  headingCount: number;
  titleLength: number;
  bytes: number;
  coverage: number;
}

export interface SearchItem {
  id: string;
  title: string;
  course: string;
  href: string;
  type: 'lecture' | 'course' | 'domain';
  typeLabel: string;
  excerpt: string;
}

export interface NavLecture {
  number: number | null;
  title: string;
  href: string;
  current: boolean;
}

export interface NavDomain {
  slug: string;
  label: string;
  href: string;
  noteCount: number;
  courseCount: number;
  active: boolean;
}

export interface Backlink {
  title: string;
  href: string;
  context: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  arch: '计算机架构',
  computer_sys: '计算机系统',
  language: '编程语言',
  opensource: '开源项目',
  opensrc: '开源项目',
  security: '计算机安全',
  sw_eng: '软件工程',
  tcs: '理论计算机科学',
  index: '知识索引',
};

const SITE_BASE = normalizeBase(process.env.DOCS_BASE ?? '/');
const SOURCE_CATEGORIES = new Set(['arch', 'computer_sys', 'index', 'language', 'opensource', 'security', 'sw_eng', 'tcs']);
let gitUpdatedCache: Map<string, string> | null = null;

function projectRoot(): string {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    fileURLToPath(new URL('../../../', import.meta.url)),
  ];
  return candidates.find((candidate) => existsSync(path.join(candidate, 'docs', 'zh'))) ?? candidates[0];
}

function normalizeBase(value: string): string {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash === '/' ? '/' : `${withLeadingSlash.replace(/\/+$/, '')}/`;
}

export function withBasePath(href: string): string {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const absolute = href.startsWith('/') ? href : `/${href}`;
  if (SITE_BASE === '/') return absolute;
  const prefix = SITE_BASE.slice(0, -1);
  return absolute === prefix || absolute.startsWith(`${prefix}/`) ? absolute : `${prefix}${absolute}`;
}

export function siteBase(): string {
  return SITE_BASE;
}

export function dataOf(entry: NoteEntry): NoteData {
  return entry.data as NoteData;
}

export function titleOf(entry: NoteEntry): string {
  const title = dataOf(entry).title;
  if (typeof title === 'string' && title.trim()) return title.trim();
  const h1 = (entry.body ?? '').match(/^#\s+(.+)$/m)?.[1];
  return h1?.replace(/[*_`]/g, '').trim() || entry.id.split('/').at(-1) || '未命名笔记';
}

export function courseOf(entry: NoteEntry): string {
  const course = dataOf(entry).course;
  return typeof course === 'string' && course.trim() ? course.trim() : courseSlugOf(entry.id);
}

export function courseIdOf(entry: NoteEntry): string {
  const id = dataOf(entry).course_id;
  return id === undefined ? '' : String(id);
}

export function lectureOf(entry: NoteEntry): number | undefined {
  const lecture = dataOf(entry).lecture;
  return typeof lecture === 'number' && Number.isFinite(lecture) ? lecture : undefined;
}

export function categoryOf(id: string): string {
  return id.split('/')[0] || 'index';
}

export function canonicalDomainSlug(category: string): string {
  return category === 'opensource' ? 'opensrc' : category;
}

export function courseSlugOf(id: string): string {
  return id.split('/')[1] || id.split('/')[0] || 'notes';
}

export function courseKeyOf(id: string): string {
  return `${categoryOf(id)}/${courseSlugOf(id)}`;
}

export function domainLabelOf(id: string): string {
  const category = canonicalDomainSlug(categoryOf(id));
  return DOMAIN_LABELS[category] ?? category.replaceAll('_', ' ');
}

export function isRootIndex(entry: NoteEntry): boolean {
  return entry.id === 'index';
}

export function isDomainIndex(entry: NoteEntry): boolean {
  const parts = entry.id.split('/');
  return parts.length === 2 && parts[1] === 'index';
}

export function isCourseIndex(entry: NoteEntry): boolean {
  const parts = entry.id.split('/');
  return parts.length >= 3 && parts.at(-1) === 'index';
}

/** Preserve the VitePress public rewrite: /zh/:category/:course/* -> /zh/:course/*. */
export function idToUrlPath(id: string): string {
  const parts = id.split('/');
  if (id === 'index') return '';
  if (parts.length === 2 && parts[1] === 'index') return parts[0];
  const publicParts = parts.length >= 3 ? parts.slice(1) : parts;
  return publicParts.join('/').replace(/\/index$/, '').replace(/^index$/, '');
}

export function idToHref(id: string): string {
  const publicPath = idToUrlPath(id);
  if (!publicPath) return withBasePath('/zh/');
  return withBasePath(id.endsWith('/index') ? `/zh/${publicPath}/` : `/zh/${publicPath}`);
}

function resolvedContentAssetPath(resolved: string): string {
  const parts = resolved.split('/');
  const publicParts = parts.length >= 3 ? parts.slice(1) : parts;
  return withBasePath(`/zh/${publicParts.join('/')}`);
}

function canonicalAbsoluteHref(href: string): string {
  const match = href.match(/^([^?#]*)([?#].*)?$/);
  let hrefPath = match?.[1] ?? href;
  const suffix = match?.[2] ?? '';
  const parts = hrefPath.split('/').filter(Boolean);
  if (parts[0] === 'zh' && parts.length >= 3 && SOURCE_CATEGORIES.has(parts[1])) {
    hrefPath = `/${['zh', ...parts.slice(2)].join('/')}${hrefPath.endsWith('/') ? '/' : ''}`;
  }
  return `${withBasePath(hrefPath)}${suffix}`;
}

/**
 * Content collections cache rendered HTML before the page route is known. Convert
 * extensionless relative document links to the stable public URL here so Astro's
 * directory output (/lec4/) cannot turn `lec5` into `/lec4/lec5`.
 */
export function rewriteRenderedInternalLinks(html: string, currentId: string): string {
  const sourceDirectory = path.posix.dirname(currentId);
  const protectedSegments: string[] = [];
  const protectedHtml = html.replace(/<(pre|code)\b[\s\S]*?<\/\1>/gi, (segment) => {
    const index = protectedSegments.push(segment) - 1;
    return `@@PROTECTED-${index}@@`;
  });
  const rewritten = protectedHtml.replace(/(href|src)="([^"]+)"/g, (attribute, name: string, href: string) => {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) return attribute;
    if (/^\[https?:/.test(href)) return `${name}="${href.slice(1)}"`;
    if (href.startsWith('/')) return `${name}="${canonicalAbsoluteHref(href)}"`;
    const match = href.match(/^([^?#]*)([?#].*)?$/);
    const hrefPath = match?.[1] ?? href;
    const suffix = match?.[2] ?? '';
    const extension = path.posix.extname(hrefPath);
    const resolved = path.posix
      .normalize(path.posix.join(sourceDirectory, hrefPath))
      .replace(/\.md$/, '');
    if (extension && extension !== '.md') {
      const sourceAsset = path.join(projectRoot(), 'docs', 'zh', resolved);
      if (name === 'href' && !existsSync(sourceAsset)) return `${name}="${withBasePath('/missing-resource/')}"`;
      return `${name}="${resolvedContentAssetPath(resolved)}${suffix}"`;
    }
    if (name === 'src') return attribute;
    const isIndex = resolved.endsWith('/index') || resolved === 'index';
    const publicPath = idToUrlPath(resolved);
    const publicHref = withBasePath(`/zh/${publicPath}${isIndex ? '/' : ''}`);
    return `href="${publicHref}${suffix}"`;
  });
  return rewritten.replace(/@@PROTECTED-(\d+)@@/g, (_placeholder, index: string) => protectedSegments[Number(index)] ?? '');
}

export function complexityOf(entry: NoteEntry): ComplexityFeatures {
  const source = entry.body ?? '';
  const titleLength = Array.from(titleOf(entry)).length;
  const values = {
    math: /\$\$[\s\S]+?\$\$|\$[^\n$]+\$/.test(source),
    code: /```[\w+-]*\n/.test(source),
    table: /^\|.*\|\s*$/m.test(source) && /^\|?\s*:?-{3,}/m.test(source),
    image: /!\[[^\]]*\]\([^)]+\)/.test(source),
    container: /^:::\s*(definition|theorem|example|insight|pitfall)\b/m.test(source),
  };
  return {
    ...values,
    longHeadingCount: (source.match(/^#{1,4}\s+.{18,}$/gm) ?? []).length,
    headingCount: (source.match(/^#{1,4}\s+/gm) ?? []).length,
    titleLength,
    bytes: Buffer.byteLength(source, 'utf8'),
    coverage: Object.values(values).filter(Boolean).length,
  };
}

/**
 * Deterministic sample selection. A winner must cover all five rendering risks;
 * ties prefer a longer real title, more long headings, more headings, then size.
 */
export function selectComplexNote(entries: NoteEntry[]): NoteEntry {
  const ranked = entries
    .filter((entry) => !entry.id.endsWith('/index'))
    .map((entry) => ({ entry, features: complexityOf(entry) }))
    .filter(({ features }) => features.coverage === 5)
    .sort((a, b) =>
      b.features.titleLength - a.features.titleLength ||
      b.features.longHeadingCount - a.features.longHeadingCount ||
      b.features.headingCount - a.features.headingCount ||
      b.features.bytes - a.features.bytes ||
      a.entry.id.localeCompare(b.entry.id),
    );

  if (!ranked[0]) {
    throw new Error('没有找到同时包含公式、代码、表格、图片和语义容器的真实中文笔记。');
  }
  return ranked[0].entry;
}

export function courseEntriesOf(entries: NoteEntry[], id: string): NoteEntry[] {
  const key = courseKeyOf(id);
  return entries
    .filter((entry) => courseKeyOf(entry.id) === key)
    .sort((a, b) => {
      if (a.id.endsWith('/index')) return -1;
      if (b.id.endsWith('/index')) return 1;
      const an = lectureOf(a);
      const bn = lectureOf(b);
      if (an !== undefined && bn !== undefined) return an - bn;
      if (an !== undefined) return -1;
      if (bn !== undefined) return 1;
      return titleOf(a).localeCompare(titleOf(b), 'zh');
    });
}

export function findPrevNext(entry: NoteEntry, courseEntries: NoteEntry[]) {
  const lectures = courseEntries.filter((item) => !isCourseIndex(item));
  const index = lectures.findIndex((item) => item.id === entry.id);
  return {
    prev: index > 0 ? lectures[index - 1] : null,
    next: index >= 0 && index < lectures.length - 1 ? lectures[index + 1] : null,
  };
}

export function buildNavLectures(entries: NoteEntry[], currentId: string): NavLecture[] {
  return entries
    .filter((entry) => !isCourseIndex(entry))
    .map((entry) => ({
      number: lectureOf(entry) ?? null,
      title: titleOf(entry),
      href: idToHref(entry.id),
      current: entry.id === currentId,
    }));
}

export function buildTaxonomy(entries: NoteEntry[], currentId: string): NavDomain[] {
  const byDomain = new Map<string, { notes: number; courses: Set<string> }>();
  for (const entry of entries) {
    if (entry.id.endsWith('/index') || !entry.id.includes('/')) continue;
    const slug = canonicalDomainSlug(categoryOf(entry.id));
    const bucket = byDomain.get(slug) ?? { notes: 0, courses: new Set<string>() };
    bucket.notes += 1;
    bucket.courses.add(courseKeyOf(entry.id));
    byDomain.set(slug, bucket);
  }
  const currentDomain = canonicalDomainSlug(categoryOf(currentId));
  return [...byDomain.entries()]
    .map(([slug, value]) => ({
      slug,
      label: DOMAIN_LABELS[slug] ?? slug.replaceAll('_', ' '),
      href: withBasePath(`/zh/${slug}/`),
      noteCount: value.notes,
      courseCount: value.courses.size,
      active: slug === currentDomain,
    }))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.label.localeCompare(b.label, 'zh'));
}

export function plainExcerpt(source: string, maxLength = 180): string {
  const withoutFrontmatter = source.replace(/^---[\s\S]*?---\s*/, '');
  const paragraphs = withoutFrontmatter
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) =>
      block.length > 35 &&
      !/^(#|```|:::|\||!\[|<img|---|\$\$)/.test(block),
    )
    .map((block) =>
      block
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`>#]/g, '')
        .replace(/\$([^$]+)\$/g, '$1')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  const text = paragraphs[0] || '该文档暂无可提取的正文摘要。';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export function buildSearchIndex(entries: NoteEntry[]): SearchItem[] {
  const domains = entries
    .filter(isDomainIndex)
    .map((entry) => ({
      id: entry.id,
      title: titleOf(entry),
      course: '领域',
      href: idToHref(entry.id),
      type: 'domain' as const,
      typeLabel: '领域',
      excerpt: plainExcerpt(entry.body ?? '', 96),
    }));
  const courses = entries
    .filter(isCourseIndex)
    .map((entry) => ({
      id: entry.id,
      title: courseOf(entry),
      course: courseIdOf(entry),
      href: idToHref(entry.id),
      type: 'course' as const,
      typeLabel: '课程',
      excerpt: plainExcerpt(entry.body ?? '', 96),
    }));
  const notes = entries
    .filter((entry) => !entry.id.endsWith('/index') && !isRootIndex(entry))
    .map((entry) => ({
      id: entry.id,
      title: titleOf(entry),
      course: courseOf(entry),
      href: idToHref(entry.id),
      type: 'lecture' as const,
      typeLabel: '讲义',
      excerpt: plainExcerpt(entry.body ?? '', 96),
    }));
  return [...domains, ...courses, ...notes];
}

function normalizedLinkTargets(source: string): string[] {
  return [...source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter((href) => href && !/^(https?:|mailto:)/.test(href));
}

export function findBacklinks(target: NoteEntry, entries: NoteEntry[]): Backlink[] {
  const targetFile = `${target.id.split('/').at(-1)}.md`;
  const targetHref = idToHref(target.id);
  return entries
    .filter((entry) => entry.id !== target.id)
    .filter((entry) => normalizedLinkTargets(entry.body ?? '').some((href) =>
      href.endsWith(targetFile) || href.replace(/\.md$/, '') === targetHref,
    ))
    .map((entry) => ({
      title: entry.id.endsWith('/index') ? '课程目录' : titleOf(entry),
      href: idToHref(entry.id),
      context: entry.id.endsWith('/index') ? courseIdOf(entry) : `Lec ${lectureOf(entry) ?? '—'}`,
    }));
}

export function tagsOf(entry: NoteEntry): string[] {
  const tags = dataOf(entry).tags;
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0) : [];
}

export function lastUpdatedOf(entry: NoteEntry): string | null {
  if (!gitUpdatedCache) {
    gitUpdatedCache = new Map<string, string>();
    try {
      const history = execFileSync('git', ['log', '--format=@@%cs', '--name-only', '--', 'docs/zh'], {
        cwd: projectRoot(),
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
      });
      let date = '';
      for (const line of history.split('\n')) {
        if (line.startsWith('@@')) {
          date = line.slice(2);
          continue;
        }
        if (!date || !line.startsWith('docs/zh/') || !line.endsWith('.md')) continue;
        const id = line.slice('docs/zh/'.length, -'.md'.length);
        if (!gitUpdatedCache.has(id)) gitUpdatedCache.set(id, date);
      }
    } catch {
      gitUpdatedCache.clear();
    }
  }
  return gitUpdatedCache.get(entry.id) ?? null;
}
