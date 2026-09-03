import type { CSSProperties } from 'react';

/**
 * The Archipelago lockup: circular badge + name set in Playfair Display.
 */
export interface LogoProps {
  /** Path to the badge PNG, relative to the host page. Pass this on any page not at the project root. */
  src?: string;
  /** Badge edge length in px. Never below 48 for the badge alone; 32-40 in a header lockup. */
  size?: number;
  /** Hide the type to use the badge alone. */
  showName?: boolean;
  /** Show the 群岛 · 公开课笔记 sub-line. Drop it below 32px. */
  showCn?: boolean;
  /** "auto" follows data-theme; force with "ink" or "inverse". */
  tone?: 'auto' | 'ink' | 'inverse';
  href?: string;
  style?: CSSProperties;
}
export declare function Logo(props: LogoProps): JSX.Element;
