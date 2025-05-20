import { Container } from '@/shared/components/container';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface INavigationContainerProps extends ComponentProps<'nav'> {
    /**
     * Classes for the navigation container.
     */
    containerClasses?: string;
}

export const NavigationContainer: React.FC<INavigationContainerProps> = (props) => {
    const { className, containerClasses, children, ...otherProps } = props;

    return (
        <nav
            className={classNames('bg-neutral-0 sticky top-0 z-10 flex w-full border-b border-neutral-100', className)}
            {...otherProps}
        >
            <Container className={classNames('w-full grow', containerClasses)}>{children}</Container>
        </nav>
    );
};
