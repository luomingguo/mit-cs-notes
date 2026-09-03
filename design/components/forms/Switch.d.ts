import type { CSSProperties, ChangeEventHandler } from 'react';

/** An immediate-effect toggle (view options, theme). Use Checkbox for anything that needs saving. */
export interface SwitchProps {
  label?: string;
  hint?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}
export declare function Switch(props: SwitchProps): JSX.Element;
