import { useTranslations } from '@/shared/components/translationsProvider';
import classNames from 'classnames';
import type { Route } from 'next';
import type { ComponentProps } from 'react';
import { NavigationRoute } from './navigationRoute';

export interface INavigationRoute<TRouteType extends string, TLabel extends string = string> {
    /**
     * Label of the route.
     */
    label: TLabel;
    /**
     * URL of the route.
     */
    link: Route<TRouteType>;
}

export interface INavigationProps<TRouteType extends string, TLabel extends string = string>
    extends ComponentProps<'nav'> {
    /**
     * Routes of the application.
     */
    routes: Array<INavigationRoute<TRouteType, TLabel>>;
}

export const Navigation = <TRouteType extends string, TLabel extends string = string>(
    props: INavigationProps<TRouteType, TLabel>,
) => {
    const { className, routes, ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <nav className={classNames('flex flex-row gap-10', className)} {...otherProps}>
            {routes.map(({ link, label }) => (
                <NavigationRoute key={link} href={link}>
                    {t(label)}
                </NavigationRoute>
            ))}
        </nav>
    );
};
