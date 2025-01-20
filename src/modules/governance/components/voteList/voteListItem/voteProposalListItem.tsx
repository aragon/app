import { type IVote } from '@/modules/governance/api/governanceService';
import { VoteOption, type ITokenVote } from '@/plugins/tokenPlugin/types';
import { VoteProposalDataListItem, type VoteIndicator } from '@aragon/gov-ui-kit';
export interface IVoteProposalListItemProps {
    /**
     * Relevant vote data.
     */
    vote: IVote;
    /**
     * voteIndicator
     */
    voteIndicator: VoteIndicator;
    /**
     * ID of the DAO related to the votes.
     */
    daoId: string;
}

export const VoteProposalListItem: React.FC<IVoteProposalListItemProps> = (props) => {
    const { vote, daoId } = props;

    const getProcessedProposal = (vote: IVote) => {
        return vote.parentProposal ?? vote.proposal!;
    };

    const proposal = getProcessedProposal(vote);

    const isTokenVote = (vote: IVote): vote is ITokenVote => {
        return 'voteOption' in vote;
    };

    const voteOptionToIndicator: Record<VoteOption, VoteIndicator> = {
        [VoteOption.ABSTAIN]: 'abstain',
        [VoteOption.NO]: 'no',
        [VoteOption.YES]: 'yes',
    };

    return (
        <VoteProposalDataListItem.Structure
            key={vote.transactionHash}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            voteIndicator={isTokenVote(vote) ? voteOptionToIndicator[vote.voteOption] : 'approve'}
            proposalId={proposal.id}
            proposalTitle={proposal.title}
            date={vote.blockTimestamp * 1000}
        />
    );
};
