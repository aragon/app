import type { Translations } from '@/shared/components/translationsContext';

export interface IFooterLink {
    /**
     * Label of the footer link.
     */
    label: keyof Translations['app']['application']['footer']['link'];
    /**
     * Url of the footer link.
     */
    link: string;
}

export const footerLinks: IFooterLink[] = [
    { label: 'explore', link: '#' },
    { label: 'learn', link: '#' },
    { label: 'build', link: '#' },
    { label: 'help', link: '#' },
    { label: 'privacy', link: '#' },
    { label: 'termsOfService', link: '#' },
];
