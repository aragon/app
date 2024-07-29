import type { translations } from '@/shared/constants/translations';

export type ITFuncOptions = {
    /**
     * Values to be replaced on the translation.
     */
    [key: string]: string | number | undefined | null;
};

export type Translations = Awaited<ReturnType<(typeof translations)['en']>>;

class TranslationsUtils {
    t =
        (translations: Translations) =>
        (key: string, options: ITFuncOptions = {}) => {
            const value = key.split('.').reduce((acc: unknown, key: string) => {
                if (acc != null && typeof acc === 'object' && key in acc) {
                    return (acc as Record<string, unknown>)[key];
                }

                return undefined;
            }, translations);

            if (typeof value === 'object' || value == null) {
                // eslint-disable-next-line no-console
                console.warn(`Translation missing for key: ${key}`);

                return key;
            }

            const valueKeys = Object.keys(options);

            return valueKeys.reduce(
                (acc: string, current: string) => acc.replace(new RegExp(`{{${current}}}`), options[current] as string),
                value as string,
            );
        };
}

export const translationUtils = new TranslationsUtils();
