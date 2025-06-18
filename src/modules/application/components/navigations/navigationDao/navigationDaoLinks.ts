import type { IDao } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { IconType } from '@aragon/gov-ui-kit';
import type { INavigationLink } from '../navigation';

export const navigationDaoLinks = (dao: IDao, context: 'page' | 'dialog'): INavigationLink[] => {
    const isSupported = daoUtils.hasSupportedPlugins(dao);
    const isPageContext = context === 'page';

    const baseUrl = daoUtils.getDaoUrl(dao)!;
    const pages = dao.plugins.reduce<INavigationLink[]>((current, plugin) => {
        const pluginInfo = pluginRegistryUtils.getPlugin(plugin.subdomain) as IPluginInfo;
        const pluginPages = pluginInfo.pages?.(baseUrl, context) ?? [];

        return current.concat(pluginPages);
    }, []);

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
            lgHidden: !isPageContext,
        },
        {
            label: 'app.application.navigationDao.link.members',
            link: `${baseUrl}/members`,
            icon: IconType.APP_MEMBERS,
            hidden: !isSupported,
            lgHidden: !isPageContext,
        },
        {
            label: 'app.application.navigationDao.link.assets',
            link: `${baseUrl}/assets`,
            icon: IconType.APP_ASSETS,
            lgHidden: !isPageContext,
        },
        {
            label: 'app.application.navigationDao.link.transactions',
            link: `${baseUrl}/transactions`,
            icon: IconType.APP_TRANSACTIONS,
            lgHidden: !isPageContext,
        },
        {
            label: 'app.application.navigationDao.link.settings',
            link: `${baseUrl}/settings`,
            icon: IconType.SETTINGS,
            hidden: isPageContext,
        },
        ...pages,
    ];
};
