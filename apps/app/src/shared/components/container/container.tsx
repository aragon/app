import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IContainerProps extends ComponentProps<'div'> {}

export const Container: React.FC<IContainerProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'mx-auto max-w-screen-xl @app-lg/app:px-10 @app-md/app:px-6 @app-xl/app:px-6 px-4',
                className,
            )}
            {...otherProps}
        />
    );
};
