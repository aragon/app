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
     * Determines display order. Lower values appear first.
     */
    order?: number;
    /**
     * Short count displayed after the label (e.g. the number of to-dos waiting on the wallet).
     */
    badge?: string;
}

export interface INavigationLinkGroup {
    /**
     * Stable identifier of the group, its React key among the groups of a navigation. Not derived from the label: a
     * workspace named like a fixed group would otherwise share its key.
     */
    id: string;
    /**
     * Label displayed above the links of the group (e.g. "Inbox", or the name of the workspace).
     */
    label?: string;
    /**
     * Links of the group. A group whose links are all hidden is not rendered.
     */
    links: INavigationLink[];
}
