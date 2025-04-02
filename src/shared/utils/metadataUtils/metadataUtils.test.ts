import type { Metadata } from 'next';
import { MetadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    it('builds metadata with expected structure', () => {
        // Test-only subclass with super since methods are protected
        class TestMetadataUtils extends MetadataUtils {
            public buildMetadata = super.buildMetadata;
        }

        const utils = new TestMetadataUtils();
        const spy = jest.spyOn(utils, 'buildMetadata');

        const result = utils.buildMetadata('Title', 'Desc', 'https://img.png', 'article');

        expect(spy).toHaveBeenCalledWith('Title', 'Desc', 'https://img.png', 'article');
        expect(result).toMatchObject<Partial<Metadata>>({
            title: 'Title',
            description: 'Desc',
            openGraph: expect.objectContaining({
                title: 'Title',
                description: 'Desc',
                images: ['https://img.png'],
            }) as Metadata['openGraph'],
        });
    });
});
