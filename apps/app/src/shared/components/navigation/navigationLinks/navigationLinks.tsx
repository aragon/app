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
                    'item-center flex-row gap-x-nav-section xl:gap-x-10':
                        variant === 'row',
                },
                { 'flex-col gap-y-nav-tight': variant === 'column' },
                className,
            )}
            {...otherProps}
        >
            {links
                .filter((link) => !link.hidden)
                .map(({ link, label, icon, badge }) => (
                    <NavigationLinksItem
                        badge={badge}
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
