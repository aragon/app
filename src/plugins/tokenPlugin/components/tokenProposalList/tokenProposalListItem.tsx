import { useUserVote } from '@/modules/governance/hooks/useUserVote';
import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat, ProposalDataListItem } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { VoteOption, type ITokenProposal } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';

export interface ITokenProposalListItemProps {
    /**
     * Proposal to display the information for.
     */
    proposal: ITokenProposal;
    /**
     * ID of the DAO for this proposal.
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
    const { decimals, symbol } = proposal.settings.token;

    const winningOption = tokenProposalUtils.getWinningOption(proposal);

    if (!winningOption) {
        return undefined;
    }

    const winningOptionAmount = tokenProposalUtils.getVoteByType(votesByOption, winningOption);
    const parsedWinningOptionAmount = formatUnits(winningOptionAmount, decimals);
    const formattedWinningOptionAmount = formatterUtils.formatNumber(parsedWinningOptionAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    })!;

    const yesNoVotes = tokenProposalUtils.getTotalVotes(proposal, true);
    const winningOptionPercentage = yesNoVotes > 0 ? (winningOptionAmount * BigInt(100)) / yesNoVotes : 100;

    return {
        option: voteOptionToLabel[winningOption],
        voteAmount: `${formattedWinningOptionAmount} ${symbol}`,
        votePercentage: Number(winningOptionPercentage),
    };
};

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    const { t } = useTranslations();

    const winningOption = getWinningOption(proposal);
    const proposalResult = winningOption != null ? { ...winningOption, option: t(winningOption.option) } : undefined;

    const vote = useUserVote({ proposal });

    return (
        <ProposalDataListItem.Structure
            className="min-w-0"
            key={proposal.id}
            title={proposal.title}
            summary={proposal.summary}
            date={proposal.executed.blockTimestamp ? proposal.executed.blockTimestamp * 1000 : proposal.endDate * 1000}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            status={tokenProposalUtils.getProposalStatus(proposal)}
            type="majorityVoting"
            voted={vote != null}
            publisher={{
                address: proposal.creator.address,
                link: `members/${proposal.creator.address}`,
                name: proposal.creator.ens ?? undefined,
            }}
            result={proposalResult}
        />
    );
};
