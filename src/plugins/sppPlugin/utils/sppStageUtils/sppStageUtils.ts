import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, type ISppSubProposal, SppProposalType } from '../../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): ProposalVotingStatus => {
        const { stageIndex: currentStageIndex, actions, settings } = proposal;
        const { stageIndex, minAdvance } = stage;

        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal, stage);
        const stageEndDate = this.getStageEndDate(proposal, stage);

        const minAdvanceDate = stageStartDate?.plus({ seconds: minAdvance });
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);

        const approvalReached = this.isApprovalReached(proposal, stage);

        // Mark proposal as signaling when main-proposal has no actions and this is processing the status of the last stage
        const isSignalingProposal = actions.length === 0 && stageIndex === settings.stages.length - 1;

        const canAdvance = approvalReached && minAdvanceDate != null && now > minAdvanceDate && !isSignalingProposal;

        if (this.isVetoReached(proposal, stage)) {
            return ProposalVotingStatus.VETOED;
        }

        if (this.isStagedUnreached(proposal, stageIndex)) {
            return ProposalVotingStatus.UNREACHED;
        }

        if ((stageStartDate != null && stageStartDate > now) || stageIndex > currentStageIndex) {
            return ProposalVotingStatus.PENDING;
        }

        if (this.isAdvanceable(proposal) && stageEndDate != null && now < stageEndDate && !canAdvance) {
            return ProposalVotingStatus.ADVANCEABLE;
        }

        if (stageEndDate != null && now < stageEndDate) {
            return canAdvance ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.ACTIVE;
        }

        if (!approvalReached) {
            return ProposalVotingStatus.REJECTED;
        }

        const isExpired =
            maxAdvanceDate != null && now > maxAdvanceDate && !isSignalingProposal && stageIndex === currentStageIndex;

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

    getStageEndDate = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const startDate = this.getStageStartDate(proposal, stage);
        return startDate?.plus({ seconds: stage.voteDuration });
    };

    getStageMaxAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);
        const difference = stage.maxAdvance - stage.minAdvance;
        return stageStartDate?.plus({ seconds: difference });
    };

    getStageMinAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.minAdvance });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getCount(proposal, stage, SppProposalType.VETO);
        return stage.vetoThreshold > 0 && vetoCount >= stage.vetoThreshold;
    };

    isAdvanceable = (proposal: ISppProposal): boolean => {
        return proposal.subProposals.some((subProposal) => {
            const getStatusFunction = pluginRegistryUtils.getSlotFunction<ISppSubProposal, boolean>({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_PASSING,
                pluginId: subProposal.pluginSubdomain,
            });

            if (!getStatusFunction) {
                return false;
            }

            return getStatusFunction(subProposal);
        });
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getCount(proposal, stage, SppProposalType.APPROVAL);

        return approvalCount >= stage.approvalThreshold;
    };

    getCount = (proposal: ISppProposal, stage: ISppStage, proposalType: SppProposalType): number => {
        return proposal.subProposals.reduce((count, subProposal) => {
            const plugin = stage.plugins.find((plugin) => plugin.address === subProposal.pluginAddress);

            if (plugin?.proposalType !== proposalType) {
                return count;
            }

            const getStatusFunction = pluginRegistryUtils.getSlotFunction<ISppSubProposal, ProposalStatus>({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                pluginId: subProposal.pluginSubdomain,
            });

            if (getStatusFunction == null) {
                return subProposal.result ? count + 1 : count;
            }

            const subProposalStatus = getStatusFunction(subProposal);
            const { ACCEPTED, EXECUTABLE, EXECUTED, EXPIRED } = ProposalStatus;

            // Do not include EXECUTED as approved status for veto proposals as a sub-proposal will have EXECUTED status
            // when the stage has been advanced, therefore the proposal has not been vetoed. Include instead the EXPIRED
            // status for veto proposals as plugins might set an expiry execution (e.g. multisig) and, if a sub-proposal
            // has been accepted but not executed, the sub-proposal still counts as vetoed.
            const approvedStatuses =
                proposalType === SppProposalType.APPROVAL
                    ? [ACCEPTED, EXECUTABLE, EXECUTED]
                    : [ACCEPTED, EXECUTABLE, EXPIRED];

            const isApprovalReached = approvedStatuses.includes(subProposalStatus);

            return isApprovalReached ? count + 1 : count;
        }, 0);
    };
}

export const sppStageUtils = new SppStageUtils();
