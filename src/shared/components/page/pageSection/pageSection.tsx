'use client';

import { Heading } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
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
}

export const PageSection: React.FC<IPageSectionProps> = (props) => {
    const { children, className, inset = true, title, description, ...otherProps } = props;

    const { contentType } = usePageContext();
    const childrenRef = useRef<HTMLDivElement>(null);

    const [childrenHeight, setChildrenHeight] = useState<number | undefined>();

    useEffect(() => setChildrenHeight(childrenRef.current?.offsetHeight), []);

    // childrenHeight will be undefined on the server side, therefore check if it is zero to properly prerender
    // sections with content on the server side
    if (childrenHeight === 0) {
        return null;
    }

    return (
        <div className={classNames('flex flex-col', { 'gap-4': inset }, className)} {...otherProps}>
            <div className="flex flex-col gap-2">
                <Heading size={contentType === 'main' ? 'h2' : 'h3'}>{title}</Heading>
                {description && <p className="text-base font-normal leading-normal text-neutral-500">{description}</p>}
            </div>
            <div ref={childrenRef}>{children}</div>
        </div>
    );
};
