import type { Metadata } from 'next';
import { MetadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    // Test-only subclass with super since methods are protected
    class TestMetadataUtils extends MetadataUtils {
        public buildMetadata = super.buildMetadata;
    }

    it('builds metadata with expected structure', () => {
        const utils = new TestMetadataUtils();
        const spy = jest.spyOn(utils, 'buildMetadata');

        const result = utils.buildMetadata('Title', 'Desc', 'https://img.png', 'article');

        expect(spy).toHaveBeenCalledWith('Title', 'Desc', 'https://img.png', 'article');
        expect(result).toMatchObject<Partial<Metadata>>({
            authors: [{ name: 'Aragon', url: 'https://app.aragon.org' }],
            title: 'Title',
            description: 'Desc',
            openGraph: {
                title: 'Title',
                description: 'Desc',
                images: ['https://img.png'],
                type: 'article',
            },
        });
    });
});
