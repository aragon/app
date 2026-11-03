'use client';

import { Button, Icon, IconType } from '@aragon/gov-ui-kit';
import Link from 'fumadocs-core/link';
import { appUrl, developerDocsUrl, websiteUrl } from '../lib/site';
import { AragonLogo } from './aragonLogo';

const links = [
    { text: 'Developers', url: developerDocsUrl },
    { text: 'Website', url: websiteUrl },
];

/**
 * The header of the site, the blue navigation bar of the app: the Aragon wordmark with the site
 * name, the developer documentation and the website, and the way back into the app. It sits above
 * the docs layout, which reads its height from `--fd-banner-height` (src/app/layout.tsx) so the
 * sidebar and the table of contents stick below it.
 */
export const SiteHeader = () => (
    <header className="sticky top-0 z-40 h-(--fd-banner-height) bg-primary-400">
        <div className="mx-auto flex h-full max-w-[1550px] items-center justify-between gap-4 px-4">
            <Link
                aria-label="Aragon Help"
                className="flex items-center gap-2 text-neutral-0"
                href="/"
            >
                <AragonLogo className="h-[30px] w-auto" />
                <span className="relative -top-[1.5px] font-semibold text-base leading-normal">
                    Help
                </span>
            </Link>
            <nav className="flex items-center gap-8">
                {links.map((link) => (
                    <a
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-base text-primary-50 leading-tight transition-colors hover:text-neutral-0 max-md:hidden"
                        href={link.url}
                        key={link.url}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        {link.text}
                        <Icon icon={IconType.LINK_EXTERNAL} size="sm" />
                    </a>
                ))}
                <Button href={appUrl} size="md" variant="secondary">
                    Launch app
                </Button>
            </nav>
        </div>
    </header>
);
