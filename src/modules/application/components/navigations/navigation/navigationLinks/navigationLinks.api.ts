import type { IconType } from '@aragon/ods';
import type { Route } from 'next';

export type NavigationLinksVariant = 'columns' | 'rows';

export interface INavigationLink<TRouteType extends string> {
    /**
     * Label of the route.
     */
    label: string;
    /**
     * URL of the route.
     */
    link: Route<TRouteType>;
    /**
     * Icon of the route.
     */
    icon: IconType;
}
