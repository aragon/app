'use client';

import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageSectionProps extends ComponentProps<'div'> {
    /**
     * Set the default spacing between the title and the section content when set to true.
     * @default true
     */
    inset?: boolean;
    /**
     * Title of the section.
     */
    title: string;
    /**
     * Description of the section.
     */
    description?: string;
}

export const PageSection: React.FC<IPageSectionProps> = (props) => {
    const { children, className, inset = true, title, description, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-col', { 'gap-4': inset }, className)} {...otherProps}>
            <div className="flex flex-col gap-2">
                <Heading size="h2">{title}</Heading>
                {description && <p className="text-base font-normal leading-normal text-neutral-500">{description}</p>}
            </div>
            {children}
        </div>
    );
};
