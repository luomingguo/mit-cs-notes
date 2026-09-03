import type { CSSProperties } from 'react';

export interface TabItem { value: string; label: string; icon?: string; count?: number }

/** Underline tabs for switching views of the same content. Never a filled pill group. */
export interface TabsProps {
  items?: Array<string | TabItem>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
