import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, Progress, ProposalStatus } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalVotingSummaryProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal?: ITokenProposal;
    /**
     * Name of the plugin.
     */
    name: string;
    /**
     * Defines if the voting is optimistic or not.
     */
    isOptimistic: boolean;
    /**
     * Additional executed status when plugin is a sub-plugin.
     */
    isExecuted?: boolean;
}

export const TokenProposalVotingSummary: React.FC<ITokenProposalVotingSummaryProps> = (props) => {
    const { proposal, name, isOptimistic, isExecuted } = props;

    const { t } = useTranslations();

    if (!proposal) {
        return <p className="text-neutral-800">{name}</p>;
    }

    const { supportThreshold, historicalTotalSupply } = proposal.settings;
    const { symbol, decimals } = proposal.settings.token;

    const status = tokenProposalUtils.getProposalStatus(proposal);

    const yesVotes = Number(tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.YES));
    const noVotes = Number(tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.NO));
    const abstainVotes = Number(tokenProposalUtils.getOptionVotingPower(proposal, VoteOption.ABSTAIN));

    const tokenTotalSupply = formatUnits(BigInt(historicalTotalSupply!), decimals);
    const totalSupplyNumber = Number(tokenTotalSupply);

    invariant(totalSupplyNumber > 0, 'TokenProposalVotingSummary: tokenTotalSupply must be a positive number');

    const totalVotes = yesVotes + noVotes + abstainVotes;
    const formattedTotalVotes = formatterUtils.formatNumber(totalVotes, { format: NumberFormat.GENERIC_SHORT })!;

    const winningOption = Math.max(yesVotes, noVotes, abstainVotes);
    const winningOptionPercentage = totalVotes > 0 ? (winningOption / totalVotes) * 100 : 0;
    const formattedWinningOption = formatterUtils.formatNumber(winningOption, { format: NumberFormat.GENERIC_SHORT });

    const supportThresholdPercentage = tokenSettingsUtils.ratioToPercentage(supportThreshold);
    const supportReached = winningOptionPercentage >= supportThresholdPercentage;

    const isApprovalReached = tokenProposalUtils.isApprovalReached(proposal);

    if (status !== ProposalStatus.ACTIVE || isExecuted) {
        const approvalText = isApprovalReached ? 'approved' : 'notApproved';
        const vetoText = isApprovalReached ? 'vetoed' : 'notVetoed';
        const statusText = isOptimistic ? vetoText : approvalText;

        const statusClass =
            isApprovalReached && isOptimistic
                ? 'text-critical-800'
                : isApprovalReached
                  ? 'text-success-800'
                  : 'text-neutral-500';

        return (
            <p>
                {name}{' '}
                <span className={statusClass}>{t(`app.plugins.token.tokenProposalVotingSummary.${statusText}`)}</span>
            </p>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="text-neutral-800">
                {name}{' '}
                <span className="text-neutral-500">
                    {isOptimistic
                        ? t('app.plugins.token.tokenProposalVotingSummary.optimisticSupportLabel')
                        : t('app.plugins.token.tokenProposalVotingSummary.supportLabel')}
                </span>
            </p>
            <Progress
                variant={supportReached ? 'primary' : 'neutral'}
                thresholdIndicator={supportThresholdPercentage}
                value={winningOptionPercentage}
            />
            <p className="text-neutral-800">
                {formattedWinningOption}{' '}
                <span className="text-neutral-500">
                    {t('app.plugins.token.tokenProposalVotingSummary.votesDescription', {
                        details: `${formattedTotalVotes} ${symbol}`,
                    })}
                </span>
            </p>
        </div>
    );
};
