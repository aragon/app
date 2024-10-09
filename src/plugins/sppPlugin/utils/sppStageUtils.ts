import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, SppProposalType, SppStageStatus } from '../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): SppStageStatus => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = stageEndDate.plus({ seconds: stage.maxAdvance });
        const stageIndex = proposal.settings.stages.findIndex((s) => s.id === stage.id);

        if (this.isVetoReached(proposal, stage)) {
            return SppStageStatus.VETOED;
        }

        if (this.isPreviousStageRejectedOrVetoed(proposal, stageIndex)) {
            return SppStageStatus.INACTIVE;
        }

        if (stageStartDate > now || stageIndex > proposal.currentStageIndex) {
            return SppStageStatus.PENDING;
        }

        if (this.isApprovalReached(proposal, stage)) {
                    if (now > maxAdvanceDate) {
                        return SppStageStatus.EXPIRED;
                    }
                    return this.canStageAdvance(proposal, stage) ? SppStageStatus.ACCEPTED : SppStageStatus.ACTIVE;
                }

        if (now > stageEndDate) {
            return SppStageStatus.REJECTED;
        }

        return SppStageStatus.ACTIVE;
    };

    isPreviousStageRejectedOrVetoed = (proposal: ISppProposal, currentStageIndex: number): boolean => {
        return proposal.settings.stages.slice(0, currentStageIndex).some((stage) => {
            const status = this.getStageStatus(proposal, stage);
            return status === SppStageStatus.VETOED || status === SppStageStatus.REJECTED;
        });
    };

    getStageStartDate = (proposal: ISppProposal): DateTime => {
        if (proposal.currentStageIndex === 0) {
            return DateTime.fromSeconds(proposal.startDate);
        }
        return DateTime.fromSeconds(proposal.lastStageTransition);
    };

    getStageEndDate = (proposal: ISppProposal, stage: ISppStage): DateTime => {
        const startDate = this.getStageStartDate(proposal);
        return startDate.plus({ seconds: stage.votingPeriod });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getCount(proposal, stage, SppProposalType.VETO);
        return vetoCount >= stage.vetoThreshold;
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

        const isNotVetoed = !this.isVetoReached(proposal, stage);

        return isWithinMinAndMaxAdvance && isApproved && isNotVetoed;
    };

    getCount = (proposal: ISppProposal, stage: ISppStage, proposalType: SppProposalType): number => {
        return proposal.subProposals.filter(
            (subProposal) =>
                stage.plugins.some((plugin) => plugin.address === subProposal.pluginAddress) &&
                stage.plugins.find((plugin) => plugin.address === subProposal.pluginAddress)?.proposalType ===
                    proposalType &&
                subProposal.result,
        ).length;
    };
}

export const sppStageUtils = new SppStageUtils();
