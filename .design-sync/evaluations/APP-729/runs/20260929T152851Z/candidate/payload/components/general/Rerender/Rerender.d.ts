import * as React from 'react';

/**
 * Rerender — from @aragon/gov-ui-kit@2.11.4.
 */
export interface RerenderProps {
  /** The duration in milliseconds between each rerender. */
  intervalDuration?: number;
  /** Time-sensitive content to render. */
  children: (currentTime: number) => React.ReactNode;
}

export declare const Rerender: React.ComponentType<RerenderProps>;
