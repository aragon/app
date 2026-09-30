import * as React from 'react';

/**
 * CheckboxGroup — from @aragon/gov-ui-kit@2.10.0.
 */
export interface CheckboxGroupProps {
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
}

export declare const CheckboxGroup: React.ComponentType<CheckboxGroupProps>;
