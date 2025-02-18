'use client';

import { Heading, Icon, type IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { usePageContext } from '../pageContext';

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
    /**
     * An icon to display next to the title.
     */
    icon?: IconType;
    /**
     * Styles for icon.
     * @default 'text-warning-500'
     */
    iconClassName?: string;
}

export const PageSection: React.FC<IPageSectionProps> = (props) => {
    const {
        children,
        className,
        inset = true,
        title,
        description,
        icon,
        iconClassName = 'text-warning-500',
        ...otherProps
    } = props;

    const { contentType } = usePageContext();

    return (
        <div className={classNames('flex flex-col', { 'gap-4': inset }, className)} {...otherProps}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Heading size={contentType === 'main' ? 'h2' : 'h3'}>{title}</Heading>
                    {icon && <Icon icon={icon} size="md" className={iconClassName} />}
                </div>
                {description && <p className="text-base font-normal leading-normal text-neutral-500">{description}</p>}
            </div>
            {children}
        </div>
    );
};
