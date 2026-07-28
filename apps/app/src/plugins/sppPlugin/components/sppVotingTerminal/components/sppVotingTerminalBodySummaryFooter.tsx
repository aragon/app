import { ProposalStatus } from '@aragon/gov-ui-kit';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SppStageStatus } from './sppStageStatus';

export interface ISppVotingTerminalBodySummaryFooterProps {
    /**
     * Parent Proposal of the stage
     */
    proposal: ISppProposal;
    /**
     * Stage of proposal
     */
    stage: ISppStage;
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}

export const SppVotingTerminalBodySummaryFooter: React.FC<
    ISppVotingTerminalBodySummaryFooterProps
> = (props) => {
    const { stage, proposal, daoId } = props;

    const { t } = useTranslations();

    // Approve/veto is a per-body property, so a stage may carry an approval
    // requirement, a veto condition, or both (mixed). Evaluate them independently.
    const hasApproval = stage.approvalThreshold > 0;
    const hasVeto = stage.vetoThreshold > 0;

    const isApprovalReached = sppStageUtils.isApprovalReached(proposal, stage);
    const isVetoReached = sppStageUtils.isVetoReached(proposal, stage);
    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const isAccepted = stageStatus === ProposalStatus.ACCEPTED;

    // Show the resolved status instead of the requirements once the outcome is
    // decided: vetoed (a veto can land before approval), approval reached, a
    // pure veto stage accepted, or a bodyless timelock.
    const showStageStatus =
        isVetoReached ||
        (hasApproval ? isApprovalReached : !hasVeto || isAccepted);

    // The stage status alone would hide a still-live veto condition: in a mixed
    // stage vetoing bodies can act until the window closes even after approval
    // lands, so keep the veto requirement on screen alongside the status.
    const isVetoWindowOpen = sppStageUtils.isVetoWindowOpen(proposal, stage);

    // Each requirement carries its own copy key: an approval is a positive
    // requirement to pass ("required to approve"), while a veto is a blocking
    // power ("can veto"), so they must not read as the same kind of condition.
    const requirements: Array<{
        action: 'approve' | 'veto';
        labelKey: 'approveRequirement' | 'vetoRequirement';
        threshold: number;
    }> = [];
    if (hasApproval && !showStageStatus) {
        requirements.push({
            action: 'approve',
            labelKey: 'approveRequirement',
            threshold: stage.approvalThreshold,
        });
    }
    if (hasVeto && (!showStageStatus || isVetoWindowOpen)) {
        requirements.push({
            action: 'veto',
            labelKey: 'vetoRequirement',
            threshold: stage.vetoThreshold,
        });
    }

    return (
        <div className="flex flex-col gap-2">
            {requirements.map(({ action, labelKey, threshold }) => (
                <p
                    className="text-center text-neutral-500 md:text-right"
                    key={action}
                >
                    <span className="text-neutral-800">
                        {t(
                            'app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.thresholdLabel',
                            {
                                count: threshold,
                                entityType: threshold > 1 ? 'bodies' : 'body',
                            },
                        )}
                    </span>{' '}
                    {t(
                        `app.plugins.spp.sppVotingTerminalStageBodySummaryFooter.${labelKey}`,
                    )}
                </p>
            ))}
            {showStageStatus && (
                <SppStageStatus
                    daoId={daoId}
                    proposal={proposal}
                    stage={stage}
                />
            )}
        </div>
    );
};
