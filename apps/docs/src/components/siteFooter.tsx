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
    'truncate border-b transition-colors last:border-none max-md:py-inset-nav-item--fixed-16 md:border-none type-control border-surface-secondary text-link-secondary-default hover:text-link-secondary-hover-nav';

/**
 * The footer of the app (apps/app/src/modules/application/components/footer), below the whole
 * docs layout: "Governed on Aragon" with the site's path where the app shows its version, the links
 * to the rest of Aragon, the copyright.
 */
export const SiteFooter = ({ year }: { year: number }) => {
    const appOrigin = useAppOrigin();
    const links = [{ text: 'Aragon App', url: `${appOrigin}/` }, ...restLinks];

    return (
        <footer className="border-t border-surface-secondary bg-surface-primary py-inset-nav-bar--fixed-20">
            <div className="mx-auto grid max-w-[1550px] items-center px-inset-nav-bar--fixed-16 [grid-template-areas:'metadata''links''copyright'] md:justify-items-center md:gap-nav-section md:[grid-template-areas:'links''metadata''copyright'] lg:grid-cols-[1fr_min-content_1fr] lg:[grid-template-areas:'metadata_links_copyright']">
                <div className="flex flex-row items-center justify-between gap-nav-group [grid-area:metadata] max-md:pt-inset-nav-item max-md:pb-inset-nav-item--fixed-16 md:justify-normal lg:justify-self-start">
                    <div className="flex items-center gap-nav-related--fixed-10">
                        <p className="type-supporting text-nowrap text-surface-primary">
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
                <div className="flex min-w-0 flex-col content-center [grid-area:links] md:flex-row md:gap-nav-section">
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
                <p className="truncate type-caption--footnote text-surface-secondary [grid-area:copyright] max-md:pt-inset-nav-item--fixed-24 max-md:pb-inset-nav-item lg:justify-self-end">
                    © {year} Aragon
                </p>
            </div>
        </footer>
    );
};
