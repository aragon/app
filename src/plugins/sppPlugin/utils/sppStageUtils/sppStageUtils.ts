import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import {
    type ISppProposal,
    type ISppStage,
    type ISppSubProposal,
    SppProposalType,
    type SppStageStatus,
} from '../../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): SppStageStatus => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);

        if (this.isVetoReached(proposal, stage)) {
            return ProposalStatus.VETOED;
        }

        if (this.isStagedUnreached(proposal, stage.stageIndex)) {
            return ProposalVotingStatus.UNREACHED;
        }

        if (stageStartDate > now || stage.stageIndex > proposal.stageIndex) {
            return ProposalStatus.PENDING;
        }

        if (this.isApprovalReached(proposal, stage)) {
            if (now > maxAdvanceDate) {
                return ProposalStatus.EXPIRED;
            }

            return this.canStageAdvance(proposal, stage) ? ProposalStatus.ACCEPTED : ProposalStatus.ACTIVE;
        }

        if (now > stageEndDate) {
            return ProposalStatus.REJECTED;
        }

        return ProposalStatus.ACTIVE;
    };

    isStagedUnreached = (proposal: ISppProposal, currentStageIndex: number): boolean => {
        return proposal.settings.stages.slice(0, currentStageIndex).some((stage) => {
            const status = this.getStageStatus(proposal, stage);
            return (
                status === ProposalStatus.VETOED ||
                status === ProposalStatus.REJECTED ||
                status === ProposalStatus.EXPIRED
            );
        });
    };

    getStageStartDate = (proposal: ISppProposal): DateTime => {
        if (proposal.stageIndex === 0) {
            return DateTime.fromSeconds(proposal.startDate);
        }
        return DateTime.fromSeconds(proposal.lastStageTransition);
    };

    getStageEndDate = (proposal: ISppProposal, stage: ISppStage): DateTime => {
        const startDate = this.getStageStartDate(proposal);
        return startDate.plus({ seconds: stage.voteDuration });
    };

    getStageMaxAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime => {
        const stageEndDate = this.getStageEndDate(proposal, stage);
        return stageEndDate.plus({ seconds: stage.maxAdvance });
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
        const stageStartDate = this.getStageStartDate(proposal);
        const minAdvanceDate = stageStartDate.plus({ seconds: stage.minAdvance });
        const maxAdvanceDate = stageStartDate.plus({ seconds: stage.maxAdvance });

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
                const isApprovalReached = [
                    ProposalStatus.ACCEPTED,
                    ProposalStatus.EXECUTABLE,
                    ProposalStatus.EXECUTED,
                ].includes(subProposalStatus);

                return isApprovalReached ? count + 1 : count;
            }

            return subProposal.result ? count + 1 : count;
        }, 0);
    };
}

export const sppStageUtils = new SppStageUtils();
