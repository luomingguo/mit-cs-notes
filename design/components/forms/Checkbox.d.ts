import type { CSSProperties, ChangeEventHandler } from 'react';

/** A square checkbox with a 2px-radius ocean fill when on. */
export interface CheckboxProps {
  label?: string;
  /** Second line under the label. */
  hint?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
