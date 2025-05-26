'use client';

import { Link, type ILinkProps } from '@/shared/components/link';
import { Icon, type IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
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
}

export const NavigationLinksItem: React.FC<INavigationLinksItemProps> = (props) => {
    const { href, variant, icon, iconSide = 'left', children, className, ...otherProps } = props;
    const pathname = usePathname();
    const isActive = href != null && pathname.includes(href) && href !== '/';

    const linkClassNames = classNames(
        'text-base font-normal leading-tight text-neutral-500 hover:text-neutral-800 active:text-neutral-800 truncate',
        'group flex items-center py-3 focus-ring-primary',
        { 'rounded-xl px-4 hover:bg-neutral-50': variant === 'column' },
        { 'bg-neutral-50': isActive && variant === 'column' },
        { 'text-neutral-800': isActive },
        { 'gap-2': iconSide === 'left' },
        { 'justify-between flex-row-reverse': iconSide === 'right' },
        className,
    );

    const iconClassNames = classNames(
        !isActive ? 'text-neutral-300' : variant === 'row' ? 'text-primary-400' : 'text-neutral-800',
        'group-active:text-neutral-500',
    );

    return (
        <Link href={href} aria-current={isActive ? 'page' : undefined} className={linkClassNames} {...otherProps}>
            <Icon icon={icon} className={iconClassNames} />
            {children}
        </Link>
    );
};
