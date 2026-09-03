import type { CSSProperties, TextareaHTMLAttributes } from 'react';

/** Multi-line input. Set in the serif reading face because what goes in it is prose. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  rows?: number;
  wrapperStyle?: CSSProperties;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
