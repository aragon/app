import type { INavigationLink } from '../../navigationLinks';

type DaoRoutes = INavigationLink<__next_route_internal_types__.DynamicRoutes<string>>;

export const navigationDaoLinks = (slug?: string): DaoRoutes[] => [
    { label: 'app.application.navigationDao.link.dashboard', link: `/dao/${slug}/dashboard` },
    { label: 'app.application.navigationDao.link.proposals', link: `/dao/${slug}/proposals` },
    { label: 'app.application.navigationDao.link.members', link: `/dao/${slug}/members` },
    { label: 'app.application.navigationDao.link.assets', link: `/dao/${slug}/assets` },
    { label: 'app.application.navigationDao.link.transactions', link: `/dao/${slug}/transactions` },
    { label: 'app.application.navigationDao.link.settings', link: `/dao/${slug}/settings` },
];
