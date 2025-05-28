import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, Progress, ProposalStatus } from '@aragon/gov-ui-kit';
import type { IMultisigProposal } from '../../types';
import { multisigProposalUtils } from '../../utils/multisigProposalUtils';

export interface IMultisigProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the voting summary.
     */
    proposal?: IMultisigProposal;
    /**
     * Name of the plugin.
     */
    name: string;
    /**
     * Defines if the voting is to veto or not.
     */
    isVeto: boolean;
    /**
     * Additional executed status when plugin is a sub-plugin.
     */
    isExecuted?: boolean;
}

export const MultisigProposalVotingSummary: React.FC<IMultisigProposalVotingSummaryProps> = (props) => {
    const { proposal, name, isVeto, isExecuted } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return <p className="text-neutral-800">{name}</p>;
    }

    const { settings, metrics } = proposal;
    const status = multisigProposalUtils.getProposalStatus(proposal);

    const { minApprovals, historicalMembersCount } = settings;
    const { totalVotes: approvalsAmount } = metrics;
    const membersCount = Number(historicalMembersCount);

    invariant(membersCount > 0, 'multisigProposalVotingSummary: membersCount property must be a positive number');

    const currentApprovalsPercentage = (approvalsAmount / membersCount) * 100;
    const minApprovalPercentage = (minApprovals / membersCount) * 100;

    const formattedApprovalsAmount = formatterUtils.formatNumber(approvalsAmount, {
        format: NumberFormat.GENERIC_SHORT,
    });
    const formattedMembersCount = formatterUtils.formatNumber(membersCount, { format: NumberFormat.GENERIC_SHORT })!;

    const isApprovalReached = multisigProposalUtils.isApprovalReached(proposal);

    if (status !== ProposalStatus.ACTIVE || isExecuted) {
        const approvalText = isApprovalReached ? 'approved' : 'notApproved';
        const vetoText = isApprovalReached ? 'vetoed' : 'notVetoed';
        const statusText = isVeto ? vetoText : approvalText;

        const statusClass =
            isApprovalReached && isVeto
                ? 'text-critical-800'
                : isApprovalReached
                  ? 'text-success-800'
                  : 'text-neutral-500';

        return (
            <p>
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
                {name}{' '}
                <span className="text-neutral-500">
                    {isVeto
                        ? t('app.plugins.multisig.multisigProposalVotingSummary.optimisticApprovalLabel')
                        : t('app.plugins.multisig.multisigProposalVotingSummary.approvalLabel')}
                </span>
            </p>
            <Progress
                variant={isApprovalReached ? 'primary' : 'neutral'}
                value={currentApprovalsPercentage}
                thresholdIndicator={minApprovalPercentage}
            />
            <p className="text-neutral-800">
                {formattedApprovalsAmount}{' '}
                <span className="text-neutral-500">
                    {t('app.plugins.multisig.multisigProposalVotingSummary.memberCount', {
                        count: formattedMembersCount,
                    })}
                </span>
            </p>
        </div>
    );
};
