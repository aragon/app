import classNames from 'classnames';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const {
        href = {},
        rel = '',
        target,
        onClick,
        className,
        ...otherProps
    } = props;

    const { isBlocked } = useBlockNavigationContext();
    const { t } = useTranslations();

    const processedRel =
        target === '_blank' ? `noopener noreferrer ${rel}` : rel;

    // Run the "are you sure?" guard in capture phase to ensure Next.js doesn't start a navigation
    // (and thus top-loader) before we can cancel it.
    const handleClickCapture = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (
            isBlocked &&
            !target &&
            !window.confirm(t('app.shared.confirmWizardExit.message'))
        ) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
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
            onClickCapture={handleClickCapture}
            rel={processedRel}
            target={target}
            {...otherProps}
        />
    );
};
