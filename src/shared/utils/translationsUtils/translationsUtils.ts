import 'server-only';

class TranslationUtils {
    private translations = {
        en: () => import('@/assets/locales/en.json').then((module) => module.default),
    };

    getTranslations = async (locale: keyof typeof this.translations = 'en') => this.translations[locale]();
}

export const translationUtils = new TranslationUtils();
