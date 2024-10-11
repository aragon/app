import { type Route } from 'next';

export interface IBannerProps {
    id: string;
}

export interface IBannerContent<TRouteType extends string> {
    priority: number;
    message: string;
    buttonLabel: string;
    href: Route<TRouteType>;
}
