'use client';

import { Tag } from '@aragon/gov-ui-kit';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { AragonLogo } from '@/shared/components/aragonLogo';
import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { footerLinks } from './footerLinks';

// Explore is reached through "Governed on Aragon".
const sidebarLinks = footerLinks.filter(({ label }) => label !== 'explore');

/**
 * Footer content of the side navigation, replacing the page footer while the sidebar is shown.
 */
export const FooterSidebar: React.FC = () => {
    const { t } = useTranslations();
    const version = useApplicationVersion();
    const isWalletConnected = useWalletConnected();

    const year = new Date().getFullYear();

    return (
        <div className="flex flex-col gap-2 border-t border-neutral-100 px-1 pt-4 text-neutral-500">
            <Link
                className="flex items-center gap-2 self-start type-control-sm--framework-leading text-neutral-500 hover:text-neutral-800"
                href={isWalletConnected ? '/explore' : '/'}
            >
                <span className="text-nowrap">
                    {t('app.application.footer.governed')}
                </span>
                <AragonLogo size="sm" />
            </Link>
            <div className="flex flex-wrap items-center gap-x-2">
                {sidebarLinks.map(({ link, label, target }) => (
                    <Link
                        className="type-control-sm--framework-leading text-neutral-500 hover:text-neutral-800"
                        href={link}
                        key={label}
                        target={target}
                    >
                        {t(`app.application.footer.link.${label}`)}
                    </Link>
                ))}
            </div>
            <div className="flex min-w-0 items-center gap-2">
                <p className="truncate type-caption--unstepped">
                    {t('app.application.footer.copyright', { year })}
                </p>
                <Tag className="shrink-0" label={version} variant="primary" />
            </div>
        </div>
    );
};
