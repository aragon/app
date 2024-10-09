import { DateTime } from 'luxon';
import { generateSppProposal, generateSppStage, generateSppStagePlugin, generateSppSubProposal } from '../testUtils';
import { SppProposalType, SppStageStatus } from '../types';
import { sppStageUtils } from './sppStageUtils';

describe('SppStageUtils', () => {
    describe('getStageStartDate', () => {
        it('should return startDate for the first stage', () => {
            const startDate = DateTime.now().minus({ days: 1 }).toSeconds();
            const proposal = generateSppProposal({ startDate, currentStageIndex: 0 });
            const result = sppStageUtils.getStageStartDate(proposal);
            expect(result.toSeconds()).toBe(startDate);
        });

        it('should return lastStageTransition for subsequent stages', () => {
            const lastStageTransition = DateTime.now().minus({ hours: 2 }).toSeconds();
            const proposal = generateSppProposal({ lastStageTransition, currentStageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal);
            expect(result.toSeconds()).toBe(lastStageTransition);
        });
    });

    describe('getStageEndDate', () => {
        it('should return correct end date based on votingPeriod', () => {
            const startDate = DateTime.now().toSeconds();
            const proposal = generateSppProposal({ startDate });
            const stage = generateSppStage({ votingPeriod: 86400 });
            const result = sppStageUtils.getStageEndDate(proposal, stage);
            expect(result.toSeconds()).toBe(startDate + 86400);
        });
    });

    describe('isVetoReached', () => {
        it('should return true when veto count reaches threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                vetoThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isVetoReached(proposal, stage)).toBe(true);
        });

        it('should return false when veto count is below threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                vetoThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isVetoReached(proposal, stage)).toBe(false);
        });
    });

    describe('isApprovalReached', () => {
        it('should return true when approval count reaches threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                approvalThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBe(true);
        });

        it('should return false when approval count is below threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBe(false);
        });
    });

    describe('canStageAdvance', () => {
        it('should return true when all conditions are met', () => {
            const now = DateTime.now();
            const stage = generateSppStage({
                id: 'stage-1',
                minAdvance: 3600,
                maxAdvance: 86400,
                approvalThreshold: 1,
                vetoThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 2 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBe(true);
        });

        it('should return false when outside time window', () => {
            const now = DateTime.now();
            const stage = generateSppStage({
                id: 'stage-1',
                minAdvance: 3600,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 3 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBe(false);
        });
    });

    describe('getCount', () => {
        it('should return correct veto and approval counts', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin3', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin4', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin3', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin4', result: true }),
                ],
            });
            expect(sppStageUtils.getCount(proposal, stage, SppProposalType.VETO)).toBe(1);
            expect(sppStageUtils.getCount(proposal, stage, SppProposalType.APPROVAL)).toBe(2);
        });

        it('should return 0 when no matching subProposals are found', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin3', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin4', result: true }),
                ],
            });
            expect(sppStageUtils.getCount(proposal, stage, SppProposalType.VETO)).toBe(0);
            expect(sppStageUtils.getCount(proposal, stage, SppProposalType.APPROVAL)).toBe(0);
        });
    });

    describe('getStageStatus', () => {
        const now = DateTime.now();

        it('should return vetoed when stage is vetoed', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                vetoThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 1 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.VETOED);
        });

        it('should return pending when stage start date is in the future', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal({
                startDate: now.plus({ hours: 1 }).toSeconds(),
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.PENDING);
        });

        it('should return pending when current stage index is less than the stage index', () => {
            const stage1 = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const stage2 = generateSppStage({
                id: 'stage-2',
                votingPeriod: 3600,
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ minutes: 30 }).toSeconds(),
                currentStageIndex: 0,
                settings: { stages: [stage1, stage2] },
                subProposals: [
                    generateSppSubProposal({
                        stageId: 'stage-1',
                        pluginAddress: 'plugin1',
                        result: false,
                    }),
                ],
            });

            expect(sppStageUtils.getStageStatus(proposal, stage1)).toBe(SppStageStatus.ACTIVE);
            expect(sppStageUtils.getStageStatus(proposal, stage2)).toBe(SppStageStatus.PENDING);
        });

        it('should return rejected when approval threshold is not met and stage end date has passed', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 2 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.REJECTED);
        });

        it('should return active when approval is reached but min advance is in the future', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                minAdvance: 3600,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ minutes: 30 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', result: true })],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.ACTIVE);
        });

        it('should return accepted when approval is reached and stage can advance', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                minAdvance: 1800,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ minutes: 45 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.ACCEPTED);
        });

        it('should return expired when past max advance date and approved', () => {
            const now = DateTime.now();
            const stage = generateSppStage({
                votingPeriod: 3600,
                maxAdvance: 7200,
                approvalThreshold: 0,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 6 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: true }),
                ],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.EXPIRED);
        });

        it('should return inactive for an unreached stage when the previous stage is rejected', () => {
            const stage1 = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });

            const stage2 = generateSppStage({
                id: 'stage-2',
                votingPeriod: 3600,
                plugins: [generateSppStagePlugin({ address: 'plugin3', proposalType: SppProposalType.APPROVAL })],
            });

            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 2 }).toSeconds(),
                currentStageIndex: 0,
                settings: { stages: [stage1, stage2] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: false }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });

            expect(sppStageUtils.getStageStatus(proposal, stage2)).toBe(SppStageStatus.INACTIVE);
        });

        it('should return active when stage has started but not ended and approval not reached', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ minutes: 30 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.ACTIVE);
        });
    });
});
