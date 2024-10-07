import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, type ISppSubProposal, SppStageStatus } from '../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): SppStageStatus => {
        const now = DateTime.utc();
        const stageStartDate = this.getStageStartDate(proposal);
        const stageEndDate = this.getStageEndDate(proposal, stage);

        if (this.isStageVetoed(proposal, stage)) {
            return SppStageStatus.VETOED;
        }

        if (stageStartDate > now && this.isProposalActive(proposal, stage)) {
            return SppStageStatus.PENDING;
        }

        if (stageStartDate > now && !this.isProposalActive(proposal, stage)) {
            return SppStageStatus.INACTIVE;
        }

        if (this.isStageRejected(proposal, stage)) {
            return SppStageStatus.REJECTED;
        }

        if (now >= stageStartDate && now < stageEndDate) {
            return SppStageStatus.ACTIVE;
        }

        if (this.isStageAccepted(proposal, stage)) {
            return SppStageStatus.ACCEPTED;
        }

        if (this.isStageExpired(proposal, stage)) {
            return SppStageStatus.EXPIRED;
        }

        return SppStageStatus.INACTIVE;
    };

    getVetoCount = (proposal: ISppProposal, stage: ISppStage): number => {
        return proposal.subProposals.filter(
            (subProposal) => subProposal.stageId === stage.id && this.isSubProposalVetoed(subProposal),
        ).length;
    };

    getStageEndDate = (proposal: ISppProposal, stage: ISppStage): DateTime => {
        return this.getStageStartDate(proposal).plus({ seconds: stage.votingPeriod });
    };

    isStageVetoed = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getVetoCount(proposal, stage);
        return vetoCount >= stage.vetoThreshold;
    };

    isProposalActive = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const now = DateTime.utc();
        const startDate = DateTime.fromSeconds(proposal.startDate);
        const endDate = this.getStageEndDate(proposal, stage);

        return now >= startDate && now <= endDate;
    };

    getApprovalCount = (proposal: ISppProposal, stage: ISppStage): number => {
        return proposal.subProposals.filter(
            (subProposal) => subProposal.stageId === stage.id && this.isSubProposalApproved(subProposal),
        ).length;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getApprovalCount(proposal, stage);
        return approvalCount >= stage.approvalThreshold;
    };

    isStageRejected = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const stageEndDate = this.getStageEndDate(proposal, stage);
        const now = DateTime.utc();

        return now > stageEndDate && !this.isApprovalReached(proposal, stage);
    };

    isStageAccepted = (proposal: ISppProposal, stage: ISppStage): boolean => {
        return this.isApprovalReached(proposal, stage) && !this.isStageVetoed(proposal, stage);
    };

    isStageExpired = (proposal: ISppProposal, stage: ISppStage): boolean => {
        if (this.isApprovalReached(proposal, stage) && !this.isStageVetoed(proposal, stage)) {
            const stageEndDate = this.getStageEndDate(proposal, stage);
            const maxAdvanceDate = stageEndDate.plus({ seconds: stage.maxAdvance });
            const now = DateTime.utc();
            return now > maxAdvanceDate;
        }
        return false;
    };

    getStageStartDate = (proposal: ISppProposal): DateTime => {
        return DateTime.fromSeconds(proposal.startDate);
    };

    isSubProposalApproved = (subProposal: ISppSubProposal): boolean => {
        return true;
    };

    isSubProposalVetoed = (subProposal: ISppSubProposal): boolean => {
        return true;
    };
}

export const sppStageUtils = new SppStageUtils();
