import NextImage from 'next/image';
import type { ComponentProps } from 'react';

export interface IImageProps
    extends Omit<ComponentProps<'img'>, 'width' | 'height' | 'src'> {
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

    // Conservative default for fill images — most gov-ui-kit images are small avatars/icons.
    // 128px prevents the browser from selecting oversized srcset candidates.
    const processedSizes = sizes ?? (fill ? '128px' : undefined);

    if (src == null) {
        return null;
    }

    return (
        <NextImage
            alt={alt}
            fill={fill}
            sizes={processedSizes}
            src={src}
            {...otherProps}
        />
    );
};
