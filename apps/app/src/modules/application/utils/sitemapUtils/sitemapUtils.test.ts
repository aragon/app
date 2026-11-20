jest.mock('@/modules/explore/api/daoExplorerService', () => ({
    daoExplorerService: {
        getDaoList: jest.fn().mockResolvedValue({ data: [] }),
    },
}));

describe('sitemap utils', () => {
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

    afterEach(() => {
        if (originalAppUrl == null) {
            delete process.env.NEXT_PUBLIC_APP_URL;
        } else {
            process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
        }
    });

    const generateSitemap = (appUrl?: string) => {
        if (appUrl == null) {
            delete process.env.NEXT_PUBLIC_APP_URL;
        } else {
            process.env.NEXT_PUBLIC_APP_URL = appUrl;
        }

        let sitemapUtils:
            | typeof import('./sitemapUtils').sitemapUtils
            | undefined;
        jest.isolateModules(() => {
            sitemapUtils =
                jest.requireActual<typeof import('./sitemapUtils')>(
                    './sitemapUtils',
                ).sitemapUtils;
        });

        return sitemapUtils!.generateSitemap();
    };

    it('prefixes the entries with the app url of the environment', async () => {
        const sitemap = await generateSitemap('https://new.app.aragon.org');

        expect(sitemap.map((entry) => entry.url)).toEqual([
            'https://new.app.aragon.org/',
            'https://new.app.aragon.org/create',
        ]);
    });

    it('falls back to the production origin when no app url is set', async () => {
        const sitemap = await generateSitemap();

        expect(sitemap.map((entry) => entry.url)).toEqual([
            'https://app.aragon.org/',
            'https://app.aragon.org/create',
        ]);
    });
});
