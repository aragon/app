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

        const endDate = lastStage ? sppStageUtils.getStageEndDate(proposal, lastStage) : undefined;
        const endExecutionDate = lastStage ? sppStageUtils.getStageMaxAdvance(proposal, lastStage) : undefined;

        const currentStage = sppStageUtils.getCurrentStage(proposal);

        const approvalReached = this.areAllStagesAccepted(proposal);
        const isSignalingProposal = proposal.actions.length === 0;

        const isExecutable =
            approvalReached && endExecutionDate != null && now <= endExecutionDate && !isSignalingProposal;

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

        if (endDate == null || now < endDate) {
            const canAdvance = sppStageUtils.canStageAdvance(proposal, currentStage);

            return canAdvance ? ProposalStatus.ADVANCEABLE : ProposalStatus.ACTIVE;
        }

        return approvalReached && isSignalingProposal ? ProposalStatus.ACCEPTED : ProposalStatus.EXPIRED;
    };

    hasAnyStageStatus = (proposal: ISppProposal, status: ProposalVotingStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    getRelevantProposalDate = (proposal: ISppProposal): number => {
        const currentStage = sppStageUtils.getCurrentStage(proposal);
        const executedTimestamp = proposal.executed.blockTimestamp;

        if (executedTimestamp != null) {
            return executedTimestamp * 1000;
        }

        const stageMinAdvance = sppStageUtils.getStageMinAdvance(proposal, currentStage);
        const voteDuration = currentStage.voteDuration;

        return (stageMinAdvance?.toSeconds() ?? 0 + voteDuration) * 1000;
    };

    areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.ACCEPTED,
        );
}

export const sppProposalUtils = new SppProposalUtils();
