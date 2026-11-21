'use client';

import { Tag } from '@aragon/gov-ui-kit';
import {
    basePath,
    developerDocsUrl,
    privacyPolicyUrl,
    termsOfServiceUrl,
} from '../lib/site';
import { useAppOrigin } from '../lib/useAppOrigin';
import { AragonLogo } from './aragonLogo';

const restLinks = [
    { text: 'Developers', url: developerDocsUrl },
    { text: 'Privacy', url: privacyPolicyUrl },
    { text: 'Terms of Service', url: termsOfServiceUrl },
];

const linkClassName =
    'truncate border-surface-secondary border-b py-4 text-base text-link-secondary-default leading-tight transition-colors last:border-none hover:text-link-secondary-hover-nav md:border-none md:py-0';

/**
 * The footer of the app (apps/app/src/modules/application/components/footer), below the whole
 * docs layout: "Governed on Aragon" with the site's path where the app shows its version, the links
 * to the rest of Aragon, the copyright.
 */
export const SiteFooter = ({ year }: { year: number }) => {
    const appOrigin = useAppOrigin();
    const links = [{ text: 'Aragon App', url: `${appOrigin}/` }, ...restLinks];

    return (
        <footer className="border-t border-surface-secondary bg-surface-primary py-5">
            <div className="mx-auto grid max-w-[1550px] items-center px-4 [grid-template-areas:'metadata''links''copyright'] md:justify-items-center md:gap-6 md:[grid-template-areas:'links''metadata''copyright'] lg:grid-cols-[1fr_min-content_1fr] lg:[grid-template-areas:'metadata_links_copyright']">
                <div className="flex flex-row items-center justify-between gap-4 pt-3 pb-4 [grid-area:metadata] md:justify-normal md:py-0 lg:justify-self-start">
                    <div className="flex items-center gap-2.5">
                        <p className="text-sm leading-tight text-nowrap text-surface-primary md:text-base">
                            Governed on
                        </p>
                        <AragonLogo className="h-[22px] w-auto icon-brand-primary" />
                    </div>
                    <Tag
                        className="shrink-0"
                        label={basePath}
                        variant="primary"
                    />
                </div>
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-6">
                    {links.map((link) => (
                        <a
                            className={linkClassName}
                            href={link.url}
                            key={link.url}
                        >
                            {link.text}
                        </a>
                    ))}
                </div>
                <p className="truncate pt-6 pb-3 text-base leading-tight text-surface-secondary [grid-area:copyright] md:py-0 lg:justify-self-end">
                    © {year} Aragon
                </p>
            </div>
        </footer>
    );
};
