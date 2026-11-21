import { featureFlags } from '@/shared/featureFlags';
import { robotsUtils } from './robotsUtils';

describe('robots utils', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const originalEnv = process.env.NEXT_PUBLIC_ENV;

    beforeEach(() => {
        process.env.NEXT_PUBLIC_ENV = 'production';
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        process.env.NEXT_PUBLIC_ENV = originalEnv;
    });

    it('allows every path and lists the app sitemap', async () => {
        isEnabledSpy.mockResolvedValue(false);

        const robots = await robotsUtils.generateRobots();

        expect(robots.rules).toEqual({ userAgent: '*', allow: '/' });
        expect(robots.sitemap).toEqual(['https://app.aragon.org/sitemap.xml']);
    });

    it('lists the help center sitemap as well while the helpCenter flag serves the site', async () => {
        isEnabledSpy.mockResolvedValue(true);

        const robots = await robotsUtils.generateRobots();

        expect(isEnabledSpy).toHaveBeenCalledWith('helpCenter');
        expect(robots.sitemap).toEqual([
            'https://app.aragon.org/sitemap.xml',
            'https://app.aragon.org/help/sitemap.xml',
        ]);
    });

    it.each(['occ', 'staging', 'development', 'preview', 'local'])(
        'disallows every path and lists no sitemap in the %s environment',
        async (env) => {
            process.env.NEXT_PUBLIC_ENV = env;
            isEnabledSpy.mockResolvedValue(true);

            const robots = await robotsUtils.generateRobots();

            expect(robots).toEqual({
                rules: { userAgent: '*', disallow: '/' },
            });
        },
    );
});
