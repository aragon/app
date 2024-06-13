import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IContainerProps extends ComponentProps<'div'> {
    /**
     * Adds additional right and left padding when set to true.
     * @default false
     */
    inset?: boolean;
}

export const Container: React.FC<IContainerProps> = (props) => {
    const { className, inset, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'mx-auto max-w-screen-xl px-4 md:px-6',
                { 'lg:px-10 xl:px-6': !inset },
                { 'lg:px-10 xl:px-20': inset },
                className,
            )}
            {...otherProps}
        />
    );
};
