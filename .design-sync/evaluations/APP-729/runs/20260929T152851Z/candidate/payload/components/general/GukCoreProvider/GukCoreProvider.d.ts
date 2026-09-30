import * as React from 'react';

/**
 * GukCoreProvider — from @aragon/gov-ui-kit@2.11.4.
 */
export interface GukCoreProviderProps {
  /** Context provider values. */
  values?: unknown;
  /** Children of the context provider. */
  children?: React.ReactNode;
}

export declare const GukCoreProvider: React.ComponentType<GukCoreProviderProps>;
