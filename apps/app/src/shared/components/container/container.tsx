import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IContainerProps extends ComponentProps<'div'> {}

export const Container: React.FC<IContainerProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                // biome-ignore lint/plugin/noPrimitiveSpacing: the 40 px gutter between lg and xl: no inset role has it
                'mx-auto max-w-screen-xl px-inset-page lg:px-10 xl:px-inset-page',
                className,
            )}
            {...otherProps}
        />
    );
};
