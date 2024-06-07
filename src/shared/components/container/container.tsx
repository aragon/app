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
                'mx-auto max-w-screen-xl px-3',
                { 'md:px-6': !inset },
                { 'md:px-20': inset },
                className,
            )}
            {...otherProps}
        />
    );
};
