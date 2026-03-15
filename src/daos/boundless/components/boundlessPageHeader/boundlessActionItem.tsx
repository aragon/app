import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { IDaoHeaderAction } from '@/shared/utils/daoUtils';
import BackgroundImage from '../../assets/boundless-img-background.png';
import { BoundlessActionImage } from './boundlessActionImage';
import { BoundlessActionText } from './boundlessActionText';
import { BoundlessActionAvatarIcon } from './boundlessAvatarIcon';

export interface IBoundlessActionItemProps extends IDaoHeaderAction {}

export const BoundlessActionItem: React.FC<IBoundlessActionItemProps> = (
    props,
) => {
    const { title, description, image, href, isExternal } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            className="group relative flex h-40 w-80 items-center justify-between overflow-hidden rounded-lg p-4 transition-all md:w-[400px] md:p-6"
            href={href}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            target={isExternal ? '_blank' : '_self'}
        >
            <Image
                alt=""
                className="absolute inset-0 -z-20 object-cover"
                fill={true}
                src={BackgroundImage}
            />
            <div className="relative z-10 flex size-full flex-col justify-between transition-all duration-300 md:justify-center md:group-hover:justify-between">
                <BoundlessActionText
                    description={description}
                    isHovered={isHovered}
                    title={title}
                />
                <BoundlessActionAvatarIcon isHovered={isHovered} />
            </div>
            {image && (
                <BoundlessActionImage
                    alt={title}
                    image={image}
                    isHovered={isHovered}
                />
            )}
        </Link>
    );
};
