import classNames from 'classnames';
import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { XmaquinaActionImage } from './xmaquinaActionImage';
import { XmaquinaActionText } from './xmaquinaActionText';

export interface IXmaquinaActionItemProps extends ComponentProps<'a'> {
    /**
     * The title of the action.
     */
    title: string;
    /**
     * The description of the action.
     */
    description: string;
    /**
     * The SVG icon to display.
     */
    icon: string;
    /**
     * The href to navigate to when clicked.
     */
    href: Route;
    /**
     * Whether the link is external or not.
     */
    isExternal?: boolean;
}

export const XmaquinaActionItem: React.FC<IXmaquinaActionItemProps> = (props) => {
    const { title, description, icon, href, isExternal, className } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="border-r-neutral-0/10 flex h-full w-full border-r">
            <Link
                href={href}
                target={isExternal ? '_blank' : '_self'}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={classNames(
                    'group relative flex h-40 w-[calc(100vw-18px)] shrink-0 grow items-center justify-between self-end overflow-hidden bg-black p-4 transition-all',
                    'md:w-full md:basis-0 md:p-6',
                    'before:absolute before:top-[calc(50%+408px)] before:left-1/2 before:size-160 before:-translate-x-1/2 before:-translate-y-1/2',
                    'before:rounded-full before:bg-[#1ED612] before:transition-[top] before:duration-500 before:ease-out',
                    'hover:before:top-1/2',
                    className,
                )}
            >
                <XmaquinaActionText title={title} description={description} isHovered={isHovered} />

                <XmaquinaActionImage icon={icon} alt={title} isHovered={isHovered} />
            </Link>
        </div>
    );
};
