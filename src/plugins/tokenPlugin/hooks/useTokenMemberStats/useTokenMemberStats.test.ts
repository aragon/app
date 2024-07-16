import { generateToken } from '@/modules/finance/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import { generateDaoTokenSettings, generateTokenMember } from '../../testUtils';
import { useTokenMemberStats } from './useTokenMemberStats';

describe('useTokenMemberStats hook', () => {
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));

        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateTokenMember() }));
    });

    afterEach(() => {
        useMemberSpy.mockReset();
        useDaoSettingsSpy.mockReset();
    });

    it('returns token member stats', () => {
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
        };

        const token = generateToken({ decimals: 6 });
        const daoTokenSettings = generateDaoTokenSettings({ token });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: daoTokenSettings }));

        const member = generateTokenMember({
            votingPower: '47928374987234',
            tokenBalance: '123456123456',
            metrics: {
                delegateReceivedCount: 47928374,
            },
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
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
        };

        useMemberSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));

        const { result } = renderHook(() => useTokenMemberStats(memberStatsParams));

        expect(result.current).toEqual([]);
    });

    it('returns empty list when daoSettings is null', () => {
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
        };

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));

        const { result } = renderHook(() => useTokenMemberStats(memberStatsParams));

        expect(result.current).toEqual([]);
    });
});
