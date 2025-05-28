import classNames from 'classnames';
import type { Route } from 'next';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { type ComponentProps, useState } from 'react';
import BackgroundImage from '../assets/boundless-img-background.png';
import { BoundlessAnimatedActionImage, BoundlessAnimatedActionText, BoundlessAnimatedAvatarIcon } from './animated';

export interface IBoundlessActionItemProps extends ComponentProps<'button'> {
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
}

export const BoundlessActionItem: React.FC<IBoundlessActionItemProps> = (props) => {
    const { title, description, image, href, className } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={href}
            className={classNames(
                'group relative flex h-40 w-80 items-center justify-between overflow-hidden rounded-lg p-4 transition-all md:w-[400px] md:p-6',
                className,
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image src={BackgroundImage} alt="" fill={true} className="absolute inset-0 -z-20 object-cover" />
            <div className="relative z-10 flex size-full flex-col justify-between transition-all duration-300 md:justify-center md:group-hover:justify-between">
                <BoundlessAnimatedActionText title={title} description={description} isHovered={isHovered} />
                <BoundlessAnimatedAvatarIcon isHovered={isHovered} />
            </div>
            <BoundlessAnimatedActionImage image={image} alt={title} isHovered={isHovered} />
        </Link>
    );
};
