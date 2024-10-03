import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';
import type { IProposal } from '../../api/governanceService';

export interface IVotedStatusParams {
    /**
     * Proposal to check the vote status for.
     */
    proposal: IProposal;
    /**
     * Address of the member to check the vote status for.
     */
    address?: string;
}

export const useVotedStatus = (params: IVotedStatusParams) => {
    const { proposal, address } = params;

    const initialParamsVoteList = { queryParams: { proposalId: proposal.id, pluginAddress: proposal.pluginAddress } };
    const { voteList } = useVoteListData(initialParamsVoteList);

    return { voted: voteList?.some((vote) => vote.member.address === address) };
};
