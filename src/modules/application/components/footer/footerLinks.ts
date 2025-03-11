import type { Translations } from '@/shared/utils/translationsUtils';

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
    {
        label: 'explore',
        link: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_EXPLORE_LINK === 'true' ? 'https://app.aragon.org' : '/',
        target: process.env.NEXT_PUBLIC_FEATURE_DEPLOYED_EXPLORE_LINK === 'true' ? '_blank' : undefined,
    },
    {
        label: 'help',
        link: 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3',
        target: '_blank',
    },
    { label: 'privacy', link: 'https://aragon.org/privacy-policy', target: '_blank' },
    { label: 'termsOfService', link: 'https://aragon.org/terms-and-conditions', target: '_blank' },
];
