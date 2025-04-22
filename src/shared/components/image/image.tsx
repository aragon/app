import NextImage from 'next/image';
import type { ComponentProps } from 'react';

export interface IImageProps extends Omit<ComponentProps<'img'>, 'width' | 'height' | 'src'> {
    /**
     * Source of the image.
     */
    src?: string;
    /**
     * Width property for the NextJs image.
     */
    width?: number | `${number}`;
    /**
     * Height property for the NextJs image.
     */
    height?: number | `${number}`;
    /**
     * Defines if the image should fill its container.
     * @default true
     */
    fill?: boolean;
}

export const Image: React.FC<IImageProps> = (props) => {
    const { src, alt = 'image', fill = true, sizes, ...otherProps } = props;

    // Set a default value to '50vw' for the sizes property (default value required by the Image component from NextJs)
    // when fill is set to true and sizes property is not set. We currently uses fill set to true for gov-ui-kit images
    // and these never exceed 50vw.
    const processedSizes = sizes ?? (fill ? '50vw' : undefined);

    if (src == null) {
        return null;
    }

    return <NextImage src={src} fill={fill} alt={alt} sizes={processedSizes} {...otherProps} />;
};
