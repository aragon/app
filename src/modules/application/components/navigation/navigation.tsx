import classNames from 'classnames';
import type { Route } from 'next';
import type { ComponentProps } from 'react';
import { NavigationRoute } from './navigationRoute';

export interface INavigationRoute<TRouteType extends string> {
    /**
     * Label of the route.
     */
    label: string;
    /**
     * URL of the route.
     */
    link: Route<TRouteType>;
}

export interface INavigationProps<TRouteType extends string> extends ComponentProps<'nav'> {
    /**
     * Routes of the application.
     */
    routes: Array<INavigationRoute<TRouteType>>;
}

export const Navigation = <TRouteType extends string>(props: INavigationProps<TRouteType>) => {
    const { className, routes, ...otherProps } = props;

    return (
        <nav className={classNames('flex flex-row gap-10', className)} {...otherProps}>
            {routes.map(({ link, label }) => (
                <NavigationRoute key={link} href={link}>
                    {label}
                </NavigationRoute>
            ))}
        </nav>
    );
};
