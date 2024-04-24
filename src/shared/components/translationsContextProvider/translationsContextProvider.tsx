'use client';

import { type translationUtils } from '@/shared/utils/translationsUtils';
import { createContext, useContext, type ReactNode } from 'react';

export type Translations = Awaited<ReturnType<typeof translationUtils.getTranslations>>;

const translationsContext = createContext<Translations | null>(null);

export interface ITranslationsContextProviderProps {
    /**
     * Translations for the selected language.
     */
    translations: Translations;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TranslationsContextProvider: React.FC<ITranslationsContextProviderProps> = (props) => {
    const { translations, children } = props;

    return <translationsContext.Provider value={translations}>{children}</translationsContext.Provider>;
};

export const useTranslations = () => {
    const translations = useContext(translationsContext);

    if (translations == null) {
        throw new Error('useTranslations: hook must be used within the TranslationsProvider to work properly.');
    }

    return translations;
};
