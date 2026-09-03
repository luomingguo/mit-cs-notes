import type { CSSProperties } from 'react';

/** A single Lucide glyph, masked so it takes currentColor. Chrome only — never in body copy. */
export interface IconProps {
  /** Lucide icon slug, e.g. "compass", "book-open", "link". */
  name: string;
  /** Square size in px. 16 beside 13-15px labels, 18 in buttons, 20 in nav, 24 standalone. */
  size?: number;
  /** Override the fill; defaults to currentColor. */
  color?: string;
  style?: CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
