import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, SppStageStatus } from '../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): SppStageStatus => {
        const now = DateTime.now();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);

        if (this.isStageVetoed(proposal, stage)) {
            return SppStageStatus.VETOED;
        }

        if (stageStartDate > now) {
            return this.isProposalActive(proposal, stage) ? SppStageStatus.PENDING : SppStageStatus.INACTIVE;
        }

        if (now >= stageStartDate && now < stageEndDate) {
            return SppStageStatus.ACTIVE;
        }

        if (this.isStageRejected(proposal, stage)) {
            return SppStageStatus.REJECTED;
        }

        if (this.isStageAccepted(proposal, stage)) {
            return this.isStageExpired(proposal, stage) ? SppStageStatus.EXPIRED : SppStageStatus.ACCEPTED;
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
        if (proposal.currentStageIndex === 0) {
            return DateTime.fromSeconds(proposal.startDate).plus({ seconds: stage.votingPeriod });
        }

        return DateTime.fromSeconds(proposal.lastStageTransition).plus({ seconds: stage.votingPeriod });
    };

    isProposalActive = (proposal: ISppProposal, stage: ISppStage): boolean => {
        // Maybe we should use .utc() instead of .now()??
        const now = DateTime.now();
        const startDate = DateTime.fromSeconds(proposal.startDate);
        const endDate = this.getStageEndDate(proposal, stage);

        return now >= startDate && now <= endDate;
    };

    isStageRejected = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const stageEndDate = this.getStageEndDate(proposal, stage);
        // Maybe we should use .utc() instead of .now()??
        const now = DateTime.now();

        return now > stageEndDate && !this.isApprovalReached(proposal, stage);
    };

    isStageAccepted = (proposal: ISppProposal, stage: ISppStage): boolean => {
        return this.isApprovalReached(proposal, stage) && !this.isStageVetoed(proposal, stage);
    };

    isStageExpired = (proposal: ISppProposal, stage: ISppStage): boolean => {
        if (this.isApprovalReached(proposal, stage) && !this.isStageVetoed(proposal, stage)) {
            const stageEndDate = this.getStageEndDate(proposal, stage);
            const maxAdvanceDate = stageEndDate.plus({ seconds: stage.maxAdvance });
            // Maybe we should use .utc() instead of .now()??
            const now = DateTime.now();

            return now > maxAdvanceDate;
        }
        return false;
    };

    isStageVetoed = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getVetoCount(proposal, stage);
        return vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getApprovalCount(proposal, stage);
        return approvalCount >= stage.approvalThreshold;
    };

    getVetoCount = (proposal: ISppProposal, stage: ISppStage): number => {
        // logic to calculate veto count
        return 0;
    };

    getApprovalCount = (proposal: ISppProposal, stage: ISppStage): number => {
        // logic to calculate approval count
        return 0;
    };
}

export const sppStageUtils = new SppStageUtils();
