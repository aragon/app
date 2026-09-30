import * as React from 'react';

/**
 * GukModulesProvider — from @aragon/gov-ui-kit@2.11.4.
 */
export interface GukModulesProviderProps {
  /** Wagmi configurations to be forwarded to the WagmiProvider. The default configurations support some basic chains (ethereu */
  wagmiConfig?: unknown;
  /** Optional initial state for Wagmi provider. */
  wagmiInitialState?: unknown;
  /** React-query configurations to be forwarded to the QueryClientProvider, uses the defaults configurations from react-query */
  queryClient?: unknown;
  /** Values for the GukCoreProvider context. */
  coreProviderValues?: unknown;
  /** Context provider values. */
  values?: unknown;
  /** Children of the provider. */
  children?: React.ReactNode;
}

export declare const GukModulesProvider: React.ComponentType<GukModulesProviderProps>;
