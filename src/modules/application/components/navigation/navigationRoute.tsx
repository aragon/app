import { Link, type ILinkProps } from '@/shared/components/link';
import type { ReactNode } from 'react';

export interface INavigationRouteProps extends ILinkProps {
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const NavigationRoute = (props: INavigationRouteProps) => {
    const { href, children, ...otherProps } = props;

    return (
        <Link href={href} {...otherProps}>
            {children}
        </Link>
    );
};
