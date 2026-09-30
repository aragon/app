import * as React from 'react';

/**
 * Switch — from @aragon/gov-ui-kit@2.11.4.
 */
export interface SwitchProps {
  /** Indicates whether the switch is checked */
  checked?: boolean;
  /** CSS class name */
  className?: string;
  /** The default checked state of the switch */
  defaultChecked?: boolean;
  /** Indicates whether the switch is disabled */
  disabled?: boolean;
  /** The ID of the switch */
  id?: string;
  /** The inline label of the switch */
  inlineLabel?: string;
  /** The name of the switch */
  name?: string;
  /** Event handler for when the checked state changes */
  onCheckedChanged?: (checked: boolean) => void;
  /** Label of the input. */
  label?: React.ReactNode;
  /** Help text displayed above the input. */
  helpText?: string;
  /** Displays the optional tag when set to true. */
  isOptional?: boolean;
  /** Alert displayed below the input. */
  alert?: IInputContainerAlert;
}

import type { IInputContainerAlert } from '@aragon/gov-ui-kit';

export declare const Switch: React.ComponentType<SwitchProps>;
