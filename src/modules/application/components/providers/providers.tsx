'use client';

import { Image } from '@/shared/components/image';
import { Link } from '@/shared/components/link';
import { TranslationsProvider } from '@/shared/components/translationsProvider';
import type { Translations } from '@/shared/utils/translationsUtils';
import { OdsModulesProvider } from '@aragon/ods';
import type { ReactNode } from 'react';
import { initialisePlugins } from '../../../../plugins';
import { wagmiConfig } from '../../constants/wagmi';
import { queryClientUtils } from '../../utils/queryClientUtils';

export interface IProvidersProps {
    /**
     * Translations of the application.
     */
    translations: Translations;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

const coreProviderValues = { Link: Link, Img: Image };

/**
 * Provides global providers for the whole application.
 */
export const Providers: React.FC<IProvidersProps> = (props) => {
    const { translations, children } = props;

    const queryClient = queryClientUtils.getQueryClient();
    initialisePlugins();

    return (
        <TranslationsProvider translations={translations}>
            <OdsModulesProvider
                wagmiConfig={wagmiConfig}
                queryClient={queryClient}
                coreProviderValues={coreProviderValues}
            >
                {children}
            </OdsModulesProvider>
        </TranslationsProvider>
    );
};
