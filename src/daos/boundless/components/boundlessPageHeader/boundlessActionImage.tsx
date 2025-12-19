import { motion } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';

export interface IBoundlessActionImageProps {
    /**
     * The image to be displayed.
     */
    image: StaticImageData;
    /**
     * The alternative text for the image.
     */
    alt: string;
    /**
     * Whether the parent action item is hovered.
     */
    isHovered: boolean;
}

const MotionImage = motion.create(Image);

export const BoundlessActionImage: React.FC<IBoundlessActionImageProps> = (
    props,
) => {
    const { image, alt, isHovered } = props;

    return (
        <MotionImage
            alt={alt}
            animate={
                isHovered
                    ? { scale: 2.25, x: 8, y: 32 }
                    : { scale: 1, x: 0, y: 0 }
            }
            className="-z-10"
            height={144}
            initial={{ scale: 1, x: 0, y: 0 }}
            src={image}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            width={144}
        />
    );
};
