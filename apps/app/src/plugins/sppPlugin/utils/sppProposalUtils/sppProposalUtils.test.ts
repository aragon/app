import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { generateProposal } from '@/modules/governance/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
} from '../../testUtils';
import type { ISppProposal } from '../../types';
import { sppStageUtils } from '../sppStageUtils/sppStageUtils';
import { sppProposalUtils } from './sppProposalUtils';

describe('SppProposalUtils', () => {
    /**
     * Every spy below is `mockReset` between tests, so a stubbed stage util answers `undefined`
     * rather than the real rule - fine for the param assertions this file is built on, useless for
     * asserting the status a user reads. The originals are captured so one regression case can run
     * the whole composition for real.
     */
    const real = {
        composeStatus: proposalStatusUtils.getProposalStatus,
        stageStatus: sppStageUtils.getStageStatus,
        stageEndDate: sppStageUtils.getStageEndDate,
        stageMaxAdvance: sppStageUtils.getStageMaxAdvance,
        canStageAdvance: sppStageUtils.canStageAdvance,
    };

    const getProposalStatusSpy = jest.spyOn(
        proposalStatusUtils,
        'getProposalStatus',
    );
    const getStageStatusSpy = jest.spyOn(sppStageUtils, 'getStageStatus');
    const getStageEndDateSpy = jest.spyOn(sppStageUtils, 'getStageEndDate');
    const getStageMaxAdvanceSpy = jest.spyOn(
        sppStageUtils,
        'getStageMaxAdvance',
    );
    const canStageAdvanceSpy = jest.spyOn(sppStageUtils, 'canStageAdvance');

    afterEach(() => {
        getProposalStatusSpy.mockReset();
        getStageStatusSpy.mockReset();
        getStageEndDateSpy.mockReset();
        getStageMaxAdvanceSpy.mockReset();
        canStageAdvanceSpy.mockReset();
    });

    const generateProposalWithStage = (
        proposal?: Partial<ISppProposal>,
    ): ISppProposal => ({
        ...generateSppProposal({
            ...proposal,
            settings: generateSppPluginSettings({
                stages: [generateSppStage()],
                ...proposal?.settings,
            }),
        }),
        ...proposal,
    });

    describe('getProposalStatus', () => {
        const hasAnyStageStatusSpy = jest.spyOn(
            sppProposalUtils,
            'hasAnyStageStatus',
        );
        const areAllStagesAcceptedSpy = jest.spyOn(
            sppProposalUtils,
            'areAllStagesAccepted',
        );

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
            const proposal = generateProposalWithStage({
                executed: { status },
            });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ isExecuted: status }),
            );
        });

        it('sets the isVetoed param to true when one of the stage has VETOED status', () => {
            const proposal = generateProposalWithStage();
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ isVetoed: true }),
            );
        });

        it('sets the start date param to the proposal start date', () => {
            const startDate = 123;
            const proposal = generateProposalWithStage({ startDate });
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ startDate }),
            );
        });

        it('sets the end date param to the end date of the last stage', () => {
            const endDate = 456;
            const lastStage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({
                stages: [generateSppStage(), lastStage],
            });
            const proposal = generateProposalWithStage({ settings });
            getStageEndDateSpy.mockReturnValue(DateTime.fromSeconds(endDate));
            sppProposalUtils.getProposalStatus(proposal);
            expect(getStageEndDateSpy).toHaveBeenCalledWith(
                proposal,
                lastStage,
            );
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ endDate }),
            );
        });

        /**
         * SF-3 as the backend served it: one stage whose 7-day voting window closed three weeks
         * ago, `maxAdvance` a century out, no body succeeded. `getStageStatus` calls that stage
         * ACTIVE because a late result still decides it, and the card offers the vote - while the
         * proposal header read REJECTED off the closed voting window. Real stage rules here: with
         * the stage status stubbed this would only prove the plumbing.
         */
        it('reads as active while its last stage can still be answered', () => {
            const startDate = DateTime.now().minus({ days: 28 }).toSeconds();
            const settings = generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        stageIndex: 0,
                        voteDuration: 604_800,
                        minAdvance: 0,
                        maxAdvance: 3_155_760_000,
                        approvalThreshold: 1,
                        vetoThreshold: 0,
                    }),
                ],
            });
            const proposal = generateSppProposal({
                settings,
                startDate,
                lastStageTransition: startDate,
                stageIndex: 0,
                hasActions: true,
            });
            getProposalStatusSpy.mockImplementation(real.composeStatus);
            getStageStatusSpy.mockImplementation(real.stageStatus);
            getStageEndDateSpy.mockImplementation(real.stageEndDate);
            getStageMaxAdvanceSpy.mockImplementation(real.stageMaxAdvance);
            canStageAdvanceSpy.mockImplementation(real.canStageAdvance);

            expect(sppProposalUtils.getProposalStatus(proposal)).toBe(
                ProposalStatus.ACTIVE,
            );
        });

        it('sets the execution expiry date param to the max advance date of the last stage', () => {
            const maxAdvance = 789;
            const lastStage = generateSppStage({ stageIndex: 1 });
            const settings = generateSppPluginSettings({ stages: [lastStage] });
            const proposal = generateProposalWithStage({ settings });
            getStageMaxAdvanceSpy.mockReturnValue(
                DateTime.fromSeconds(maxAdvance),
            );
            sppProposalUtils.getProposalStatus(proposal);
            expect(getStageMaxAdvanceSpy).toHaveBeenCalledWith(
                proposal,
                lastStage,
            );
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ executionExpiryDate: maxAdvance }),
            );
        });

        it('sets the hasAdvanceableStages param to true if there are stages that can be advanced', () => {
            const settings = generateSppPluginSettings({
                stages: [
                    generateSppStage({ stageIndex: 0 }),
                    generateSppStage({ stageIndex: 1 }),
                ],
            });
            const proposal = generateProposalWithStage({ settings });
            canStageAdvanceSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ hasAdvanceableStages: true }),
            );
        });

        it('sets the hasExpiredStages param to true if there are stages that have expired', () => {
            const proposal = generateProposalWithStage();
            hasAnyStageStatusSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ hasExpiredStages: true }),
            );
        });

        it('sets the paramsMet to true if all stages are accepted', () => {
            const proposal = generateProposalWithStage();
            areAllStagesAcceptedSpy.mockReturnValue(true);
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ paramsMet: true }),
            );
        });

        it('sets the hasActions param to true if the proposal has actions', () => {
            const proposal = generateProposalWithStage({ hasActions: true });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ hasActions: true }),
            );
        });

        it('sets the canExecuteEarly param to true if the last stage can be advanced early', () => {
            const lastStage = generateSppStage({
                stageIndex: 1,
                minAdvance: 0,
            });
            const settings = generateSppPluginSettings({
                stages: [generateSppStage(), lastStage],
            });
            const proposal = generateProposalWithStage({ settings });
            sppProposalUtils.getProposalStatus(proposal);
            expect(getProposalStatusSpy).toHaveBeenCalledWith(
                expect.objectContaining({ canExecuteEarly: true }),
            );
        });
    });

    describe('getCurrentStage', () => {
        it('returns the current stage', () => {
            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1 }),
            ];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings, stageIndex: 1 });
            expect(sppProposalUtils.getCurrentStage(proposal)).toBe(stages[1]);
        });
    });

    describe('areAllStagesAccepted', () => {
        it('returns true when all stages are accepted', () => {
            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1 }),
            ];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });
            getStageStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
            expect(
                sppProposalUtils.areAllStagesAccepted(proposal),
            ).toBeTruthy();
        });

        it('returns false if a stage is not accepted', () => {
            const stages = [
                generateSppStage({ stageIndex: 0 }),
                generateSppStage({ stageIndex: 1 }),
            ];
            const settings = generateSppPluginSettings({ stages });
            const proposal = generateSppProposal({ settings });

            getStageStatusSpy.mockImplementation((_, stage) =>
                stage.stageIndex === 0
                    ? ProposalStatus.ACCEPTED
                    : ProposalStatus.REJECTED,
            );

            expect(sppProposalUtils.areAllStagesAccepted(proposal)).toBeFalsy();
        });
    });

    describe('isSppProposal', () => {
        it('returns true when the proposal interface is spp', () => {
            const proposal = generateProposal({
                pluginInterfaceType: PluginInterfaceType.SPP,
            });
            expect(sppProposalUtils.isSppProposal(proposal)).toBeTruthy();
        });

        it('returns false for other plugin interfaces', () => {
            const multisigProposal = generateProposal({
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            });
            const ltvProposal = generateProposal({
                pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            });
            expect(
                sppProposalUtils.isSppProposal(multisigProposal),
            ).toBeFalsy();
            expect(sppProposalUtils.isSppProposal(ltvProposal)).toBeFalsy();
        });
    });
});
