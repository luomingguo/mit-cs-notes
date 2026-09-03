import type { CSSProperties, ReactNode } from 'react';

/** A small status or classification marker. Squared corners - not a pill (that is Tag). */
export interface BadgeProps {
  tone?: 'neutral' | 'ocean' | 'gold' | 'kelp' | 'coral';
  variant?: 'soft' | 'solid' | 'outline';
  /** Lucide slug at 11px. */
  icon?: string;
  /** Uppercase + tracked, for Latin eyebrow markers only. Never with CJK. */
  uppercase?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
