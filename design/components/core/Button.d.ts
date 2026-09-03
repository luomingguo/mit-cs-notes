import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

/**
 * The action control. Ocean fill for the single primary action per view; everything else is quieter.
 */
export interface ButtonProps {
  /** primary = the one ocean-filled action on a view. quiet = text-only, sits inline. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'quiet' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide slug rendered before the label. */
  icon?: string;
  /** Lucide slug rendered after the label - usually "arrow-right" on a route action. */
  iconRight?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Renders an anchor instead of a button. */
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
