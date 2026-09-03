import type { CSSProperties, ReactNode } from 'react';

/** Label + hint/error shell. Every other form control already wraps itself in one. */
export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  inline?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}
export declare function Field(props: FieldProps): JSX.Element;
