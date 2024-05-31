import { Link, type ILinkProps } from '@/shared/components/link';
import { Icon, type IconType } from '@aragon/ods';
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
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={classNames(
                'flex flex-row gap-3 py-3 text-neutral-500',
                { 'rounded-xl px-4 hover:bg-neutral-50': variant === 'rows' },
                { 'border-b-2 border-primary-400 pb-2.5': isActive && variant === 'columns' },
                { 'bg-neutral-50': isActive && variant === 'rows' },
                { 'text-neutral-800': isActive },
                className,
            )}
            {...otherProps}
        >
            {variant === 'rows' && <Icon icon={icon} />}
            <p className="text-base font-normal leading-tight">{children}</p>
        </Link>
    );
};
