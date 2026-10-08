import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { basePath, siteDescription, siteTitle } from '../lib/site';
import { source } from '../lib/source';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: { default: siteTitle, template: `%s | ${siteTitle}` },
    description: siteDescription,
};

// Search runs in the browser against the index `next build` exports at /api/search (static
// export, no search service); the client needs the base path the page is served under.
const search = {
    options: { type: 'static' as const, api: `${basePath}/api/search` },
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html
            className={inter.variable}
            lang="en"
            suppressHydrationWarning={true}
        >
            <body className="flex min-h-screen flex-col">
                <RootProvider search={search}>
                    <DocsLayout
                        nav={{ title: siteTitle, mode: 'top' }}
                        tree={source.getPageTree()}
                    >
                        {children}
                    </DocsLayout>
                </RootProvider>
            </body>
        </html>
    );
}
