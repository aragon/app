import Link from 'fumadocs-core/link';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <DocsPage breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
            <DocsTitle className="border-b border-neutral-200 pb-3 text-2xl leading-tight font-normal text-neutral-800 md:text-3xl">
                Page not found
            </DocsTitle>
            <DocsBody>
                <p>
                    This page does not exist or is not published.{' '}
                    <Link href="/">Start from the overview</Link>.
                </p>
            </DocsBody>
        </DocsPage>
    );
}
