import { Link, type ILinkProps } from '@/shared/components/link';
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
     * Variant of the component.
     */
    variant: NavigationLinksVariant;
}

export const NavigationLinksItem = (props: INavigationLinksItemProps) => {
    const { href, variant, children, className, ...otherProps } = props;

    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={classNames(
                'py-3 text-base font-normal leading-tight text-neutral-500',
                { 'border-b-2 border-primary-400 pb-2.5': isActive && variant === 'columns' },
                { 'text-neutral-800': isActive },
                className,
            )}
            {...otherProps}
        >
            {children}
        </Link>
    );
};
