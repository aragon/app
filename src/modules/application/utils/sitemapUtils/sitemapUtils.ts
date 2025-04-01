import { daoExplorerService } from '@/modules/explore/api/daoExplorerService';
import { governanceService } from '@/modules/governance/api/governanceService';
import { daoService } from '@/shared/api/daoService';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { MetadataRoute } from 'next';

export enum PageRoutes {
    ASSETS = 'assets',
    DASHBOARD = 'dashboard',
    MEMBERS = 'members',
    PROPOSALS = 'proposals',
    SETTINGS = 'settings',
    TRANSACTIONS = 'transactions',
}

class SitemapUtils {
    private baseUrl = 'https://app.aragon.org';

    private staticPages: MetadataRoute.Sitemap = [
        { url: '', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
        { url: '/create', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ];

    /**
     * Generates root ./sitemap.xml
     * Includes: static pages + per-DAO sitemap links  (Top 100 by tvlUSD)
     */
    public generateRootSitemap = async (): Promise<MetadataRoute.Sitemap> => {
        const daoPages = await this.buildDaoPages();
        const sitemap = [...this.staticPages, ...daoPages];

        return this.prependBaseUrl(sitemap);
    };

    /**
     * Generates DAO site for ./sitemaps/dao/[daoId]/sitemap.xml
     * Includes: DAO pages per-route (see enum PageRoutes) + latest 10 proposal detail pages per PROCESS plugin
     */
    public generateDaoSitemap = async (daoId: string): Promise<MetadataRoute.Sitemap> => {
        const routePages: MetadataRoute.Sitemap = Object.values(PageRoutes).map((route) => ({
            url: `/dao/${daoId}/${route}`,
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        const proposalPages = await this.buildProposalPages(daoId);

        return this.prependBaseUrl([...routePages, ...proposalPages]);
    };

    private buildDaoPages = async (): Promise<MetadataRoute.Sitemap> => {
        const daos = await daoExplorerService.getDaoList({ queryParams: { pageSize: 100 } });

        const daoPages: MetadataRoute.Sitemap = daos.data.map((dao) => ({
            url: `${this.baseUrl}/sitemaps/dao/${dao.id}/sitemap.xml`,
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        return daoPages;
    };

    private buildProposalPages = async (daoId: string): Promise<MetadataRoute.Sitemap> => {
        const dao = await daoService.getDao({ urlParams: { id: daoId } });

        const pluginsByProcess = daoUtils.getDaoPlugins(dao, { type: PluginType.PROCESS });

        if (!pluginsByProcess?.length) {
            return [];
        }

        const proposalsByProcess = await Promise.all(
            pluginsByProcess.map((plugin) =>
                governanceService
                    .getProposalList({ queryParams: { daoId, pluginAddress: plugin.address } })
                    .then((res) => ({ proposals: res.data, plugin })),
            ),
        );

        const proposals = proposalsByProcess.flatMap(({ proposals, plugin }) =>
            proposals.map((proposal) => ({ proposal, plugin })),
        );

        return proposals
            .map(({ proposal, plugin }) => {
                const slug = this.getServerProposalSlug(proposal.incrementalId, plugin) ?? proposal.id;

                return {
                    url: `/dao/${daoId}/${PageRoutes.PROPOSALS}/${slug}`,
                    lastModified: new Date(proposal.blockTimestamp),
                    changeFrequency: 'daily',
                    priority: 0.8,
                };
            })
            .filter(Boolean) as MetadataRoute.Sitemap;
    };

    private prependBaseUrl = (sitemap: MetadataRoute.Sitemap): MetadataRoute.Sitemap =>
        sitemap.map((site) => ({ ...site, url: `${this.baseUrl}${site.url}` }));

    private getTopDaos = async (limit = 100): Promise<Array<{ id: string }>> => {
        const result = await daoExplorerService.getDaoList({ queryParams: { pageSize: limit } });
        return result.data;
    };

    private getServerProposalSlug = (incrementalId?: number, plugin?: { slug?: string }): string | null => {
        if (incrementalId == null || !plugin?.slug) {
            return null;
        }
        return `${plugin.slug}-${incrementalId.toString()}`.toUpperCase();
    };
}

export const sitemapUtils = new SitemapUtils();
