import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <Container
            className={classNames(
                'flex flex-col gap-10 pb-20 pt-8 md:gap-20 md:pt-12 lg:flex-row lg:gap-10 xl:gap-20',
                className,
            )}
            inset={true}
            {...otherProps}
        >
            {children}
        </Container>
    );
};
