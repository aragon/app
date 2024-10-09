import { generateProposalActionUpdateMetadata } from '@/modules/governance/testUtils';
import { ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { generateSppProposal, generateSppStage } from '../testUtils';
import { SppStageStatus } from '../types';
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
            const startDate = DateTime.now().plus({ days: 1 }).toSeconds();

            const proposal = generateSppProposal({
                startDate,
            });

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.PENDING);
        });

        it('returns active when current stage is active and ends in future', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACTIVE);
            const endsInFutureSpy = jest.spyOn(sppProposalUtils, 'endsInFuture').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.ACTIVE);

            getStageStatusSpy.mockRestore();
            endsInFutureSpy.mockRestore();
        });

        it('returns executable when all stages are accepted, has actions, and ends in future', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1', maxAdvance: 36000 });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACCEPTED);

            const endsInFutureSpy = jest.spyOn(sppProposalUtils, 'endsInFuture').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXECUTABLE);

            getStageStatusSpy.mockRestore();
            endsInFutureSpy.mockRestore();
        });

        it('returns rejected when current stage is rejected', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.REJECTED);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.REJECTED);

            getStageStatusSpy.mockRestore();
        });

        it('returns accepted when all stages are accepted and has no actions', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACCEPTED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.ACCEPTED);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
        });

        it('returns expired when proposal is accepted, has actions, and execution expired', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACCEPTED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);

            const isExecutionExpiredSpy = jest.spyOn(sppProposalUtils, 'isExecutionExpired').mockReturnValue(true);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXPIRED);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
            isExecutionExpiredSpy.mockRestore();
        });

        it('returns executable when proposal is accepted, has actions, and execution not expired', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACCEPTED);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);

            const isExecutionExpiredSpy = jest.spyOn(sppProposalUtils, 'isExecutionExpired').mockReturnValue(false);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.EXECUTABLE);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
            isExecutionExpiredSpy.mockRestore();
        });

        it('returns rejected when none of the conditions are met', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
                actions: [{ ...generateProposalActionUpdateMetadata(actionBaseValues) }],
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.INACTIVE);

            const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(false);

            const result = sppProposalUtils.getProposalStatus(proposal);

            expect(result).toBe(ProposalStatus.REJECTED);

            getStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
        });
    });

    describe('endsInFuture', () => {
        it('should return true when proposal is not in the last stage', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 0,
            });

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBe(true);
        });

        it('should return true when in last stage and stageEndDate > now', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 1 }).toSeconds(),
            });

            const getStageEndDateSpy = jest
                .spyOn(sppStageUtils, 'getStageEndDate')
                .mockReturnValue(now.plus({ hours: 1 }));

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBe(true);

            getStageEndDateSpy.mockRestore();
        });

        it('should return false when in last stage and stageEndDate <= now', () => {
            const now = DateTime.now();

            const stage = generateSppStage({ id: 'stage-1' });

            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                currentStageIndex: 0,
                startDate: now.minus({ hours: 2 }).toSeconds(),
            });

            const getStageEndDateSpy = jest
                .spyOn(sppStageUtils, 'getStageEndDate')
                .mockReturnValue(now.minus({ hours: 1 }));

            const result = sppProposalUtils.endsInFuture(proposal);

            expect(result).toBe(false);

            getStageEndDateSpy.mockRestore();
        });
    });

    describe('isAnyStageVetoed', () => {
        it('should return true when any stage is vetoed', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const isVetoReachedSpy = jest
                .spyOn(sppStageUtils, 'isVetoReached')
                .mockImplementation((_, stage) => stage.id === 'stage-2');

            const result = sppProposalUtils.isAnyStageVetoed(proposal);

            expect(result).toBe(true);

            isVetoReachedSpy.mockRestore();
        });

        it('should return false when no stages are vetoed', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const isVetoReachedSpy = jest.spyOn(sppStageUtils, 'isVetoReached').mockReturnValue(false);

            const result = sppProposalUtils.isAnyStageVetoed(proposal);

            expect(result).toBe(false);

            isVetoReachedSpy.mockRestore();
        });
    });

    describe('getCurrentStage', () => {
        it('should return the current stage', () => {
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
        it('should return true when all stages are accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockReturnValue(SppStageStatus.ACCEPTED);

            const result = sppProposalUtils.areAllStagesAccepted(proposal);

            expect(result).toBe(true);

            getStageStatusSpy.mockRestore();
        });

        it('should return false when any stage is not accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1' });
            const stage2 = generateSppStage({ id: 'stage-2' });

            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
            });

            const getStageStatusSpy = jest
                .spyOn(sppStageUtils, 'getStageStatus')
                .mockImplementation((_, stage) =>
                    stage.id === 'stage-1' ? SppStageStatus.ACCEPTED : SppStageStatus.REJECTED,
                );

            const result = sppProposalUtils.areAllStagesAccepted(proposal);

            expect(result).toBe(false);

            getStageStatusSpy.mockRestore();
        });
    });

    describe('isExecutionExpired', () => {
        const now = DateTime.now();

        it('should return false when not all stages are accepted', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: now.minus({ hours: 3 }).toSeconds(),
            });

            jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(false);

            const result = sppProposalUtils.isExecutionExpired(proposal);

            expect(result).toBe(false);
        });

        it('should return true when all stages are accepted and last stage execution window has passed', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: now.minus({ hours: 5 }).toSeconds(),
            });

            jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);
            jest.spyOn(sppStageUtils, 'getStageEndDate').mockReturnValue(now.minus({ hours: 2 }));

            const result = sppProposalUtils.isExecutionExpired(proposal);

            expect(result).toBe(true);
        });

        it('should return false when all stages are accepted and last stage execution window has not passed', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: 3600 });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: now.minus({ hours: 1 }).toSeconds(),
            });

            jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);
            jest.spyOn(sppStageUtils, 'getStageEndDate').mockReturnValue(now.plus({ minutes: 30 }));

            const result = sppProposalUtils.isExecutionExpired(proposal);

            expect(result).toBe(false);
        });

        it('should return false when all stages are accepted but last stage has no maxAdvance', () => {
            const stage1 = generateSppStage({ id: 'stage-1', maxAdvance: 3600 });
            const stage2 = generateSppStage({ id: 'stage-2', maxAdvance: undefined });
            const proposal = generateSppProposal({
                settings: { stages: [stage1, stage2] },
                currentStageIndex: 1,
                startDate: now.minus({ hours: 5 }).toSeconds(),
            });

            jest.spyOn(sppProposalUtils, 'areAllStagesAccepted').mockReturnValue(true);
            jest.spyOn(sppStageUtils, 'getStageEndDate').mockReturnValue(now.minus({ hours: 2 }));

            const result = sppProposalUtils.isExecutionExpired(proposal);

            expect(result).toBe(false);
        });
    });
});
