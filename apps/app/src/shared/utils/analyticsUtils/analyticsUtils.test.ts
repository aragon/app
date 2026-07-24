import { init, track } from '@plausible-analytics/tracker';
import { analyticsUtils } from './analyticsUtils';

jest.mock('@plausible-analytics/tracker', () => ({
    init: jest.fn(),
    track: jest.fn(),
}));

describe('analytics utils', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = originalEnv;
        (analyticsUtils as unknown as { track: unknown }).track = null;
        jest.mocked(init).mockReset();
        jest.mocked(track).mockReset();
    });

    describe('init', () => {
        it('initialises the tracker with the configured domain', async () => {
            process.env = {
                ...originalEnv,
                NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'app.aragon.org',
            };

            await analyticsUtils.init();

            expect(init).toHaveBeenCalledWith({
                domain: 'app.aragon.org',
                endpoint: '/api/analytics',
            });
        });

        it('does not initialise the tracker when no domain is configured', async () => {
            process.env = {
                ...originalEnv,
                NEXT_PUBLIC_PLAUSIBLE_DOMAIN: undefined,
            };

            await analyticsUtils.init();

            expect(init).not.toHaveBeenCalled();
        });
    });

    describe('trackEvent', () => {
        beforeEach(() => {
            process.env = {
                ...originalEnv,
                NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'app.aragon.org',
            };
        });

        it('forwards the event name and props once initialised', async () => {
            await analyticsUtils.init();

            analyticsUtils.trackEvent('Publish DAO Click', {
                network: 'ethereum-mainnet',
            });

            expect(track).toHaveBeenCalledWith('Publish DAO Click', {
                props: { network: 'ethereum-mainnet' },
            });
        });

        it('omits the options argument when no props are given', async () => {
            await analyticsUtils.init();

            analyticsUtils.trackEvent('Create DAO Click');

            expect(track).toHaveBeenCalledWith('Create DAO Click', {
                props: undefined,
            });
        });

        it('does not call track before init (e.g. domain not configured)', () => {
            analyticsUtils.trackEvent('Create DAO Click');

            expect(track).not.toHaveBeenCalled();
        });
    });
});
