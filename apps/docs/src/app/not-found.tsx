import Link from 'fumadocs-core/link';
import {
    DocsBody,
    DocsPage,
    DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <DocsPage>
            <DocsTitle>Page not found</DocsTitle>
            <DocsBody>
                <p>
                    This page does not exist or is not published.{' '}
                    <Link href="/">Start from the overview</Link>.
                </p>
            </DocsBody>
        </DocsPage>
    );
}
