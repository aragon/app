import { timeUtils } from '@/test/utils';
import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { proposalStatusUtils } from './proposalStatusUtils';
import type { IGetProposalStatusParams } from './proposalStatusUtils.api';

describe('proposalStatus utils', () => {
    describe('getProposalStatus', () => {
        const generateTestParams = (params?: Partial<IGetProposalStatusParams>): IGetProposalStatusParams => ({
            isExecuted: false,
            isVetoed: false,
            startDate: 0,
            paramsMet: false,
            hasActions: false,
            canExecuteEarly: false,
            ...params,
        });

        it('returns EXECUTED status when isExecuted param is set to true', () => {
            const params = generateTestParams({ isExecuted: true });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.EXECUTED);
        });

        it('returns VETOED status when isVetoed param is set to true', () => {
            const params = generateTestParams({ isExecuted: false, isVetoed: true });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.VETOED);
        });

        it('returns PENDING status when proposal start date is in the future', () => {
            const now = '2023-10-15T12:44:23';
            const startDate = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();
            timeUtils.setTime(now);
            const params = generateTestParams({ isExecuted: false, isVetoed: false, startDate });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.PENDING);
        });

        it('returns ADVANCEABLE status when proposal has advanceable stages', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                hasAdvanceableStages: true,
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.ADVANCEABLE);
        });

        it('returns EXPIRED status when proposal has expired stages', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: true,
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.EXPIRED);
        });

        it('returns EXECUTABLE status when proposal ends in the future but can be executed early', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                endDate: DateTime.fromISO(now).plus({ days: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: false,
                paramsMet: true,
                hasActions: true,
                canExecuteEarly: true,
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it.each([{ param: 'paramsMet' }, { param: 'hasActions' }, { param: 'canExecuteEarly' }])(
            'returns ACTIVE when proposal ends in the future and $param is false',
            ({ param }) => {
                const now = '2023-10-15T12:44:23';
                timeUtils.setTime(now);
                const params = generateTestParams({
                    isExecuted: false,
                    isVetoed: false,
                    startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                    endDate: DateTime.fromISO(now).plus({ days: 1 }).toSeconds(),
                    hasAdvanceableStages: false,
                    hasExpiredStages: false,
                    paramsMet: true,
                    hasActions: true,
                    canExecuteEarly: true,
                    [param]: false,
                });
                expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.ACTIVE);
            },
        );

        it('returns REJECTED when proposal has ended and params are not met', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                endDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: false,
                paramsMet: false,
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.REJECTED);
        });

        it('returns ACCEPTED when proposal has ended, params are met and proposal has no actions', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                endDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: false,
                paramsMet: true,
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.ACCEPTED);
        });

        it('returns EXPIRED when proposal has ended, params are met but execution is expired', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                endDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: false,
                paramsMet: true,
                hasActions: true,
                executionExpiryDate: DateTime.fromISO(now).minus({ minutes: 30 }).toSeconds(),
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.EXPIRED);
        });

        it('returns EXECUTABLE when proposal has ended, params are met and execution is not expired', () => {
            const now = '2023-10-15T12:44:23';
            timeUtils.setTime(now);
            const params = generateTestParams({
                isExecuted: false,
                isVetoed: false,
                startDate: DateTime.fromISO(now).minus({ days: 1 }).toSeconds(),
                endDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
                hasAdvanceableStages: false,
                hasExpiredStages: false,
                paramsMet: true,
                hasActions: true,
                executionExpiryDate: DateTime.fromISO(now).plus({ minutes: 30 }).toSeconds(),
            });
            expect(proposalStatusUtils.getProposalStatus(params)).toEqual(ProposalStatus.EXECUTABLE);
        });
    });

    describe('endsInTheFuture', () => {
        it('returns true when endDate is not defined', () => {
            const endDate = undefined;
            expect(proposalStatusUtils.endsInTheFuture(endDate)).toBeTruthy();
        });

        it('returns true when end date is in the future', () => {
            const now = '2025-05-05T11:00:00';
            const endDate = DateTime.fromISO('2025-05-06T09:00:00').toSeconds();
            timeUtils.setTime(now);
            expect(proposalStatusUtils.endsInTheFuture(endDate)).toBeTruthy();
        });

        it('returns false when end date is not in the future', () => {
            const now = '2024-22-01T08:00:00';
            const endDate = DateTime.fromISO('2024-10-08T09:00:00').toSeconds();
            timeUtils.setTime(now);
            expect(proposalStatusUtils.endsInTheFuture(endDate)).toBeFalsy();
        });
    });
});
