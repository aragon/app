import NextLink from 'next/link';
import type { ComponentProps } from 'react';

export interface IOdsLinkProps extends ComponentProps<'a'> {}

export const OdsLink: React.FC<IOdsLinkProps> = (props) => {
    const { href = {}, ...otherProps } = props;

    return <NextLink href={href} {...otherProps} />;
};
