import { Callout } from 'fumadocs-ui/components/callout';
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
    MarkdownCopyButton,
    ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '../../components/siteFooter';
import { draftNotice, toCanonicalUrl, toMarkdownPath } from '../../lib/site';
import { source } from '../../lib/source';

interface IPageProps {
    params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: IPageProps) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (page == null) {
        notFound();
    }

    const Body = page.data.body;
    const markdownPath = toMarkdownPath(page.url);

    return (
        <DocsPage
            footer={{ children: <SiteFooter /> }}
            full={page.data.full}
            toc={page.data.toc}
        >
            <DocsTitle className="border-neutral-200 border-b pb-3 font-normal text-3xl leading-tight">
                {page.data.title}
            </DocsTitle>
            {/* The markdown copy of the page, which the build publishes next to it: copy it, or open
                it in an assistant. */}
            <div className="flex flex-row items-center gap-2">
                <MarkdownCopyButton markdownUrl={markdownPath} />
                <ViewOptionsPopover
                    markdownUrl={markdownPath}
                    pageUrl={toCanonicalUrl(page.url)}
                />
            </div>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                {page.data.draft && (
                    <Callout title="Draft" type="warn">
                        {draftNotice}
                    </Callout>
                )}
                <Body components={defaultMdxComponents} />
            </DocsBody>
        </DocsPage>
    );
}

export const generateStaticParams = () => source.generateParams();

export const generateMetadata = async ({
    params,
}: IPageProps): Promise<Metadata> => {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (page == null) {
        notFound();
    }

    return {
        // The home page is named after the site; the template would repeat it.
        title:
            page.url === '/' ? { absolute: page.data.title } : page.data.title,
        description: page.data.description,
        alternates: { canonical: toCanonicalUrl(page.url) },
    };
};
