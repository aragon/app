import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IHeaderBaseProps extends ComponentProps<'header'> {}

export const HeaderBase: React.FC<IHeaderBaseProps> = (props) => {
    const { className, children, ...otherProps } = props;

    return (
        <header
            className={classNames('flex w-full border-b border-neutral-100 bg-neutral-0 px-6', className)}
            {...otherProps}
        >
            {children}
        </header>
    );
};
