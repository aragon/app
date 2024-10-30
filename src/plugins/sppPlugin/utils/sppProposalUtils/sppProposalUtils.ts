import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        if (proposal.executed.status) {
            return ProposalStatus.EXECUTED;
        }

        if (this.hasAnyStageStatus(proposal, ProposalStatus.VETOED)) {
            return ProposalStatus.VETOED;
        }

        if (this.hasAnyStageStatus(proposal, ProposalStatus.REJECTED)) {
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

        if (this.hasAnyStageStatus(proposal, ProposalStatus.EXPIRED)) {
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
        const isLastStage = proposal.stageIndex === proposal.settings.stages.length - 1;
        const stageEndDate = sppStageUtils.getStageEndDate(proposal, currentStage);

        if (!isLastStage) {
            return true; // If not in the last stage, and is not executed/rejected it  essentially ends in future
        }

        if (!stageEndDate) {
            return false;
        }
        return stageEndDate > now;
    };

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalStatus): boolean => {
        return proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);
    };

    getCurrentStage = (proposal: ISppProposal): ISppStage => {
        return proposal.settings.stages[proposal.stageIndex];
    };

    areAllStagesAccepted = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalStatus.ACCEPTED,
        );
    };
}

export const sppProposalUtils = new SppProposalUtils();
