import NextLink from 'next/link';
import type { ComponentProps } from 'react';

export interface ILinkProps extends ComponentProps<'a'> {}

const defaultBlankRel = 'noopener noreferrer';

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, rel = '', target, ...otherProps } = props;

    const processedRel = target === '_blank' && !rel.includes(defaultBlankRel) ? `${defaultBlankRel} ${rel}` : rel;

    return <NextLink href={href} rel={processedRel} target={target} {...otherProps} />;
};
