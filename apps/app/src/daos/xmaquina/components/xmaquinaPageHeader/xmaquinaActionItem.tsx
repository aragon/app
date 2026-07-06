import classNames from 'classnames';
import Link from 'next/link';
import { useState } from 'react';
import type { IDaoHeaderAction } from '@/shared/utils/daoUtils';
import { XmaquinaActionImage } from './xmaquinaActionImage';
import { XmaquinaActionText } from './xmaquinaActionText';

export interface IXmaquinaActionItemProps extends IDaoHeaderAction {}

export const XmaquinaActionItem: React.FC<IXmaquinaActionItemProps> = (
    props,
) => {
    const { title, description, image, href, isExternal } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex h-full w-full lg:border-r lg:border-r-neutral-0/10">
            <Link
                className={classNames(
                    'group relative flex h-40 w-[calc(66.1vw)] shrink-0 grow items-center justify-between self-end overflow-hidden bg-black p-4 transition-all',
                    'md:w-102.5 md:basis-0 md:p-6 lg:w-full',
                    'before:absolute before:top-[calc(50%+408px)] before:left-1/2 before:size-160 before:-translate-x-1/2 before:-translate-y-1/2',
                    'before:rounded-full before:bg-[#1ED612] before:transition-[top] before:duration-500 before:ease-out',
                    'hover:before:top-1/2',
                )}
                href={href}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                target={isExternal ? '_blank' : '_self'}
            >
                <XmaquinaActionText
                    description={description}
                    isHovered={isHovered}
                    title={title}
                />

                {image && (
                    <XmaquinaActionImage
                        alt={title}
                        image={image}
                        isHovered={isHovered}
                    />
                )}
            </Link>
        </div>
    );
};
