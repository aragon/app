import type { INavigationRoute } from '../../navigation';

type DaoRoutes = INavigationRoute<__next_route_internal_types__.DynamicRoutes<string>>;

export const headerDaoRoutes = (slug?: string): DaoRoutes[] => [
    { label: 'Dashboard', link: `/dao/${slug}/dashboard` },
    { label: 'Proposals', link: `/dao/${slug}/proposals` },
    { label: 'Members', link: `/dao/${slug}/members` },
    { label: 'Assets', link: `/dao/${slug}/assets` },
    { label: 'Transactions', link: `/dao/${slug}/transactions` },
    { label: 'Settings', link: `/dao/${slug}/settings` },
];
