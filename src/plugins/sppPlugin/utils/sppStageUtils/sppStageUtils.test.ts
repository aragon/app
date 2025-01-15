import { generateProposalAction } from '@/modules/governance/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
    generateSppSubProposal,
} from '../../testUtils';
import { SppProposalType } from '../../types';
import { sppStageUtils } from './sppStageUtils';

describe('SppStageUtils', () => {
    const getSlotFunctionSpy = jest.spyOn(pluginRegistryUtils, 'getSlotFunction');

    afterEach(() => {
        getSlotFunctionSpy.mockReset();
    });

    describe('getStageStartDate', () => {
        it('returns main-proposal startDate for the first stage', () => {
            const startDate = DateTime.fromISO('2022-02-10T07:55:55.868Z').toSeconds();
            const proposal = generateSppProposal({ startDate, stageIndex: 1 });
            const stage = generateSppStage({ stageIndex: 0 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(startDate);
        });

        it('returns lastStageTransition for current stage', () => {
            const lastStageTransition = DateTime.fromISO('2022-02-10T07:55:55.868Z').toSeconds();
            const proposal = generateSppProposal({ lastStageTransition, stageIndex: 1 });
            const stage = generateSppStage({ stageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(lastStageTransition);
        });

        it('returns the linked subProposal startDate for previous stages', () => {
            const subProposalStartDate = DateTime.fromISO('2016-05-25T09:08:34.123').toSeconds();
            const proposal = generateSppProposal({
                stageIndex: 2,
                subProposals: [generateSppSubProposal({ stageIndex: 1, startDate: subProposalStartDate })],
            });
            const stage = generateSppStage({ stageIndex: 1 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result?.toSeconds()).toBe(subProposalStartDate);
        });

        it('returns undefined for other stages', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const lastStageTransition = DateTime.fromISO(now).minus({ hours: 2 }).toSeconds();
            const proposal = generateSppProposal({ lastStageTransition, stageIndex: 1 });
            const stage = generateSppStage({ stageIndex: 2 });
            const result = sppStageUtils.getStageStartDate(proposal, stage);
            expect(result).toBe(undefined);
        });
    });

    describe('getStageEndDate', () => {
        it('returns correct end date based on voteDuration', () => {
            const now = '2022-02-10T07:55:55.868Z';
            const startDate = DateTime.fromISO(now).toSeconds();
            const proposal = generateSppProposal({ startDate });
            const stage = generateSppStage({ voteDuration: 86400 });
            const result = sppStageUtils.getStageEndDate(proposal, stage);
            expect(result?.toSeconds()).toBe(startDate + 86400);
        });
    });

    describe('getStageMaxAdvance', () => {
        const getStartStartDateSpy = jest.spyOn(sppStageUtils, 'getStageStartDate');

        afterEach(() => {
            getStartStartDateSpy.mockReset();
        });

        it('returns the max-advance time based on the proposal start date', () => {
            const startDate = DateTime.fromISO('2016-05-25T09:08:34.123');
            const proposal = generateSppProposal();
            const stage = generateSppStage({ maxAdvance: 300 });
            const expectedValue = startDate.plus({ seconds: stage.maxAdvance });
            getStartStartDateSpy.mockReturnValue(startDate);
            expect(sppStageUtils.getStageMaxAdvance(proposal, stage)).toEqual(expectedValue);
        });
    });

    describe('getStageMinAdvance', () => {
        const getStartStartDateSpy = jest.spyOn(sppStageUtils, 'getStageStartDate');

        afterEach(() => {
            getStartStartDateSpy.mockReset();
        });

        it('returns the min-advance time based on the proposal start date', () => {
            const startDate = DateTime.fromISO('2016-05-25T09:08:34.123');
            const proposal = generateSppProposal();
            const stage = generateSppStage({ minAdvance: 300 });
            const expectedValue = startDate.plus({ seconds: stage.minAdvance });
            getStartStartDateSpy.mockReturnValue(startDate);
            expect(sppStageUtils.getStageMinAdvance(proposal, stage)).toEqual(expectedValue);
        });
    });

    describe('isVetoReached', () => {
        it('returns true when veto count reaches threshold', () => {
            const stage = generateSppStage({
                stageIndex: 0,
                vetoThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin2', result: false }),
                ],
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeTruthy();
        });

        it('returns false when veto count is below threshold', () => {
            const stage = generateSppStage({
                stageIndex: 0,
                vetoThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.VETO }),
                ],
            });

            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin2', result: false }),
                ],
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });

        it('returns false when veto threshold is set to 0', () => {
            const stage = generateSppStage({
                stageIndex: 0,
                vetoThreshold: 0,
                plugins: [generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.VETO })],
            });

            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin1', result: false })],
            });

            expect(sppStageUtils.isVetoReached(proposal, stage)).toBeFalsy();
        });
    });

    describe('isApprovalReached', () => {
        it('returns true when approval count reaches threshold', () => {
            const stage = generateSppStage({
                stageIndex: 0,
                approvalThreshold: 1,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBeTruthy();
        });

        it('returns false when approval count is below threshold', () => {
            const stage = generateSppStage({
                stageIndex: 0,
                approvalThreshold: 2,
                plugins: [
                    generateSppStagePlugin({ address: 'plugin1', proposalType: SppProposalType.APPROVAL }),
                    generateSppStagePlugin({ address: 'plugin2', proposalType: SppProposalType.APPROVAL }),
                ],
            });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [stage] }),
                subProposals: [
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin1', result: true }),
                    generateSppSubProposal({ stageIndex: 0, pluginAddress: 'plugin2', result: false }),
                ],
            });
            expect(sppStageUtils.isApprovalReached(proposal, stage)).toBeFalsy();
        });
    });

    describe('getSuccessThreshold', () => {
        it('returns correct success threshold when getSucceededStatus is null and subProposal result is true', () => {
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                subProposals: [generateSppSubProposal({ stageIndex: 0, result: true })],
            });

            getSlotFunctionSpy.mockReturnValue(undefined);
            const result = sppStageUtils.getSuccessThreshold(proposal, stage);
            expect(result).toBe(1);
        });

        it('returns correct success threshold when getSucceededStatus is unsupported and subProposal result is false', () => {
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                subProposals: [generateSppSubProposal({ stageIndex: 0, result: false })],
            });

            getSlotFunctionSpy.mockReturnValue(undefined);
            const result = sppStageUtils.getSuccessThreshold(proposal, stage);
            expect(result).toBe(0);
        });

        it('returns correct success threshold when getSucceededStatus is not passing and subProposal result is true', () => {
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                subProposals: [generateSppSubProposal({ stageIndex: 0, result: true })],
            });

            getSlotFunctionSpy.mockReturnValue(() => false);
            const result = sppStageUtils.getSuccessThreshold(proposal, stage);
            expect(result).toBe(0);
        });

        it('returns correct success threshold when getSucceededStatus is passing and subProposal result is true', () => {
            const stage = generateSppStage({ stageIndex: 0 });
            const proposal = generateSppProposal({
                subProposals: [generateSppSubProposal({ stageIndex: 0, result: true })],
            });

            getSlotFunctionSpy.mockReturnValue(() => true);
            const result = sppStageUtils.getSuccessThreshold(proposal, stage);
            expect(result).toBe(1);
        });
    });

    describe('getStageStatus', () => {
        const isVetoReachedSpy = jest.spyOn(sppStageUtils, 'isVetoReached');
        const isStageUnreachedSpy = jest.spyOn(sppStageUtils, 'isStageUnreached');
        const getStageStartDateSpy = jest.spyOn(sppStageUtils, 'getStageStartDate');
        const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
        const getStageMaxAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMaxAdvance');
        const isApprovalReachedSpy = jest.spyOn(sppStageUtils, 'isApprovalReached');

        afterEach(() => {
            isVetoReachedSpy.mockReset();
            isStageUnreachedSpy.mockReset();
            getStageStartDateSpy.mockReset();
            getStageEndDateSpy.mockReset();
            getStageMaxAdvanceSpy.mockReset();
            isApprovalReachedSpy.mockReset();
        });

        it('returns vetoed when one of the stage has been vetoed', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isVetoReachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toEqual(ProposalVotingStatus.VETOED);
        });

        it('returns unreached is current stage cannot be reached', () => {
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isStageUnreachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toEqual(ProposalVotingStatus.UNREACHED);
        });

        it('returns pending when stage start date is in the future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ hours: 1 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            getStageStartDateSpy.mockReturnValue(startDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.PENDING);
        });

        it('returns pending when stage index is greater than current stage index and start-date cannot be processed', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({ stageIndex: 0 });
            getStageStartDateSpy.mockReturnValue(undefined);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.PENDING);
        });

        it('returns active when stage has not ended yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).plus({ hours: 1 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            getStageEndDateSpy.mockReturnValue(endDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns active when stage has not ended yet, approval has been reached and proposal has no actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).plus({ days: 7 });
            const stage = generateSppStage();
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({ actions: [], settings });
            getStageEndDateSpy.mockReturnValue(endDate);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns accepted when stage has not ended yet, approval has been reached, proposal has actions and can be advanced', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 });
            const minAdvance = 5 * 60 * 60; // 5 hours
            const endDate = DateTime.fromISO(now).plus({ days: 7 });
            const stage = generateSppStage({ minAdvance });
            const proposal = generateSppProposal({ actions: [generateProposalAction()] });
            getStageStartDateSpy.mockReturnValue(startDate);
            getStageEndDateSpy.mockReturnValue(endDate);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns expired when stage has ended, approval is reached, max advance date has passed and proposal has actions', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 2 });
            const stage = generateSppStage();
            const proposal = generateSppProposal({ actions: [generateProposalAction()] });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.EXPIRED);
        });

        it('returns accepted when stage has ended, approval is reached, max advance date has passed and stage has already been advanced', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const stage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({ stageIndex: 2, settings });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns accepted when stage has ended, approval is reached, max advance date has passed but proposal has no actions and stage is last stage', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const maxAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const stage = generateSppStage();
            const settings = generateSppPluginSettings({ stages: [stage] });
            const proposal = generateSppProposal({ actions: [], settings });
            getStageEndDateSpy.mockReturnValue(endDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvance);
            isApprovalReachedSpy.mockReturnValue(true);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns rejected when stage has ended and approval is not reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const endDate = DateTime.fromISO(now).minus({ days: 3 });
            const stage = generateSppStage();
            const proposal = generateSppProposal();
            isApprovalReachedSpy.mockReturnValue(false);
            getStageEndDateSpy.mockReturnValue(endDate);
            timeUtils.setTime(now);
            expect(sppStageUtils.getStageStatus(proposal, stage)).toBe(ProposalStatus.REJECTED);
        });
    });

    describe('isVeto', () => {
        it('returns true when stage veto threshold is > 0', () => {
            const stage = generateSppStage({ vetoThreshold: 1 });
            expect(sppStageUtils.isVeto(stage)).toBeTruthy();
        });

        it('returns false when veto threshold is 0', () => {
            const stage = generateSppStage({ vetoThreshold: 0 });
            expect(sppStageUtils.isVeto(stage)).toBeFalsy();
        });
    });

    describe('isLastStage', () => {
        it('returns true for the last stage of the proposal', () => {
            const stage = generateSppStage({ stageIndex: 2 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 }), stage],
                }),
            });

            expect(sppStageUtils.isLastStage(proposal, stage)).toBeTruthy();
        });

        it('returns false for non-final stages of the proposal', () => {
            const stage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [generateSppStage({ stageIndex: 0 }), stage, generateSppStage({ stageIndex: 2 })],
                }),
            });

            expect(sppStageUtils.isLastStage(proposal, stage)).toBeFalsy();
        });
    });
});
