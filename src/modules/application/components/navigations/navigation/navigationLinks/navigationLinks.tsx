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
    variant?: NavigationLinksVariant;
}

export const NavigationLinks = <TRouteType extends string>(props: INavigationLinksProps<TRouteType>) => {
    const { className, links, variant = 'columns', ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <div
            className={classNames(
                'flex overflow-auto',
                { 'flex-row gap-10': variant === 'columns' },
                { 'flex-col gap-1': variant === 'rows' },
                className,
            )}
            {...otherProps}
        >
            {links.map(({ link, label, icon }) => (
                <NavigationLinksItem key={link} href={link} icon={icon} variant={variant}>
                    {t(label)}
                </NavigationLinksItem>
            ))}
        </div>
    );
};
