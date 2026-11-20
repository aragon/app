import { findNeighbour } from 'fumadocs-core/page-tree';
import { Callout } from 'fumadocs-ui/components/callout';
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
    MarkdownCopyButton,
    PageLastUpdate,
    ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PagePager } from '../../components/pagePager';
import { draftNotice, toCanonicalUrl, toMarkdownRoute } from '../../lib/site';
import { source } from '../../lib/source';

interface IPageProps {
    params: Promise<{ slug?: string[] }>;
}

// The page actions as small tertiary buttons of the gov-ui-kit.
const pageActionClassName =
    'h-8 gap-1 rounded-lg border border-surface-default bg-surface-default px-2 font-normal text-surface-default text-sm shadow-surface-sm hover:border-surface-hover hover:bg-surface-hover hover:text-surface-hover hover:shadow-surface-default [&_svg]:size-4 [&_svg]:icon-surface-default';

export default async function Page({ params }: IPageProps) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (page == null) {
        notFound();
    }

    const Body = page.data.body;
    const markdownPath = toMarkdownRoute(page.url);
    const { previous, next } = findNeighbour(source.getPageTree(), page.url);

    return (
        <DocsPage
            footer={{ enabled: false }}
            full={page.data.full}
            toc={page.data.toc}
        >
            <DocsTitle className="border-b border-surface-secondary-panel pb-3 text-2xl leading-tight font-normal text-surface-primary md:text-3xl">
                {page.data.title}
            </DocsTitle>
            {/* The markdown copy of the page, which the build publishes next to it: copy it, or open
                it in an assistant. The actions add the base path themselves. */}
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
                    <Callout
                        className="draft-callout"
                        title="Draft"
                        type="warn"
                    >
                        {draftNotice}
                    </Callout>
                )}
                <Body components={defaultMdxComponents} />
            </DocsBody>
            {/* The date of the page's last change in the knowledge base (prepareContent.ts). */}
            {page.data.lastModified != null && (
                <PageLastUpdate
                    className="text-surface-secondary"
                    date={new Date(page.data.lastModified)}
                />
            )}
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
