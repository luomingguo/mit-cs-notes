import type { CSSProperties } from 'react';

/**
 * One 课程 - an island, with its institution, code, and how much of it is charted.
 */
export interface CourseCardProps {
  title: string;
  /** e.g. "Harvard" / "MIT". */
  institution?: string;
  /** Course code, set in mono, e.g. "6.006". */
  code?: string;
  summary?: string;
  noteCount?: number;
  conceptCount?: number;
  /** Parent 领域, rendered as the gold eyebrow. */
  domain?: string;
  /** Free text like "已整理 8 / 12"; never a percentage bar. */
  progress?: string;
  href?: string;
  style?: CSSProperties;
}
export declare function CourseCard(props: CourseCardProps): JSX.Element;
