import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IHeaderBaseProps extends ComponentProps<'header'> {}

export const HeaderBase: React.FC<IHeaderBaseProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <header
            className={classNames('h-[124px] w-full border-b border-neutral-100 bg-neutral-0', className)}
            {...otherProps}
        />
    );
};
