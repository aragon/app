import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Container } from '../../container';

export interface IPageContentProps extends ComponentProps<'div'> {}

export const PageContent: React.FC<IPageContentProps> = (props) => {
    const { children, className, ...otherProps } = props;

    return (
        <Container
            className={classNames(
                'flex @app-lg/app:flex-row flex-col @app-lg/app:gap-10 @app-md/app:gap-16 @app-xl/app:gap-16 gap-10 @app-md/app:pt-10 pt-6 pb-20',
                className,
            )}
            {...otherProps}
        >
            {children}
        </Container>
    );
};
