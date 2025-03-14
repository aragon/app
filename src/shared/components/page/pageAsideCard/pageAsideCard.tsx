'use client';

import { Card, Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image from 'next/image';
import type { ComponentProps } from 'react';

export interface IPageAsideCardProps extends ComponentProps<'div'> {
    /**
     * Title of the card.
     */
    title: string;
    /**
     * Icon to be displayed on the card.
     */
    icon?: string;
}

export const PageAsideCard: React.FC<IPageAsideCardProps> = (props) => {
    const { children, className, title, icon, ...otherProps } = props;

    return (
        <Card className={classNames('flex shrink-0 flex-col gap-4 p-6', className)} {...otherProps}>
            <div className="flex items-center justify-between gap-2">
                <Heading size="h3">{title}</Heading>
                {icon && <Image src={icon} alt={title} className="w-8 rounded-full" />}
            </div>
            {children}
        </Card>
    );
};
