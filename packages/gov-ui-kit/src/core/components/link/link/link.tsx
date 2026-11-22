import classNames from 'classnames';
import React from 'react';
import { urlUtils } from '../../../utils';
import { Icon, IconType } from '../../icon';
import { LinkBase } from '../linkBase';
import type { ILinkProps, LinkVariant } from './link.api';

const variantToLabelClassNames: Record<LinkVariant | 'disabled', string[]> = {
    primary: [
        'text-link-default cursor-pointer', // Default
        'hover:text-link-hover', // Hover state
        'active:text-link-active', // Active state
    ],
    neutral: [
        'text-link-secondary-default cursor-pointer', // Default
        'hover:text-link-secondary-hover', // Hover state
        'active:text-link-secondary-active', // Active state
    ],
    disabled: ['truncate text-surface-disabled'],
};

export const Link = React.forwardRef<HTMLAnchorElement, ILinkProps>((props, ref) => {
    const {
        children,
        disabled = false,
        variant = 'primary',
        href,
        isExternal = false,
        target = isExternal ? '_blank' : undefined,
        onClick,
        className,
        textClassName,
        rel,
        showUrl,
        ...otherProps
    } = props;

    const processedHref = isExternal ? urlUtils.normalizeExternalHref(href) : href;

    const processedVariant = disabled ? 'disabled' : variant;
    const linkClassName = classNames(
        'inline-flex max-w-fit flex-col gap-y-tight--2-4 truncate rounded-md type-supporting focus-ring ring-accent-focus',
        '',
        variantToLabelClassNames[processedVariant],
        className,
    );

    const innerTextClassName = classNames('truncate', textClassName);

    const linkRel = target === '_blank' ? `noopener noreferrer ${rel ?? ''}` : rel;

    return (
        <LinkBase
            aria-disabled={disabled}
            className={linkClassName}
            href={disabled ? undefined : processedHref}
            onClick={disabled ? undefined : onClick}
            ref={ref}
            rel={linkRel}
            tabIndex={disabled ? -1 : undefined}
            target={target}
            {...otherProps}
        >
            <div className="flex items-center gap-x-tight--4-6">
                <span className={innerTextClassName}>{children}</span>
                {isExternal && <Icon icon={IconType.LINK_EXTERNAL} size="sm" />}
            </div>
            {showUrl && processedHref && (
                <p
                    className={classNames(
                        'truncate type-caption--framework-leading',
                        disabled ? 'text-surface-disabled' : 'text-surface-tertiary',
                    )}
                >
                    {processedHref}
                </p>
            )}
        </LinkBase>
    );
});

Link.displayName = 'Link';
