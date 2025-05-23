import type { IconType } from '@aragon/gov-ui-kit';
import type { Route } from 'next';

export type NavigationLinksVariant = 'column' | 'row';

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
    /**
     * Whether the route is hidden.
     */
    hidden?: boolean;
    /**
     * Whether the route is hidden on medium screens.
     */
    mdHidden?: boolean;
}
