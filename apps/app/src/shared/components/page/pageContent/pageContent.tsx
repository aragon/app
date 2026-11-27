import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <Container
            className={classNames(
                // biome-ignore lint/plugin/noPrimitiveSpacing: page column gaps and the 80 px page bottom: no role has them
                'flex flex-col gap-10 pt-inset-page pb-20 md:gap-16 lg:flex-row lg:gap-10 xl:gap-16',
                className,
            )}
            {...otherProps}
        >
            {children}
        </Container>
    );
};
