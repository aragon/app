import { Callout } from 'fumadocs-ui/components/callout';
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftNotice, toCanonicalUrl } from '../../lib/site';
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

    return (
        <DocsPage full={page.data.full} toc={page.data.toc}>
            <DocsTitle>{page.data.title}</DocsTitle>
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
