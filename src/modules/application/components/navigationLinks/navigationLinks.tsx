import { useTranslations } from '@/shared/components/translationsProvider';
import classNames from 'classnames';
import type { Route } from 'next';
import type { ComponentProps } from 'react';
import { NavigationLinksItem } from './navigationLinksItem';

export interface INavigationLink<TRouteType extends string> {
    /**
     * Label of the route.
     */
    label: string;
    /**
     * URL of the route.
     */
    link: Route<TRouteType>;
}

export interface INavigationLinksProps<TRouteType extends string> extends ComponentProps<'div'> {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
}

export const NavigationLinks = <TRouteType extends string>(props: INavigationLinksProps<TRouteType>) => {
    const { className, links, ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <div className={classNames('flex flex-row gap-10', className)} {...otherProps}>
            {links.map(({ link, label }) => (
                <NavigationLinksItem key={link} href={link}>
                    {t(label)}
                </NavigationLinksItem>
            ))}
        </div>
    );
};
