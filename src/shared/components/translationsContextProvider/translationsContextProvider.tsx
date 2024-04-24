'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { type getTranslations } from './translations';

const translationsContext = createContext<Translations | null>(null);

export type Translations = Awaited<ReturnType<typeof getTranslations>>;

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
