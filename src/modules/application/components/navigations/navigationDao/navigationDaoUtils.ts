import { IconType } from '@aragon/gov-ui-kit';
import { initPluginRegistry } from '@/initPluginRegistry';
import type { IDao } from '@/shared/api/daoService';
import type { INavigationLink } from '@/shared/components/navigation';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';

initPluginRegistry();

export type NavigationDaoContext = 'page' | 'dialog';

class NavigationDaoUtils {
    buildLinks = (
        dao: IDao,
        context: NavigationDaoContext,
        navLinksToHide: string[] = [],
    ): INavigationLink[] => {
        const baseUrl = daoUtils.getDaoUrl(dao)!;

        const defaultLinks = this.getDefaultLinks(dao, baseUrl, context);
        const pluginLinks = this.getPluginLinks(dao, baseUrl, context);

        const allLinks = [...defaultLinks, ...pluginLinks].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );

        // Deduplicate links by URL to avoid duplicate navigation items, e.g. multiple "gauge" plugins are possible
        // Also, filter out links that should be hidden.
        const seen = new Set<string>(
            navLinksToHide.map((route) => `${baseUrl}/${route}`),
        );
        return allLinks.filter((link) => {
            if (seen.has(link.link)) {
                return false;
            }
            seen.add(link.link);
            return true;
        });
    };

    private getDefaultLinks = (
        dao: IDao,
        baseUrl: string,
        context: NavigationDaoContext,
    ): INavigationLink[] => {
        const isSupported = daoUtils.hasSupportedPlugins(dao);
        const hasBodyPlugin = daoUtils.hasPluginBody(dao);

        const isPageContext = context === 'page';
        const isDialogContext = context === 'dialog';

        return [
            {
                label: 'app.application.navigationDao.link.dashboard',
                link: `${baseUrl}/dashboard`,
                icon: IconType.APP_DASHBOARD,
                hidden: isPageContext,
                order: 100,
            },
            {
                label: 'app.application.navigationDao.link.proposals',
                link: `${baseUrl}/proposals`,
                icon: IconType.APP_PROPOSALS,
                hidden: !isSupported,
                lgHidden: isDialogContext,
                order: 200,
            },
            {
                label: 'app.application.navigationDao.link.members',
                link: `${baseUrl}/members`,
                icon: IconType.APP_MEMBERS,
                hidden: !(isSupported && hasBodyPlugin),
                lgHidden: isDialogContext,
                order: 300,
            },
            {
                label: 'app.application.navigationDao.link.assets',
                link: `${baseUrl}/assets`,
                icon: IconType.APP_ASSETS,
                lgHidden: isDialogContext,
                order: 400,
            },
            {
                label: 'app.application.navigationDao.link.transactions',
                link: `${baseUrl}/transactions`,
                icon: IconType.APP_TRANSACTIONS,
                lgHidden: isDialogContext,
                order: 500,
            },
            {
                label: 'app.application.navigationDao.link.settings',
                link: `${baseUrl}/settings`,
                icon: IconType.SETTINGS,
                hidden: isPageContext,
                order: 600,
            },
        ];
    };

    private getPluginLinks = (
        dao: IDao,
        baseUrl: string,
        context: NavigationDaoContext,
    ): INavigationLink[] => {
        const plugins =
            daoUtils.getDaoPlugins(dao, { includeLinkedAccounts: false }) ?? [];

        return plugins.flatMap((plugin) => {
            const pluginInfo = pluginRegistryUtils.getPlugin(
                plugin.interfaceType,
            ) as IPluginInfo | undefined;

            return pluginInfo?.pageLinks?.(baseUrl, context) ?? [];
        });
    };
}

export const navigationDaoUtils = new NavigationDaoUtils();
