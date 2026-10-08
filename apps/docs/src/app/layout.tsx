import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { AragonLogo } from '../components/aragonLogo';
import {
    appUrl,
    basePath,
    developerDocsUrl,
    siteDescription,
    siteTitle,
    websiteUrl,
} from '../lib/site';
import { source } from '../lib/source';
import './globals.css';

// The code font of docs.aragon.org; the text font (Manrope) comes with the gov-ui-kit tokens
// (globals.css).
const robotoMono = Roboto_Mono({
    subsets: ['latin'],
    variable: '--font-roboto-mono',
});

export const metadata: Metadata = {
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    description: siteDescription,
};

// Search runs in the browser against the index `next build` exports at /api/search (static
// export, no search service); the client needs the base path the page is served under.
const search = {
    options: { type: 'static' as const, api: `${basePath}/api/search` },
};

// The header links of docs.aragon.org, in the header and in the mobile menu: the app these pages
// describe (same tab, it is the same product; the site has none of the app's navigation), the
// developer documentation and the website.
const links = [
    {
        type: 'main' as const,
        text: 'Aragon App',
        url: appUrl,
        external: false,
        active: 'none' as const,
    },
    {
        type: 'main' as const,
        text: 'Developers',
        url: developerDocsUrl,
        external: true,
        active: 'none' as const,
    },
    {
        type: 'main' as const,
        text: 'Website',
        url: websiteUrl,
        external: true,
        active: 'none' as const,
    },
];

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html className={robotoMono.variable} lang="en">
            <body className="flex min-h-screen flex-col">
                {/* Light only, like the gov-ui-kit: no theme switch, no stored preference. */}
                <RootProvider search={search} theme={{ enabled: false }}>
                    <DocsLayout
                        links={links}
                        nav={{ title: <AragonLogo />, mode: 'top' }}
                        themeSwitch={{ enabled: false }}
                        tree={source.getPageTree()}
                    >
                        {children}
                    </DocsLayout>
                </RootProvider>
            </body>
        </html>
    );
}
