import type { IDao } from '@/shared/api/daoService';
import { IconType } from '@aragon/ods';
import type { INavigationLink } from '../navigation';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes<string>>;

export const navigationDaoLinks = (dao?: IDao): DaoRoutes[] => {
    const hasSupportedPlugin = dao?.plugins.some(
        ({ subdomain }) => subdomain === 'multisig' || subdomain === 'token-voting',
    );

    return [
        {
            label: 'app.application.navigationDao.link.dashboard',
            link: `/dao/${dao?.permalink}/dashboard`,
            icon: IconType.APP_DASHBOARD,
        },
        {
            label: 'app.application.navigationDao.link.proposals',
            link: `/dao/${dao?.permalink}/proposals`,
            icon: IconType.APP_PROPOSALS,
            hidden: !hasSupportedPlugin,
        },
        {
            label: 'app.application.navigationDao.link.members',
            link: `/dao/${dao?.permalink}/members`,
            icon: IconType.APP_MEMBERS,
            hidden: !hasSupportedPlugin,
        },
        {
            label: 'app.application.navigationDao.link.assets',
            link: `/dao/${dao?.permalink}/assets`,
            icon: IconType.APP_ASSETS,
        },
        {
            label: 'app.application.navigationDao.link.transactions',
            link: `/dao/${dao?.permalink}/transactions`,
            icon: IconType.APP_TRANSACTIONS,
        },
        {
            label: 'app.application.navigationDao.link.settings',
            link: `/dao/${dao?.permalink}/settings`,
            icon: IconType.SETTINGS,
        },
    ];
};
