import * as React from 'react';

/**
 * Toggle — from @aragon/gov-ui-kit@2.11.4.
 */
export interface ToggleProps {
  /** Value of the toggle. */
  value: string;
  /** Label of the toggle. */
  label: string;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export declare const Toggle: React.ComponentType<ToggleProps>;
