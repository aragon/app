import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, SppProposalType, SppStageStatus } from '../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): SppStageStatus => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = stageEndDate.plus({ seconds: stage.maxAdvance });
        const stageIndex = proposal.settings.stages.findIndex((s) => s.id === stage.id);

        if (proposal.currentStageIndex < stageIndex) {
            return SppStageStatus.INACTIVE;
        }

        if (this.isVetoReached(proposal, stage)) {
            return SppStageStatus.VETOED;
        }

        if (stageStartDate > now) {
            return SppStageStatus.PENDING;
        }

        if (this.isApprovalReached(proposal, stage)) {
            if (now > maxAdvanceDate) {
                return SppStageStatus.EXPIRED;
            }
            return this.canStageAdvance(proposal, stage) ? SppStageStatus.ACCEPTED : SppStageStatus.ACTIVE;
        }

        if (now > stageEndDate) {
            return this.isApprovalReached(proposal, stage) ? SppStageStatus.EXPIRED : SppStageStatus.REJECTED;
        }

        return SppStageStatus.INACTIVE;
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

    isProposalActive = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = stageEndDate.plus({ seconds: stage.maxAdvance });

        if (proposal.executed?.status === true) {
            return false;
        }

        if (this.isVetoReached(proposal, stage)) {
            return false;
        }

        const isActive = now >= stageStartDate && now <= maxAdvanceDate;
        return isActive;
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getVetoCount(proposal, stage);
        return vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getApprovalCount(proposal, stage);
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

    isStageExpired = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const maxAdvanceDate = stageStartDate.plus({ seconds: stage.maxAdvance });

        return now > maxAdvanceDate;
    };

    getVetoCount = (proposal: ISppProposal, stage: ISppStage): number => {
        return proposal.subProposals.reduce((count, subProposal, index) => {
            const plugin = stage.plugins[index];
            if (
                subProposal.stageId === stage.id &&
                plugin.proposalType === SppProposalType.VETO &&
                subProposal.result
            ) {
                return count + 1;
            }
            return count;
        }, 0);
    };

    getApprovalCount = (proposal: ISppProposal, stage: ISppStage): number => {
        return proposal.subProposals.reduce((count, subProposal, index) => {
            const plugin = stage.plugins[index];
            if (
                subProposal.stageId === stage.id &&
                plugin.proposalType === SppProposalType.APPROVAL &&
                subProposal.result
            ) {
                return count + 1;
            }
            return count;
        }, 0);
    };
}

export const sppStageUtils = new SppStageUtils();
