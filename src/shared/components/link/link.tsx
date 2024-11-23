import { useBlockNavigationContext } from '@/shared/components/blockNavigationContext';
import { useTranslations } from '@/shared/components/translationsProvider';
import NextLink from 'next/link';
import { type ComponentProps } from 'react';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, rel = '', target, onClick, ...otherProps } = props;

    const { isBlocked } = useBlockNavigationContext();
    const { t } = useTranslations();

    const processedRel = target === '_blank' ? `noopener noreferrer ${rel}` : rel;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (isBlocked && !target && !window.confirm(t('app.shared.confirmWizardExit.message'))) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }
    };

    return <NextLink href={href} rel={processedRel} target={target} onClick={handleClick} {...otherProps} />;
};
