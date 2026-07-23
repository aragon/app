import type { Translations } from '@/shared/utils/translationsUtils';

// External support portal, linked from the footer help entry.
export const SUPPORT_PORTAL_URL =
    'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export interface IFooterLink {
    /**
     * Label of the footer link.
     */
    label: keyof Translations['app']['application']['footer']['link'];
    /**
     * Url of the footer link.
     */
    link: string;
    /**
     * Target of the link.
     */
    target?: string;
}

export const footerLinks: IFooterLink[] = [
    { label: 'explore', link: '/' },
    {
        label: 'help',
        link: SUPPORT_PORTAL_URL,
        target: '_blank',
    },
    {
        label: 'privacy',
        link: 'https://aragon.org/privacy-policy',
        target: '_blank',
    },
    {
        label: 'termsOfService',
        link: 'https://aragon.org/terms-and-conditions',
        target: '_blank',
    },
];
