import { generateProposalAction } from '@/modules/governance/testUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateSppPluginSettings, generateSppProposal, generateSppStage } from '../../testUtils';
import { sppStageUtils } from '../sppStageUtils/sppStageUtils';
import { sppProposalUtils } from './sppProposalUtils';

describe('SppProposalUtils', () => {
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
    const getStageMaxAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMaxAdvance');
    const getStageMinAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMinAdvance');

    afterEach(() => {
        getStageStatusSpy.mockReset();
        getStageEndDateSpy.mockReset();
        getStageMaxAdvanceSpy.mockReset();
        getStageMinAdvanceSpy.mockReset();
    });

    describe('getProposalStatus', () => {
        it('returns executed when proposal is executed', () => {
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ executed: { status: true }, settings });
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

        it('returns executable when all stages are accepted, proposal has actions and execution ends in future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();
            const endExecutionDate = DateTime.fromISO(now).plus({ hours: 10 });
            const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
            const actions = [generateProposalAction()];
            const proposal = generateSppProposal({
                settings,
                startDate,
                actions,
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            getStageMaxAdvanceSpy.mockReturnValue(endExecutionDate);
            timeUtils.setTime(now);

            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns pending when proposal has not started yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();
            const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
            const proposal = generateSppProposal({ startDate, settings });
            timeUtils.setTime(now);
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.PENDING);
        });

        it('returns active if proposal endDate is not defined (last stage not reached)', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();
            const endDate = undefined;
            const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
            const proposal = generateSppProposal({
                settings,
                startDate,
            });

            timeUtils.setTime(now);
            getStageEndDateSpy.mockReturnValue(endDate);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns active if proposal is not executable and proposal ends in the future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();
            const endDate = DateTime.fromISO(now).plus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACTIVE);
            timeUtils.setTime(now);
            getStageEndDateSpy.mockReturnValue(endDate);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns accepted if approval is reached, proposal has no actions and has ended', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const endDate = DateTime.fromISO(now).minus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
                actions: [],
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            getStageEndDateSpy.mockReturnValue(endDate);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACCEPTED);
        });

        it('returns advanceable for a non-final stage which reaches approval within the advance window', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const minAdvanceDate = DateTime.fromISO(now).minus({ hours: 2 });
            const maxAdvanceDate = DateTime.fromISO(now).plus({ hours: 2 });
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const actions = [generateProposalAction()];
            const proposal = generateSppProposal({
                settings,
                startDate,
                actions,
            });

            getStageStatusSpy.mockImplementation((_, stage) => {
                return stage.stageIndex === 0 ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.ACTIVE;
            });
            timeUtils.setTime(now);
            getStageMinAdvanceSpy.mockReturnValue(minAdvanceDate);
            getStageMaxAdvanceSpy.mockReturnValue(maxAdvanceDate);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ADVANCEABLE);
        });

        it('returns expired is approval is reached, proposal has actions and has ended', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const endDate = DateTime.fromISO(now).minus({ days: 1 });
            const settings = generateSppPluginSettings({ stages: [generateSppStage()] });
            const actions = [generateProposalAction()];
            const proposal = generateSppProposal({
                settings,
                startDate,
                actions,
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            getStageEndDateSpy.mockReturnValue(endDate);

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
