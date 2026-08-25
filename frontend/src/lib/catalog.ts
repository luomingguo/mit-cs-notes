import type { NoteEntry } from '@/lib/notes';
import {
  canonicalDomainSlug,
  categoryOf,
  courseIdOf,
  courseKeyOf,
  courseOf,
  dataOf,
  domainLabelOf,
  idToHref,
  isCourseIndex,
  isDomainIndex,
  lastUpdatedOf,
  lectureOf,
  plainExcerpt,
  tagsOf,
  titleOf,
  withBasePath,
} from '@/lib/notes';

export interface CourseSummary {
  key: string;
  slug: string;
  domainSlug: string;
  domainLabel: string;
  title: string;
  courseId: string;
  href: string;
  noteCount: number;
  lectureCount: number;
  status: string;
  excerpt: string;
  tags: string[];
  indexEntry: NoteEntry | null;
  entries: NoteEntry[];
}

export interface DomainSummary {
  slug: string;
  label: string;
  href: string;
  description: string;
  noteCount: number;
  courseCount: number;
  tags: string[];
  courses: CourseSummary[];
  indexEntry: NoteEntry | null;
}

export interface RecentNote {
  title: string;
  href: string;
  course: string;
  status: string;
  updated: string;
}

export interface LibraryCatalog {
  domains: DomainSummary[];
  courses: CourseSummary[];
  totalNotes: number;
  totalCourses: number;
  tags: string[];
  recent: RecentNote[];
}

function domainDescription(entry: NoteEntry | null, courses: CourseSummary[]): string {
  const data = (entry ? dataOf(entry) : {}) as NoteEntry['data'] & {
    hero?: { tagline?: unknown; text?: unknown };
    description?: unknown;
  };
  if (typeof data.hero?.tagline === 'string' && data.hero.tagline.trim()) return data.hero.tagline.trim();
  if (typeof data.description === 'string' && data.description.trim()) return data.description.trim();
  if (courses.length) {
    const names = courses.slice(0, 5).map((course) => course.title);
    return `收录 ${names.join('、')}${courses.length > names.length ? '等课程' : '课程'}的中文技术笔记。`;
  }
  return entry ? plainExcerpt(entry.body ?? '', 150) : '该领域暂无结构化简介。';
}

function courseStatus(indexEntry: NoteEntry | null): string {
  const status = indexEntry ? dataOf(indexEntry).status : undefined;
  return typeof status === 'string' && status.trim() ? status.trim() : '未标注';
}

export function buildCatalog(entries: NoteEntry[]): LibraryCatalog {
  const domainIndexes = new Map<string, NoteEntry>();
  for (const entry of entries.filter(isDomainIndex)) {
    domainIndexes.set(canonicalDomainSlug(categoryOf(entry.id)), entry);
  }

  const groupedCourses = new Map<string, NoteEntry[]>();
  for (const entry of entries) {
    if (entry.id.split('/').length < 3) continue;
    const key = courseKeyOf(entry.id);
    const group = groupedCourses.get(key) ?? [];
    group.push(entry);
    groupedCourses.set(key, group);
  }

  const courses: CourseSummary[] = [...groupedCourses.entries()].map(([key, courseEntries]) => {
    const sorted = [...courseEntries].sort((a, b) => {
      if (isCourseIndex(a)) return -1;
      if (isCourseIndex(b)) return 1;
      const an = lectureOf(a);
      const bn = lectureOf(b);
      if (an !== undefined && bn !== undefined) return an - bn;
      if (an !== undefined) return -1;
      if (bn !== undefined) return 1;
      return titleOf(a).localeCompare(titleOf(b), 'zh');
    });
    const indexEntry = sorted.find(isCourseIndex) ?? null;
    const first = indexEntry ?? sorted[0];
    const domainSlug = canonicalDomainSlug(categoryOf(first.id));
    const noteEntries = sorted.filter((entry) => !isCourseIndex(entry));
    const tags = [...new Set(sorted.flatMap(tagsOf))].sort((a, b) => a.localeCompare(b, 'zh'));
    return {
      key,
      slug: key.split('/')[1],
      domainSlug,
      domainLabel: domainLabelOf(first.id),
      title: indexEntry ? courseOf(indexEntry) : courseOf(first),
      courseId: indexEntry ? courseIdOf(indexEntry) : courseIdOf(first),
      href: idToHref(indexEntry?.id ?? first.id),
      noteCount: noteEntries.length,
      lectureCount: noteEntries.filter((entry) => lectureOf(entry) !== undefined).length,
      status: courseStatus(indexEntry),
      excerpt: plainExcerpt((indexEntry ?? first).body ?? '', 150),
      tags,
      indexEntry,
      entries: sorted,
    };
  }).sort((a, b) => a.domainLabel.localeCompare(b.domainLabel, 'zh') || a.title.localeCompare(b.title, 'zh'));

  const coursesByDomain = new Map<string, CourseSummary[]>();
  for (const course of courses) {
    const group = coursesByDomain.get(course.domainSlug) ?? [];
    group.push(course);
    coursesByDomain.set(course.domainSlug, group);
  }

  const domainSlugs = new Set([...domainIndexes.keys(), ...coursesByDomain.keys()]);
  const domains: DomainSummary[] = [...domainSlugs].map((slug) => {
    const domainCourses = coursesByDomain.get(slug) ?? [];
    const indexEntry = domainIndexes.get(slug) ?? null;
    const label = indexEntry ? titleOf(indexEntry) : domainCourses[0]?.domainLabel ?? slug.replaceAll('_', ' ');
    return {
      slug,
      label,
      href: idToHref(indexEntry?.id ?? `${slug}/index`),
      description: domainDescription(indexEntry, domainCourses),
      noteCount: domainCourses.reduce((sum, course) => sum + course.noteCount, 0),
      courseCount: domainCourses.length,
      tags: [...new Set(domainCourses.flatMap((course) => course.tags))].sort((a, b) => a.localeCompare(b, 'zh')),
      courses: domainCourses,
      indexEntry,
    };
  }).sort((a, b) => b.noteCount - a.noteCount || a.label.localeCompare(b.label, 'zh'));

  const recent = entries
    .filter((entry) => !entry.id.endsWith('/index'))
    .map((entry) => ({
      title: titleOf(entry),
      href: idToHref(entry.id),
      course: courseIdOf(entry) || courseOf(entry),
      status: String(dataOf(entry).status ?? '未标注'),
      updated: lastUpdatedOf(entry) ?? '',
    }))
    .filter((entry) => entry.updated)
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title, 'zh'))
    .slice(0, 8);

  return {
    domains,
    courses,
    totalNotes: entries.filter((entry) => !entry.id.endsWith('/index')).length,
    totalCourses: courses.length,
    tags: [...new Set(courses.flatMap((course) => course.tags))].sort((a, b) => a.localeCompare(b, 'zh')),
    recent,
  };
}

export function domainForEntry(catalog: LibraryCatalog, entry: NoteEntry): DomainSummary | null {
  const slug = canonicalDomainSlug(categoryOf(entry.id));
  return catalog.domains.find((domain) => domain.slug === slug) ?? null;
}

export function courseForEntry(catalog: LibraryCatalog, entry: NoteEntry): CourseSummary | null {
  return catalog.courses.find((course) => course.key === courseKeyOf(entry.id)) ?? null;
}

export function catalogHomeHref(): string {
  return withBasePath('/');
}
