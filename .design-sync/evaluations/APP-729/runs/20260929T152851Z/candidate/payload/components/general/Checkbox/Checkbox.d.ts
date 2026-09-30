import * as React from 'react';

/**
 * Checkbox — from @aragon/gov-ui-kit@2.11.4.
 * @replaces input[type=checkbox]
 */
export interface CheckboxProps {
  /** Label of the checkbox. */
  label: string;
  style?: React.CSSProperties;
  className?: string;
  /** Id of the checkbox. */
  id?: string;
  children?: React.ReactNode;
  /** Indicates if the checkbox is disabled. */
  disabled?: boolean;
  /** Position of the label. */
  labelPosition?: "right" | "left";
  /** The checked state of the checkbox. */
  checked?: boolean | "indeterminate";
  /** Callback when the checked state changes. */
  onCheckedChange?: (checked: CheckboxState) => void;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { CheckboxState } from '@aragon/gov-ui-kit';

export declare const Checkbox: React.ComponentType<CheckboxProps>;
