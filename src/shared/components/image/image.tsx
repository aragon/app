import NextImage from 'next/image';
import type { ComponentProps } from 'react';

export interface IImageProps extends Omit<ComponentProps<'img'>, 'width' | 'height'> {
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
    const { src = '', alt = 'image', fill = true, ...otherProps } = props;

    return <NextImage src={src} fill={fill} alt={alt} {...otherProps} />;
};
