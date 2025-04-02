import { metadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    it('builds metadata with expected structure', () => {
        const title = 'title';
        const description = 'description';
        const image = 'https://image.png';
        const type = 'article';
        const result = metadataUtils.buildMetadata({ title, description, image, type });

        expect(result).toEqual({
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title,
            description,
            openGraph: { title, description, images: [image], type },
            twitter: { card: 'summary', site: '@AragonProject', title, description, images: [image] },
        });
    });
});
