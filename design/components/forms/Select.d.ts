import type { CSSProperties, SelectHTMLAttributes } from 'react';

export interface SelectOption { value: string; label: string }

/** Native select with brand chrome and a Lucide chevron. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  /** Strings or {value,label} pairs. */
  options?: Array<string | SelectOption>;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  wrapperStyle?: CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
