import type { translations } from '@/shared/constants/translations';

export type ITFuncOptions = Record<string, string | number | undefined | null>;

export type Translations = Awaited<ReturnType<(typeof translations)['en']>>;

class TranslationsUtils {
    t =
        (translations: Translations) =>
        (key: string, options: ITFuncOptions = {}) => {
            const value = key
                .split('.')
                .reduce<string | object | undefined>((acc: string | object | undefined, key: string) => {
                    if (acc != null && typeof acc === 'object' && key in acc) {
                        return (acc as Record<string, string | object | undefined>)[key];
                    }

                    return undefined;
                }, translations);

            if (typeof value === 'object' || value == null) {
                // eslint-disable-next-line no-console
                console.warn(`Translation missing for key: ${key}`);

                return key;
            }

            const valueKeys = Object.keys(options);

            return valueKeys.reduce<string>(
                (acc: string, current: string) => acc.replace(new RegExp(`{{${current}}}`), options[current] as string),
                value,
            );
        };
}

export const translationUtils = new TranslationsUtils();
