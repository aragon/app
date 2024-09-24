import { useIsBlocked } from '@/shared/components/navigationBlockerProvider/navigationBlockerProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type Route } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, startTransition } from 'react';

export interface ILinkProps extends ComponentProps<'a'> {}

export const Link: React.FC<ILinkProps> = (props) => {
    const { href = {}, rel = '', target, ...otherProps } = props;
    const router = useRouter();
    const isBlocked = useIsBlocked();
    const { t } = useTranslations();

    const processedRel = target === '_blank' ? `noopener noreferrer ${rel}` : rel;

    return (
        <NextLink
            onClick={(e) => {
                e.preventDefault();

                if (
                    isBlocked &&
                    !target &&
                    !window.confirm(t('app.governance.createProposalPage.exitAlertDescription'))
                ) {
                    return;
                }

                startTransition(() => {
                    const url = href.toString();

                    if (target === '_blank') {
                        window.open(url, '_blank');
                    } else {
                        router.push(url as Route);
                    }
                });
            }}
            href={href}
            rel={processedRel}
            target={target}
            {...otherProps}
        />
    );
};
