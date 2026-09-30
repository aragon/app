import * as React from 'react';

/**
 * RadioGroup — from @aragon/gov-ui-kit@2.11.4.
 */
export interface RadioGroupProps {
  /** The value of the selected radio item. */
  value?: string;
  /** The default value of the selected radio item. */
  defaultValue?: string;
  /** Callback when the value changes. */
  onValueChange?: (value: string) => void;
  /** The name of the radio group. */
  name?: string;
  /** Callback when the radio group loses focus. */
  onBlur?: unknown;
  /** Whether the radio group is disabled. */
  disabled?: boolean;
  /** Additional classes for the component. */
  className?: string;
  /** Children of the component. */
  children?: React.ReactNode;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { IInputContainerAlert } from '@aragon/gov-ui-kit';

export declare const RadioGroup: React.ComponentType<RadioGroupProps>;
