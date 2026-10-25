import { findNeighbour } from 'fumadocs-core/page-tree';
import { Callout } from 'fumadocs-ui/components/callout';
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
    MarkdownCopyButton,
    ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PagePager } from '../../components/pagePager';
import { draftNotice, toCanonicalUrl, toMarkdownPath } from '../../lib/site';
import { source } from '../../lib/source';

interface IPageProps {
    params: Promise<{ slug?: string[] }>;
}

// The page actions as small tertiary buttons of the gov-ui-kit.
const pageActionClassName =
    'h-8 gap-1 rounded-lg border border-neutral-100 bg-neutral-0 px-2 font-normal text-neutral-500 text-sm shadow-neutral-sm hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-500 hover:shadow-neutral [&_svg]:size-4 [&_svg]:text-neutral-300';

export default async function Page({ params }: IPageProps) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (page == null) {
        notFound();
    }

    const Body = page.data.body;
    const markdownPath = toMarkdownPath(page.url);
    const { previous, next } = findNeighbour(source.getPageTree(), page.url);

    return (
        <DocsPage
            footer={{ enabled: false }}
            full={page.data.full}
            toc={page.data.toc}
        >
            <DocsTitle className="border-neutral-200 border-b pb-3 font-normal text-2xl text-neutral-800 leading-tight md:text-3xl">
                {page.data.title}
            </DocsTitle>
            {/* The markdown copy of the page, which the build publishes next to it: copy it, or open
                it in an assistant. */}
            <div className="flex flex-row items-center gap-2">
                <MarkdownCopyButton
                    className={pageActionClassName}
                    markdownUrl={markdownPath}
                />
                <ViewOptionsPopover
                    className={pageActionClassName}
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
            <PagePager
                next={next && { name: next.name, url: next.url }}
                previous={
                    previous && { name: previous.name, url: previous.url }
                }
            />
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
