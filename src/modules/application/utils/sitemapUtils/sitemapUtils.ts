import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import { metadataUtils } from '@/shared/utils/metadataUtils';
import type { MetadataRoute } from 'next';

class SitemapUtils {
    private daoPageRoutes = ['assets', 'dashboard', 'members', 'proposals', 'settings', 'transactions'];

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
        return this.daoPageRoutes.map((daoPageRoute) => ({
            url: `/dao/${daoId}/${daoPageRoute}`,
            changeFrequency: 'daily',
            priority: 0.8,
        }));
    };

    private prependBaseUrl = (sitemap: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
        sitemap.map((site) => ({ ...site, url: `${metadataUtils.baseUrl}${site.url}` }));
}

export const sitemapUtils = new SitemapUtils();
