import NextLink from 'next/link';
import type { ComponentProps } from 'react';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, ...otherProps } = props;

    return <NextLink href={href} {...otherProps} />;
};
