import { motion } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';

export interface IBoundlessAnimatedActionImageProps {
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

export const BoundlessAnimatedActionImage: React.FC<IBoundlessAnimatedActionImageProps> = (props) => {
    const { image, alt, isHovered } = props;

    return (
        <MotionImage
            src={image}
            alt={alt}
            width={144}
            height={144}
            className="-z-10"
            initial={{ scale: 1, x: 0, y: 0 }}
            animate={isHovered ? { scale: 2.25, x: 8, y: 32 } : { scale: 1, x: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        />
    );
};
