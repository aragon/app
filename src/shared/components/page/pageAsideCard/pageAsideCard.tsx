'use client';

import { Card, Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

import type { ComponentProps } from 'react';

export interface IPageAsideCardProps extends ComponentProps<'div'> {
    /**
     * Title of the card.
     */
    title: string;
}

export const PageAsideCard: React.FC<IPageAsideCardProps> = (props) => {
    const { children, className, title, ...otherProps } = props;

    return (
        <Card className={classNames('relative flex shrink-0 flex-col gap-4 p-6', className)} {...otherProps}>
            <Heading size="h3">{title}</Heading>
            {children}
        </Card>
    );
};
