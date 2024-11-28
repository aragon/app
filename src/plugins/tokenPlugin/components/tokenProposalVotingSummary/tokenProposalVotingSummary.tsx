import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, invariant, NumberFormat, ProposalStatus, ProposalVotingProgress } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';
import { getOptionVotingPower } from '../tokenProposalVotingBreakdown/tokenProposalVotingBreakdown';

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
        return <p>name</p>;
    }

    const { supportThreshold, historicalTotalSupply } = proposal.settings;
    const { symbol, decimals } = proposal.settings.token;

    const status = tokenProposalUtils.getProposalStatus(proposal);

    const yesVotes = getOptionVotingPower(proposal, VoteOption.YES);
    const noVotes = getOptionVotingPower(proposal, VoteOption.NO);
    const abstainVotes = getOptionVotingPower(proposal, VoteOption.ABSTAIN);

    const optionValues = [
        {
            name: t('app.plugins.token.tokenProposalVotingSummary.option.yes'),
            value: Number(yesVotes),
            variant: 'success',
        },
        {
            name: t('app.plugins.token.tokenProposalVotingSummary.option.abstain'),
            value: Number(abstainVotes),
            variant: 'neutral',
        },
        {
            name: t('app.plugins.token.tokenProposalVotingSummary.option.no'),
            value: Number(noVotes),
            variant: 'critical',
        },
    ] as const;
    const tokenTotalSupply = formatUnits(BigInt(historicalTotalSupply!), decimals);
    const totalSupplyNumber = Number(tokenTotalSupply);

    invariant(totalSupplyNumber > 0, 'ProposalVotingBreakdownToken: tokenTotalSupply must be a positive number');

    const totalVotes = optionValues.reduce((accumulator, option) => accumulator + option.value, 0);
    const formattedTotalVotes = formatterUtils.formatNumber(totalVotes, { format: NumberFormat.GENERIC_SHORT })!;

    const winningOption = Math.max(...optionValues.map((option) => option.value));
    const winningOptionPercentage = totalVotes > 0 ? (winningOption / totalVotes) * 100 : 0;
    const formattedWinningOption = formatterUtils.formatNumber(winningOption, { format: NumberFormat.GENERIC_SHORT });

    const supportThresholdPercentage = tokenSettingsUtils.fromRatioToPercentage(supportThreshold);
    const supportReached = winningOptionPercentage >= supportThresholdPercentage;

    if (status === ProposalStatus.ACCEPTED) {
        return (
            <p>
                {`${name}`} <span className="text-success-800">approved</span>
            </p>
        );
    }

    if (status === ProposalStatus.VETOED) {
        return (
            <p>
                {`${name}`} <span className="text-critical-800">vetoed</span>
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
