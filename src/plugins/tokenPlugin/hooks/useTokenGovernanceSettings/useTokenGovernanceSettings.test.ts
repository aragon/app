import { generateDaoTokenSettings } from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultError, generateReactQueryResultSuccess, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import { useTokenGovernanceSettings } from './useTokenGovernanceSettings';

describe('useTokenGovernanceSettings', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
    });

    it('returns empty array when daoSettings is null', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }));
        expect(result.current).toEqual([]);
    });

    it('fetches the specified DAO terms and definitions for token Dao', async () => {
        const mockSettings = generateDaoTokenSettings();
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: true }),
        );

        expect(result.current.length).toBeGreaterThan(0);
    });

    it('handles settings object being passed directly to the hook', async () => {
        const mockSettings = generateDaoTokenSettings();
        const { result } = renderHook(() =>
            useTokenGovernanceSettings({ daoId: 'token-test-id', settings: mockSettings }),
        );

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: false }),
        );

        expect(result.current.length).toBeGreaterThan(0);
    });

    it('correctly handles different voting modes', () => {
        const baseSettings = generateDaoTokenSettings();
        const mockSettings = { ...baseSettings, settings: { ...baseSettings.settings, votingMode: 2 } };

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current.length).toBeGreaterThan(0);
    });
});
