import { featureFlags } from '@/shared/featureFlags';
import { robotsUtils } from './robotsUtils';

describe('robots utils', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    afterEach(() => {
        isEnabledSpy.mockReset();
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
});
