import { useTranslations } from '@/shared/components/translationsProvider';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { INavigationLink, NavigationLinksVariant } from './navigationLinks.api';
import { NavigationLinksItem } from './navigationLinksItem';

export interface INavigationLinksProps<TRouteType extends string> extends ComponentProps<'div'> {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
    /**
     * Variant of the component.
     * @default columns
     */
    variant: NavigationLinksVariant;
}

export const NavigationLinks = <TRouteType extends string>(props: INavigationLinksProps<TRouteType>) => {
    const { className, links, variant = 'columns', ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <div
            className={classNames('flex flex-row gap-10', { 'flex-row gap-10': variant === 'columns' }, className)}
            {...otherProps}
        >
            {links.map(({ link, label }) => (
                <NavigationLinksItem key={link} href={link} variant={variant}>
                    {t(label)}
                </NavigationLinksItem>
            ))}
        </div>
    );
};
