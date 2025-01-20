import { type IVote } from '@/modules/governance/api/governanceService';
import { VoteProposalDataListItem } from '@aragon/gov-ui-kit';

export interface IVoteProposalListItemProps {
    /**
     * Relevant vote data.
     */
    vote: IVote;
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

    return (
        <VoteProposalDataListItem.Structure
            key={vote.transactionHash}
            href={`/dao/${daoId}/proposals/${proposal.id}`}
            voteIndicator="approve"
            proposalId={proposal.id}
            proposalTitle={proposal.title}
            date={vote.blockTimestamp * 1000}
        />
    );
};
