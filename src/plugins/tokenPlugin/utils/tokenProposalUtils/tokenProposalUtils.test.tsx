import { generateToken } from '@/modules/finance/testUtils';
import { type IProposalAction } from '@/modules/governance/api/governanceService';
import { generateProposalAction } from '@/modules/governance/testUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateTokenPluginSettings, generateTokenProposal } from '../../testUtils';
import { DaoTokenVotingMode, VoteOption, type ITokenProposal, type ITokenProposalOptionVotes } from '../../types';
import { tokenProposalUtils } from './tokenProposalUtils';

describe('tokenProposal utils', () => {
    describe('getProposalStatus', () => {
        const isApprovalReachedSpy = jest.spyOn(tokenProposalUtils, 'isApprovalReached');

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
        });

        it('returns executed status when proposal has been executed', () => {
            const proposal = generateTokenProposal({
                executed: { status: true },
                settings: generateTokenPluginSettings({ historicalTotalSupply: '0' }),
            });
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTED);
        });

        it('returns pending status when proposal has not started yet', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO('2022-02-10T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate });
            timeUtils.setTime(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.PENDING);
        });

        it('returns executable status when approval is reached early, proposal is started, can be executed early and has actions', () => {
            const now = '2022-02-01T07:55:55.868Z';
            const startDate = DateTime.fromISO('2022-01-10T08:00:00.000Z').toMillis() / 1000;
            const settings = generateTokenPluginSettings({ votingMode: DaoTokenVotingMode.EARLY_EXECUTION });
            const proposal = generateTokenProposal({ startDate, settings, actions: [generateProposalAction()] });
            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValueOnce(false).mockReturnValueOnce(true);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns executable status when approval is reached, proposal is ended and has actions', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO('2022-02-05T08:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2022-02-08T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate, endDate, actions: [generateProposalAction()] });
            timeUtils.setTime(now);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns active status when proposal has not ended yet', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO('2022-02-05T08:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2022-02-12T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate, endDate });
            timeUtils.setTime(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.ACTIVE);
        });

        it('returns accepted status when proposal is ended, the approval has been reached and proposal is signaling', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const actions: IProposalAction[] = [];
            const proposal = generateTokenProposal({ startDate, endDate, actions });
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.ACCEPTED);
        });

        it('returns rejected status when proposal is ended and the approval has not been reached', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate, endDate });
            isApprovalReachedSpy.mockReturnValue(false);
            timeUtils.setTime(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.REJECTED);
        });
    });

    describe('hasSucceeded', () => {
        const isApprovalReachedSpy = jest.spyOn(tokenProposalUtils, 'isApprovalReached');

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
        });

        afterAll(() => {
            isApprovalReachedSpy.mockRestore();
        });

        it('returns true if proposal is open, early execution is enabled, and approval is reached early', () => {
            const now = '2025-01-24T10:00:00.000Z';
            const startDate = DateTime.fromISO('2025-01-20T10:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2025-01-30T10:00:00.000Z').toMillis() / 1000;

            isApprovalReachedSpy.mockReturnValue(true);
            const proposal = generateTokenProposal({
                startDate,
                endDate,
                settings: generateTokenPluginSettings({
                    votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
                    historicalTotalSupply: '1000',
                }),
            });
            timeUtils.setTime(now);
            expect(tokenProposalUtils.hasSucceeded(proposal)).toBe(true);
        });

        it('returns false if proposal is open, early execute is enabled and approval is not reached early', () => {
            const now = '2025-01-24T10:00:00.000Z';
            const startDate = DateTime.fromISO('2025-01-20T10:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2025-01-30T10:00:00.000Z').toMillis() / 1000;

            isApprovalReachedSpy.mockReturnValue(false);
            const proposal = generateTokenProposal({
                startDate,
                endDate,
                settings: generateTokenPluginSettings({
                    votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
                    historicalTotalSupply: '1000',
                }),
            });
            timeUtils.setTime(now);
            expect(tokenProposalUtils.hasSucceeded(proposal)).toBe(false);
        });

        it('returns true if proposal is ended and approval is reached', () => {
            const now = '2025-01-24T10:00:00.000Z';
            const startDate = DateTime.fromISO('2025-01-20T10:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2025-01-22T10:00:00.000Z').toMillis() / 1000;

            isApprovalReachedSpy.mockReturnValue(true);
            const proposal = generateTokenProposal({
                startDate,
                endDate,
                settings: generateTokenPluginSettings({ historicalTotalSupply: '1000' }),
            });
            timeUtils.setTime(now);

            expect(tokenProposalUtils.hasSucceeded(proposal)).toBe(true);
        });

        it('returns false if proposal is ended and approval is not reached', () => {
            const now = '2025-01-24T10:00:00.000Z';
            const startDate = DateTime.fromISO('2025-01-20T10:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2025-01-22T10:00:00.000Z').toMillis() / 1000;

            isApprovalReachedSpy.mockReturnValue(false);
            const proposal = generateTokenProposal({
                startDate,
                endDate,
                settings: generateTokenPluginSettings({ historicalTotalSupply: '1000' }),
            });
            timeUtils.setTime(now);

            expect(tokenProposalUtils.hasSucceeded(proposal)).toBe(false);
        });
    });

    describe('isApprovalReached', () => {
        const isMinParticipationReachedSpy = jest.spyOn(tokenProposalUtils, 'isMinParticipationReached');
        const isSupportReachedSpy = jest.spyOn(tokenProposalUtils, 'isSupportReached');

        afterEach(() => {
            isMinParticipationReachedSpy.mockReset();
            isSupportReachedSpy.mockReset();
        });

        afterAll(() => {
            isMinParticipationReachedSpy.mockRestore();
            isSupportReachedSpy.mockRestore();
        });

        it('returns true when both minParticipation and support are reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(true);
            isSupportReachedSpy.mockReturnValue(true);
            expect(tokenProposalUtils.isApprovalReached(generateTokenProposal())).toBeTruthy();
        });

        it('returns false when minParticipation is reached but support is not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(true);
            isSupportReachedSpy.mockReturnValue(false);
            expect(tokenProposalUtils.isApprovalReached(generateTokenProposal())).toBeFalsy();
        });

        it('returns false when support is reached but minParticipation is not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(false);
            isSupportReachedSpy.mockReturnValue(true);
            expect(tokenProposalUtils.isApprovalReached(generateTokenProposal())).toBeFalsy();
        });

        it('returns false when both support and minParticipation are not reached', () => {
            isMinParticipationReachedSpy.mockReturnValue(false);
            isSupportReachedSpy.mockReturnValue(false);
            expect(tokenProposalUtils.isApprovalReached(generateTokenProposal())).toBeFalsy();
        });

        it('checks that support is reached early when early parameter is set to true', () => {
            const proposal = generateTokenProposal();
            tokenProposalUtils.isApprovalReached(proposal, true);
            expect(isSupportReachedSpy).toHaveBeenCalledWith(proposal, true);
        });
    });

    describe('isMinParticipationReached', () => {
        const getTotalVotesSpy = jest.spyOn(tokenProposalUtils, 'getTotalVotes');

        afterEach(() => {
            getTotalVotesSpy.mockReset();
        });

        afterAll(() => {
            getTotalVotesSpy.mockRestore();
        });

        it('returns true when total votes is greater than min participation required', () => {
            const settings = generateTokenPluginSettings({ minParticipation: 150000, historicalTotalSupply: '1000' }); // 15%
            const totalVotes = BigInt('200'); // 20% of total-supply
            const proposal = generateTokenProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeTruthy();
        });

        it('returns true when total votes is equal to min participation required', () => {
            const settings = generateTokenPluginSettings({ minParticipation: 500000, historicalTotalSupply: '1000' }); // 50%
            const totalVotes = BigInt('500'); // 50% of total-supply
            const proposal = generateTokenProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeTruthy();
        });

        it('returns false when total votes is less than min participation required', () => {
            const settings = generateTokenPluginSettings({ minParticipation: 300000, historicalTotalSupply: '1000' }); // 30%
            const totalVotes = BigInt('290'); // 29% of total-supply
            const proposal = generateTokenProposal({ settings });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeFalsy();
        });

        it('returns false when total supply is set to zero', () => {
            const settings = generateTokenPluginSettings({ historicalTotalSupply: '0' });
            const proposal = generateTokenProposal({ settings });
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeFalsy();
        });
    });

    describe('isSupportReached', () => {
        it('returns true when the amount of yes votes is greater than the support required', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 500000, historicalTotalSupply: '0' }); // 50%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '510' }, // 51%
                { type: VoteOption.NO, totalVotingPower: '490' }, // 49%
                { type: VoteOption.ABSTAIN, totalVotingPower: '290' },
            ];
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeTruthy();
        });

        it('returns false when the amount of yes votes is equal to the support required', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 600000, historicalTotalSupply: '0' }); // 60%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '600' }, // 60%
                { type: VoteOption.NO, totalVotingPower: '400' }, // 40%
            ];
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeFalsy();
        });

        it('returns false when the amount of yes votes is less than the support required', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 400000, historicalTotalSupply: '0' }); // 40%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '380' }, // 38%
                { type: VoteOption.NO, totalVotingPower: '620' }, // 62%
            ];
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeFalsy();
        });

        it('returns false when no one voted yet', () => {
            const settings = generateTokenPluginSettings({ historicalTotalSupply: '0' });
            expect(tokenProposalUtils.isSupportReached(generateTokenProposal({ settings }))).toBeFalsy();
        });

        it('returns true when early param is true and yes votes match the support needed in worst voting scenario', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 510000, historicalTotalSupply: '1000' }); // 51%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '520' }, // 52% and 38% worst case
                { type: VoteOption.ABSTAIN, totalVotingPower: '100' },
            ];
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            expect(tokenProposalUtils.isSupportReached(proposal, true)).toBeTruthy();
        });

        it('returns false when early param is true and yes votes do not match the support needed in worst voting scenario', () => {
            const settings = generateTokenPluginSettings({ supportThreshold: 550000, historicalTotalSupply: '1000' }); // 55%
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '400' }, // 40% and 45% worst case
                { type: VoteOption.NO, totalVotingPower: '100' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '50' },
            ];
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            expect(tokenProposalUtils.isSupportReached(proposal, true)).toBeFalsy();
        });
    });

    describe('getTotalVotes', () => {
        it('returns the total amount of voting power for each option', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '510' },
                { type: VoteOption.NO, totalVotingPower: '7100' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '122' },
            ];
            const proposal = generateTokenProposal({ metrics: { votesByOption } });
            expect(tokenProposalUtils.getTotalVotes(proposal)).toEqual(BigInt('7732'));
        });

        it('returns zero when no one has voted yet', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [];
            const proposal = generateTokenProposal({ metrics: { votesByOption } });
            expect(tokenProposalUtils.getTotalVotes(proposal)).toEqual(BigInt('0'));
        });

        it('excludes the abstain votes when excludeAbstain parameter is set to true', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '15' },
                { type: VoteOption.NO, totalVotingPower: '40' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '80' },
            ];
            const proposal = generateTokenProposal({ metrics: { votesByOption } });
            expect(tokenProposalUtils.getTotalVotes(proposal, true)).toEqual(BigInt('55'));
        });
    });

    describe('getVoteByType', () => {
        it('returns the voting power of the specified vote type', () => {
            const votesByOption = [
                { type: VoteOption.YES, totalVotingPower: '1510' },
                { type: VoteOption.NO, totalVotingPower: '7145' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '132' },
            ];
            expect(tokenProposalUtils.getVoteByType(votesByOption, VoteOption.NO)).toEqual(BigInt('7145'));
        });

        it('returns 0 when no one voted the specified option', () => {
            const votesByOption = [
                { type: VoteOption.NO, totalVotingPower: '123' },
                { type: VoteOption.ABSTAIN, totalVotingPower: '12' },
            ];
            expect(tokenProposalUtils.getVoteByType(votesByOption, VoteOption.YES)).toEqual(BigInt('0'));
        });
    });

    describe('getOptionVotingPower', () => {
        it('returns the correctly formatted voting power when the option exists', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000000000000000' },
                { type: VoteOption.NO, totalVotingPower: '2000000000000000000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption },
            });

            const yesVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES);
            const noVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2');
        });

        it('returns 0 when the option does not exist', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000000000000000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption },
            });

            const noVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(noVotingPower).toEqual('0');
        });

        it('handles different decimals correctly', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000' },
                { type: VoteOption.NO, totalVotingPower: '2500000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 6 }) }),
                metrics: { votesByOption },
            });

            const yesVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES);
            const noVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2.5');
        });

        it('returns 0 when votesByOption is empty', () => {
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption: [] },
            });

            const yesVotingPower = tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES);

            expect(yesVotingPower).toEqual('0');
        });
    });
});
