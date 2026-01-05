'use client';

import { GukModulesProvider } from '@aragon/gov-ui-kit';
import {
    type DehydratedState,
    HydrationBoundary,
    QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import type { State } from 'wagmi';
import { initActionViewRegistry } from '@/actions';
import { initPluginRegistry } from '@/initPluginRegistry';
import { BlockNavigationContextProvider } from '@/shared/components/blockNavigationContext';
import { DebugContextProvider } from '@/shared/components/debugProvider/debugProvider';
import { DialogProvider } from '@/shared/components/dialogProvider';
import { DialogRoot } from '@/shared/components/dialogRoot';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { TranslationsProvider } from '@/shared/components/translationsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import type { Translations } from '@/shared/utils/translationsUtils';
import { wagmiConfig } from '../../constants/wagmi';
import { fetchInterceptorUtils } from '../../utils/fetchInterceptorUtils';
import { queryClientUtils } from '../../utils/queryClientUtils';
import { providersDialogs } from './providersDialogs';

export interface IProvidersProps {
    /**
     * Translations of the application.
     */
    translations: Translations;
    /**
     * Initial state of Wagmi provider.
     */
    wagmiInitialState?: State;
    /**
     * Dehydrated state for the react-query provider.
     */
    dehydratedState?: DehydratedState;
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * Initial feature flags snapshot resolved on the server.
     */
    featureFlagsSnapshot?: FeatureFlagSnapshot[];
}

const coreProviderValues = { Link, Img: Image };

export const Providers: React.FC<IProvidersProps> = (props) => {
    const {
        translations,
        wagmiInitialState,
        dehydratedState,
        children,
        featureFlagsSnapshot,
    } = props;

    const queryClient = queryClientUtils.getQueryClient();

    // Initialise plugin registry and intercept fetch requests (if enabled) for client-side components
    initPluginRegistry();
    const useMocks =
        featureFlagsSnapshot?.find((f) => f.key === 'useMocks')?.enabled ??
        false;
    fetchInterceptorUtils.intercept(useMocks);
    initActionViewRegistry();

    return (
        <DebugContextProvider>
            <QueryClientProvider client={queryClient}>
                <HydrationBoundary state={dehydratedState}>
                    <TranslationsProvider translations={translations}>
                        <BlockNavigationContextProvider>
                            <GukModulesProvider
                                coreProviderValues={coreProviderValues}
                                queryClient={queryClient}
                                wagmiConfig={wagmiConfig}
                                wagmiInitialState={wagmiInitialState}
                            >
                                <FeatureFlagsProvider
                                    initialSnapshot={featureFlagsSnapshot}
                                >
                                    <DialogProvider>
                                        {children}
                                        <DialogRoot
                                            dialogs={providersDialogs}
                                        />
                                        <ReactQueryDevtools />
                                    </DialogProvider>
                                </FeatureFlagsProvider>
                            </GukModulesProvider>
                        </BlockNavigationContextProvider>
                    </TranslationsProvider>
                </HydrationBoundary>
            </QueryClientProvider>
        </DebugContextProvider>
    );
};
