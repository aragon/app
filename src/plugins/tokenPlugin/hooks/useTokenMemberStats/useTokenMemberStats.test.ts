import * as governanceService from '@/modules/governance/api/governanceService';
import { generateMember } from '@/modules/governance/testUtils';
import { generateDaoPlugin, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import {
    generateTokenMember,
    generateTokenMemberMetrics,
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
} from '../../testUtils';
import * as useWrappedTokenBalanceModule from '../useWrappedTokenBalance';
import { useTokenMemberStats } from './useTokenMemberStats';

describe('useTokenMemberStats hook', () => {
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const useWrappedTokenBalanceSpy = jest.spyOn(useWrappedTokenBalanceModule, 'useWrappedTokenBalance');

    beforeEach(() => {
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateTokenMember() }));
        useWrappedTokenBalanceSpy.mockReturnValue({ balance: BigInt(0), refetch: jest.fn() });
    });

    afterEach(() => {
        useMemberSpy.mockReset();
        useWrappedTokenBalanceSpy.mockReset();
    });

    it('returns token member stats', () => {
        const token = generateTokenPluginSettingsToken({ decimals: 6 });
        const daoTokenSettings = generateTokenPluginSettings({ token });
        const plugin = generateDaoPlugin({ settings: daoTokenSettings });
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
            plugin,
        };

        const member = generateTokenMember({
            votingPower: '47928374987234',
            metrics: generateTokenMemberMetrics({ delegateReceivedCount: 47928374 }),
        });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        useWrappedTokenBalanceSpy.mockReturnValue({ balance: BigInt('123456123456'), refetch: jest.fn() });

        const { result } = renderHook(() => useTokenMemberStats(memberStatsParams));
        const [votingPower, tokenBalance] = result.current;

        expect(votingPower.label).toBe('app.plugins.token.tokenMemberStats.votingPower');
        expect(votingPower.value).toBe('47.93M');

        expect(tokenBalance.label).toBe('app.plugins.token.tokenMemberStats.tokenBalance');
        expect(tokenBalance.value).toBe('123.46K');
    });

    it('returns empty list when member is not a token member', () => {
        const member = generateMember();
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        const { result } = renderHook(() =>
            useTokenMemberStats({ address: '0x123', daoId: '1', plugin: generateDaoPlugin() }),
        );
        expect(result.current).toEqual([]);
    });

    it('returns empty list when member is null', () => {
        useMemberSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { result } = renderHook(() =>
            useTokenMemberStats({ address: '0x123', daoId: '1', plugin: generateDaoPlugin() }),
        );
        expect(result.current).toEqual([]);
    });
});
