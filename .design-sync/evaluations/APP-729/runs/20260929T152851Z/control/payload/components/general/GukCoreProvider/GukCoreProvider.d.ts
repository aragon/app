import * as React from 'react';

/**
 * GukCoreProvider — from @aragon/gov-ui-kit@2.10.0.
 */
export interface GukCoreProviderProps {
  /** Context provider values. */
  values?: Partial<IGukCoreContext>;
  /** Children of the context provider. */
  children?: React.ReactNode;
}

export declare const GukCoreProvider: React.ComponentType<GukCoreProviderProps>;
