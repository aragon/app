import type { Metadata } from 'next';

export class MetadataUtils {
    protected readonly authors = [{ name: 'Aragon', url: 'https://app.aragon.org' }];

    protected buildMetadata(
        title: string,
        description: string,
        image?: string,
        type: 'website' | 'article' = 'website',
    ): Metadata {
        const imageArray = image ? [image] : undefined;
        return {
            authors: this.authors,
            title,
            description,
            openGraph: { title, description, type, images: imageArray },
            twitter: { card: 'summary', site: '@AragonProject', title, description, images: imageArray },
        };
    }
}
