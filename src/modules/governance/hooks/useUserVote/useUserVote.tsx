import { useConnection } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import {
    type IProposal,
    type IVote,
    useVoteList,
} from '../../api/governanceService';

export interface IUseUserVoteParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
    /**
     * Network of the proposal.
     */
    network: Network;
}

// Disabling eslint rule because we can to return the vote with the plugin-specific type
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useUserVote = <TVote extends IVote = IVote>(
    params: IUseUserVoteParams,
): TVote | undefined => {
    const { proposal, network } = params;
    const { id, pluginAddress } = proposal;

    const { address } = useConnection();

    const voteListParams = { proposalId: id, pluginAddress, address, network };
    const { data: voteListData } = useVoteList<TVote>(
        { queryParams: voteListParams },
        { enabled: address != null },
    );

    return voteListData?.pages[0].data[0];
};
