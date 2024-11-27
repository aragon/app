import { useAccount } from 'wagmi';
import { useVoteList, type IProposal } from '../../api/governanceService';

export interface IUseVotedStatusParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
}

export const useVotedStatus = (params: IUseVotedStatusParams) => {
    const { proposal } = params;
    const { id, pluginAddress } = proposal;

    const { address } = useAccount();

    const voteListParams = {
        proposalId: id,
        pluginAddress,
        address: address as string,
    };
    const { data: voteStatus, isFetching: isFetchingVote } = useVoteList(
        { queryParams: voteListParams },
        { enabled: address != null },
    );

    const didVote = voteStatus != null && voteStatus.pages[0].metadata.totalRecords > 0;

    return {
        isFetchingVote,
        voteStatus,
        didVote,
    };
};
