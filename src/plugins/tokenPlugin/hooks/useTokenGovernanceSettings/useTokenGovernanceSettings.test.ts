import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultError, generateReactQueryResultSuccess, ReactQueryWrapper } from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { renderHook } from '@testing-library/react';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';
import { useTokenGovernanceSettings } from './useTokenGovernanceSettings';

describe('useTokenGovernanceSettings', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');
    const parseSettingsSpy = jest.spyOn(tokenSettingsUtils, 'parseSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('returns empty array when settings are not passed and data is not returned', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));

        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }));

        expect(result.current).toEqual([]);
        expect(parseSettingsSpy).not.toHaveBeenCalled();
    });

    it('fetches settings and calls parseSettings with correct arguments', async () => {
        const mockSettings = generateDaoTokenSettings();
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));

        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: true }),
        );
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(parseSettingsSpy.mock.results[0].value);
    });

    it('handles settings object passed directly to the hook', () => {
        const mockSettings = generateDaoTokenSettings();
        const mockParsedSettings = [{ term: 'mockTerm', definition: 'mockDefinition' }];
        parseSettingsSpy.mockReturnValue(mockParsedSettings);

        const { result } = renderHook(() =>
            useTokenGovernanceSettings({ daoId: 'token-test-id', settings: mockSettings }),
        );

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: false }),
        );
        expect(parseSettingsSpy).toHaveBeenCalledWith({
            settings: mockSettings,
            t: mockTranslations.tMock,
        });
        expect(result.current).toEqual(mockParsedSettings);
    });
});
