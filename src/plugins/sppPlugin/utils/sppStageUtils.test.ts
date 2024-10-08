import { DateTime } from 'luxon';
import { generateSppProposal, generateSppStage, generateSppStagePlugin } from '../testUtils';
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

    describe('isProposalActive', () => {
        const isStageVetoedSpy = jest.spyOn(sppStageUtils, 'isStageVetoed');
        const isApprovalReachedSpy = jest.spyOn(sppStageUtils, 'isApprovalReached');

        beforeEach(() => {
            isStageVetoedSpy.mockReset();
            isApprovalReachedSpy.mockReset();
        });

        afterAll(() => {
            isStageVetoedSpy.mockRestore();
            isApprovalReachedSpy.mockRestore();
        });

        it('should return false for executed proposals', () => {
            const proposal = generateSppProposal({ executed: { status: true } });
            const stage = generateSppStage();
            expect(sppStageUtils.isProposalActive(proposal, stage)).toBe(false);
        });

        it('should return false for vetoed proposals', () => {
            isStageVetoedSpy.mockReturnValue(true);
            const proposal = generateSppProposal();
            const stage = generateSppStage();
            expect(sppStageUtils.isProposalActive(proposal, stage)).toBe(false);
        });

        it('should return true for active proposals', () => {
            const now = DateTime.now().toUTC();

            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 86400, // 1 day
                maxAdvance: 3600, // 1 hour
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 12 }).toSeconds(),
                currentStageIndex: 0,
                settings: { stages: [stage] },
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: false },
                    },
                },
                executed: { status: false },
            });

            isStageVetoedSpy.mockReturnValue(false);
            isApprovalReachedSpy.mockReturnValue(false);

            const result = sppStageUtils.isProposalActive(proposal, stage);

            expect(result).toBe(true);
        });
    });

    describe('isStageVetoed', () => {
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.VETO, result: true },
                        plugin2: { proposalType: SppProposalType.VETO, result: false },
                    },
                },
            });
            expect(sppStageUtils.isStageVetoed(proposal, stage)).toBe(true);
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.VETO, result: true },
                        plugin2: { proposalType: SppProposalType.VETO, result: false },
                    },
                },
            });
            expect(sppStageUtils.isStageVetoed(proposal, stage)).toBe(false);
        });
    });

    describe('isApprovalReached', () => {
        it('should return true when approval count reaches threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                approvalThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin2: { proposalType: SppProposalType.APPROVAL, result: false },
                    },
                },
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBe(true);
        });

        it('should return false when approval count is below threshold', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                settings: { stages: [stage] },
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin2: { proposalType: SppProposalType.APPROVAL, result: false },
                    },
                },
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBe(false);
        });
    });

    describe('canStageAdvance', () => {
        it('should return true when all conditions are met', () => {
            const now = DateTime.now().toUTC();
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin2: { proposalType: SppProposalType.VETO, result: false },
                    },
                },
            });
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBe(true);
        });

        it('should return false when outside time window', () => {
            const now = DateTime.now().toUTC();
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                    },
                },
            });
            expect(sppStageUtils.canStageAdvance(proposal, stage)).toBe(false);
        });
    });

    describe('isStageExpired', () => {
        it('should return true when current time is past maxAdvance', () => {
            const now = DateTime.now().toUTC();
            const stage = generateSppStage({ maxAdvance: 3600 });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 2 }).toSeconds(),
            });
            expect(sppStageUtils.isStageExpired(proposal, stage)).toBe(true);
        });

        it('should return false when current time is within maxAdvance', () => {
            const now = DateTime.now().toUTC();
            const stage = generateSppStage({ maxAdvance: 86400 });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 2 }).toSeconds(),
            });
            expect(sppStageUtils.isStageExpired(proposal, stage)).toBe(false);
        });
    });

    describe('getVetoCount and getApprovalCount', () => {
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.VETO, result: true },
                        plugin2: { proposalType: SppProposalType.VETO, result: false },
                        plugin3: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin4: { proposalType: SppProposalType.APPROVAL, result: true },
                    },
                },
            });
            expect(sppStageUtils.getVetoCount(proposal, stage)).toBe(1);
            expect(sppStageUtils.getApprovalCount(proposal, stage)).toBe(2);
        });
    });

    describe('getStageStatus', () => {
        const now = DateTime.now().toUTC();

        it('should return vetoed when stage is vetoed', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                vetoThreshold: 1,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO })],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 1 }).toSeconds(),
                settings: { stages: [stage] },
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.VETO, result: true },
                    },
                },
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

        it('should return rejected when approval threshold is not met and does not end in the future', () => {
            const stage = generateSppStage({
                id: 'stage-1',
                votingPeriod: 3600,
                maxAdvance: 7200,
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                startDate: now.minus({ hours: 12 }).toSeconds(),
                settings: { stages: [stage] },
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin2: { proposalType: SppProposalType.APPROVAL, result: false },
                    },
                },
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                    },
                },
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                    },
                },
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.ACCEPTED);
        });

        it('should return expired when past max advance date and approved', () => {
            const now = DateTime.now().toUTC();
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
                pluginResults: {
                    'stage-1': {
                        plugin1: { proposalType: SppProposalType.APPROVAL, result: true },
                        plugin2: { proposalType: SppProposalType.APPROVAL, result: true },
                    },
                },
            });
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(SppStageStatus.EXPIRED);
        });
    });
});
