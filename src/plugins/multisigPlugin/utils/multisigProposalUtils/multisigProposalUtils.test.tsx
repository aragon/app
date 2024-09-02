import { timeUtils } from '@/test/utils';
import { ProposalStatus, type IProposalAction } from '@aragon/ods';
import { DateTime } from 'luxon';
import { generateMultisigProposal } from '../../testUtils';
import type { IDaoMultisigSettings } from '../../types';
import { multisigProposalUtils } from './multisigProposalUtils';

describe('multisigProposal utils', () => {
    describe('getProposalStatus', () => {
        const isApprovalReachedSpy = jest.spyOn(multisigProposalUtils, 'isApprovalReached');

        afterEach(() => {
            isApprovalReachedSpy.mockReset();
        });

        afterAll(() => {
            isApprovalReachedSpy.mockRestore();
        });

        it('returns executed status when proposal has been executed', () => {
            const proposal = generateMultisigProposal({ executed: { status: true } });
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTED);
        });

        it('returns pending status when proposal has not started yet', () => {
            const now = '2024-08-07T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-08-10T09:49:56.868Z').toMillis() / 1000;
            const proposal = generateMultisigProposal({ startDate });
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.PENDING);
        });

        it('returns executable status when proposal is not ended, the approval has been reached and proposal has actions', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-15T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-25T09:49:56.868Z').toMillis() / 1000;
            const actions: IProposalAction[] = [
                { from: '0', to: '1', data: '', value: '0', type: '', inputData: null },
            ];
            const proposal = generateMultisigProposal({ startDate, endDate, actions });
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns active status when proposal is started but has not ended yet', () => {
            const now = '2024-10-10T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const proposal = generateMultisigProposal({ startDate, endDate });
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.ACTIVE);
        });

        it('returns accepted status when proposal is ended, the approval has been reached and proposal is signaling', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const actions: IProposalAction[] = [];
            const proposal = generateMultisigProposal({ startDate, endDate, actions });
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.ACCEPTED);
        });

        it('returns expired status when proposal is ended, the approval has been reached and proposal has actions', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const actions: IProposalAction[] = [
                { from: '0', to: '1', data: '', value: '0', type: '', inputData: null },
            ];
            const proposal = generateMultisigProposal({ startDate, endDate, actions });
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXPIRED);
        });

        it('returns rejected status when proposal is ended and approval has not been reached', () => {
            const now = '2024-10-20T09:49:56.868Z';
            const startDate = DateTime.fromISO('2024-10-08T09:49:56.868Z').toMillis() / 1000;
            const endDate = DateTime.fromISO('2024-10-12T09:49:56.868Z').toMillis() / 1000;
            const proposal = generateMultisigProposal({ startDate, endDate });
            isApprovalReachedSpy.mockReturnValue(false);
            timeUtils.setTime(now);
            expect(multisigProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.REJECTED);
        });
    });

    describe('isApprovalReached', () => {
        it('returns true when number of voters is greater than min approvals', () => {
            const settings = { minApprovals: 3 } as IDaoMultisigSettings['settings'];
            const metrics = { totalVotes: 5 };
            const proposal = generateMultisigProposal({ settings, metrics });
            expect(multisigProposalUtils.isApprovalReached(proposal)).toBeTruthy();
        });

        it('returns true when number of voters is equal to min approvals', () => {
            const settings = { minApprovals: 1 } as IDaoMultisigSettings['settings'];
            const metrics = { totalVotes: 1 };
            const proposal = generateMultisigProposal({ settings, metrics });
            expect(multisigProposalUtils.isApprovalReached(proposal)).toBeTruthy();
        });

        it('returns false when number of voters is less than min approvals', () => {
            const settings = { minApprovals: 4 } as IDaoMultisigSettings['settings'];
            const metrics = { totalVotes: 2 };
            const proposal = generateMultisigProposal({ settings, metrics });
            expect(multisigProposalUtils.isApprovalReached(proposal)).toBeFalsy();
        });
    });
});
