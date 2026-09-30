import * as React from 'react';

/**
 * Radio — from @aragon/gov-ui-kit@2.10.0.
 * @replaces input[type=radio]
 */
export interface RadioProps {
  /** Radio label */
  label: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
  /** The value of the radio item. */
  value: string;
  /** Indicates if the radio is disabled. */
  disabled?: boolean;
  /** Indicates the position of the label */
  labelPosition?: "right" | "left";
  /** Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or  */
  ref?: React.Ref;
}

export declare const Radio: React.ComponentType<RadioProps>;
