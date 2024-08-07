import { generateToken } from '@/modules/finance/testUtils';
import { type IProposalAction } from '@aragon/ods';
import { DateTime, Settings } from 'luxon';
import { generateTokenProposal } from '../../testUtils';
import { DaoTokenVotingMode, ITokenProposalOptionVotes, VoteOption, type IDaoTokenSettings } from '../../types';
import { tokenProposalUtils } from './tokenProposalUtils';

describe('tokenProposal utils', () => {
    const originalNow = Settings.now;

    afterEach(() => {
        Settings.now = originalNow;
    });

    const setNow = (now?: string) => {
        Settings.now = () => (now != null ? new Date(now) : new Date()).valueOf();
    };

    describe('getProposalStatus', () => {
        const isApprovalReachedSpy = jest.spyOn(tokenProposalUtils, 'isApprovalReached');

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
        });

        afterAll(() => {
            isApprovalReachedSpy.mockRestore();
        });

        it('returns executed status when proposal has been executed', () => {
            const proposal = generateTokenProposal({ executed: { status: true } });
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('executed');
        });

        it('returns pending status when proposal has not started yet', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO('2022-02-10T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate });
            setNow(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('pending');
        });

        it('returns executable status when approval is reached, proposal is started, can be executed early and has actions', () => {
            const now = '2022-02-01T07:55:55.868Z';
            const startDate = DateTime.fromISO('2022-01-10T08:00:00.000Z').toMillis() / 1000;
            const settings = { votingMode: DaoTokenVotingMode.EARLY_EXECUTION } as IDaoTokenSettings['settings'];
            const actions: IProposalAction[] = [
                { from: '0', to: '1', data: '', value: '0', type: '', inputData: null },
            ];
            const proposal = generateTokenProposal({ startDate, settings, actions });
            setNow(now);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('executable');
        });

        it('returns executable status when approval is reached, proposal is ended and has actions', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO('2022-02-05T08:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2022-02-08T08:00:00.000Z').toMillis() / 1000;
            const actions: IProposalAction[] = [
                { from: '0', to: '1', data: '', value: '0', type: '', inputData: null },
            ];
            const proposal = generateTokenProposal({ startDate, endDate, actions });
            setNow(now);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('executable');
        });

        it('returns active status when proposal has not ended yet', () => {
            const now = '2022-02-10T08:00:00.868Z';
            const startDate = DateTime.fromISO('2022-02-05T08:00:00.000Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2022-02-12T08:00:00.000Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate, endDate });
            setNow(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('active');
        });

        it('returns accepted status when proposal is ended, the approval has been reached and proposal is signaling', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const actions: IProposalAction[] = [];
            const proposal = generateTokenProposal({ startDate, endDate, actions });
            isApprovalReachedSpy.mockReturnValue(true);
            setNow(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('accepted');
        });

        it('returns rejected status when proposal is ended and the approval has not been reached', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const proposal = generateTokenProposal({ startDate, endDate });
            isApprovalReachedSpy.mockReturnValue(false);
            setNow(now);
            expect(tokenProposalUtils.getProposalStatus(proposal)).toEqual('rejected');
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
    });

    describe('isMinParticipationReached', () => {
        const getTotalVotesSpy = jest.spyOn(tokenProposalUtils, 'getTotalVotes');

        afterEach(() => {
            getTotalVotesSpy.mockReset();
        });

        it('returns true when total votes is greater than min participation required', () => {
            const settings = { minParticipation: 150000 } as IDaoTokenSettings['settings']; // 15%
            const token = generateToken({ totalSupply: '1000' });
            const totalVotes = BigInt('200'); // 20% of total-supply
            const proposal = generateTokenProposal({ settings, token });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeTruthy();
        });

        it('returns true when total votes is equal to min participation required', () => {
            const settings = { minParticipation: 500000 } as IDaoTokenSettings['settings']; // 50%
            const token = generateToken({ totalSupply: '1000' });
            const totalVotes = BigInt('500'); // 50% of total-supply
            const proposal = generateTokenProposal({ settings, token });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeTruthy();
        });

        it('returns false when total votes is less than min participation required', () => {
            const settings = { minParticipation: 300000 } as IDaoTokenSettings['settings']; // 30%
            const token = generateToken({ totalSupply: '1000' });
            const totalVotes = BigInt('290'); // 29% of total-supply
            const proposal = generateTokenProposal({ settings, token });
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeFalsy();
        });

        it('returns false when total supply is set to zero', () => {
            const token = generateToken({ totalSupply: '0' });
            const proposal = generateTokenProposal({ token });
            expect(tokenProposalUtils.isMinParticipationReached(proposal)).toBeFalsy();
        });
    });

    describe('isSupportReached', () => {
        const getTotalVotesSpy = jest.spyOn(tokenProposalUtils, 'getTotalVotes');

        afterEach(() => {
            getTotalVotesSpy.mockReset();
        });

        afterAll(() => {
            getTotalVotesSpy.mockRestore();
        });

        it('returns true when the amount of yes votes is greater than the support required', () => {
            const settings = { supportThreshold: 500000 } as IDaoTokenSettings['settings']; // 50%
            const votesByOption = [{ type: VoteOption.YES, totalVotingPower: '510' }]; // 51% of total-votes
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            const totalVotes = BigInt('1000');
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeTruthy();
        });

        it('returns true when the amount of yes votes is equal to the support required', () => {
            const settings = { supportThreshold: 600000 } as IDaoTokenSettings['settings']; // 60%
            const votesByOption = [{ type: VoteOption.YES, totalVotingPower: '600' }]; // 60% of total-votes
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            const totalVotes = BigInt('1000');
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeTruthy();
        });

        it('returns false when the amount of yes votes is less than the support required', () => {
            const settings = { supportThreshold: 400000 } as IDaoTokenSettings['settings']; // 40%
            const votesByOption = [{ type: VoteOption.YES, totalVotingPower: '380' }]; // 38% of total-votes
            const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
            const totalVotes = BigInt('1000');
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isSupportReached(proposal)).toBeFalsy();
        });

        it('returns false when no one voted yet', () => {
            const totalVotes = BigInt('0');
            getTotalVotesSpy.mockReturnValue(totalVotes);
            expect(tokenProposalUtils.isSupportReached(generateTokenProposal())).toBeFalsy();
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
    });
});
