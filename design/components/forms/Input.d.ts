import type { CSSProperties, InputHTMLAttributes } from 'react';

/** A single-line text field with the brand's inset paper well. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Helper line under the field. */
  hint?: string;
  /** Error message; turns the border coral and replaces the hint. */
  error?: string;
  /** Lucide slug shown inside the field, e.g. "search". */
  icon?: string;
  /** Trailing static text, e.g. a unit or a keyboard hint. */
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Style for the outer Field wrapper. */
  wrapperStyle?: CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
