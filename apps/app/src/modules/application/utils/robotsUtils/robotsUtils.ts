import type { MetadataRoute } from 'next';
import { featureFlags } from '@/shared/featureFlags';
import { metadataUtils } from '@/shared/utils/metadataUtils';

class RobotsUtils {
    // The help center (apps/docs) is a separate deployment the proxy serves at /help with its own
    // sitemap, listed here while the helpCenter flag serves it: listed sooner, the crawlers would
    // fetch a sitemap at a path that answers not found.
    generateRobots = async (): Promise<MetadataRoute.Robots> => {
        const isHelpCenterEnabled = await featureFlags.isEnabled('helpCenter');
        const sitemaps = [
            `${metadataUtils.baseUrl}/sitemap.xml`,
            ...(isHelpCenterEnabled
                ? [`${metadataUtils.baseUrl}/help/sitemap.xml`]
                : []),
        ];

        return {
            rules: { userAgent: '*', allow: '/' },
            sitemap: sitemaps,
        };
    };
}

export const robotsUtils = new RobotsUtils();
