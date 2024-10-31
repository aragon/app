import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, type ISppSubProposal, SppProposalType } from '../../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): ProposalVotingStatus => {
        const now = DateTime.now();

        const stageStartDate = this.getStageStartDate(proposal, stage);
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);

        if (this.isVetoReached(proposal, stage)) {
            return ProposalVotingStatus.VETOED;
        }

        if (this.isStagedUnreached(proposal, stage.stageIndex)) {
            return ProposalVotingStatus.UNREACHED;
        }

        if ((stageStartDate != null && stageStartDate > now) || stage.stageIndex > proposal.stageIndex) {
            return ProposalVotingStatus.PENDING;
        }

        if (this.isApprovalReached(proposal, stage)) {
            if (maxAdvanceDate != null && now > maxAdvanceDate) {
                return ProposalVotingStatus.EXPIRED;
            }

            return this.canStageAdvance(proposal, stage) ? ProposalVotingStatus.ACCEPTED : ProposalVotingStatus.ACTIVE;
        }

        if (stageEndDate != null && now > stageEndDate) {
            return ProposalVotingStatus.REJECTED;
        }

        return ProposalVotingStatus.ACTIVE;
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

        if (currentStageIndex === 0) {
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
        const stageEndDate = this.getStageEndDate(proposal, stage);
        return stageEndDate?.plus({ seconds: stage.maxAdvance });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getCount(proposal, stage, SppProposalType.VETO);
        return stage.vetoThreshold > 0 && vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getCount(proposal, stage, SppProposalType.APPROVAL);
        return approvalCount >= stage.approvalThreshold;
    };

    canStageAdvance = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal, stage);
        const minAdvanceDate = stageStartDate?.plus({ seconds: stage.minAdvance });
        const maxAdvanceDate = stageStartDate?.plus({ seconds: stage.maxAdvance });

        if (!stageStartDate || !minAdvanceDate || !maxAdvanceDate) {
            return false;
        }

        // Check if we're within the min and max advance period
        const isWithinMinAndMaxAdvance = now >= minAdvanceDate && now <= maxAdvanceDate;

        const isApproved = this.isApprovalReached(proposal, stage);
        const isVetoed = this.isVetoReached(proposal, stage);

        return isWithinMinAndMaxAdvance && isApproved && !isVetoed;
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

            if (getStatusFunction) {
                const subProposalStatus = getStatusFunction(subProposal);
                const { ACCEPTED, EXECUTABLE, EXECUTED } = ProposalStatus;

                // Do not include EXECUTED as approved status for Veto proposal-type as a sub-proposal will have
                // EXECUTED status when the stage has been advanced, therefore the proposal has not been vetoed.
                const approvedStatuses =
                    proposalType === SppProposalType.APPROVAL
                        ? [ACCEPTED, EXECUTABLE, EXECUTED]
                        : [ACCEPTED, EXECUTABLE];

                const isApprovalReached = approvedStatuses.includes(subProposalStatus);

                return isApprovalReached ? count + 1 : count;
            }

            return subProposal.result ? count + 1 : count;
        }, 0);
    };
}

export const sppStageUtils = new SppStageUtils();
