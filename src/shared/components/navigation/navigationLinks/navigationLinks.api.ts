import type { IconType } from '@aragon/gov-ui-kit';

export type NavigationLinksVariant = 'column' | 'row';

export interface INavigationLink {
    /**
     * Label of the route.
     */
    label: string;
    /**
     * URL of the route.
     */
    link: string;
    /**
     * Icon of the route.
     */
    icon: IconType;
    /**
     * Whether the route is hidden.
     */
    hidden?: boolean;
    /**
     * Whether the route is hidden on lg screens.
     */
    lgHidden?: boolean;
}
