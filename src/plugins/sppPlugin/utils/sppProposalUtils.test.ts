import { generateProposalActionUpdateMetadata } from '@/modules/governance/testUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { generateSppProposal, generateSppStage } from '../testUtils';
import { sppProposalUtils } from './sppProposalUtils';
import { sppStageUtils } from './sppStageUtils';

const actionBaseValues = { data: '0x123456', to: '0x000', value: '0' };

describe('SppProposalUtils', () => {
    describe('getProposalStatus', () => {
        it('returns executed when proposal is executed', () => {
            const proposal = generateSppProposal({
                executed: { status: true },
            });
            const result = sppProposalUtils.getProposalStatus(proposal);
            expect(result).toBe(ProposalStatus.EXECUTED);
        });

        it('returns vetoed when any stage is vetoed', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const isVetoReachedSpy = jest
                .spyOn(sppStageUtils, 'isVetoReached')
                .mockImplementation((_, stage) => stage.id === 'stage-2');

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.VETOED);

            isVetoReachedSpy.mockRestore();
        });

        it('returns pending when proposal has not started yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();

            const proposal = generateSppProposal({
                startDate,
            });

            timeUtils.setTime(now);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.PENDING);
        });

        it('returns active when current stage is active and ends in future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
            });

            timeUtils.setTime(now);

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.ACTIVE);
            const endsInFutureSpy = jest.spyOn(sppProposalUtils, 'endsInFuture').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.ACTIVE);

            getStageStatusSpy.mockRestore();
            endsInFutureSpy.mockRestore();
        });

        it('returns executable when all stages are accepted, has actions, and ends in future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1', maxAdvance: 36000 });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.ACCEPTED);

            const endsInFutureSpy = jest.spyOn(sppProposalUtils, 'endsInFuture').mockReturnValue(true);

            timeUtils.setTime(now);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXECUTABLE);

            getStageStatusSpy.mockRestore();
            endsInFutureSpy.mockRestore();
        });

        it('returns rejected when current stage is rejected', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();
            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
            });

            timeUtils.setTime(now);

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.REJECTED);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.REJECTED);

            getStageStatusSpy.mockRestore();
        });

        it('returns accepted when all stages are accepted and has no actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
            });

            timeUtils.setTime(now);

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.ACCEPTED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.ACCEPTED);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
        });

        it('returns expired when proposal is accepted, has actions, and execution expired', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
                executed: { status: false },
            });

            timeUtils.setTime(now);

            const hasAnyStageStatusExpiredSpy = jest
                .spyOn(sppProposalUtils, 'hasAnyStageStatus')
                .mockImplementation((_, status) => {
                    if (status === ProposalStatus.EXPIRED) {
                        return true;
                    }

                    return false;
                });

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXPIRED);

            hasAnyStageStatusExpiredSpy.mockRestore();
        });

        it('returns executable when proposal is accepted, has actions, and execution not expired', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            timeUtils.setTime(now);

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.ACCEPTED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);

            const hasAnyStageStatusExpiredSpy = jest
                .spyOn(sppProposalUtils, 'hasAnyStageStatus')
                .mockReturnValue(false);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXECUTABLE);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
            hasAnyStageStatusExpiredSpy.mockRestore();
        });

        it('returns rejected when none of the conditions are met', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            timeUtils.setTime(now);

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalVotingStatus.UNREACHED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(false);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.REJECTED);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
        });
    });

    describe('endsInFuture', () => {
        it('returns true when proposal is not in the last stage', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 0,
            });

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBeTruthy();
        });

        it('returns true when in last stage and stageEndDate > now', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
            });

            const getStageEndDateSpy = jest
                .spyOn(sppStageUtils, 'getStageEndDate')
                .mockReturnValue(DateTime.fromISO(now).plus({ hours: 1 }));

            timeUtils.setTime(now);

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBeTruthy();

            getStageEndDateSpy.mockRestore();
        });

        it('returns false when in last stage and stageEndDate <= now', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate,
            });

            const getStageEndDateSpy = jest
                .spyOn(sppStageUtils, 'getStageEndDate')
                .mockReturnValue(DateTime.fromISO(now).minus({ hours: 1 }));

            timeUtils.setTime(now);

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBeFalsy();

            getStageEndDateSpy.mockRestore();
        });
    });

    describe('hasAnyStageVetoed', () => {
        it('returns true when any stage is vetoed', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const isVetoReachedSpy = jest
                .spyOn(sppStageUtils, 'isVetoReached')
                .mockImplementation((_, stage) => stage.id === 'stage-2');

            const result = sppProposalUtils.hasAnyStageStatus(proposal, ProposalStatus.VETOED);

            expect(result).toBeTruthy();

            isVetoReachedSpy.mockRestore();
        });

        it('returns false when no stages are vetoed', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const isVetoReachedSpy = jest.spyOn(sppStageUtils, 'isVetoReached').mockReturnValue(false);

            const result = sppProposalUtils.hasAnyStageStatus(proposal, ProposalStatus.VETOED);

            expect(result).toBeFalsy();

            isVetoReachedSpy.mockRestore();
        });
    });

    describe('getCurrentStage', () => {
        it('returns the current stage', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
            });

            const result = sppProposalUtils.getCurrentStage(proposal);

            expect(result).toBe(stage2);
        });
    });

    describe('areAllStagesAccepted', () => {
        it('returns true when all stages are accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(ProposalStatus.ACCEPTED);

            const result = sppProposalUtils.areAllStagesAccepted(proposal);

            expect(result).toBeTruthy();

            getStageStatusSpy.mockRestore();
        });

        it('returns false when any stage is not accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockImplementation((_, stage) =>
                    stage.id === 'stage-1' ? ProposalStatus.ACCEPTED : ProposalStatus.REJECTED,
                );

            const result = sppProposalUtils.areAllStagesAccepted(proposal);

            expect(result).toBeFalsy();

            getStageStatusSpy.mockRestore();
        });
    });

    describe('hasAnyStageExpired', () => {
        const now = '2023-01-01T12:00:00.000Z';
        it('returns false when not all stages are accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: DateTime.fromISO(now).minus({ hours: 3 }).toSeconds(),
            });

            timeUtils.setTime(now);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(false);

            const result = sppProposalUtils.hasAnyStageStatus(proposal, ProposalStatus.EXPIRED);

            expect(result).toBeFalsy();

            areAllStagesAcceptedSpy.mockRestore();
        });

        it('returns true when all stages are accepted and last stage execution window has passed', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: DateTime.fromISO(now).minus({ hours: 5 }).toSeconds(),
            });

            timeUtils.setTime(now);

            const stageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus').mockImplementation((_, stage) => {
                if (stage.id === 'stage-2') {
                    return ProposalStatus.EXPIRED;
                }

                return ProposalStatus.ACCEPTED;
            });

            const result = sppProposalUtils.hasAnyStageStatus(proposal, ProposalStatus.EXPIRED);

            expect(result).toBeTruthy();

            stageStatusSpy.mockRestore();
        });

        it('returns false when all stages are accepted and last stage execution window has not passed', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
            });

            timeUtils.setTime(now);

            const stageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus').mockImplementation((_, stage) => {
                if (stage.id === 'stage-2') {
                    return ProposalStatus.ACTIVE;
                }

                return ProposalStatus.ACCEPTED;
            });

            const result = sppProposalUtils.hasAnyStageStatus(proposal, ProposalStatus.EXPIRED);

            expect(result).toBeFalsy();

            stageStatusSpy.mockRestore();
        });
    });
});
