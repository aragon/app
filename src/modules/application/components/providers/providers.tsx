'use client';

import { TranslationsContextProvider, type Translations } from '@/shared/components/translationsContext';
import { OdsModulesProvider } from '@aragon/ods';
import type { ReactNode } from 'react';
import { queryClient } from '../../constants/reactQuery';
import { wagmiConfig } from '../../constants/wagmi';

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

/**
 * Provides global providers for the whole application.
 */
export const Providers: React.FC<IProvidersProps> = (props) => {
    const { translations, children } = props;

    return (
        <TranslationsContextProvider translations={translations}>
            <OdsModulesProvider wagmiConfig={wagmiConfig} queryClient={queryClient}>
                {children}
            </OdsModulesProvider>
        </TranslationsContextProvider>
    );
};
