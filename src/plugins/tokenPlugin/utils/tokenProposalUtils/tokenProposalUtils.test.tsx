import type { IProposalAction } from '@aragon/ods';
import { DateTime, Settings } from 'luxon';
import { generateTokenProposal } from '../../testUtils';
import { DaoTokenVotingMode, type IDaoTokenSettings } from '../../types';
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
        it('', () => {
            // TODO
        });
    });

    describe('isMinParticipationReached', () => {
        it('', () => {
            // TODO
        });
    });

    describe('isSupportReached', () => {
        it('', () => {
            // TODO
        });
    });

    describe('getTotalVotes', () => {
        it('', () => {
            // TODO
        });
    });
});
