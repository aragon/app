'use client';

import { DialogProvider } from '@/shared/components/dialogProvider';
import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { TranslationsProvider } from '@/shared/components/translationsProvider';
import type { Translations } from '@/shared/utils/translationsUtils';
import { OdsModulesProvider } from '@aragon/ods';
import type { ReactNode } from 'react';
import { type State } from 'wagmi';
import { initialisePlugins } from '../../../../plugins';
import { wagmiConfig } from '../../constants/wagmi';
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
    initialisePlugins();

    return (
        <TranslationsProvider translations={translations}>
            <OdsModulesProvider
                wagmiConfig={wagmiConfig}
                // @ts-expect-error Soon supported by ODS library
                wagmiInitialState={wagmiInitialState}
                queryClient={queryClient}
                coreProviderValues={coreProviderValues}
            >
                <DialogProvider dialogs={providersDialogs}>{children}</DialogProvider>
            </OdsModulesProvider>
        </TranslationsProvider>
    );
};
