import type { Route } from 'next';
import type { StaticImageData } from 'next/image';

/**
 * A navigation action displayed in a DAO's custom page header.
 */
export interface IDaoHeaderAction {
    /**
     * Translation key for the action title.
     */
    title: string;
    /**
     * Translation key for the action description.
     */
    description: string;
    /**
     * URL to navigate to when the action is clicked.
     */
    href: Route | string;
    /**
     * Whether the link opens in a new tab.
     */
    isExternal: boolean;
    /**
     * Optional image or icon to display for the action.
     */
    image?: StaticImageData | string;
}
