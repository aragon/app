import { IconType } from '@aragon/ods';
import type { INavigationLink } from '../navigation';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes<string>>;

export const navigationDaoLinks = (slug?: string): DaoRoutes[] => [
    {
        label: 'app.application.navigationDao.link.dashboard',
        link: `/dao/${slug}/dashboard`,
        icon: IconType.APP_DASHBOARD,
    },
    {
        label: 'app.application.navigationDao.link.proposals',
        link: `/dao/${slug}/proposals`,
        icon: IconType.APP_PROPOSALS,
    },
    { label: 'app.application.navigationDao.link.members', link: `/dao/${slug}/members`, icon: IconType.APP_MEMBERS },
    { label: 'app.application.navigationDao.link.assets', link: `/dao/${slug}/assets`, icon: IconType.APP_ASSETS },
    {
        label: 'app.application.navigationDao.link.transactions',
        link: `/dao/${slug}/transactions`,
        icon: IconType.APP_TRANSACTIONS,
    },
    { label: 'app.application.navigationDao.link.settings', link: `/dao/${slug}/settings`, icon: IconType.SETTINGS },
];
