import { ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { SppStageStatus, type ISppProposal, type ISppStage } from '../types';
import { sppStageUtils } from './sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        if (proposal.executed.status) {
            return ProposalStatus.EXECUTED;
        }

        if (this.isAnyStageVetoed(proposal)) {
            return ProposalStatus.VETOED;
        }

        if (this.isAnyStageRejected(proposal)) {
            return ProposalStatus.REJECTED;
        }

        const now = DateTime.now();
        const startDate = DateTime.fromSeconds(proposal.startDate);

        if (startDate > now) {
            return ProposalStatus.PENDING;
        }

        const hasActions = proposal.actions.length > 0;
        const endsInFuture = this.endsInFuture(proposal);
        const allStagesAccepted = this.areAllStagesAccepted(proposal);
        const executionExpired = this.isExecutionExpired(proposal);

        if (executionExpired) {
            return ProposalStatus.EXPIRED;
        }

        if (endsInFuture && !allStagesAccepted) {
            return ProposalStatus.ACTIVE;
        }

        if (allStagesAccepted) {
            return !hasActions ? ProposalStatus.ACCEPTED : ProposalStatus.EXECUTABLE;
        }

        return ProposalStatus.REJECTED;
    };

    endsInFuture = (proposal: ISppProposal): boolean => {
        const now = DateTime.now();
        const currentStage = this.getCurrentStage(proposal);
        const isLastStage = proposal.currentStageIndex === proposal.settings.stages.length - 1;
        const stageEndDate = sppStageUtils.getStageEndDate(proposal, currentStage);

        if (!isLastStage) {
            return true; // If not in the last stage, and is not executed/rejected it  essentially ends in future
        }

        return stageEndDate > now;
    };

    isAnyStageVetoed = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.some(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === SppStageStatus.VETOED,
        );
    };

    isAnyStageRejected = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.some(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === SppStageStatus.REJECTED,
        );
    };

    getCurrentStage = (proposal: ISppProposal): ISppStage => {
        return proposal.settings.stages[proposal.currentStageIndex];
    };

    areAllStagesAccepted = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === SppStageStatus.ACCEPTED,
        );
    };

    isExecutionExpired = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.some(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === SppStageStatus.EXPIRED,
        );
    };
}

export const sppProposalUtils = new SppProposalUtils();
