import { tokenSettingsUtils } from './tokenSettingsUtils';

describe('tokenSettings utils', () => {
    describe('parsePercentageSetting', () => {
        it('correctly parses the percentage setting', () => {
            expect(tokenSettingsUtils.parsePercentageSetting(500000)).toEqual(50);
            expect(tokenSettingsUtils.parsePercentageSetting(123456)).toEqual(12.3456);
            expect(tokenSettingsUtils.parsePercentageSetting(0)).toEqual(0);
            expect(tokenSettingsUtils.parsePercentageSetting(1000000)).toEqual(100);
        });
    });
});
