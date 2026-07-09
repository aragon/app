'use client';

import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
} from 'react';
import {
    type ITFuncOptions,
    type Translations,
    translationUtils,
} from '@/shared/utils/translationsUtils';
import { useDebugContext } from '../debugProvider';

export interface ITranslationContext {
    /**
     * Function to process the given translation (e.g. replace keys with given values).
     */
    t: TranslationFunction;
}

export type TranslationFunction = (
    translation: string,
    options?: ITFuncOptions,
) => string;

const translationsContext = createContext<ITranslationContext | null>(null);

export interface ITranslationsProviderProps {
    /**
     * Translations for the selected language.
     */
    translations: Translations;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const TranslationsProvider: React.FC<ITranslationsProviderProps> = (
    props,
) => {
    const { translations, children } = props;

    const { values, registerControl } = useDebugContext<{
        displayKeys: boolean;
    }>();
    const { displayKeys } = values;

    const contextValues = useMemo(
        () => ({ t: translationUtils.t(translations, displayKeys) }),
        [translations, displayKeys],
    );

    useEffect(() => {
        registerControl({
            name: 'displayKeys',
            type: 'boolean',
            label: 'Show translation keys',
        });
    }, [registerControl]);

    return (
        <translationsContext.Provider value={contextValues}>
            {children}
        </translationsContext.Provider>
    );
};

export const useTranslations = () => {
    const values = useContext(translationsContext);

    if (values == null) {
        throw new Error(
            'useTranslations: hook must be used within the TranslationsContextProvider to work properly.',
        );
    }

    return values;
};

/**
 * A safe version of useTranslations that provides a fallback when the
 * TranslationsProvider is not available. Use this in error boundary components
 * or other places where the provider might not be mounted yet.
 *
 * Falls back to returning the translation key as-is if no provider is found.
 */
export const useSafeTranslations = (): ITranslationContext => {
    const values = useContext(translationsContext);

    if (values == null) {
        // Fallback: return the key as-is (useful for error boundaries)
        return { t: (key: string) => key };
    }

    return values;
};
