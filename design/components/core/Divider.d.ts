import type { CSSProperties } from 'react';

/** A rule. hairline for structure, route (dashed) for the sea-lane motif, gold for a titled break. */
export interface DividerProps {
  variant?: 'hairline' | 'route' | 'gold';
  orientation?: 'horizontal' | 'vertical';
  /** Centres a tracked uppercase label between two rules. */
  label?: string;
  style?: CSSProperties;
}
export declare function Divider(props: DividerProps): JSX.Element;
