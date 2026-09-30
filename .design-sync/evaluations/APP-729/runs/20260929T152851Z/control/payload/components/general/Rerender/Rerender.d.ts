import * as React from 'react';

/**
 * Rerender — from @aragon/gov-ui-kit@2.10.0.
 */
export interface RerenderProps {
  /** The duration in milliseconds between each rerender. */
  intervalDuration?: number;
  /** Time-sensitive content to render. */
  children: (currentTime: number) => ReactNode;
}

export declare const Rerender: React.ComponentType<RerenderProps>;
