import NextLink from 'next/link';
import type { ComponentProps } from 'react';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, rel = '', target, ...otherProps } = props;

    const processedRel = target === '_blank' ? `noopener noreferrer ${rel}` : rel;

    return <NextLink href={href} rel={processedRel} target={target} {...otherProps} />;
};
