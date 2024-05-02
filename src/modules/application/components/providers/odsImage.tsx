import NextImage from 'next/image';
import type { ComponentProps } from 'react';

export interface IOdsImageProps extends ComponentProps<'img'> {}

export const OdsImage: React.FC<IOdsImageProps> = (props) => {
    const { src = '', alt = 'image', width, height, ...otherProps } = props;

    return <NextImage src={src} fill={true} alt={alt} {...otherProps} />;
};
