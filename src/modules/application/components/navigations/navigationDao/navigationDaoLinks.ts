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
    /**
     * The context in which the navigation links are being used.
     */
    context: 'page' | 'dialog' | 'full';
}

export function navigationDaoLinks(dao: IDao, context?: 'page' | 'dialog' | 'full'): DaoRoutes[] {
    const isSupported = daoUtils.hasSupportedPlugins(dao);
    const base = daoUtils.getDaoUrl(dao)!;

    const all: DaoRoutes[] = [
        {
            label: 'app.application.navigationDao.link.dashboard',
            link: `${base}/dashboard`,
            icon: IconType.APP_DASHBOARD,
        },
        {
            label: 'app.application.navigationDao.link.proposals',
            link: `${base}/proposals`,
            icon: IconType.APP_PROPOSALS,
        },
        {
            label: 'app.application.navigationDao.link.members',
            link: `${base}/members`,
            icon: IconType.APP_MEMBERS,
        },
        {
            label: 'app.application.navigationDao.link.assets',
            link: `${base}/assets`,
            icon: IconType.APP_ASSETS,
        },
        {
            label: 'app.application.navigationDao.link.transactions',
            link: `${base}/transactions`,
            icon: IconType.APP_TRANSACTIONS,
        },
        {
            label: 'app.application.navigationDao.link.settings',
            link: `${base}/settings`,
            icon: IconType.SETTINGS,
        },
    ];

    return all.filter((link) => {
        const id = link.link.split('/').pop()!;

        if ((id === 'proposals' || id === 'members') && !isSupported) {
            return false;
        }

        if (context === 'page') {
            return id !== 'dashboard' && id !== 'settings';
        }

        if (context === 'dialog') {
            return id === 'dashboard' || id === 'settings';
        }

        return true;
    });
}
