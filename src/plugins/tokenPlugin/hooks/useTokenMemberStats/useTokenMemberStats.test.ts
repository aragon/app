import { generateToken } from '@/modules/finance/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as usePluginSettings from '@/shared/hooks/usePluginSettings';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import { generateTokenMember, generateTokenMemberMetrics, generateTokenPluginSettings } from '../../testUtils';
import { useTokenMemberStats } from './useTokenMemberStats';

describe('useTokenMemberStats hook', () => {
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const usePluginSettingsSpy = jest.spyOn(usePluginSettings, 'usePluginSettings');

    beforeEach(() => {
        usePluginSettingsSpy.mockReturnValue(generateTokenPluginSettings);
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateTokenMember() }));
    });

    afterEach(() => {
        useMemberSpy.mockReset();
        usePluginSettingsSpy.mockReset();
    });

    it('returns token member stats', () => {
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
        };

        const token = generateToken({ decimals: 6 });
        const daoTokenSettings = generateTokenPluginSettings({ token });
        usePluginSettingsSpy.mockReturnValue(daoTokenSettings);

        const member = generateTokenMember({
            votingPower: '47928374987234',
            tokenBalance: '123456123456',
            metrics: generateTokenMemberMetrics({ delegateReceivedCount: 47928374 }),
        });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));

        const { result } = renderHook(() => useTokenMemberStats(memberStatsParams));
        const [votingPower, tokenBalance, delegates] = result.current;

        expect(votingPower.label).toBe('app.plugins.token.tokenMemberStats.votingPower');
        expect(votingPower.value).toBe('47.93M');

        expect(tokenBalance.label).toBe('app.plugins.token.tokenMemberStats.tokenBalance');
        expect(tokenBalance.value).toBe('123.46K');

        expect(delegates.label).toBe('app.plugins.token.tokenMemberStats.delegations');
        expect(delegates.value).toBe('47.93M');
    });

    it('returns empty list when member is null', () => {
        useMemberSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { result } = renderHook(() => useTokenMemberStats({ address: '0x123', daoId: '1' }));
        expect(result.current).toEqual([]);
    });

    it('returns empty list when pluginSettings is null', () => {
        usePluginSettingsSpy.mockReturnValue(undefined);
        const { result } = renderHook(() => useTokenMemberStats({ address: '0x123', daoId: '2' }));
        expect(result.current).toEqual([]);
    });
});
