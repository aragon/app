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
     * Open Graph site name.
     * @default Aragon
     */
    siteName?: string;
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
    private defaultSiteName = 'Aragon';

    private authors = [{ name: this.defaultSiteName, url: this.baseUrl }];

    getDefaultMetadata = (): Metadata => ({
        title: this.defaultTitle,
        description: this.defaultDescription,
        authors: this.authors,
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: this.baseUrl,
            title: this.defaultTitle,
            description: this.defaultDescription,
            siteName: this.defaultSiteName,
            images: [{ url: this.defaultImage, width: 1200, height: 630, alt: 'Aragon Logo' }],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@aragonproject',
            title: this.defaultTitle,
            description: this.defaultDescription,
            images: [this.defaultImage],
        },
    });

    buildMetadata = (params: IBuildMetadataParams): Metadata => {
        const { title, description, siteName = this.defaultSiteName, image, type = 'website' } = params;
        const imageArray = image ? [image] : undefined;

        return {
            title,
            description,
            openGraph: { title, description, siteName, type, images: imageArray },
            twitter: { card: 'summary', site: '@aragonproject', title, description, images: imageArray },
        };
    };
}

export const metadataUtils = new MetadataUtils();
