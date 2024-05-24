import NextImage from 'next/image';
import type { ComponentProps } from 'react';

export interface IImageProps extends ComponentProps<'img'> {}

export const Image: React.FC<IImageProps> = (props) => {
    const { src = '', alt = 'image', width, height, ...otherProps } = props;

    return <NextImage src={src} fill={true} alt={alt} {...otherProps} />;
};
