import classNames from 'classnames';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, rel = '', target, onClick, className, ...otherProps } = props;

    const { isBlocked } = useBlockNavigationContext();

    const processedRel = target === '_blank' ? `noopener noreferrer ${rel}` : rel;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isBlocked && !target) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }
    };

    // Needed to disable pointer events on the link and prevent navigation
    // when aria-disabled is set to true
    const isDisabled = otherProps['aria-disabled'] === true;

    return (
        <NextLink
            className={classNames(className, {
                'pointer-events-none': isDisabled,
            })}
            href={href}
            onClick={handleClick}
            rel={processedRel}
            target={target}
            {...otherProps}
        />
    );
};
