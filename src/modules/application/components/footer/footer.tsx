'use client';

import { Container } from '@/shared/components/container';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { ApplicationTags } from '../applicationTags';
import { AragonLogo } from '../aragonLogo';
import { footerLinks } from './footerLinks';

export interface IFooterProps extends ComponentProps<'footer'> {}

export const Footer: React.FC<IFooterProps> = (props) => {
    const { className, ...otherProps } = props;

    const { t } = useTranslations();

    const year = new Date().getFullYear();

    const layoutClassNames = [
        "[grid-template-areas:'metadata''links''copyright']", // Default
        "md:[grid-template-areas:'links''metadata''copyright'] md:justify-items-center", // MD
        "lg:grid-cols-[1fr_min-content_1fr] lg:[grid-template-areas:'metadata_links_copyright']", // LG
    ];

    return (
        <footer className={classNames('border-t border-neutral-100 bg-neutral-0 py-5', className)} {...otherProps}>
            <Container className={classNames('grid items-center md:gap-6', layoutClassNames)}>
                <div className="flex flex-row items-center justify-between gap-4 pb-4 pt-3 [grid-area:metadata] md:justify-normal md:py-0 lg:justify-self-start">
                    <div className="flex items-center gap-2.5">
                        <p className="leading-tight text-neutral-800">{t('app.application.footer.governed')}</p>
                        <AragonLogo className="h-6 text-primary-400" />
                    </div>
                    <ApplicationTags variant="primary" />
                </div>
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-6">
                    {footerLinks.map(({ link, label, target }) => (
                        <Link
                            className="truncate border-b border-neutral-100 py-4 text-base font-normal leading-tight text-neutral-500 last:border-none md:border-none md:py-0"
                            key={label}
                            href={link}
                            target={target}
                        >
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    ))}
                </div>
                <p className="truncate pb-3 pt-6 text-base font-normal leading-tight text-neutral-500 [grid-area:copyright] md:py-0 lg:justify-self-end">
                    {t('app.application.footer.copyright', { year })}
                </p>
            </Container>
        </footer>
    );
};
