import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): ProposalVotingStatus => {
        const { stageIndex: currentStageIndex, actions, settings } = proposal;
        const { stageIndex } = stage;

        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal, stage);
        const stageMaxVote = this.getStageMaxVote(proposal, stage);

        const minAdvanceDate = this.getStageMinAdvance(proposal, stage);
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);
        const approvalReached = this.isApprovalReached(proposal, stage);
        const isFinalStage = this.isFinalStage(proposal, stage);

        // Mark proposal as signaling when main-proposal has no actions and this is processing the status of the last stage
        const isSignalingProposal = actions.length === 0 && stageIndex === settings.stages.length - 1;

        const isAdvanceable = maxAdvanceDate && now < maxAdvanceDate && !isSignalingProposal && !isFinalStage;

        const canAdvance = approvalReached && minAdvanceDate && now > minAdvanceDate && !isSignalingProposal;

        const isExpired =
            maxAdvanceDate != null && now > maxAdvanceDate && !isSignalingProposal && stageIndex === currentStageIndex;

        if (this.isVetoReached(proposal, stage)) {
            return ProposalVotingStatus.VETOED;
        }

        if (this.isStagedUnreached(proposal, stageIndex)) {
            return ProposalVotingStatus.UNREACHED;
        }

        if ((stageStartDate != null && stageStartDate > now) || stageIndex > currentStageIndex) {
            return ProposalVotingStatus.PENDING;
        }

        if (isAdvanceable && canAdvance) {
            return ProposalVotingStatus.ADVANCEABLE;
        }

        if (stageMaxVote != null && now < stageMaxVote) {
            return ProposalVotingStatus.ACTIVE;
        }

        if (!approvalReached && stageMaxVote != null && now > stageMaxVote) {
            return ProposalVotingStatus.REJECTED;
        }

        return isExpired ? ProposalVotingStatus.EXPIRED : ProposalVotingStatus.ACCEPTED;
    };

    isStagedUnreached = (proposal: ISppProposal, currentStageIndex: number): boolean => {
        return proposal.settings.stages.slice(0, currentStageIndex).some((stage) => {
            const status = this.getStageStatus(proposal, stage);
            const { VETOED, REJECTED, EXPIRED } = ProposalVotingStatus;

            return [VETOED, REJECTED, EXPIRED].includes(status);
        });
    };

    getStageStartDate = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const { startDate, stageIndex: currentStageIndex, lastStageTransition, subProposals } = proposal;
        const { stageIndex } = stage;

        if (stageIndex === 0) {
            return DateTime.fromSeconds(startDate);
        }

        if (currentStageIndex === stageIndex) {
            return DateTime.fromSeconds(lastStageTransition);
        }

        const stageSubProposal = subProposals.find((subProposal) => subProposal.stageIndex === stageIndex);

        return stageSubProposal != null ? DateTime.fromSeconds(stageSubProposal.startDate) : undefined;
    };

    getStageMaxVote = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const startDate = this.getStageStartDate(proposal, stage);

        return startDate?.plus({ seconds: stage.voteDuration });
    };

    getStageMaxAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.maxAdvance });
    };

    getStageMinAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.minAdvance });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getSuccessThreshold(proposal, stage);

        return stage.vetoThreshold > 0 && vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getSuccessThreshold(proposal, stage);

        return approvalCount >= stage.approvalThreshold;
    };

    getSuccessThreshold = (proposal: ISppProposal, stage: ISppStage): number => {
        return proposal.subProposals.reduce((count, subProposal) => {
            if (subProposal.stageIndex !== stage.stageIndex) {
                return count;
            }

            const getSucceededStatus = pluginRegistryUtils.getSlotFunction<ISppSubProposal, boolean>({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
                pluginId: subProposal.pluginSubdomain,
            });

            const isSuccessReached = getSucceededStatus?.(subProposal);

            if (isSuccessReached == null) {
                return subProposal.result ? count + 1 : count;
            }

            return isSuccessReached ? count + 1 : count;
        }, 0);
    };

    isVeto = (stage: ISppStage): boolean => {
        return stage.vetoThreshold > 0;
    };

    isFinalStage = (proposal: ISppProposal, stage: ISppStage): boolean => {
        return proposal.stageIndex === proposal.settings.stages.length - 1 && proposal.stageIndex === stage.stageIndex;
    };
}

export const sppStageUtils = new SppStageUtils();
