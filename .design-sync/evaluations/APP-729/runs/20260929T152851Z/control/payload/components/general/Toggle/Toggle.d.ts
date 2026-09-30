import * as React from 'react';

/**
 * Toggle — from @aragon/gov-ui-kit@2.10.0.
 */
export interface ToggleProps {
  /** Value of the toggle. */
  value: string;
  /** Label of the toggle. */
  label: string;
  style?: CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const Toggle: React.ComponentType<ToggleProps>;
