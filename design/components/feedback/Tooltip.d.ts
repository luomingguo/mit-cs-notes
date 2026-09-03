import type { CSSProperties, ReactNode } from 'react';

/** A navy label on hover/focus. Names a control - never explains a concept (that is ConceptLink). */
export interface TooltipProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Mono keyboard hint appended in ocean-300. */
  kbd?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
