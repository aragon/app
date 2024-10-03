import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';
import { useTokenGovernanceSettings } from './useTokenGovernanceSettings';

describe('useTokenGovernanceSettings', () => {
    const parseSettingsSpy = jest.spyOn(tokenSettingsUtils, 'parseSettings');

    afterEach(() => {
        parseSettingsSpy.mockReset();
    });

    it('returns the parsed token governance settings', () => {
        const mockSettings = generateTokenPluginSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const params = { daoId: 'token-test-id', pluginAddress: '0x123', settings: mockSettings };
        const { result } = renderHook(() => useTokenGovernanceSettings(params));

        expect(parseSettingsSpy).toHaveBeenCalledWith({ settings: mockSettings, t: mockTranslations.tMock });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
