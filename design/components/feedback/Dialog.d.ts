import type { CSSProperties, ReactNode } from 'react';

/** A centred modal. The only place 14px radius and shadow level 3 are allowed. */
export interface DialogProps {
  open?: boolean;
  title?: string;
  /** Tracked uppercase gold line above the title. */
  eyebrow?: string;
  /** Called on the close button, scrim click, and Escape. */
  onClose?: () => void;
  /** Action row; put Buttons here, primary last. */
  footer?: ReactNode;
  /** Max width in px. */
  width?: number;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
