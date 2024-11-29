import { useAccount } from 'wagmi';
import { useVoteList, type IGetVoteListParams, type IProposal, type IVote } from '../../api/governanceService';

export interface IUseUserVoteParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
}

export const useUserVote = <TVote extends IVote = IVote>(params: IUseUserVoteParams): TVote | undefined => {
    const { proposal } = params;
    const { id, pluginAddress } = proposal;

    const { address } = useAccount();

    const voteListParams: IGetVoteListParams = {
        queryParams: {
            proposalId: id,
            pluginAddress,
            address: address as string,
        },
    };

    const { data: voteListData } = useVoteList<TVote>(voteListParams, { enabled: address != null });

    return voteListData?.pages[0].data[0];
};
