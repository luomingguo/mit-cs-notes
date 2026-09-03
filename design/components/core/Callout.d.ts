import type { CSSProperties, ReactNode } from 'react';

/** The margin apparatus block: prerequisites, next steps, cautions, log entries. */
export interface CalloutProps {
  /** prereq answers 需要先读; next answers 接下来可以读. */
  kind?: 'note' | 'prereq' | 'next' | 'caution' | 'log';
  /** Override the default Chinese label. */
  label?: string;
  /** Set false for a rule-only, untinted block inside dense prose. */
  tinted?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Callout(props: CalloutProps): JSX.Element;
