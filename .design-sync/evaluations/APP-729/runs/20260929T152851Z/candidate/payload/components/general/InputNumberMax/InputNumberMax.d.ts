import * as React from 'react';

/**
 * InputNumberMax — from @aragon/gov-ui-kit@2.11.4.
 */
export interface InputNumberMaxProps {
  /** Maximum number set on max button click. It is also the ceiling the input accepts: values above it are clamped to it, so  */
  max: number;
  onChange?: (value: string) => void;
  /** Label of the input. */
  label?: React.ReactNode;
  style?: React.CSSProperties;
  /** Classes for the component. */
  className?: string;
  id?: string;
  children?: React.ReactNode;
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
  /** Classes for the input wrapper. */
  wrapperClassName?: string;
  /** Classes for the input element. */
  inputClassName?: string;
}

import type { IInputContainerAlert } from '@aragon/gov-ui-kit';

export declare const InputNumberMax: React.ComponentType<InputNumberMaxProps>;
