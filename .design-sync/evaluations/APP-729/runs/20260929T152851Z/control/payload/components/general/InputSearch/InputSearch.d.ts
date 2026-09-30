import * as React from 'react';

/**
 * InputSearch — from @aragon/gov-ui-kit@2.10.0.
 */
export interface InputSearchProps {
  /** Displays a loading indicator when set to true. */
  isLoading?: boolean;
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
  style?: CSSProperties;
  id?: string;
  children?: React.ReactNode;
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const InputSearch: React.ComponentType<InputSearchProps>;
