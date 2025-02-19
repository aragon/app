'use client';

import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageAsideProps extends ComponentProps<'aside'> {}

export const PageAside: React.FC<IPageAsideProps> = (props) => {
    const { className, children, ...otherProps } = props;

    return (
        <aside className={classNames('flex w-full shrink-0 flex-col gap-10 lg:w-[400px]', className)} {...otherProps}>
            {children}
        </aside>
    );
};
