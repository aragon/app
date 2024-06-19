import { IconType } from '@aragon/ods';
import type { INavigationLink } from '../navigation';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes<string>>;

export const navigationDaoLinks = (id?: string): DaoRoutes[] => [
    {
        label: 'app.application.navigationDao.link.dashboard',
        link: `/dao/${id}/dashboard`,
        icon: IconType.APP_DASHBOARD,
    },
    {
        label: 'app.application.navigationDao.link.proposals',
        link: `/dao/${id}/proposals`,
        icon: IconType.APP_PROPOSALS,
    },
    { label: 'app.application.navigationDao.link.members', link: `/dao/${id}/members`, icon: IconType.APP_MEMBERS },
    { label: 'app.application.navigationDao.link.assets', link: `/dao/${id}/assets`, icon: IconType.APP_ASSETS },
    {
        label: 'app.application.navigationDao.link.transactions',
        link: `/dao/${id}/transactions`,
        icon: IconType.APP_TRANSACTIONS,
    },
    { label: 'app.application.navigationDao.link.settings', link: `/dao/${id}/settings`, icon: IconType.SETTINGS },
];
