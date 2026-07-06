import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <Container
            className={classNames(
                'flex flex-col gap-10 pt-6 pb-20 md:gap-16 md:pt-10 lg:flex-row lg:gap-10 xl:gap-16',
                className,
            )}
            {...otherProps}
        >
            {children}
        </Container>
    );
};
