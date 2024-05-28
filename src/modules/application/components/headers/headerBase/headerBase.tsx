import { Container } from '@/shared/components/container';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IHeaderBaseProps extends ComponentProps<'header'> {
    /**
     * Classes for the header container.
     */
    containerClasses?: string;
}

export const HeaderBase: React.FC<IHeaderBaseProps> = (props) => {
    const { className, containerClasses, children, ...otherProps } = props;

    return (
        <header
            className={classNames('flex w-full border-b border-neutral-100 bg-neutral-0', className)}
            {...otherProps}
        >
            <Container className={classNames('grow', containerClasses)}>{children}</Container>
        </header>
    );
};
