import * as React from 'react';

/**
 * TranslationsProvider — from @aragon/app@1.39.1 (apps/app/src/shared/components/translationsProvider/translationsProvider.tsx).
 */
export interface TranslationsProviderProps {
  /** Translations for the selected language. */
  translations: unknown;
  /** Children of the component. */
  children?: React.ReactNode;
}

export declare const TranslationsProvider: React.ComponentType<TranslationsProviderProps>;
