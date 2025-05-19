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
}

export const NavigationLinksItem = (props: INavigationLinksItemProps) => {
    const { href, variant, icon, children, className, ...otherProps } = props;

    const pathname = usePathname();
    const isActive = href != null && pathname.includes(href);

    const iconClassNames = classNames({ 'text-neutral-300': !isActive }, { 'text-primary-400': isActive });
    const textClassNames = classNames(
        'flex flex-row text-base font-normal leading-tight text-neutral-500',
        { 'text-neutral-500': !isActive },
        { 'text-neutral-800': isActive },
        { truncate: variant === 'column' },
        className,
    );

    return (
        <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={classNames(
                'flex flex-row items-center gap-2 py-3 text-neutral-500',
                { 'rounded-xl px-4 hover:bg-neutral-50': variant === 'column' },
                { 'bg-neutral-50': isActive && variant === 'column' },
                { 'text-neutral-800': isActive },
                className,
            )}
            {...otherProps}
        >
            <Icon icon={icon} className={iconClassNames} />
            <p className={textClassNames}>{children}</p>
        </Link>
    );
};
