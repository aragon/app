import type { IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { IconType } from '@aragon/gov-ui-kit';
import type { INavigationLink } from '../navigation';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes>;

export interface INavigationDaoLinksParams {
    /**
     * The DAO being navigated.
     */
    dao: IDao;
}

export function navigationDaoLinks(dao: IDao, isPage: boolean): DaoRoutes[] {
    const isSupported = daoUtils.hasSupportedPlugins(dao);
    const daoUrl = daoUtils.getDaoUrl(dao)!;

    return [
        {
            label: 'app.application.navigationDao.link.dashboard',
            link: `${daoUrl}/dashboard`,
            icon: IconType.APP_DASHBOARD,
            hidden: isPage,
        },
        {
            label: 'app.application.navigationDao.link.proposals',
            link: `${daoUrl}/proposals`,
            icon: IconType.APP_PROPOSALS,
            hidden: !isSupported,
            mdHidden: true,
        },
        {
            label: 'app.application.navigationDao.link.members',
            link: `${daoUrl}/members`,
            icon: IconType.APP_MEMBERS,
            hidden: !isSupported,
            mdHidden: true,
        },
        {
            label: 'app.application.navigationDao.link.assets',
            link: `${daoUrl}/assets`,
            icon: IconType.APP_ASSETS,

            mdHidden: true,
        },
        {
            label: 'app.application.navigationDao.link.transactions',
            link: `${daoUrl}/transactions`,
            icon: IconType.APP_TRANSACTIONS,
            mdHidden: true,
        },
        {
            label: 'app.application.navigationDao.link.settings',
            link: `${daoUrl}/settings`,
            icon: IconType.SETTINGS,
            hidden: isPage,
        },
    ];
}
