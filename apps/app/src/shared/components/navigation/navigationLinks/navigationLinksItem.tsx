'use client';

import { Icon, type IconType, Tag } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { type ILinkProps, Link } from '@/shared/components/link';
import type { NavigationLinksVariant } from './navigationLinks.api';

export interface INavigationLinksItemProps extends ILinkProps {
    /**
     * Children of the component.
     */
    children?: ReactNode;
    /**
     * Icon of the navigation link.
     */
    icon: IconType;
    /**
     * Variant of the component.
     */
    variant: NavigationLinksVariant;
    /**
     * Icon side of the navigation link.
     * @default 'left'
     */
    iconSide?: 'left' | 'right';
    /**
     * Short count displayed after the label, pushed to the far end in the column variant.
     */
    badge?: string;
}

export const NavigationLinksItem: React.FC<INavigationLinksItemProps> = (
    props,
) => {
    const {
        href,
        variant,
        icon,
        iconSide = 'left',
        badge,
        children,
        className,
        ...otherProps
    } = props;

    const pathname = usePathname();
    const isActive = href != null && pathname.includes(href) && href !== '/';

    const linkClassNames = classNames(
        'truncate text-base leading-tight font-normal text-link-secondary-default hover:text-link-secondary-hover-nav active:text-link-secondary-active',
        'group flex items-center py-inset-nav-item focus-ring ring-accent-focus',
        {
            'rounded-xl px-inset-nav-item hover:bg-surface-hover':
                variant === 'column',
        },
        { 'bg-surface-selected': isActive && variant === 'column' },
        { 'text-surface-selected-label': isActive },
        { 'gap-nav-related': iconSide === 'left' },
        { 'flex-row-reverse justify-between': iconSide === 'right' },
        className,
    );

    const iconClassNames = classNames(
        isActive
            ? variant === 'row'
                ? 'icon-accent-selected'
                : 'icon-accent-selected-nav'
            : 'icon-surface-default',
        'group-active:icon-surface-active',
    );

    return (
        <Link
            aria-current={isActive ? 'page' : undefined}
            className={linkClassNames}
            href={href}
            {...otherProps}
        >
            <Icon className={iconClassNames} icon={icon} />
            {children}
            {badge != null && (
                <Tag
                    className={classNames('shrink-0', {
                        'ml-auto': variant === 'column',
                    })}
                    label={badge}
                    variant="critical"
                />
            )}
        </Link>
    );
};
