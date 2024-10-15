import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import { adminSettingsUtils } from '../../utils/adminSettingsUtils';
import { useAdminGovernanceSettings } from './useAdminGovernanceSettings';

describe('useAdminGovernanceSettings hook', () => {
    const parseSettingsSpy = jest.spyOn(adminSettingsUtils, 'parseSettings');

    afterEach(() => {
        parseSettingsSpy.mockReset();
    });

    it('returns the parsed admin governance settings', () => {
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const { result } = renderHook(() => useAdminGovernanceSettings());

        expect(parseSettingsSpy).toHaveBeenCalledWith({ t: mockTranslations.tMock });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
