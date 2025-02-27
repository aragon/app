import { ProposalStatus, ProposalVotingStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { ISppProposal, ISppStage } from '../../types';
import { sppStageUtils } from '../sppStageUtils';

class SppProposalUtils {
    getProposalStatus = (proposal: ISppProposal): ProposalStatus => {
        const now = DateTime.now();
        const startDate = DateTime.fromSeconds(proposal.startDate);

        const isExecuted = proposal.executed.status;
        const isVetoed = this.hasAnyStageStatus(proposal, ProposalVotingStatus.VETOED);
        const startsInFuture = startDate > now;
        const hasStages = proposal.settings.stages.length > 0;

        const anyAdvanceable =
            hasStages &&
            proposal.settings.stages.some(
                (stage) =>
                    sppStageUtils.canStageAdvance(proposal, stage) && !sppStageUtils.isLastStage(proposal, stage),
            );

        const anyStageExpired =
            hasStages &&
            proposal.settings.stages.some(
                (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.EXPIRED,
            );

        const endsInFuture = this.doesProposalEndInFuture(proposal, now);
        const paramsMet = this.areAllStagesAccepted(proposal);
        const hasActions = proposal.actions.length > 0;
        const executionExpired = this.isExecutionExpired(proposal, now);
        const canEarlyExecute = false;

        if (isExecuted) {
            return ProposalStatus.EXECUTED;
        }

        if (isVetoed) {
            return ProposalStatus.VETOED;
        }

        if (startsInFuture) {
            return ProposalStatus.PENDING;
        }

        if (hasStages) {
            if (anyAdvanceable) {
                return ProposalStatus.ADVANCEABLE;
            }

            if (anyStageExpired) {
                return ProposalStatus.EXPIRED;
            }
        }

        if (endsInFuture) {
            if (!paramsMet) {
                return ProposalStatus.ACTIVE;
            }

            if (!hasActions) {
                return ProposalStatus.ACTIVE;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!canEarlyExecute) {
                return ProposalStatus.ACTIVE;
            }
            return ProposalStatus.EXECUTABLE;
        }

        if (!paramsMet) {
            return ProposalStatus.REJECTED;
        }

        if (!hasActions) {
            return ProposalStatus.ACCEPTED;
        }

        if (executionExpired) {
            return ProposalStatus.EXPIRED;
        }

        return ProposalStatus.EXECUTABLE;
    };

    public hasAnyStageStatus = (proposal: ISppProposal, status: ProposalVotingStatus): boolean =>
        proposal.settings.stages.some((stage) => sppStageUtils.getStageStatus(proposal, stage) === status);

    public getCurrentStage = (proposal: ISppProposal): ISppStage => proposal.settings.stages[proposal.stageIndex];

    public areAllStagesAccepted = (proposal: ISppProposal): boolean =>
        proposal.settings.stages.every(
            (stage) => sppStageUtils.getStageStatus(proposal, stage) === ProposalVotingStatus.ACCEPTED,
        );

    private doesProposalEndInFuture = (proposal: ISppProposal, now: DateTime): boolean => {
        const stages = proposal.settings.stages;

        if (!stages.length) {
            return false;
        }

        if (!this.hasAnyStageStatus(proposal, ProposalVotingStatus.ACTIVE)) {
            return false;
        }

        const lastStage = stages[stages.length - 1];
        const lastStageEnd = sppStageUtils.getStageEndDate(proposal, lastStage);

        if (!lastStageEnd) {
            return true;
        }

        return now < lastStageEnd;
    };

    private isExecutionExpired = (proposal: ISppProposal, now: DateTime): boolean => {
        const stages = proposal.settings.stages;

        if (!stages.length) {
            return false;
        }

        const lastStage = stages[stages.length - 1];
        const maxAdvanceDate = sppStageUtils.getStageMaxAdvance(proposal, lastStage);

        if (!maxAdvanceDate) {
            return false;
        }

        return now > maxAdvanceDate;
    };
}

export const sppProposalUtils = new SppProposalUtils();
