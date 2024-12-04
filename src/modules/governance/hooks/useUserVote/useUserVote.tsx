import { useAccount } from 'wagmi';
import { useVoteList, type IProposal, type IVote } from '../../api/governanceService';

export interface IUseUserVoteParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
}

// Disabling eslint rule because we can to return the vote with the plugin-specific type
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useUserVote = <TVote extends IVote = IVote>(params: IUseUserVoteParams): TVote | undefined => {
    const { proposal } = params;
    const { id, pluginAddress } = proposal;

    const { address } = useAccount();

    const voteListParams = { proposalId: id, pluginAddress, address: address };
    const { data: voteListData } = useVoteList<TVote>({ queryParams: voteListParams }, { enabled: address != null });

    return voteListData?.pages[0].data[0];
};
