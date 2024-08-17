import { useTranslations } from '@/shared/components/translationsProvider';
import { formatterUtils, NumberFormat, ProposalDataListItem } from '@aragon/ods';
import { formatUnits } from 'viem';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';

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

const getWinningOption = (proposal: ITokenProposal) => {
    const { votesByOption } = proposal.metrics;
    const { decimals } = proposal.token;

    if (!votesByOption.length) {
        return undefined;
    }

    const abstainVotes = tokenProposalUtils.getVoteByType(votesByOption, VoteOption.ABSTAIN);
    const noVotes = tokenProposalUtils.getVoteByType(votesByOption, VoteOption.NO);
    const yesVotes = tokenProposalUtils.getVoteByType(votesByOption, VoteOption.YES);

    const winningOption = tokenProposalUtils.isSupportReached(proposal)
        ? VoteOption.YES
        : abstainVotes > noVotes
          ? VoteOption.ABSTAIN
          : VoteOption.NO;

    const winningOptionAmount = tokenProposalUtils.getVoteByType(votesByOption, winningOption);
    const parsedWinningOptionAmount = formatUnits(winningOptionAmount, decimals);
    const formattedWinningOptionAmount = formatterUtils.formatNumber(parsedWinningOptionAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    })!;

    const yesNoVotes = yesVotes + noVotes;
    const winningOptionPercentage = yesNoVotes > 0 ? (winningOptionAmount * BigInt(100)) / yesNoVotes : 100;

    return {
        option: `app.plugins.token.tokenProposalListItem.${winningOption}`,
        voteAmount: formattedWinningOptionAmount,
        votePercentage: Number(winningOptionPercentage),
    };
};

export const TokenProposalListItem: React.FC<ITokenProposalListItemProps> = (props) => {
    const { proposal, daoId } = props;

    const { t } = useTranslations();

    const winningOption = getWinningOption(proposal);
    const proposalResult = winningOption != null ? { ...winningOption, option: t(winningOption.option) } : undefined;

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
            voted={false}
            publisher={{ address: proposal.creatorAddress, link: `members/${proposal.creatorAddress}` }}
            result={proposalResult}
        />
    );
};
