import { useAccount } from 'wagmi';
import { useVoteList, type IProposal } from '../../api/governanceService';

export interface IUseVotedStatusParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
    /**
     * Address to highlight in the vote list. Returns the connected users vote if true.
     */
    highlightAddress?: boolean;
}

export const useVotedStatus = (params: IUseVotedStatusParams) => {
    const { proposal, highlightAddress } = params;
    const { id, pluginAddress } = proposal;

    const { address } = useAccount();

    const voteListParams = {
        proposalId: id,
        pluginAddress,
        address: address as string,
        highlightAddress: highlightAddress ? address : undefined,
    };
    const { data: voteStatus } = useVoteList({ queryParams: voteListParams }, { enabled: address != null });

    const didVote = voteStatus != null && voteStatus.pages[0].metadata.totalRecords > 0;

    return {
        voteStatus,
        didVote,
    };
};
