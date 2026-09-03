import type { CSSProperties } from 'react';

/**
 * One 讲义 in a list or grid: lecture badge, course, title, 摘要, concepts, meta rule.
 */
export interface NoteCardProps {
  title: string;
  /** The 摘要 - one or two sentences, ~60 字 max. */
  summary?: string;
  /** Parent course name. */
  course?: string;
  /** Lecture marker, e.g. "第 3 讲". */
  lecture?: string;
  /** e.g. "约 12 分钟". */
  readingTime?: string;
  /** Up to four are rendered. */
  concepts?: string[];
  updated?: string;
  href?: string;
  style?: CSSProperties;
}
export declare function NoteCard(props: NoteCardProps): JSX.Element;
