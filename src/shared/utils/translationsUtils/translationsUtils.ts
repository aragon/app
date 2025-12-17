import type { translations } from '@/shared/constants/translations';

export type ITFuncOptions = Record<string, string | number | undefined | null>;

export type Translations = Awaited<ReturnType<(typeof translations)['en']>>;

class TranslationsUtils {
    t =
        (translations: Translations, debug?: boolean) =>
        (key: string, options: ITFuncOptions = {}) => {
            if (debug) {
                return key;
            }

            let value: string | object | undefined = translations;
            for (const segment of key.split('.')) {
                if (value != null && typeof value === 'object' && segment in value) {
                    value = (value as Record<string, string | object | undefined>)[segment];
                } else {
                    value = undefined;
                    break;
                }
            }

            if (typeof value === 'object' || value == null) {
                // eslint-disable-next-line no-console
                console.warn(`Translation missing for key: ${key}`);

                return key;
            }

            const valueKeys = Object.keys(options);

            return valueKeys.reduce<string>(
                (acc: string, current: string) => acc.replace(new RegExp(`{{${current}}}`, 'g'), options[current] as string),
                value
            );
        };
}

export const translationUtils = new TranslationsUtils();
