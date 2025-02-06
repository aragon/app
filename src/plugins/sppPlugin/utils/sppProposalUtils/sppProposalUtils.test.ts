import { generateProposalAction } from '@/modules/governance/testUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateSppPluginSettings, generateSppProposal, generateSppStage } from '../../testUtils';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils/sppStageUtils';
import { sppProposalUtils } from './sppProposalUtils';

describe('SppProposalUtils', () => {
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const getStageMaxAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMaxAdvance');
    const getStageMinAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMinAdvance');
    const canStageAdvanceSpy = jest.spyOn(sppStageUtils, 'canStageAdvance');

    afterEach(() => {
        getStageStatusSpy.mockReset();
        getStageMaxAdvanceSpy.mockReset();
        getStageMinAdvanceSpy.mockReset();
        canStageAdvanceSpy.mockReset();
    });

    describe('getProposalStatus', () => {
        it('returns executed when proposal is executed', () => {
            const proposal = generateSppProposal({ executed: { status: true } });
            const result = sppProposalUtils.getProposalStatus(proposal);
            expect(result).toBe(ProposalStatus.EXECUTED);
        });

        it('returns vetoed when any stage is vetoed', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });
            getStageStatusSpy.mockImplementation((_, stage) =>
                stage.stageIndex === 0 ? ProposalVotingStatus.VETOED : ProposalVotingStatus.ACCEPTED,
            );
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.VETOED);
        });

        it('returns rejected when any stage is rejected', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });
            getStageStatusSpy.mockImplementation((_, stage) =>
                stage.stageIndex === 0 ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.REJECTED,
            );
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.REJECTED);
        });

        it('returns expired when any stage is rejected', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });
            getStageStatusSpy.mockImplementation((_, stage) =>
                stage.stageIndex === 0 ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.EXPIRED,
            );
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.EXPIRED);
        });

        it('returns executable when last stage is advanceable', () => {
            const lastStage = generateSppStage({ stageIndex: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage({ stageIndex: 0 }), lastStage] }),
            });
            canStageAdvanceSpy.mockReturnValue(true);
            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            const result = sppProposalUtils.getProposalStatus(proposal);
            expect(canStageAdvanceSpy).toHaveBeenCalledWith(proposal, lastStage);
            expect(result).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns pending when proposal has not started yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();
            const proposal = generateSppProposal({ startDate });
            timeUtils.setTime(now);
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.PENDING);
        });

        it('returns active if min advance time of last stage is not defined (last stage not reached)', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();

            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
            });
            timeUtils.setTime(now);
            getStageMinAdvanceSpy.mockReturnValue(undefined);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns active if proposal is not executable and last stage is not advanceable yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();
            const minAdvance = DateTime.fromISO(now).plus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
            });
            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns advanceable for a non-final stage which reaches approval within the advance window', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const proposal = generateSppProposal({ settings: generateSppPluginSettings({ stages }), startDate });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);

            // Mock stage-advance functionality to return true only for first stage, otherwise the last stage would
            // be set as advanceable and the proposal status as executable
            canStageAdvanceSpy.mockImplementation(
                (_proposal: ISppProposal, stage: ISppStage) => stage.stageIndex === 0,
            );

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ADVANCEABLE);
        });

        it('returns accepted if approval is reached, proposal has no actions and has ended', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
                actions: [],
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns expired if approval is reached, proposal has actions and has ended', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const minAdvance = DateTime.fromISO(now).minus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
                actions: [generateProposalAction()],
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            getStageMinAdvanceSpy.mockReturnValue(minAdvance);
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.EXPIRED);
        });
    });

    describe('getCurrentStage', () => {
        it('returns the current stage', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings, stageIndex: 1 });
            expect(sppProposalUtils.getCurrentStage(proposal)).toBe(stages[1]);
        });
    });

    describe('areAllStagesAccepted', () => {
        it('returns true when all stages are accepted', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });
            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            expect(sppProposalUtils.areAllStagesAccepted(proposal)).toBeTruthy();
        });

        it('returns false if a stage is not accepted', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });

            getStageStatusSpy.mockImplementation((_, stage) =>
                stage.stageIndex === 0 ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.REJECTED,
            );

            expect(sppProposalUtils.areAllStagesAccepted(proposal)).toBeFalsy();
        });
    });
});
