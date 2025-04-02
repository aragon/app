import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import type { MetadataRoute } from 'next';

class SitemapUtils {
    private baseUrl = 'https://app.aragon.org';

    private routes = ['assets', 'dashboard', 'members', 'proposals', 'settings', 'transactions'];

    private staticPages: MetadataRoute.Sitemap = [
        { url: '', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
        { url: '/create', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    public generateSitemap = async (): Promise<MetadataRoute.Sitemap> => {
        const daos = await daoExplorerService.getDaoList({ queryParams: { pageSize: 100 } });

        const daoPages = daos.data.flatMap((dao) => this.buildDaoPages(dao.id));

        return this.prependBaseUrl([...this.staticPages, ...daoPages]);
    };

    private buildDaoPages = (daoId: string): MetadataRoute.Sitemap => {
        return Object.values(this.routes).map((route) => ({
            url: `/dao/${daoId}/${route}`,
            changeFrequency: 'daily',
            priority: 0.8,
        }));
    };

    private prependBaseUrl = (sitemap: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
        sitemap.map((site) => ({ ...site, url: `${this.baseUrl}${site.url}` }));
}

export const sitemapUtils = new SitemapUtils();
