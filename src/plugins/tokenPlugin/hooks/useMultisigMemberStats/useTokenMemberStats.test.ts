import { generateToken } from '@/modules/finance/testUtils';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultSuccess } from '@/shared/testUtils';
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
    });

    it('returns token member stats', () => {
        const memberStatsParams = {
            address: '0x1234567890123456789012345678901234567890',
            daoId: 'dao-id',
        };

        const token = generateToken({ decimals: 6 });
        const daoTokenSettings = generateDaoTokenSettings({ token });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: daoTokenSettings }));

        const member = generateTokenMember({ votingPower: '47928374987234', tokenBalance: '123456' });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));

        const { result } = renderHook(() => useTokenMemberStats(memberStatsParams));
        const [votingPower, tokenBalance, delegates, latestActivity] = result.current;

        expect(votingPower.label).toBe('app.governance.plugins.token.tokenMemberStats.votingPower');
        expect(votingPower.value).toBe('47.93M');

        expect(tokenBalance.label).toBe('app.governance.plugins.token.tokenMemberStats.tokenBalance');
        expect(tokenBalance.value).toBe('123.46K');

        expect(delegates.label).toBe('app.governance.plugins.token.tokenMemberStats.delegations');
        expect(delegates.value).toBe(member.metrics.delegateReceivedCount);

        expect(latestActivity.label).toBe('app.governance.plugins.token.tokenMemberStats.latestActivity');
    });
});
