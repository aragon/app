import * as React from 'react';

/**
 * InputNumber — from @aragon/gov-ui-kit@2.10.0.
 */
export interface InputNumberProps {
  /** Lower bound of the input. A committed value below it is raised to it, but partial input is not blocked (typing `5` on th */
  min?: number;
  /** Upper bound of the input. Values above it are clamped to it, so render an out-of-range error state through the `alert` p */
  max?: number;
  /** Optional string prepended to the input value. */
  prefix?: string;
  /** Specifies the granularity of the intervals for the input value. */
  step?: number;
  /** Optional string appended to the input value. */
  suffix?: string;
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
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const InputNumber: React.ComponentType<InputNumberProps>;
