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
        <nav className={classNames('flex w-full border-b border-neutral-100 bg-neutral-0', className)} {...otherProps}>
            <Container className={classNames('w-full grow', containerClasses)}>{children}</Container>
        </nav>
    );
};
