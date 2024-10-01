import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import * as usePluginSettings from '@/shared/hooks/usePluginSettings';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';
import { useTokenGovernanceSettings } from './useTokenGovernanceSettings';

describe('useTokenGovernanceSettings', () => {
    const usePluginSettingsSpy = jest.spyOn(usePluginSettings, 'usePluginSettings');
    const parseSettingsSpy = jest.spyOn(tokenSettingsUtils, 'parseSettings');

    beforeEach(() => {
        usePluginSettingsSpy.mockReturnValue(generateTokenPluginSettings());
    });

    afterEach(() => {
        usePluginSettingsSpy.mockReset();
        parseSettingsSpy.mockReset();
    });

    it('returns empty array when settings are not passed and data is not returned', () => {
        usePluginSettingsSpy.mockReturnValue(undefined);

        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }));

        expect(result.current).toEqual([]);
        expect(parseSettingsSpy).not.toHaveBeenCalled();
    });

    it('fetches settings and calls parseSettings with correct arguments', async () => {
        const mockSettings = generateTokenPluginSettings();
        usePluginSettingsSpy.mockReturnValue(mockSettings);

        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(usePluginSettingsSpy).toHaveBeenCalledWith({ daoId: 'token-test-id' });
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(parseSettingsSpy.mock.results[0].value);
    });

    it('handles settings object passed directly to the hook', () => {
        const mockSettings = generateTokenPluginSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const { result } = renderHook(() =>
            useTokenGovernanceSettings({ daoId: 'token-test-id', settings: mockSettings }),
        );

        expect(usePluginSettingsSpy).toHaveBeenCalledWith({ daoId: 'token-test-id' });
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
