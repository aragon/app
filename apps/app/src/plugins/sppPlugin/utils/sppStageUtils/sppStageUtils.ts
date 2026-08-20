import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { safeBodyPluginId } from '@/plugins/safeMultisigPlugin/constants';
import type { Network } from '@/shared/api/daoService';
import {
    type PluginId,
    pluginRegistryUtils,
} from '@/shared/utils/pluginRegistryUtils';
import {
    type ISppProposal,
    type ISppStage,
    type ISppStagePlugin,
    type ISppSubProposal,
    SppProposalType,
    VotingBodyBrandIdentity,
} from '../../types';

class SppStageUtils {
    /**
     * Resolves the plugin id a stage body is rendered through. Installed bodies use their own
     * interface type; external bodies fall back to the generic external id unless they are a Safe
     * on a chain the Safe transaction service covers, which has its own slot implementations.
     * Networks without a transaction service therefore keep rendering through the external
     * fallbacks with no extra branching.
     */
    getBodyPluginId = (
        plugin: ISppStagePlugin,
        network?: Network,
    ): PluginId => {
        if (plugin.interfaceType != null) {
            return plugin.interfaceType;
        }

        const isSupportedSafe =
            plugin.brandId === VotingBodyBrandIdentity.SAFE &&
            network != null &&
            safeShortNameFromNetwork(network) != null;

        return isSupportedSafe ? safeBodyPluginId : externalPluginId;
    };

    getStageStatus = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): ProposalStatus => {
        const { stageIndex: currentStage, executed } = proposal;
        const { stageIndex } = stage;

        // A stage with no approval requirement (pure veto / optimistic) stays
        // active for its whole voting window; any stage that requires approvals
        // (approval-only or mixed) follows the approval path below. Objection
        // stages inherit the first stage's tallies, so their approval is reached
        // from the start — they must stay active until the window closes too.
        const isOptimisticStage =
            stage.approvalThreshold === 0 ||
            this.isObjectionStage(proposal, stage);

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
        const isWithinMaxAdvance =
            maxAdvanceDate != null && now < maxAdvanceDate;

        const isActive = isOptimisticStage
            ? endsInFuture
            : endsInFuture && (!approvalReached || isSignalling);

        const isAdvanceable =
            stageIndex === currentStage &&
            approvalReached &&
            isWithinMaxAdvance &&
            !isSignalling &&
            !isLastStage;

        const isExpired =
            !executed.status &&
            !isSignalling &&
            stageIndex === currentStage &&
            maxAdvanceDate != null &&
            now > maxAdvanceDate;

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

    // Whether a body can still submit its result. Approving bodies vote only
    // while the stage is ACTIVE. A vetoing body can veto for the whole window
    // even after approvals land (stage ADVANCEABLE, or last stage ACCEPTED), as
    // long as the stage is still the live one and its window is open — so a
    // mixed last stage isn't left un-vetoable.
    canBodyVote = (
        proposal: ISppProposal,
        stage: ISppStage,
        plugin: ISppStagePlugin,
    ): boolean => {
        const status = this.getStageStatus(proposal, stage);

        // While the stage is active any of its bodies may still vote.
        if (status === ProposalStatus.ACTIVE) {
            return true;
        }

        // Beyond ACTIVE only a vetoing body may still act: approving bodies are
        // done once the threshold is met.
        const canStillBlock =
            this.isVetoBody(plugin) &&
            (status === ProposalStatus.ADVANCEABLE ||
                status === ProposalStatus.ACCEPTED);

        return canStillBlock && this.isVetoWindowOpen(proposal, stage);
    };

    // Whether the stage's veto condition is still live: it carries an unmet
    // veto requirement and its voting window on the current stage is open, so
    // vetoing bodies can still overturn the outcome (even after approvals land).
    isVetoWindowOpen = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const hasPendingVeto =
            stage.vetoThreshold > 0 && !this.isVetoReached(proposal, stage);

        const isCurrentStage = stage.stageIndex === proposal.stageIndex;
        const endDate = this.getStageEndDate(proposal, stage);

        return (
            hasPendingVeto &&
            isCurrentStage &&
            endDate != null &&
            DateTime.now() < endDate
        );
    };

    // Mark proposal as signaling when main-proposal has no actions and this is processing the status of the last stage
    isSignalingProposal = (proposal: ISppProposal, stage: ISppStage): boolean =>
        !proposal.hasActions && this.isLastStage(proposal, stage);

    isStageUnreached = (
        proposal: ISppProposal,
        currentStageIndex: number,
    ): boolean =>
        proposal.settings.stages.slice(0, currentStageIndex).some((stage) => {
            const status = this.getStageStatus(proposal, stage);
            const { VETOED, REJECTED, EXPIRED, UNREACHED } = ProposalStatus;

            return [VETOED, REJECTED, EXPIRED, UNREACHED].includes(status);
        });

    getStageStartDate = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): DateTime | undefined => {
        const {
            startDate,
            stageIndex: currentStageIndex,
            lastStageTransition,
            subProposals,
        } = proposal;
        const { stageIndex } = stage;

        if (stageIndex === 0) {
            return DateTime.fromSeconds(startDate);
        }

        if (currentStageIndex === stageIndex) {
            return DateTime.fromSeconds(lastStageTransition);
        }

        const stageSubProposal = subProposals.find(
            (subProposal) => subProposal.stageIndex === stageIndex,
        );

        return stageSubProposal != null
            ? DateTime.fromSeconds(stageSubProposal.startDate)
            : undefined;
    };

    getStageEndDate = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): DateTime | undefined => {
        const startDate = this.getStageStartDate(proposal, stage);

        return startDate?.plus({ seconds: stage.voteDuration });
    };

    getStageMaxAdvance = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.maxAdvance });
    };

    getStageMinAdvance = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): DateTime | undefined => {
        const stageStartDate = this.getStageStartDate(proposal, stage);

        return stageStartDate?.plus({ seconds: stage.minAdvance });
    };

    isVetoReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const { vetoCount } = this.getStageResultCounts(proposal, stage);

        return stage.vetoThreshold > 0 && vetoCount >= stage.vetoThreshold;
    };

    isApprovalReached = (proposal: ISppProposal, stage: ISppStage): boolean => {
        const { approvalCount } = this.getStageResultCounts(proposal, stage);

        return approvalCount >= stage.approvalThreshold;
    };

    // Counts the succeeded bodies of a stage split by each body's own result
    // type, so that approving and vetoing bodies are evaluated independently
    // against their respective stage threshold (a stage may mix both).
    getStageResultCounts = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): { approvalCount: number; vetoCount: number } => {
        const { plugins, stageIndex } = stage;

        return plugins.reduce(
            (counts, plugin) => {
                if (!this.isBodySucceeded(proposal, plugin, stageIndex)) {
                    return counts;
                }

                return this.isVetoBody(plugin)
                    ? { ...counts, vetoCount: counts.vetoCount + 1 }
                    : { ...counts, approvalCount: counts.approvalCount + 1 };
            },
            { approvalCount: 0, vetoCount: 0 },
        );
    };

    private isBodySucceeded = (
        proposal: ISppProposal,
        plugin: ISppStagePlugin,
        stageIndex: number,
    ): boolean => {
        const { address } = plugin;
        const getSucceededStatus = pluginRegistryUtils.getSlotFunction<
            ISppSubProposal,
            boolean
        >({
            slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED,
            pluginId: this.getBodyPluginId(plugin, proposal.network),
        });

        const subProposal = this.getBodySubProposal(
            proposal,
            address,
            stageIndex,
        );
        const bodyResult = this.getBodyResult(proposal, address, stageIndex);

        return subProposal != null
            ? (getSucceededStatus?.(subProposal) ?? false)
            : bodyResult != null;
    };

    getBodyResult = (
        proposal: ISppProposal,
        bodyAddress: string,
        stageIndex: number,
    ) =>
        proposal.results?.find(
            ({ pluginAddress, stage }) =>
                addressUtils.isAddressEqual(pluginAddress, bodyAddress) &&
                stage === stageIndex,
        );

    getBodySubProposal = (
        proposal: ISppProposal,
        body: string,
        stageIndex: number,
    ): ISppSubProposal | undefined =>
        proposal.subProposals.find(
            (subProposal) =>
                addressUtils.isAddressEqual(subProposal.pluginAddress, body) &&
                subProposal.stageIndex === stageIndex,
        );

    isVetoBody = (plugin: ISppStagePlugin): boolean =>
        plugin.proposalType === SppProposalType.VETO;

    isObjectionStage = (proposal: ISppProposal, stage: ISppStage): boolean =>
        proposal.subProposals.some(
            (subProposal) =>
                subProposal.stageIndex === stage.stageIndex &&
                subProposal.settings?.isObjection === true,
        ) ||
        stage.plugins.some(
            (plugin) =>
                plugin.interfaceType != null &&
                plugin.settings?.isObjection === true,
        );

    isLastStage = (proposal: ISppProposal, stage: ISppStage): boolean =>
        proposal.settings.stages.length - 1 === stage.stageIndex;
}

export const sppStageUtils = new SppStageUtils();
