import type { IDao } from '@/shared/api/daoService';
import { IconType } from '@aragon/ods';
import type { INavigationLink } from '../navigation';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes<string>>;

export const navigationDaoLinks = (dao?: IDao): DaoRoutes[] => [
    {
        label: 'app.application.navigationDao.link.dashboard',
        link: `/dao/${dao?.id}/dashboard`,
        icon: IconType.APP_DASHBOARD,
    },
    {
        label: 'app.application.navigationDao.link.proposals',
        link: `/dao/${dao?.id}/proposals`,
        icon: IconType.APP_PROPOSALS,
        hidden: !dao?.isSupported,
    },
    {
        label: 'app.application.navigationDao.link.members',
        link: `/dao/${dao?.id}/members`,
        icon: IconType.APP_MEMBERS,
        hidden: !dao?.isSupported,
    },
    {
        label: 'app.application.navigationDao.link.assets',
        link: `/dao/${dao?.id}/assets`,
        icon: IconType.APP_ASSETS,
    },
    {
        label: 'app.application.navigationDao.link.transactions',
        link: `/dao/${dao?.id}/transactions`,
        icon: IconType.APP_TRANSACTIONS,
    },
    {
        label: 'app.application.navigationDao.link.settings',
        link: `/dao/${dao?.id}/settings`,
        icon: IconType.SETTINGS,
    },
];
