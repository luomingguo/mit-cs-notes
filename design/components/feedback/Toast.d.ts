import type { CSSProperties, ReactNode } from 'react';

/** A transient navy notice. Always dark, even on paper surfaces. */
export interface ToastProps {
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  title?: string;
  /** Optional second line, 13px sans. */
  children?: ReactNode;
  /** A single quiet Button. */
  action?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
