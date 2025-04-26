import { generateProposalAction } from '@/modules/governance/testUtils';
import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateSppPluginSettings, generateSppProposal, generateSppStage } from '../../testUtils';
import { type ISppProposal, SppProposalType } from '../../types';
import { sppStageUtils } from '../sppStageUtils/sppStageUtils';
import { sppProposalUtils } from './sppProposalUtils';

describe('SppProposalUtils', () => {
    const getProposalStatusSpy = jest.spyOn(proposalStatusUtils, 'getProposalStatus');
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
    const getStageMaxAdvanceSpy = jest.spyOn(sppStageUtils, 'getStageMaxAdvance');
    const canStageAdvanceSpy = jest.spyOn(sppStageUtils, 'canStageAdvance');

    afterEach(() => {
        getProposalStatusSpy.mockReset();
        getStageStatusSpy.mockReset();
        getStageEndDateSpy.mockReset();
        getStageMaxAdvanceSpy.mockReset();
        canStageAdvanceSpy.mockReset();
    });

    const generateProposalWithStage = (proposal?: Partial<ISppProposal>): ISppProposal => ({
        ...generateSppProposal({
            ...proposal,
            settings: generateSppPluginSettings({ stages: [generateSppStage()], ...proposal?.settings }),
        }),
        ...proposal,
    });

    describe('getProposalStatus', () => {
        const hasAnyStageStatusSpy = jest.spyOn(sppProposalUtils, 'hasAnyStageStatus');
        const areAllStagesAcceptedSpy = jest.spyOn(sppProposalUtils, 'areAllStagesAccepted');

        afterEach(() => {
            hasAnyStageStatusSpy.mockReset();
            areAllStagesAcceptedSpy.mockReset();
        });

        afterAll(() => {
            hasAnyStageStatusSpy.mockRestore();
            areAllStagesAcceptedSpy.mockRestore();
        });

        it('sets the isExecuted param to the proposal execution status', () => {
            const status = true;
            const proposal = generateProposalWithStage({ executed: { status } });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ isExecuted: status }));
        });

        it('sets the isVetoed param to true when one of the stage has VETOED status', () => {
            const proposal = generateProposalWithStage();
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ isVetoed: true }));
        });

        it('sets the start date param to the proposal start date', () => {
            const startDate = 123;
            const proposal = generateProposalWithStage({ startDate });
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ startDate }));
        });

        it('sets the end date param to the end date of the last stage', () => {
            const endDate = 456;
            const lastStage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({ stages: [generateSppStage(), lastStage] });
            const proposal = generateProposalWithStage({ settings });
            getStageEndDateSpy.mockReturnValue(DateTime.fromSeconds(endDate));
            sppProposalUtils.getProposalStatus(proposal);
            expect(getStageEndDateSpy).toHaveBeenCalledWith(proposal, lastStage);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ endDate }));
        });

        it('sets the execution expiry date param to the max advance date of the last stage', () => {
            const maxAdvance = 789;
            const lastStage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({ stages: [lastStage] });
            const proposal = generateProposalWithStage({ settings });
            getStageMaxAdvanceSpy.mockReturnValue(DateTime.fromSeconds(maxAdvance));
            sppProposalUtils.getProposalStatus(proposal);
            expect(getStageMaxAdvanceSpy).toHaveBeenCalledWith(proposal, lastStage);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ executionExpiryDate: maxAdvance }),
            );
        });

        it('sets the hasAdvanceableStages param to true if there are stages that can be advanced', () => {
            const settings = generateSppPluginSettings({
                stages: [generateSppStage({ stageIndex: 0 }), generateSppStage({ stageIndex: 1 })],
            });
            const proposal = generateProposalWithStage({ settings });
            canStageAdvanceSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ hasAdvanceableStages: true }));
        });

        it('sets the hasExpiredStages param to true if there are stages that have expired', () => {
            const proposal = generateProposalWithStage();
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ hasExpiredStages: true }));
        });

        it('sets the paramsMet to true if all stages are accepted', () => {
            const proposal = generateProposalWithStage();
            areAllStagesAcceptedSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ paramsMet: true }));
        });

        it('sets the hasActions param to true if the proposal has actions', () => {
            const proposal = generateProposalWithStage({ actions: [generateProposalAction()] });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ hasActions: true }));
        });

        it('sets the canExecuteEarly param to true if the last stage can be advanced early', () => {
            const lastStage = generateSppStage({ stageIndex: 1, minAdvance: 0 });
            const settings = generateSppPluginSettings({ stages: [generateSppStage(), lastStage] });
            const proposal = generateProposalWithStage({ settings });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(expect.objectContaining({ canExecuteEarly: true }));
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

    describe('getExternalBodyResult', () => {
        it('returns the result for the given external address and stage index if present', () => {
            const externalAddress = '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const result = {
                pluginAddress: externalAddress,
                stage,
                resultType: SppProposalType.APPROVAL,
            };
            const proposal = generateSppProposal({
                results: [result],
            });

            const externalBodyResult = sppProposalUtils.getExternalBodyResult(proposal, externalAddress, stage);

            expect(externalBodyResult).toEqual(result);
        });

        it('returns undefined if the result for the correct external address but on a different stage index', () => {
            const externalAddress = '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const proposal = generateSppProposal({
                results: [
                    {
                        pluginAddress: externalAddress,
                        stage: 2,
                        resultType: SppProposalType.APPROVAL,
                    },
                ],
            });

            const externalBodyResult = sppProposalUtils.getExternalBodyResult(proposal, externalAddress, stage);

            expect(externalBodyResult).toBeUndefined();
        });

        it('returns undefined if the result is undefined', () => {
            const externalAddress = '0x1234567890abcdef1234567890abcdef12345678';
            const stage = 1;
            const proposal = generateSppProposal();

            const externalBodyResult = sppProposalUtils.getExternalBodyResult(proposal, externalAddress, stage);

            expect(externalBodyResult).toBeUndefined();
        });
    });
});
