import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat, ProposalDataListItem } from '@aragon/ods';
import { formatUnits } from 'viem';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface ITokenProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ITokenProposal;
    /**
     * ID of the DAO for this proposa.
     */
    daoId: string;
}

const voteOptionToLabel: Record<VoteOption, string> = {
    [VoteOption.ABSTAIN]: 'app.plugins.token.tokenProposalListItem.abstain',
    [VoteOption.YES]: 'app.plugins.token.tokenProposalListItem.yes',
    [VoteOption.NO]: 'app.plugins.token.tokenProposalListItem.no',
};

const getWinningOption = (proposal: ITokenProposal) => {
    const { votesByOption } = proposal.metrics;

    if (!votesByOption.length) {
        return { type: VoteOption.YES, totalVotingPower: '0' };
    }

    return votesByOption.reduce(
        (highestVotes, current) =>
            BigInt(tokenSettingsUtils.fromScientificNotation(current.totalVotingPower)) >
            BigInt(tokenSettingsUtils.fromScientificNotation(highestVotes.totalVotingPower))
                ? current
                : highestVotes,
        votesByOption[0],
    );
};

/**
 * Calculates the percentage of votes for a given option based on its voting power.
 * The calculation is: (option voting power / total voting power of Yes and No) * 100.
 */
const getVotePercentage = (value: number, totalYesNo: number): number => {
    // Handle edge cases where no votes have been cast.
    if (totalYesNo === 0) {
        return value > 0 ? 100 : 0; // Return 100% if there is any voting power, otherwise 0%.
    }

    return Number(((value * 100) / totalYesNo).toFixed(2));
};

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    const { t } = useTranslations();

    const winningOption = getWinningOption(proposal);

    // Calculate the total voting power for Yes and No options (excluding Abstain).
    const totalYesNo = proposal.metrics.votesByOption
        .filter((option) => option.type === VoteOption.YES || option.type === VoteOption.NO)
        .reduce((acc, option) => {
            return acc + Number(tokenSettingsUtils.fromScientificNotation(option.totalVotingPower));
        }, 0);

    const winningVotePower = Number(tokenSettingsUtils.fromScientificNotation(winningOption.totalVotingPower));

    // Calculate the percentage of the total voting power that the winning option holds.
    const votePercentage = getVotePercentage(winningVotePower, totalYesNo);

    const parsedWinningOption = formatUnits(
        BigInt(tokenSettingsUtils.fromScientificNotation(winningOption?.totalVotingPower)),
        proposal.token.decimals,
    );

    const formattedWinningOption = formatterUtils.formatNumber(parsedWinningOption, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={tokenProposalUtils.getProposalStatus(proposal)}
            type="majorityVoting"
            // TODO: provide the correct voted status (APP-3394)
            voted={true}
            publisher={{
                address: proposal.creatorAddress,
                link: `members/${proposal.creatorAddress}`,
            }}
            result={{
                option: t(voteOptionToLabel[winningOption.type]),
                voteAmount: `${formattedWinningOption} ${proposal.token.symbol}`,
                votePercentage,
            }}
        />
    );
};
