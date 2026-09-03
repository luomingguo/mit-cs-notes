import type { CSSProperties, MouseEventHandler } from 'react';

/** A square icon-only control for chrome. Always give it a label for a11y and a tooltip. */
export interface IconButtonProps {
  /** Lucide slug. */
  icon: string;
  /** Accessible name; also the native title. Required in practice. */
  label: string;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  /** Persistent on state, e.g. a toggled panel. */
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler;
  style?: CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
