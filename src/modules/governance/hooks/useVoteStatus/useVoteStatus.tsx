import { useVoteListData } from '@/modules/governance/hooks/useVoteListData';

export interface IVoteStatusParams {
    /**
     * ID of the proposal to check the vote status for.
     */
    proposalId?: string;
    /**
     * Address of the member to check the vote status for.
     */
    address?: string;
}

export const useVoteStatus = (params: IVoteStatusParams) => {
    const { proposalId, address } = params;

    const initialParamsVoteList = { queryParams: { proposalId } };
    const { voteList } = useVoteListData(initialParamsVoteList);

    return { voted: voteList?.some((vote) => vote.member.address === address) };
};
