import { SppNonActiveStageStatus } from '@/plugins/sppPlugin/components/sppStageStatus';
import type { ISppProposal } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, Progress, ProposalStatus } from '@aragon/gov-ui-kit';
import type { IMultisigProposal } from '../../types';
import { multisigProposalUtils } from '../../utils/multisigProposalUtils';

export interface IMultisigProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal?: IMultisigProposal;
    /**
     * Name of the body.
     */
    name: string;
    /**
     * Is optimistic stage
     */
    isOptimistic: boolean;
    /**
     * Parent proposal
     */
    parentProposal: ISppProposal;
}

export const MultisigProposalVotingSummary: React.FC<IMultisigProposalVotingSummaryProps> = (props) => {
    const { proposal, name, isOptimistic, parentProposal } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return <p className="text-neutral-800">{name}</p>;
    }

    const status = multisigProposalUtils.getProposalStatus(proposal);

    const minApprovals = proposal.settings.minApprovals;
    const approvalsAmount = proposal.metrics.totalVotes;

    invariant(minApprovals > 0, 'multisigProposalVotingSummary: minApprovals property must be a positive number');

    const currentApprovalsPercentage = (approvalsAmount / minApprovals) * 100;

    const formattedApprovalsAmount = formatterUtils.formatNumber(approvalsAmount, {
        format: NumberFormat.GENERIC_SHORT,
    });
    const formattedMinApprovals = formatterUtils.formatNumber(minApprovals, { format: NumberFormat.GENERIC_SHORT })!;

    const isApprovalReached = multisigProposalUtils.isApprovalReached(proposal);

    // For non voting bodies in the last stage the status is active so we show the progress
    // Adding a check for proposal executed means we show the correct UI in those cases
    if (status !== ProposalStatus.ACTIVE || parentProposal.executed.status) {
        return (
            <SppNonActiveStageStatus name={name} isOptimistic={isOptimistic} isApprovalReached={isApprovalReached} />
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="text-neutral-800">
                {name}{' '}
                <span className="text-neutral-500">
                    {isOptimistic
                        ? t('app.plugins.multisig.multisigProposalVotingSummary.optimisticApprovalLabel')
                        : t('app.plugins.multisig.multisigProposalVotingSummary.approvalLabel')}
                </span>
            </p>
            <Progress
                variant={approvalsAmount >= minApprovals ? 'primary' : 'neutral'}
                value={currentApprovalsPercentage}
            />
            <p className="text-neutral-800">
                {formattedApprovalsAmount}{' '}
                <span className="text-neutral-500">
                    {t('app.plugins.multisig.multisigProposalVotingSummary.memberCount', {
                        count: formattedMinApprovals,
                    })}
                </span>
            </p>
        </div>
    );
};
