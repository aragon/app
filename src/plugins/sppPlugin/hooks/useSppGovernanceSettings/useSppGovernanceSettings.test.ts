import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import { generateSppPluginSettings } from '../../testUtils';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils/sppSettingsUtils';
import { useSppGovernanceSettings } from './useSppGovernanceSettings';

describe('useSppGovernanceSettings', () => {
    const parseSettingsSpy = jest.spyOn(sppSettingsUtils, 'parseSettings');

    afterEach(() => {
        parseSettingsSpy.mockReset();
    });

    it('returns the parsed token governance settings', () => {
        const mockSettings = generateSppPluginSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const params = { daoId: 'token-test-id', pluginAddress: '0x123', settings: mockSettings };
        const { result } = renderHook(() => useSppGovernanceSettings(params));

        expect(parseSettingsSpy).toHaveBeenCalledWith({ settings: mockSettings, t: mockTranslations.tMock });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
