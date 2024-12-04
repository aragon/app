import { useTranslations } from '@/shared/components/translationsProvider';
import {
    formatterUtils,
    invariant,
    NumberFormat,
    Progress,
    ProposalStatus,
    ProposalVotingStatus,
} from '@aragon/gov-ui-kit';
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
}

export const MultisigProposalVotingSummary: React.FC<IMultisigProposalVotingSummaryProps> = (props) => {
    const { proposal, name, isOptimistic } = props;

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

    if (status !== ProposalStatus.ACTIVE) {
        const approvalText = isApprovalReached ? 'approved' : 'didNotApprove';
        const vetoText = isApprovalReached ? 'vetoed' : 'didNotVeto';
        const statusText = isOptimistic ? vetoText : approvalText;

        const statusClass =
            isOptimistic && isApprovalReached
                ? 'text-critical-800'
                : isApprovalReached
                  ? 'text-success-800'
                  : 'text-neutral-500';

        return (
            <p className="text-neutral-800">
                {name}{' '}
                <span className={statusClass}>
                    {t(`app.plugins.multisig.multisigProposalVotingSummary.${statusText}`)}
                </span>
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="text-neutral-800">
                {name} <span className="text-neutral-500">{isOptimistic ? `veto support` : 'support'}</span>
            </p>
            <Progress
                variant={approvalsAmount >= minApprovals ? 'primary' : 'neutral'}
                value={currentApprovalsPercentage}
            />
            <p className="text-neutral-800">
                {formattedApprovalsAmount}{' '}
                <span className="text-neutral-500">
                    {t('app.plugins.multisig.multisigProposalVotingSummary.description', {
                        count: formattedMinApprovals,
                    })}
                </span>
            </p>
        </div>
    );
};
