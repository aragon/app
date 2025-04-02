import type { Metadata } from 'next';

export interface IBuildMetadataParams {
    /**
     * Title of the page.
     */
    title: string;
    /**
     * Description of the page.
     */
    description: string;
    /**
     * Optional image of the page.
     */
    image?: string;
    /**
     * Type of the page.
     * @default website
     */
    type?: 'website' | 'article';
}

class MetadataUtils {
    public baseUrl = 'https://app.aragon.org';

    private defaultTitle = 'Governed on Aragon';
    private defaultDescription =
        'Explore the organizations using our modular governance stack to secure their onchain governance.';
    private defaultImage = '/og-share-large.png';

    private authors = [{ name: 'Aragon', url: this.baseUrl }];

    getDefaultMetadata = (): Metadata => ({
        title: this.defaultTitle,
        description: this.defaultDescription,
        authors: [{ name: 'Aragon', url: this.baseUrl }],
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: this.baseUrl,
            title: this.defaultTitle,
            description: this.defaultDescription,
            siteName: 'Aragon',
            images: [{ url: this.defaultImage, width: 1200, height: 630, alt: 'Aragon Logo' }],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@AragonProject',
            title: this.defaultTitle,
            description: this.defaultDescription,
            images: [this.defaultImage],
        },
    });

    buildMetadata = (params: IBuildMetadataParams): Metadata => {
        const { title, description, image, type = 'website' } = params;
        const imageArray = image ? [image] : undefined;

        return {
            authors: this.authors,
            title,
            description,
            openGraph: { title, description, type, images: imageArray },
            twitter: { card: 'summary', site: '@AragonProject', title, description, images: imageArray },
        };
    };
}

export const metadataUtils = new MetadataUtils();
