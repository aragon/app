import { type Route } from 'next';

export interface IBannerProps {
    /**
     * ID of the DAO.
     */
    id: string;
}

export interface IBannerContent<TRouteType extends string> {
    /**
     * Priority of the banner. Banners with lowest priority will be displayed first.
     */
    priority: number;
    /**
     * Message to display in the banner.
     */
    message: string;
    /**
     * Label for the button in the banner.
     */
    buttonLabel: string;
    /**
     * Route to navigate to when the button is clicked.
     */
    href: Route<TRouteType>;
}
