import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IContainerProps extends ComponentProps<'div'> {}

export const Container: React.FC<IContainerProps> = (props) => {
    const { className, ...otherProps } = props;

    return <div className={classNames('mx-auto max-w-screen-xl px-3 md:px-6', className)} {...otherProps} />;
};
