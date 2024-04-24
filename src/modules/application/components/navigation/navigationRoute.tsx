import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';

export interface INavigationRouteProps<TRoute> extends LinkProps<TRoute> {
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const NavigationRoute = <TRoute extends string>(props: INavigationRouteProps<TRoute>) => {
    const { href, children, ...otherProps } = props;

    return (
        <Link href={href} {...otherProps}>
            {children}
        </Link>
    );
};
