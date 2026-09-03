import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

/**
 * The paper container: parchment fill, hairline border, 8px radius, barely-there shadow.
 */
export interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Enables the 2px lift on hover. Implied by href/onClick. */
  interactive?: boolean;
  /** Adds the page-edge inner highlight. Feature cards only. */
  sheen?: boolean;
  href?: string;
  onClick?: MouseEventHandler;
  /** Override the rendered element, e.g. "article" or "li". */
  as?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
