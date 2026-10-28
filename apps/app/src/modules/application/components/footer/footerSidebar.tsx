'use client';

import { Fragment } from 'react';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { footerLinks, type IFooterLink } from './footerLinks';

// The side navigation has no room for the full link set: Explore is one click away through the
// DAO or workspace selector, and the short Terms label keeps the row on one line.
const sidebarLinks = footerLinks
    .filter(({ label }) => label !== 'explore')
    .map(
        (link): IFooterLink =>
            link.label === 'termsOfService'
                ? { ...link, label: 'terms' }
                : link,
    );

/**
 * Footer content of the side navigation, replacing the page footer while the sidebar is shown.
 */
export const FooterSidebar: React.FC = () => {
    const { t } = useTranslations();
    const version = useApplicationVersion();

    const year = new Date().getFullYear();

    return (
        <div className="flex flex-col gap-2 border-neutral-100 border-t px-1 pt-4 text-neutral-500 text-sm leading-tight">
            <div className="flex items-center gap-2">
                <p className="text-nowrap">
                    {t('app.application.footer.governed')}
                </p>
                <AragonLogo size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-x-1.5">
                {sidebarLinks.map(({ link, label, target }, index) => (
                    <Fragment key={label}>
                        {index > 0 && <span aria-hidden={true}>·</span>}
                        <Link
                            className="font-normal text-neutral-500 text-sm hover:text-neutral-800"
                            href={link}
                            target={target}
                        >
                            {t(`app.application.footer.link.${label}`)}
                        </Link>
                    </Fragment>
                ))}
            </div>
            <p className="truncate">
                {t('app.application.footer.copyright', { year })} · {version}
            </p>
        </div>
    );
};
