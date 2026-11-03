import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';

// Where the app serves the help center, the knowledge-base site (apps/docs), while the helpCenter
// flag is on (the proxy rewrites it to the site deployment).
export const helpCenterBasePath = '/help';

export interface IHelpCenterLink {
    /**
     * Route of the page on the help center, without the base path
     * (/governance/process#staged-governance-processes).
     */
    path: string;
    /**
     * Where the link goes while the help center is not served: the page of the developer portal
     * (docs.aragon.org) the help-center page replaces.
     */
    fallback: string;
}

/**
 * URL of a help-center page the app links to: its /help route while the helpCenter flag serves
 * the site, the developer-portal fallback otherwise. Render it as a plain anchor: the help center
 * is a separate deployment the proxy serves, not a route of the app router.
 */
export const useHelpCenterLink = (link: IHelpCenterLink): string => {
    const { isEnabled } = useFeatureFlags();

    return isEnabled('helpCenter')
        ? `${helpCenterBasePath}${link.path}`
        : link.fallback;
};
