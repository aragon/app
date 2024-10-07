import { ProposalStatus } from '@aragon/ods';
import { DateTime } from 'luxon';
import { SppStageStatus, type ISppProposal, type ISppStage } from '../types';
import { sppStageUtils } from './sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        if (proposal.executed) {
            return ProposalStatus.EXECUTED;
        }

        if (this.isStageVetoed(proposal)) {
            return ProposalStatus.VETOED;
        }

        const now = DateTime.utc();
        const startDate = DateTime.fromSeconds(proposal.startDate);
        const endDate = this.getProposalEndDate(proposal);
        const hasActions = proposal.actions.length > 0;

        if (startDate > now) {
            return ProposalStatus.PENDING;
        }

        const currentStage = this.getCurrentStage(proposal);
        const currentStageStatus = sppStageUtils.getStageStatus(proposal, currentStage);

        if (now < endDate) {
            if (currentStageStatus === SppStageStatus.ACTIVE) {
                return ProposalStatus.ACTIVE;
            }

            if (currentStageStatus === SppStageStatus.ACCEPTED && hasActions) {
                return ProposalStatus.EXECUTABLE;
            }

            return ProposalStatus.ACTIVE;
        }

        // now >= endDate
        if (currentStageStatus === SppStageStatus.REJECTED) {
            return ProposalStatus.REJECTED;
        }

        if (currentStageStatus === SppStageStatus.ACCEPTED || this.areAllStagesAccepted(proposal)) {
            if (!hasActions) {
                return ProposalStatus.ACCEPTED;
            }
            return this.isExecutionExpired(proposal) ? ProposalStatus.EXPIRED : ProposalStatus.EXECUTABLE;
        }

        return ProposalStatus.REJECTED;
    };

    isStageVetoed = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.some((stage) => sppStageUtils.isStageVetoed(proposal, stage));
    };

    getCurrentStage = (proposal: ISppProposal): ISppStage => {
        return proposal.settings.stages[proposal.currentStageIndex];
    };

    areAllStagesAccepted = (proposal: ISppProposal): boolean => {
        return proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === SppStageStatus.ACCEPTED,
        );
    };

    getProposalEndDate = (proposal: ISppProposal): DateTime => {
        const totalDuration = proposal.settings.stages.reduce((sum, stage) => sum + stage.votingPeriod, 0);
        return DateTime.fromSeconds(proposal.startDate).plus({ seconds: totalDuration });
    };

    isExecutionExpired = (proposal: ISppProposal): boolean => {
        const now = DateTime.utc();
        return proposal.settings.stages.some((stage) => {
            const stageEndDate = sppStageUtils.getStageEndDate(proposal, stage);
            return stage.maxAdvance && now > stageEndDate.plus({ seconds: stage.maxAdvance });
        });
    };
}

export const sppProposalUtils = new SppProposalUtils();
