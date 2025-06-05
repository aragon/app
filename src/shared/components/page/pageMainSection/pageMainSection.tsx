'use client';

import { Heading, Icon, type IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageMainSectionProps extends ComponentProps<'div'> {
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
    /**
     * An icon to display next to the title.
     */
    icon?: IconType;
}

export const PageMainSection: React.FC<IPageMainSectionProps> = (props) => {
    const { children, className, inset = true, title, description, icon, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-col', { 'gap-4': inset }, className)} {...otherProps}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Heading size="h2">{title}</Heading>
                    {icon && <Icon icon={icon} size="md" className="text-warning-500" />}
                </div>
                {description && <p className="text-base leading-normal font-normal text-neutral-500">{description}</p>}
            </div>
            {children}
        </div>
    );
};
