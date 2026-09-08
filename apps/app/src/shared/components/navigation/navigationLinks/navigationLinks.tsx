import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import type {
    INavigationLink,
    NavigationLinksVariant,
} from './navigationLinks.api';
import { NavigationLinksItem } from './navigationLinksItem';

export interface INavigationLinksProps extends ComponentProps<'div'> {
    /**
     * Links of the application.
     */
    links: INavigationLink[];
    /**
     * Variant of the component.
     * @default row
     */
    variant?: NavigationLinksVariant;
}

export const NavigationLinks: React.FC<INavigationLinksProps> = (props) => {
    const { className, links, variant = 'row', ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <div
            className={classNames(
                'flex',
                {
                    'item-center flex-row @app-xl/app:gap-x-10 gap-x-6':
                        variant === 'row',
                },
                { 'flex-col gap-y-1': variant === 'column' },
                className,
            )}
            {...otherProps}
        >
            {links
                .filter((link) => !link.hidden)
                .map(({ link, label, icon }) => (
                    <NavigationLinksItem
                        href={link}
                        icon={icon}
                        key={link}
                        variant={variant}
                    >
                        {t(label)}
                    </NavigationLinksItem>
                ))}
        </div>
    );
};
