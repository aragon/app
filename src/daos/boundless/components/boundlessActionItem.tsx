import { useRouter } from '@/shared/lib/nextNavigation';
import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Image, { type StaticImageData } from 'next/image';
import { ComponentProps } from 'react';
import BackgroundImage from '../assets/boundless-img-background.png';

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
    href: string;
}

export const BoundlessActionItem: React.FC<IBoundlessActionItemProps> = (props) => {
    const { title, description, image, href, className, ...otherProps } = props;

    const router = useRouter();

    return (
        <button
            className={classNames(
                'group relative flex h-40 w-[400px] items-center justify-between overflow-hidden rounded-lg p-6 transition-all',
                className,
            )}
            onClick={() => router.push(href)}
            {...otherProps}
        >
            <Image src={BackgroundImage} alt="" fill className="absolute inset-0 -z-20 object-cover" />
            <div className="z-10 flex h-full w-full flex-col justify-center transition-all duration-300 group-hover:justify-between">
                <div className="flex flex-col items-start transition-all duration-300 group-hover:translate-y-[-0.5rem]">
                    <p className="text-2xl leading-tight text-[#000000]">{title}</p>
                    <p className="text-nowrap text-lg leading-tight text-[#78716C]">{description}</p>
                </div>
                <AvatarIcon
                    size="lg"
                    icon={IconType.LINK_EXTERNAL}
                    className="bg-transparent opacity-0 transition-all duration-300 group-hover:opacity-100"
                />
            </div>
            <Image
                src={image}
                alt={title}
                width={144}
                height={144}
                className="-z-10 transition-transform duration-300 ease-in-out group-hover:translate-x-2 group-hover:translate-y-8 group-hover:scale-[2.25]"
            />
        </button>
    );
};
