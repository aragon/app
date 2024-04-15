import 'server-only';

const translations = {
    en: () => import('@/assets/locales/en.json').then((module) => module.default),
};

export const getTranslations = async (locale: keyof typeof translations = 'en') => translations[locale]();
