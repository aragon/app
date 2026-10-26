import Link from 'fumadocs-core/link';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <DocsPage breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
            <DocsTitle className="border-neutral-200 border-b pb-3 font-normal text-2xl text-neutral-800 leading-tight md:text-3xl">
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
