import Link from 'fumadocs-core/link';
import {
    DocsBody,
    DocsPage,
    DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import type { Metadata } from 'next';
import { SiteFooter } from '../components/siteFooter';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
    return (
        <DocsPage footer={{ children: <SiteFooter /> }}>
            <DocsTitle className="border-neutral-200 border-b pb-3 font-normal text-3xl leading-tight">
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
