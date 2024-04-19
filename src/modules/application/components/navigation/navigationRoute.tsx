import Link, { type LinkProps } from 'next/link';

export interface INavigationRouteProps<TRoute> extends LinkProps<TRoute> {}

export const NavigationRoute = <TRoute extends string>(props: INavigationRouteProps<TRoute>) => {
    const { href, children, ...otherProps } = props;

    return (
        <Link href={href} {...otherProps}>
            {children}
        </Link>
    );
};
