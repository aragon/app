import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateSppProposal, generateSppStage, generateSppStagePlugin, generateSppSubProposal } from '../../testUtils';
import { SppProposalType } from '../../types';
import { sppStageUtils } from './sppStageUtils';

describe('SppStageUtils', () => {
    // Add the spy at the beginning of the test file
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getStageStartDate', () => {
        it('returns startDate for the first stage', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();
            const proposal = generateSppProposal({ startDate, currentStageIndex: 0 });
            const result = sppStageUtils.getStageStartDate(proposal);
            expect(result.toSeconds()).toBe(startDate);
        });

        it('returns lastStageTransition for subsequent stages', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const lastStageTransition = DateTime.fromISO(now).minus({ hours: 2 }).toSeconds();
            const proposal = generateSppProposal({ lastStageTransition, currentStageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal);
            expect(result.toSeconds()).toBe(lastStageTransition);
        });
    });

    describe('getStageEndDate', () => {
        it('returns correct end date based on votingPeriod', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO(now).toSeconds();
            const proposal = generateSppProposal({ startDate });
            const stage = generateSppStage({ votingPeriod: 86400 });
            const result = sppStageUtils.getStageEndDate(proposal, stage);
            expect(result.toSeconds()).toBe(startDate + 86400);
        });
    });

    describe('isVetoReached', () => {
        it('returns true when veto count reaches threshold', () => {
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
            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeTruthy();
        });

        it('returns false when veto count is below threshold', () => {
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
            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });
    });

    describe('isApprovalReached', () => {
        it('returns true when approval count reaches threshold', () => {
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
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBeTruthy();
        });

        it('returns false when approval count is below threshold', () => {
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
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBeFalsy();
        });
    });

    describe('canStageAdvance', () => {
        it('returns true when all conditions are met', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 2 }).toSeconds();
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
                startDate,
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeTruthy();
        });

        it('returns false when outside time window', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 3 }).toSeconds();
            const stage = generateSppStage({
                id: 'stage-1',
                minAdvance: 3600,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate,
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBeFalsy();
        });
    });

    describe('getCount', () => {
        it('returns correct veto and approval counts', () => {
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

        it('returns 0 when no matching subProposals are found', () => {
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

        it('uses slot function when available', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({
                        stageId: 'stage-1',
                        pluginAddress: 'plugin1',
                        pluginSubdomain: 'test-plugin',
                        result: false,
                    }),
                ],
            });

            const mockStatusFunction = jest.fn(() => ProposalStatus.ACCEPTED);
            getSlotFunctionSpy.mockReturnValue(mockStatusFunction);

            const count = sppStageUtils.getCount(proposal, stage, SppProposalType.APPROVAL);

            expect(
                pluginRegistryUtils.getSlotFunction({
                    slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                    pluginId: 'test-plugin',
                }),
            ).toEqual(mockStatusFunction);

            expect(mockStatusFunction).toHaveBeenCalledWith(proposal.subProposals[0]);
            expect(count).toBe(1);
        });

        it('uses result as a fallback when no slot is available', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });

            getSlotFunctionSpy.mockReturnValue(undefined);

            const count = sppStageUtils.getCount(proposal, stage, SppProposalType.APPROVAL);

            expect(count).toBe(1);
        });

        it('does not count sub-proposals with REJECTED or PENDING status even when result is true', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({
                        stageId: 'stage-1',
                        pluginAddress: 'plugin1',
                        pluginSubdomain: 'test-plugin1',
                        result: true,
                    }),
                    generateSppSubProposal({
                        stageId: 'stage-1',
                        pluginAddress: 'plugin2',
                        pluginSubdomain: 'test-plugin2',
                        result: true,
                    }),
                ],
            });

            const mockRejectedStatusFunction = jest.fn().mockReturnValue(ProposalStatus.REJECTED);
            const mockPendingStatusFunction = jest.fn().mockReturnValue(ProposalStatus.PENDING);

            getSlotFunctionSpy
                .mockReturnValueOnce(mockRejectedStatusFunction)
                .mockReturnValueOnce(mockPendingStatusFunction);

            const count = sppStageUtils.getCount(proposal, stage, SppProposalType.APPROVAL);

            expect(count).toBe(0);
            expect(mockRejectedStatusFunction).toHaveBeenCalledWith(proposal.subProposals[0]);
            expect(mockPendingStatusFunction).toHaveBeenCalledWith(proposal.subProposals[1]);
        });
    });

    describe('getStageStatus', () => {
        const now = '2023-01-01T12:00:00.000Z';
        it('returns vetoed when stage is vetoed', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                vetoThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO })],
            });
            const proposal = generateSppProposal({
                startDate: DateTime.fromISO(now).minus({ hours: 1 }).toSeconds(),
                settings: { stages: [stage] },
            });

            const isVetoReachedSpy = jest.spyOn(sppStageUtils, 'isVetoReached');

            isVetoReachedSpy.mockReturnValue(true);

            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.VETOED);

            isVetoReachedSpy.mockRestore();
        });

        it('returns pending when stage start date is in the future', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal({
                startDate: DateTime.fromISO(now).plus({ hours: 1 }).toSeconds(),
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.PENDING);
        });

        it('returns pending when current stage index is less than the stage index', () => {
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
                startDate: DateTime.fromISO(now).minus({ minutes: 30 }).toSeconds(),
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
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage1)).toBe(ProposalStatus.ACTIVE);
            expect(sppStageUtils.getStageStatus(proposal, stage2)).toBe(ProposalStatus.PENDING);
        });

        it('returns rejected when approval threshold is not met and stage end date has passed', () => {
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
                startDate: DateTime.fromISO(now).minus({ hours: 2 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.REJECTED);
        });

        it('returns active when approval is reached but min advance is in the future', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                minAdvance: 3600,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: DateTime.fromISO(now).minus({ minutes: 30 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', result: true })],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns accepted when approval is reached and stage can advance', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                minAdvance: 1800,
                maxAdvance: 7200,
                approvalThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: DateTime.fromISO(now).minus({ minutes: 45 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true })],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns expired when past max advance date and approved', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 6 }).toSeconds();
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
                startDate,
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: true }),
                ],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.EXPIRED);
        });

        it('returns inactive for an unreached stage when the previous stage is rejected', () => {
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
                startDate: DateTime.fromISO(now).minus({ hours: 2 }).toSeconds(),
                currentStageIndex: 0,
                settings: { stages: [stage1, stage2] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: false }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage2)).toBe(ProposalVotingStatus.UNREACHED);
        });

        it('returns active when stage has started but not ended and approval not reached', () => {
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
                startDate: DateTime.fromISO(now).minus({ minutes: 30 }).toSeconds(),
                settings: { stages: [stage] },
                subProposals: [
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageId: 'stage-1', pluginAddress: 'plugin2', result: false }),
                ],
            });
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACTIVE);
        });
    });
});
