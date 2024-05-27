import type { Translations } from '@/shared/utils/translationsUtils';
import type { INavigationRoute } from '../../navigation';

type DaoRoutes = INavigationRoute<
    __next_route_internal_types__.DynamicRoutes<string>,
    keyof Translations['app']['application']['headerDao']['route']
>;

export const headerDaoRoutes = (slug?: string): DaoRoutes[] => [
    { label: 'dashboard', link: `/dao/${slug}/dashboard` },
    { label: 'proposals', link: `/dao/${slug}/proposals` },
    { label: 'members', link: `/dao/${slug}/members` },
    { label: 'assets', link: `/dao/${slug}/assets` },
    { label: 'transactions', link: `/dao/${slug}/transactions` },
    { label: 'settings', link: `/dao/${slug}/settings` },
];
