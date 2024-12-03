import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, ProposalStatus, ProposalVotingProgress } from '@aragon/gov-ui-kit';
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
     * Name of the body.
     */
    name: string;
}

export const TokenProposalVotingSummary: React.FC<ITokenProposalVotingSummaryProps> = (props) => {
    const { proposal, name } = props;

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

    const supportThresholdPercentage = tokenSettingsUtils.fromRatioToPercentage(supportThreshold);
    const supportReached = winningOptionPercentage >= supportThresholdPercentage;

    if (status === ProposalStatus.ACCEPTED || status === ProposalStatus.VETOED) {
        const isAccepted = status === ProposalStatus.ACCEPTED;
        const statusText = isAccepted
            ? t('app.plugins.token.tokenProposalVotingSummary.approved')
            : t('app.plugins.token.tokenProposalVotingSummary.vetoed');
        const statusClass = isAccepted ? 'text-success-800' : 'text-critical-800';

        return (
            <p>
                {name} <span className={statusClass}>{statusText}</span>
            </p>
        );
    }

    return (
        <ProposalVotingProgress.Item
            name={t('app.plugins.token.tokenProposalVotingSummary.support.name', { name })}
            value={winningOptionPercentage}
            description={{
                value: formattedWinningOption,
                text: t('app.plugins.token.tokenProposalVotingSummary.support.description', {
                    details: `${formattedTotalVotes} ${symbol}`,
                }),
            }}
            showPercentage={true}
            variant={supportReached ? 'primary' : 'neutral'}
            thresholdIndicator={supportThresholdPercentage}
        />
    );
};
