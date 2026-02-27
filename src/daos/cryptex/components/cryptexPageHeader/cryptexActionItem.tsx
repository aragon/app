import classNames from 'classnames';
import type { Route } from 'next';
import type { StaticImageData } from 'next/image';
import Link from 'next/link';
import { type ComponentProps, useState } from 'react';
import { CryptexActionText } from './cryptexActionText';
import { CryptexActionAvatarIcon } from './cryptexAvatarIcon';

export interface ICryptexActionItemProps extends ComponentProps<'button'> {
    /**
     * The title of the card.
     */
    title: string;
    /**
     * The description of the card.
     */
    description: string;
    /**
     * The image to display in the card.
     */
    image: StaticImageData;
    /**
     * The href to navigate to when the card is clicked.
     */
    href: Route;
    /**
     * Whether the link is external or not.
     */
    isExternal?: boolean;
    isLightMode?: boolean;
}

export const CryptexActionItem: React.FC<ICryptexActionItemProps> = (props) => {
    const { title, description, href, isExternal, isLightMode, className } =
        props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            className={classNames(
                'group relative flex h-40 w-80 items-center justify-between overflow-hidden rounded-xl p-4 backdrop-blur-sm transition-colors duration-100 md:w-[400px] md:p-6',
                isLightMode
                    ? 'border border-[#CEC7E2] bg-[#ECE8F5]/74 hover:border-[#BBB1D8] hover:bg-[#E5E0F2]/86'
                    : 'border border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.09]',
                className,
            )}
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            target={isExternal ? '_blank' : '_self'}
        >
            <div className="relative z-10 flex size-full flex-col justify-start">
                <CryptexActionText
                    description={description}
                    isHovered={isHovered}
                    isLightMode={isLightMode}
                    title={title}
                />
            </div>
            <CryptexActionAvatarIcon
                isHovered={isHovered}
                isLightMode={isLightMode}
            />
        </Link>
    );
};
