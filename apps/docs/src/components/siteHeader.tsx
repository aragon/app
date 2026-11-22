'use client';

import { Button, GukCoreProvider, Icon, IconType } from '@aragon/gov-ui-kit';
import Link from 'fumadocs-core/link';
import { developerDocsUrl, websiteUrl } from '../lib/site';
import { useAppOrigin } from '../lib/useAppOrigin';
import { AragonLogo } from './aragonLogo';

const links = [
    { text: 'Developers', url: developerDocsUrl },
    { text: 'Website', url: websiteUrl },
];

// The kit's links go through the Next link, which prefixes the base path; the app link is a plain
// anchor to the root of the app (useAppOrigin).
const plainLinkValues = { Link: 'a' } as const;

/**
 * The header of the site, the blue navigation bar of the app: the Aragon wordmark with the site
 * name, the developer documentation and the website, and the way back into the app. It sits above
 * the docs layout, which reads its height from `--fd-banner-height` (src/app/layout.tsx) so the
 * sidebar and the table of contents stick below it.
 */
export const SiteHeader = () => {
    const appOrigin = useAppOrigin();

    return (
        <header className="sticky top-0 z-40 h-(--fd-banner-height) bg-brand-solid">
            <div className="mx-auto flex h-full max-w-[1550px] items-center justify-between gap-nav-group px-inset-nav-bar--fixed-16">
                <Link
                    aria-label="Aragon Help"
                    className="flex items-center gap-nav-related text-accent-inverse"
                    href="/"
                >
                    <AragonLogo className="h-[30px] w-auto" />
                    <span className="relative -top-[1.5px] text-base leading-normal font-semibold">
                        Help
                    </span>
                </Link>
                <nav className="flex items-center gap-nav-section--fixed-32">
                    {links.map((link) => (
                        <a
                            className="inline-flex items-center gap-nav-tight--fixed-6 text-base leading-tight whitespace-nowrap text-accent-inverse-brand transition-colors hover:text-accent-inverse max-md:hidden"
                            href={link.url}
                            key={link.url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {link.text}
                            <Icon icon={IconType.LINK_EXTERNAL} size="sm" />
                        </a>
                    ))}
                    <GukCoreProvider values={plainLinkValues}>
                        <Button
                            href={`${appOrigin}/`}
                            size="md"
                            variant="secondary"
                        >
                            Launch app
                        </Button>
                    </GukCoreProvider>
                </nav>
            </div>
        </header>
    );
};
