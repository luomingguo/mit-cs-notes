import type { CSSProperties } from 'react';

export interface RadioOption { value: string; label: string; hint?: string }

/** A single-choice group. The only circular control in the system. */
export interface RadioProps {
  name?: string;
  options?: Array<string | RadioOption>;
  value?: string;
  defaultValue?: string;
  /** Receives the chosen value, not the event. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  direction?: 'column' | 'row';
  style?: CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
