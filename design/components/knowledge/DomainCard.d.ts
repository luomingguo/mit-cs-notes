import type { CSSProperties } from 'react';

/**
 * One 领域 as a deep-sea tile - the abyss world's main appearance outside heroes.
 */
export interface DomainCardProps {
  /** Chinese domain name, e.g. 政治哲学. */
  name: string;
  /** Tracked uppercase Latin line above the name, e.g. "POLITICAL PHILOSOPHY". */
  latin?: string;
  summary?: string;
  courseCount?: number;
  noteCount?: number;
  /** Up to five landmark concepts, shown as dashed pills. */
  concepts?: string[];
  href?: string;
  style?: CSSProperties;
}
export declare function DomainCard(props: DomainCardProps): JSX.Element;
