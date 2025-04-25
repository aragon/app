import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils';
import { addressUtils, type ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const { executed, actions, settings, startDate } = proposal;
        const { stages } = settings;

        const lastStage = stages[stages.length - 1];

        const isExecuted = executed.status;
        const isVetoed = this.hasAnyStageStatus(proposal, ProposalVotingStatus.VETOED);

        const hasUnreachedStages = this.hasAnyStageStatus(proposal, ProposalVotingStatus.UNREACHED);
        const hasExpiredStages = this.hasAnyStageStatus(proposal, ProposalVotingStatus.EXPIRED);

        // Set end date to 0 to mark SPP proposals as "ended" when one or more stages are unreached
        const endDate = !hasUnreachedStages ? sppStageUtils.getStageEndDate(proposal, lastStage)?.toSeconds() : 0;
        const executionExpiryDate = sppStageUtils.getStageMaxAdvance(proposal, lastStage)?.toSeconds();

        const hasAdvanceableStages = stages.some(
            (stage) => !sppStageUtils.isLastStage(proposal, stage) && sppStageUtils.canStageAdvance(proposal, stage),
        );

        const paramsMet = this.areAllStagesAccepted(proposal);
        const hasActions = actions.length > 0;
        const canExecuteEarly = lastStage.minAdvance === 0;

        return proposalStatusUtils.getProposalStatus({
            isExecuted,
            isVetoed,
            startDate,
            endDate,
            executionExpiryDate,
            hasAdvanceableStages,
            hasExpiredStages,
            paramsMet,
            hasActions,
            canExecuteEarly,
        });
    };

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalVotingStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.ACCEPTED,
        );

    getExternalBodyResult = (proposal: ISppProposal, externalAddress: string, stageIndex: number) => {
        return proposal.result?.find(
            (result) =>
                addressUtils.isAddressEqual(result.pluginAddress, externalAddress) && result.stageIndex === stageIndex,
        );
    };
}

export const sppProposalUtils = new SppProposalUtils();
