import * as React from 'react';

/**
 * GukModulesProvider — from @aragon/gov-ui-kit@2.10.0.
 */
export interface GukModulesProviderProps {
  /** Wagmi configurations to be forwarded to the WagmiProvider. The default configurations support some basic chains (ethereu */
  wagmiConfig?: Config;
  /** Optional initial state for Wagmi provider. */
  wagmiInitialState?: State;
  /** React-query configurations to be forwarded to the QueryClientProvider, uses the defaults configurations from react-query */
  queryClient?: QueryClient;
  /** Values for the GukCoreProvider context. */
  coreProviderValues?: Partial<IGukCoreContext>;
  /** Context provider values. */
  values?: Partial<IGukModulesContext>;
  /** Children of the provider. */
  children?: React.ReactNode;
}

export declare const GukModulesProvider: React.ComponentType<GukModulesProviderProps>;
