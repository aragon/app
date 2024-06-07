import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <Container className={classNames('flex flex-row gap-20 pb-20 pt-12', className)} inset={true} {...otherProps}>
            {children}
        </Container>
    );
};
