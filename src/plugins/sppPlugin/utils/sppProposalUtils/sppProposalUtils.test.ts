import { generateProposalAction } from '@/modules/governance/testUtils';
import { timeUtils } from '@/test/utils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
} from '../../testUtils';
import { sppStageUtils } from '../sppStageUtils/sppStageUtils';
import { sppProposalUtils } from './sppProposalUtils';

describe('SppProposalUtils', () => {
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
    const getStageMaxAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMaxAdvance');
    const canStageAdvanceSpy = jest.spyOn(sppStageUtils, 'canStageAdvance');

    afterEach(() => {
        getStageStatusSpy.mockReset();
        getStageEndDateSpy.mockReset();
        getStageMaxAdvanceSpy.mockReset();
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

        it('returns executable when all stages are accepted, proposal has actions and execution ends in future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ hours: 1 }).toSeconds();
            const endExecutionDate = DateTime.fromISO(now).plus({ hours: 10 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({ stages: [generateSppStage()] }),
                startDate,
                actions: [{ ...generateProposalAction() }],
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            getStageMaxAdvanceSpy.mockReturnValue(endExecutionDate);
            timeUtils.setTime(now);

            expect(sppProposalUtils.getProposalStatus(proposal)).toEqual(ProposalStatus.EXECUTABLE);
        });

        it('returns pending when proposal has not started yet', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();
            const proposal = generateSppProposal({ startDate });
            timeUtils.setTime(now);
            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.PENDING);
        });

        it('returns active if last stage not reached', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();

            const proposal = generateSppProposal({
                stageIndex: 0,
                settings: generateSppPluginSettings({
                    stages: [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })],
                }),
                startDate,
            });
            timeUtils.setTime(now);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ACTIVE);
        });

        it('returns active if proposal is not executable, but final stage accepted, and proposal ends in the future', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 1 }).toSeconds();
            const minAdvance = DateTime.fromISO(now).plus({ days: 1 }).toSeconds();
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [generateSppStage({ minAdvance })],
                }),
                startDate,
            });
            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);

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
            const stages = [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({
                settings,
                startDate,
            });

            getStageStatusSpy.mockReturnValue(ProposalVotingStatus.ACCEPTED);
            timeUtils.setTime(now);
            canStageAdvanceSpy.mockReturnValue(true);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(ProposalStatus.ADVANCEABLE);
        });

        it('returns expired if approval is reached, has actions and plugins, and not executed before the max execution mark', () => {
            const now = '2023-01-01T12:00:00.000Z';
            const startDate = DateTime.fromISO(now).minus({ days: 2 }).toSeconds();
            const endDate = DateTime.fromISO(now).minus({ days: 1 });
            const proposal = generateSppProposal({
                settings: generateSppPluginSettings({
                    stages: [generateSppStage({ plugins: [generateSppStagePlugin()] })],
                }),
                startDate,
                actions: [generateProposalAction()],
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
