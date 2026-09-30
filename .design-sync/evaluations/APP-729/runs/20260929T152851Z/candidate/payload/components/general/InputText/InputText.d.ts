import * as React from 'react';

/**
 * InputText — from @aragon/gov-ui-kit@2.11.4.
 */
export interface InputTextProps {
  /** Text to be rendered beside the input field. */
  addon?: string;
  /** Position of the addon element in relation to the input field. */
  addonPosition?: "right" | "left";
  /** Icon to be rendered on the left side of the input field. */
  iconLeft?: unknown;
  /** Icon to be rendered on the right side of the input field. */
  iconRight?: unknown;
  /** Classes for the input element. */
  inputClassName?: string;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Classes for the component. */
  className?: string;
  /** Displays the input as disabled when set to true. */
  disabled?: boolean;
  /** Variant of the input. */
  variant?: "default" | "warning" | "critical";
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
  /** Displays an input length counter when set. */
  maxLength?: number;
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  style?: React.CSSProperties;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref<unknown>;
}

import type { IInputContainerAlert } from '@aragon/gov-ui-kit';

export declare const InputText: React.ComponentType<InputTextProps>;
