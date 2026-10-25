import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Roboto_Mono } from 'next/font/google';
import type { CSSProperties, ReactNode } from 'react';
import { KitProvider } from '../components/kit';
import { SiteFooter } from '../components/siteFooter';
import { SiteHeader } from '../components/siteHeader';
import { basePath, siteDescription, siteTitle } from '../lib/site';
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

// The height of the site header (py-5 around the 40px button), which the docs layout offsets its
// sticky sidebar and table of contents by.
const bannerHeight = { '--fd-banner-height': '80px' } as CSSProperties;

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html className={robotoMono.variable} lang="en" style={bannerHeight}>
            <body className="flex min-h-screen flex-col">
                {/* Light only, like the gov-ui-kit: no theme switch, no stored preference. */}
                <RootProvider search={search} theme={{ enabled: false }}>
                    <KitProvider>
                        <SiteHeader />
                        <DocsLayout
                            containerProps={{ className: 'flex-1' }}
                            sidebar={{ collapsible: false }}
                            themeSwitch={{ enabled: false }}
                            tree={source.getPageTree()}
                        >
                            {children}
                        </DocsLayout>
                        <SiteFooter year={new Date().getFullYear()} />
                    </KitProvider>
                </RootProvider>
            </body>
        </html>
    );
}
