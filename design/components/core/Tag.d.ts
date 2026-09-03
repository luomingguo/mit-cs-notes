import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

/** A pill for a 概念 or keyword, always prefixed with a hash glyph. */
export interface TagProps {
  href?: string;
  onClick?: MouseEventHandler;
  /** Adds a remove affordance - filter chips only. */
  onRemove?: MouseEventHandler;
  size?: 'sm' | 'md';
  /** Selected state in a filter row. */
  active?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Tag(props: TagProps): JSX.Element;
