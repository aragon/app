import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import { Network, type IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { metadataUtils } from '@/shared/utils/metadataUtils';
import type { MetadataRoute } from 'next';

class SitemapUtils {
    private daoPageRoutes = ['assets', 'dashboard', 'members', 'proposals', 'settings', 'transactions'];

    public generateSitemap = async (): Promise<MetadataRoute.Sitemap> => {
        const now = new Date();
        const networks = Object.values(Network);

        const daos = await daoExplorerService.getDaoList({
            queryParams: { pageSize: 50, networks },
        });

        const daoPages = daos.data.flatMap((dao) => this.buildDaoPages(dao, now));

        return this.prependBaseUrl([...this.buildStaticPages(now), ...daoPages]);
    };

    private buildDaoPages = (dao: IDao, lastModified: Date): MetadataRoute.Sitemap => {
        return this.daoPageRoutes.map((daoPageRoute) => ({
            url: daoUtils.getDaoUrl(dao, daoPageRoute)!,
            changeFrequency: 'daily',
            priority: 0.8,
            lastModified,
        }));
    };

    private buildStaticPages = (lastModified: Date): MetadataRoute.Sitemap => [
        {
            url: '/',
            lastModified,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: '/create',
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    private prependBaseUrl = (sitemap: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
        sitemap.map((site) => ({ ...site, url: `${metadataUtils.baseUrl}${site.url}` }));
}

export const sitemapUtils = new SitemapUtils();
