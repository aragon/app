import { analyticsUtils } from '@/shared/utils/analyticsUtils';
import { plausibleAnalyticsUtils } from './plausibleAnalyticsUtils';

describe('plausibleAnalyticsUtils', () => {
    const trackEventSpy = jest.spyOn(analyticsUtils, 'trackEvent');

    beforeEach(() => {
        trackEventSpy.mockImplementation(() => undefined);
    });

    afterEach(() => {
        trackEventSpy.mockReset();
    });

    it('forwards the event name to the analytics pipeline with no props', () => {
        plausibleAnalyticsUtils.track('wizard_start');

        expect(trackEventSpy).toHaveBeenCalledWith('wizard_start', undefined);
    });

    it('stringifies numeric and boolean prop values', () => {
        plausibleAnalyticsUtils.track('transaction_start', {
            flow: 'create_proposal',
            chainId: 1,
            hasActions: true,
        });

        expect(trackEventSpy).toHaveBeenCalledWith('transaction_start', {
            flow: 'create_proposal',
            chainId: '1',
            hasActions: 'true',
        });
    });

    it('omits nullish props and sends no props when none remain', () => {
        plausibleAnalyticsUtils.track('action_added', {
            source: undefined,
            count: null,
        });

        expect(trackEventSpy).toHaveBeenCalledWith('action_added', undefined);
    });
});
