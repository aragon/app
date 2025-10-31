import type { IDao } from '@/shared/api/daoService';
import type { INavigationLink } from '@/shared/components/navigation';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { IconType } from '@aragon/gov-ui-kit';

export type NavigationDaoContext = 'page' | 'dialog';

class NavigationDaoUtils {
    buildLinks = (dao: IDao, context: NavigationDaoContext): INavigationLink[] => {
        const baseUrl = daoUtils.getDaoUrl(dao)!;

        const defaultLinks = this.getDefaultLinks(dao, baseUrl, context);
        const { left, right } = this.getPluginLinks(dao, baseUrl, context);

        const allLinks = [...left, ...defaultLinks, ...right];

        // Deduplicate links by URL to avoid duplicate navigation items
        // TODO APP-276: Understand why we get duplicate gauges and remove this
        const seen = new Set<string>();
        return allLinks.filter((link) => {
            if (seen.has(link.link)) {
                return false;
            }
            seen.add(link.link);
            return true;
        });
    };

    private getDefaultLinks = (dao: IDao, baseUrl: string, context: NavigationDaoContext): INavigationLink[] => {
        const isSupported = daoUtils.hasSupportedPlugins(dao);

        const isPageContext = context === 'page';
        const isDialogContext = context === 'dialog';

        return [
            {
                label: 'app.application.navigationDao.link.dashboard',
                link: `${baseUrl}/dashboard`,
                icon: IconType.APP_DASHBOARD,
                hidden: isPageContext,
            },
            {
                label: 'app.application.navigationDao.link.proposals',
                link: `${baseUrl}/proposals`,
                icon: IconType.APP_PROPOSALS,
                hidden: !isSupported,
                lgHidden: isDialogContext,
            },
            {
                label: 'app.application.navigationDao.link.members',
                link: `${baseUrl}/members`,
                icon: IconType.APP_MEMBERS,
                hidden: !isSupported,
                lgHidden: isDialogContext,
            },
            {
                label: 'app.application.navigationDao.link.assets',
                link: `${baseUrl}/assets`,
                icon: IconType.APP_ASSETS,
                lgHidden: isDialogContext,
            },
            {
                label: 'app.application.navigationDao.link.transactions',
                link: `${baseUrl}/transactions`,
                icon: IconType.APP_TRANSACTIONS,
                lgHidden: isDialogContext,
            },
            {
                label: 'app.application.navigationDao.link.settings',
                link: `${baseUrl}/settings`,
                icon: IconType.SETTINGS,
                hidden: isPageContext,
            },
        ];
    };

    private getPluginLinks = (dao: IDao, baseUrl: string, context: NavigationDaoContext) => {
        const pluginLinks = dao.plugins.reduce<{ left: INavigationLink[]; right: INavigationLink[] }>(
            (current, plugin) => {
                const pluginInfo = pluginRegistryUtils.getPlugin(plugin.interfaceType) as IPluginInfo | undefined;
                const pluginPagesLeft = pluginInfo?.pageLinksLeft?.(baseUrl, context) ?? [];
                const pluginPagesRight = pluginInfo?.pageLinksRight?.(baseUrl, context) ?? [];

                return {
                    left: current.left.concat(pluginPagesLeft),
                    right: current.right.concat(pluginPagesRight),
                };
            },
            { left: [], right: [] },
        );

        return pluginLinks;
    };
}

export const navigationDaoUtils = new NavigationDaoUtils();
