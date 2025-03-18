import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import type { MetadataRoute } from 'next';

class SitemapUtils {
    private baseUrl = 'https://app.aragon.org';

    private staticPages: MetadataRoute.Sitemap = [
        { url: '', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
        { url: '/create', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    generateSitemap = async (): Promise<MetadataRoute.Sitemap> => {
        const daoPages = await this.buildDaoPages();
        const sitemap = [...this.staticPages, ...daoPages];

        return this.prependBaseUrl(sitemap);
    };

    private buildDaoPages = async (): Promise<MetadataRoute.Sitemap> => {
        const daos = await daoExplorerService.getDaoList({ queryParams: { pageSize: 100 } });
        const daoPages: MetadataRoute.Sitemap = daos.data.map((dao) => ({
            url: `/dao/${dao.id}/dashboard`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        return daoPages;
    };

    private prependBaseUrl = (sitemap: MetadataRoute.Sitemap) =>
        sitemap.map((site) => ({ ...site, url: `${this.baseUrl}${site.url}` }));
}

export const sitemapUtils = new SitemapUtils();
