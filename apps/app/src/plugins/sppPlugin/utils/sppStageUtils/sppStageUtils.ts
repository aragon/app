import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { externalPluginId } from '@/plugins/safeMultisigPlugin/constants';
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
} from '../../types';

class SppStageUtils {
    /**
     * Resolves the plugin id a stage body is rendered through. Canonical bodies use their backend
     * interface type; external bodies use the generic fallback.
     */
    getBodyPluginId = (plugin: ISppStagePlugin): PluginId =>
        plugin.interfaceType ?? externalPluginId;

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
        // A veto decides a stage only while the proposal has neither left that stage nor
        // executed. `reportProposalResult` accepts a result for an earlier stage, and that write
        // does not roll progression back - so a late veto is recorded history, not this stage's
        // verdict. Without the guard a stage the proposal advanced past, or a final stage of an
        // executed proposal, renders VETOED and claims an authority the record does not carry.
        const isVetoed =
            this.isVetoReached(proposal, stage) &&
            stageIndex >= currentStage &&
            !executed.status;
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

        // Approval makes the live stage advanceable immediately; the action itself remains
        // disabled until minAdvance through `canStageAdvance`, preserving the timelock countdown.
        const isAdvanceable =
            !isLastStage &&
            approvalReached &&
            !isSignalling &&
            stageIndex === currentStage &&
            isWithinMaxAdvance;

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
            const bodyReportsAfterWindow = stage.plugins.some(
                (plugin) =>
                    pluginRegistryUtils.getSlotFunction<undefined, boolean>({
                        slotId: GovernanceSlotId.GOVERNANCE_BODY_VOTES_AFTER_WINDOW,
                        pluginId: this.getBodyPluginId(plugin),
                    })?.(undefined) === true,
            );
            const isAwaitingLateResult =
                stageIndex === currentStage &&
                !executed.status &&
                isWithinMaxAdvance &&
                bodyReportsAfterWindow;

            return isAwaitingLateResult
                ? ProposalStatus.ACTIVE
                : ProposalStatus.REJECTED;
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

    // Whether a body can still submit its result. Any body of the live stage may vote while its
    // voting window is open, also after approvals land (stage ADVANCEABLE, or last stage ACCEPTED):
    // early advance lets the stage move on, but until it does the remaining bodies can still
    // record their preference. The window check matters because a stage also reads ACTIVE between
    // voting close and `maxAdvance`, where an ordinary body's onchain vote would revert - only
    // bodies wired to the late-report slot act there. An executed proposal takes no more votes, and
    // neither does a body whose sub-proposal already reported its result: reporting is the execution
    // of that sub-proposal, so its remaining members could only cast a vote that reverts. Bodies
    // without a sub-proposal (external addresses, Safes) report directly and keep their action.
    canBodyVote = (
        proposal: ISppProposal,
        stage: ISppStage,
        plugin: ISppStagePlugin,
    ): boolean => {
        const { address } = plugin;
        const { stageIndex } = stage;
        const hasReportedViaSubProposal =
            this.getBodySubProposal(proposal, address, stageIndex) != null &&
            this.getBodyResult(proposal, address, stageIndex) != null;

        if (
            proposal.executed.status ||
            hasReportedViaSubProposal ||
            !this.isVotingWindowOpen(proposal, stage)
        ) {
            return false;
        }

        const { ACTIVE, ADVANCEABLE, ACCEPTED } = ProposalStatus;
        const status = this.getStageStatus(proposal, stage);

        return [ACTIVE, ADVANCEABLE, ACCEPTED].includes(status);
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

    // Whether the stage's own voting window is still open. Separate from `isVetoWindowOpen`, which
    // additionally requires an unmet veto requirement.
    isVotingWindowOpen = (
        proposal: ISppProposal,
        stage: ISppStage,
    ): boolean => {
        const endDate = this.getStageEndDate(proposal, stage);

        return (
            stage.stageIndex === proposal.stageIndex &&
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
            pluginId: this.getBodyPluginId(plugin),
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
