import { metadataUtils } from './metadataUtils';

describe('metadata utils', () => {
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

    afterEach(() => {
        if (originalAppUrl == null) {
            delete process.env.NEXT_PUBLIC_APP_URL;
        } else {
            process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
        }
    });

    const loadMetadataUtils = (appUrl?: string) => {
        if (appUrl == null) {
            delete process.env.NEXT_PUBLIC_APP_URL;
        } else {
            process.env.NEXT_PUBLIC_APP_URL = appUrl;
        }

        let loaded: typeof metadataUtils | undefined;
        jest.isolateModules(() => {
            loaded =
                jest.requireActual<typeof import('./metadataUtils')>(
                    './metadataUtils',
                ).metadataUtils;
        });

        return loaded!;
    };

    it('resolves relative default metadata urls against the canonical app origin', () => {
        const result = loadMetadataUtils().getDefaultMetadata();

        expect(result.metadataBase).toEqual(new URL('https://app.aragon.org'));
        expect(result.openGraph?.url).toBe('https://app.aragon.org');
    });

    it('follows the app url of the environment', () => {
        const result = loadMetadataUtils(
            'https://new.app.aragon.org',
        ).getDefaultMetadata();

        expect(result.metadataBase).toEqual(
            new URL('https://new.app.aragon.org'),
        );
        expect(result.openGraph?.url).toBe('https://new.app.aragon.org');
        expect(result.authors).toEqual([
            { name: 'Aragon', url: 'https://new.app.aragon.org' },
        ]);
    });

    it('builds metadata with expected structure', () => {
        const title = 'title';
        const description = 'description';
        const image = 'https://image.png';
        const type = 'article';

        const result = metadataUtils.buildMetadata({
            title,
            description,
            image,
            type,
        });

        expect(result).toEqual({
            title,
            description,
            openGraph: {
                title,
                description,
                siteName: 'Aragon',
                images: [image],
                type,
            },
            twitter: {
                card: 'summary',
                site: '@aragonproject',
                title,
                description,
                images: [image],
            },
        });
    });
});
