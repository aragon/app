import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { type ISppProposal, type ISppStage, type ISppSubProposal } from '../../types';

class SppStageUtils {
    getStageStatus = (proposal: ISppProposal, stage: ISppStage): ProposalStatus => {
        const { stageIndex: currentStage } = proposal;
        const { stageIndex } = stage;

        const isOptimisticStage = this.isVeto(stage);

        const now = DateTime.now();
        const startDate = this.getStageStartDate(proposal, stage);
        const endDate = this.getStageEndDate(proposal, stage);
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);

        const approvalReached = this.isApprovalReached(proposal, stage);
        const isSignalling = this.isSignalingProposal(proposal, stage);
        const isVetoed = this.isVetoReached(proposal, stage);
        const isUnreached = this.isStageUnreached(proposal, stageIndex);

        const startsInFuture = startDate != null && now < startDate;
        const endsInFuture = endDate != null && now < endDate;
        const isPending = startsInFuture || stageIndex > currentStage;
        const isLastStage = this.isLastStage(proposal, stage);
        const isWithinMaxAdvance = maxAdvanceDate != null && now < maxAdvanceDate;

        const isActive = isOptimisticStage ? endsInFuture : endsInFuture && (!approvalReached || isSignalling);

        const isAdvanceable =
            stageIndex === currentStage && approvalReached && isWithinMaxAdvance && !isSignalling && !isLastStage;

        const isExpired =
            !isSignalling && stageIndex === currentStage && maxAdvanceDate != null && now > maxAdvanceDate;

        if (isVetoed) {
            return ProposalStatus.VETOED;
        }

        if (isUnreached) {
            return ProposalStatus.UNREACHED;
        }

        if (isPending) {
            return ProposalStatus.PENDING;
        }

        if (isActive) {
            return ProposalStatus.ACTIVE;
        }

        if (isAdvanceable) {
            return ProposalStatus.ADVANCEABLE;
        }

        if (!approvalReached) {
            return ProposalStatus.REJECTED;
        }

        if (isExpired) {
            return ProposalStatus.EXPIRED;
        }

        return ProposalStatus.ACCEPTED;
    };

    canStageAdvance = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const now = DateTime.now();
        const minAdvanceDate = this.getStageMinAdvance(proposal, stage);
        const maxAdvanceDate = this.getStageMaxAdvance(proposal, stage);
        const approvalReached = this.isApprovalReached(proposal, stage);
        const isSignalingProposal = this.isSignalingProposal(proposal, stage);
        const isActiveStage = stage.stageIndex === proposal.stageIndex;

        return (
            approvalReached &&
            minAdvanceDate != null &&
            maxAdvanceDate != null &&
            now > minAdvanceDate &&
            now < maxAdvanceDate &&
            !isSignalingProposal &&
            isActiveStage
        );
    };

    // Mark proposal as signaling when main-proposal has no actions and this is processing the status of the last stage
    isSignalingProposal = (proposal: ISppProposal, stage: ISppStage): boolean => {
        return !proposal.hasActions && this.isLastStage(proposal, stage);
    };

    isStageUnreached = (proposal: ISppProposal, currentStageIndex: number): boolean => {
        return proposal.settings.stages.slice(0, currentStageIndex).some((stage) => {
            const status = this.getStageStatus(proposal, stage);
            const { VETOED, REJECTED, EXPIRED, UNREACHED } = ProposalStatus;

            return [VETOED, REJECTED, EXPIRED, UNREACHED].includes(status);
        });
    };

    getStageStartDate = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const { startDate, stageIndex: currentStageIndex, lastStageTransition, subProposals } = proposal;
        const { stageIndex } = stage;

        if (stageIndex === 0) {
            return DateTime.fromSeconds(startDate);
        }

        if (currentStageIndex === stageIndex) {
            return DateTime.fromSeconds(lastStageTransition);
        }

        const stageSubProposal = subProposals.find((subProposal) => subProposal.stageIndex === stageIndex);

        return stageSubProposal != null ? DateTime.fromSeconds(stageSubProposal.startDate) : undefined;
    };

    getStageEndDate = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const startDate = this.getStageStartDate(proposal, stage);

        return startDate?.plus({ seconds: stage.voteDuration });
    };

    getStageMaxAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.maxAdvance });
    };

    getStageMinAdvance = (proposal: ISppProposal, stage: ISppStage): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.minAdvance });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const vetoCount = this.getSuccessThreshold(proposal, stage);

        return stage.vetoThreshold > 0 && vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const approvalCount = this.getSuccessThreshold(proposal, stage);

        return approvalCount >= stage.approvalThreshold;
    };

    getSuccessThreshold = (proposal: ISppProposal, stage: ISppStage): number => {
        const { plugins, stageIndex } = stage;

        const successCount = plugins.reduce((count, plugin) => {
            const { address, subdomain } = plugin;
            const getSucceededStatus = pluginRegistryUtils.getSlotFunction<ISppSubProposal, boolean>({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
                pluginId: subdomain ?? 'external',
            });

            const subProposal = this.getBodySubProposal(proposal, address, stageIndex);
            const bodyResult = this.getBodyResult(proposal, address, stageIndex);

            const isSuccessReached = subProposal != null ? getSucceededStatus?.(subProposal) : bodyResult != null;

            return isSuccessReached ? count + 1 : count;
        }, 0);

        return successCount;
    };

    getBodyResult = (proposal: ISppProposal, bodyAddress: string, stageIndex: number) =>
        proposal.results?.find(
            ({ pluginAddress, stage }) =>
                addressUtils.isAddressEqual(pluginAddress, bodyAddress) && stage === stageIndex,
        );

    getBodySubProposal = (proposal: ISppProposal, body: string, stageIndex: number): ISppSubProposal | undefined =>
        proposal.subProposals.find(
            (subProposal) =>
                addressUtils.isAddressEqual(subProposal.pluginAddress, body) && subProposal.stageIndex === stageIndex,
        );

    isVeto = (stage: ISppStage): boolean => stage.vetoThreshold > 0;

    isLastStage = (proposal: ISppProposal, stage: ISppStage): boolean =>
        proposal.settings.stages.length - 1 === stage.stageIndex;
}

export const sppStageUtils = new SppStageUtils();
