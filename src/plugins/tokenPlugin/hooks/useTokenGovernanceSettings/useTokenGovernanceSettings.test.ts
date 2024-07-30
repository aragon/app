import { generateToken } from '@/modules/finance/testUtils';
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
        const tokenSettings = generateToken();
        const mockSettings = generateDaoTokenSettings({
            settings: {
                supportThreshold: 0.3,
                minParticipation: 0.2,
                minDuration: 604800,
                minProposerVotingPower: '1',
                votingMode: 1,
            },
            token: {
                ...tokenSettings,
                totalSupply: '200000',
            },
        });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: true }),
        );

        const [
            approvalThreshold,
            minimumParticipation,
            minimumDuration,
            earlyExecution,
            voteChange,
            proposalThreshold,
        ] = result.current;

        expect(approvalThreshold.term).toBe('app.plugins.token.tokenGovernanceSettings.approvalThreshold');
        expect(approvalThreshold.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.approval (approvalThreshold=30%)',
        );
        expect(minimumParticipation.term).toBe('app.plugins.token.tokenGovernanceSettings.minimumParticipation');
        expect(minimumParticipation.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.participation (participation=30%,tokenValue=400,tokenSymbol=ETH)',
        );
        expect(minimumDuration.term).toBe('app.plugins.token.tokenGovernanceSettings.minimumDuration');
        expect(minimumDuration.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.duration (days=7,hours=0,minutes=0)',
        );
        expect(earlyExecution.term).toBe('app.plugins.token.tokenGovernanceSettings.earlyExecution');
        expect(earlyExecution.definition).toBe('app.plugins.token.tokenGovernanceSettings.yes');
        expect(voteChange.term).toBe('app.plugins.token.tokenGovernanceSettings.voteChange');
        expect(voteChange.definition).toBe('app.plugins.token.tokenGovernanceSettings.no');
        expect(proposalThreshold.term).toBe('app.plugins.token.tokenGovernanceSettings.proposalThreshold');
        expect(proposalThreshold.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.proposalAccess (balance=1,symbol=ETH)',
        );
    });

    it('handles settings object being passed directly to the hook', async () => {
        const tokenSettings = generateToken();
        const mockSettings = generateDaoTokenSettings({
            settings: {
                supportThreshold: 0.5,
                minParticipation: 0.1,
                minDuration: 604800,
                minProposerVotingPower: '1',
                votingMode: 1,
            },
            token: {
                ...tokenSettings,
                totalSupply: '10000',
            },
        });
        const { result } = renderHook(() =>
            useTokenGovernanceSettings({ daoId: 'token-test-id', settings: mockSettings }),
        );

        expect(useDaoSettingsSpy).toHaveBeenCalledWith(
            { urlParams: { daoId: 'token-test-id' } },
            expect.objectContaining({ enabled: false }),
        );

        const [
            approvalThreshold,
            minimumParticipation,
            minimumDuration,
            earlyExecution,
            voteChange,
            proposalThreshold,
        ] = result.current;

        expect(approvalThreshold.term).toBe('app.plugins.token.tokenGovernanceSettings.approvalThreshold');
        expect(approvalThreshold.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.approval (approvalThreshold=50%)',
        );
        expect(minimumParticipation.term).toBe('app.plugins.token.tokenGovernanceSettings.minimumParticipation');
        expect(minimumParticipation.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.participation (participation=50%,tokenValue=10,tokenSymbol=ETH)',
        );
        expect(minimumDuration.term).toBe('app.plugins.token.tokenGovernanceSettings.minimumDuration');
        expect(minimumDuration.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.duration (days=7,hours=0,minutes=0)',
        );
        expect(earlyExecution.term).toBe('app.plugins.token.tokenGovernanceSettings.earlyExecution');
        expect(earlyExecution.definition).toBe('app.plugins.token.tokenGovernanceSettings.yes');
        expect(voteChange.term).toBe('app.plugins.token.tokenGovernanceSettings.voteChange');
        expect(voteChange.definition).toBe('app.plugins.token.tokenGovernanceSettings.no');
        expect(proposalThreshold.term).toBe('app.plugins.token.tokenGovernanceSettings.proposalThreshold');
        expect(proposalThreshold.definition).toBe(
            'app.plugins.token.tokenGovernanceSettings.proposalAccess (balance=1,symbol=ETH)',
        );
    });

    it('correctly handles different voting modes', () => {
        const baseSettings = generateDaoTokenSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                votingMode: 2,
            },
        };

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useTokenGovernanceSettings({ daoId: 'token-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        const [, , , earlyExecution, voteChange] = result.current;

        expect(earlyExecution.definition).toBe('app.plugins.token.tokenGovernanceSettings.no');
        expect(voteChange.definition).toBe('app.plugins.token.tokenGovernanceSettings.yes');
    });
});
