import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, ProposalVotingProgress } from '@aragon/gov-ui-kit';
import type { IMultisigProposal } from '../../types';

export interface IMultisigProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal?: IMultisigProposal;
    /**
     * Name of the body.
     */
    name: string;
}

export const MultisigProposalVotingSummary: React.FC<IMultisigProposalVotingSummaryProps> = (props) => {
    const { proposal, name } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return <p>{name}</p>;
    }

    const minApprovals = proposal.settings.minApprovals;
    const approvalsAmount = proposal.metrics.totalVotes;

    invariant(minApprovals > 0, 'multisigProposalVotingSummary: minApprovals property must be a positive number');

    const currentApprovalsPercentage = (approvalsAmount / minApprovals) * 100;

    const formattedApprovalsAmount = formatterUtils.formatNumber(approvalsAmount, {
        format: NumberFormat.GENERIC_SHORT,
    });
    const formattedMinApprovals = formatterUtils.formatNumber(minApprovals, { format: NumberFormat.GENERIC_SHORT })!;

    if (approvalsAmount >= minApprovals) {
        return (
            <p>
                {`${name}`} <span className="text-success-800">approved</span>
            </p>
        );
    }

    return (
        <ProposalVotingProgress.Item
            name={t('app.plugins.multisig.multisigProposalVotingSummary.name', { name })}
            value={currentApprovalsPercentage}
            description={{
                value: formattedApprovalsAmount,
                text: t('app.plugins.multisig.multisigProposalVotingSummary.description', {
                    count: formattedMinApprovals,
                }),
            }}
            showStatusIcon={true}
            variant={approvalsAmount >= minApprovals ? 'primary' : 'neutral'}
        />
    );
};
