'use client';

import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageAsideProps extends ComponentProps<'aside'> {}

export const PageAside: React.FC<IPageAsideProps> = (props) => {
    const { className, children, ...otherProps } = props;

    return (
        <aside className={classNames('flex shrink-0 flex-col gap-10 lg:w-1/3', className)} {...otherProps}>
            {children}
        </aside>
    );
};
