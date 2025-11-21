import classNames from 'classnames';
import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps } from 'react';
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

    return (
        <Link
            href={href}
            target={isExternal ? '_blank' : '_self'}
            className={classNames(
                'relative flex h-40 shrink-0 grow basis-0 items-center bg-black p-4 transition-all md:p-6',
                className,
            )}
        >
            <XmaquinaActionText title={title} description={description} />

            <XmaquinaActionImage icon={icon} alt={title} />
        </Link>
    );
};
