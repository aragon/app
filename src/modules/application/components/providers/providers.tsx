'use client';

import { TranslationsContextProvider, type Translations } from '@/shared/components/translationsContextProvider';
import { OdsModulesProvider } from '@aragon/ods';
import type { ReactNode } from 'react';
import { wagmiConfig } from '../../constants/wagmi';
import { queryClientUtils } from '../../utils/queryClientUtils';
import { OdsImage } from './odsImage';
import { OdsLink } from './odsLink';

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

const coreProviderValues = { Link: OdsLink, Img: OdsImage };

/**
 * Provides global providers for the whole application.
 */
export const Providers: React.FC<IProvidersProps> = (props) => {
    const { translations, children } = props;

    const queryClient = queryClientUtils.getQueryClient();

    return (
        <TranslationsContextProvider translations={translations}>
            <OdsModulesProvider
                wagmiConfig={wagmiConfig}
                queryClient={queryClient}
                coreProviderValues={coreProviderValues}
            >
                {children}
            </OdsModulesProvider>
        </TranslationsContextProvider>
    );
};
