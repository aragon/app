'use client';

import { initPluginRegistry } from '@/initPluginRegistry';
import { BlockNavigationContextProvider } from '@/shared/components/blockNavigationContext';
import { DebugContextProvider } from '@/shared/components/debugProvider/debugProvider';
import { DialogProvider } from '@/shared/components/dialogProvider';
import { DialogRoot } from '@/shared/components/dialogRoot';
import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { TranslationsProvider } from '@/shared/components/translationsProvider';
import type { Translations } from '@/shared/utils/translationsUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { type ReactNode } from 'react';
import { type State } from 'wagmi';
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
     * Children of the component.
     */
    children?: ReactNode;
}

const coreProviderValues = { Link: Link, Img: Image };

export const Providers: React.FC<IProvidersProps> = (props) => {
    const { translations, wagmiInitialState, children } = props;

    const queryClient = queryClientUtils.getQueryClient();

    // Initialise plugin registry and intercept fetch requests (if enabled) for client-side components
    initPluginRegistry();
    fetchInterceptorUtils.intecept();

    return (
        <DebugContextProvider>
            <TranslationsProvider translations={translations}>
                <BlockNavigationContextProvider>
                    <GukModulesProvider
                        wagmiConfig={wagmiConfig}
                        wagmiInitialState={wagmiInitialState}
                        queryClient={queryClient}
                        coreProviderValues={coreProviderValues}
                    >
                        <DialogProvider>
                            {children}
                            <DialogRoot dialogs={providersDialogs} />
                        </DialogProvider>
                    </GukModulesProvider>
                </BlockNavigationContextProvider>
            </TranslationsProvider>
        </DebugContextProvider>
    );
};
