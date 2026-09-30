import * as React from 'react';

/**
 * ToggleGroup — from @aragon/gov-ui-kit@2.10.0.
 */
export interface ToggleGroupProps {
  /** Variant of the component defining the spacing between the toggle items. */
  variant?: "fixed" | "space-between";
  /** Orientation of the toggle group. */
  orientation?: "horizontal" | "vertical";
  /** Allows multiple toggles to be selected at the same time when set to true. */
  isMultiSelect: boolean;
  /** Current value of the toggle selection. */
  value?: string | string[];
  /** Default toggle selection. */
  defaultValue?: string | string[];
  /** Callback called on toggle selection change. */
  onChange?: ((value: string[]) => void) | ((value: string) => void);
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const ToggleGroup: React.ComponentType<ToggleGroupProps>;
