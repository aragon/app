import { metadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    it('builds metadata with expected structure', () => {
        const title = 'title';
        const description = 'description';
        const image = 'https://image.png';
        const type = 'article';

        const result = metadataUtils.buildMetadata({ title, description, image, type });

        expect(result).toEqual({
            title,
            description,
            openGraph: { title, description, siteName: 'Aragon', images: [image], type },
            twitter: { card: 'summary', site: '@aragonproject', title, description, images: [image] },
        });
    });
});
