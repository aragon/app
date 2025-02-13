import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {
    /**
     * Whether the content should be inset vertically or not.
     * Useful for pages with a header.
     * @default true
     */
    inset?: boolean;
}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, inset = true, className, ...otherProps } = props;

    return (
        <Container
            className={classNames(
                'flex flex-col gap-8 pb-20 md:gap-16 lg:flex-row lg:gap-8 xl:gap-16',
                { 'pt-8 md:pt-12': inset, 'pt-0': !inset },
                className,
            )}
            {...otherProps}
        >
            {children}
        </Container>
    );
};
