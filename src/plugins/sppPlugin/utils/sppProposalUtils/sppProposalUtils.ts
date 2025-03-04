import { proposalStatusUtils } from '@/shared/utils/proposalStatusUtils/proposalStatusUtils';
import { type ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const { executed, actions, settings, startDate } = proposal;
        const { stages } = settings;

        const lastStage = stages[stages.length - 1];

        const isExecuted = executed.status;
        const isVetoed = this.hasAnyStageStatus(proposal, ProposalVotingStatus.VETOED);

        const endDate = sppStageUtils.getStageEndDate(proposal, lastStage)?.toSeconds();
        const executionExpiryDate = sppStageUtils.getStageMaxAdvance(proposal, lastStage)?.toSeconds();

        const hasAdvanceableStages = stages.some(
            (stage) => !sppStageUtils.isLastStage(proposal, stage) && sppStageUtils.canStageAdvance(proposal, stage),
        );

        const hasExpiredStages = this.hasAnyStageStatus(proposal, ProposalVotingStatus.EXPIRED);

        const paramsMet = this.areAllStagesAccepted(proposal);
        const hasActions = actions.length > 0;
        const canExecuteEarly = false;

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
}

export const sppProposalUtils = new SppProposalUtils();
