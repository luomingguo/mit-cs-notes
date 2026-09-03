import type { CSSProperties } from 'react';

export interface TocItem { id: string; label: string; level?: 2 | 3 }

/** Sticky right-rail contents for a long 讲义. Answers "这篇在讲什么" at a glance. */
export interface TableOfContentsProps {
  items?: TocItem[];
  /** id of the section currently in view. */
  active?: string;
  onSelect?: (id: string) => void;
  /** Set null to hide the tracked label. */
  title?: string | null;
  style?: CSSProperties;
}
export declare function TableOfContents(props: TableOfContentsProps): JSX.Element;
