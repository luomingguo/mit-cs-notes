import type { CollectionEntry } from 'astro:content';
import { execFileSync } from 'node:child_process';
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
  type: 'lecture' | 'course';
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
  security: '计算机安全',
  sw_eng: '软件工程',
  tcs: '理论计算机科学',
  index: '知识索引',
};

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

export function courseSlugOf(id: string): string {
  return id.split('/')[1] || id.split('/')[0] || 'notes';
}

export function courseKeyOf(id: string): string {
  return `${categoryOf(id)}/${courseSlugOf(id)}`;
}

export function domainLabelOf(id: string): string {
  const category = categoryOf(id);
  return DOMAIN_LABELS[category] ?? category.replaceAll('_', ' ');
}

/** Preserve the VitePress public rewrite: /zh/:category/:course/* -> /zh/:course/*. */
export function idToUrlPath(id: string): string {
  const [, ...rest] = id.split('/');
  return rest.join('/').replace(/\/index$/, '').replace(/^index$/, '');
}

export function idToHref(id: string): string {
  const publicPath = idToUrlPath(id);
  if (!publicPath) return '/zh/';
  return id.endsWith('/index') ? `/zh/${publicPath}/` : `/zh/${publicPath}`;
}

/**
 * Content collections cache rendered HTML before the page route is known. Convert
 * extensionless relative document links to the stable public URL here so Astro's
 * directory output (/lec4/) cannot turn `lec5` into `/lec4/lec5`.
 */
export function rewriteRenderedInternalLinks(html: string, currentId: string): string {
  const sourceDirectory = path.posix.dirname(currentId);
  return html.replace(/href="([^"]+)"/g, (attribute, href: string) => {
    if (/^(https?:|mailto:|#|\/)/.test(href)) return attribute;
    const match = href.match(/^([^?#]*)([?#].*)?$/);
    const hrefPath = match?.[1] ?? href;
    const suffix = match?.[2] ?? '';
    const extension = path.posix.extname(hrefPath);
    if (extension && extension !== '.md') return attribute;
    const resolved = path.posix
      .normalize(path.posix.join(sourceDirectory, hrefPath))
      .replace(/\.md$/, '');
    const publicSegments = resolved.split('/').slice(1);
    const isIndex = publicSegments.at(-1) === 'index';
    if (isIndex) publicSegments.pop();
    const publicHref = `/zh/${publicSegments.join('/')}${isIndex ? '/' : ''}${suffix}`;
    return `href="${publicHref}"`;
  });
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
  const lectures = courseEntries.filter((item) => lectureOf(item) !== undefined);
  const index = lectures.findIndex((item) => item.id === entry.id);
  return {
    prev: index > 0 ? lectures[index - 1] : null,
    next: index >= 0 && index < lectures.length - 1 ? lectures[index + 1] : null,
  };
}

export function buildNavLectures(entries: NoteEntry[], currentId: string): NavLecture[] {
  return entries
    .filter((entry) => lectureOf(entry) !== undefined)
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
    if (entry.id.endsWith('/index')) continue;
    const slug = categoryOf(entry.id);
    const bucket = byDomain.get(slug) ?? { notes: 0, courses: new Set<string>() };
    bucket.notes += 1;
    bucket.courses.add(courseKeyOf(entry.id));
    byDomain.set(slug, bucket);
  }
  const currentDomain = categoryOf(currentId);
  return [...byDomain.entries()]
    .map(([slug, value]) => ({
      slug,
      label: DOMAIN_LABELS[slug] ?? slug.replaceAll('_', ' '),
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
  const indexEntry = entries.find((entry) => entry.id.endsWith('/index'));
  const courseItem: SearchItem[] = indexEntry
    ? [{
        id: indexEntry.id,
        title: courseOf(indexEntry),
        course: courseIdOf(indexEntry),
        href: idToHref(indexEntry.id),
        type: 'course',
        typeLabel: '课程',
        excerpt: plainExcerpt(indexEntry.body ?? '', 96),
      }]
    : [];
  return courseItem.concat(entries
    .filter((entry) => lectureOf(entry) !== undefined)
    .map((entry) => ({
      id: entry.id,
      title: titleOf(entry),
      course: courseOf(entry),
      href: idToHref(entry.id),
      type: 'lecture' as const,
      typeLabel: '讲义',
      excerpt: plainExcerpt(entry.body ?? '', 96),
    })));
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
  const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
  const sourcePath = path.join(repoRoot, 'docs', 'zh', `${entry.id}.md`);
  try {
    const value = execFileSync('git', ['log', '-1', '--format=%cs', '--', sourcePath], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
    return value || null;
  } catch {
    return null;
  }
}
