import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const now = DateTime.now();
        const startDate = DateTime.fromSeconds(proposal.startDate);

        const stagesCount = proposal.settings.stages.length;
        const lastStage = stagesCount > 0 ? proposal.settings.stages[stagesCount - 1] : undefined;
        const currentStage = sppProposalUtils.getCurrentStage(proposal);

        const minExecutionDate = lastStage ? sppStageUtils.getStageMinAdvance(proposal, lastStage) : undefined;

        const approvalReached = this.areAllStagesAccepted(proposal);
        const isSignalingProposal = proposal.actions.length === 0;

        const isExecutable = lastStage != null && sppStageUtils.canStageAdvance(proposal, lastStage);

        if (proposal.executed.status) {
            return ProposalStatus.EXECUTED;
        }

        if (this.hasAnyStageStatus(proposal, ProposalVotingStatus.VETOED)) {
            return ProposalStatus.VETOED;
        }

        if (this.hasAnyStageStatus(proposal, ProposalVotingStatus.REJECTED)) {
            return ProposalStatus.REJECTED;
        }

        if (this.hasAnyStageStatus(proposal, ProposalVotingStatus.EXPIRED)) {
            return ProposalStatus.EXPIRED;
        }

        if (isExecutable) {
            return ProposalStatus.EXECUTABLE;
        }

        if (startDate > now) {
            return ProposalStatus.PENDING;
        }

        if (minExecutionDate == null || now < minExecutionDate || stagesCount === 1) {
            const canAdvance = sppStageUtils.canStageAdvance(proposal, currentStage);

            return canAdvance ? ProposalStatus.ADVANCEABLE : ProposalStatus.ACTIVE;
        }

        return approvalReached && isSignalingProposal ? ProposalStatus.ACCEPTED : ProposalStatus.EXPIRED;
    };

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalVotingStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.ACCEPTED,
        );
}

export const sppProposalUtils = new SppProposalUtils();
